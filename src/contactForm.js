// Contact form: posts straight into a Google Form. Google sends no CORS
// headers, so the request goes out `no-cors` and the reply is opaque; only a
// network failure is visible here. All four questions are required on the
// Google side, so every field is checked before anything is sent.
import { site, contact } from './data.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_SENDING = 900; // ms; long enough for the charge bar to read

const CHECKS = {
  name: (v) => (v ? '' : 'Tell me who you are.'),
  email: (v) => {
    if (!v) return 'I need somewhere to reply.';
    return EMAIL.test(v) ? '' : "That email doesn't look right.";
  },
  topic: (v) => (v ? '' : 'Pick one.'),
  message: (v) => (v.length >= 2 ? '' : 'Say a little more.'),
};

export function initContactForm({ onSent } = {}) {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const { action, entries } = contact.form;
  const body = form.querySelector('.contactForm__body');
  const done = form.querySelector('.contactForm__done');
  const status = form.querySelector('.contactForm__status');
  const submit = form.querySelector('.contactForm__submit');
  const submitLabel = form.querySelector('.contactForm__submitLabel');

  const value = (name) => String(new FormData(form).get(name) ?? '').trim();

  function validate(name) {
    const msg = CHECKS[name](value(name));
    form.querySelector(`[data-error="${name}"]`).textContent = msg;
    form.querySelector(`[data-field="${name}"]`).classList.toggle('is-invalid', Boolean(msg));
    form.querySelectorAll(`[name="${name}"]`).forEach((input) => {
      if (msg) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    });
    return !msg;
  }

  // errors show after a submit attempt and clear as soon as they're fixed
  form.addEventListener('input', (e) => {
    const { name } = e.target;
    if (CHECKS[name] && form.querySelector(`[data-field="${name}"]`).classList.contains('is-invalid')) {
      validate(name);
    }
  });

  // the message box grows with what's typed
  const textarea = form.querySelector('textarea');
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 260)}px`;
  });

  function showDone() {
    done.querySelector('[data-done="name"]').textContent = value('name').split(/\s+/)[0] || 'friend';
    done.querySelector('[data-done="email"]').textContent = value('email');
    body.hidden = true;
    form.querySelector('.contactForm__head').hidden = true;
    done.hidden = false;
    done.focus({ preventScroll: true });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.classList.contains('is-sending')) return;
    status.textContent = '';
    form.classList.remove('has-failed');

    const bad = Object.keys(CHECKS).filter((name) => !validate(name));
    if (bad.length) {
      form.querySelector(`[name="${bad[0]}"]`).focus();
      return;
    }
    // bots fill the hidden field; humans never see it
    if (value('company')) {
      showDone();
      return;
    }

    const data = new URLSearchParams();
    for (const [key, entry] of Object.entries(entries)) data.append(entry, value(key));

    form.classList.add('is-sending');
    submit.disabled = true;
    submitLabel.textContent = 'Sending';
    try {
      await Promise.all([
        fetch(action, { method: 'POST', mode: 'no-cors', body: data }),
        new Promise((r) => setTimeout(r, MIN_SENDING)),
      ]);
      showDone();
      onSent?.();
    } catch {
      form.classList.add('has-failed');
      status.innerHTML = `Couldn't send that. Email me at <a href="mailto:${site.email}">${site.email}</a> instead.`;
    } finally {
      form.classList.remove('is-sending');
      submit.disabled = false;
      submitLabel.textContent = 'Send it';
    }
  });

  form.querySelector('.contactForm__again').addEventListener('click', () => {
    form.reset();
    textarea.style.height = '';
    done.hidden = true;
    body.hidden = false;
    form.querySelector('.contactForm__head').hidden = false;
    form.querySelector('[name="name"]').focus({ preventScroll: true });
  });
}
