import {Mesh} from "../components/mesh";
import {Terrain} from "../components/terrain";
import {Transform} from "../components/transform";
import {Entity} from "../ec/entity";

export function newTerrain(): Entity {
  const transform = new Transform();
  return new Entity("terrain")
    .withComponent(transform)
    .withComponentDefault(Terrain)
    .withComponent(new Mesh([]));
}
