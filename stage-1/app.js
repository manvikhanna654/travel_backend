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

const animateNumber = (element) => {
  const target = Number(element.dataset.value);
  const prefix = element.dataset.prefix || '';
  const suffix = element.dataset.suffix || '';
  const duration = 1150;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
    return;
  }
  const start = performance.now();
  const easeOut = (value) => 1 - Math.pow(1 - value, 3);
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    element.textContent = `${prefix}${Math.round(target * easeOut(progress)).toLocaleString()}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const statsObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateNumber(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.7 });
document.querySelectorAll('.stat-number').forEach((number) => statsObserver.observe(number));

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
