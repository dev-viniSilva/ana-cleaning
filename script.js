'use strict';

// Tells the inline <head> script that JS loaded, so animation states stay armed.
window.__motionReady = true;

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---- NAV SCROLL ---- */
const nav = document.getElementById('nav');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const onScroll = () => {
  const scrolled = window.scrollY > 40;
  nav.classList.toggle('scrolled', scrolled);
  // phone status bar follows the dark hero at the top, cream once scrolled
  themeMeta?.setAttribute('content', scrolled ? '#f8f6f2' : '#0e1f2d');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---- MOBILE NAV ---- */
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

mobileNav?.querySelectorAll('a').forEach((a, i) => a.style.setProperty('--n', i));

// everything behind the full-screen menu is unreachable (and un-tabbable) while it is open
const behindMenu = ['main', 'mobileCta'].map(id => document.getElementById(id)).concat(document.querySelector('footer'));

function setMenu(open) {
  const wasOpen = mobileNav.classList.contains('open');
  hamburger.classList.toggle('open', open);
  mobileNav.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
  document.body.style.overflow = open ? 'hidden' : '';
  document.body.classList.toggle('menu-open', open);
  behindMenu.forEach(el => { if (el) el.inert = open; });
  if (open) mobileNav.querySelector('a')?.focus({ preventScroll: true });
  else if (wasOpen) hamburger.focus({ preventScroll: true });
}

hamburger?.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));

document.querySelectorAll('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileNav?.classList.contains('open')) setMenu(false);
});

window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
  if (e.matches && mobileNav?.classList.contains('open')) setMenu(false);
});

/* ---- SCROLL REVEAL ---- */
const revealTargets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-mask');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('visible'));
}

/* ---- HERO MOTION LOOP (rendered with Remotion, see /motion) ---- */
// Larger screens only, and never for reduced motion / data saver / slow connections.
// Phones and tablets keep the lightweight still photo.
(() => {
  const video = document.querySelector('.hero-motion');
  if (!video) return;

  const conn = navigator.connection || {};
  const slow = conn.saveData || /(^|-)(2g|3g)$/.test(conn.effectiveType || '');
  if (reduceMotion.matches || slow || !window.matchMedia('(min-width: 900px)').matches) return;

  const start = () => {
    video.addEventListener('playing', () => video.classList.add('is-live'), { once: true });
    video.src = video.dataset.src;
    video.play().catch(() => {});

    // Save battery: only play while the hero is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      }).observe(video);
    }
  };

  // After load + idle, so it never competes with the first paint
  const afterLoad = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2000 }) : setTimeout(start, 800));
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, { once: true });
})();

/* ---- COUNTER ANIMATION ---- */
// The final numbers are in the HTML; with motion allowed they count up from 0 when scrolled into view.
const counters = document.querySelectorAll('.stat-n[data-target]');

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.counted) {
      e.target.dataset.counted = '1';
      const target = parseInt(e.target.dataset.target);
      const suffix = e.target.dataset.suffix || '';
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1600, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        e.target.textContent = Math.floor(ease * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  });
}, { threshold: 0.5 });

if (!reduceMotion.matches) {
  counters.forEach(el => {
    el.textContent = '0' + (el.dataset.suffix || '');
    counterObs.observe(el);
  });
}

/* ---- SMOOTH ANCHOR SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 78;
    window.scrollTo({ top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });
});

/* ---- ACTIVE NAV ---- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

sections.forEach(s => {
  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${s.id}`));
    }
  }, { rootMargin: '-40% 0px -40% 0px' }).observe(s);
});

/* ---- MOBILE QUICK ACTIONS (Call / WhatsApp / Quote) ---- */
// Shown once the hero buttons have scrolled away, hidden again around the contact form.
(() => {
  const bar = document.getElementById('mobileCta');
  const heroCtas = document.querySelector('.hero-ctas');
  const contact = document.getElementById('contact');
  if (!bar || !heroCtas || !contact || !('IntersectionObserver' in window)) return;

  let pastHero = false;
  let atContact = false;
  const update = () => bar.classList.toggle('is-visible', pastHero && !atContact);

  new IntersectionObserver(([entry]) => {
    pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    update();
  }).observe(heroCtas);

  new IntersectionObserver(([entry]) => {
    atContact = entry.isIntersecting;
    update();
  }, { threshold: 0.12 }).observe(contact);
})();

/* ---- PHONE VALIDATION ---- */
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phoneError');

function formatPhone(val) {
  const digits = val.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
}

function isValidPhone(val) {
  return val.replace(/\D/g, '').length === 10;
}

phoneInput?.addEventListener('input', () => {
  phoneInput.value = formatPhone(phoneInput.value);
  if (phoneInput.classList.contains('invalid')) {
    const valid = isValidPhone(phoneInput.value);
    phoneInput.classList.toggle('invalid', !valid);
    phoneError.style.display = valid ? 'none' : 'block';
  }
});

phoneInput?.addEventListener('blur', () => {
  if (phoneInput.value === '') return;
  const valid = isValidPhone(phoneInput.value);
  phoneInput.classList.toggle('invalid', !valid);
  phoneError.style.display = valid ? 'none' : 'block';
});

/* ---- CONTACT FORM ---- */
// Without JS this is a plain Formspree POST. With JS the same data is sent in the background so the
// visitor stays on the page and sees a thank-you. If the send fails (after one retry) the form keeps
// everything they typed and offers WhatsApp / text / email / call with the message already written,
// so a lead is never lost.
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const formFallback = document.getElementById('formFallback');

// One try, then one retry for network errors, timeouts and server errors (a 4xx will not get better).
async function sendForm() {
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
        signal: ctrl.signal
      });
      if (res.ok) return true;
      if (res.status < 500) return false;
    } catch (err) { /* offline, blocked or timed out */ }
    finally { clearTimeout(timer); }
    if (attempt === 0) await new Promise(r => setTimeout(r, 1200));
  }
  return false;
}

// Same message, ready to send by other means (the fields stay filled in as well)
function showFallback() {
  const v = name => (contactForm.elements[name]?.value || '').trim();
  const lines = [
    "Hi Ana, I'd like a cleaning quote.",
    `Name: ${v('firstName')} ${v('lastName')}`.trim(),
    `Phone: ${v('phone')}`,
    `Service: ${v('service')}`
  ];
  if (v('message')) lines.push(`Message: ${v('message')}`);
  const text = encodeURIComponent(lines.join('\n'));
  document.getElementById('fbWhatsapp').href = 'https://wa.me/17176236050?text=' + text;
  document.getElementById('fbSms').href = 'sms:+17176236050?&body=' + text;
  document.getElementById('fbMail').href = 'mailto:anascarecleaning@gmail.com?subject=' + encodeURIComponent('Quote request from the website') + '&body=' + text;
  formFallback.hidden = false;
}

function setStatus(kind, text) {
  formStatus.className = kind ? `cf-status is-${kind}` : 'cf-status';
  formStatus.textContent = text;
}

contactForm?.addEventListener('submit', async e => {
  e.preventDefault();

  if (phoneInput && !isValidPhone(phoneInput.value)) {
    phoneInput.classList.add('invalid');
    phoneError.style.display = 'block';
    phoneInput.focus();
    return;
  }

  // spam trap: real visitors never see this field, bots fill it. Drop silently.
  if (contactForm.querySelector('input[name="_gotcha"]')?.value) return;

  const button = contactForm.querySelector('.cf-submit');
  const label = button.querySelector('span');
  button.disabled = true;
  label.textContent = 'Sending…';
  setStatus('', '');
  formFallback.hidden = true;

  const sent = await sendForm();
  if (sent) {
    contactForm.reset();
    setStatus('success', 'Thank you! Your request was sent. Ana will be in touch personally within a few hours.');
  } else {
    setStatus('error', "We couldn't send your request. Nothing is lost: your details are still in the form. Please send them to Ana another way:");
    showFallback();
  }
  button.disabled = false;
  label.textContent = 'Send Request';
});

/* ---- DIALOG HELPERS (photo viewer + video player) ---- */
// Returns focus to whatever opened the dialog and keeps Tab inside it while open.
function makeDialog(el, closeBtn) {
  let opener = null;

  return {
    open() {
      opener = document.activeElement;
      el.classList.add('open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus({ preventScroll: true });
    },
    close() {
      el.classList.remove('open');
      document.body.style.overflow = '';
      if (opener && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
    },
    isOpen: () => el.classList.contains('open'),
    trap(e) {
      if (e.key !== 'Tab') return;
      const items = Array.from(el.querySelectorAll('button, video[controls]')).filter(n => n.offsetParent !== null || n === closeBtn);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
}

// Makes a div[role=button] behave like a button for keyboard users
function onActivate(el, handler) {
  el.addEventListener('click', handler);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  });
}

/* ---- VIDEO REEL — opens in a blurred-backdrop modal, native controls ---- */
(() => {
  const items = document.querySelectorAll('.reel-item[data-video]');
  if (!items.length) return;

  const modal = document.getElementById('videoModal');
  const vmVideo = document.getElementById('vmVideo');
  const vmClose = document.getElementById('vmClose');
  const vmBackdrop = document.getElementById('vmBackdrop');
  const dialog = makeDialog(modal, vmClose);

  function openVideo(item) {
    vmVideo.poster = item.querySelector('.reel-poster')?.currentSrc || '';
    vmVideo.src = item.dataset.video;
    dialog.open();
    vmVideo.muted = false;
    vmVideo.play().catch(() => {});
  }

  function closeVideo() {
    vmVideo.pause();
    vmVideo.removeAttribute('src');
    vmVideo.removeAttribute('poster');
    vmVideo.load();
    dialog.close();
  }

  items.forEach(item => onActivate(item, () => openVideo(item)));

  vmClose.addEventListener('click', closeVideo);
  vmBackdrop.addEventListener('click', closeVideo);

  document.addEventListener('keydown', e => {
    if (!dialog.isOpen()) return;
    if (e.key === 'Escape') closeVideo();
    dialog.trap(e);
  });
})();

/* ---- PHOTO LIGHTBOX ---- */
(() => {
  const items = Array.from(document.querySelectorAll('.gallery-item[data-lightbox]'));
  if (!items.length) return;

  // Full-size WebP for the viewer; the grid itself only loads the small responsive versions
  const photos = items.map(el => {
    const img = el.querySelector('img');
    return { src: el.dataset.full || img.currentSrc || img.src, alt: img.alt, caption: el.querySelector('.gallery-cap')?.textContent || '' };
  });

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');
  const lbStage = lightbox.querySelector('.lb-stage');
  const dialog = makeDialog(lightbox, lbClose);

  let index = 0;

  lbImg.addEventListener('load', () => lbImg.classList.remove('swap'));
  lbImg.addEventListener('error', () => lbImg.classList.remove('swap'));

  function show(i) {
    index = (i + photos.length) % photos.length;
    const photo = photos[index];
    if (lbImg.getAttribute('src') !== photo.src) {
      lbImg.classList.add('swap');
      lbImg.src = photo.src;
    }
    lbImg.alt = photo.alt;
    lbCounter.textContent = `${index + 1} / ${photos.length}${photo.caption ? ` · ${photo.caption}` : ''}`;

    // warm the next photo so swiping feels instant
    new Image().src = photos[(index + 1) % photos.length].src;
  }

  function open(i) {
    show(i);
    dialog.open();
  }

  items.forEach((el, i) => onActivate(el, () => open(i)));

  lbClose.addEventListener('click', dialog.close);
  lbPrev.addEventListener('click', () => show(index - 1));
  lbNext.addEventListener('click', () => show(index + 1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) dialog.close();
  });

  // Swipe left/right on touch screens
  let touchX = 0;
  let touchY = 0;
  lbStage.addEventListener('touchstart', e => {
    touchX = e.changedTouches[0].clientX;
    touchY = e.changedTouches[0].clientY;
  }, { passive: true });
  lbStage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (!dialog.isOpen()) return;
    if (e.key === 'Escape') dialog.close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    dialog.trap(e);
  });
})();

/* ---- SERVICE-AREA MAP: 25-mile ring around Long Branch (Leaflet loads only when the map is near the screen) ---- */
(function () {
  const el = document.getElementById('serviceMap');
  if (!el) return;

  const HOME = [40.3043, -73.9924];
  const RADIUS_M = 25 * 1609.344;
  const ringBounds = () => L.latLng(HOME).toBounds(RADIUS_M * 2);   // square that just contains the ring (L exists once Leaflet has loaded)

  function addAsset(tag, attrs) {
    return new Promise((resolve, reject) => {
      const node = Object.assign(document.createElement(tag), attrs);
      node.onload = resolve;
      node.onerror = reject;
      document.head.appendChild(node);
    });
  }

  function draw() {
    const touch = L.Browser.mobile;
    const map = L.map(el, {
      zoomControl: false,
      scrollWheelZoom: false,          // don't hijack page scrolling
      dragging: !touch,                // one finger scrolls the page on phones; pinch still zooms
      zoomAnimation: !reduceMotion.matches,
      attributionControl: false
    });
    L.control.zoom({ position: 'topright' }).addTo(map);
    L.control.attribution({ prefix: false, position: 'bottomright' }).addTo(map);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 14,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(map);

    L.circle(HOME, {
      radius: RADIUS_M,
      color: '#1d6f93',
      weight: 3,
      dashArray: '9 7',
      fillColor: '#4fa8d0',
      fillOpacity: .2
    }).addTo(map);

    L.marker(HOME, {
      icon: L.divIcon({ className: '', html: '<div class="map-pin"></div>', iconSize: [18, 18] }),
      keyboard: false
    }).addTo(map).bindTooltip('Long Branch', { permanent: true, direction: 'bottom', offset: [0, 8], className: 'map-label' });

    // "25 miles" tag on the ring's east edge
    L.marker([HOME[0], HOME[1] + RADIUS_M / (111320 * Math.cos(HOME[0] * Math.PI / 180))], {
      icon: L.divIcon({ className: '', html: '', iconSize: [0, 0] }),
      interactive: false,
      keyboard: false
    }).addTo(map).bindTooltip('25 miles', { permanent: true, direction: 'left', offset: [-4, 0], className: 'map-label' });

    map.fitBounds(ringBounds(), { padding: [34, 34] });
    map.on('resize', () => map.fitBounds(ringBounds(), { padding: [34, 34], animate: false }));
  }

  function load() {
    Promise.all([
      addAsset('link', { rel: 'stylesheet', href: 'vendor/leaflet/leaflet.css' }),
      addAsset('script', { src: 'vendor/leaflet/leaflet.js', async: true })
    ]).then(draw).catch(() => { /* the "Open in Google Maps" link below still works */ });
  }

  if (!('IntersectionObserver' in window)) return load();
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      io.disconnect();
      load();
    }
  }, { rootMargin: '400px 0px' });
  io.observe(el);
})();
