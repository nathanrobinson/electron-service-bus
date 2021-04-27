import { SBTopic } from "@azure/arm-servicebus/esm/models";
import { CustomNode } from "./custom-node";
import { IProperties } from "./properties";

export class TopicNode extends CustomNode {
    constructor(public topic: IProperties<SBTopic>) {
        super(topic.id, `${topic.name || ''} (${topic.properties?.subscriptionCount || 0})`);
        this.icon = 'repeat_one';
    }
 }