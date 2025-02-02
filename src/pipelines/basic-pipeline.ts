import shaderSource from "./basic.wgsl?raw";
import {Renderer} from "../resources/renderer";
import {RenderPipeline} from "./render-pipeline";
import {Textures} from "../resources/textures";
import {UpdateContext} from "../ec/component";
import {World} from "../ec/world";
import {Mesh} from "../mesh";

export class BasicPipeline extends RenderPipeline {
  private _bindGroupLayout?: GPUBindGroupLayout;
  private _bindGroup?: GPUBindGroup;
  private _pipelineLayout?: GPUPipelineLayout;
  private _pipeline?: GPURenderPipeline;

  constructor(world: World) {
    super();
    const renderer = world.getResource(Renderer)!;
    const textures = world.getResource(Textures)!;

    const shaderModule = renderer.device.createShaderModule({
      label: "shader module",
      code: shaderSource,
    });

    this._bindGroupLayout = renderer.device.createBindGroupLayout({
      label: "bind group layout",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
          buffer: {
            type: "uniform"
          },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {},
        },
        // Texture atlas
        {
          binding: 2,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {},
        },
        // Normal texture
        {
          binding: 3,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {},
        },
        // Gloss texture
        {
          binding: 4,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {},
        },
        {
          binding: 5,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: {
            type: "non-filtering",
          },
        },
        // Shadow map
        {
          binding: 6,
          visibility: GPUShaderStage.FRAGMENT,
          texture: {
            sampleType: "depth",
          },
        },
      ]
    });

    this._bindGroup = renderer.device.createBindGroup({
      label: "bind group",
      layout: this._bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {buffer: renderer.uniformsBuffer},
        },
        {
          binding: 1,
          resource: renderer.nearestSampler,
        },
        {
          binding: 2,
          resource: textures.view("tileset"),
        },
        {
          binding: 3,
          resource: textures.view("tileset_normal"),
        },
        {
          binding: 4,
          resource: textures.view("tileset_gloss"),
        },
        {
          binding: 5,
          resource: renderer.depthSampler,
        },
        {
          binding: 6,
          resource: textures.view("shadow_depth"),
        },
      ],
    });

    this._pipelineLayout = renderer.device.createPipelineLayout({
      label: "pipeline layout",
      bindGroupLayouts: [this._bindGroupLayout],
    });

    this._pipeline = renderer.device.createRenderPipeline({
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [Mesh.vertexBufferLayout, Mesh.instanceBufferLayout],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [{format: renderer.canvasFormat}]
      },
      layout: this._pipelineLayout,
      depthStencil: {
        depthCompare: "less",
        depthWriteEnabled: true,
        format: "depth32float",
      },
      primitive: {
        topology: "triangle-list",
        frontFace: "ccw",
        cullMode: "back",
      },
    });

  }

  prepare(encoder: GPUCommandEncoder, ctx: UpdateContext): GPURenderPassEncoder {
    const {world} = ctx;
    const renderer = world.getResource(Renderer)!;
    const textures = world.getResource(Textures)!;

    const pass = encoder.beginRenderPass({
      label: "render",
      colorAttachments: [{
        view: renderer.context.getCurrentTexture().createView(),
        storeOp: "store",
        clearValue: [0.54, 0.7, 1.0, 1.0],
        loadOp: "clear",
      }],
      depthStencilAttachment: {
        view: textures.view("depth"),
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });

    pass.setPipeline(this._pipeline!);
    pass.setBindGroup(0, this._bindGroup!);

    return pass;
  }
}
