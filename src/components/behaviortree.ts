import {BehaviorNode} from "../behaviornodes/behaviornode";
import {Component, UpdateContext} from "../ec/component";

export class BehaviorTree extends Component {
  private root: BehaviorNode;

  constructor(root: BehaviorNode) {
    super();
    this.root = root;
  }

  update(ctx: UpdateContext): void {
    this.root.step({
      entity: this.entity,
      now: ctx.now,
      dt: ctx.dt,
      world: ctx.world,
    });
  }

  postUpdate(_: UpdateContext): void {
    this.root.maintain();
  }

  dot(): string {
    return this.root.dot();
  }
}
