import { Component, OnInit } from '@angular/core';
import { SBQueue } from '@azure/arm-servicebus/esm/models';
import { IProperties } from '../models/properties';

@Component({
  selector: 'esb-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss']
})
export class QueueComponent implements OnInit {
  queue: IProperties<SBQueue> | undefined;

  constructor() { }

  ngOnInit(): void {
    this.queue = history?.state?.data?.queue;
  }
}
