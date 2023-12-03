import {BehaviorNode, NodeParams, Status} from "./behaviornode";

export class SequenceNode extends BehaviorNode {
  private index: number;

  constructor(...children: BehaviorNode[]) {
    super("SequenceNode", children);
    this.index = 0;
  }

  step(params: NodeParams): void {
    while (this.index < this.children.length) {
      const child = this.children[this.index];
      child.step(params);
      if (child.status == Status.Running || child.status == Status.Fail) {
        this.status = child.status;
        return;
      }

      this.index += 1;
    }

    this.status = Status.Success;
  }

  reset(): void {
    BehaviorNode.prototype.reset.call(this);
    this.index = 0;
  }
}
