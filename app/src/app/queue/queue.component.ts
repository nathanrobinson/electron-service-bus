import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SBQueue } from '@azure/arm-servicebus/esm/models';
import { combineLatest, concat, from, Observable, of, Subject } from 'rxjs';
import { catchError, concatMap, debounceTime, filter, map, shareReplay } from 'rxjs/operators';
import { IProperties } from '../_models/properties';
import { ServiceBusMessage } from '../_models/service-bus-message';
import { ServiceBusClientService } from '../_services/service-bus-client.service';

@Component({
  selector: 'esb-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit {
  private _action$ = new EventEmitter<{action: 'peek'|'receive', count: number}>();
  queue$: Observable<IProperties<SBQueue>>;
  queueName$: Observable<string>;
  properties$: Observable<{key: string, value: any}[]>;
  countDetails$: Observable<{key: string, value: any}[]>;
  messages$: Observable<ServiceBusMessage[]>;
  hasQueue$: Observable<boolean>;
  noQueue$: Observable<boolean>;

  constructor(serviceBusClient: ServiceBusClientService, route: ActivatedRoute, snack: MatSnackBar) {
    this.queue$ = route.paramMap.pipe(
      map(_ => history?.state?.data?.queue),
      filter(queue => !!queue),
      shareReplay(1)
    );

    this.messages$ = combineLatest([this.queue$, this._action$])
      .pipe(
        debounceTime(250),
        filter(([q, a]) => !!q?.id && !!a),
        concatMap(([q, a]) => serviceBusClient.peekQueue(q.id || '', a)),
        catchError(e => {
          console.error(e);
          snack.open('Error Reading Queue Messages');
          return [];
        })
      );

    this.properties$ = this.queue$.pipe(
      filter(q => !!q.properties),
      map(q => this.getProperties(q.properties, 'countDetails')));

    this.countDetails$ = this.queue$.pipe(
      filter(q => !!q.properties?.countDetails),
      map(q => this.getProperties(q.properties?.countDetails)));

    this.hasQueue$ = this.queue$.pipe(map(q => !!q));
    this.noQueue$ = concat([of(false), this.hasQueue$]).pipe(map(q => !q));
    this.queueName$ = this.queue$.pipe(map(q => q.name || ''));
   }

  ngOnInit(): void { }

  peek(): void {
    this._action$.next({action: 'peek', count: 1});
  }

  receive(): void {
    this._action$.next({action: 'receive', count: 1});
  }

  private getProperties(obj: any, ignore?: string): {key: string, value: any}[] {
    return Object.keys(obj)
      .filter(k => !ignore || k !== ignore)
      .map(key => ({key, value: obj[key]}));
  }
}
