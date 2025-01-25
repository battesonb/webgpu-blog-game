import {Billboard} from "../components/billboard";
import {Entity} from "../ec/entity";
import {Transform} from "../components/transform";
import {World} from "../ec/world";
import {PlayerController} from "../components/player-controller";
import {Terrain} from "../components/terrain";
import {Body} from "../components/body";
import {plane} from "../meshes";
import {Turret} from "../components/turret";
import {BulletKind} from "../components/bullet";
import {Textures} from "../resources/textures";
import {Meshes} from "../resources/meshes";

export function newPlayer(world: World): Entity[] {
  const meshes = world.getResource(Meshes)!;
  const texture = world.getResource(Textures)!.texture("tileset");
  const transform = new Transform();
  transform.position.y = 8;
  transform.position.x = Terrain.SIZE_X / 2;
  transform.position.z = Terrain.SIZE_Z / 2;
  const player = new Entity("player")
    .withComponent(transform)
    .withComponent(new Body())
    .withComponentDefault(Billboard)
    .withComponentDefault(PlayerController)
    .withComponent(new Turret(BulletKind.Player, 0.2))
    .withComponent(meshes.get("player", () => plane(texture, 6)));

  return [player];
}
