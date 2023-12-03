import {BehaviorNode, NodeParams, Status} from "./behaviornode";

export class ParallelNode extends BehaviorNode {
  constructor(...children: BehaviorNode[]) {
    super("ParallelNode", children);
  }

  step(params: NodeParams): void {
    let done = true;
    for (const child of this.children) {
      if (child.status != Status.Success) {
        child.step(params);
        if (child.status == Status.Fail) {
          this.status = Status.Fail;
          return;
        }
      }

      if (child.status == Status.Running) {
        done = false;
      }
    }

    if (done) {
      this.status = Status.Success;
    } else {
      this.status = Status.Running;
    }
  }
}
