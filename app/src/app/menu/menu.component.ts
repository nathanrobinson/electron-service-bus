import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, switchMap } from 'rxjs/operators';
import { CustomNode } from '../models/custom-node';
import { QueueNode } from '../models/queue-node';
import { TopicNode } from '../models/topic-node';
import { TopicSubscriptionNode } from '../models/topic-subscription-node';
import { AuthServiceService } from '../services/auth-service.service';
import { TenantSubscriptionNamespaceService } from '../services/tenant-subscription-namespace.service';
import { DynamicMenuNode } from './menu-node';
import { MenuDataSource } from './menu.data-source';

@Component({
  selector: 'esb-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  getLevel = (node: DynamicMenuNode) => node.level;
  isExpandable = (node: DynamicMenuNode) => node.expandable;
  hasChild = (_: number, _nodeData: DynamicMenuNode) => _nodeData.expandable;
  treeControl = new FlatTreeControl<DynamicMenuNode>(this.getLevel, this.isExpandable);
  nodes: MenuDataSource;

  constructor(subs: TenantSubscriptionNamespaceService, auth: AuthServiceService, snack: MatSnackBar) {
    this.nodes = new MenuDataSource(this.treeControl, subs, snack);
    auth.authenticated.pipe(
      filter(x => !!x),
      switchMap(() => subs.getChildren())
      ).subscribe({
        next: s => this.nodes.rawData = s,
        error: error => {
          console.error(error);
          snack.open('Could not load subscription data');
        }
      });
  }

  ngOnInit(): void { }
}
