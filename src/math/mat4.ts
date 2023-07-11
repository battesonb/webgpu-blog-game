import {Vec3} from "./vec3";
import {Vec4} from "./vec4";

/**
 * A 4x4 square matrix.
 */
export class Mat4 {
  rows: [Vec4, Vec4, Vec4, Vec4];

  constructor(
    r0c0: number, r0c1: number, r0c2: number, r0c3: number,
    r1c0: number, r1c1: number, r1c2: number, r1c3: number,
    r2c0: number, r2c1: number, r2c2: number, r2c3: number,
    r3c0: number, r3c1: number, r3c2: number, r3c3: number,
  ) {
    this.rows = [
      new Vec4(r0c0, r0c1, r0c2, r0c3),
      new Vec4(r1c0, r1c1, r1c2, r1c3),
      new Vec4(r2c0, r2c1, r2c2, r2c3),
      new Vec4(r3c0, r3c1, r3c2, r3c3),
    ];
  }

  row(index: number): Vec4 {
    return this.rows[index];
  }

  column(index: number): Vec4 {
    return new Vec4(
      this.rows[0].rep[index],
      this.rows[1].rep[index],
      this.rows[2].rep[index],
      this.rows[3].rep[index],
    );
  }

  /**
   * Converts this matrix into a column-major buffer for WebGPU.
   */
  buffer(): Float32Array {
    return new Float32Array([
      ...this.column(0).rep,
      ...this.column(1).rep,
      ...this.column(2).rep,
      ...this.column(3).rep,
    ]);
  }

  mul(other: Mat4): Mat4 {
      const result = Mat4.zero();
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          result.rows[i].rep[j] = this.row(i).dot(other.column(j));
        }
      }

      return result;
  }

  /**
   * A method for defining a "look-at" matrix for a given position and target in
   * a right-handed coordinate system.
   *
   * This makes use of a change of basis.
   */
  static lookAt(eye: Vec3, target: Vec3, up = Vec3.unit_y()): Mat4 {
    const k = target.sub(eye).normal();
    const i = up.cross(k).normal();
    const j = k.cross(i).normal();
    return new Mat4(
      i.x, j.x, k.x, 0,
      i.y, j.y, k.y, 0,
      i.z, j.z, k.z, 0,
        0,   0,   0, 1,
    );
  }

  static translated(value: Vec3): Mat4 {
    return new Mat4(
      1, 0, 0, value.x,
      0, 1, 0, value.y,
      0, 0, 1, value.z,
      0, 0, 0, 1,
    );
  }

  static scaled(value: Vec3): Mat4 {
    return new Mat4(
      value.x,       0,       0, 0,
            0, value.y,       0, 0,
            0,       0, value.z, 0,
            0,       0,       0, 1,
    );
  }

  static zero(): Mat4 {
    return new Mat4(
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    );
  }

  static identity(): Mat4 {
    return new Mat4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    );
  }
}
