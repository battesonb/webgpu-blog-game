struct VertexInput {
  @location(0) pos: vec3f,
  @location(1) normal: vec3f,
  @location(2) tangent: vec3f,
  @location(3) bitangent: vec3f,
  @location(4) uv: vec2f,
  @location(5) color: vec3f,
};


struct InstanceInput {
  @location(6) model_matrix_0: vec4<f32>,
  @location(7) model_matrix_1: vec4<f32>,
  @location(8) model_matrix_2: vec4<f32>,
  @location(9) model_matrix_3: vec4<f32>,
  @location(10) model_inverse_tranpose_matrix_0: vec4<f32>,
  @location(11) model_inverse_tranpose_matrix_1: vec4<f32>,
  @location(12) model_inverse_tranpose_matrix_2: vec4<f32>,
  @location(13) model_inverse_tranpose_matrix_3: vec4<f32>,
}

struct VertexOutput {
  @builtin(position) clip_pos: vec4f,
  @location(0) uv: vec2f,
};

struct Uniforms {
  viewProj: mat4x4f,
  lightProj: mat4x4f,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var textureSampler: sampler;
@group(0) @binding(2) var textureView: texture_2d<f32>;

@vertex
fn vertexMain(in: VertexInput, instance: InstanceInput) -> VertexOutput {
  var output: VertexOutput;
  let model = mat4x4f(
    instance.model_matrix_0,
    instance.model_matrix_1,
    instance.model_matrix_2,
    instance.model_matrix_3,
  );
  output.clip_pos = uniforms.lightProj * model * vec4f(in.pos.xyz, 1);
  output.uv = in.uv;
  return output;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
  let color = textureSample(textureView, textureSampler, in.uv);
  if (color.a == 0) {
    discard;
  }
  return vec4(1);
}
