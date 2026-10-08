// Plasma click: wherever you click, a few branching lightning bolts crackle
// out of the cursor with a faint shockwave ring, and `onStrike` lets the big
// orb surge in sympathy. Canvas is fixed and click-through; the draw loop
// only runs while a strike is alive.
const BOLT_LIFE = 340;   // ms
const RING_LIFE = 560;
const BOLTS = 6;
const GLOW = ['#ff8ccd', '#b98cff', '#9db8ff'];

export function initPlasmaClick({ onStrike } = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'plasmaClick';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
  };
  resize();
  window.addEventListener('resize', resize);

  const strikes = [];
  let raf = null;

  // Jagged path from (x, y) along `angle` by midpoint displacement
  function zigzag(x, y, angle, len, rough) {
    let pts = [[x, y], [x + Math.cos(angle) * len, y + Math.sin(angle) * len]];
    let amp = len * rough;
    for (let pass = 0; pass < 3; pass++) {
      const next = [pts[0]];
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1];
        const [bx, by] = pts[i];
        const off = (Math.random() - 0.5) * amp;
        next.push([(ax + bx) / 2 - Math.sin(angle) * off, (ay + by) / 2 + Math.cos(angle) * off], [bx, by]);
      }
      pts = next;
      amp *= 0.5;
    }
    return pts;
  }

  function makeBolts(s) {
    s.bolts = [];
    for (let i = 0; i < BOLTS; i++) {
      const angle = (i / BOLTS) * Math.PI * 2 + s.spin + (Math.random() - 0.5) * 0.6;
      const len = 34 + Math.random() * 46;
      const main = zigzag(s.x, s.y, angle, len, 0.32);
      const fork = main[3 + Math.floor(Math.random() * 3)];
      const branch = zigzag(fork[0], fork[1], angle + (Math.random() < 0.5 ? -1 : 1) * (0.45 + Math.random() * 0.4), len * 0.42, 0.4);
      s.bolts.push({ main, branch, color: GLOW[i % GLOW.length] });
    }
  }

  function strokePath(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }

  function draw(now) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = strikes.length - 1; i >= 0; i--) {
      const s = strikes[i];
      const age = now - s.born;
      if (age > RING_LIFE) {
        strikes.splice(i, 1);
        continue;
      }

      // shockwave ring
      const rt = age / RING_LIFE;
      const ease = 1 - Math.pow(1 - rt, 3);
      ctx.strokeStyle = `rgba(185, 205, 255, ${(0.5 * (1 - rt)).toFixed(3)})`;
      ctx.lineWidth = 1.6 * (1 - rt) + 0.3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 6 + ease * 66, 0, Math.PI * 2);
      ctx.stroke();

      if (age < BOLT_LIFE) {
        const bt = age / BOLT_LIFE;
        // re-strike the bolts every couple of frames so they crackle
        if (now - s.lastJitter > 45) {
          makeBolts(s);
          s.lastJitter = now;
        }
        const flicker = 0.55 + Math.random() * 0.45;
        const alpha = (1 - bt) * flicker;

        // hot core flash
        const coreR = 16 * (1 - bt * 0.6);
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, coreR);
        g.addColorStop(0, `rgba(255, 255, 255, ${alpha.toFixed(3)})`);
        g.addColorStop(0.4, `rgba(255, 160, 215, ${(alpha * 0.6).toFixed(3)})`);
        g.addColorStop(1, 'rgba(247, 79, 167, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(s.x, s.y, coreR, 0, Math.PI * 2);
        ctx.fill();

        for (const b of s.bolts) {
          ctx.globalAlpha = alpha;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 12;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 2.6;
          strokePath(b.main);
          ctx.lineWidth = 1.6;
          strokePath(b.branch);
          ctx.shadowBlur = 0;
          ctx.strokeStyle = '#f6f8ff';
          ctx.lineWidth = 1;
          strokePath(b.main);
          ctx.lineWidth = 0.7;
          strokePath(b.branch);
        }
        ctx.globalAlpha = 1;
      }
    }

    raf = strikes.length ? requestAnimationFrame(draw) : null;
    if (!raf) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  window.addEventListener('click', (e) => {
    // keyboard-triggered clicks report 0,0; no strike in the corner for those
    if (e.detail === 0) return;
    const now = performance.now();
    const s = { x: e.clientX, y: e.clientY, born: now, lastJitter: now, spin: Math.random() * Math.PI };
    makeBolts(s);
    strikes.push(s);
    onStrike?.();
    if (!raf) raf = requestAnimationFrame(draw);
  });
}
