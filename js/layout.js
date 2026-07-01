// AS Cues — общая шапка и футер (вставляются на каждой странице)
// data-page на <body> подсвечивает активный пункт меню.

(function () {
  const page = document.body.getAttribute('data-page') || '';
  const PHONE = '+38 098 511 42 75';
  const PHONE_TEL = '+380985114275';

  // Двухуровневый «Каталог»: слева категории продукции, справа — содержимое категории.
  // У «Кии» справа группы моделей; у остальных — краткое описание + переход.
  const catalogCats = [
    { key: 'kii', label: 'Кии', href: 'index.html#catalog', groups: [
      { title: 'Стрелы', href: 'index.html#model-korona-4perjevaia', items: [
        { label: 'Корона 4-перьевая стрела', href: 'index.html#model-korona-4perjevaia' },
        { label: 'Корона 8-перьевая стрела', href: 'index.html#model-korona-vosmiperjevaia' },
        { label: 'Корона 12-перьевая стрела', href: 'index.html#model-korona-12perjevaia' },
      ]},
      { title: 'Мастер', href: 'index.html#model-master-46', items: [
        { label: 'Мастер 4-6', href: 'index.html#model-master-46' },
        { label: 'Мастер две трети', href: 'index.html#model-master-23' },
        { label: 'Мастер цельный', href: 'index.html#model-master-tselnii' },
        { label: 'Мастер 12-8 Люкс', href: 'index.html#model-master-12-8-luks' },
        { label: 'Мастер Люкс две трети', href: 'index.html#model-master-luks-23' },
        { label: 'Мастер Люкс цельный', href: 'index.html#model-master-luks-tselnii' },
      ]},
      { title: 'Другие модели', href: 'index.html#model-tsvetok', items: [
        { label: 'Цветок', href: 'index.html#model-tsvetok' },
        { label: 'Консул 3-4', href: 'index.html#model-konsyl-34' },
        { label: 'Юниор', href: 'index.html#model-junior' },
        { label: 'Легенда', href: 'index.html#model-legenda' },
      ]},
    ]},
    { key: 'cases', label: 'Чехлы', href: 'cases.html',
      desc: 'Чехлы и кейсы ручной работы из натуральных материалов — под ваш кий.' },
    { key: 'accessories', label: 'Аксессуары', href: 'accessories.html',
      desc: 'Наклейки, резина и комплектующие проверенных мировых марок.' },
    { key: 'exclusive', label: 'Эксклюзив', href: 'exclusive.html',
      desc: 'Коллекционные кии в единственном экземпляре: инкрустация, гербы, картины.' },
  ];

  const navItems = [
    { href: 'index.html', key: 'cues', label: 'Каталог', catalog: true },
    { href: 'services.html', key: 'services', label: 'Услуги' },
    { href: 'about.html', key: 'about', label: 'Бренд' },
    { href: 'contacts.html', key: 'contacts', label: 'Контакты' },
  ];

  const chevron = `<svg class="nav__chev" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;

  const navHTML = navItems.map(i => {
    const cur = i.key === page ? ' aria-current="page"' : '';

    // обычный пункт без меню
    if (!i.menu && !i.catalog)
      return `<div class="nav__item"><a href="${i.href}"${cur}>${i.label}</a></div>`;

    // двухуровневый «Каталог»: слева категории, справа — панель выбранной категории
    if (i.catalog) {
      // левый столбик категорий (первая активна по умолчанию)
      const tabs = catalogCats.map((cat, idx) => `
        <a class="cat-tab${idx===0?' is-active':''}" href="${cat.href}" data-cat="${cat.key}">
          <span>${cat.label}</span>
          <svg class="cat-tab__arr" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>`).join('');

      // правые панели — по одной на категорию
      const panes = catalogCats.map((cat, idx) => {
        let inner;
        if (cat.groups) {
          inner = `<div class="cat-pane__groups">` + cat.groups.map(g => `
            <div class="cat-pane__col">
              <a class="cat-pane__title" href="${g.href}">${g.title}</a>
              <div class="cat-pane__links">
                ${g.items.map(it => `<a href="${it.href}">${it.label}</a>`).join('')}
              </div>
            </div>`).join('') + `</div>`;
        } else {
          inner = `<div class="cat-pane__desc">
            <p>${cat.desc}</p>
            <a class="cat-pane__go" href="${cat.href}">Перейти в раздел →</a>
          </div>`;
        }
        return `<div class="cat-pane${idx===0?' is-active':''}" data-cat="${cat.key}">${inner}</div>`;
      }).join('');

      return `<div class="nav__item nav__item--has-menu nav__item--mega">
        <a href="${i.href}"${cur} aria-haspopup="true">${i.label}${chevron}</a>
        <div class="nav__menu nav__menu--mega">
          <div class="catmenu">
            <div class="catmenu__tabs">${tabs}</div>
            <div class="catmenu__panes">${panes}</div>
          </div>
        </div>
      </div>`;
    }

    // обычное выпадающее меню (Услуги, Мастерская)
    const sub = i.menu.map(m =>
      `<a class="nav__sublink" href="${m.href}"><span>${m.label}</span><small>${m.note}</small></a>`
    ).join('');
    return `<div class="nav__item nav__item--has-menu">
      <a href="${i.href}"${cur} aria-haspopup="true">${i.label}${chevron}</a>
      <div class="nav__menu"><div class="nav__menu-inner">${sub}</div></div>
    </div>`;
  }).join('');

  const header = `
  <header class="header">
    <div class="header__inner">
      <a class="brand" href="index.html" aria-label="AS — бильярдные кии, на главную">
        <img src="img/logo.svg" alt="AS — бильярдные кии">
      </a>
      <nav class="nav" aria-label="Основная навигация">${navHTML}</nav>
      <div class="header__cta">
        <div class="lang" role="group" aria-label="Язык сайта">
          <a class="lang__opt is-active" href="index.html" aria-current="true" lang="ru">RU</a>
          <a class="lang__opt" href="#" lang="uk" title="Українська версія — скоро">UK</a>
          <a class="lang__opt" href="#" lang="en" title="English version — coming soon">EN</a>
        </div>
        <a class="btn btn--gold" href="contacts.html#zayavka">Консультация</a>
      </div>
      <button class="burger" aria-label="Меню" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;

  const footer = `
  <footer class="footer">
    <div class="wrap">
      <div class="footer__top">
        <div class="footer__col footer__brand-col">
          <a class="brand brand--footer" href="index.html" aria-label="AS — бильярдные кии">
            <img src="img/logo.svg" alt="AS — бильярдные кии">
          </a>
          <div class="footer__social" aria-label="Мы в соцсетях">
            <span class="footer__social-label">Соцсети</span>
            <div class="footer__social-icons">
              <a href="https://instagram.com/as.cuesstore" target="_blank" rel="noopener" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6"/><circle cx="17.2" cy="6.8" r="1.2" fill="currentColor"/></svg>
              </a>
              <a href="https://facebook.com/as.cuesstore" target="_blank" rel="noopener" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden="true"><path d="M14 8.5h2.2V5.6c-.4-.05-1.2-.12-2.1-.12-2.1 0-3.5 1.3-3.5 3.6v2H8v2.7h2.6V21h3v-7.2h2.5l.4-2.7H13.6V9.4c0-.6.2-.9 1-.9z" fill="currentColor"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div class="footer__col">
          <h4>Каталог</h4>
          <a href="index.html">Кии</a>
          <a href="exclusive.html">Эксклюзив</a>
          <a href="cases.html">Чехлы</a>
          <a href="accessories.html">Аксессуары</a>
        </div>
        <div class="footer__col">
          <h4>Бренд</h4>
          <a href="about.html">О бренде</a>
          <a href="services.html">Ремонт и апгрейд</a>
          <a href="dealers.html">Оптовикам</a>
          <a href="contacts.html">Контакты</a>
        </div>
        <div class="footer__col">
          <h4>Контакты</h4>
          <a href="tel:${PHONE_TEL}">${PHONE}</a>
          <a href="mailto:ascuesdnepr@gmail.com">ascuesdnepr@gmail.com</a>
          <p>г. Днепр, бул.&nbsp;Платонова,&nbsp;8А</p>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© ${new Date().getFullYear()} Мастерская «АС» — бильярдные кии. Все права защищены.</span>
        <span>Кии «АС» — качество, проверенное временем.</span>
      </div>
    </div>
  </footer>`;

  document.getElementById('site-header')?.insertAdjacentHTML('beforeend', header);
  document.getElementById('site-footer')?.insertAdjacentHTML('beforeend', footer);

  // Двухуровневый «Каталог»: наведение/фокус на левую категорию — показываем её панель справа.
  (function () {
    var tabs = document.querySelectorAll('.cat-tab');
    var panes = document.querySelectorAll('.cat-pane');
    if (!tabs.length) return;
    function activate(key) {
      tabs.forEach(function (t) { t.classList.toggle('is-active', t.getAttribute('data-cat') === key); });
      panes.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-cat') === key); });
    }
    tabs.forEach(function (t) {
      var key = t.getAttribute('data-cat');
      t.addEventListener('mouseenter', function () { activate(key); });
      t.addEventListener('focus', function () { activate(key); });
    });
  })();
})();
