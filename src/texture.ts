export async function webGpuTextureFromUrl(device: GPUDevice, url: string): Promise<GPUTexture> {
  const blob = await fetch(url).then(res => res.blob());
  const imageBitmap = await createImageBitmap(blob);

  const textureDescriptor: GPUTextureDescriptor = {
    label: `texture(${url})`,
    size: { width: imageBitmap.width, height: imageBitmap.height },
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    format: "rgba8unorm",
  };

  const texture = device.createTexture(textureDescriptor);
  device.queue.copyExternalImageToTexture({ source: imageBitmap }, { texture }, textureDescriptor.size);

  return texture;
}

const TILE_SIZE = 8;
const PADDING = 1;
export function uvFromIndex(index: number, x: number, y: number, texture: GPUTexture): [number, number] {
  const i = ((index * (TILE_SIZE + PADDING)) % texture.width) / texture.width;
  return [i + (x * TILE_SIZE) / texture.width, y * TILE_SIZE / texture.height];
}

export async function createDepthTexture(device: GPUDevice, width: number, height: number): Promise<GPUTexture> {
  const textureDescriptor: GPUTextureDescriptor = {
    label: "depth texture",
    size: { width: width, height: height },
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    format: "depth32float",
  };

  const texture = device.createTexture(textureDescriptor);

  return texture;
}
