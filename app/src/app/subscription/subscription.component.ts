import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { SBSubscription } from '@azure/arm-servicebus/esm/models';
import { Observable, combineLatest, concat, of } from 'rxjs';
import { map, filter, shareReplay, debounceTime, concatMap, catchError } from 'rxjs/operators';
import { IProperties } from '../_models/properties';
import { ServiceBusMessage } from '../_models/service-bus-message';
import { ServiceBusClientService } from '../_services/service-bus-client.service';

@Component({
  selector: 'esb-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  private _action$ = new EventEmitter<{action: 'peek'|'receive', type: 'sub'|'dead-letter', count: number}>();
  private _target$ = new EventEmitter<'sub'|'dead-letter'>();
  subscription$: Observable<IProperties<SBSubscription>>;
  subName$: Observable<string>;
  properties$: Observable<{key: string, value: any}[]>;
  countDetails$: Observable<{key: string, value: any}[]>;
  messages$: Observable<ServiceBusMessage[]>;
  hasSub$: Observable<boolean>;
  noSub$: Observable<boolean>;
  maxMessages$: Observable<number>;
  noMessages$: Observable<boolean>;

  constructor(serviceBusClient: ServiceBusClientService, route: ActivatedRoute, snack: MatSnackBar) {
    this.subscription$ = route.paramMap.pipe(
      map(_ => history?.state?.data?.subscription),
      filter(sub => !!sub),
      shareReplay(1)
    );

    this.messages$ = combineLatest([this.subscription$, this._action$])
      .pipe(
        debounceTime(250),
        filter(([q, a]) => !!q?.id && !!a),
        concatMap(([q, a]) => serviceBusClient.peekSubscription(q.id || '', a)),
        catchError(e => {
          console.error(e);
          snack.open('Error Reading Queue Messages');
          return [];
        })
      );

    this.properties$ = this.subscription$.pipe(
      filter(q => !!q.properties),
      map(q => this.getProperties(q.properties, 'countDetails')));

    this.countDetails$ = this.subscription$.pipe(
      filter(q => !!q.properties?.countDetails),
      map(q => this.getProperties(q.properties?.countDetails)));

    this.hasSub$ = this.subscription$.pipe(map(q => !!q));
    this.noSub$ = concat(of(true), this.hasSub$.pipe(map(q => !q)));
    this.subName$ = this.subscription$.pipe(map(q => q.name || ''));
    this.maxMessages$ = combineLatest([this.subscription$, this._target$]).pipe(
      debounceTime(250),
      filter(([q, t]) => !!q?.id && !!t),
      map(([q, t]) => Math.min(
        (t === 'sub' ?
          q.properties?.countDetails?.activeMessageCount :
          q.properties?.countDetails?.deadLetterMessageCount
        ) || 0,
        30)));
    this.noMessages$ =  concat(of(true), this.maxMessages$.pipe(map(m => m <= 0)));
   }

  ngOnInit(): void { }

  receive(action: 'peek'|'receive', type: 'sub'|'dead-letter', count: string): void {
    this._action$.emit({action, type, count: Number(count)});
  }

  setTarget(target: 'sub'|'dead-letter') {
    this._target$.emit(target);
  }

  private getProperties(obj: any, ignore?: string): {key: string, value: any}[] {
    return Object.keys(obj)
      .filter(k => !ignore || k !== ignore)
      .map(key => ({key, value: obj[key]}));
  }
}
