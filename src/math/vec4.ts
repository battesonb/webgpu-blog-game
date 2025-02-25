import {Vec3} from "./vec3";

/**
 * A 4-dimensional vector.
 */
export class Vec4 {
  /**
   * Internal representation of the vector components.
   */
  rep: [number, number, number, number];

  constructor(x: number, y: number, z: number, w: number) {
    this.rep = [x, y, z, w];
  }

  get x() {
    return this.rep[0];
  }

  get y() {
    return this.rep[1];
  }

  get z() {
    return this.rep[2];
  }

  get xyz() {
    return new Vec3(this.x, this.y, this.z);
  }

  get w() {
    return this.rep[3];
  }

  set x(value: number) {
    this.rep[0] = value;
  }

  set y(value: number) {
    this.rep[1] = value;
  }

  set z(value: number) {
    this.rep[2] = value;
  }

  set w(value: number) {
    this.rep[3] = value;
  }

  dot(other: Vec4): number {
    return this.x * other.x + this.y * other.y + this.z * other.z + this.w * other.w;
  }

  map(map: (component: number) => number): Vec4 {
    return new Vec4(map(this.x), map(this.y), map(this.z), map(this.w));
  }

  add(other: Vec4): Vec4 {
    return new Vec4(this.x + other.x, this.y + other.y, this.z + other.z, this.w + other.w);
  }

  div(scalar: number): Vec4 {
    return this.map(c => c / scalar);
  }

  static zero(): Vec4 {
    return new Vec4(0, 0, 0, 0);
  }
}
