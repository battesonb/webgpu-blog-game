import {Billboard} from "../components/billboard";
import {Entity} from "../ec/entity";
import {Mesh} from "../components/mesh";
import {Transform} from "../components/transform";
import {World} from "../ec/world";
import {GpuResources} from "../resources/gpu-resources";
import {PlayerController} from "../components/player-controller";
import {Terrain} from "../components/terrain";
import {Body} from "../components/body";
import {plane} from "../meshes";
import {Turret} from "../components/turret";
import {BulletKind} from "../components/bullet";
import {Vec3} from "../math/vec3";

export function newPlayer(world: World): Entity[] {
  const transform = new Transform();
  transform.position.y = 8;
  transform.position.x = Terrain.SIZE_X / 2;
  transform.position.z = Terrain.SIZE_Z / 2;
  const texture = world.getResource(GpuResources)!.texture;
  const player = new Entity("player")
    .withComponent(transform)
    .withComponent(new Body())
    .withComponentDefault(Billboard)
    .withComponentDefault(PlayerController)
    .withComponent(new Turret(BulletKind.Player, 0.2))
    .withComponent(new Mesh(plane(texture, 6, Vec3.fill(1.4))));

  return [player];
}
