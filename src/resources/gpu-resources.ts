import {Resource} from "../ec/resource";

export class GpuResources extends Resource {
  device: GPUDevice;
  texture: GPUTexture;

  constructor(device: GPUDevice, texture: GPUTexture) {
    super();
    this.device = device;
    this.texture = texture;
  }
}
