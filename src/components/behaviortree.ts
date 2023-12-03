import {BehaviorNode} from "../behaviornodes/behaviornode";
import {Component, UpdateContext} from "../ec/component";

const states = new Set<string>();

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
    const dot = this.dot();
    const len = states.size;
    states.add(dot);
    if (states.size > len) {
      console.log(dot);
    }
    this.root.maintain();
  }

  dot(): string {
    return this.root.dot();
  }
}
