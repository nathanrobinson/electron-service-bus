import { CustomNode } from "../models/custom-node";

export class DynamicMenuNode {
    constructor(
        public item: CustomNode,
        public level = 0,
        public expandable = true,
        public routable = true,
        public isLoading = false) {}
}
