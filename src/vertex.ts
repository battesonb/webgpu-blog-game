import {Vec3} from "./math/vec3";
import {Vec2} from "./math/vec2";

export class Vertex {
  position: Vec3;
  uv: Vec2;

  constructor(
    position: Vec3,
    uv: Vec2 = new Vec2(0, 0),
  ) {
    this.position = position;
    this.uv = uv;
  }

  array(): number[] {
    return [
      ...this.position.rep,
      ...this.uv.rep,
    ];
  }

  clone(): Vertex {
    return new Vertex(this.position.clone(), this.uv.clone());
  }
}
