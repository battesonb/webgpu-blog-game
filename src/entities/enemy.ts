import {Billboard} from "../components/billboard";
import {Entity} from "../ec/entity";
import {Mesh} from "../components/mesh";
import {Transform} from "../components/transform";
import {World} from "../ec/world";
import {GpuResources} from "../resources/gpu-resources";
import {plane} from "../meshes";
import {EnemyBrain} from "../components/enemy-brain";
import {Vec3} from "../math/vec3";
import {Turret} from "../components/turret";
import {BulletKind} from "../components/bullet";
import {Body} from "../components/body";
import {newShadow} from "./shadow";

let enemyCount = 0;

export function newEnemy(world: World, position: Vec3): Entity[] {
  const transform = new Transform();
  transform.position = position;
  const texture = world.getResource(GpuResources)!.texture;
  const enemy = new Entity(`enemy${++enemyCount}`)
    .withComponent(transform)
    .withComponent(new Body())
    .withComponentDefault(EnemyBrain)
    .withComponentDefault(Billboard)
    .withComponent(new Turret(BulletKind.Enemy, 1))
    .withComponent(new Mesh(plane(texture, 7)));

  const shadow = newShadow(world, enemy.name);

  return [enemy, shadow];
}
