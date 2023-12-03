import {BehaviorNode, NodeParams, Status} from "./behaviornode";

export class WaitNode extends BehaviorNode {
  private waitSeconds: number;
  private variation: number;
  private wakeTime: number;

  constructor(waitSeconds: number, variation: number) {
    super("WaitNode");
    this.waitSeconds = waitSeconds;
    this.variation = variation;
    this.wakeTime = 0;
  }

  step({now}: NodeParams): void {
    if (this.status != Status.Running) {
      this.status = Status.Running;
      this.wakeTime = now + Math.max(0, this.waitSeconds + this.variation * Math.random()) * 1000;
    }

    if (now > this.wakeTime) {
      this.status = Status.Success;
    }
  }
}
