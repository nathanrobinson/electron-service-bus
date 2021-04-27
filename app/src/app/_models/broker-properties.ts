export interface IBrokerProperties {
    DeliveryCount: number;
    EnqueuedSequenceNumber: number;
    EnqueuedTimeUtc: string;
    Label: string;
    LockToken: string;
    LockedUntilUtc: string;
    MessageId: string;
    SequenceNumber: number;
    State: string;
    TimeToLive: number;
}

