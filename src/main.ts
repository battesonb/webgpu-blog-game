import {assertDefined} from "./assertions";
import "./style.css";
import shaderSource from "./shader.wgsl?raw";
import {createDepthTexture, webGpuTextureFromUrl} from "./texture";
import {Projection} from "./projection";
import {toRadians} from "./math/helpers";
import {SCREEN_HEIGHT, SCREEN_WIDTH} from "./config";
import {GpuResources} from "./resources/gpu-resources";
import {World} from "./ec/world";
import {newCamera} from "./entities/camera";
import {newPlayer} from "./entities/player";
import {Camera} from "./components/camera";
import {Transform} from "./components/transform";
import {newTerrain} from "./entities/terrain";
import {Input} from "./resources/input";

const canvas = document.querySelector("canvas")!;
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

assertDefined(navigator.gpu, "WebGPU is not supported on this browser");
const adapter = await navigator.gpu.requestAdapter();
assertDefined(adapter, "No appropriate GPUAdapter found");

const device = await adapter.requestDevice();

const context = canvas.getContext("webgpu")!;
const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
  device,
  format: canvasFormat,
});

const projection = new Projection(SCREEN_WIDTH, SCREEN_HEIGHT, toRadians(35), 0.1, 100);
const viewProj = projection.matrix();

const texture = await webGpuTextureFromUrl(device, "./tileset.png");

const vertexBufferLayout: GPUVertexBufferLayout = {
  stepMode: "vertex",
  arrayStride: 20,
  attributes: [
    { // pos
      format: "float32x3",
      offset: 0,
      shaderLocation: 0,
    },
    { // uv
      format: "float32x2",
      offset: 12,
      shaderLocation: 1,
    }
  ],
};

const instanceBufferLayout: GPUVertexBufferLayout = {
  stepMode: "instance",
  arrayStride: 64,
  attributes: [
    {
      // column #1
      format: "float32x4",
      offset: 0,
      shaderLocation: 3,
    },
    {
      // column #2
      format: "float32x4",
      offset: 16,
      shaderLocation: 4,
    },
    {
      // column #3
      format: "float32x4",
      offset: 32,
      shaderLocation: 5,
    },
    {
      // column #4
      format: "float32x4",
      offset: 48,
      shaderLocation: 6,
    },
  ],
};

const bindGroupLayout = device.createBindGroupLayout({
  label: "bind group layout",
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      texture: {},
    },
    {
      binding: 1,
      visibility: GPUShaderStage.FRAGMENT,
      sampler: {},
    },
    {
      binding: 2,
      visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
      buffer: {
        type: "uniform"
      },
    }
  ]
});

const pipelineLayout = device.createPipelineLayout({
  label: "pipeline layout",
  bindGroupLayouts: [bindGroupLayout],
});

const shaderModule = device.createShaderModule({
  label: "shader module",
  code: shaderSource,
});

const pipeline = device.createRenderPipeline({
  vertex: {
    module: shaderModule,
    entryPoint: "vertexMain",
    buffers: [vertexBufferLayout, instanceBufferLayout],
  },
  fragment: {
    module: shaderModule,
    entryPoint: "fragmentMain",
    targets: [{format: canvasFormat}]
  },
  layout: pipelineLayout,
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

const sampler = device.createSampler({
  minFilter: "nearest",
});

const view = texture.createView({
  baseMipLevel: 0,
  mipLevelCount: 1,
});

const depthTexture = await createDepthTexture(device, SCREEN_WIDTH, SCREEN_HEIGHT);
const depthView = depthTexture.createView();

const uniformsArray = viewProj.buffer();
const uniformsBuffer = device.createBuffer({
  label: "uniforms buffer",
  size: uniformsArray.byteLength,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(uniformsBuffer, 0, uniformsArray);

const bindGroup = device.createBindGroup({
  label: "bind group",
  layout: bindGroupLayout,
  entries: [
    {
      binding: 0,
      resource: view,
    },
    {
      binding: 1,
      resource: sampler,
    },
    {
      binding: 2,
      resource: {buffer: uniformsBuffer},
    }
  ],
});

const gpuResources = new GpuResources(device, texture);
const world = new World();
world
  .withResourceDefault(Input)
  .withResource(gpuResources);

world.addEntities(
  newCamera(),
  newPlayer(world),
  newTerrain(world),
);

function update(now: number) {
  const dt = (now - lastTime) / 1000;
  world.update({
    now,
    dt,
    world,
  });
}

function render(now: number) {
  const dt = (now - lastTime) / 1000;
  const camera = world.getByName("camera");
  assertDefined(camera, "Camera not found");
  const cameraComponent = camera.getComponent(Camera)!;
  const camTransform = camera.getComponent(Transform)!;
  const viewProj = projection.matrix().mul(cameraComponent.matrix(camTransform.position));

  const uniformsArray = viewProj.buffer();
  device.queue.writeBuffer(uniformsBuffer, 0, uniformsArray);

  const encoder = device.createCommandEncoder();
  {
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        storeOp: "store",
        clearValue: [0.54, 0.7, 1.0, 1.0],
        loadOp: "clear",
      }],
      depthStencilAttachment: {
        view: depthView,
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);

    world.render({
      dt,
      pass,
    });

    pass.end();
  }

  {
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }
}

let lastTime = performance.now();
function eventLoop() {
  let now = performance.now();

  update(now)
  render(now);

  lastTime = now;

  requestAnimationFrame(eventLoop);
}

// Kick things off
requestAnimationFrame(eventLoop);

export {};
