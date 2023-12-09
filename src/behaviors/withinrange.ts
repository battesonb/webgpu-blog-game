import {ConditionNode} from "../behaviornodes/conditionnode";
import {Transform} from "../components/transform";

export class WithinRange extends ConditionNode {
  constructor(targetName: string, range: number) {
    const rangeSquared = range * range;
    super(`WithinRange\n(${targetName})`, ({entity, world}) => {
      const entityTransform = entity.getComponent(Transform)!;
      const target = world.getByName(targetName);

      if (!target) {
        return false;
      }

      const targetTransform = target.getComponent(Transform)!;
      return entityTransform.position.sub(targetTransform.position).magnitudeSquared() <= rangeSquared;
    });
  }
}
