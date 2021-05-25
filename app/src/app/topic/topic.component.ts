import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SBTopic } from '@azure/arm-servicebus/esm/models';
import { concat, Observable, of } from 'rxjs';
import { map, filter, shareReplay } from 'rxjs/operators';
import { IProperties } from '../_models/properties';

@Component({
  selector: 'esb-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit {
  topic$: Observable<IProperties<SBTopic>>;
  topicName$: Observable<string>;
  topicId$: Observable<string>;
  properties$: Observable<{key: string, value: any}[]>;
  countDetails$: Observable<{key: string, value: any}[]>;
  hasTopic$: Observable<boolean>;
  noTopic$: Observable<boolean>;

  constructor(route: ActivatedRoute) {
    this.topic$ = route.paramMap.pipe(
      map(_ => history?.state?.data?.topic),
      filter(topic => !!topic),
      shareReplay(1)
    );

    this.properties$ = this.topic$.pipe(
      filter(q => !!q.properties),
      map(q => this.getProperties(q.properties, 'countDetails')));

    this.countDetails$ = this.topic$.pipe(
      filter(q => !!q.properties?.countDetails),
      map(q => this.getProperties(q.properties?.countDetails)));

    this.hasTopic$ = this.topic$.pipe(map(q => !!q));
    this.noTopic$ = concat(of(true), this.hasTopic$.pipe(map(q => !q)));
    this.topicName$ = this.topic$.pipe(map(q => q.name || ''));
    this.topicId$ = this.topic$.pipe(map(q => q.id || ''));
   }

  ngOnInit(): void { }

  private getProperties(obj: any, ignore?: string): {key: string, value: any}[] {
    return Object.keys(obj)
      .filter(k => !ignore || k !== ignore)
      .map(key => ({key, value: obj[key]}));
  }
}
