import {Component, InitContext, UpdateContext} from "../ec/component";
import {Mat4} from "../math/mat4";
import {Vec3} from "../math/vec3";
import {Camera} from "./camera";
import {Transform} from "./transform";

export class Billboard extends Component {
  init(_ctx: InitContext): void {
    const transform = this.getComponent(Transform)!;
    transform.scale = Vec3.fill(0.8);
  }

  update(ctx: UpdateContext): void {
    const {world} = ctx;
    const transform = this.getComponent(Transform)!;
    const camera = world.getByName("camera")!;
    const cameraComponent = camera.getComponent(Camera)!;
    transform.rotation = Mat4.lookAt(Vec3.zero(), cameraComponent.dir().neg());
  }
}
