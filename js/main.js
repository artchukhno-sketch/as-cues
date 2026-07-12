// AS Cues — общий скрипт

// Мобильное меню
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');
const isMobileNav = () => window.matchMedia('(max-width: 900px)').matches;

if (burger && nav) {
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
    const open = nav.classList.contains('open');
    burger.setAttribute('aria-expanded', open);
    // при открытии/закрытии меню всё свёрнуто: видны только разделы верхнего уровня
    nav.querySelectorAll('.nav__item.is-open').forEach(el => el.classList.remove('is-open'));
    if (open) {
      nav.querySelectorAll('.cat-tab.is-active').forEach(t => t.classList.remove('is-active'));
      nav.querySelectorAll('.cat-pane.is-active').forEach(p => p.classList.remove('is-active'));
    }
  });

  // На мобайле пункт с подменю (Каталог, Услуги) не уводит на страницу,
  // а раскрывает список — навигация видна сразу, вложенное открывается по тапу.
  nav.querySelectorAll('.nav__item--has-menu > a').forEach(link => {
    link.addEventListener('click', e => {
      if (!isMobileNav() || !nav.classList.contains('open')) return;
      e.preventDefault();
      const item = link.closest('.nav__item');
      const opened = item.classList.toggle('is-open');
      // свернули раздел — сбрасываем и то, что было раскрыто внутри,
      // иначе при следующем открытии «Кии» окажутся уже развёрнутыми
      if (!opened) {
        item.querySelectorAll('.cat-tab.is-active, .cat-pane.is-active')
            .forEach(el => el.classList.remove('is-active'));
      }
    });
  });

  // Подразделы каталога (Кии/Чехлы/…): тап раскрывает список моделей этого раздела.
  // У разделов без моделей (Чехлы, Аксессуары, Эксклюзив) — сразу переход на страницу.
  nav.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', e => {
      if (!isMobileNav() || !nav.classList.contains('open')) return;
      const key = tab.dataset.cat;
      const pane = nav.querySelector(`.cat-pane[data-cat="${key}"]`);
      const hasModels = pane && pane.querySelector('.cat-pane__groups');
      if (!hasModels) return;           // нет вложенных моделей — обычный переход
      e.preventDefault();
      const wasActive = tab.classList.contains('is-active') && pane.classList.contains('is-active');
      nav.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('is-active'));
      nav.querySelectorAll('.cat-pane').forEach(p => p.classList.remove('is-active'));
      if (!wasActive) {
        tab.classList.add('is-active');
        pane.classList.add('is-active');
      }
    });
  });

  // Клик по конечной ссылке (модель, услуга, страница) — закрываем меню
  nav.querySelectorAll('.nav__menu a:not(.cat-tab), .nav__item:not(.nav__item--has-menu) > a')
     .forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
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

// Ленивое видео — луупы в карточках грузятся и запускаются только когда
// попадают в кадр. До этого видно постер-заглушку, трафик не тратится.
// При системной настройке «уменьшить движение» видео не запускаем (только постер).
(function () {
  // ловим и одиночный формат (video[data-src]), и мультиформат (<source data-src>).
  // Без :has() — собираем оба случая вручную, чтобы работало и в старых браузерах.
  const set = new Set(document.querySelectorAll('video[data-src]'));
  document.querySelectorAll('source[data-src]').forEach(s => {
    if (s.parentElement && s.parentElement.tagName === 'VIDEO') set.add(s.parentElement);
  });
  const videos = Array.from(set);
  if (!videos.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return; // остаётся постер, движение отключено

  const load = (v) => {
    if (v.dataset.loaded) return;
    v.dataset.loaded = '1';
    if (v.dataset.src) {
      v.src = v.dataset.src;                        // одиночный формат
    } else {
      // мультиформат: переносим data-src → src у каждого <source>, затем load()
      v.querySelectorAll('source[data-src]').forEach(s => { s.src = s.dataset.src; });
      v.load();
    }
    v.play().catch(() => {}); // автоплей без звука — браузеры разрешают
  };

  if (!('IntersectionObserver' in window)) {
    videos.forEach(load);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { load(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.25 });
  videos.forEach(v => io.observe(v));
})();

// Stagger — карточки в ряду появляются мягкой волной, друг за другом.
// Ненавязчиво: только внутри сеток карточек, шаг маленький, максимум 4 ступени.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const groups = document.querySelectorAll('.serv-grid, .feat-grid, .promo-grid, .cards, .value-grid');
  groups.forEach(group => {
    const items = Array.from(group.children).filter(c => c.classList.contains('reveal'));
    items.forEach((el, i) => {
      const step = Math.min(i, 4);              // не больше 4 ступеней задержки
      if (step > 0) el.style.setProperty('--reveal-delay', (step * 0.09) + 's');
    });
  });
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
    btn.textContent = (window.t || (s => s))('Заявка отправлена ✓');
    btn.disabled = true;
    form.reset();
    setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
  });
});

// Все числа, которые можно не писать руками, считаются здесь:
// годы — от 2000-го, количество моделей — из CATALOG.
// Иначе цифру пришлось бы править в трёх языковых версиях каждый новый год
// и после каждой добавленной модели (так и разъехались 11 и 18).
(function () {
  const years = new Date().getFullYear() - 2000;
  const models = Array.isArray(window.CATALOG) ? window.CATALOG.length : 0;

  const setText = (sel, value) => {
    if (!value) return;                                   // нет данных — оставляем то, что в разметке
    document.querySelectorAll(sel).forEach(el => { el.textContent = value; });
  };

  setText('[data-stat="years"]', years);
  setText('[data-stat="models"]', models);
  setText('.quicknav-open__count', models);               // счётчик у кнопок «Все модели»
})();

// Липкая кнопка «Все модели»: одна на весь каталог (раньше такая же стояла
// в каждой карточке — 11 подряд читались как шум).
// Показывается по двум условиям сразу: экран внутри каталога И шапка на виду.
// Каталог высокий, поэтому «пересекается с вьюпортом» — почти всегда true;
// нужен именно верх экрана внутри секции, иначе кнопка висит уже над героем.
// Ко второму условию просто цепляемся за шапку: она уже знает направление
// скролла, и кнопка появляется/прячется с ней синхронно.
(function () {
  const catalog = document.getElementById('catalog');
  const jump = document.querySelector('.catalog-jump');
  const header = document.querySelector('.header');
  if (!catalog || !jump) return;

  let ticking = false;

  const apply = () => {
    const box = catalog.getBoundingClientRect();
    // верх экрана попал в секцию каталога (с запасом, чтобы кнопка не мигала на границе)
    const inCatalog = box.top < 120 && box.bottom > 120;
    const headerShown = !header || !header.classList.contains('header--hidden');
    jump.classList.toggle('is-visible', inCatalog && headerShown);
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) { window.requestAnimationFrame(apply); ticking = true; }
  };

  apply();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();
