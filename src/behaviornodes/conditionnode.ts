import {BehaviorNode, NodeParams, Status} from "./behaviornode";

export class ConditionNode extends BehaviorNode {
  private predicate: (params: NodeParams) => boolean;

  constructor(predicate: (params: NodeParams) => boolean, name: string = "ConditionNode") {
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
