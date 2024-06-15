import {Vec3} from "./math/vec3";
import {uvFromIndex} from "./texture";
import {Vertex} from "./vertex";

export function plane(texture: GPUTexture, index: number, color: Vec3 = Vec3.fill(1)) {
  return [
    new Vertex(new Vec3(-0.5, -0.5, 0), Vec3.unitZ(), uvFromIndex(index, 0.0, 1.0, texture), color),
    new Vertex(new Vec3(0.5, -0.5, 0), Vec3.unitZ(), uvFromIndex(index, 1.0, 1.0, texture), color),
    new Vertex(new Vec3(0.5, 0.5, 0), Vec3.unitZ(), uvFromIndex(index, 1.0, 0.0, texture), color),
    new Vertex(new Vec3(-0.5, 0.5, 0), Vec3.unitZ(), uvFromIndex(index, 0.0, 0.0, texture), color),
  ];
}

export function upPlane(texture: GPUTexture, index: number) {
  return [
    new Vertex(new Vec3(-0.5, 0, 0.5), Vec3.unitY(), uvFromIndex(index, 0.0, 1.0, texture)),
    new Vertex(new Vec3(0.5, 0, 0.5), Vec3.unitY(), uvFromIndex(index, 1.0, 1.0, texture)),
    new Vertex(new Vec3(0.5, 0, -0.5), Vec3.unitY(), uvFromIndex(index, 1.0, 0.0, texture)),
    new Vertex(new Vec3(-0.5, 0, -0.5), Vec3.unitY(), uvFromIndex(index, 0.0, 0.0, texture)),
  ];
}
