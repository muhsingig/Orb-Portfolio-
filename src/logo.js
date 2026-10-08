// Muhsin Gigani logo: the G is the orb's orbit, the M a plasma bolt through
// its core. Built inline (not <img>) so the ring, bolt and core can animate;
// ids get a per-instance prefix so several copies can share one page.
// Standalone files live in public/brand/.
let count = 0;

export function logoSVG({ label = 'Muhsin Gigani' } = {}) {
  const p = `mg-logo-${++count}`;
  return `<svg class="logo" viewBox="0 0 120 120" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="${p}-ring" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff8ccd"/>
      <stop offset="0.5" stop-color="#f74fa7"/>
      <stop offset="1" stop-color="#9b5cff"/>
    </linearGradient>
    <radialGradient id="${p}-glass" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#3a1440"/>
      <stop offset="0.72" stop-color="#160a1f"/>
      <stop offset="0.94" stop-color="#2a0f33"/>
      <stop offset="1" stop-color="#4a1a55"/>
    </radialGradient>
    <radialGradient id="${p}-core" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#fff"/>
      <stop offset="0.35" stop-color="#ffc2e4" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#f74fa7" stop-opacity="0"/>
    </radialGradient>
    <filter id="${p}-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>
  </defs>
  <circle class="logo__glass" cx="60" cy="60" r="44" fill="url(#${p}-glass)"/>
  <path class="logo__ring" pathLength="100" d="M91.11 28.89A44 44 0 1 0 104 60H92" fill="none" stroke="url(#${p}-ring)" stroke-width="7" stroke-linecap="round"/>
  <circle class="logo__core" cx="60" cy="63" r="17" fill="url(#${p}-core)"/>
  <g class="logo__bolt">
    <polyline pathLength="100" points="33,77 44,45 60,66 76,45 87,77" fill="none" stroke="#9db8ff" stroke-width="7" stroke-linejoin="miter" filter="url(#${p}-glow)" opacity="0.9"/>
    <polyline pathLength="100" points="33,77 44,45 60,66 76,45 87,77" fill="none" stroke="#fff" stroke-width="4.2" stroke-linejoin="miter" stroke-linecap="round"/>
  </g>
</svg>`;
}
