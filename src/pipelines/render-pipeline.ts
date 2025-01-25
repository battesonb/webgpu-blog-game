import {UpdateContext} from "../ec/component"

export abstract class RenderPipeline {
  abstract prepare(encoder: GPUCommandEncoder, ctx: UpdateContext): GPURenderPassEncoder
}
