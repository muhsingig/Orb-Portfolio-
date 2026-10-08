import { projects } from './data.js';
import { lockScroll } from './ui.js';

const pad2 = (n) => String(n + 1).padStart(2, '0');

// Project detail overlay with plasma flash burst on open.
export function initProjectDetail() {
  const detail = document.getElementById('project-detail');
  const flash = document.getElementById('plasma-flash');
  const scrollBox = document.getElementById('detail-scroll');
  const navTitle = document.getElementById('detail-nav-title');
  const navNum = document.getElementById('detail-nav-num');
  const nameEl = document.getElementById('detail-name');
  const catEl = document.getElementById('detail-cat');
  const baselineEl = document.getElementById('detail-baseline');
  const conceptEl = document.getElementById('detail-concept');
  const highlightsEl = document.getElementById('detail-highlights');
  const stackEl = document.getElementById('detail-stack');
  const roleEl = document.getElementById('detail-role');
  const timeEl = document.getElementById('detail-time');
  const yearEl = document.getElementById('detail-year');
  const liveEl = document.getElementById('detail-live');
  const heroBg = document.getElementById('detail-hero-bg');
  const heroNum = document.getElementById('detail-hero-num');
  const closeBtn = document.getElementById('detail-close');
  const prevBtn = document.getElementById('detail-prev');
  const nextBtn = document.getElementById('detail-next');
  const prevName = document.getElementById('detail-prev-name');
  const nextName = document.getElementById('detail-next-name');
  const viewLink = document.getElementById('project-view');
  const preview = document.getElementById('detail-preview');
  const previewUrl = document.getElementById('detail-preview-url');
  const previewOpen = document.getElementById('detail-preview-open');
  const previewFrame = document.getElementById('detail-preview-frame');

  let openIndex = 0;
  let state = 'closed';
  let returnFocus = null;

  function fill(i) {
    const p = projects[i];
    const n = projects.length;
    detail.style.setProperty('--accent', p.accent);
    detail.style.setProperty('--dive', p.dive);
    navNum.textContent = `${pad2(i)} — `;
    navTitle.textContent = p.name;
    heroNum.textContent = pad2(i);
    catEl.textContent = p.category;
    nameEl.textContent = p.name;
    baselineEl.textContent = p.baseline;
    conceptEl.textContent = p.concept;
    highlightsEl.innerHTML = p.highlights
      .map((h, hi) => `<li><span class="highlightsSection__num">${pad2(hi)}</span><p>${h}</p></li>`)
      .join('');
    stackEl.textContent = p.stack;
    roleEl.textContent = p.role;
    timeEl.textContent = p.timeframe;
    yearEl.textContent = p.year;
    const link = p.url || p.deck;
    liveEl.hidden = !link;
    if (link) {
      liveEl.href = link;
      liveEl.innerHTML = `${p.url ? 'Visit live site' : 'View the deck'} <span>&#8599;</span>`;
    }
    preview.hidden = !p.url;
    if (p.url) {
      previewUrl.textContent = p.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      previewOpen.href = p.url;
      previewFrame.src = p.url;
    } else {
      previewFrame.src = 'about:blank';
    }
    prevName.textContent = projects[(i - 1 + n) % n].name;
    nextName.textContent = projects[(i + 1) % n].name;
    // Procedural backdrop in the project's own colours
    heroBg.style.background = `
      linear-gradient(90deg, #070707f2 0%, #070707b3 38%, #07070733 75%),
      linear-gradient(180deg, #07070726 0%, #070707 96%),
      radial-gradient(90% 70% at 22% 18%, ${p.accent}40 0%, transparent 60%),
      url("${p.image}") center / cover no-repeat,
      ${p.dive}`;
  }

  function open(i, originX, originY) {
    if (state !== 'closed') return;
    state = 'entering';
    openIndex = i;
    returnFocus = document.activeElement;
    fill(i);
    document.documentElement.classList.add('overlay-open');
    lockScroll(true);

    flash.style.setProperty('--ox', `${originX}px`);
    flash.style.setProperty('--oy', `${originY}px`);
    flash.style.setProperty('--flash', projects[i].accent);
    flash.classList.remove('plasmaFlash--entering');
    void flash.offsetWidth;
    flash.classList.add('plasmaFlash--entering');

    detail.classList.add('projectDetail--entering');
    detail.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      detail.classList.remove('projectDetail--entering');
      detail.classList.add('projectDetail--visible');
      document.documentElement.classList.add('overlay-settled');
      state = 'open';
      closeBtn.focus({ preventScroll: true });
    }, 560);
    scrollBox.scrollTop = 0;
  }

  function close() {
    if (state !== 'open') return;
    state = 'exiting';
    document.documentElement.classList.remove('overlay-settled');
    detail.classList.remove('projectDetail--visible');
    detail.classList.add('projectDetail--exiting');
    setTimeout(() => {
      detail.classList.remove('projectDetail--exiting');
      detail.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('overlay-open');
      lockScroll(false);
      previewFrame.src = 'about:blank';
      state = 'closed';
      if (returnFocus) returnFocus.focus({ preventScroll: true });
    }, 520);
  }

  function swap(delta) {
    openIndex = (openIndex + delta + projects.length) % projects.length;
    scrollBox.classList.add('projectDetail__scroll--fading');
    setTimeout(() => {
      fill(openIndex);
      scrollBox.scrollTop = 0;
      scrollBox.classList.remove('projectDetail__scroll--fading');
    }, 240);
  }

  viewLink.addEventListener('click', (e) => {
    e.preventDefault();
    const i = Number(viewLink.dataset.index || 0);
    const r = viewLink.getBoundingClientRect();
    open(i, r.left + r.width / 2, r.top);
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', () => swap(-1));
  nextBtn.addEventListener('click', () => swap(1));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}
