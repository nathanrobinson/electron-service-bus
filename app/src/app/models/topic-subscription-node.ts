import { SBSubscription } from "@azure/arm-servicebus/esm/models";
import { CustomNode } from "./custom-node";
import { IProperties } from "./properties";

export class TopicSubscriptionNode extends CustomNode {
    constructor(public subscription: IProperties<SBSubscription>) {
        super(subscription.id, `${subscription.name || ''} (${subscription.properties?.messageCount || 0})`);
        this.icon = 'subscriptions';
        this.tooltip = `Active: ${subscription.properties?.countDetails?.activeMessageCount || 0}
Dead Letter: ${subscription.properties?.countDetails?.deadLetterMessageCount || 0}
Scheduled: ${subscription.properties?.countDetails?.scheduledMessageCount || 0}
Transfer: ${subscription.properties?.countDetails?.transferMessageCount || 0}
Transfer Dead Letter: ${subscription.properties?.countDetails?.transferDeadLetterMessageCount || 0}`;
    }
}