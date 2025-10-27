import {assertDefined} from "../assertions";
import {Camera} from "../components/camera";
import {Transform} from "../components/transform";
import {SCREEN_HEIGHT, SCREEN_WIDTH} from "../config";
import {UpdateContext} from "../ec/component";
import {Resource} from "../ec/resource";
import {Mat4} from "../math/mat4";
import {Vec3} from "../math/vec3";
import {Vec4} from "../math/vec4";
import {RenderPipeline} from "../pipelines/render-pipeline";
import {OrthographicProjection} from "./orthographic-projection";
import {PerspectiveProjection} from "./perspective-projection";

/**
 * The frustum corners in NDC coordinates.
 */
const corners = [-1, 1].flatMap(x => [-1, 1].flatMap(y => [0, 1].map(z => new Vec4(x, y, z, 1))));

export class Renderer extends Resource {
  private _context?: GPUCanvasContext;
  private _device?: GPUDevice;
  private _uniformsBuffer?: GPUBuffer;

  private _depthSampler?: GPUSampler;
  private _nearestSampler?: GPUSampler;

  readonly canvas: HTMLCanvasElement;
  readonly canvasFormat: GPUTextureFormat;
  readonly pipelines: RenderPipeline[];

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

  constructor(completedCallback: (value: Renderer) => void) {
    super();

    this.lightDir = Vec3.unitY();
    this.lightView = Mat4.identity();
    this.lightViewProj = Mat4.identity();
    this.viewPos = Vec3.zero();
    this.viewProj = Mat4.identity();
    this.viewProjInv = Mat4.identity();
    this.lightProjection = new OrthographicProjection(-20, 20, -20, 20, 0.1, 500);
    this.frustumCorners = [];
    this.pipelines = [];

    this.canvas = document.querySelector("canvas")!;
    this.canvas.width = SCREEN_WIDTH;
    this.canvas.height = SCREEN_HEIGHT;

    this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();

    this.initialize().then(() => completedCallback(this)).catch(e => {
      throw e;
    });
  }

  async initialize() {
    assertDefined(navigator.gpu, "WebGPU is not supported on this browser");
    const adapter = await navigator.gpu.requestAdapter();
    assertDefined(adapter, "No appropriate GPUAdapter found");

    this._device = await adapter.requestDevice();

    this._context = this.canvas.getContext("webgpu")!;
    this._context.configure({
      device: this._device,
      format: this.canvasFormat,
    });

    const uniformsArray = this.uniforms();
    this._uniformsBuffer = this._device.createBuffer({
      label: "uniforms buffer",
      size: uniformsArray.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this._device.queue.writeBuffer(this._uniformsBuffer, 0, uniformsArray);

    this._depthSampler = this._device.createSampler({});

    this._nearestSampler = this._device.createSampler({
      minFilter: "nearest",
    });

  }

  preUpdate(ctx: UpdateContext): void {
    const {world} = ctx;

    const projection = world.getResource(PerspectiveProjection)!;
    const camera = world.getByName("camera")!;
    const cameraComp = camera.getComponent(Camera)!;
    const cameraTrans = camera.getComponent(Transform)!;
    this.viewPos = cameraTrans.position;
    this.viewProj = projection.matrix().mul(cameraComp.matrix());
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
    this.lightView = lightCamera.matrix();

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

    this.lightProjection = new OrthographicProjection(minX, maxX, minY, maxY, minZ, maxZ);
    this.lightViewProj = this.lightProjection.matrix().mul(this.lightView);
  }

  postUpdate(ctx: UpdateContext): void {
    const {world} = ctx;

    const uniformsArray = this.uniforms();
    this.device.queue.writeBuffer(this.uniformsBuffer, 0, uniformsArray);

    const encoder = this.device.createCommandEncoder();

    for (const pipeline of this.pipelines) {
      const pass = pipeline.prepare(encoder, ctx);
      const renderCtx = {pass, ...ctx};
      for (const entity of world.entities) {
        for (const component of entity.components) {
          component.render(renderCtx);
        }
      }
      pass.end();
    }

    const commandBuffer = encoder.finish();
    this.device.queue.submit([commandBuffer]);
  }

  get context(): GPUCanvasContext {
    return this._context!;
  }

  get device(): GPUDevice {
    return this._device!;
  }

  get uniformsBuffer(): GPUBuffer {
    return this._uniformsBuffer!;
  }

  get depthSampler(): GPUSampler {
    return this._depthSampler!;
  }

  get nearestSampler(): GPUSampler {
    return this._nearestSampler!;
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
