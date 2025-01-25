import {Terrain} from "../components/terrain";
import {Transform} from "../components/transform";
import {Entity} from "../ec/entity";
import {World} from "../ec/world";
import {Meshes} from "../resources/meshes";

export function newTerrain(world: World): Entity {
  const meshes = world.getResource(Meshes)!;

  const transform = new Transform();
  return new Entity("terrain")
    .withComponent(transform)
    .withComponentDefault(Terrain)
    .withComponent(meshes.get("terrain"));
}
