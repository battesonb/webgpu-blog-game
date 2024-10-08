import {assertDefined} from "./assertions";
import "./style.css";
import shaderSource from "./shader.wgsl?raw";
import shadowShaderSource from "./shadows.wgsl?raw";
import {createDepthTexture, webGpuTextureFromUrl} from "./texture";
import {PerspectiveProjection} from "./resources/perspective-projection";
import {toRadians} from "./math/helpers";
import {DEPTH_TEXTURE_SIZE, SCREEN_HEIGHT, SCREEN_WIDTH} from "./config";
import {GpuResources} from "./resources/gpu-resources";
import {World} from "./ec/world";
import {newCamera} from "./entities/camera";
import {newPlayer} from "./entities/player";
import {newTerrain} from "./entities/terrain";
import {Input} from "./resources/input";
import {newSpawner} from "./entities/spawner";
import {newDirectionalLight} from "./entities/directional-light";

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

const projection = new PerspectiveProjection(SCREEN_WIDTH, SCREEN_HEIGHT, toRadians(35), 0.1, 225);

const tileset = await webGpuTextureFromUrl(device, "./tileset.png");
const tilesetNormal = await webGpuTextureFromUrl(device, "./tileset_normal.png");
const tilesetGloss = await webGpuTextureFromUrl(device, "./tileset_gloss.png");

const vertexBufferLayout: GPUVertexBufferLayout = {
  stepMode: "vertex",
  arrayStride: 68,
  attributes: [
    { // pos
      format: "float32x3",
      offset: 0,
      shaderLocation: 0,
    },
    { // normal
      format: "float32x3",
      offset: 12,
      shaderLocation: 1,
    },
    { // tangent
      format: "float32x3",
      offset: 24,
      shaderLocation: 2,
    },
    { // bitangent
      format: "float32x3",
      offset: 36,
      shaderLocation: 3,
    },
    { // uv
      format: "float32x2",
      offset: 48,
      shaderLocation: 4,
    },
    { // color
      format: "float32x3",
      offset: 56,
      shaderLocation: 5,
    }
  ],
};

const instanceBufferLayout: GPUVertexBufferLayout = {
  stepMode: "instance",
  arrayStride: 128,
  attributes: [
    // Model matrix
    {
      // column #1
      format: "float32x4",
      offset: 0,
      shaderLocation: 6,
    },
    {
      // column #2
      format: "float32x4",
      offset: 16,
      shaderLocation: 7,
    },
    {
      // column #3
      format: "float32x4",
      offset: 32,
      shaderLocation: 8,
    },
    {
      // column #4
      format: "float32x4",
      offset: 48,
      shaderLocation: 9,
    },
    // Model inverse tranpose matrix
    {
      // column #1
      format: "float32x4",
      offset: 64,
      shaderLocation: 10,
    },
    {
      // column #2
      format: "float32x4",
      offset: 80,
      shaderLocation: 11,
    },
    {
      // column #3
      format: "float32x4",
      offset: 96,
      shaderLocation: 12,
    },
    {
      // column #4
      format: "float32x4",
      offset: 112,
      shaderLocation: 13,
    },
  ],
};

const bindGroupLayout = device.createBindGroupLayout({
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
      sampler: {},
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

const shadowBindGroupLayout = device.createBindGroupLayout({
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
  ]
});

const pipelineLayout = device.createPipelineLayout({
  label: "pipeline layout",
  bindGroupLayouts: [bindGroupLayout],
});

const shadowPipelineLayout = device.createPipelineLayout({
  label: "shadow pipeline layout",
  bindGroupLayouts: [shadowBindGroupLayout],
});

const shaderModule = device.createShaderModule({
  label: "shader module",
  code: shaderSource,
});

const shadowShaderModule = device.createShaderModule({
  label: "shadow shader module",
  code: shadowShaderSource,
});

const shadowPipeline = device.createRenderPipeline({
  vertex: {
    module: shadowShaderModule,
    entryPoint: "vertexMain",
    buffers: [vertexBufferLayout, instanceBufferLayout],
  },
  fragment: {
    module: shadowShaderModule,
    entryPoint: "fragmentMain",
    targets: [],
  },
  layout: shadowPipelineLayout,
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

const tilesetView = tileset.createView({
  baseMipLevel: 0,
  mipLevelCount: 1,
});

const tilesetNormalView = tilesetNormal.createView({
  baseMipLevel: 0,
  mipLevelCount: 1,
});

const tilesetGlossView = tilesetGloss.createView({
  baseMipLevel: 0,
  mipLevelCount: 1,
});

const shadowDepthTexture = await createDepthTexture(device, DEPTH_TEXTURE_SIZE, DEPTH_TEXTURE_SIZE);
const shadowDepthView = shadowDepthTexture.createView();
const shadowDepthSampler = device.createSampler({
  magFilter: "linear",
  minFilter: "linear",
});

const depthTexture = await createDepthTexture(device, SCREEN_WIDTH, SCREEN_HEIGHT);
const depthView = depthTexture.createView();

const gpuResources = new GpuResources(device, tileset);

const uniformsArray = gpuResources.uniforms();
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
      resource: {buffer: uniformsBuffer},
    },
    {
      binding: 1,
      resource: sampler,
    },
    {
      binding: 2,
      resource: tilesetView,
    },
    {
      binding: 3,
      resource: tilesetNormalView,
    },
    {
      binding: 4,
      resource: tilesetGlossView,
    },
    {
      binding: 5,
      resource: shadowDepthSampler,
    },
    {
      binding: 6,
      resource: shadowDepthView,
    },
  ],
});

const shadowBindGroup = device.createBindGroup({
  label: "bind group",
  layout: shadowBindGroupLayout,
  entries: [
    {
      binding: 0,
      resource: {buffer: uniformsBuffer},
    },
    {
      binding: 1,
      resource: sampler,
    },
    {
      binding: 2,
      resource: tilesetView,
    },
  ],
});

const world = new World();
const input = new Input(canvas);
world
  .withResource(projection)
  .withResource(gpuResources)
  .withResource(input);

world.addEntities(
  newCamera(),
  newDirectionalLight(),
  ...newPlayer(world),
  newTerrain(),
  newSpawner(),
);

let pause = false;
function update(now: number) {
  const dt = (now - lastTime) / 1000;
  if (input.keyReleased("p")) {
    pause = !pause;
  }
  world.update({
    now,
    dt: pause ? 0 : dt,
    world,
  });
}

function render(now: number) {
  const dt = (now - lastTime) / 1000;
  const gpuResources = world.getResource(GpuResources)!;
  const uniformsArray = gpuResources.uniforms();
  device.queue.writeBuffer(uniformsBuffer, 0, uniformsArray);

  const encoder = device.createCommandEncoder();

  // shadow map pass
  {
    const pass = encoder.beginRenderPass({
      label: "shadow",
      colorAttachments: [],
      depthStencilAttachment: {
        view: shadowDepthView,
        depthClearValue: 1,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    });

    pass.setPipeline(shadowPipeline);
    pass.setBindGroup(0, shadowBindGroup);

    world.render({
      dt,
      pass,
    });

    pass.end();
  }

  // render pass
  {
    const pass = encoder.beginRenderPass({
      label: "render",
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

  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
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
