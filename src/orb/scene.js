import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

// ----------------------------------------------------------------
// Global animatable state. Scroll choreography tweens `target`,
// the render loop eases `current` toward it every frame.
// ----------------------------------------------------------------
export const orbState = {
  target: {
    x: 0,            // orb position, NDC-ish (-1..1)
    y: 0,
    scale: 1,        // group scale
    filamentSpeed: 0.35,
    filamentLength: 1, // 1 = filaments end at shell. >1 during dive
    filamentAlpha: 1,
    coreGlow: 0.55,  // core emissive intensity
    halo: 0.55,      // halo sprite intensity
    glass: 0.5,      // shell visibility
    dim: 0,          // global dimming 0..1 (manifest "ghost" state)
    dive: 0,         // 0 = normal bg, 1 = inside-the-orb deep blue bg
    theme: 0,        // 0 = pink/blue, 1 = warm gold/orange
    cool: 0,         // 0 = normal, 1 = icy blue surge (intro charge/burst)
    fogAlpha: 0.45,  // background fog amount
    fogSpeed: 0.3,
    opacity: 0,      // master orb opacity (fades in after preloader)
  },
  current: null,
  ease: 0.075,
};
orbState.current = { ...orbState.target };
// Dev hook for inspecting/driving the orb from the console
if (import.meta.env.DEV) window.__orbState = orbState;

// Palette
const COL = {
  plasmaPink: new THREE.Color('#f74fa7'),
  plasmaPinkHot: new THREE.Color('#ff8ccd'),
  filamentBlue: new THREE.Color('#5b5bff'),
  filamentWhite: new THREE.Color('#f4f8ff'),
  warmGold: new THREE.Color('#e6953c'),
  warmCore: new THREE.Color('#ffb36b'),
  warmFil: new THREE.Color('#ffd9a8'),
  diveBg: new THREE.Color('#16166e'),
  coolShell: new THREE.Color('#9fbcff'),
  coolHot: new THREE.Color('#f0f6ff'),
  coolFil: new THREE.Color('#8d96ff'),
};

const NOISE_GLSL = /* glsl */ `
  vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
  vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  float fbm(vec3 p){
    float f = 0.0;
    f += 0.5333 * snoise(p); p *= 2.01;
    f += 0.2667 * snoise(p); p *= 2.02;
    f += 0.1333 * snoise(p); p *= 2.03;
    f += 0.0667 * snoise(p);
    return f;
  }
`;

const CORE_RADIUS = 0.17;
const SHELL_RADIUS = 1.0;
const FILAMENT_COUNT = 26;
const FILAMENT_SEGS = 60;

let renderer, scene, camera, composer, bloomPass;
let group, coreMesh, shellMesh, filamentGlow, filamentCore, tips, halo, bgMesh;
let uniformsList = [];
let clock = new THREE.Clock();
let worldHalf = { w: 1, h: 1 };

// Cursor interaction (background plasma reacts to the pointer)
const pointerTarget = new THREE.Vector2(0.5, 0.5);
let pointerOverOrb = false;
const orbScreen = { x: 0, y: 0, radius: 0, ready: false };
let lastScrollY = 0;
let scrollMult = 1;

function makeFilamentGeometry() {
  // Ribbon strip per filament: positions encode (t, side, filamentIndex)
  const verts = FILAMENT_COUNT * (FILAMENT_SEGS + 1) * 2;
  const pos = new Float32Array(verts * 3);
  const index = [];
  let v = 0;
  for (let f = 0; f < FILAMENT_COUNT; f++) {
    const base = f * (FILAMENT_SEGS + 1) * 2;
    for (let s = 0; s <= FILAMENT_SEGS; s++) {
      const t = s / FILAMENT_SEGS;
      pos[v * 3 + 0] = t;
      pos[v * 3 + 1] = -1;
      pos[v * 3 + 2] = f;
      v++;
      pos[v * 3 + 0] = t;
      pos[v * 3 + 1] = 1;
      pos[v * 3 + 2] = f;
      v++;
      if (s < FILAMENT_SEGS) {
        const a = base + s * 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
  return geo;
}

const FILAMENT_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uLength;
  uniform float uWidth;
  varying float vT;
  varying float vSide;
  varying float vSeed;
  ${NOISE_GLSL}

  vec3 hash31(float p){
    vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xxy + p3.yzz) * p3.zyx) * 2.0 - 1.0;
  }

  void main() {
    float t = position.x;
    float side = position.y;
    float fi = position.z;
    vT = t; vSide = side; vSeed = fi;

    // Slowly wandering base direction per filament
    vec3 dir = normalize(hash31(fi * 17.31 + 3.7));
    vec3 axis = normalize(hash31(fi * 91.7 + 13.1));
    float wob = uTime * (0.12 + 0.1 * fract(fi * 0.37)) * uSpeed + fi;
    // Rodrigues rotation of dir around axis
    float ca = cos(wob), sa = sin(wob);
    dir = dir * ca + cross(axis, dir) * sa + axis * dot(axis, dir) * (1.0 - ca);

    vec3 u = normalize(cross(dir, vec3(0.0, 1.0, 0.001)));
    vec3 w = normalize(cross(dir, u));

    float r0 = ${CORE_RADIUS.toFixed(2)};
    float r1 = ${SHELL_RADIUS.toFixed(2)} * uLength;
    float rad = mix(r0 * 0.92, r1, t);

    // Perpendicular jitter — the lightning wiggle
    float env = sin(t * 3.14159) ;
    float nt = uTime * (0.6 + uSpeed * 1.6);
    float n1 = snoise(vec3(t * 3.4 + fi * 7.0, nt * 0.55, fi * 3.1)) +
               0.45 * snoise(vec3(t * 9.0 + fi * 5.0, nt * 1.2, fi * 1.7));
    float n2 = snoise(vec3(t * 3.1 - fi * 4.0, nt * 0.5 + 50.0, fi * 2.3)) +
               0.45 * snoise(vec3(t * 8.5 + fi * 3.0, nt * 1.1 + 80.0, fi * 5.9));
    float amp = 0.09 * env * (0.6 + 0.4 * uSpeed);
    vec3 p = dir * rad + (u * n1 + w * n2) * amp * r1;

    // Billboard ribbon
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec3 tangentP = dir * (rad + 0.02) ;
    vec4 mv2 = modelViewMatrix * vec4(tangentP + (u * n1 + w * n2) * amp * r1, 1.0);
    vec3 tDir = normalize(mv2.xyz - mv.xyz);
    vec3 perp = normalize(cross(tDir, vec3(0.0, 0.0, 1.0)));
    float taper = mix(1.0, 0.25, t) * (0.8 + 0.2 * sin(fi * 9.0));
    mv.xyz += perp * side * uWidth * taper;
    gl_Position = projectionMatrix * mv;
  }
`;

const FILAMENT_FRAG = /* glsl */ `
  uniform vec3 uColorA;   // center color
  uniform vec3 uColorB;   // edge color
  uniform float uAlpha;
  uniform float uTime;
  uniform float uSpeed;
  varying float vT;
  varying float vSide;
  varying float vSeed;

  float hash11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }

  void main() {
    float across = 1.0 - abs(vSide);
    float edge = pow(across, 1.8);
    // per-filament flicker
    float fl = 0.45 + 0.55 * hash11(vSeed * 13.7 + floor(uTime * (4.0 + uSpeed * 9.0)));
    float fade = smoothstep(0.0, 0.06, vT) * (1.0 - smoothstep(0.72, 0.98, vT) * 0.75);
    vec3 col = mix(uColorB, uColorA, edge);
    float a = edge * uAlpha * fl * fade;
    gl_FragColor = vec4(col * (0.65 + 0.35 * fl), a);
  }
`;

function makeTipsGeometry() {
  const pos = new Float32Array(FILAMENT_COUNT * 3);
  const seed = new Float32Array(FILAMENT_COUNT);
  for (let f = 0; f < FILAMENT_COUNT; f++) {
    pos[f * 3] = 0; pos[f * 3 + 1] = 0; pos[f * 3 + 2] = 0;
    seed[f] = f;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
  return geo;
}

const TIPS_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uLength;
  uniform float uSizeMult;
  attribute float aSeed;
  varying float vSeed;
  ${NOISE_GLSL}
  vec3 hash31(float p){
    vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.xxy + p3.yzz) * p3.zyx) * 2.0 - 1.0;
  }
  void main(){
    float fi = aSeed;
    vSeed = fi;
    vec3 dir = normalize(hash31(fi * 17.31 + 3.7));
    vec3 axis = normalize(hash31(fi * 91.7 + 13.1));
    float wob = uTime * (0.12 + 0.1 * fract(fi * 0.37)) * uSpeed + fi;
    float ca = cos(wob), sa = sin(wob);
    dir = dir * ca + cross(axis, dir) * sa + axis * dot(axis, dir) * (1.0 - ca);
    vec3 p = dir * ${SHELL_RADIUS.toFixed(2)} * uLength * 0.985;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (38.0 + 18.0 * fract(fi * 0.71)) * uSizeMult / max(0.001, -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const TIPS_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uAlpha;
  uniform float uTime;
  varying float vSeed;
  float hash11(float p){ p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float g = exp(-d * d * 18.0);
    float fl = 0.5 + 0.5 * hash11(vSeed * 7.7 + floor(uTime * 6.0));
    gl_FragColor = vec4(uColor, g * uAlpha * fl);
  }
`;

const CORE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPos;
  void main(){
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CORE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHotColor;
  uniform float uGlow;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vPos;
  ${NOISE_GLSL}
  void main(){
    float n = fbm(vPos * 9.0 + uTime * 0.22);
    float mottle = smoothstep(-0.45, 0.6, n);
    vec3 col = mix(uColor * 0.55, mix(uColor, uHotColor, 0.55), mottle);
    float fres = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.0);
    col += uHotColor * fres * 0.9;
    col *= (0.55 + uGlow * 1.5);
    gl_FragColor = vec4(col, uOpacity);
  }
`;

const SHELL_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vWorld;
  void main(){
    vNormal = normalize(normalMatrix * normal);
    vPos = position;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const SHELL_FRAG = /* glsl */ `
  uniform vec3 uTint;       // pink subsurface tint
  uniform float uOpacity;   // master shell opacity
  uniform float uTime;
  uniform float uDim;
  varying vec3 vNormal;
  varying vec3 vPos;
  ${NOISE_GLSL}
  void main(){
    vec3 n = normalize(vNormal);
    float fres = pow(1.0 - abs(n.z), 1.2);

    // Dark mottled "continents" on the skin
    float blotch = fbm(vPos * 2.4 + vec3(0.0, uTime * 0.03, 0.0)) * 1.45;
    float dark = smoothstep(-0.05, 0.5, blotch);

    // Pink skin glow strongest at rim
    vec3 col = uTint * (fres * 3.1 + 0.12);
    col = mix(col, vec3(0.012, 0.006, 0.012), dark * 0.95);

    // White specular rim, upper-left
    vec3 lightDir = normalize(vec3(-0.55, 0.65, 0.45));
    float spec = pow(max(dot(n, lightDir), 0.0), 9.0);
    col += vec3(1.0) * spec * 0.5;

    float a = (pow(fres, 1.5) * (0.6 + 0.55 * dark) + spec * 0.4) * uOpacity;
    a *= (1.0 - uDim * 0.55);
    gl_FragColor = vec4(col, a);
  }
`;

const BG_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const BG_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec3 uFogColor;
  uniform float uFogAlpha;
  uniform float uFogSpeed;
  uniform float uDive;
  uniform vec3 uDiveColor;
  uniform vec2 uOrb;     // orb screen pos in uv space
  uniform vec2 uPointer;          // cursor in uv space (y up)
  uniform float uPointerEnergy;   // 0..1, driven by mouse speed
  uniform float uInteractionMult; // damped during dive / fast scroll
  uniform vec3 uFilamentBlue;
  varying vec2 vUv;
  ${NOISE_GLSL}

  #define PI 3.14159265359
  #define POINTER_RADIUS 0.7
  #define POINTER_DISTORTION 0.145
  #define POINTER_RIPPLE 0.025

  void main(){
    vec2 uv = vUv;
    vec2 asp = vec2(uRes.x / uRes.y, 1.0);
    // #070707 in linear space (output chain shows raw values brighter)
    vec3 col = vec3(0.004);

    // ----- cursor field: fog near the pointer is pulled, rippled, lit -----
    vec2 p = (uv - 0.5) * asp * 2.0;
    vec2 pointer = (uPointer - 0.5) * asp * 2.0;
    float pointerDist = length(p - pointer);
    float pointerField = smoothstep(POINTER_RADIUS, 0.0, pointerDist);
    float energy = smoothstep(0.015, 0.55, uPointerEnergy) * uInteractionMult;

    vec2 localPull = normalize(p - pointer + 0.0001) * pointerField * energy * POINTER_DISTORTION;
    vec2 ripple = vec2(
      sin((p.y - pointer.y) * 9.0 + uTime * 1.35),
      cos((p.x - pointer.x) * 8.0 - uTime * 1.12)
    ) * pointerField * energy * POINTER_RIPPLE;

    // soft drifting fog tinted with theme color (2 octaves: full-screen cost)
    float t = uTime * 0.05 * (0.4 + uFogSpeed);
    vec3 fp = vec3(uv * asp * 2.2 + (localPull + ripple) * 1.1, t);
    float fRaw = 0.62 * snoise(fp) + 0.32 * snoise(fp * 2.07);
    float f = smoothstep(-0.2, 0.9, fRaw);
    col += uFogColor * f * 0.018 * uFogAlpha;

    // plasma glow that rides the cursor (speed-gated, fades when idle)
    float filament = pow(max(0.0, sin(fRaw * PI * 3.2 + uTime * 0.22)), 6.0);
    vec3 plasmaColor = mix(uFogColor, uFilamentBlue, filament * 0.42);
    col += plasmaColor * pointerField * energy * 0.14;
    col += uFilamentBlue * filament * pointerField * energy * 0.08;
    col += uFogColor * pointerField * energy * 0.028;

    // gentle vignette toward orb position
    float dOrb = distance(uv * asp, uOrb * asp);
    col += uFogColor * exp(-dOrb * dOrb * 3.4) * 0.03 * uFogAlpha;

    // dive: deep blue interior
    if (uDive > 0.001) {
      vec3 dive = uDiveColor * (0.65 + 0.6 * (1.0 - dOrb));
      vec3 dp = vec3(uv * asp * 3.0, uTime * 0.07);
      dive += vec3(0.05, 0.05, 0.25) * (0.62 * snoise(dp) + 0.32 * snoise(dp * 2.07));
      col = mix(col, dive, uDive);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`;

function makeHaloTexture() {
  // Ring-shaped glow that hugs the sphere silhouette (sphere edge sits
  // at ~0.74 of the sprite half-size with sprite scale 2.7 / radius 1).
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(0.6, 'rgba(255,255,255,0)');
  g.addColorStop(0.74, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.84, 'rgba(255,255,255,0.18)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

export function initOrb(canvas) {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // post-processing chain makes MSAA redundant
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  const fovRad = (camera.fov * Math.PI) / 180;
  worldHalf.h = Math.tan(fovRad / 2) * camera.position.z;
  worldHalf.w = worldHalf.h * camera.aspect;

  // Background quad
  const bgUniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uFogColor: { value: COL.plasmaPink.clone() },
    uFogAlpha: { value: 0.4 },
    uFogSpeed: { value: 0.3 },
    uDive: { value: 0 },
    uDiveColor: { value: COL.diveBg.clone() },
    uOrb: { value: new THREE.Vector2(0.5, 0.5) },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uPointerEnergy: { value: 0 },
    uInteractionMult: { value: 1 },
    uFilamentBlue: { value: COL.filamentBlue.clone() },
  };
  bgMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: BG_VERT,
      fragmentShader: BG_FRAG,
      uniforms: bgUniforms,
      depthWrite: false,
      depthTest: false,
    })
  );
  bgMesh.renderOrder = -10;
  bgMesh.frustumCulled = false;
  scene.add(bgMesh);

  group = new THREE.Group();
  scene.add(group);

  // Core
  const coreUniforms = {
    uColor: { value: COL.plasmaPink.clone() },
    uHotColor: { value: COL.plasmaPinkHot.clone() },
    uGlow: { value: 0.5 },
    uTime: { value: 0 },
    uOpacity: { value: 1 },
  };
  coreMesh = new THREE.Mesh(
    new THREE.SphereGeometry(CORE_RADIUS, 48, 48),
    new THREE.ShaderMaterial({
      vertexShader: CORE_VERT,
      fragmentShader: CORE_FRAG,
      uniforms: coreUniforms,
      transparent: true,
    })
  );
  group.add(coreMesh);

  // Filaments (glow pass + bright core pass share geometry)
  const filGeo = makeFilamentGeometry();
  const filUniformsGlow = {
    uTime: { value: 0 },
    uSpeed: { value: 0.4 },
    uLength: { value: 1 },
    uWidth: { value: 0.05 },
    uColorA: { value: COL.filamentBlue.clone() },
    uColorB: { value: COL.filamentBlue.clone().multiplyScalar(0.35) },
    uAlpha: { value: 0.5 },
  };
  filamentGlow = new THREE.Mesh(
    filGeo,
    new THREE.ShaderMaterial({
      vertexShader: FILAMENT_VERT,
      fragmentShader: FILAMENT_FRAG,
      uniforms: filUniformsGlow,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  group.add(filamentGlow);

  const filUniformsCore = {
    uTime: { value: 0 },
    uSpeed: { value: 0.4 },
    uLength: { value: 1 },
    uWidth: { value: 0.016 },
    uColorA: { value: COL.filamentWhite.clone() },
    uColorB: { value: COL.filamentBlue.clone() },
    uAlpha: { value: 0.95 },
  };
  filamentCore = new THREE.Mesh(
    filGeo,
    new THREE.ShaderMaterial({
      vertexShader: FILAMENT_VERT,
      fragmentShader: FILAMENT_FRAG,
      uniforms: filUniformsCore,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  group.add(filamentCore);

  // Filament tips (pink sparks on the shell)
  const tipsUniforms = {
    uTime: { value: 0 },
    uSpeed: { value: 0.4 },
    uLength: { value: 1 },
    uSizeMult: { value: 1 },
    uColor: { value: COL.plasmaPinkHot.clone() },
    uAlpha: { value: 0.9 },
  };
  tips = new THREE.Points(
    makeTipsGeometry(),
    new THREE.ShaderMaterial({
      vertexShader: TIPS_VERT,
      fragmentShader: TIPS_FRAG,
      uniforms: tipsUniforms,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  group.add(tips);

  // Glass shell
  const shellUniforms = {
    uTint: { value: COL.plasmaPink.clone() },
    uOpacity: { value: 0.8 },
    uTime: { value: 0 },
    uDim: { value: 0 },
  };
  shellMesh = new THREE.Mesh(
    new THREE.SphereGeometry(SHELL_RADIUS, 64, 64),
    new THREE.ShaderMaterial({
      vertexShader: SHELL_VERT,
      fragmentShader: SHELL_FRAG,
      uniforms: shellUniforms,
      transparent: true,
      depthWrite: false,
    })
  );
  group.add(shellMesh);

  // Halo sprite
  halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeHaloTexture(),
      color: COL.plasmaPink.clone(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.35,
    })
  );
  halo.scale.setScalar(2.7);
  halo.renderOrder = -5;
  group.add(halo);

  uniformsList = [
    bgUniforms, coreUniforms, filUniformsGlow, filUniformsCore, tipsUniforms, shellUniforms,
  ];

  // Post-processing bloom
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.55, 0.6, 0.72
  );
  composer.addPass(bloomPass);

  window.addEventListener('resize', onResize);

  // Pointer drives the background plasma. Position freezes while the
  // cursor sits on the orb itself so the field doesn't fight the sphere.
  window.addEventListener('pointermove', (e) => {
    if (orbScreen.ready) {
      const dx = e.clientX - orbScreen.x;
      const dy = e.clientY - orbScreen.y;
      pointerOverOrb = Math.hypot(dx, dy) <= orbScreen.radius * 1.08;
    } else {
      pointerOverOrb = false;
    }
    if (!pointerOverOrb) {
      pointerTarget.set(e.clientX / window.innerWidth, 1 - e.clientY / window.innerHeight);
    }
  }, { passive: true });

  lastScrollY = window.scrollY;
  renderer.setAnimationLoop(render);

  return { renderer, scene, camera };
}

// Auto-degrade quality if the GPU can't keep up (software WebGL etc.)
let perfFrames = 0;
let perfTime = 0;
let perfTier = 0;
function perfCheck(dt) {
  if (perfTier >= 2) return;
  perfFrames++;
  perfTime += dt;
  if (perfFrames < 60) return;
  const avg = perfTime / perfFrames;
  perfFrames = 0;
  perfTime = 0;
  if (avg > 1 / 24) {
    perfTier++;
    if (perfTier === 1) {
      renderer.setPixelRatio(1);
      composer.setPixelRatio?.(1);
      onResize();
    } else {
      bloomPass.enabled = false;
    }
  }
}

function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  const fovRad = (camera.fov * Math.PI) / 180;
  worldHalf.h = Math.tan(fovRad / 2) * camera.position.z;
  worldHalf.w = worldHalf.h * camera.aspect;
  uniformsList[0].uRes.value.set(w, h);
}

const tmpColor = new THREE.Color();
const tmpColor2 = new THREE.Color();
const tmpColor3 = new THREE.Color();
const tmpColor4 = new THREE.Color();

function render() {
  const dt = clock.getDelta();
  const t = clock.elapsedTime;
  perfCheck(dt);
  const s = orbState;
  const k = s.ease;
  for (const key of Object.keys(s.target)) {
    s.current[key] += (s.target[key] - s.current[key]) * k;
  }
  const c = s.current;
  const [bgU, coreU, glowU, fcoreU, tipsU, shellU] = uniformsList;

  // Position & scale: x/y given in fractions of half-viewport
  group.position.x = c.x * worldHalf.w;
  group.position.y = c.y * worldHalf.h;
  const sc = Math.max(0.001, c.scale);
  group.scale.setScalar(sc);

  const dim = c.dim;
  const fade = c.opacity;
  const theme = c.theme;
  const cool = c.cool;

  // Theme colors
  const corePink = tmpColor.copy(COL.plasmaPink).lerp(COL.warmGold, theme);
  const coreHot = tmpColor2.copy(COL.plasmaPinkHot).lerp(COL.warmCore, theme);
  // Intro surge: halo/shell/fog shift fully to icy blue-white while
  // the core keeps most of its pink (matches the original's burst).
  const shellCol = tmpColor4.copy(corePink);
  if (cool > 0.001) {
    shellCol.lerp(COL.coolShell, cool);
    corePink.lerp(COL.coolShell, cool * 0.35);
    coreHot.lerp(COL.coolHot, cool * 0.6);
  }

  coreU.uTime.value = t;
  coreU.uColor.value.copy(corePink);
  coreU.uHotColor.value.copy(coreHot);
  coreU.uGlow.value = c.coreGlow * (1 - dim * 0.75) * fade;
  coreU.uOpacity.value = fade;

  const filBlue = tmpColor3.copy(COL.filamentBlue).lerp(COL.warmFil, theme);
  if (cool > 0.001) filBlue.lerp(COL.coolFil, cool * 0.7);
  glowU.uTime.value = t;
  glowU.uSpeed.value = c.filamentSpeed;
  glowU.uLength.value = c.filamentLength;
  glowU.uColorA.value.copy(filBlue);
  glowU.uColorB.value.copy(filBlue).multiplyScalar(0.3);
  glowU.uAlpha.value = 0.16 * c.filamentAlpha * (1 - dim * 0.8) * fade;
  glowU.uWidth.value = 0.022 * (1 + c.filamentSpeed * 0.5);

  fcoreU.uTime.value = t;
  fcoreU.uSpeed.value = c.filamentSpeed;
  fcoreU.uLength.value = c.filamentLength;
  fcoreU.uColorB.value.copy(filBlue);
  fcoreU.uAlpha.value = 1.0 * c.filamentAlpha * (1 - dim * 0.85) * fade;
  fcoreU.uWidth.value = 0.009 * (1 + c.filamentSpeed * 0.9);

  tipsU.uTime.value = t;
  tipsU.uSpeed.value = c.filamentSpeed;
  tipsU.uLength.value = c.filamentLength;
  tipsU.uColor.value.copy(coreHot);
  tipsU.uAlpha.value = 0.9 * c.filamentAlpha * (1 - dim * 0.85) * fade;
  tipsU.uSizeMult.value = sc * (window.devicePixelRatio > 1.5 ? 1.5 : 1);

  shellU.uTime.value = t;
  shellU.uTint.value.copy(shellCol);
  shellU.uOpacity.value = c.glass * 1.6 * fade * (1 - c.dive);
  shellU.uDim.value = dim;

  halo.material.color.copy(shellCol);
  halo.material.opacity = c.halo * (1 - dim * 0.85) * fade * (1 - c.dive);

  bgU.uTime.value = t;
  bgU.uFogColor.value.copy(shellCol);
  bgU.uFogAlpha.value = c.fogAlpha * (1 - dim * 0.6) * fade;
  bgU.uFogSpeed.value = c.fogSpeed;
  bgU.uDive.value = c.dive;
  // orb position in uv coords for the bg gradient
  bgU.uOrb.value.set(0.5 + c.x * 0.5, 0.5 + c.y * 0.5);

  // ----- cursor interaction -----
  // Cache the orb's screen-space footprint for the pointermove handler
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  orbScreen.x = (0.5 + c.x * 0.5) * vw;
  orbScreen.y = (0.5 - c.y * 0.5) * vh;
  orbScreen.radius = sc * SHELL_RADIUS * 1.02 * (vh / (2 * worldHalf.h));
  orbScreen.ready = fade > 0.05;

  // Pointer chases the mouse with heavy damping; energy comes from how
  // far it lags behind (i.e. mouse speed) and dies out when idle.
  const pU = bgU.uPointer.value;
  pU.lerp(pointerTarget, 1 - Math.pow(8e-4, dt));
  const lag = pU.distanceTo(pointerTarget);
  const eTarget = pointerOverOrb ? 0 : Math.min(lag * 18, 1);
  bgU.uPointerEnergy.value +=
    (eTarget - bgU.uPointerEnergy.value) * (1 - Math.pow(0.002, dt));

  // Damp the field while diving into the core or scrolling fast
  const sy = window.scrollY;
  const fastScroll = Math.abs(sy - lastScrollY) / Math.max(dt, 1e-3) > 900;
  lastScrollY = sy;
  scrollMult += ((fastScroll ? 0.4 : 1) - scrollMult) * Math.min(1, dt * 4);
  bgU.uInteractionMult.value = scrollMult * (1 - c.dive);
  bgU.uFilamentBlue.value.copy(filBlue);

  bloomPass.strength = 0.55 + c.filamentSpeed * 0.35 + c.dive * 0.3;

  composer.render();
}
