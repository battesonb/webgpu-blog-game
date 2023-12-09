import {Entity} from "../ec/entity";
import {World} from "../ec/world";

export enum Status {
  Initial,
  Running,
  Success,
  Fail,
}

export interface NodeParams {
  dt: number,
  entity: Entity,
  now: number,
  world: World,
}

export abstract class BehaviorNode {
  private name: string;
  protected children: BehaviorNode[];
  status: Status;

  constructor(name: string, children: BehaviorNode[] = []) {
    this.name = name;
    this.children = children;
    this.status = Status.Initial;
  }

  /**
   * Override this to set the node's status.
   */
  step(_params: NodeParams) {
    this.status = Status.Fail;
  }

  /**
   * Not to be overridden. This exists to reset nodes that are no longer
   * running.
   */
  maintain() {
    if (this.status != Status.Running) {
      this.reset();
    } else {
      for (const child of this.children) {
        child.maintain();
      }
    }
  }

  /**
   * If overriding, make sure to call this base method too.
   */
  reset() {
    if (this.status != Status.Initial) {
      this.status = Status.Initial;
      for (const child of this.children) {
        child.reset();
      }
    }
  }

  /**
   * Not to be overridden. Used to debug/understand a behavior tree.
   */
  print(depth: number = 0) {
    console.log(`${"-".repeat(depth)} ${this.name}`);
    for (const child of this.children) {
      child.print(depth + 1);
    }
  }

  /**
   * Not to be overridden. Used to debug/understand a behavior tree.
   */
  dot(depth: number = 0, index: number = 0): string {
    const result: string[] = [];

    if (depth === 0) {
      result.push("digraph behavior_tree {");
    }

    const nameInternal = this.nameInternal(depth, index);
    result.push(`  ${nameInternal} [label="${this.name}", style="filled", fillcolor="${this.colorForStatus()}"];`);
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      result.push(`  ${nameInternal} -> ${child.nameInternal(depth + 1, i)};`);
    }

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      result.push(child.dot(depth + 1, i));
    }

    if (depth === 0) {
      result.push("}");
    }

    return result.join("\n");
  }

  private nameInternal(depth: number, index: number): string {
    return `${this.name.replace(/[\s()\n]/g, "_")}_${depth}_${index}`;
  }

  private colorForStatus(): string {
    switch (this.status) {
      case Status.Initial:
        return "white";
      case Status.Running:
        return "lightblue";
      case Status.Success:
        return "lightgreen";
      case Status.Fail:
        return "indianred1";
    }
  }
}
