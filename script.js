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

new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`));
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' }).observe;

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
    o.style.transform = `translateY(${sy * [.3,.2,.15][i]}px)`;
  });
}, { passive: true });