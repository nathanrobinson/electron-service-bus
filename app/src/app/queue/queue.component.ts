import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SBQueue } from '@azure/arm-servicebus/esm/models';
import { combineLatest, concat, Observable, of } from 'rxjs';
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
  private _action$ = new EventEmitter<{action: 'peek'|'receive', type: 'queue'|'dead-letter', count: number}>();
  private _target$ = new EventEmitter<'queue'|'dead-letter'>();
  queue$: Observable<IProperties<SBQueue>>;
  queueName$: Observable<string>;
  properties$: Observable<{key: string, value: any}[]>;
  countDetails$: Observable<{key: string, value: any}[]>;
  messages$: Observable<ServiceBusMessage[]>;
  hasQueue$: Observable<boolean>;
  noQueue$: Observable<boolean>;
  maxMessages$: Observable<number>;
  noMessages$: Observable<boolean>;

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
    this.noQueue$ = concat(of(true), this.hasQueue$.pipe(map(q => !q)));
    this.queueName$ = this.queue$.pipe(map(q => q.name || ''));
    this.maxMessages$ = combineLatest([this.queue$, this._target$]).pipe(
      debounceTime(250),
      filter(([q, t]) => !!q?.id && !!t),
      map(([q, t]) => Math.min(
        (t === 'queue' ?
          q.properties?.countDetails?.activeMessageCount :
          q.properties?.countDetails?.deadLetterMessageCount
        ) || 0,
        30)));
    this.noMessages$ =  concat(of(true), this.maxMessages$.pipe(map(m => m <= 0)));
   }

  ngOnInit(): void { }

  receive(action: 'peek'|'receive', type: 'queue'|'dead-letter', count: string): void {
    this._action$.emit({action, type, count: Number(count)});
  }

  setTarget(target: 'queue'|'dead-letter') {
    this._target$.emit(target);
  }

  private getProperties(obj: any, ignore?: string): {key: string, value: any}[] {
    return Object.keys(obj)
      .filter(k => !ignore || k !== ignore)
      .map(key => ({key, value: obj[key]}));
  }
}
