import { SBNamespace } from "@azure/arm-servicebus/esm/models";
import { CustomNode } from "./custom-node";

export class NamespaceQueuesNode extends CustomNode {
    constructor(namespace: SBNamespace) {
        super(`${namespace.id}/queues`, 'Queues');
        this.icon = 'call_made';
    }
}