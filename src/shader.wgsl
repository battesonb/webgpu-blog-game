struct VertexInput {
  @location(0) pos: vec3f,
  @location(1) uv: vec2f,
};

struct InstanceInput {
  @location(3) model_matrix_0: vec4<f32>,
  @location(4) model_matrix_1: vec4<f32>,
  @location(5) model_matrix_2: vec4<f32>,
  @location(6) model_matrix_3: vec4<f32>,
}

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
fn vertexMain(in: VertexInput, instance: InstanceInput) -> VertexOutput {
  var output: VertexOutput;
  let model = mat4x4f(
    instance.model_matrix_0,
    instance.model_matrix_1,
    instance.model_matrix_2,
    instance.model_matrix_3,
  );
  output.clip_pos = uniforms.viewProj * model * vec4f(in.pos.xyz, 1);
  output.uv = in.uv;
  return output;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
  let color = textureSample(textureView, textureSampler, in.uv);
  if (color.a == 0) {
    discard;
  }
  return color;
}
