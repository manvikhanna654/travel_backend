const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const toast = document.querySelector('.toast');
const progressBar = document.querySelector('.scroll-progress span');

const updateScrollProgress = () => {
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${pageHeight > 0 ? (window.scrollY / pageHeight) * 100 : 0}%`;
};
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

menuToggle?.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.site-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.js-open-journey').forEach((button) => {
  button.addEventListener('click', () => {
    const wantsSignup = button.textContent.toLowerCase().includes('account');
    window.location.href = `auth.html?mode=${wantsSignup ? 'signup' : 'login'}`;
  });
});

document.querySelector('.js-open-demo')?.addEventListener('click', () => {
  toast.textContent = 'Demo mode is ready for your next click ✦';
  toast.classList.add('is-visible');
  window.setTimeout(() => toast.classList.remove('is-visible'), 3200);
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

/* TripSplit cinematic scroll choreography */
(() => {
  const section = document.querySelector('.cinema-scroll');
  if (!section) return;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let targetX = 0, targetY = 0, mouseX = 0, mouseY = 0, smoothScroll = 0, initialized = false, raf = 0;
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smoothstep = (a, b, v) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const segment = (s, a, b, c, d) => { const enter = smoothstep(a, b, s), exit = smoothstep(c, d, s); return { enter, exit, active: enter * (1 - exit) }; };
  const distance = () => clamp(-section.getBoundingClientRect().top, 0, section.offsetHeight - innerHeight);
  const set = (name, value) => root.style.setProperty(name, value);
  const tick = () => { raf = 0; update(); };
  const request = () => { if (!raf) raf = requestAnimationFrame(tick); };
  function update() {
    const scroll = distance();
    // Keep a little smoothing without letting the artwork visibly trail the
    // user's wheel or touch position.
    if (!initialized || reduceMotion.matches) { smoothScroll = scroll; initialized = true; } else smoothScroll = lerp(smoothScroll, scroll, .28);
    if (Math.abs(smoothScroll - scroll) < .08) smoothScroll = scroll;
    mouseX = lerp(mouseX, targetX, .12); mouseY = lerp(mouseY, targetY, .12);
    const frame2 = segment(smoothScroll, 560, 900, 1300, 1620), frame3 = segment(smoothScroll, 1760, 2140, 2540, 2700);
    const progress = clamp(smoothScroll / 2700), introExit = smoothstep(90, 650, smoothScroll), blur = clamp(frame2.active + frame3.active);
    const backScale = .76 + progress * .2 + frame2.enter * .18 + frame3.enter * .16, splitDrift = Math.pow(frame2.enter, 1.5), sharedY = progress * -74, sharedScale = progress * .23;
    set('--c-mouse-x', `${reduceMotion.matches ? 0 : mouseX * 18}px`); set('--c-back-scale', backScale); set('--c-four-y', `${10 + progress * 10}vh`); set('--c-bazaar-y', `${20 - progress * 8}vh`);
    set('--c-blur', `${blur * 14}px`); set('--c-bazaar-blur', `${frame2.active * 14}px`); set('--c-bright', 1 - blur * .255); set('--c-sat', 1 + frame3.active * .18);
    set('--c-shade-top', blur * .465); set('--c-shade-mid', blur * .42); set('--c-shade-bottom', blur * .51);
    set('--c-title-y', `${introExit * -210}px`); set('--c-title-scale', 1 - introExit * .08); set('--c-title-opacity', 1 - introExit);
    set('--c-bridge-y', `${mouseY * 8 + sharedY - frame2.exit * 760}px`); set('--c-bridge-bottom', `${5 - frame2.enter * 13}vh`); set('--c-bridge-width', `${67.2 + frame2.enter * 37.8}vw`); set('--c-bridge-scale', 1.02 + sharedScale + frame2.exit * .46);
    set('--c-left-x', `${-splitDrift * 46}vw`); set('--c-right-x', `${splitDrift * 46}vw`); set('--c-split-y', `${mouseY * 10 + sharedY - splitDrift * 180}px`); set('--c-split-scale', 1 + sharedScale + frame2.enter * .74);
    set('--c-frame-opacity', frame2.active * (1 - frame3.enter)); set('--c-frame-scale', 1.06 + frame2.enter * .08 + frame2.exit * .08); set('--c-copy-y', `${introExit * 90}px`); set('--c-copy-opacity', 1 - introExit);
    set('--c-panel-bridge', frame2.active * (1 - frame2.exit)); set('--c-panel-bazaar', frame3.active * (1 - frame3.exit)); set('--c-panel-y', `calc(-50% + ${-Math.max(frame2.exit, frame3.exit) * 86 + (1 - Math.max(frame2.enter, frame3.enter)) * 58}px)`);
    if (Math.abs(smoothScroll - scroll) > .08 || Math.abs(mouseX - targetX) > .001 || Math.abs(mouseY - targetY) > .001) request();
  }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  window.addEventListener('pointermove', (event) => { targetX = event.clientX / innerWidth - .5; targetY = event.clientY / innerHeight - .5; request(); }, { passive: true });
  request();
})();

(() => {
  const videos = [...document.querySelectorAll('.cinema-footer__video')];
  if (videos.length < 2) return;
  let active = 0;
  videos.forEach((video) => { video.muted = true; video.play().catch(() => {}); });
  window.setInterval(() => {
    videos[active].classList.remove('is-active');
    active = (active + 1) % videos.length;
    videos[active].classList.add('is-active');
    videos[active].play().catch(() => {});
  }, 7000);
})();

const timeline = document.querySelector('.timeline-wrap');
if (timeline) {
  const timelineObserver = new IntersectionObserver(([entry], observer) => {
    if (entry.isIntersecting) {
      timeline.classList.add('is-progressing');
      observer.disconnect();
    }
  }, { threshold: 0.25 });
  timelineObserver.observe(timeline);
}
