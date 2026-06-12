// Preloader: orb + ENTER. On enter a phased intro plays, with timings
// matching the original site:
//   charge   0–1100ms    orb ramps pink -> icy blue
//   burst    1100–1900ms electric strokes flash over the title,
//                        orb snaps back toward pink
//   reveal   1900ms      title outline + baseline fade up, scroll unlocks
//   settled  4300ms      solid white title fill completes
// Deliberately has no dependency on the WebGL module so ENTER always works.
export const INTRO = { charge: 1100, burst: 800, settle: 2400 };

export function initPreloader(onEnter) {
  const preloader = document.getElementById('preloader');
  const btn = document.getElementById('enter-btn');
  const stack = document.getElementById('hero-title-stack');

  document.documentElement.classList.add('scroll-locked');
  document.body.classList.add('hero-pending', 'fill-pending');

  sizeElecSvg();
  window.addEventListener('resize', sizeElecSvg);

  // Keyboard access: Enter/Space also work
  btn.focus({ preventScroll: true });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') btn.click();
  }, { once: true });

  const tBurst = INTRO.charge;
  const tReveal = INTRO.charge + INTRO.burst;
  const tSettled = tReveal + INTRO.settle;

  let entered = false;
  btn.addEventListener('click', () => {
    if (entered) return;
    entered = true;
    preloader.classList.add('preloader--hidden');

    // burst: lightning strokes flash over the (still hidden) title
    setTimeout(() => stack.classList.add('elec-active'), tBurst);

    // reveal: strokes cut out, outline + baseline fade up, scroll unlocks
    setTimeout(() => {
      stack.classList.remove('elec-active');
      document.body.classList.remove('hero-pending');
      document.documentElement.classList.remove('scroll-locked');
      preloader.remove();
    }, tReveal);

    // settled: solid white fill completes over the outline
    setTimeout(() => document.body.classList.remove('fill-pending'), tSettled);

    if (onEnter) onEnter();
  });
}

// Match the SVG text position to the H1 so strokes overlay the title
function sizeElecSvg() {
  const svg = document.getElementById('hero-elec');
  const outline = document.getElementById('hero-title-outline');
  if (!svg || !outline) return;
  const pad = 40;
  const rect = outline.getBoundingClientRect();
  svg.setAttribute('viewBox', `${-pad} ${-pad} ${rect.width + pad * 2} ${rect.height + pad * 2}`);
  // Baseline: approximate cap-height placement
  const baselineY = rect.height * 0.79;
  svg.querySelectorAll('text').forEach((t) => {
    t.setAttribute('x', '0');
    t.setAttribute('y', String(baselineY));
  });
}
