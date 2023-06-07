struct VertexInput {
  @location(0) pos: vec2f,
  @builtin(vertex_index) index: u32,
};

struct VertexOutput {
  @builtin(position) clip_pos: vec4f,
  @location(0) tint: vec3f,
};

@vertex
fn vertexMain(in: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  let i = in.index;
  let r = f32(i == 0);
  let g = f32(i == 1);
  let b = f32(i == 2);
  output.clip_pos = vec4(in.pos, 0, 1);
  output.tint = vec3(r, g, b);
  return output;
}

@fragment
fn fragmentMain(in: VertexOutput) -> @location(0) vec4f {
  return vec4(in.tint, 1.0);
}
