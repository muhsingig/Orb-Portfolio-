import { projects } from './data.js';

// Project detail overlay with plasma flash burst on open.
export function initProjectDetail() {
  const detail = document.getElementById('project-detail');
  const flash = document.getElementById('plasma-flash');
  const scrollBox = document.getElementById('detail-scroll');
  const navTitle = document.getElementById('detail-nav-title');
  const nameEl = document.getElementById('detail-name');
  const baselineEl = document.getElementById('detail-baseline');
  const conceptEl = document.getElementById('detail-concept');
  const stackEl = document.getElementById('detail-stack');
  const roleEl = document.getElementById('detail-role');
  const heroBg = document.getElementById('detail-hero-bg');
  const closeBtn = document.getElementById('detail-close');
  const prevBtn = document.getElementById('detail-prev');
  const nextBtn = document.getElementById('detail-next');
  const viewLink = document.getElementById('project-view');

  let openIndex = 0;
  let state = 'closed';

  function fill(i) {
    const p = projects[i];
    navTitle.textContent = p.name;
    nameEl.textContent = p.name;
    baselineEl.textContent = p.baseline;
    conceptEl.textContent = p.concept;
    stackEl.textContent = p.stack;
    roleEl.textContent = p.role;
    // Procedural gradient backdrop as hero image placeholder
    heroBg.style.background = `
      radial-gradient(120% 90% at 30% 20%, #2a0a3a 0%, transparent 60%),
      radial-gradient(100% 80% at 80% 60%, #14154f 0%, transparent 65%),
      radial-gradient(70% 70% at 60% 30%, #f74fa733 0%, transparent 70%),
      #0a0a14`;
  }

  function open(i, originX, originY) {
    if (state !== 'closed') return;
    state = 'entering';
    openIndex = i;
    fill(i);
    document.documentElement.classList.add('overlay-open');

    flash.style.setProperty('--ox', `${originX}px`);
    flash.style.setProperty('--oy', `${originY}px`);
    flash.classList.remove('plasmaFlash--entering');
    void flash.offsetWidth;
    flash.classList.add('plasmaFlash--entering');

    detail.classList.add('projectDetail--entering');
    detail.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      detail.classList.remove('projectDetail--entering');
      detail.classList.add('projectDetail--visible');
      state = 'open';
    }, 560);
    scrollBox.scrollTop = 0;
  }

  function close() {
    if (state !== 'open') return;
    state = 'exiting';
    detail.classList.remove('projectDetail--visible');
    detail.classList.add('projectDetail--exiting');
    setTimeout(() => {
      detail.classList.remove('projectDetail--exiting');
      detail.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('overlay-open');
      state = 'closed';
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
