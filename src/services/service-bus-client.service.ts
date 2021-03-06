import { ServiceBusClient, ServiceBusReceivedMessage } from '@azure/service-bus';
import { CredentialsService } from './credentials.service';

export class ServiceBusClientService {
  constructor(private _credentialProvider: CredentialsService) { }

  private _clients: {[key: string]: ServiceBusClient} = {};

  private getClient(namespace: string): ServiceBusClient {
    return this._clients[namespace] ||
      (this._clients[namespace] = new ServiceBusClient(`https://${namespace}.servicebus.windows.net`, this._credentialProvider.getCredentials()));
  }

  async peekQueue(queueId: string, count: number): Promise<ServiceBusReceivedMessage[]> {
    const id = queueId || '';
    var paths = id.split('/');
    const namespaceName = paths[8];
    if (!namespaceName) {
      return [];
    }
    const queueName = paths[10];
    if (!queueName) {
      return [];
    }

    var client = this.getClient(namespaceName);
    var receiver = client.createReceiver(queueName);
    var messages = await receiver.peekMessages(count);
    return messages;
  }

  async peekSubscription(subscriptionId: string, count: number): Promise<ServiceBusReceivedMessage[]> {
    const id = subscriptionId || '';
    var paths = id.split('/');
    const namespaceName = paths[8];
    if (!namespaceName) {
      return [];
    }

    const topicName = paths[10];
    if (!topicName) {
      return [];
    }

    const subscriptionName = paths[12];
    if (!subscriptionName) {
      return [];
    }

    var client = this.getClient(namespaceName);
    var receiver = client.createReceiver(topicName, subscriptionName);
    var messages = await receiver.peekMessages(count);
    return messages;
  }
}
