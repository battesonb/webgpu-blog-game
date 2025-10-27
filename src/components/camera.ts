import {Component, InitContext, UpdateContext} from "../ec/component";
import {Mat4} from "../math/mat4";
import { Rotor3 } from "../math/rotor3";
import {Vec3} from "../math/vec3";
import { Transform } from "./transform";

export class Camera extends Component {
  yaw: number;
  pitch: number;
  private _transform?: Transform;

  constructor() {
    super();
    this.yaw = 0;
    this.pitch = 0;
  }

  init(_ctx: InitContext): void {
    this._transform = this.getComponent(Transform)!;
  }

  update(_ctx: UpdateContext): void {
    const yaw = Rotor3.fromAxisAngle(Vec3.unitY(), this.yaw);
    const axis = yaw.sandwich(Vec3.unitX());
    const pitch = Rotor3.fromAxisAngle(axis, this.pitch);

    this._transform!.rotation = pitch.mul(yaw);
  }

  matrix(): Mat4 {
    const e = this._transform!.position;
    const d = this.dir();
    const r = this.right();
    const u = d.cross(r).normal();
    return new Mat4(
      r.x, r.y, r.z, -e.dot(r),
      u.x, u.y, u.z, -e.dot(u),
      d.x, d.y, d.z, -e.dot(d),
        0,   0,   0,         1
    );
  }

  up(): Vec3 {
    return this._transform!.rotation.sandwich(Vec3.unitY());
  }

  right(): Vec3 {
    return this._transform!.rotation.sandwich(Vec3.unitX());
  }

  dir(): Vec3 {
    return this._transform!.rotation.sandwich(Vec3.unitZ());
  }
}
