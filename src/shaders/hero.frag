// "Dithered surveillance view": duotone → Bayer 4×4 dither → scanlines →
// vignette + breathing, with flickering lit windows and a pixel-mosaic smear
// wherever the cursor trail texture is non-zero.
precision highp float;

uniform sampler2D uImage;
uniform sampler2D uTrail;
uniform vec2 uRes;        // drawing-buffer size in device px
uniform vec2 uImgSize;    // natural image size
uniform float uDpr;
uniform float uTime;
uniform float uHasImage;  // 0 → procedural fallback
uniform float uMotion;    // 1 = full motion, 0 = reduced

varying vec2 vUv;

const vec3 INK    = vec3(0.0196, 0.0, 0.0235);  // #050006
const vec3 MAG7   = vec3(0.561, 0.0, 0.510);    // #8F0082
const vec3 MAG5   = vec3(1.0, 0.0, 0.898);      // #FF00E5
const vec3 PINK5  = vec3(1.0, 0.122, 0.561);    // #FF1F8F
const vec3 PINK3  = vec3(1.0, 0.478, 0.761);    // #FF7AC2
const vec3 PINK50 = vec3(1.0, 0.941, 0.973);    // #FFF0F8

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// Ordered dither threshold in [0,1) for a 4×4 Bayer matrix.
float bayer2(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}
float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

// object-fit: cover
vec2 coverUv(vec2 uv) {
  float rs = uRes.x / uRes.y;
  float ri = uImgSize.x / max(uImgSize.y, 1.0);
  vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

vec3 procedural(vec2 uv) {
  float n = noise(uv * vec2(9.0, 5.0) + vec2(0.0, uTime * 0.03));
  n = n * 0.6 + noise(uv * 23.0) * 0.4;
  float horizon = smoothstep(0.55, 0.2, uv.y);
  return vec3(n * horizon);
}

vec3 ramp(float l) {
  vec3 c = mix(INK, MAG7, smoothstep(0.02, 0.32, l));
  c = mix(c, PINK5, smoothstep(0.30, 0.62, l));
  c = mix(c, PINK50, smoothstep(0.62, 1.0, l));
  return c;
}

void main() {
  vec2 frag = vUv * uRes;
  float px = uDpr;

  // --- mosaic block size from the trail, sampled on a coarse 28px grid ---
  float coarse = 28.0 * px;
  vec2 cc = (floor(frag / coarse) + 0.5) * coarse;
  float trail = texture2D(uTrail, cc / uRes).r;
  float blockCss = 1.0;
  if (trail > 0.03) {
    blockCss = max(4.0, floor(mix(1.0, 28.0, trail) / 4.0 + 0.5) * 4.0);
  }
  float block = blockCss * px;
  vec2 cellId = floor(frag / block);
  vec2 suv = ((cellId + 0.5) * block) / uRes;

  // --- sample (cover + slow 0.3% breathing) ---
  vec2 iuv = coverUv(suv);
  float breathe = 1.0 - 0.003 * (0.5 + 0.5 * sin(uTime * 0.45)) * uMotion;
  iuv = (iuv - 0.5) * breathe + 0.5;
  vec3 src = uHasImage > 0.5 ? texture2D(uImage, iuv).rgb : procedural(iuv);

  float l = dot(src, vec3(0.299, 0.587, 0.114));
  l = smoothstep(0.04, 0.92, l);

  // --- ordered dither at 2px cells ---
  float b = bayer4(frag / (2.0 * px));
  float levels = 5.0;
  float lq = floor(l * levels + b) / levels;
  // Inside the mosaic, blocks read as flat tiles rather than dithered.
  lq = mix(lq, l, step(0.03, trail));
  vec3 col = ramp(lq);

  // --- lit windows flicker between pink and magenta ---
  vec2 wcell = floor(frag / (5.0 * px));
  float wh = hash(wcell);
  float phase = floor(uTime * (0.4 + wh * 1.4) * uMotion + wh * 10.0);
  float f = hash(wcell + phase);
  if (l > 0.7 && wh > 0.5) {
    col = mix(col, f > 0.5 ? PINK3 : MAG5, 0.55);
    if (f < 0.14 && uMotion > 0.5) col *= 0.3;
  }

  // --- trail: saturate toward magenta + random block glints (120ms) ---
  col = mix(col, MAG5 * (0.3 + lq * 0.95), trail * 0.55);
  float g = hash(cellId + floor(uTime / 0.12) * 7.13);
  if (trail > 0.15 && g > 0.93) col = MAG5;

  // --- scanlines: 1px darker line every 3px, drifting downward ---
  float y = frag.y / px + uTime * 6.0 * uMotion;
  if (mod(floor(y), 3.0) < 0.5) col *= 0.92;

  // --- vignette ---
  vec2 q = vUv - 0.5;
  col *= smoothstep(0.95, 0.22, length(q * vec2(1.05, 1.35)));

  gl_FragColor = vec4(col, 1.0);
}
