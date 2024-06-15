import {Vec3} from "./math/vec3";
import {Vec2} from "./math/vec2";

export class Vertex {
  position: Vec3;
  normal: Vec3;
  uv: Vec2;
  color: Vec3;

  constructor(
    position: Vec3,
    normal: Vec3 = Vec3.unitY(),
    uv: Vec2 = Vec2.zero(),
    color: Vec3 = Vec3.fill(1),
  ) {
    this.position = position;
    this.normal = normal;
    this.uv = uv;
    this.color = color;
  }

  array(): number[] {
    return [
      ...this.position.rep,
      ...this.normal.rep,
      ...this.uv.rep,
      ...this.color.rep,
    ];
  }

  clone(): Vertex {
    return new Vertex(this.position.clone(), this.normal.clone(), this.uv.clone(), this.color.clone());
  }
}
