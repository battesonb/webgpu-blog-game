import {Component} from "../ec/component";
import {Mat4} from "../math/mat4";
import {Vec3} from "../math/vec3";

export class Camera extends Component {
  yaw: number;
  private _pitch: number;

  constructor() {
    super();
    this.yaw = 0;
    this._pitch = 0;
  }

  get pitch() {
    return this._pitch;
  }

  /**
   * Set the pitch between -90 and 90 degrees. Anything else is disregarded as
   * we treat y as up.
   */
  set pitch(value: number) {
    this._pitch = Math.max(-Math.PI/2 + 0.01, Math.min(Math.PI/2 - 0.01, value));
  }

  matrix(position: Vec3): Mat4 {
    const e = position;
    const d = this.dir();
    const r = d.cross(new Vec3(0, 1, 0)).normal();
    const u = r.cross(d).normal();
    return new Mat4(
       r.x,  r.y,  r.z, -e.dot(r),
       u.x,  u.y,  u.z, -e.dot(u),
      -d.x, -d.y, -d.z,  e.dot(d),
         0,    0,    0,         1
    );
  }

  up(): Vec3 {
    return this.right().cross(this.dir()).normal();
  }

  right(): Vec3 {
    return new Vec3(Math.cos(this.yaw), 0.0, -Math.sin(this.yaw));
  }

  dir(): Vec3 {
    const xzLength = Math.cos(this.pitch);
    return new Vec3(
      -xzLength * Math.sin(this.yaw),
      Math.sin(this.pitch),
      -xzLength * Math.cos(this.yaw),
    );
  }
}
