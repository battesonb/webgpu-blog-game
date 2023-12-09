import {BehaviorNode, NodeParams, Status} from "./behaviornode";

export class ConditionNode extends BehaviorNode {
  private predicate: (params: NodeParams) => boolean;

  constructor(name: string, predicate: (params: NodeParams) => boolean) {
    super(name);
    this.predicate = predicate;
  }

  step(params: NodeParams): void {
    if (this.predicate(params)) {
      this.status = Status.Success;
    } else {
      this.status = Status.Fail;
    }
  }
}
