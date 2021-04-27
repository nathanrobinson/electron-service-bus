import { DataSource, CollectionViewer, SelectionChange } from "@angular/cdk/collections";
import { FlatTreeControl } from "@angular/cdk/tree";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BehaviorSubject, Observable, merge } from "rxjs";
import { map } from "rxjs/operators";
import { CustomNode } from "../_models/custom-node";
import { QueueNode } from "../_models/queue-node";
import { TopicNode } from "../_models/topic-node";
import { TopicSubscriptionNode } from "../_models/topic-subscription-node";
import { TenantSubscriptionNamespaceService } from "../_services/tenant-subscription-namespace.service";
import { DynamicMenuNode } from "./menu-node";

export class MenuDataSource implements DataSource<DynamicMenuNode> {

    dataChange = new BehaviorSubject<DynamicMenuNode[]>([]);

    set rawData(value: CustomNode[]) {
        this.data = value?.map(n => new DynamicMenuNode(n, 0, true, false));
    }

    get data(): DynamicMenuNode[] { return this.dataChange.value; }
    set data(value: DynamicMenuNode[]) {
      this._treeControl.dataNodes = value;
      this.dataChange.next(value);
    }

    constructor(private _treeControl: FlatTreeControl<DynamicMenuNode>,
        private _nodeService: TenantSubscriptionNamespaceService,
        private _snackBar: MatSnackBar) {}

    connect(collectionViewer: CollectionViewer): Observable<DynamicMenuNode[]> {
      this._treeControl.expansionModel.changed.subscribe(change => {
        if ((change as SelectionChange<DynamicMenuNode>).added ||
          (change as SelectionChange<DynamicMenuNode>).removed) {
          this.handleTreeControl(change as SelectionChange<DynamicMenuNode>);
        }
      });

      return merge(collectionViewer.viewChange, this.dataChange).pipe(map(() => this.data));
    }

    disconnect(collectionViewer: CollectionViewer): void {}

    /** Handle expand/collapse behaviors */
    handleTreeControl(change: SelectionChange<DynamicMenuNode>) {
      if (change.added) {
        change.added.forEach(node => this.toggleNode(node, true));
      }
      if (change.removed) {
        change.removed.slice().reverse().forEach(node => this.toggleNode(node, false));
      }
    }

    /**
     * Toggle the node, remove from display list
     */
    toggleNode(node: DynamicMenuNode, expand: boolean) {
        const index = this.data.indexOf(node);
        if (index < 0) { // If no children, or cannot find the node, no op
          return;
        }
        node.isLoading = true;
        this._nodeService.getChildren(node.item)
        .subscribe({
            next: children => {
                if (!children?.length) {
                    return;
                }

                if (expand) {
                    const nodes = children.map(n =>
                        new DynamicMenuNode(
                            n,
                            node.level + 1,
                            this.isExpandable(n),
                            this.isRoutable(n)));
                    this.data.splice(index + 1, 0, ...nodes);
                } else {
                    let count = 0;
                    for (let i = index + 1; i < this.data.length
                    && this.data[i].level > node.level; i++, count++) {}
                    this.data.splice(index + 1, count);
                }

                // notify the change
                this.dataChange.next(this.data);
                node.isLoading = false;
            },
            error: error => {
                console.error(error);
                this._snackBar.open('Could not load node child', 'Dismiss');
            }
        });
    }

    private isRoutable(node: CustomNode): boolean {
        return node instanceof QueueNode ||
               node instanceof TopicSubscriptionNode ||
               node instanceof TopicNode;
    }

    private isExpandable(node: CustomNode): boolean {
        return !(node instanceof QueueNode ||
               node instanceof TopicSubscriptionNode);
    }
  }
