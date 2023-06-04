@vertex
fn vertexMain() -> @builtin(position) vec4f {
  return vec4(0, 0, 0, 0);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
  return vec4(1, 1, 1, 1);
}
