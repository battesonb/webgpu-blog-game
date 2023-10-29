import {Spawner} from "../components/spawner";
import {Entity} from "../ec/entity";

export function newSpawner() {
  return new Entity("spawner").withComponentDefault(Spawner)
}
