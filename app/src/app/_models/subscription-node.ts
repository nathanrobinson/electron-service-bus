import { Subscription } from "@azure/arm-subscriptions/esm/models";
import { CustomNode } from "./custom-node";

export class SubscriptionNode extends CustomNode {
    constructor(public subscription: Subscription) {
        super(subscription.id, subscription.displayName);
        this.icon = 'remove_from_queue';
    }
}