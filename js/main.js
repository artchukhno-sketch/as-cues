// AS Cues — общий скрипт

// Мобильное меню
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');
if (burger && nav) {
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
    const open = nav.classList.contains('open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => nav.classList.remove('open'))
  );
}

// Поведение шапки: прячется при скролле вниз, появляется при скролле вверх,
// всегда видна у самого верха. Плюс прозрачно-тёмная над героем.
(function () {
  const header = document.querySelector('.header');
  if (!header) return;
  // тёмный верхний блок: герой на главной ИЛИ page-head на внутренних страницах
  const darkTop = document.querySelector('.hero') || document.querySelector('.page-head');
  const heroThreshold = () => darkTop ? darkTop.offsetHeight - header.offsetHeight - 40 : -1;

  let lastY = window.scrollY;
  let ticking = false;

  const apply = () => {
    const y = window.scrollY;
    const delta = y - lastY;

    // не реагируем на микродвижения и на отскок у краёв
    if (Math.abs(delta) > 6) {
      if (y < 80) {
        header.classList.remove('header--hidden');            // у самого верха — всегда видна
      } else if (delta > 0 && !nav?.classList.contains('open')) {
        header.classList.add('header--hidden');               // скролл вниз — прячем
      } else if (delta < 0) {
        header.classList.remove('header--hidden');            // скролл вверх — показываем
      }
      lastY = y;
    }

    // тёмная шапка, пока в зоне тёмного верхнего блока (герой / page-head)
    if (darkTop) header.classList.toggle('header--over-hero', y < heroThreshold());

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) { window.requestAnimationFrame(apply); ticking = true; }
  };

  apply();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', apply);
})();

// Появление секций при скролле (в т.ч. для динамически отрендеренного каталога)
(function () {
  if (!('IntersectionObserver' in window)) {
    window.__observeReveals = (r) => (r || document).querySelectorAll('.reveal').forEach(e => e.classList.add('in'));
    window.__observeReveals();
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  window.__observeReveals = (r) => (r || document).querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));
  window.__observeReveals();
})();

// Закрывать остальные модели каталога при открытии одной (аккордеон)
const models = document.querySelectorAll('details.model');
models.forEach(m => {
  m.addEventListener('toggle', () => {
    if (m.open) {
      models.forEach(other => { if (other !== m) other.open = false; });
    }
  });
});

// Заглушка формы — без бэкенда, мягкое подтверждение
document.querySelectorAll('form[data-lead]').forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Заявка отправлена ✓';
    btn.disabled = true;
    form.reset();
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
  });
});
