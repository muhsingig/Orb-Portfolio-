// Orb state shared by the scroll director, the intro and the renderer.
// Kept free of three.js so the 3D scene (src/orb/scene.js) can load as its
// own chunk after the page is up.
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
    theme: 0,        // 0 = pink/blue, 1 = electric violet
    cool: 0,         // 0 = normal, 1 = icy blue surge (intro charge/burst)
    wine: 0,         // 0 = normal, 1 = burgundy (certificates)
    fogAlpha: 0.45,  // background fog amount
    fogSpeed: 0.3,
    opacity: 0,      // master orb opacity (fades in after preloader)
    dR: 0, dG: 0, dB: 0, // inside-the-orb colour (linear RGB), set per project
  },
  current: null,
  ease: 0.075,
  surge: 0,          // click kick (src/plasmaClick.js); decays on its own
};

// sRGB channel -> linear, the same curve three.js applies to hex colours
const toLinear = (c) => (c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4));

// Linear-space RGB for a hex colour, in the shape the dive keys expect
export function diveRGB(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return {
    dR: toLinear(((n >> 16) & 255) / 255),
    dG: toLinear(((n >> 8) & 255) / 255),
    dB: toLinear((n & 255) / 255),
  };
}

Object.assign(orbState.target, diveRGB('#16166e'));
orbState.current = { ...orbState.target };
// Dev hook for inspecting/driving the orb from the console
if (import.meta.env.DEV) window.__orbState = orbState;
