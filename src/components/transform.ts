import {Component} from "../ec/component";
import {Mat4} from "../math/mat4";
import { Rotor3 } from "../math/rotor3";
import {Vec3} from "../math/vec3";

export class Transform extends Component {
  position: Vec3 = Vec3.zero();
  rotation: Rotor3 = Rotor3.identity();
  scale: Vec3 = Vec3.fill(1);

  matrix(): Mat4 {
    return Mat4.translated(this.position)
      .mul(this.rotation.matrix())
      .mul(Mat4.scaled(this.scale));
  }
}
