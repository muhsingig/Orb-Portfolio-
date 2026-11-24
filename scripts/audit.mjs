#!/usr/bin/env node
// Site audit: opens a site in headless Chrome on a laptop screen and a phone,
// clicks through it and reports anything broken.
//
//   npm run audit                          the local preview (npm run preview)
//   npm run audit -- https://any-site.com  any live site, e.g. a client's
//
// Checks: JavaScript errors, failed files, every link (internal and
// external), images, buttons without a name, sideways scrolling on phones,
// search basics (title, description, link preview, structured data,
// robots.txt, sitemap, llms.txt), and on this portfolio the case studies,
// FAQ, contact form checks and analytics events.
// Nothing is ever sent: form posts and other uploads are blocked during the run.
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const TARGET = process.argv[2] || 'http://localhost:4173/';
const CHROME = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
].find((p) => p && existsSync(p));
if (!CHROME) {
  console.error('No Chrome or Edge found. Set CHROME_PATH.');
  process.exit(2);
}

const PORT = 9300 + Math.floor(Math.random() * 500);
const PROFILE = mkdtempSync(join(tmpdir(), 'site-audit-'));
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${PROFILE}`, '--headless=new',
  '--no-first-run', '--no-default-browser-check', '--enable-unsafe-swiftshader',
  '--mute-audio', '--hide-scrollbars',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA_DESKTOP = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const UA_PHONE = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36';

// ---------- a tiny Chrome DevTools client ----------
class Page {
  static async open() {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
    const page = new Page();
    await page.connect((await r.json()).webSocketDebuggerUrl);
    return page;
  }

  connect(url) {
    this.seq = 0;
    this.waiting = new Map();
    this.listeners = [];
    this.ws = new WebSocket(url);
    this.ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.waiting.has(m.id)) {
        const { res, rej } = this.waiting.get(m.id);
        this.waiting.delete(m.id);
        if (m.error) rej(new Error(m.error.message));
        else res(m.result);
      } else if (m.method) this.listeners.forEach((fn) => fn(m));
    };
    return new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = rej; });
  }

  send(method, params = {}) {
    const id = ++this.seq;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.waiting.set(id, { res, rej }));
  }

  on(fn) { this.listeners.push(fn); }

  async eval(fn, ...args) {
    const expression = `(${fn})(...${JSON.stringify(args)})`;
    const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  }

  async goto(url) {
    const loaded = new Promise((r) => this.on((m) => m.method === 'Page.loadEventFired' && r()));
    await this.send('Page.navigate', { url });
    await Promise.race([loaded, sleep(45000)]);
  }

  close() { this.ws.close(); }
}

// ---------- in-page steps (run inside the browser) ----------

// Block anything that would send data, so a test never posts a form.
function blockSends() {
  const realFetch = window.fetch;
  window.fetch = (input, init = {}) => {
    const method = (init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    return method === 'GET' || method === 'HEAD'
      ? realFetch(input, init)
      : Promise.reject(new TypeError('blocked by audit'));
  };
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, ...rest) {
    this.__auditBlocked = !/^(GET|HEAD)$/i.test(method);
    return open.call(this, method, ...rest);
  };
  const send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...a) {
    if (this.__auditBlocked) throw new Error('blocked by audit');
    return send.apply(this, a);
  };
  navigator.sendBeacon = () => true;
  document.addEventListener('submit', (e) => e.preventDefault(), true);
}

async function getPastIntro() {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  window.dispatchEvent(new PointerEvent('pointermove', { clientX: 200, clientY: 200 }));
  for (let i = 0; i < 20; i++) {
    const b = [...document.querySelectorAll('button, a')]
      .find((e) => /^\s*enter\b/i.test(e.textContent) && e.offsetParent !== null);
    if (b) { b.click(); return true; }
    await wait(300);
  }
  return false;
}

async function scrollThrough() {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.6) {
    window.scrollTo(0, y);
    await wait(220);
  }
  await wait(800);
}

function inspect() {
  const vw = document.documentElement.clientWidth;
  const shown = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[aria-hidden="true"]');
  };
  const links = [...document.querySelectorAll('a[href]')].map((a) => ({
    href: a.href,
    raw: a.getAttribute('href'),
    text: (a.textContent.trim() || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').slice(0, 40),
  }));
  const ids = new Set([...document.querySelectorAll('[id]')].map((e) => e.id));
  const badHashes = [...new Set(links
    .filter((l) => l.raw.startsWith('#') && l.raw.length > 1 && !ids.has(decodeURIComponent(l.raw.slice(1))))
    .map((l) => l.raw))];
  const brokenImages = [...document.images]
    .filter((i) => i.complete && i.naturalWidth === 0 && i.currentSrc)
    .map((i) => i.currentSrc);
  const unnamed = [...document.querySelectorAll('button, a[href], [role="button"], summary')]
    .filter((e) => shown(e) && !(
      e.textContent.trim() || e.getAttribute('aria-label') || e.getAttribute('aria-labelledby')
      || e.getAttribute('title') || e.querySelector('img[alt]:not([alt=""]), svg title')))
    .map((e) => e.outerHTML.slice(0, 100));
  const overflow = document.documentElement.scrollWidth - vw;
  const tooWide = [];
  if (overflow > 1) {
    for (const el of document.body.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > vw + 2 && !el.children.length && shown(el)) {
        const cls = typeof el.className === 'string' && el.className ? `.${el.className.split(' ')[0]}` : '';
        tooWide.push(`${el.tagName.toLowerCase()}${cls} reaches ${Math.round(r.right)}px`);
        if (tooWide.length >= 8) break;
      }
    }
  }
  const meta = (sel) => document.querySelector(sel)?.getAttribute('content') || '';
  const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
    try {
      const j = JSON.parse(s.textContent);
      return (j['@graph'] || [j]).map((g) => g['@type']).join(', ');
    } catch { return 'INVALID JSON'; }
  });
  return {
    links, badHashes, brokenImages, unnamed, overflow, tooWide,
    seo: {
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      ogImage: meta('meta[property="og:image"]'),
      lang: document.documentElement.lang,
      h1: document.querySelectorAll('h1').length,
      jsonLd,
    },
  };
}

// The portfolio's own interactive parts. Each check runs only if the part exists.
async function interact() {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const out = [];
  const links = []; // links that only exist inside the overlay
  const grab = () => {
    const live = document.getElementById('detail-live');
    if (live && !live.hidden && live.href) {
      links.push({ href: live.href, raw: live.getAttribute('href'), text: document.getElementById('detail-name')?.textContent || '' });
    }
  };
  // links open nothing during these checks
  window.addEventListener('click', (e) => { if (e.target.closest('a[href]')) e.preventDefault(); }, true);

  const detail = document.getElementById('project-detail');
  if (detail) {
    const tryOpen = async (el, label) => {
      el.scrollIntoView({ block: 'center' });
      await wait(250);
      el.click();
      await wait(1000);
      const ok = detail.getAttribute('aria-hidden') === 'false';
      const name = document.getElementById('detail-name')?.textContent;
      grab();
      if (label.startsWith('Work') && ok) {
        // page through every project with the overlay's Next button
        const seen = new Set([name]);
        for (let i = 0; i < 30; i++) {
          document.getElementById('detail-next')?.click();
          await wait(450);
          const n = document.getElementById('detail-name')?.textContent;
          if (seen.has(n)) break;
          seen.add(n);
          grab();
        }
        out.push(['Work projects paged through', `${seen.size}`, seen.size > 1]);
      }
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await wait(800);
      const closed = detail.getAttribute('aria-hidden') === 'true';
      out.push([label, ok ? `opens "${name}"${closed ? ', closes' : ', DOES NOT CLOSE'}` : 'DOES NOT OPEN', ok && closed]);
    };
    for (const b of document.querySelectorAll('[data-freelance]')) {
      await tryOpen(b, `Freelance case study ${Number(b.dataset.freelance) + 1}`);
    }
    const view = document.getElementById('project-view');
    if (view) await tryOpen(view, 'Work: View project');
  }

  const summaries = [...document.querySelectorAll('details > summary')];
  if (summaries.length) {
    let ok = 0;
    for (const s of summaries) {
      const d = s.parentElement;
      const before = d.open;
      s.click();
      await wait(30);
      if (d.open !== before) ok++;
      s.click();
    }
    out.push(['FAQ answers', `${ok}/${summaries.length} open and close`, ok === summaries.length]);
  }

  const form = document.querySelector('form');
  if (form) {
    form.scrollIntoView({ block: 'center' });
    form.querySelector('[type="submit"], button:not([type])')?.click();
    await wait(400);
    const errors = form.querySelectorAll('[aria-invalid="true"], .is-invalid').length;
    out.push(['Form, sent empty', errors ? `stopped, ${errors} fields flagged` : 'NO ERRORS SHOWN', errors > 0]);
  }

  // analytics (this portfolio, on localhost): click one of each tracked thing
  if (window.__analytics) {
    const pick = (sel) => [...document.querySelectorAll(sel)].find((a) => a.offsetParent !== null) || document.querySelector(sel);
    ['a[download]', 'a[href^="mailto:"]', '.freelanceCard__live', 'a[href*="linkedin.com"]']
      .forEach((sel) => pick(sel)?.click());
    await wait(100);
    const names = [...new Set(window.__analytics.map((e) => e.name))];
    const want = ['case_study_open', 'resume_download', 'email_click', 'live_site_click', 'outbound_click'];
    const missing = want.filter((n) => !names.includes(n));
    out.push(['Analytics events', names.join(', ') + (missing.length ? ` (MISSING ${missing.join(', ')})` : ''), !missing.length]);
  }
  return { checks: out, links };
}

// ---------- run ----------
async function runViewport(label, { width, height, mobile }) {
  const page = await Page.open();
  const errors = [];
  const failed = [];
  const asleep = []; // other sites shown in previews that didn't answer
  const urls = new Map();
  const origin = new URL(TARGET).origin;
  page.on((m) => {
    const p = m.params;
    if (m.method === 'Network.requestWillBeSent') urls.set(p.requestId, p.request.url);
    if (m.method === 'Runtime.exceptionThrown') {
      errors.push((p.exceptionDetails.exception?.description || p.exceptionDetails.text).split('\n')[0]);
    }
    if (m.method === 'Runtime.consoleAPICalled' && p.type === 'error') {
      errors.push(p.args.map((a) => a.value ?? a.description ?? '').join(' ').split('\n')[0].slice(0, 200));
    }
    if (m.method === 'Network.responseReceived' && p.response.status >= 400) {
      const line = `${p.response.status} ${p.response.url}`;
      if (p.type === 'Document' && !p.response.url.startsWith(origin)) asleep.push(line);
      else failed.push(line);
    }
    if (m.method === 'Network.loadingFailed' && !p.canceled && !/blocked by audit|ERR_ABORTED/.test(p.errorText)) {
      failed.push(`${p.errorText} ${urls.get(p.requestId) || ''}`);
    }
  });
  for (const d of ['Page.enable', 'Runtime.enable', 'Network.enable']) await page.send(d);
  await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 3 : 1, mobile });
  await page.send('Emulation.setUserAgentOverride', { userAgent: mobile ? UA_PHONE : UA_DESKTOP });
  if (mobile) await page.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `(${blockSends})()` });

  await page.goto(TARGET);
  await sleep(1200);
  const hadIntro = await page.eval(getPastIntro);
  await sleep(hadIntro ? 5000 : 1000);
  await page.eval(scrollThrough);
  const found = await page.eval(inspect);
  const { checks, links: extra } = await page.eval(interact);
  page.close();
  return {
    label, width, errors: [...new Set(errors)], failed: [...new Set(failed)], asleep: [...new Set(asleep)],
    ...found, links: [...found.links, ...extra], checks,
  };
}

async function checkUrl(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), /onrender\.com/.test(url) ? 90000 : 20000);
  try {
    const r = await fetch(url, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA_DESKTOP, Accept: 'text/html,*/*' } });
    return r.status;
  } catch (e) {
    return e.name === 'AbortError' ? 'timeout' : (e.cause?.code || e.message);
  } finally {
    clearTimeout(timer);
  }
}

// sites that refuse automated requests but work in a browser
const BOT_WALLS = /linkedin\.com|instagram\.com|canva\.com|x\.com|twitter\.com|facebook\.com/;

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const DIM = '\x1b[2m';
const OFF = '\x1b[0m';
let problems = 0;
const bad = (s) => { problems++; console.log(`  ${RED}✗${OFF} ${s}`); };
const good = (s) => console.log(`  ${GREEN}✓${OFF} ${s}`);
const warn = (s) => console.log(`  ${YELLOW}!${OFF} ${s}`);
const head = (s) => console.log(`\n${s}`);

try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) break; } catch { /* starting */ }
    await sleep(200);
  }
  console.log(`Auditing ${TARGET}`);

  const runs = [
    await runViewport('Laptop (1440 × 900)', { width: 1440, height: 900, mobile: false }),
    await runViewport('Phone (390 × 844)', { width: 390, height: 844, mobile: true }),
  ];

  for (const r of runs) {
    head(r.label);
    if (r.errors.length) r.errors.forEach((e) => bad(`JS error: ${e}`)); else good('No JavaScript errors');
    if (r.failed.length) r.failed.forEach((f) => bad(`Failed to load: ${f}`)); else good('Every file loaded');
    r.asleep.forEach((f) => warn(`A site shown in a preview didn't answer: ${f} ${DIM}(free servers sleep; fine if it loads on a second try)${OFF}`));
    if (r.brokenImages.length) r.brokenImages.forEach((s) => bad(`Broken image: ${s}`)); else good('No broken images');
    if (r.badHashes.length) r.badHashes.forEach((h) => bad(`Link to ${h}, but nothing on the page has that id`)); else good('Every on-page link has a target');
    if (r.unnamed.length) r.unnamed.forEach((u) => bad(`Button/link with no name (screen readers can't say it): ${u}`)); else good('Every button and link has a name');
    if (r.overflow > 1) {
      bad(`Page scrolls sideways by ${r.overflow}px`);
      r.tooWide.forEach((w) => console.log(`      ${DIM}${w}${OFF}`));
    } else good('No sideways scrolling');
    r.checks.forEach(([name, result, ok]) => (ok ? good(`${name}: ${result}`) : bad(`${name}: ${result}`)));
  }

  const { seo, links } = runs[0];
  const origin = new URL(TARGET).origin;
  head('Search basics');
  seo.title ? good(`Title: ${seo.title} (${seo.title.length} chars)`) : bad('No <title>');
  if (!seo.description) bad('No meta description');
  else if (seo.description.length > 165) warn(`Description is ${seo.description.length} chars; Google shows about 155`);
  else good(`Description: ${seo.description.length} chars`);
  seo.canonical ? good(`Canonical: ${seo.canonical}`) : warn('No canonical link');
  seo.ogImage ? good('Link preview image set') : bad('No og:image, so shared links have no preview');
  seo.lang ? good(`Language: ${seo.lang}`) : warn('No lang on <html>');
  seo.h1 === 1 ? good('One <h1>') : warn(`${seo.h1} <h1> headings (one is best)`);
  if (!seo.jsonLd.length) warn('No structured data (JSON-LD)');
  seo.jsonLd.forEach((t) => (/INVALID/.test(t) ? bad('Structured data is not valid JSON') : good(`Structured data: ${t}`)));
  for (const file of ['robots.txt', 'sitemap.xml', 'llms.txt']) {
    const status = await checkUrl(`${origin}/${file}`);
    if (status === 200) good(`/${file}`);
    else (file === 'llms.txt' ? warn : bad)(`/${file}: ${status}`);
  }

  head('Links');
  const unique = [...new Map(links.map((l) => [l.href.split('#')[0], l])).values()]
    .filter((l) => /^https?:/.test(l.href));
  const mails = [...new Set(links.filter((l) => l.raw.startsWith('mailto:')).map((l) => l.raw))];
  mails.forEach((m) => (/^mailto:[^@\s]+@[^@\s]+\.\w{2,}/.test(m) ? good(m) : bad(`Odd email link: ${m}`)));
  const results = await Promise.all(unique.map(async (l) => [l, await checkUrl(l.href.split('#')[0])]));
  for (const [l, status] of results.sort((a, b) => a[0].href.localeCompare(b[0].href))) {
    const where = l.href.startsWith(origin) ? l.href.slice(origin.length) || '/' : l.href;
    if (typeof status === 'number' && status < 400) good(`${status} ${where}`);
    else if (BOT_WALLS.test(l.href)) warn(`${status} ${where} ${DIM}(this site blocks bots; open it by hand once)${OFF}`);
    else bad(`${status} ${where}  "${l.text}"`);
  }

  console.log(`\n${problems ? `${RED}${problems} problem(s) found${OFF}` : `${GREEN}All clear${OFF}`}`);
} catch (err) {
  console.error('Audit failed to run:', err);
  problems = problems || 1;
} finally {
  chrome.kill();
  await sleep(500);
  try { rmSync(PROFILE, { recursive: true, force: true }); } catch { /* Chrome still letting go */ }
}
process.exit(problems ? 1 : 0);
