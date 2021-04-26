import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CustomNode } from '../models/custom-node';
import { NamespaceNode } from '../models/namespace-node';
import { NamespaceQueuesNode } from '../models/namespace-queues-node';
import { NamespaceTopicsNode } from '../models/namespace-topics-node';
import { QueueNode } from '../models/queue-node';
import { SubscriptionNode } from '../models/subscription-node';
import { TopicNode } from '../models/topic-node';
import { TopicSubscriptionNode } from '../models/topic-subscription-node';
import { ServiceBusManagementService } from './service-bus-management.service';
import { TenantSubscriptionService } from './tenant-subscription.service';

@Injectable({
  providedIn: 'root'
})
export class TenantSubscriptionNamespaceService {
  constructor(
    private _tenantSubscriptionService: TenantSubscriptionService,
    private _serviceBusManagementService: ServiceBusManagementService
  ) { }

  getChildren(element?: CustomNode): Observable<CustomNode[]> {
    if (!element) {
      var subscriptions = this._tenantSubscriptionService.getSubscriptions()
        .pipe(map(subs => subs?.map(s => new SubscriptionNode(s))));
      return subscriptions;
    }

    if (!!element?.children) {
      return of(element.children);
    }

    element.children = [];

    if (element instanceof SubscriptionNode && !!element?.id) {
      return this._serviceBusManagementService.getNamespaces(element.id)
              .pipe(
                map(ns => ns?.map(n => new NamespaceNode(n)) || []),
                tap(ns => element.children = ns));
    }

    if (element instanceof NamespaceTopicsNode && !!element?.id) {
      return from(this._serviceBusManagementService.getTopics(element.id))
              .pipe(
                map(ts => ts?.map((t => new TopicNode(t)) || [])),
                tap(ts => element.children = ts));
    }

    if (element instanceof NamespaceQueuesNode && !!element?.id) {
      return from(this._serviceBusManagementService.getQueues(element.id))
              .pipe(
                map(qs => qs?.map((q => new QueueNode(q)) || [])),
                tap(qs => element.children = qs));
    }

    if (element instanceof TopicNode && !!element?.id) {
      return from(this._serviceBusManagementService.getTopicSubscriptions(element.id))
              .pipe(
                map(tss => tss?.map((s => new TopicSubscriptionNode(s)) || [])),
                tap(tss => element.children = tss));
    }

    return of(element.children);
  }
}
