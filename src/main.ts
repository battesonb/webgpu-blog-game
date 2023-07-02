import {assertDefined} from "./assertions";
import "./style.css";
import shaderSource from "./shader.wgsl?raw";
import {uvFromIndex, webGpuTextureFromUrl} from "./texture";

const canvas = document.querySelector("canvas")!;

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

const texture = await webGpuTextureFromUrl(device, "./tileset.png");

const vertices = new Float32Array([
  // x, y, u, v
  -0.5, -0.5, ...uvFromIndex(3, 0.0, 1.0, texture),
  0.5, -0.5, ...uvFromIndex(3, 1.0, 1.0, texture),
  0.5, 0.5, ...uvFromIndex(3, 1.0, 0.0, texture),
  -0.5, 0.5, ...uvFromIndex(3, 0.0, 0.0, texture),
]);

const vertexBuffer = device.createBuffer({
  label: "vertex buffer",
  size: vertices.buffer.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
});

device.queue.writeBuffer(vertexBuffer, 0, vertices);

const indices = new Uint32Array([
  0, 1, 2, 0, 2, 3
]);

const indexBuffer = device.createBuffer({
  label: "index buffer",
  size: indices.buffer.byteLength,
  usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
});

device.queue.writeBuffer(indexBuffer, 0, indices);

const vertexBufferLayout: GPUVertexBufferLayout = {
  stepMode: "vertex",
  arrayStride: 16,
  attributes: [
    { // pos
      format: "float32x2",
      offset: 0,
      shaderLocation: 0,
    },
    { // uv
      format: "float32x2",
      offset: 8,
      shaderLocation: 1,
    }
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
    buffers: [vertexBufferLayout],
  },
  fragment: {
    module: shaderModule,
    entryPoint: "fragmentMain",
    targets: [{format: canvasFormat}]
  },
  layout: pipelineLayout,
});

const sampler = device.createSampler({
  minFilter: "nearest",
});

const view = texture.createView({
  baseMipLevel: 0,
  mipLevelCount: 1,
});

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
  ],
});


const encoder = device.createCommandEncoder();

{
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      storeOp: "store",
      clearValue: [0.54, 0.7, 1.0, 1.0],
      loadOp: "clear",
    }],
  });

  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.setVertexBuffer(0, vertexBuffer);
  pass.setIndexBuffer(indexBuffer, "uint32");
  pass.drawIndexed(indices.length, 1);

  pass.end();
}

{
  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
}

export {};
