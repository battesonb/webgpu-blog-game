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


  mul(matrix: Vec4): Vec4
  mul(other: Mat4 | number): Mat4
  mul(other: Vec4 | Mat4 | number) {
    if (other instanceof Vec4) {
      const result = Vec4.zero();
      for (let i = 0; i < 4; i++) {
        result.rep[i] = this.row(i).dot(other);
      }
      return result;
    }

    const result = Mat4.zero();

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (other instanceof Mat4) {
          result.rows[i].rep[j] = this.row(i).dot(other.column(j));
        } else {
          result.rows[i].rep = this.row(i).rep.map(x => x * other) as [number, number, number, number];
        }
      }
    }

    return result;
  }

  adjugate(): Mat4 {
    const b11 = this.rows[1].y * this.rows[2].z * this.rows[3].w
      + this.rows[1].z * this.rows[2].w * this.rows[3].y
      + this.rows[1].w * this.rows[2].y * this.rows[3].z
      - this.rows[1].y * this.rows[2].w * this.rows[3].z
      - this.rows[1].z * this.rows[2].y * this.rows[3].w
      - this.rows[1].w * this.rows[2].z * this.rows[3].y;
    const b12 = this.rows[0].y * this.rows[2].w * this.rows[3].z
      + this.rows[0].z * this.rows[2].y * this.rows[3].w
      + this.rows[0].w * this.rows[2].z * this.rows[3].y
      - this.rows[0].y * this.rows[2].z * this.rows[3].w
      - this.rows[0].z * this.rows[2].w * this.rows[3].y
      - this.rows[0].w * this.rows[2].y * this.rows[3].z;
    const b13 = this.rows[0].y * this.rows[1].z * this.rows[2].w
      + this.rows[0].z * this.rows[1].w * this.rows[3].y
      + this.rows[0].w * this.rows[1].y * this.rows[3].z
      - this.rows[0].y * this.rows[1].w * this.rows[3].z
      - this.rows[0].z * this.rows[1].y * this.rows[3].w
      - this.rows[0].w * this.rows[1].z * this.rows[3].y;
    const b14 = this.rows[0].y * this.rows[1].w * this.rows[2].z
      + this.rows[0].z * this.rows[1].y * this.rows[2].w
      + this.rows[0].w * this.rows[1].z * this.rows[2].y
      - this.rows[0].y * this.rows[1].z * this.rows[2].w
      - this.rows[0].z * this.rows[1].w * this.rows[2].y
      - this.rows[0].w * this.rows[1].y * this.rows[2].z;
    const b21 = this.rows[1].x * this.rows[2].w * this.rows[3].z
      + this.rows[1].z * this.rows[2].x * this.rows[3].w
      + this.rows[1].w * this.rows[2].z * this.rows[3].x
      - this.rows[1].x * this.rows[2].z * this.rows[3].w
      - this.rows[1].z * this.rows[2].w * this.rows[3].x
      - this.rows[1].w * this.rows[2].x * this.rows[3].z;
    const b22 = this.rows[0].x * this.rows[2].z * this.rows[3].w
      + this.rows[0].z * this.rows[2].w * this.rows[3].x
      + this.rows[0].w * this.rows[2].x * this.rows[3].z
      - this.rows[0].x * this.rows[2].w * this.rows[3].z
      - this.rows[0].z * this.rows[2].x * this.rows[3].w
      - this.rows[0].w * this.rows[2].z * this.rows[3].x;
    const b23 = this.rows[0].x * this.rows[1].w * this.rows[3].z
      + this.rows[0].z * this.rows[1].x * this.rows[3].w
      + this.rows[0].w * this.rows[1].z * this.rows[3].x
      - this.rows[0].x * this.rows[1].z * this.rows[3].w
      - this.rows[0].z * this.rows[1].w * this.rows[3].x
      - this.rows[0].w * this.rows[1].x * this.rows[3].z;
    const b24 = this.rows[0].x * this.rows[1].z * this.rows[2].w
      + this.rows[0].z * this.rows[1].w * this.rows[2].x
      + this.rows[0].w * this.rows[1].x * this.rows[2].z
      - this.rows[0].x * this.rows[1].w * this.rows[2].z
      - this.rows[0].z * this.rows[1].x * this.rows[2].w
      - this.rows[0].w * this.rows[1].z * this.rows[2].x;
    const b31 = this.rows[1].x * this.rows[2].y * this.rows[3].w
      + this.rows[1].y * this.rows[2].w * this.rows[3].x
      + this.rows[1].w * this.rows[2].x * this.rows[3].y
      - this.rows[1].x * this.rows[2].w * this.rows[3].y
      - this.rows[1].y * this.rows[2].x * this.rows[3].w
      - this.rows[1].w * this.rows[2].y * this.rows[3].x;
    const b32 = this.rows[0].x * this.rows[2].w * this.rows[3].y
      + this.rows[0].y * this.rows[2].x * this.rows[3].w
      + this.rows[0].w * this.rows[2].y * this.rows[3].x
      - this.rows[0].x * this.rows[2].y * this.rows[3].w
      - this.rows[0].y * this.rows[2].w * this.rows[3].x
      - this.rows[0].w * this.rows[2].x * this.rows[3].y;
    const b33 = this.rows[0].x * this.rows[1].y * this.rows[3].w
      + this.rows[0].y * this.rows[1].w * this.rows[3].x
      + this.rows[0].w * this.rows[1].x * this.rows[3].y
      - this.rows[0].x * this.rows[1].w * this.rows[3].y
      - this.rows[0].y * this.rows[1].x * this.rows[3].w
      - this.rows[0].w * this.rows[1].y * this.rows[3].x;
    const b34 = this.rows[0].x * this.rows[1].w * this.rows[2].y
      + this.rows[0].y * this.rows[1].x * this.rows[2].w
      + this.rows[0].w * this.rows[1].y * this.rows[2].x
      - this.rows[0].x * this.rows[1].y * this.rows[2].w
      - this.rows[0].y * this.rows[1].w * this.rows[2].x
      - this.rows[0].w * this.rows[1].x * this.rows[2].y;
    const b41 = this.rows[1].x * this.rows[2].z * this.rows[3].y
      + this.rows[1].y * this.rows[2].x * this.rows[3].z
      + this.rows[1].z * this.rows[2].y * this.rows[3].x
      - this.rows[1].x * this.rows[2].y * this.rows[3].z
      - this.rows[1].y * this.rows[2].z * this.rows[3].x
      - this.rows[1].z * this.rows[2].x * this.rows[3].y;
    const b42 = this.rows[0].x * this.rows[2].y * this.rows[3].z
      + this.rows[0].y * this.rows[2].z * this.rows[3].x
      + this.rows[0].z * this.rows[2].x * this.rows[3].y
      - this.rows[0].x * this.rows[2].z * this.rows[3].y
      - this.rows[0].y * this.rows[2].x * this.rows[3].z
      - this.rows[0].z * this.rows[2].y * this.rows[3].x;
    const b43 = this.rows[0].x * this.rows[1].z * this.rows[3].y
      + this.rows[0].y * this.rows[1].x * this.rows[3].z
      + this.rows[0].z * this.rows[1].y * this.rows[3].x
      - this.rows[0].x * this.rows[1].y * this.rows[3].z
      - this.rows[0].y * this.rows[1].z * this.rows[3].x
      - this.rows[0].z * this.rows[1].x * this.rows[3].y;
    const b44 = this.rows[0].x * this.rows[1].y * this.rows[2].z
      + this.rows[0].y * this.rows[1].z * this.rows[2].x
      + this.rows[0].z * this.rows[1].x * this.rows[2].y
      - this.rows[0].x * this.rows[1].z * this.rows[2].y
      - this.rows[0].y * this.rows[1].x * this.rows[2].z
      - this.rows[0].z * this.rows[1].y * this.rows[2].x;

    return new Mat4(
      b11, b12, b13, b14,
      b21, b22, b23, b24,
      b31, b32, b33, b34,
      b41, b42, b43, b44,
    );
  }

  determinant(): number {
    return this.rows[0].x * this.rows[1].y * this.rows[2].z * this.rows[3].w
      + this.rows[0].x * this.rows[1].z * this.rows[2].w * this.rows[3].y
      + this.rows[0].x * this.rows[1].w * this.rows[2].y * this.rows[3].z

      + this.rows[0].y * this.rows[1].x * this.rows[2].w * this.rows[3].z
      + this.rows[0].y * this.rows[1].z * this.rows[2].x * this.rows[3].x
      + this.rows[0].y * this.rows[1].w * this.rows[2].z * this.rows[3].x

      + this.rows[0].z * this.rows[1].x * this.rows[2].y * this.rows[3].w
      + this.rows[0].z * this.rows[1].y * this.rows[2].w * this.rows[3].x
      + this.rows[0].z * this.rows[1].w * this.rows[2].x * this.rows[3].y

      + this.rows[0].w * this.rows[1].x * this.rows[2].z * this.rows[3].y
      + this.rows[0].w * this.rows[1].y * this.rows[2].x * this.rows[3].z
      + this.rows[0].w * this.rows[1].z * this.rows[2].y * this.rows[3].x

      - this.rows[0].x * this.rows[1].y * this.rows[2].w * this.rows[3].z
      - this.rows[0].x * this.rows[1].z * this.rows[2].y * this.rows[3].w
      - this.rows[0].x * this.rows[1].w * this.rows[2].z * this.rows[3].y

      - this.rows[0].y * this.rows[1].x * this.rows[2].z * this.rows[3].w
      - this.rows[0].y * this.rows[1].z * this.rows[2].w * this.rows[3].x
      - this.rows[0].y * this.rows[1].w * this.rows[2].x * this.rows[3].z

      - this.rows[0].z * this.rows[1].x * this.rows[2].w * this.rows[3].y
      - this.rows[0].z * this.rows[1].y * this.rows[2].x * this.rows[3].w
      - this.rows[0].z * this.rows[1].w * this.rows[2].y * this.rows[3].x

      - this.rows[0].w * this.rows[1].x * this.rows[2].y * this.rows[3].z
      - this.rows[0].w * this.rows[1].y * this.rows[2].z * this.rows[3].x
      - this.rows[0].w * this.rows[1].z * this.rows[2].x * this.rows[3].y;
  }

  inverse(): Mat4 {
    return this.adjugate().mul((1 / this.determinant()));
  }

  /**
   * A method for defining a "look-at" matrix for a given position and target in
   * a right-handed coordinate system.
   *
   * This makes use of a change of basis.
   */
  static lookAt(eye: Vec3, target: Vec3, up = Vec3.unitY()): Mat4 {
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
