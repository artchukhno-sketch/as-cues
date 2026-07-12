// Быстрая навигация по каталогу: панель справа со списком всех моделей по группам.
// Клик по модели — закрывает панель и скроллит к её строке в каталоге.
(function () {
  var panel = document.getElementById('quicknav');
  var list  = document.getElementById('quicknav-list');
  if (!panel || !list || !window.CATALOG) return;

  var t = window.t || function (s) { return s; };
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // сгруппировать модели по group (порядок групп — как в данных)
  var groups = [], byGroup = {};
  window.CATALOG.forEach(function (m) {
    if (!byGroup[m.group]) { byGroup[m.group] = []; groups.push(m.group); }
    byGroup[m.group].push(m);
  });

  list.innerHTML = groups.map(function (g) {
    var items = byGroup[g].map(function (m) {
      return '<a class="quicknav__link" href="#model-'+esc(m.slug)+'" data-slug="'+esc(m.slug)+'">'+
        '<span>'+esc(t(m.title))+'</span>'+
        '<small>'+esc(m.range)+'</small>'+
      '</a>';
    }).join('');
    return '<div class="quicknav__group"><div class="quicknav__group-title">'+esc(t(g))+'</div>'+items+'</div>';
  }).join('');

  function open() {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // открытие — делегирование: любая кнопка .quicknav-open (в шапке и в карточках,
  // которые рендерятся динамически) открывает панель
  document.addEventListener('click', function (e) {
    if (e.target.closest('.quicknav-open')) open();
  });
  panel.querySelectorAll('[data-quicknav-close]').forEach(function (el) {
    el.addEventListener('click', close);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) close();
  });

  // клик по модели — закрыть и плавно проскроллить (учитывая scroll-margin на .cat-model)
  list.addEventListener('click', function (e) {
    var a = e.target.closest('.quicknav__link');
    if (!a) return;
    e.preventDefault();
    var slug = a.getAttribute('data-slug');
    var target = document.getElementById('model-' + slug);
    close();
    if (target) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 220); // дождаться закрытия панели
    }
  });
})();
