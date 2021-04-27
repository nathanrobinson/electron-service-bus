import { Resource } from "@azure/arm-servicebus/esm/models";

export interface IProperties<T> extends Resource {
    properties?: T;
}