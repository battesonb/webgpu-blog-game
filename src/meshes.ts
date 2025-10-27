import {Vec3} from "./math/vec3";
import {uvFromIndex} from "./texture";
import {Vertex} from "./vertex";

/**
 * A z-forward facing unit plane centered on the axis.
 */
export function plane(texture: GPUTexture, index: number, color: Vec3 = Vec3.fill(1)) {
  return [
    new Vertex(new Vec3(0.5, 0.5, 0), uvFromIndex(index, 0.0, 0.0, texture), color),
    new Vertex(new Vec3(0.5, -0.5, 0), uvFromIndex(index, 0.0, 1.0, texture), color),
    new Vertex(new Vec3(-0.5, -0.5, 0), uvFromIndex(index, 1.0, 1.0, texture), color),
    new Vertex(new Vec3(-0.5, 0.5, 0), uvFromIndex(index, 1.0, 0.0, texture), color),
  ];
}
