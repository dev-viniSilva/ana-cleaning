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

/* ---- VIDEO REEL — click to play, no autoplay ---- */
document.querySelectorAll('.reel-item').forEach(item => {
  const videoSrc = item.dataset.video;
  if (!videoSrc) return;

  let vid = null;
  let built = false;

  function buildVideo() {
    if (built) return;
    built = true;

    vid = document.createElement('video');
    vid.src = videoSrc;
    vid.muted = true;
    vid.loop = true;
    vid.playsInline = true;
    vid.preload = 'metadata';
    item.appendChild(vid);

    // Controls overlay
    const controls = document.createElement('div');
    controls.className = 'reel-controls';

    const playBtn = document.createElement('button');
    playBtn.className = 'reel-play-btn';
    playBtn.setAttribute('aria-label', 'Pause');
    playBtn.innerHTML = `
      <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M8 5v14l11-7z"/></svg>
    `;

    const muteBtn = document.createElement('button');
    muteBtn.className = 'reel-mute-btn';
    muteBtn.setAttribute('aria-label', 'Unmute');
    muteBtn.innerHTML = `
      <svg class="icon-muted" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
      <svg class="icon-sound" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
    `;

    const progress = document.createElement('div');
    progress.className = 'reel-progress';
    const progressBar = document.createElement('div');
    progressBar.className = 'reel-progress-bar';
    progress.appendChild(progressBar);

    controls.appendChild(playBtn);
    controls.appendChild(muteBtn);
    controls.appendChild(progress);
    item.appendChild(controls);

    // Play/pause
    playBtn.addEventListener('click', e => {
      e.stopPropagation();
      togglePlay();
    });

    vid.addEventListener('click', e => {
      e.stopPropagation();
      togglePlay();
    });

    function togglePlay() {
      if (vid.paused) {
        vid.play();
      } else {
        vid.pause();
        item.classList.remove('is-playing');
        playBtn.querySelector('.icon-pause').style.display = 'none';
        playBtn.querySelector('.icon-play').style.display = '';
      }
    }

    vid.addEventListener('playing', () => {
      playBtn.querySelector('.icon-pause').style.display = '';
      playBtn.querySelector('.icon-play').style.display = 'none';
    });

    // Mute toggle
    muteBtn.addEventListener('click', e => {
      e.stopPropagation();
      vid.muted = !vid.muted;
      muteBtn.querySelector('.icon-muted').style.display = vid.muted ? '' : 'none';
      muteBtn.querySelector('.icon-sound').style.display = vid.muted ? 'none' : '';
    });

    // Progress
    vid.addEventListener('timeupdate', () => {
      if (vid.duration) progressBar.style.width = (vid.currentTime / vid.duration * 100) + '%';
    });

    progress.addEventListener('click', e => {
      e.stopPropagation();
      const rect = progress.getBoundingClientRect();
      vid.currentTime = ((e.clientX - rect.left) / rect.width) * vid.duration;
    });

    vid.addEventListener('ended', () => {
      progressBar.style.width = '0%';
    });
  }

  // Clicking the thumb triggers the video
  item.addEventListener('click', () => {
    // Pause all other playing videos
    document.querySelectorAll('.reel-item.is-playing').forEach(other => {
      if (other !== item) {
        const otherVid = other.querySelector('video');
        if (otherVid) otherVid.pause();
        other.classList.remove('is-playing');
      }
    });

    buildVideo();
    item.classList.add('is-playing');
    vid.play().catch(() => {});
  });
});