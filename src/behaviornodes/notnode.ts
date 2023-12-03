import {BehaviorNode, NodeParams, Status} from "./behaviornode";

export class NotNode extends BehaviorNode {
  constructor(node: BehaviorNode) {
    super("NotNode", [node]);
  }

  step(params: NodeParams): void {
    const child = this.children[0];
    child.step(params);
    switch (child.status) {
      case Status.Success:
        this.status = Status.Fail;
        break;
      case Status.Fail:
        this.status = Status.Success;
        break;
      default:
        this.status = child.status;
        break;
    }
  }
}
