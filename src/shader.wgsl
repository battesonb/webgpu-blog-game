struct VertexInput {
  @location(0) pos: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
  @location(3) color: vec3f,
};

struct InstanceInput {
  @location(4) model_matrix_0: vec4<f32>,
  @location(5) model_matrix_1: vec4<f32>,
  @location(6) model_matrix_2: vec4<f32>,
  @location(7) model_matrix_3: vec4<f32>,
  @location(8) model_inverse_tranpose_matrix_0: vec4<f32>,
  @location(9) model_inverse_tranpose_matrix_1: vec4<f32>,
  @location(10) model_inverse_tranpose_matrix_2: vec4<f32>,
  @location(11) model_inverse_tranpose_matrix_3: vec4<f32>,
}

struct VertexOutput {
  @builtin(position) clip_pos: vec4f,
  @location(0) world_normal: vec4f,
  // The position of the vertex in light space.
  @location(1) light_pos: vec4f,
  @location(2) uv: vec2f,
  @location(3) color: vec3f,
};

struct Uniforms {
  viewProj: mat4x4f,
  lightProj: mat4x4f,
  lightDir: vec3f,
};

@group(0) @binding(0) var textureView: texture_2d<f32>;
@group(0) @binding(1) var textureSampler: sampler;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;
@group(0) @binding(3) var shadowTextureView: texture_depth_2d;
@group(0) @binding(4) var shadowTextureSampler: sampler;

const BIAS = 0.002;

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

  let model_inverse_transpose = mat4x4f(
    instance.model_inverse_tranpose_matrix_0,
    instance.model_inverse_tranpose_matrix_1,
    instance.model_inverse_tranpose_matrix_2,
    instance.model_inverse_tranpose_matrix_3,
  );
  output.world_normal = normalize(model_inverse_transpose * vec4(in.normal.xyz, 1));
  // output.world_normal = model_inverse_transpose * vec4(in.normal.xyz, 1);

  let light_pos = uniforms.lightProj * world_position;
  output.light_pos = light_pos / light_pos.w;
  output.uv = in.uv;
  output.color = in.color;
  return output;
}

const SHADOW_STEPS = 3;
const SHADOW_TOTAL = (2 * SHADOW_STEPS + 1) * (2 * SHADOW_STEPS + 1);

fn shadow(in: VertexOutput) -> f32 {
  var shadow = 0.0;
  let texel_size = vec2f(1.0) / vec2f(textureDimensions(shadowTextureView, 0));
  for (var x = -SHADOW_STEPS; x <= SHADOW_STEPS; x++) {
    for (var y = -SHADOW_STEPS; y <= SHADOW_STEPS; y++) {
      let uv = vec2f(
        (in.light_pos.x + 1.0) * 0.5,
        (-in.light_pos.y + 1.0) * 0.5,
      );
      let light_depth = textureSample(shadowTextureView, shadowTextureSampler, uv + vec2f(f32(x), f32(y)) * texel_size);

      if (uv.x < 0.0 || uv.y < 0.0 || uv.x >= 1.0 || uv.y >= 1.0) {
        // Set this to zero to debug the orthographic frustum
        shadow += 1.0;
      } else if (in.light_pos.z < light_depth + BIAS) {
        shadow += 1.0;
      }
    }
  }

  return shadow / SHADOW_TOTAL;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
  let color = textureSample(textureView, textureSampler, in.uv);
  if (color.a == 0) {
    discard;
  }

  let ambient = vec3f(0.8, 0.65, 0.75);

  var s = shadow(in);
  let albedo = color.rgb * in.color;

  let diffuse_factor = clamp(dot(uniforms.lightDir, -in.world_normal.xyz), 0, 1);
  s *= diffuse_factor;

  return vec4(albedo * s + albedo * ambient * (1 - s), 1);
}
