import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EMPTY, merge, Observable, of } from "rxjs";
import { expand, map, mergeAll, reduce, switchMap } from "rxjs/operators";
import { ServiceBusMessage } from "../_models/service-bus-message";

@Injectable({providedIn: 'root'})
export class ServiceBusClientService {
  constructor(private _httpClient: HttpClient) {}

  peekSubscription(subscriptionId: string, action: { action: "peek" | "receive"; type: "sub" | "dead-letter"; count: number; }): Observable<ServiceBusMessage[]> {
    var paths = subscriptionId.split('/');
    const namespaceName = paths[8];
    if (!namespaceName) {
      return of([]);
    }
    const topicName = paths[10];
    if (!topicName) {
      return of([]);
    }
    const subscriptionName = paths[12];
    if (!subscriptionName) {
      return of([]);
    }

    if (action.count <= 0) {
      return of([]);
    }

    const url = `https://${namespaceName}.servicebus.windows.net/${topicName}/subscriptions/${subscriptionName}${action.type === 'sub' ? '' : '/$deadletterqueue'}`;

    var tasks = Array.from(
      {length: action.count},
      _ => this.peekInternal(url, action.action)
    );

    return merge(...tasks)
      .pipe(
        reduce((buffer, message) => {
          buffer.push(message);
          return buffer;
        }, new Array<ServiceBusMessage>()));
  }

  peekQueue(queueId: string, action: { action: 'peek'|'receive'; type: 'queue'|'dead-letter'; count: number; }): Observable<ServiceBusMessage[]> {
    var paths = queueId.split('/');
    const namespaceName = paths[8];
    if (!namespaceName) {
      return of([]);
    }
    const queueName = paths[10];
    if (!queueName) {
      return of([]);
    }

    if (action.count <= 0) {
      return of([]);
    }

    const url = `https://${namespaceName}.servicebus.windows.net/${queueName}${action.type === 'queue' ? '' : '/$deadletterqueue'}`;

    var tasks = Array.from(
      {length: action.count},
      _ => this.peekInternal(url, action.action)
    );

    return merge(...tasks)
      .pipe(
        reduce((buffer, message) => {
          buffer.push(message);
          return buffer;
        }, new Array<ServiceBusMessage>()));
  }

  private peekInternal(uri: string, action: 'peek'|'receive'): Observable<ServiceBusMessage> {
    return this._httpClient.post(`${uri}/messages/head?timeout=60`, {}, {observe: 'response', responseType: 'text'})
      .pipe(switchMap(x => this.releaseAndReturnMessage(x, action)));
  }

  private releaseAndReturnMessage(response: HttpResponse<string>, action: 'peek'|'receive'): Observable<ServiceBusMessage> {
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