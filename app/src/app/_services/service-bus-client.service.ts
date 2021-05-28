import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EMPTY, merge, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { MessagePostResponse } from "../_models/message-post-response";
import { ServiceBusMessage } from "../_models/service-bus-message";

type QueueId = {namespace: string, queueName: string};
type TopicId = {namespace: string, topicName: string, subscription: string};
type DeadLetterType = 'dead-letter';
type QueueAction = 'peek' | 'receive';
type QueueType = 'queue' | DeadLetterType;
type SubscriptionType = 'sub' | DeadLetterType;
type ActionCountType = { action: QueueAction, count: number };
type QueueTypeAction = ActionCountType & { type: QueueType };
type SubscriptionTypeAction = ActionCountType & { type: SubscriptionType };

@Injectable({providedIn: 'root'})
export class ServiceBusClientService {
  constructor(private _httpClient: HttpClient) {}

  peekSubscription(subscriptionId: string, action: SubscriptionTypeAction): Observable<ServiceBusMessage[]> {
    var paths = this.parseId(subscriptionId);
    if (!this.isTopicId(paths)) {
      return of([]);
    }

    if (action.count <= 0) {
      return of([]);
    }

    const url = `https://${paths.namespace}.servicebus.windows.net/${paths.topicName}/subscriptions/${paths.subscription}${action.type === 'sub' ? '' : '/$deadletterqueue'}`;

    return this.doPeek(url, action);
  }

  peekQueue(queueId: string, action: QueueTypeAction): Observable<ServiceBusMessage[]> {
    var paths = this.parseId(queueId);
    if (!this.isQueueId(paths)) {
      return of([]);
    }

    if (action.count <= 0) {
      return of([]);
    }

    const url = `https://${paths.namespace}.servicebus.windows.net/${paths.queueName}${action.type === 'queue' ? '' : '/$deadletterqueue'}`;

    return this.doPeek(url, action);
  }

  sendMessage(path: string, message: string): Observable<MessagePostResponse> {
    const parsed = this.parseId(path);
    const topicOrQueue = (parsed as TopicId)?.topicName || (parsed as QueueId)?.queueName;
    if (!parsed || !topicOrQueue) {
      return of(new MessagePostResponse(410));
    }

    const url = `https://${parsed.namespace}.servicebus.windows.net/${topicOrQueue}/messages`;
    return this._httpClient.post(url, message, {observe: 'response'}).pipe(map(r => new MessagePostResponse(r?.status || 0)));
  }

  private isQueueId(test: TopicId | QueueId | undefined): test is QueueId {
    return !!(test as QueueId)?.queueName
  }

  private isTopicId(test: TopicId | QueueId | undefined): test is TopicId {
    return !!(test as TopicId)?.topicName
  }

  private parseId(id: string): TopicId | QueueId | undefined {
    if (!id) {
      return undefined;
    }
    var paths = id.split('/');
    const namespace = paths[8];
    if (!namespace) {
      return undefined;
    }
    const topicName = paths[10];
    if (!topicName) {
      return undefined;
    }
    const subscription = paths[12];
    if (!subscription) {
      return {namespace, queueName: topicName};
    }
    return {namespace, topicName, subscription}
  }

  private doPeek(url: string, action: ActionCountType) {
    var tasks = Array.from(
      {length: action.count},
      _ => this.peekInternal(url, action.action)
    );

    const messages = new Array<ServiceBusMessage>();

    return merge(...tasks)
      .pipe(
        map(message => {
          messages.push(message);
          return messages;
        }));
  }

  private peekInternal(uri: string, action: QueueAction): Observable<ServiceBusMessage> {
    return this._httpClient.post(`${uri}/messages/head?timeout=60`, {}, {observe: 'response', responseType: 'text'})
      .pipe(switchMap(x => this.releaseAndReturnMessage(x, action)));
  }

  private releaseAndReturnMessage(response: HttpResponse<string>, action: QueueAction): Observable<ServiceBusMessage> {
    if (response?.status !== 201) {
      return EMPTY;
    }

    let release = of('');
    const message: ServiceBusMessage = {
      body: response.body || '',
      lockUri: response.headers.get('Location') || '',
      brokerProperties: JSON.parse(response.headers.get('BrokerProperties') || ''),
      applicationProperties: {}
    };

    if (!!message.lockUri) {
      if (action === 'peek') {
        release = this._httpClient.put(message.lockUri, {}, {responseType: 'text'});
      } else {
        release = this._httpClient.delete(message.lockUri, {responseType: 'text'});
      }
    }

    const ignoreHeaders = ['brokerproperties', 'content-type', 'server', 'strict-transport-security', 'transfer-encoding', 'location'];
    for (let header of response.headers.keys().filter(k => !ignoreHeaders.includes(k))) {
      message.applicationProperties[header] = response.headers.get(header) || '';
    }

    return release.pipe(map(_ => message));
  }
}