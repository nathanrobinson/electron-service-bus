import { SBNamespace } from "@azure/arm-servicebus/esm/models";
import { CustomNode } from "./custom-node";
import { NamespaceQueuesNode } from "./namespace-queues-node";
import { NamespaceTopicsNode } from "./namespace-topics-node";

export class NamespaceNode extends CustomNode {
    constructor(public namespace: SBNamespace) {
        super(namespace.id, namespace.name);
        this.icon = 'email';
        this.children = [
            new NamespaceTopicsNode(namespace),
            new NamespaceQueuesNode(namespace)
        ];
    }
}
