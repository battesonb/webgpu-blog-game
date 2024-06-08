struct VertexInput {
  @location(0) pos: vec3f,
  @location(1) uv: vec2f,
  @location(2) color: vec3f,
};

struct InstanceInput {
  @location(3) model_matrix_0: vec4<f32>,
  @location(4) model_matrix_1: vec4<f32>,
  @location(5) model_matrix_2: vec4<f32>,
  @location(6) model_matrix_3: vec4<f32>,
}

struct VertexOutput {
  @builtin(position) clip_pos: vec4f,
  @location(0) light_pos: vec4f,
  @location(1) uv: vec2f,
  @location(2) color: vec3f,
};

struct Uniforms {
  viewProj: mat4x4f,
  lightProj: mat4x4f,
};

@group(0) @binding(0) var textureView: texture_2d<f32>;
@group(0) @binding(1) var textureSampler: sampler;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;
@group(0) @binding(3) var shadowTextureView: texture_depth_2d;
@group(0) @binding(4) var shadowTextureSampler: sampler;

@vertex
fn vertexMain(in: VertexInput, instance: InstanceInput) -> VertexOutput {
  var output: VertexOutput;
  let model = mat4x4f(
    instance.model_matrix_0,
    instance.model_matrix_1,
    instance.model_matrix_2,
    instance.model_matrix_3,
  );
  let world_position = model * vec4f(in.pos.xyz, 1);
  output.clip_pos = uniforms.viewProj * world_position;
  let light_pos = uniforms.lightProj * world_position;
  output.light_pos = light_pos / light_pos.w;
  output.uv = in.uv;
  output.color = in.color;
  return output;
}

fn shadow(in: VertexOutput) -> f32 {
  let u = (in.light_pos.x + 1) * 0.5;
  let v = (-1 * in.light_pos.y + 1) * 0.5;
  let lightDepth = textureSample(shadowTextureView, shadowTextureSampler, vec2f(u, v));

  if (u < 0.0 || v < 0.0 || u >= 1.0 || v >= 1.0) {
    // Set this to zero to debug the orthographic frustum
    return 1.0;
  }

  let bias = 0.0005;
  if (in.light_pos.z < lightDepth + bias) {
    return 1.0;
  }

  return 0.0;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
  let color = textureSample(textureView, textureSampler, in.uv);
  if (color.a == 0) {
    discard;
  }

  let ambient = vec3f(0.9, 0.75, 0.8);

  let s = shadow(in);
  let albedo = color.rgb * in.color;

  return vec4(albedo * s + albedo * ambient * (1 - s), 1);
}
