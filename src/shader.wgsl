struct VertexInput {
  @location(0) pos: vec2f,
  @location(1) uv: vec2f,
};

struct VertexOutput {
  @builtin(position) clip_pos: vec4f,
  @location(0) uv: vec2f,
};

@group(0) @binding(0) var textureView: texture_2d<f32>;
@group(0) @binding(1) var textureSampler: sampler;

@vertex
fn vertexMain(in: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.clip_pos = vec4f(in.pos, 0, 1);
  output.uv = in.uv;
  return output;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
  let color = textureSample(textureView, textureSampler, in.uv);
  return vec4(color);
}
