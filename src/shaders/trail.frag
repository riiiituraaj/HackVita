// Ping-pong trail texture (~1/8 resolution).
// Each frame: decay the previous frame and stamp a soft capsule from the
// previous to the current mouse position, scaled by mouse velocity.
precision highp float;

uniform sampler2D uPrev;
uniform vec2 uMouse;      // 0..1, GL orientation
uniform vec2 uPrevMouse;
uniform float uStrength;  // 0..1 from velocity
uniform float uRadius;    // radius as a fraction of the canvas height
uniform float uAspect;    // width / height
uniform float uDecay;     // ~0.965 → ~1.5s fade at 60fps

varying vec2 vUv;

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  // The small subtraction stops 8-bit values from sticking above zero.
  float prev = max(texture2D(uPrev, vUv).r * uDecay - 0.0035, 0.0);
  vec2 asp = vec2(uAspect, 1.0);
  float d = segDist(vUv * asp, uPrevMouse * asp, uMouse * asp);
  float stamp = (1.0 - smoothstep(uRadius * 0.15, uRadius, d)) * uStrength;
  float v = clamp(max(prev, stamp), 0.0, 1.0);
  gl_FragColor = vec4(v, v, v, 1.0);
}
