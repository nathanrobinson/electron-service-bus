import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QueueComponent } from './queue/queue.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { TopicComponent } from './topic/topic.component';

const routes: Routes = [{
  path: 'subscriptions/:subscription/resourceGroups/:resourceGroup/providers/Microsoft.ServiceBus/namespaces/:namespace/topics/:topic',
  component: TopicComponent
},{
  path: 'subscriptions/:subscription/resourceGroups/:resourceGroup/providers/Microsoft.ServiceBus/namespaces/:namespace/queues/:queue',
  component: QueueComponent
},{
  path: 'subscriptions/:subscription/resourceGroups/:resourceGroup/providers/Microsoft.ServiceBus/namespaces/:namespace/topics/:topic/subscriptions/:topicSubscription',
  component: SubscriptionComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
