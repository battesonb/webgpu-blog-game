import {assertDefined} from "./assertions";
import "./style.css";

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

  pass.end();
}

{
  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
}

export {};
