import {Billboard} from "../components/billboard";
import {Entity} from "../ec/entity";
import {Transform} from "../components/transform";
import {World} from "../ec/world";
import {plane} from "../meshes";
import {Vec3} from "../math/vec3";
import {Decay} from "../components/decay";
import {Bullet, BulletKind, BULLET_SPEED} from "../components/bullet";
import {Body} from "../components/body";
import {Vec2} from "../math/vec2";
import {Textures} from "../resources/textures";
import {Meshes} from "../resources/meshes";

let bulletCount = 0;

export function newBullet(world: World, kind: BulletKind, position: Vec3, target: Vec2): Entity[] {
  const meshes = world.getResource(Meshes)!;
  const texture = world.getResource(Textures)!.texture("tileset");
  const transform = new Transform();
  const normal = (new Vec3(target.x - position.x, 0, target.y - position.z)).normal();
  transform.position = position;
  const bullet = new Entity(`bullet${++bulletCount}`)
    .withComponent(transform)
    .withComponent(new Body(normal.mul(BULLET_SPEED)))
    .withComponentDefault(Billboard)
    .withComponent(new Bullet(kind))
    .withComponent(new Decay(5))
    .withComponent(meshes.get(`bullet-${kind}`, () => {
      return plane(texture, kind == BulletKind.Player ? 8 : 9, Vec3.fill(1.2))
    }));

  return [bullet];
}
