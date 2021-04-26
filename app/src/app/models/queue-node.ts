import { SBQueue } from "@azure/arm-servicebus/esm/models";
import { CustomNode } from "./custom-node";
import { IProperties } from "./properties";

export class QueueNode extends CustomNode {
    constructor(public queue: IProperties<SBQueue>) {
        super(queue.id, `${queue.name || ''} (${queue.properties?.messageCount || 0})`);
        this.icon = 'add_to_queue';
        this.tooltip = `Active: ${queue.properties?.countDetails?.activeMessageCount || 0}
Dead Letter: ${queue.properties?.countDetails?.deadLetterMessageCount || 0}
Scheduled: ${queue.properties?.countDetails?.scheduledMessageCount || 0}
Transfer: ${queue.properties?.countDetails?.transferMessageCount || 0}
Transfer Dead Letter: ${queue.properties?.countDetails?.transferDeadLetterMessageCount || 0}`;
    }
 }