import shaderSource from "./shadows.wgsl?raw";
import {Renderer} from "../resources/renderer";
import {RenderPipeline} from "./render-pipeline";
import {Textures} from "../resources/textures";
import {UpdateContext} from "../ec/component";
import {World} from "../ec/world";
import {Mesh} from "../mesh";

export class ShadowPipeline extends RenderPipeline {
  private _bindGroupLayout?: GPUBindGroupLayout;
  private _bindGroup?: GPUBindGroup;
  private _pipelineLayout?: GPUPipelineLayout;
  private _pipeline?: GPURenderPipeline;

  constructor(world: World) {
    super();
    const renderer = world.getResource(Renderer)!;
    const textures = world.getResource(Textures)!;

    this._bindGroupLayout = renderer.device.createBindGroupLayout({
      label: "shadow bind group layout",
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
      ],
    });


    this._pipelineLayout = renderer.device.createPipelineLayout({
      label: "shadow pipeline layout",
      bindGroupLayouts: [this._bindGroupLayout],
    });

    const shaderModule = renderer.device.createShaderModule({
      label: "shadow shader module",
      code: shaderSource,
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
        targets: [],
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
        cullMode: "none",
      },
    });

  }

  prepare(encoder: GPUCommandEncoder, ctx: UpdateContext): GPURenderPassEncoder {
    const {world} = ctx;
    const textures = world.getResource(Textures)!;

    const pass = encoder.beginRenderPass({
      label: "shadow",
      colorAttachments: [],
      depthStencilAttachment: {
        view: textures.view("shadow_depth"),
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
