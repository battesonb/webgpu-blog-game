import {BehaviorNode, NodeParams, Status} from "../behaviornodes/behaviornode";
import {Transform} from "../components/transform";
import {Turret} from "../components/turret";
import {Vec2} from "../math/vec2";

export class Shoot extends BehaviorNode {
  private targetName: string;

  constructor(targetName: string) {
    super("Shoot");
    this.targetName = targetName;
  }

  step({entity, world}: NodeParams): void {
    if (this.status == Status.Initial) {
      this.status = Status.Running;
    }

    if (this.status == Status.Running) {
      const targetEntity = world.getByName(this.targetName);
      if (!targetEntity) {
        this.status = Status.Fail;
        return;
      }

      const targetTransform = targetEntity.getComponent(Transform)!;
      const turret = entity.getComponent(Turret)!;
      const aim = new Vec2(targetTransform.position.x, targetTransform.position.z);
      turret.queueShot(aim);
    }
  }
}
