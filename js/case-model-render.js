// Рендер страницы одной модели чехла (case-model.html?slug=...) из window.CASES.
// Все варианты кожи/материала — строками на всю ширину, в том же стиле, что и каталог:
// номер · материал · фото на белом · данные (цена/размер/вес) · кнопка.
(function () {
  var root = document.getElementById('case-model-root');
  if (!root || !window.CASES) return;

  function getSlug() {
    var m = location.search.match(/[?&]slug=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var slug = getSlug();
  var model = window.CASES.filter(function (m) { return m.slug === slug; })[0];

  if (!model) {
    root.innerHTML = '<div class="model-empty"><p>Модель не найдена.</p>'+
      '<a class="btn btn--ink" href="cases.html">← К чехлам</a></div>';
    return;
  }

  var t = document.getElementById('model-title'); if (t) t.textContent = model.title;
  var g = document.getElementById('model-group'); if (g) g.textContent = model.tag || model.group || 'Модель';
  var s = document.getElementById('model-sub'); if (s) s.textContent = model.sub || '';
  var cr = document.getElementById('crumb-model'); if (cr) cr.textContent = model.title;
  document.title = model.title + ' — модель чехла | AS Cues';

  var html = model.variants.map(function (v, i) {
    var nn = ('0' + (i + 1)).slice(-2);
    return ''+
    '<article class="cat-model reveal">'+
      '<div class="cat-model__top">'+
        '<span class="cat-model__num">'+nn+'</span>'+
        '<h3 class="cat-model__name">'+esc(v.wood)+'</h3>'+
        '<span class="cat-model__group">'+esc(model.title)+'</span>'+
      '</div>'+
      '<div class="cat-model__photo"><img src="'+esc(v.img)+'" alt="'+esc(model.title+' — '+v.wood)+'" loading="lazy"></div>'+
      '<div class="cat-model__meta">'+
        '<div class="cat-spec"><span class="k">Цена</span><span class="v">'+esc(v.price)+'</span></div>'+
        '<div class="cat-spec"><span class="k">Размер</span><span class="v">'+esc(v.size)+'</span></div>'+
        '<div class="cat-spec"><span class="k">Вес</span><span class="v">'+esc(v.weight)+'</span></div>'+
        '<div class="cat-model__cta"><a class="cat-btn" href="contacts.html#zayavka">Заказать <span class="cat-btn__go">→</span></a></div>'+
      '</div>'+
    '</article>';
  }).join('');

  root.innerHTML = html;
  if (window.__observeReveals) window.__observeReveals(root);
})();
