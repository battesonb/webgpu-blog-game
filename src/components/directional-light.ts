import {Component, InitContext, UpdateContext} from "../ec/component";
import {toRadians} from "../math/helpers";
import {Input} from "../resources/input";
import { Camera } from "./camera";

/**
 * A small component to dynamically move the directional light.
 */
export class DirectionalLight extends Component {
  private _camera?: Camera;

  init(_ctx: InitContext): void {
    this._camera = this.getComponent(Camera);
  }

  update(ctx: UpdateContext): void {
    const {world} = ctx;
    const input = world.getResource(Input)!;
    this._camera!.pitch = -Math.min(Math.PI / 2, 1 / (2 * input.mousePosition.magnitude()));
    this._camera!.yaw = input.mousePosition.angle() - toRadians(135);
  }
}
