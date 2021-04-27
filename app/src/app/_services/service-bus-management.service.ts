import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SBNamespace, SBQueue, SBSubscription, SBTopic } from '@azure/arm-servicebus/esm/models';
import { EMPTY, Observable, of } from 'rxjs';
import { expand, map, reduce, tap, timeout } from 'rxjs/operators';
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

  private _namespaces: {[key: string]: Array<SBNamespace>} = {};

  getNamespaces(subscriptionId: string | undefined): Observable<Array<SBNamespace>> {
    // https://management.azure.com/subscriptions/{guid}/providers/Microsoft.ServiceBus/namespaces?api-version=2017-04-01
    if (!subscriptionId) {
      return of([]);
    }

    if (!this._namespaces[subscriptionId]) {
      const uri = `${this._baseUrl}${subscriptionId}${this._serviceBusProviderUrl}/namespaces`;
      return this._httpClient.get<INextLink<SBNamespace>>(uri, {params: {'api-version': this._apiVersion}})
        .pipe(
          timeout(10000),
          expand(s => !!s.nextLink ? this._httpClient.get<INextLink<SBNamespace>>(s.nextLink) : EMPTY),
          map(s => s.value),
          reduce((acc, value) => {
            acc.push(...value);
            return acc;
          }, new Array<SBNamespace>()),
          tap(s => this._namespaces[subscriptionId] = s));
    }
    return of(this._namespaces[subscriptionId] || []);
  }

  getTopics(namespaceId: string | undefined): Observable<Array<IProperties<SBTopic>>> {
    // https://management.azure.com/subscriptions/{guid}/resourceGroups/{name}/providers/Microsoft.ServiceBus/namespaces/{name}/topics?api-version=2017-04-01

    if (!namespaceId) {
      return of([]);
    }

    const uri = `${this._baseUrl}${namespaceId}${namespaceId.endsWith('/topics') ? '' : '/topics'}`;
    return this._httpClient.get<INextLink<IProperties<SBTopic>>>(uri, {params: {'api-version': this._apiVersion}})
      .pipe(
        timeout(10000),
        expand(s => !!s.nextLink ? this._httpClient.get<INextLink<IProperties<SBTopic>>>(s.nextLink) : EMPTY),
        map(s => s.value),
        reduce((acc, value) => {
          acc.push(...value);
          return acc;
        }, new Array<IProperties<SBTopic>>()));
  }

  getQueues(namespaceId: string | undefined): Observable<Array<IProperties<SBQueue>>> {
    // https://management.azure.com/subscriptions/{guid}/resourceGroups/{name}/providers/Microsoft.ServiceBus/namespaces/{name}/queues?api-version=2017-04-01
    if (!namespaceId) {
      return of([]);
    }

    const uri = `${this._baseUrl}${namespaceId}${namespaceId.endsWith('/queues') ? '' : '/queues'}`;
    return this._httpClient.get<INextLink<IProperties<SBQueue>>>(uri, {params: {'api-version': this._apiVersion}})
      .pipe(
        timeout(10000),
        expand(s => !!s.nextLink ? this._httpClient.get<INextLink<IProperties<SBQueue>>>(s.nextLink) : EMPTY),
        map(s => s.value),
        reduce((acc, value) => {
          acc.push(...value);
          return acc;
        }, new Array<IProperties<SBQueue>>()));
  }

  getTopicSubscriptions(topicId: string | undefined): Observable<Array<IProperties<SBSubscription>>> {
    // https://management.azure.com/subscriptions/{guid}/resourceGroups/{name}/providers/Microsoft.ServiceBus/namespaces/{name}/topics/{name}/subscriptions?api-version=2017-04-01
    if (!topicId) {
      return of([]);
    }

    const uri = `${this._baseUrl}${topicId}/subscriptions`;
    return this._httpClient.get<INextLink<IProperties<SBSubscription>>>(uri, {params: {'api-version': this._apiVersion}})
      .pipe(
        timeout(10000),
        expand(s => !!s.nextLink ? this._httpClient.get<INextLink<IProperties<SBSubscription>>>(s.nextLink) : EMPTY),
        map(s => s.value),
        reduce((acc, value) => {
          acc.push(...value);
          return acc;
        }, new Array<IProperties<SBSubscription>>()));
  }
}
