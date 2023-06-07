import {assertDefined} from "./assertions";
import "./style.css";
import shaderSource from "./shader.wgsl?raw";

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

const vertices = new Float32Array([
  // x, y
  -0.5, -0.5,
  0.5, -0.5,
  0.0, 0.5,
]);

const vertexBuffer = device.createBuffer({
  label: "vertex buffer",
  size: vertices.buffer.byteLength,
  usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
});

device.queue.writeBuffer(vertexBuffer, 0, vertices);

const vertexBufferLayout: GPUVertexBufferLayout = {
  stepMode: "vertex",
  arrayStride: 8,
  attributes: [{
    format: "float32x2",
    offset: 0,
    shaderLocation: 0,
  }],
};

const pipelineLayout = device.createPipelineLayout({
  label: "pipeline layout",
  bindGroupLayouts: [],
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
  pass.setVertexBuffer(0, vertexBuffer);
  pass.draw(vertices.length / 2);

  pass.end();
}

{
  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
}

export {};
