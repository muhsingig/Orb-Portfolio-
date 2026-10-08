import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildSections } from './sections.js';
import { initScroll } from './scroll.js';
import { initPreloader, INTRO } from './preloader.js';
import { initProjectDetail } from './projectDetail.js';
import {
  initSmoothScroll, initChrome, initCursor, initSpotlight,
  initMagnetic, initReveals, initProgressBar,
} from './ui.js';
import { orbState } from './orb/state.js';
import { initPlasmaClick } from './plasmaClick.js';
import { initContactForm } from './contactForm.js';

// Keep scroll position at top on load (matches preloader gate)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const whenIdle = (fn, timeout = 1500) =>
  ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout }) : setTimeout(fn, 200));
const nextTask = () => new Promise((r) => setTimeout(r, 0));

// Without a fast GPU (software WebGL: no graphics chip, some VMs and remote
// desktops) the orb runs in a lighter mode and the electric logo is skipped.
// Checked only when the orb is about to start. ?fullorb forces the full
// experience for testing.
function hasFastGPU() {
  if (new URLSearchParams(location.search).has('fullorb')) return true;
  try {
    const probe = document.createElement('canvas');
    const opts = { failIfMajorPerformanceCaveat: true };
    const gl = probe.getContext('webgl2', opts) || probe.getContext('webgl', opts);
    if (!gl) return false;
    // software rasterisers don't always trip the caveat flag; their names do
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
  } catch {
    return false;
  }
}
let lite = null;
function isLite() {
  if (lite === null) {
    lite = !hasFastGPU();
    document.documentElement.classList.toggle('gpu-lite', lite);
  }
  return lite;
}

let entered = false;
let onEnterHint = () => {};
let islands = null;

// WebGL orb, its own chunk. If it fails (driver, blocklist, remote
// desktop), the site must still work as a plain page.
let orbStarted = false;
function startOrb() {
  if (orbStarted) return;
  orbStarted = true;
  const liteMode = isLite();
  import('./orb/scene.js')
    .then(({ initOrb }) => {
      initOrb(document.getElementById('orb-canvas'), { lite: liteMode });
      // faintly alive behind the ENTER screen, full power once entered
      if (!entered) orbState.target.opacity = 0.5;
      // the still poster fades as the live orb eases in over it
      requestAnimationFrame(() => document.documentElement.classList.add('orb-live'));
    })
    .catch((err) => {
      console.error('Orb init failed — continuing without WebGL:', err);
      const canvas = document.getElementById('orb-canvas');
      if (canvas) canvas.style.display = 'none';
      document.body.classList.add('no-webgl');
    });
}

// The loading screen shows a still of the orb. The live orb (and the
// electric logo) compile their shaders on the first sign of a visitor:
// moving the mouse, touching, scrolling or pressing a key. That's usually
// well before the ENTER click, and it keeps the first screen fast.
// Without a fast GPU they wait for ENTER itself.
const WAKE_EVENTS = ['pointermove', 'pointerdown', 'touchstart', 'keydown', 'wheel'];
const wakeOpts = { passive: true, capture: true };
function wake() {
  WAKE_EVENTS.forEach((t) => window.removeEventListener(t, wake, wakeOpts));
  if (entered || isLite()) return;
  startOrb();
  islands?.then((m) => m.mountElectric('preloader-electric')).catch(() => {});
}

// The scroll engine measures every section, which is a lot of layout.
// Scrolling is locked on the loading screen, so it's set up once the first
// screen is in (or at ENTER, if that comes first).
let scrollReady = false;
function initScrollStack() {
  if (scrollReady) return;
  scrollReady = true;
  try {
    const { setHint } = initScroll();
    onEnterHint = setHint;
  } catch (err) {
    console.error('Scroll choreography failed:', err);
  }
  initProgressBar();
  initReveals();
  initMagnetic('.magnetic, .preloader__cta, .liveProject, .viewProject, .projectDetail__live, .contactSection__email');
}

function onEnter() {
  entered = true;
  initSmoothScroll(); // starts stopped; the preloader unlocks it after the intro
  initScrollStack();
  startOrb();
  islands?.then((m) => m.mountBelowFold()).catch(() => {});
  // header logo goes electric once the intro has settled
  setTimeout(
    () => whenIdle(() => islands?.then((m) => m.mountElectric('header-electric')).catch(() => {})),
    INTRO.charge + INTRO.burst + INTRO.settle,
  );
  const T = orbState.target;
  T.opacity = 1;
  const burstAt = INTRO.charge / 1000;
  // charge: fast snap to icy blue (~0.5s), then HOLD charged
  gsap.to(T, {
    cool: 1,
    halo: 1.2,
    fogAlpha: 0.65,
    fogSpeed: 1.5,
    duration: 0.55,
    ease: 'power2.out',
  });
  // while held, the filaments grow more and more energetic
  gsap.to(T, {
    filamentSpeed: 1.15,
    coreGlow: 1.0,
    duration: 1.5,
    ease: 'power1.in',
    delay: 0.4,
  });
  // burst: quick snap back to the resting pink state
  gsap.to(T, {
    cool: 0,
    halo: 0.55,
    coreGlow: 0.55,
    filamentSpeed: 0.35,
    fogAlpha: 0.45,
    fogSpeed: 0.3,
    duration: 0.55,
    ease: 'power2.inOut',
    delay: burstAt,
  });
  // scale kick at the burst moment
  gsap.to(T, {
    scale: 1.05,
    duration: 0.14,
    ease: 'power2.out',
    delay: burstAt,
    yoyo: true,
    repeat: 1,
  });
  // scroll hint after the title has settled
  setTimeout(() => onEnterHint(true), INTRO.charge + INTRO.burst + INTRO.settle + 300);
}

// The loading screen is plain HTML and paints on its own; the app boots
// right after that first frame, in a few short steps rather than one long
// one, so the page never looks frozen.
async function boot() {
  buildSections();
  // Wire the ENTER button before anything heavy can fail —
  // the preloader must always be dismissible.
  initPreloader(onEnter);
  await nextTask();

  initChrome();
  initCursor();
  initSpotlight();
  initProjectDetail();
  // every click crackles at the cursor and makes the orb flare
  initPlasmaClick({ onStrike: () => { orbState.surge = Math.min(1.4, orbState.surge + 0.85); } });
  // a sent message makes the orb flare
  initContactForm({ onSent: () => { orbState.surge = 1.4; } });
  WAKE_EVENTS.forEach((t) => window.addEventListener(t, wake, wakeOpts));
  await nextTask();

  // React Bits islands are their own chunk. The header and hero pieces
  // mount when it arrives; everything below the fold is built after ENTER,
  // while the intro plays.
  islands = import('./react/islands.jsx');
  islands
    .then((m) => whenIdle(() => m.mountAboveFold()))
    .catch((err) => console.error('React islands failed to load:', err));

  whenIdle(initScrollStack, 1200);

  // React islands (and lazy images) settle after the first measurement:
  // re-measure every scroll range whenever the page height changes.
  let lastHeight = 0;
  let refreshTimer;
  new ResizeObserver(() => {
    const h = document.documentElement.scrollHeight;
    if (Math.abs(h - lastHeight) < 2) return;
    lastHeight = h;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => { if (scrollReady) ScrollTrigger.refresh(); }, 150);
  }).observe(document.getElementById('main'));

  // Fonts change line lengths and section heights: re-measure once loaded
  if (document.fonts) document.fonts.ready.then(() => { if (scrollReady) ScrollTrigger.refresh(); });
}

// loaded by src/boot.js after the loading screen's first paint
boot();
