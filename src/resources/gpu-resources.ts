import {Camera} from "../components/camera";
import {Transform} from "../components/transform";
import {UpdateContext} from "../ec/component";
import {Resource} from "../ec/resource";
import {Mat4} from "../math/mat4";
import {OrthographicProjection} from "./orthographic-projection";
import {PerspectiveProjection} from "./perspective-projection";

export class GpuResources extends Resource {
  device: GPUDevice;
  texture: GPUTexture;
  lightProj: Mat4;
  viewProj: Mat4;
  viewProjInv: Mat4;

  constructor(device: GPUDevice, texture: GPUTexture) {
    super();
    this.device = device;
    this.texture = texture;
    this.lightProj = Mat4.identity();
    this.viewProj = Mat4.identity();
    this.viewProjInv = Mat4.identity();
  }

  preUpdate(ctx: UpdateContext): void {
    const {world} = ctx;

    const projection = world.getResource(PerspectiveProjection)!;
    const camera = world.getByName("camera")!;
    const cameraComp = camera.getComponent(Camera)!;
    const cameraTrans = camera.getComponent(Transform)!;
    this.viewProj = projection.matrix().mul(cameraComp.matrix(cameraTrans.position));
    this.viewProjInv = this.viewProj.inverse();

    const directionalLight = world.getByName("directionalLight")!;
    const lightProjection = directionalLight.getComponent(OrthographicProjection)!;
    const lightCamera = directionalLight.getComponent(Camera)!;
    const lightTrans = directionalLight.getComponent(Transform)!;
    this.lightProj = lightProjection.matrix().mul(lightCamera.matrix(lightTrans.position));
  }

  uniforms(): Float32Array {
    const viewProj = this.viewProj.buffer();
    const lightProj = this.lightProj.buffer();
    const result = new Float32Array(viewProj.length + lightProj.length);

    result.set(viewProj);
    result.set(lightProj, viewProj.length);

    return result;
  }
}
