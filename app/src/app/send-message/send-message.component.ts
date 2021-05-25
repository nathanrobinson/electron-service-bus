import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceBusClientService } from '../_services/service-bus-client.service';

@Component({
  selector: 'esb-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.scss']
})
export class SendMessageComponent implements OnInit {

  @Input() topicId: string | undefined | null;
  @Input() queueId: string | undefined | null;

  constructor(private _client: ServiceBusClientService, private _snack: MatSnackBar) { }

  ngOnInit(): void {
  }

  sendMessage(message: string) {
    const topicOrQueue = this.topicId || this.queueId;
    if (!!topicOrQueue) {
      this._client.sendMessage(topicOrQueue, message)
        .subscribe({
          next: response => this._snack.open(response.description),
          error: e => {
            console.error(e);
            this._snack.open(e);
          }
        });
    } else {
      this._snack.open('Topic or Queue not found');
    }
  }
}
