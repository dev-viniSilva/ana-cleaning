'use strict';

/* ---- CUSTOM CURSOR ---- */
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

if (cursor && follower && window.innerWidth > 768) {
  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  (function animFollower() {
    fx += (mx - fx) * 0.13;
    fy += (my - fy) * 0.13;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animFollower);
  })();

  document.querySelectorAll('a, button, .svc-card, .testi-card, .why-item, .cl-item').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hov'); follower.classList.add('hov'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hov'); follower.classList.remove('hov'); });
  });
}

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

/* ---- HERO LOAD ANIMATIONS (add visible immediately) ---- */
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

/* ---- CONTACT FORM ---- */
const form = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('.cf-submit');
  const span = btn.querySelector('span');
  span.textContent = 'Sending…';
  btn.disabled = true;
  btn.style.opacity = '.65';
  await new Promise(r => setTimeout(r, 1400));
  form.style.display = 'none';
  formSuccess.style.display = 'flex';
});

/* ---- STAGGERED CARD ENTRANCE ---- */
const gridObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.svc-card, .testi-card, .why-item, .process-step, .gallery-item').forEach((card, i) => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 90);
    });
    gridObs.unobserve(entry.target);
  });
}, { threshold: 0.08 });

document.querySelectorAll('.services-grid, .testi-grid, .why-items, .process-grid, .gallery-grid').forEach(grid => {
  grid.querySelectorAll('.svc-card, .testi-card, .why-item, .process-step, .gallery-item').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(28px)';
    card.style.transition = 'opacity .65s cubic-bezier(.25,.46,.45,.94), transform .65s cubic-bezier(.25,.46,.45,.94)';
  });
  gridObs.observe(grid);
});

/* ---- SUBTLE PARALLAX HERO ORBS ---- */
window.addEventListener('scroll', () => {
  const sy = window.scrollY;
  document.querySelectorAll('.hero-orb').forEach((o, i) => {
    o.style.transform = `translateY(${sy * [.3, .2, .15][i]}px)`;
  });
}, { passive: true });

/* ---- REEL VIDEO PLAYER ---- */
document.querySelectorAll('.reel-item').forEach((item, index) => {
  const vid = item.querySelector('video');
  if (!vid) return;

  // Lazy load
  if (vid.dataset.src) {
    vid.src = vid.dataset.src;
  }

  // Remove the CSS ::after play icon — we'll inject real controls
  item.style.setProperty('--hide-play-after', 'none');

  // Build controls overlay
  const controls = document.createElement('div');
  controls.className = 'reel-controls';

  const playBtn = document.createElement('button');
  playBtn.className = 'reel-play-btn';
  playBtn.setAttribute('aria-label', 'Play');
  playBtn.innerHTML = `
    <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
    <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
  `;

  const muteBtn = document.createElement('button');
  muteBtn.className = 'reel-mute-btn';
  muteBtn.setAttribute('aria-label', 'Unmute');
  muteBtn.innerHTML = `
    <svg class="icon-mute" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
    <svg class="icon-unmute" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
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

  // State: only first video autoplays muted
  vid.muted = true;
  if (index === 0) {
    vid.play().catch(() => {});
    setPlaying(item, true);
  }

  // Toggle play/pause on play button
  playBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (vid.paused) {
      // Pause all others
      document.querySelectorAll('.reel-item video').forEach((v, i) => {
        if (v !== vid) {
          v.pause();
          setPlaying(document.querySelectorAll('.reel-item')[i], false);
        }
      });
      vid.play();
      setPlaying(item, true);
    } else {
      vid.pause();
      setPlaying(item, false);
    }
  });

  // Clicking the video itself also toggles
  vid.addEventListener('click', e => {
    e.stopPropagation();
    playBtn.click();
  });

  // Mute toggle
  muteBtn.addEventListener('click', e => {
    e.stopPropagation();
    vid.muted = !vid.muted;
    muteBtn.querySelector('.icon-mute').style.display = vid.muted ? '' : 'none';
    muteBtn.querySelector('.icon-unmute').style.display = vid.muted ? 'none' : '';
    muteBtn.setAttribute('aria-label', vid.muted ? 'Unmute' : 'Mute');
  });

  // Progress bar
  vid.addEventListener('timeupdate', () => {
    if (!vid.duration) return;
    progressBar.style.width = (vid.currentTime / vid.duration * 100) + '%';
  });

  // Seek on click
  progress.addEventListener('click', e => {
    e.stopPropagation();
    const rect = progress.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    vid.currentTime = ratio * vid.duration;
  });

  // Loop resets progress
  vid.addEventListener('ended', () => {
    progressBar.style.width = '0%';
    vid.currentTime = 0;
    vid.play();
  });
});

function setPlaying(item, playing) {
  const iconPlay = item.querySelector('.icon-play');
  const iconPause = item.querySelector('.icon-pause');
  if (iconPlay) iconPlay.style.display = playing ? 'none' : '';
  if (iconPause) iconPause.style.display = playing ? '' : 'none';
  item.classList.toggle('is-playing', playing);
}