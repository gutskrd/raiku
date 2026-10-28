// Full-screen WebGL backdrop: a slow violet nebula, the two sweeping arcs from
// the logo, sparkles and a soft light that follows the pointer. Rendered at a
// reduced resolution and paused while the tab is hidden.

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uGold;
uniform float uFade;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.03 + 0.17; a *= 0.5; }
  return v;
}

// Glow around a circle of radius r, strongest where the arc faces angle a.
float arc(vec2 uv, float r, float a, float spread) {
  float d = abs(length(uv) - r);
  float ang = atan(uv.y, uv.x);
  float face = pow(max(cos(ang - a), 0.0), spread);
  float core = 0.0035 / (d + 0.0035);
  return (core * core * 0.55 + core * 0.12) * face;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float aspect = uRes.x / uRes.y;
  float t = uTime * 0.035;

  vec2 q = vec2(fbm(uv * 1.5 + t), fbm(uv * 1.5 - t + 3.1));
  vec2 r = vec2(fbm(uv * 1.7 + 2.0 * q + vec2(1.7, 9.2) + t * 1.4),
                fbm(uv * 1.7 + 2.0 * q + vec2(8.3, 2.8) - t));
  float n = fbm(uv * 1.3 + 2.2 * r);

  vec3 deep    = vec3(0.012, 0.008, 0.028);
  vec3 indigo  = vec3(0.16, 0.06, 0.48);
  vec3 violet  = vec3(0.54, 0.17, 0.96);
  vec3 orchid  = vec3(0.78, 0.36, 1.0);

  vec3 col = deep;
  col = mix(col, indigo * 0.5, smoothstep(0.38, 0.95, n));
  col = mix(col, violet * 0.55, smoothstep(0.62, 1.15, n * (0.6 + length(q))));
  col += orchid * 0.06 * smoothstep(0.7, 1.0, r.x);

  // Soft light behind the emblem.
  vec2 c = uv - vec2(0.0, 0.16);
  col += violet * 0.24 * exp(-dot(c, c) * 4.0);

  // The logo's two sweeping arcs, drifting slowly around the frame.
  float R = max(0.5 * aspect, 0.55) * 0.97;
  float spin = uTime * 0.025;
  float arcs = arc(uv, R, 2.45 + spin, 10.0) + arc(uv, R, -0.70 + spin, 10.0);
  arcs += 0.5 * (arc(uv, R * 1.06, 2.25 + spin, 18.0) + arc(uv, R * 1.06, -0.9 + spin, 18.0));
  col += mix(violet, orchid, 0.35) * arcs * 0.9;

  // Pointer light.
  vec2 m = uv - uMouse;
  col += violet * 0.16 * exp(-dot(m, m) * 7.0);

  // Sparkles.
  vec2 g = uv * 46.0;
  vec2 id = floor(g);
  float h = hash(id);
  vec2 f = fract(g) - 0.5 - (vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5) * 0.6;
  float tw = 0.5 + 0.5 * sin(uTime * (1.2 + h * 2.0) + h * 60.0);
  float star = step(0.982, h) * smoothstep(0.09, 0.0, length(f)) * tw;
  col += star * vec3(0.85, 0.75, 1.0) * 0.7;

  // Vignette.
  col *= smoothstep(1.35, 0.25, length(uv * vec2(0.85 / max(aspect * 0.6, 1.0), 1.1)));

  // Crown mode: tint toward gold.
  float lum = dot(col, vec3(0.3, 0.5, 0.2));
  col = mix(col, lum * vec3(2.0, 1.45, 0.45), uGold);

  gl_FragColor = vec4(col * uFade, 1.0);
}
`;

export function startBackground(canvas, { reducedMotion = false } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
  if (!gl) {
    canvas.remove();
    return null;
  }

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (err) {
    console.warn('Background shader disabled:', err);
    canvas.remove();
    return null;
  }
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (name) => gl.getUniformLocation(program, name);
  const uRes = u('uRes'), uTime = u('uTime'), uMouse = u('uMouse'), uGold = u('uGold'), uFade = u('uFade');

  const state = {
    mouse: [0, 0.1], target: [0, 0.1],
    gold: 0, goldTarget: 0,
    fade: reducedMotion ? 1 : 0,
  };

  const SCALE = 0.55;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(window.innerWidth * dpr * SCALE));
    const h = Math.max(1, Math.round(window.innerHeight * dpr * SCALE));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  window.addEventListener('pointermove', (e) => {
    const h = window.innerHeight;
    state.target = [(e.clientX - window.innerWidth / 2) / h, (h / 2 - e.clientY) / h];
  }, { passive: true });

  const start = performance.now();
  let raf = 0;

  function draw(now) {
    resize();
    const time = reducedMotion ? 40 : (now - start) / 1000 + 40;
    state.mouse[0] += (state.target[0] - state.mouse[0]) * 0.05;
    state.mouse[1] += (state.target[1] - state.mouse[1]) * 0.05;
    state.gold += (state.goldTarget - state.gold) * 0.04;
    state.fade = Math.min(1, state.fade + 0.012);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, time);
    gl.uniform2f(uMouse, state.mouse[0], state.mouse[1]);
    gl.uniform1f(uGold, state.gold);
    gl.uniform1f(uFade, state.fade);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop(now) {
    draw(now);
    raf = requestAnimationFrame(loop);
  }

  if (reducedMotion) {
    draw(performance.now());
    window.addEventListener('resize', () => draw(performance.now()));
  } else {
    raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    });
  }

  return {
    setGold(on) {
      state.goldTarget = on ? 1 : 0;
      if (reducedMotion) { state.gold = state.goldTarget; draw(performance.now()); }
    },
  };
}
