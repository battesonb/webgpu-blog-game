import {BehaviorNode, NodeParams, Status} from "../behaviornodes/behaviornode";
import {Locomotor} from "../components/locomotor";
import {Transform} from "../components/transform";
import {Vec2} from "../math/vec2";

export class Chase extends BehaviorNode {
  private targetName: string;

  constructor(targetName: string) {
    super("Chase");
    this.targetName = targetName;
  }

  step({entity, world}: NodeParams): void {
    if (this.status == Status.Initial) {
      this.status = Status.Running;
    }

    if (this.status == Status.Running) {
      const targetEntity = world.getByName(this.targetName);
      const locomotor = entity.getComponent(Locomotor)!;
      if (!targetEntity) {
        locomotor.target = undefined;
        this.status = Status.Fail;
        return;
      }

      const targetTransform = targetEntity.getComponent(Transform)!;
      const targetPosition = targetTransform.position;
      locomotor.target = new Vec2(targetPosition.x, targetPosition.z);
    }
  }
}
