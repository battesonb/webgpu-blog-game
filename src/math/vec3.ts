import { assert } from "../assertions";
import { Rotor3 } from "./rotor3";

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

  set(other: Vec3) {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
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

  map(map: (component: number) => number): Vec3 {
    return new Vec3(map(this.x), map(this.y), map(this.z));
  }

  add(other: Vec3): Vec3 {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }

  sub(other: Vec3): Vec3 {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  div(scalar: number): Vec3 {
    return this.map(c => c / scalar);
  }

  /**
   * This method assumes that both vectors are normal. Output is nonsense, otherwise.
   */
  angleBetween(other: Vec3): number {
    return Math.acos(this.dot(other));
  }

  mul(value: number): Vec3;
  /**
   * Produces the a [Rotor3] using the mathematical definition. This means this is equivalent to:
   *
   * ```
   * R = to * from.
   * ```
   *
   * This is because the sandwich product is applied inside-out.
   */
  mul(from: Vec3): Rotor3;
  mul(value: number | Vec3): Vec3 | Rotor3 {
    if (value instanceof Vec3) {
      // Choose a vector halfway between the two to get the rotor representing half their angle
      // instead of double.
      const to= this.normal();
      const from = value.normal();
      const halfway = (from.add(to)).normal();

      assert(halfway.magnitudeSquared() > 0.001, "Small halfway vector was unexpected with rotor implementation");

      // This is "backwards" because we want to apply a then b via the sandwich
      // product. Recall that this means we do:
      // RvR^{-1} = bava^{-1}b^{-1}
      //
      // Therefore, the rotor we want is R=ba, not ab.
      const wedge = new Vec3(
        halfway.y * from.z - halfway.z * from.y,
        halfway.z * from.x - halfway.x * from.z,
        halfway.x * from.y - halfway.y * from.x,
      );
      return new Rotor3(
        halfway.dot(from),
        wedge.x,
        wedge.y,
        wedge.z,
      );
    }
    return this.map(c => c * value);
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

  buffer(): Float32Array {
    return new Float32Array([...this.rep, 0]);
  }

  static unitX(): Vec3 {
    return new Vec3(1, 0, 0);
  }

  static unitY(): Vec3 {
    return new Vec3(0, 1, 0);
  }

  static unitZ(): Vec3 {
    return new Vec3(0, 0, 1);
  }
  static zero(): Vec3 {
    return new Vec3(0, 0, 0);
  }

  static fill(scalar: number): Vec3 {
    return new Vec3(scalar, scalar, scalar);
  }
}
