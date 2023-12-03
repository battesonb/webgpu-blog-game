import {Billboard} from "../components/billboard";
import {Entity} from "../ec/entity";
import {Mesh} from "../components/mesh";
import {Transform} from "../components/transform";
import {World} from "../ec/world";
import {GpuResources} from "../resources/gpu-resources";
import {plane} from "../meshes";
import {Vec3} from "../math/vec3";
import {Turret} from "../components/turret";
import {BulletKind} from "../components/bullet";
import {Body} from "../components/body";
import {newShadow} from "./shadow";
import {BehaviorTree} from "../components/behaviortree";
import {SelectorNode} from "../behaviornodes/selectornode";
import {Wander} from "../behaviors/wander";
import {Locomotor} from "../components/locomotor";
import {ParallelNode} from "../behaviornodes/parallelnode";
import {WithinRange} from "../behaviors/withinrange";
import {NotNode} from "../behaviornodes/notnode";
import {SequenceNode} from "../behaviornodes/sequencenode";
import {WaitNode} from "../behaviornodes/waitnode";
import {Chase} from "../behaviors/chase";
import {Shoot} from "../behaviors/shoot";

let enemyCount = 0;

function enemyBrain() {
  const shootDistance = 10;
  const bt = new BehaviorTree(
    new SelectorNode(
      new ParallelNode(
        new WithinRange("player", shootDistance),
        new Chase("player"),
        new Shoot("player"),
      ),
      new ParallelNode(
        new NotNode(new WithinRange("player", shootDistance)),
        new SequenceNode(
          new WaitNode(2, 1),
          new Wander(10),
        )
      ),
    )
  );

  return bt;
}

export function newEnemy(world: World, position: Vec3): Entity[] {
  const transform = new Transform();
  transform.position = position;
  const texture = world.getResource(GpuResources)!.texture;
  const enemy = new Entity(`enemy${++enemyCount}`)
    .withComponent(transform)
    .withComponent(new Locomotor(2.5))
    .withComponent(new Body())
    .withComponent(enemyBrain())
    .withComponentDefault(Billboard)
    .withComponent(new Turret(BulletKind.Enemy, 1))
    .withComponent(new Mesh(plane(texture, 7)));

  const shadow = newShadow(world, enemy.name);

  return [enemy, shadow];
}
