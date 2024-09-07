import {Vec3} from "./math/vec3";
import {Vec2} from "./math/vec2";

export class Vertex {
  position: Vec3;
  tangent: Vec3;
  bitangent: Vec3;
  normal: Vec3;
  uv: Vec2;
  color: Vec3;

  constructor(
    position: Vec3,
    uv: Vec2 = Vec2.zero(),
    color: Vec3 = Vec3.fill(1),
  ) {
    this.position = position;
    this.uv = uv;
    this.color = color;
    this.tangent = Vec3.unitX();
    this.bitangent = Vec3.unitY();
    this.normal = Vec3.unitZ();
  }

  array(): number[] {
    return [
      ...this.position.rep,
      ...this.normal.rep,
      ...this.tangent.rep,
      ...this.bitangent.rep,
      ...this.uv.rep,
      ...this.color.rep,
    ];
  }
}
