export function toRadians(degrees: number) {
  return degrees * Math.PI / 180;
}

export function clamp(a: number, b: number, value: number) {
  return Math.max(a, Math.min(b, value));
}

export function lerp(a: number, b: number, ratio: number) {
  const t = clamp(0, 1, ratio);
  return t * a + (1-t) * b;
}
