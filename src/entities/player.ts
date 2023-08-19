import {Billboard} from "../components/billboard";
import {Entity} from "../ec/entity";
import {Mesh} from "../components/mesh";
import {Transform} from "../components/transform";
import {Vec3} from "../math/vec3";
import {Vertex} from "../vertex";
import {World} from "../ec/world";
import {uvFromIndex} from "../texture";
import {GpuResources} from "../resources/gpu-resources";
import {PlayerController} from "../components/player-controller";

export function plane(texture: GPUTexture, index: number) {
  return [
    new Vertex(new Vec3(-0.5, -0.5, 0.5), uvFromIndex(index, 0.0, 1.0, texture)),
    new Vertex(new Vec3(0.5, -0.5, 0.5), uvFromIndex(index, 1.0, 1.0, texture)),
    new Vertex(new Vec3(0.5, 0.5, 0.5), uvFromIndex(index, 1.0, 0.0, texture)),
    new Vertex(new Vec3(-0.5, 0.5, 0.5), uvFromIndex(index, 0.0, 0.0, texture)),
  ];
}

export function newPlayer(world: World): Entity {
  const transform = new Transform();
  transform.position.y = 1;
  const texture = world.getResource(GpuResources)!.texture;
  return new Entity("player")
    .withComponent(transform)
    .withComponentDefault(Billboard)
    .withComponentDefault(PlayerController)
    .withComponent(new Mesh(plane(texture, 6)));
}
