import { Component, OnInit } from '@angular/core';
import { SBSubscription } from '@azure/arm-servicebus/esm/models';
import { IProperties } from '../models/properties';

@Component({
  selector: 'esb-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  subscription: IProperties<SBSubscription> | undefined;

  constructor() { }

  ngOnInit(): void {
    this.subscription = history?.state?.data?.subscription;
  }
}
