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
}
