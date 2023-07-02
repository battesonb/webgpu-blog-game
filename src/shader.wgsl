struct VertexInput {
  @location(0) pos: vec3f,
  @location(1) uv: vec2f,
};

struct VertexOutput {
  @builtin(position) clip_pos: vec4f,
  @location(0) uv: vec2f,
};

struct Uniforms {
  viewProj: mat4x4f,
};

@group(0) @binding(0) var textureView: texture_2d<f32>;
@group(0) @binding(1) var textureSampler: sampler;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(in: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.clip_pos = uniforms.viewProj * vec4f(in.pos.xyz, 1);
  output.uv = in.uv;
  return output;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
  let color = textureSample(textureView, textureSampler, in.uv);
  return vec4(color);
}
