import { IBrokerProperties } from "./broker-properties";

export interface ServiceBusMessage {
    lockUri: string;
    brokerProperties: IBrokerProperties;
    body: string;
    priority: string;
    customer: string;
}