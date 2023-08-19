import {Mesh} from "../components/mesh";
import {Terrain} from "../components/terrain";
import {Transform} from "../components/transform";
import {Entity} from "../ec/entity";
import {World} from "../ec/world";
import {Vec3} from "../math/vec3";
import {GpuResources} from "../resources/gpu-resources";
import {uvFromIndex} from "../texture";
import {Vertex} from "../vertex";

export function cube(texture: GPUTexture, topIndex: number, sideIndex: number) {
  return [
    // front
    new Vertex(new Vec3(-0.5, -0.5, 0.5), uvFromIndex(sideIndex, 0.0, 1.0, texture)),
    new Vertex(new Vec3(0.5, -0.5, 0.5), uvFromIndex(sideIndex, 1.0, 1.0, texture)),
    new Vertex(new Vec3(0.5, 0.5, 0.5), uvFromIndex(sideIndex, 1.0, 0.0, texture)),
    new Vertex(new Vec3(-0.5, 0.5, 0.5), uvFromIndex(sideIndex, 0.0, 0.0, texture)),

    // back
    new Vertex(new Vec3(0.5, -0.5, -0.5), uvFromIndex(sideIndex, 0.0, 1.0, texture)),
    new Vertex(new Vec3(-0.5, -0.5, -0.5), uvFromIndex(sideIndex, 1.0, 1.0, texture)),
    new Vertex(new Vec3(-0.5, 0.5, -0.5), uvFromIndex(sideIndex, 1.0, 0.0, texture)),
    new Vertex(new Vec3(0.5, 0.5, -0.5), uvFromIndex(sideIndex, 0.0, 0.0, texture)),

    // right
    new Vertex(new Vec3(0.5, -0.5, 0.5), uvFromIndex(sideIndex, 0.0, 1.0, texture)),
    new Vertex(new Vec3(0.5, -0.5, -0.5), uvFromIndex(sideIndex, 1.0, 1.0, texture)),
    new Vertex(new Vec3(0.5, 0.5, -0.5), uvFromIndex(sideIndex, 1.0, 0.0, texture)),
    new Vertex(new Vec3(0.5, 0.5, 0.5), uvFromIndex(sideIndex, 0.0, 0.0, texture)),

    // left
    new Vertex(new Vec3(-0.5, -0.5, -0.5), uvFromIndex(sideIndex, 0.0, 1.0, texture)),
    new Vertex(new Vec3(-0.5, -0.5, 0.5), uvFromIndex(sideIndex, 1.0, 1.0, texture)),
    new Vertex(new Vec3(-0.5, 0.5, 0.5), uvFromIndex(sideIndex, 1.0, 0.0, texture)),
    new Vertex(new Vec3(-0.5, 0.5, -0.5), uvFromIndex(sideIndex, 0.0, 0.0, texture)),

    // top
    new Vertex(new Vec3(-0.5, 0.5, 0.5), uvFromIndex(topIndex, 0.0, 1.0, texture)),
    new Vertex(new Vec3(0.5, 0.5, 0.5), uvFromIndex(topIndex, 1.0, 1.0, texture)),
    new Vertex(new Vec3(0.5, 0.5, -0.5), uvFromIndex(topIndex, 1.0, 0.0, texture)),
    new Vertex(new Vec3(-0.5, 0.5, -0.5), uvFromIndex(topIndex, 0.0, 0.0, texture)),
  ];
}

export function newTerrain(world: World): Entity {
  const transform = new Transform();
  const texture = world.getResource(GpuResources)!.texture;
  return new Entity("terrain")
    .withComponent(transform)
    .withComponentDefault(Terrain)
    .withComponent(new Mesh(cube(texture, 2, 3)));
}
