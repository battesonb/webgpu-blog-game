import {Camera} from "../components/camera";
import {Transform} from "../components/transform";
import {UpdateContext} from "../ec/component";
import {Resource} from "../ec/resource";
import {Mat4} from "../math/mat4";
import {Vec3} from "../math/vec3";
import {Vec4} from "../math/vec4";
import {OrthographicProjection} from "./orthographic-projection";
import {PerspectiveProjection} from "./perspective-projection";

/**
 * The frustum corners in NDC coordinates.
 */
const corners = [
  new Vec4(-1, -1, 0, 1),
  new Vec4(1, -1, 0, 1),
  new Vec4(1, 1, 0, 1),
  new Vec4(-1, 1, 0, 1),
  new Vec4(-1, -1, 1, 1),
  new Vec4(1, -1, 1, 1),
  new Vec4(1, 1, 1, 1),
  new Vec4(-1, 1, 1, 1),
];

export class GpuResources extends Resource {
  device: GPUDevice;
  texture: GPUTexture;
  lightDir: Vec3;
  lightView: Mat4;
  lightViewProj: Mat4;
  viewPos: Vec3;
  viewProj: Mat4;
  viewProjInv: Mat4;
  lightProjection: OrthographicProjection;
  /**
   * The frustum corners in world-space coordinates.
   */
  frustumCorners: Vec3[];

  constructor(device: GPUDevice, texture: GPUTexture) {
    super();
    this.device = device;
    this.texture = texture;
    this.lightDir = Vec3.unitY();
    this.lightView = Mat4.identity();
    this.lightViewProj = Mat4.identity();
    this.viewPos = Vec3.zero();
    this.viewProj = Mat4.identity();
    this.viewProjInv = Mat4.identity();
    this.lightProjection = new OrthographicProjection(-20, 20, -20, 20, 0.1, 500);
    this.frustumCorners = [];
  }

  preUpdate(ctx: UpdateContext): void {
    const {world} = ctx;

    const projection = world.getResource(PerspectiveProjection)!;
    const camera = world.getByName("camera")!;
    const cameraComp = camera.getComponent(Camera)!;
    const cameraTrans = camera.getComponent(Transform)!;
    this.viewPos = cameraTrans.position;
    this.viewProj = projection.matrix().mul(cameraComp.matrix(cameraTrans.position));
    this.viewProjInv = this.viewProj.inverse();

    const frustumCorners = corners.map(corner => {
      let worldPos = this.viewProjInv.mul(corner);
      return worldPos;
    });

    // Set the light's position to the center of the view frustum
    const directionalLight = world.getByName("directionalLight")!;
    const lightCamera = directionalLight.getComponent(Camera)!;
    const lightTransform = directionalLight.getComponent(Transform)!;
    this.lightDir = lightCamera.dir();

    const total = frustumCorners.reduce((acc, curr) => acc.add(curr), Vec4.zero());
    const average = total.div(frustumCorners.length);
    lightTransform.position = new Vec3(average.x, average.y, average.z);
    this.lightView = lightCamera.matrix(lightTransform.position);

    let minX = Number.MAX_VALUE;
    let minY = Number.MAX_VALUE;
    let minZ = Number.MAX_VALUE;
    let maxX = -Number.MAX_VALUE;
    let maxY = -Number.MAX_VALUE;
    let maxZ = -Number.MAX_VALUE;

    frustumCorners.forEach(corner => {
      let lightPos = this.lightView.mul(corner);
      lightPos = lightPos.div(lightPos.w);

      minX = Math.min(minX, lightPos.x);
      minY = Math.min(minY, lightPos.y);
      minZ = Math.min(minZ, lightPos.z);
      maxX = Math.max(maxX, lightPos.x);
      maxY = Math.max(maxY, lightPos.y);
      maxZ = Math.max(maxZ, lightPos.z);
    });

    this.lightProjection = new OrthographicProjection(minX, maxX, minY, maxY, -1 * maxZ, -1 * minZ);
    this.lightViewProj = this.lightProjection.matrix().mul(this.lightView);
  }

  uniforms(): Float32Array {
    const viewProj = this.viewProj.buffer();
    const lightProj = this.lightViewProj.buffer();
    const lightDir = this.lightDir.buffer();
    const viewPos = this.viewPos.buffer();
    const result = new Float32Array(viewProj.length + lightProj.length + lightDir.length + viewPos.length);

    result.set(viewProj);
    result.set(lightProj, viewProj.length);
    result.set(lightDir, viewProj.length + lightProj.length);
    result.set(viewPos, viewProj.length + lightProj.length + lightDir.length);

    return result;
  }
}
