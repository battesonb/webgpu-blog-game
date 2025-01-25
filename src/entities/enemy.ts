import {Billboard} from "../components/billboard";
import {Entity} from "../ec/entity";
import {Transform} from "../components/transform";
import {World} from "../ec/world";
import {plane} from "../meshes";
import {EnemyBrain} from "../components/enemy-brain";
import {Vec3} from "../math/vec3";
import {Turret} from "../components/turret";
import {BulletKind} from "../components/bullet";
import {Body} from "../components/body";
import {Textures} from "../resources/textures";
import {Meshes} from "../resources/meshes";

let enemyCount = 0;

export function newEnemy(world: World, position: Vec3): Entity[] {
  const meshes = world.getResource(Meshes)!;
  const texture = world.getResource(Textures)!.texture("tileset");
  const transform = new Transform();
  transform.position = position;
  const enemy = new Entity(`enemy${++enemyCount}`)
    .withComponent(transform)
    .withComponent(new Body())
    .withComponentDefault(EnemyBrain)
    .withComponentDefault(Billboard)
    .withComponent(new Turret(BulletKind.Enemy, 1))
    .withComponent(meshes.get("enemy", () => plane(texture, 7, Vec3.fill(1))));

  return [enemy];
}
