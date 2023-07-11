import {assertDefined} from "./assertions";
import "./style.css";
import shaderSource from "./shader.wgsl?raw";
import {createDepthTexture, uvFromIndex, webGpuTextureFromUrl} from "./texture";
import {Camera} from "./camera";
import {Vec3} from "./math/vec3";
import {Projection} from "./projection";
import {toRadians} from "./math/helpers";
import {SCREEN_HEIGHT, SCREEN_WIDTH} from "./config";
import {Mat4} from "./math/mat4";

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

const camera = new Camera(new Vec3(0, 5, 5));
camera.pitch = -Math.PI / 4;
const projection = new Projection(SCREEN_WIDTH, SCREEN_HEIGHT, toRadians(35), 0.1, 100);
const viewProj = projection.matrix().mul(camera.matrix());

const texture = await webGpuTextureFromUrl(device, "./tileset.png");

const playerDesc = [
  [-0.5, -0.5, 0, 0.0, 1.0, 6],
  [0.5, -0.5, 0, 1.0, 1.0, 6],
  [0.5, 0.5, 0, 1.0, 0.0, 6],
  [-0.5, 0.5, 0, 0.0, 0.0, 6],
];

const playerVertices = new Float32Array(playerDesc.map(values => {
  return [values[0], values[1], values[2], ...uvFromIndex(values[5], values[3], values[4], texture)];
}).flat());

const playerVertexBuffer = device.createBuffer({
  label: "player vertex buffer",
  size: playerVertices.buffer.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
});

device.queue.writeBuffer(playerVertexBuffer, 0, playerVertices);

const playerPlanes = playerDesc.length / 4;
const playerIndices = new Uint32Array(Array.from({length: playerPlanes}).map((_, i) => ([
  0, 1, 2, 0, 2, 3
]).map(x => x + i * 4)).flat());

const playerIndexBuffer = device.createBuffer({
  label: "player index buffer",
  size: playerIndices.buffer.byteLength,
  usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(playerIndexBuffer, 0, playerIndices);

const playerInstance = new Float32Array(Mat4.identity().buffer());
const playerInstanceBuffer = device.createBuffer({
  label: "player instance buffer",
  size: playerInstance.buffer.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(playerInstanceBuffer, 0, playerInstance);

const cubeDesc = [
  // x, y, z, u, v, atlas index
  // front
  [-0.5, -0.5, 0.5, 0.0, 1.0, 3],
  [0.5, -0.5, 0.5, 1.0, 1.0, 3],
  [0.5, 0.5, 0.5, 1.0, 0.0, 3],
  [-0.5, 0.5, 0.5, 0.0, 0.0, 3],

  // back
  [0.5, -0.5, -0.5, 0.0, 1.0, 3],
  [-0.5, -0.5, -0.5, 1.0, 1.0, 3],
  [-0.5, 0.5, -0.5, 1.0, 0.0, 3],
  [0.5, 0.5, -0.5, 0.0, 0.0, 3],

  // right
  [0.5, -0.5, 0.5, 0.0, 1.0, 3],
  [0.5, -0.5, -0.5, 1.0, 1.0, 3],
  [0.5, 0.5, -0.5, 1.0, 0.0, 3],
  [0.5, 0.5, 0.5, 0.0, 0.0, 3],

  // left
  [-0.5, -0.5, -0.5, 0.0, 1.0, 3],
  [-0.5, -0.5, 0.5, 1.0, 1.0, 3],
  [-0.5, 0.5, 0.5, 1.0, 0.0, 3],
  [-0.5, 0.5, -0.5, 0.0, 0.0, 3],

  // top
  [-0.5, 0.5, 0.5, 0.0, 1.0, 2],
  [0.5, 0.5, 0.5, 1.0, 1.0, 2],
  [0.5, 0.5, -0.5, 1.0, 0.0, 2],
  [-0.5, 0.5, -0.5, 0.0, 0.0, 2],
];

const cubeVertices = new Float32Array(cubeDesc.map(values => {
  return [values[0], values[1], values[2], ...uvFromIndex(values[5], values[3], values[4], texture)];
}).flat());

const cubeVertexBuffer = device.createBuffer({
  label: "cube vertex buffer",
  size: cubeVertices.buffer.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
});

device.queue.writeBuffer(cubeVertexBuffer, 0, cubeVertices);

const cubePlanes = cubeDesc.length / 4;
const cubeIndices = new Uint32Array(Array.from({length: cubePlanes}).map((_, i) => ([
  0, 1, 2, 0, 2, 3
]).map(x => x + i * 4)).flat());

const cubeIndexBuffer = device.createBuffer({
  label: "cube index buffer",
  size: cubeIndices.buffer.byteLength,
  usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(cubeIndexBuffer, 0, cubeIndices);

const cubeInstance = new Float32Array(Mat4.identity().buffer());
const cubeInstanceBuffer = device.createBuffer({
  label: "cube instance buffer",
  size: cubeInstance.buffer.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(cubeInstanceBuffer, 0, cubeInstance);

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

function eventLoop() {
  const now = performance.now();
  const encoder = device.createCommandEncoder();
  const radius = 5;
  const angle = now / 1000;
  projection.fovY = toRadians(60 + (30 * Math.cos(now / 2000)));
  camera.position.x = Math.sin(angle) * radius;
  camera.position.z = Math.cos(angle) * radius;
  camera.yaw = angle;
  const viewProj = projection.matrix().mul(camera.matrix());

  const uniformsArray = viewProj.buffer();
  device.queue.writeBuffer(uniformsBuffer, 0, uniformsArray);

  const playerInstance = new Float32Array(
    Mat4.translated(new Vec3(0, 1, 0))
      .mul(Mat4.scaled(Vec3.fill(0.8)))
      .mul(Mat4
        .lookAt(Vec3.zero(), camera.position))
      .buffer()
  );
  device.queue.writeBuffer(playerInstanceBuffer, 0, playerInstance);

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
    {
      pass.setVertexBuffer(0, cubeVertexBuffer);
      pass.setVertexBuffer(1, cubeInstanceBuffer);
      pass.setIndexBuffer(cubeIndexBuffer, "uint32");
      pass.drawIndexed(cubeIndices.length, 1);
    }
    {
      pass.setVertexBuffer(0, playerVertexBuffer);
      pass.setVertexBuffer(1, playerInstanceBuffer);
      pass.setIndexBuffer(playerIndexBuffer, "uint32");
      pass.drawIndexed(playerIndices.length, 1);
    }

    pass.end();
  }

  {
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }

  requestAnimationFrame(eventLoop);
}

requestAnimationFrame(eventLoop);

export {};
