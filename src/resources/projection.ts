import {Resource} from "../ec/resource";
import {Mat4} from "../math/mat4";

export class Projection extends Resource {
  width: number;
  height: number;
  fovY: number;
  near: number;
  far: number;

  constructor(width: number, height: number, fovYRadians: number, near: number, far: number) {
    super();
    this.width = width;
    this.height = height;
    this.fovY = fovYRadians;
    this.near = near;
    this.far = far;
  }

  matrix(): Mat4 {
    let perspMatrix = Mat4.zero();
    const aspect = this.width / this.height;
    const tan = Math.tan(this.fovY / 2);
    perspMatrix.rows[0].x = 1 / (aspect * tan);
    perspMatrix.rows[1].y = 1 / tan;
    perspMatrix.rows[2].z = this.far / (this.near - this.far);
    perspMatrix.rows[2].w = this.far * this.near / (this.near - this.far);
    perspMatrix.rows[3].z = -1;
    return perspMatrix;
  }
}
