'use strict';

/* ---- NAV SCROLL ---- */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---- MOBILE NAV ---- */
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

hamburger?.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});

document.querySelectorAll('.mobile-nav a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ---- SCROLL REVEAL ---- */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-left, .reveal-right, .reveal-scale').forEach(el => revealObserver.observe(el));

/* ---- HERO LOAD ANIMATIONS ---- */
document.querySelectorAll('.hero .reveal-fade, .hero .reveal-right').forEach(el => {
  setTimeout(() => el.classList.add('visible'), 100);
});

/* ---- COUNTER ANIMATION ---- */
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

document.querySelectorAll('.stat-n[data-target]').forEach(el => counterObs.observe(el));

/* ---- SMOOTH ANCHOR SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 78;
    window.scrollTo({ top, behavior: 'smooth' });
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

/* ---- FORM: phone validation only, Formspree handles submission ---- */
document.getElementById('contactForm')?.addEventListener('submit', e => {
  if (phoneInput && !isValidPhone(phoneInput.value)) {
    e.preventDefault();
    phoneInput.classList.add('invalid');
    phoneError.style.display = 'block';
    phoneInput.focus();
  }
  // honeypot check — if the hidden field has a value, silently block
  const honey = document.querySelector('input[name="_honey"]');
  if (honey && honey.value !== '') {
    e.preventDefault();
  }
});

/* ---- VIDEO REEL — opens in a blurred-backdrop modal, native controls ---- */
(() => {
  const items = document.querySelectorAll('.reel-item[data-video]');
  if (!items.length) return;

  const modal = document.getElementById('videoModal');
  const vmVideo = document.getElementById('vmVideo');
  const vmClose = document.getElementById('vmClose');
  const vmBackdrop = document.getElementById('vmBackdrop');

  function openVideo(src) {
    vmVideo.src = src;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    vmVideo.muted = false;
    vmVideo.play().catch(() => {});
  }

  function closeVideo() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    vmVideo.pause();
    vmVideo.removeAttribute('src');
    vmVideo.load();
  }

  items.forEach(item => {
    item.addEventListener('click', () => openVideo(item.dataset.video));
  });

  vmClose.addEventListener('click', closeVideo);
  vmBackdrop.addEventListener('click', closeVideo);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeVideo();
  });
})();

/* ---- REEL POSTERS — pull a real frame from each video as its thumbnail ---- */
document.querySelectorAll('.reel-poster').forEach(poster => {
  const item = poster.closest('.reel-item');
  let revealed = false;

  function reveal() {
    if (revealed) return;
    revealed = true;
    item.classList.add('poster-ready');
  }

  poster.addEventListener('loadedmetadata', () => {
    try {
      poster.currentTime = Math.min(1, (poster.duration || 2) / 4);
    } catch (_) {}
  });

  poster.addEventListener('seeked', reveal, { once: true });

  // Safety net in case 'seeked' never fires (some mobile browsers)
  setTimeout(reveal, 2500);
});

/* ---- PHOTO LIGHTBOX ---- */
(() => {
  const items = Array.from(document.querySelectorAll('.gallery-item[data-lightbox]'));
  if (!items.length) return;

  const photos = items.map(el => {
    const img = el.querySelector('img');
    return { src: img.src, alt: img.alt };
  });

  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  let index = 0;

  function show(i) {
    index = (i + photos.length) % photos.length;
    const photo = photos[index];
    lbImg.src = photo.src;
    lbImg.alt = photo.alt;
    lbCounter.textContent = `${index + 1} / ${photos.length}`;
  }

  function open(i) {
    show(i);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  items.forEach((el, i) => {
    el.addEventListener('click', () => open(i));
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => show(index - 1));
  lbNext.addEventListener('click', () => show(index + 1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
})();