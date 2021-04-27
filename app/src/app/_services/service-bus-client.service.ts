import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EMPTY, merge, Observable, of } from "rxjs";
import { expand, map, mergeAll, reduce, switchMap } from "rxjs/operators";
import { ServiceBusMessage } from "../_models/service-bus-message";

@Injectable({providedIn: 'root'})
export class ServiceBusClientService {
  constructor(private _httpClient: HttpClient) {}

  peekQueue(queueId: string, action: { action: 'peek'|'receive', count: number }): Observable<ServiceBusMessage[]> {
    const id = queueId || '';
    var paths = id.split('/');
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

    var tasks = Array.from(
      {length: action.count},
      _ => this.peekInternal(`https://${namespaceName}.servicebus.windows.net/${queueName}`, action.action)
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
    var message: ServiceBusMessage = {
      body: response.body || '',
      lockUri: response.headers.get('Location') || '',
      brokerProperties: JSON.parse(response.headers.get('BrokerProperties') || ''),
      priority: response.headers.get('Priority') || '',
      customer: response.headers.get('Customer') || ''
    };

    if (!!message.lockUri) {
      if (action === 'peek') {
        release = this._httpClient.put(message.lockUri, {}, {responseType: 'text'});
      } else {
        release = this._httpClient.delete(message.lockUri, {responseType: 'text'});
      }
    }

    return release.pipe(map(_ => message));
  }
}