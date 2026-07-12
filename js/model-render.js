// Рендер страницы одной модели (model.html?slug=...) из window.CATALOG.
// Все варианты модели — строками на всю ширину, в том же стиле, что и каталог:
// номер · порода · фото кия на белом · данные (цена/размер/вес) · кнопка.
(function () {
  var root = document.getElementById('model-root');
  if (!root || !window.CATALOG) return;

  var t = window.t || function (s) { return s; };
  var asset = window.asset || function (p) { return p; };   // из /uk/ и /en/ картинки лежат уровнем выше

  function getSlug() {
    var m = location.search.match(/[?&]slug=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }
  function num(s){ s=String(s||''); var m=s.match(/([~\d.,]+)\s*([а-яё]+)?/i); return m?{n:m[1],u:m[2]||''}:{n:s,u:''}; }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var slug = getSlug();
  var model = window.CATALOG.filter(function (m) { return m.slug === slug; })[0];

  // модель не найдена — мягкий фолбэк
  if (!model) {
    root.innerHTML = '<div class="model-empty"><p>'+t('Модель не найдена.')+'</p>'+
      '<a class="btn btn--ink" href="index.html#catalog">'+t('← В каталог')+'</a></div>';
    return;
  }

  // шапка страницы
  var el = document.getElementById('model-title'); if (el) el.textContent = t(model.title);
  var g = document.getElementById('model-group'); if (g) g.textContent = t(model.tag || model.group || 'Модель');
  var s = document.getElementById('model-sub'); if (s) s.textContent = t(model.sub || '');
  var cr = document.getElementById('crumb-model'); if (cr) cr.textContent = t(model.title);
  document.title = t(model.title) + ' — ' + t('модель кия') + ' | AS Cues';

  // каждый вариант — строка на всю ширину
  var html = model.variants.map(function (v, i) {
    var size = num(v.size || '~160 см'), weight = num(v.weight || '~700 г');
    var nn = ('0' + (i + 1)).slice(-2);
    return ''+
    '<article class="cat-model reveal">'+
      '<div class="cat-model__top">'+
        '<span class="cat-model__num">'+nn+'</span>'+
        '<h3 class="cat-model__name">'+esc(t(v.wood))+'</h3>'+
        '<span class="cat-model__group">'+esc(t(model.title))+'</span>'+
      '</div>'+
      '<div class="cat-model__photo"><img src="'+esc(asset(v.img))+'" alt="'+esc(t(model.title)+' — '+t(v.wood))+'" loading="lazy"></div>'+
      '<div class="cat-model__meta">'+
        '<div class="cat-spec"><span class="k">'+t('Цена')+'</span><span class="v">'+esc(v.price)+'</span></div>'+
        '<div class="cat-spec"><span class="k">'+t('Размер')+'</span><span class="v">'+size.n+' <small>'+t(size.u||'см')+'</small></span></div>'+
        '<div class="cat-spec"><span class="k">'+t('Вес')+'</span><span class="v">'+weight.n+' <small>'+t(weight.u||'г')+'</small></span></div>'+
        '<div class="cat-model__cta"><a class="cat-btn" href="contacts.html#zayavka">'+t('Заказать')+' <span class="cat-btn__go">→</span></a></div>'+
      '</div>'+
    '</article>';
  }).join('');

  root.innerHTML = html;
  if (window.__observeReveals) window.__observeReveals(root);
})();
