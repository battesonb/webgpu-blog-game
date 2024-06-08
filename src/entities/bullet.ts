import {Billboard} from "../components/billboard";
import {Entity} from "../ec/entity";
import {Mesh} from "../components/mesh";
import {Transform} from "../components/transform";
import {World} from "../ec/world";
import {GpuResources} from "../resources/gpu-resources";
import {plane} from "../meshes";
import {Vec3} from "../math/vec3";
import {Decay} from "../components/decay";
import {Bullet, BulletKind, BULLET_SPEED} from "../components/bullet";
import {Body} from "../components/body";
import {Vec2} from "../math/vec2";

let bulletCount = 0;

export function newBullet(world: World, kind: BulletKind, position: Vec3, target: Vec2): Entity[] {
  const transform = new Transform();
  const normal = (new Vec3(target.x - position.x, 0, target.y - position.z)).normal();
  transform.position = position;
  const texture = world.getResource(GpuResources)!.texture;
  const bullet = new Entity(`bullet${++bulletCount}`)
    .withComponent(transform)
    .withComponent(new Body(normal.mul(BULLET_SPEED)))
    .withComponentDefault(Billboard)
    .withComponent(new Bullet(kind))
    .withComponent(new Decay(5))
    .withComponent(new Mesh(plane(texture, kind == BulletKind.Player ? 8 : 9, Vec3.fill(2))));

  return [bullet];
}
