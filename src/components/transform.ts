import {Component} from "../ec/component";
import {Mat4} from "../math/mat4";
import {Vec3} from "../math/vec3";

export class Transform extends Component {
  position: Vec3 = Vec3.zero();
  /**
   * We could use quaternions or rotors, but I'm not doing any complex rotation
   * in this game.
   */
  rotation: Mat4 = Mat4.identity();
  scale: Vec3 = Vec3.fill(1);

  matrix(): Mat4 {
    return Mat4.translated(this.position)
      .mul(this.rotation)
      .mul(Mat4.scaled(this.scale));
  }
}
