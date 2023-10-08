export function posMod(a: number, b: number) {
  return ((a % b) + b) % b;
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpBetween(
  s1: number,
  s2: number,
  t: number,
  d1: number,
  d2: number
) {
  return lerp(d1, d2, (t - s1) / (s2 - s1));
}
