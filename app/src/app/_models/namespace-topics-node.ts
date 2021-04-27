import { SBNamespace } from "@azure/arm-servicebus/esm/models";
import { CustomNode } from "./custom-node";

export class NamespaceTopicsNode extends CustomNode {
    constructor(namespace: SBNamespace) {
        super(`${namespace.id}/topics`, 'Topics');
        this.icon = 'call_split';
    }
}