import {Resource} from "../ec/resource";
import {createDepthTexture, webGpuTextureFromUrl} from "../texture";

/**
 * A container for all textures loaded into the game
 */
export class Textures extends Resource {
  private _textures: Map<string, [GPUTexture, GPUTextureView]>;

  constructor() {
    super();
    this._textures = new Map();
  }

  async loadTexture(device: GPUDevice, name: string, viewDescriptor?: GPUTextureViewDescriptor): Promise<[GPUTexture, GPUTextureView]> {
    const path = `./${name}.png`;
    const texture = await webGpuTextureFromUrl(device, path);
    const view = texture.createView(viewDescriptor)
    this._textures.set(name, [texture, view]);
    return [texture, view];
  }

  async createDepthTexture(device: GPUDevice, name: string, width: number, height: number, viewDescriptor?: GPUTextureViewDescriptor): Promise<[GPUTexture, GPUTextureView]> {
    const texture = await createDepthTexture(device, width, height);
    const view = texture.createView(viewDescriptor)
    this._textures.set(name, [texture, view]);
    return [texture, view];
  }

  texture(name: string): GPUTexture {
    return this._textures.get(name)![0];
  }

  view(name: string): GPUTextureView {
    return this._textures.get(name)![1];
  }
}
