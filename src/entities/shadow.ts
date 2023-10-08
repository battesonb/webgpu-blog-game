import {Entity} from "../ec/entity";
import {Mesh} from "../components/mesh";
import {Transform} from "../components/transform";
import {World} from "../ec/world";
import {GpuResources} from "../resources/gpu-resources";
import {upPlane} from "../meshes";
import {Shadow} from "../components/shadow";

let shadowCount = 0;
export function newShadow(world: World, targetName: string, maxScale: number = 0.8): Entity {
  const transform = new Transform();
  const texture = world.getResource(GpuResources)!.texture;
  return new Entity(`shadow${++shadowCount}`)
    .withComponent(transform)
    .withComponent(new Shadow(targetName, maxScale))
    .withComponent(new Mesh(upPlane(texture, 10)));
}
