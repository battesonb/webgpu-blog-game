import { Mat4 } from "./mat4";
import { Vec3 } from "./vec3";

export class Rotor3 {
  w: number;
  yz: number;
  zx: number;
  xy: number;

  constructor(w: number, yz: number, zx: number, xy: number) {
    this.w = w;
    this.yz = yz;
    this.zx = zx;
    this.xy = xy;
  }

  static identity(): Rotor3 {
    return new Rotor3(1, 0, 0, 0);
  }

  /**
   * This should be plane-angle and receive a bivector, for purity. This is equivalent in practice.
   */
  static fromAxisAngle(axis: Vec3, angle: number): Rotor3 {
    const halfAngle = angle / 2;
    const sin = Math.sin(halfAngle);
    const b = axis.normal();
    return new Rotor3(Math.cos(halfAngle), b.x * sin, b.y * sin, b.z * sin);
  }

  /**
   * Applies the rotor as a sandwich product to the provided vector. This is a rotation.
   */
  sandwich(v: Vec3): Vec3 {
    const l = new Vec3(
      this.w * v.x - this.zx * v.z + this.xy * v.y,
      this.w * v.y + this.yz * v.z - this.xy * v.x,
      this.w * v.z - this.yz * v.y + this.zx * v.x,
    );
    const lxyz = this.yz * v.x + this.zx * v.y + this.xy * v.z;

    return new Vec3(
      lxyz * this.yz + l.x * this.w + l.y * this.xy - l.z * this.zx,
      lxyz * this.zx + l.y * this.w - l.x * this.xy + l.z * this.yz,
      lxyz * this.xy + l.z * this.w + l.x * this.zx - l.y * this.yz,
    );
  }

  mul(other: Rotor3): Rotor3 {
    return new Rotor3(
      this.w * other.w - this.bivector().dot(other.bivector()),
      this.w * other.yz + other.w * this.yz - this.zx * other.xy + this.xy * other.zx,
      this.w * other.zx + other.w * this.zx + this.yz * other.xy - this.xy * other.yz,
      this.w * other.xy + other.w * this.xy - this.yz * other.zx + this.zx * other.yz,
    );
  }

  magnitudeSquared(): number {
    return this.w * this.w + this.yz * this.yz + this.zx * this.zx + this.xy * this.xy;
  }

  magnitude(): number {
    return Math.sqrt(this.magnitudeSquared());
  }

  bivector(): Vec3 {
    return new Vec3(this.yz, this.zx, this.xy);
  }

  matrix(): Mat4 {
    const i = this.sandwich(Vec3.unitX());
    const j = this.sandwich(Vec3.unitY());
    const k = i.cross(j);

    return new Mat4(
      i.x, j.x, k.x, 0,
      i.y, j.y, k.y, 0,
      i.z, j.z, k.z, 0,
      0, 0, 0, 1,
    );
  }
}
