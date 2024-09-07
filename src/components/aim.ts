import {Component, InitContext, UpdateContext} from "../ec/component";
import {Mat4} from "../math/mat4";
import {Vec3} from "../math/vec3";
import {Transform} from "./transform";

export class Aim extends Component {
  dir: Vec3;
  readonly targetName: string;
  private _transform?: Transform;

  constructor(targetName: string) {
    super();
    this.dir = Vec3.unitX();
    this.targetName = targetName;
  }

  init(_ctx: InitContext): void {
    this._transform = this.getComponent(Transform);
  }

  update(ctx: UpdateContext): void {
    const {world} = ctx;
    const target = world.getByName(this.targetName);
    if (!target) {
      return;
    }

    const targetTransform = target.getComponent(Transform);
    if (!targetTransform) {
      return;
    }

    this.dir = targetTransform.position.sub(this._transform!.position).normal();
    // The look at matrix parameters are swapped so that we get the same view
    // matrix as the camera (which looks down its negative z). This is because
    // the projection matrices in this game engine expect a view matrix
    // constructed with the assumption of looking down negative z. In other
    // words, we want the right-hand direction from the target to the camera.
    this._transform!.rotation = Mat4.lookAt(targetTransform.position, this._transform!.position);
  }
}
