import { Component, Input, OnInit } from '@angular/core';
import { ServiceBusMessage } from '../_models/service-bus-message';

@Component({
  selector: 'esb-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit {
  @Input() message: ServiceBusMessage | undefined;

  constructor() { }

  ngOnInit(): void {
  }

  messageProperty(key: any) {
    return key != 'body' && key != 'brokerProperties';
  }
}
