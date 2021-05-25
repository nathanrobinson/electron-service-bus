import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter, switchMap } from 'rxjs/operators';
import { AuthServiceService } from '../_services/auth-service.service';
import { TenantSubscriptionNamespaceService } from '../_services/tenant-subscription-namespace.service';
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

  @Output() nodeToggle: EventEmitter<void>;

  constructor(subs: TenantSubscriptionNamespaceService, auth: AuthServiceService, snack: MatSnackBar) {
    this.nodes = new MenuDataSource(this.treeControl, subs, snack);
    this.nodeToggle = this.nodes.nodeToggled;
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

  refreshNode(node: DynamicMenuNode) {
    const isExpanded = this.treeControl.isExpanded(node);
    this.treeControl.collapse(node);

    node.item.children = undefined;

    if (isExpanded) {
      this.treeControl.expand(node);
    }
  }
}
