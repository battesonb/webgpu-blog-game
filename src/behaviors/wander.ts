import {BehaviorNode, NodeParams, Status} from "../behaviornodes/behaviornode";
import {Locomotor} from "../components/locomotor";
import {Terrain} from "../components/terrain";
import {Transform} from "../components/transform";
import {clamp} from "../math/helpers";
import {Vec2} from "../math/vec2";

export class Wander extends BehaviorNode {
  /**
   * The maximum range to wander.
   */
  private range: number;

  constructor(range: number) {
    super("Wander");
    this.range = range;
  }

  step({entity}: NodeParams): void {
    const transform = entity.getComponent(Transform)!;
    const position = transform.position;
    const locomotor = entity.getComponent(Locomotor)!;
    if (this.status == Status.Initial) {
      const angle = 2 * Math.PI * Math.random();
      const range = this.range * Math.random();
      locomotor.target = new Vec2(
        clamp(0, Terrain.SIZE_X, position.x + range * Math.sin(angle)),
        clamp(0, Terrain.SIZE_Z, position.z + range * Math.cos(angle)),
      );
      this.status = Status.Running;
    }

    if (this.status == Status.Running) {
      if (!locomotor.target) {
        this.status = Status.Fail;
        return;
      }

      let direction = locomotor.target.sub(new Vec2(position.x, position.z));
      const magnitudeSquared = direction.magnitudeSquared();
      direction = direction.normal();

      if (magnitudeSquared < 0.25) {
        locomotor.target = undefined;
        this.status = Status.Success;
      }
    }
  }
}
