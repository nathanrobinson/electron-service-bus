import { Component, OnInit } from '@angular/core';
import { SBTopic } from '@azure/arm-servicebus/esm/models';
import { IProperties } from '../_models/properties';

@Component({
  selector: 'esb-topic',
  templateUrl: './topic.component.html',
  styleUrls: ['./topic.component.scss']
})
export class TopicComponent implements OnInit {
  topic: IProperties<SBTopic> | undefined;

  constructor() { }

  ngOnInit(): void {
    this.topic = history?.state?.data?.topic;
  }
}
