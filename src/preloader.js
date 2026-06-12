// Preloader: black screen + ENTER. On enter: fade out, hero title
// electric animation starts, scrolling unlocks. Deliberately has no
// dependency on the WebGL module so ENTER always works.
export function initPreloader(onEnter) {
  const preloader = document.getElementById('preloader');
  const btn = document.getElementById('enter-btn');
  const stack = document.getElementById('hero-title-stack');

  document.documentElement.classList.add('scroll-locked');
  document.body.classList.add('hero-pending');

  sizeElecSvg();
  window.addEventListener('resize', sizeElecSvg);

  // Keyboard access: Enter/Space also work
  btn.focus({ preventScroll: true });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') btn.click();
  }, { once: true });

  let entered = false;
  btn.addEventListener('click', () => {
    if (entered) return;
    entered = true;
    preloader.classList.add('preloader--hidden');
    document.documentElement.classList.remove('scroll-locked');

    // Title + electric strokes
    setTimeout(() => {
      document.body.classList.remove('hero-pending');
      stack.classList.add('elec-active');
    }, 450);

    setTimeout(() => preloader.remove(), 1400);
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
