import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subscription } from '@azure/arm-subscriptions/esm/models';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, expand, map, reduce, tap, timeout } from 'rxjs/operators';
import { INextLink } from '../_models/next-link';

@Injectable({
  providedIn: 'root'
})
export class TenantSubscriptionService {
  constructor (private _httpClient: HttpClient) {}

  private _baseUrl = 'https://management.azure.com/subscriptions';
  private _version = '2020-01-01';

  private _subscriptions: Subscription[]|undefined = undefined;

  getSubscriptions(): Observable<Subscription[]> {
    if (!this._subscriptions) {
      return this._httpClient.get<INextLink<Subscription>>(this._baseUrl, {params: {'api-version': this._version}})
        .pipe(
          timeout(10000),
          expand(s => !!s?.nextLink ? this._httpClient.get<INextLink<Subscription>>(s.nextLink).pipe(
            timeout(10000),
            catchError(error => {console.error(error); return EMPTY;})) : EMPTY),
          map(s => s?.value),
          reduce((acc, value) => {
            if (!!value) {
              acc.push(...value);
            }
            return acc;
          }, new Array<Subscription>()),
          catchError(error => {console.error(error); return [];}),
          tap(s => this._subscriptions = s));
    }
    return of(this._subscriptions);
  }
}
