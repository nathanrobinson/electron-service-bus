import { IpcMainEvent } from "electron/main";
import { ServiceBusClientService } from './service-bus-client.service';

export class ServiceBusRequestHandlerService {
  constructor (private _client: ServiceBusClientService) { }

  async peekQueue(queueId: string, count: number) {
    var messages = await this._client.peekQueue(queueId, count);
    return JSON.stringify(messages);
  }

  peekQueueRequestHandler() {
    return async (event: IpcMainEvent, queueId: string, count: number) => {
      try {
        if (!queueId || !count) {
          console.error({queueId, count});
          event.reply('peek-queue-reply', {error: 'invalid peek options'});
          return;
        }
        const messages = await this.peekQueue(String(queueId), Number(count));
        event.reply('peek-queue-reply', messages);
      } catch (error: any) {
        console.error(error);
        event.reply('peek-queue-reply', {error});
      }
    };
  }

  async peekSubscription(subscriptionId: string, count: number) {
    var messages = await this._client.peekSubscription(subscriptionId, count);
    return JSON.stringify(messages);
  }

  peekSubscriptionRequestHandler() {
    return async (event: IpcMainEvent, subscriptionId: string, count: number) => {
      try {
        if (!subscriptionId || !count) {
          console.error({subscriptionId, count});
          event.reply('peek-subscription-reply', {error: 'invalid peek options'});
          return;
        }
        const messages = await this.peekQueue(String(subscriptionId), Number(count));
        event.reply('peek-subscription-reply', messages);
      } catch (error: any) {
        console.error(error);
        event.reply('peek-subscription-reply', {error});
      }
    };
  }
}