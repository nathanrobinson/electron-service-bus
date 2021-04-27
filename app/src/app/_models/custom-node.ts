export abstract class CustomNode {
    children: CustomNode[] | undefined;
    tooltip: string | undefined;
    icon: string | undefined;

    constructor(public id: string | undefined, public label: string | undefined) {
        id = id || '';
        label = label || '';
    }
 }