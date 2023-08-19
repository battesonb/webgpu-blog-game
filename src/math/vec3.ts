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

  clone(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
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

  add(other: Vec3): Vec3 {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  sub(other: Vec3): Vec3 {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  div(scalar: number): Vec3 {
    return new Vec3(this.x / scalar, this.y / scalar, this.z / scalar);
  }

  magnitudeSquared(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  magnitude(): number {
    return Math.sqrt(this.magnitudeSquared());
  }

  normal(): Vec3 {
    return this.div(this.magnitude());
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

  neg(): Vec3 {
    return new Vec3(-this.x, -this.y, -this.z);
  }

  static unit_y(): Vec3 {
    return new Vec3(0, 1, 0);
  }

  static zero(): Vec3 {
    return new Vec3(0, 0, 0);
  }

  static fill(scalar: number): Vec3 {
    return new Vec3(scalar, scalar, scalar);
  }
}
