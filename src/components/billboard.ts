import {Component, InitContext, UpdateContext} from "../ec/component";
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
    const cameraDir = cameraComponent.dir().neg();
    // Make the entity's up the same as the camera's up.
    const orientor = cameraComponent.up().mul(Vec3.unitY());
    // Determine the new direction of the entity. This would be z+ before the orientor rotor is
    // applied.
    const entityDir = orientor.sandwich(Vec3.unitZ());
    // Now face the entity, after the up-orientation rotation, towards the camera.
    const facer = cameraDir.mul(entityDir);
    // Rotors are sandwiched after being composed, so orientor is applied first, then facer.
    transform.rotation = facer.mul(orientor);
  }
}
