/**
 * A 3-dimensional vector.
 */
export class Vec3 {
  /**
   * Internal representation of the vector components.
   */
  rep: [number, number, number];


  constructor(x: number, y: number, z: number) {
    this.rep = [x, y, z];
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

  set x(value: number) {
    this.rep[0] = value;
  }

  set y(value: number) {
    this.rep[1] = value;
  }

  set z(value: number) {
    this.rep[2] = value;
  }

  dot(other: Vec3): number {
    return this.x * other.x + this.y * other.y + this.z * other.z;
  }

  cross(other: Vec3): Vec3 {
    return new Vec3(
      this.y * other.z - this.z * other.y,
      this.z * other.x - this.x * other.z,
      this.x * other.y - this.y * other.x
    );
  }
}
