import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SBNamespace, SBQueue, SBSubscription, SBTopic } from '@azure/arm-servicebus/esm/models';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, expand, map, timeout } from 'rxjs/operators';
import { INextLink } from '../_models/next-link';
import { IProperties } from '../_models/properties';

@Injectable({
  providedIn: 'root'
})
export class ServiceBusManagementService {
  constructor (private _httpClient: HttpClient) {}

  private _baseUrl = 'https://management.azure.com';
  private _serviceBusProviderUrl = '/providers/Microsoft.ServiceBus';
  private _apiVersion = '2017-04-01';

  getNamespaces(subscriptionId: string | undefined): Observable<Array<SBNamespace>> {
    // https://management.azure.com/subscriptions/{guid}/providers/Microsoft.ServiceBus/namespaces?api-version=2017-04-01
    if (!subscriptionId) {
      return of([]);
    }

    const namespaces = new Array<SBNamespace>();

    const uri = `${this._baseUrl}${subscriptionId}${this._serviceBusProviderUrl}/namespaces`;
    return this._httpClient.get<INextLink<SBNamespace>>(uri, {params: {'api-version': this._apiVersion}})
      .pipe(
        timeout(10000),
        expand(s => !!s?.nextLink ? this._httpClient.get<INextLink<SBNamespace>>(s.nextLink).pipe(
          timeout(10000),
          catchError(error => {console.error(error); return EMPTY;})) : EMPTY),
        map(s => {
          if (!!s?.value) {
            namespaces.push(...s.value);
          }
          return namespaces;
        }),
        catchError(error => {console.error(error); return of(namespaces);}));
  }

  getTopics(namespaceId: string | undefined): Observable<Array<IProperties<SBTopic>>> {
    // https://management.azure.com/subscriptions/{guid}/resourceGroups/{name}/providers/Microsoft.ServiceBus/namespaces/{name}/topics?api-version=2017-04-01

    if (!namespaceId) {
      return of([]);
    }

    const topics = new Array<IProperties<SBTopic>>();

    const uri = `${this._baseUrl}${namespaceId}${namespaceId.endsWith('/topics') ? '' : '/topics'}`;
    return this._httpClient.get<INextLink<IProperties<SBTopic>>>(uri, {params: {'api-version': this._apiVersion}})
      .pipe(
        timeout(10000),
        expand(s => !!s?.nextLink ? this._httpClient.get<INextLink<IProperties<SBTopic>>>(s.nextLink).pipe(
          timeout(10000),
          catchError(error => {console.error(error); return EMPTY;})) : EMPTY),
        map(s => {
          if (!!s?.value) {
            topics.push(...s.value);
          }
          return topics;
        }),
        catchError(error => {console.error(error); return of(topics);}));
  }

  getQueues(namespaceId: string | undefined): Observable<Array<IProperties<SBQueue>>> {
    // https://management.azure.com/subscriptions/{guid}/resourceGroups/{name}/providers/Microsoft.ServiceBus/namespaces/{name}/queues?api-version=2017-04-01
    if (!namespaceId) {
      return of([]);
    }

    const queues = new Array<IProperties<SBQueue>>();

    const uri = `${this._baseUrl}${namespaceId}${namespaceId.endsWith('/queues') ? '' : '/queues'}`;
    return this._httpClient.get<INextLink<IProperties<SBQueue>>>(uri, {params: {'api-version': this._apiVersion}})
      .pipe(
        timeout(10000),
        expand(s => !!s?.nextLink ? this._httpClient.get<INextLink<IProperties<SBQueue>>>(s.nextLink).pipe(
          timeout(10000),
          catchError(error => {console.error(error); return EMPTY;})) : EMPTY),
        map(s => {
          if (!!s?.value) {
            queues.push(...s.value);
          }
          return queues;
        }),
        catchError(error => {console.error(error); return of(queues);}));
  }

  getTopicSubscriptions(topicId: string | undefined): Observable<Array<IProperties<SBSubscription>>> {
    // https://management.azure.com/subscriptions/{guid}/resourceGroups/{name}/providers/Microsoft.ServiceBus/namespaces/{name}/topics/{name}/subscriptions?api-version=2017-04-01
    if (!topicId) {
      return of([]);
    }

    const subscriptions = new Array<IProperties<SBSubscription>>();

    const uri = `${this._baseUrl}${topicId}/subscriptions`;
    return this._httpClient.get<INextLink<IProperties<SBSubscription>>>(uri, {params: {'api-version': this._apiVersion}})
      .pipe(
        timeout(10000),
        expand(s => !!s?.nextLink ? this._httpClient.get<INextLink<IProperties<SBSubscription>>>(s.nextLink).pipe(
          timeout(10000),
          catchError(error => {console.error(error); return EMPTY;})) : EMPTY),
        map(s => {
          if (!!s?.value) {
            subscriptions.push(...s.value);
          }
          return subscriptions;
        }),
        catchError(error => {console.error(error); return of(subscriptions);}));
  }
}
