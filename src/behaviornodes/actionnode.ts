import {BehaviorNode, NodeParams, Status} from "./behaviornode";

export class ActionNode extends BehaviorNode {
  private callback: (params: NodeParams) => Status;

  constructor(name: string, callback: (params: NodeParams) => Status) {
    super(name);
    this.callback = callback;
  }

  step(params: NodeParams): void {
    this.status = this.callback(params);
  }
}
