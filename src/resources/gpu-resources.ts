import {Camera} from "../components/camera";
import {Transform} from "../components/transform";
import {UpdateContext} from "../ec/component";
import {Resource} from "../ec/resource";
import {Mat4} from "../math/mat4";
import {Projection} from "./projection";

export class GpuResources extends Resource {
  device: GPUDevice;
  texture: GPUTexture;
  viewProj: Mat4;
  viewProjInv: Mat4;

  constructor(device: GPUDevice, texture: GPUTexture) {
    super();
    this.device = device;
    this.texture = texture;
    this.viewProj = Mat4.identity();
    this.viewProjInv = Mat4.identity();
  }

  preUpdate(ctx: UpdateContext): void {
    const {world} = ctx;
    const projection = world.getResource(Projection)!;
    const camera = world.getByName("camera")!;
    const cameraComp = camera.getComponent(Camera)!;
    const cameraTrans = camera.getComponent(Transform)!;
    this.viewProj = projection.matrix().mul(cameraComp.matrix(cameraTrans.position));
    this.viewProjInv = this.viewProj.inverse();
  }
}
