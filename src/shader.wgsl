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
  @location(0) world_position: vec3f,
  @location(1) world_tangent: vec3f,
  @location(2) world_bitangent: vec3f,
  @location(3) world_normal: vec3f,
  // The position of the vertex in light space.
  @location(4) light_pos: vec4f,
  @location(5) uv: vec2f,
  @location(6) color: vec3f,
};

struct Uniforms {
  viewProj: mat4x4f,
  lightProj: mat4x4f,
  lightDir: vec3f,
  viewPos: vec3f,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var textureSampler: sampler;
@group(0) @binding(2) var textureView: texture_2d<f32>;
@group(0) @binding(3) var textureNormalView: texture_2d<f32>;
@group(0) @binding(4) var textureGlossView: texture_2d<f32>;
@group(0) @binding(5) var shadowTextureSampler: sampler;
@group(0) @binding(6) var shadowTextureView: texture_depth_2d;

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
  output.world_position = world_position.xyz;
  output.clip_pos = uniforms.viewProj * world_position;

  let model_inverse_transpose = mat4x4f(
    instance.model_inverse_tranpose_matrix_0,
    instance.model_inverse_tranpose_matrix_1,
    instance.model_inverse_tranpose_matrix_2,
    instance.model_inverse_tranpose_matrix_3,
  );

  let model_without_transform = mat3x3f(
    model[0].xyz,
    model[1].xyz,
    model[2].xyz,
  );
  output.world_tangent = normalize(model_without_transform * in.tangent);
  output.world_bitangent = normalize(model_without_transform * in.bitangent);
  output.world_normal = normalize(model_inverse_transpose * vec4(in.normal, 0)).xyz;

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
  let bias = max(0.008 * (1.0 - dot(in.world_normal, -uniforms.lightDir)), 0.0005);
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
      } else if (in.light_pos.z < light_depth + bias) {
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

  var normal = textureSample(textureNormalView, textureSampler, in.uv).rgb;
  normal = normalize(normal * 2.0 - 1.0);
  let tbn = mat3x3f(
    in.world_tangent,
    in.world_bitangent,
    in.world_normal,
  );
  normal = tbn * normal;
  let gloss: f32 = textureSample(textureGlossView, textureSampler, in.uv).r;

  // TODO: Move these out into uniforms/material abstraction
  let light_color = vec3f(1.0, 0.85, 0.8);
  let ambient_strength = 0.8;
  let light_intensity: f32 = 0.7;
  let shininess = 64.0;

  let eyeDir = normalize(uniforms.viewPos - in.world_position);
  // The reflection occurs relative to the incident surface (represented by the
  // normal). Therefore, we use the vector from the light (not to the light).
  let reflectDir = reflect(uniforms.lightDir, normal);

  let albedo = color.rgb * in.color;
  let diffuse = max(dot(-uniforms.lightDir, normal), 0);
  let specular = gloss * pow(max(dot(eyeDir, reflectDir), 0.0), shininess);

  let light = ((diffuse + specular) * shadow(in) * light_intensity + ambient_strength) * light_color;

  return vec4f(light * albedo, 1.0);
}
