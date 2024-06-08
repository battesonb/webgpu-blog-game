import {Resource} from "../ec/resource";
import {Mat4} from "../math/mat4";

export class OrthographicProjection extends Resource {
  left: number;
  right: number;
  top: number;
  bottom: number;
  near: number;
  far: number;

  constructor(left: number, right: number, bottom: number, top: number, near: number, far: number) {
    super();
    this.right = right;
    this.left = left;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;
  }

  matrix(): Mat4 {
    let perspMatrix = Mat4.zero();

    perspMatrix.rows[0].x = 2 / (this.right - this.left);
    perspMatrix.rows[0].w = -(this.right + this.left) / (this.right - this.left);
    perspMatrix.rows[1].y = 2 / (this.top - this.bottom);
    perspMatrix.rows[1].w = -(this.top + this.bottom) / (this.top - this.bottom);
    perspMatrix.rows[2].z = -1 / (this.far - this.near);
    perspMatrix.rows[2].w = -this.near / (this.far - this.near);
    perspMatrix.rows[3].w = 1;

    return perspMatrix;
  }
}
