// Рендер каталога чехлов из window.CASES (js/cases-data.js).
// Та же логика, что у каталога киёв: модели на линиях, фото «парит» на белом,
// данные (цена·размер·вес) + кнопка «Смотреть все варианты (N)» → страница модели.
(function () {
  var root = document.getElementById('cases-root');
  if (!root || !window.CASES) return;

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var html = window.CASES.map(function (m, i) {
    var v0 = m.variants[0];
    var nn = ('0' + (i + 1)).slice(-2);
    return ''+
    '<article class="cat-model reveal" id="case-'+m.slug+'" data-slug="'+m.slug+'">'+
      '<div class="cat-model__top">'+
        '<span class="cat-model__num">'+nn+'</span>'+
        '<h3 class="cat-model__name">'+esc(m.title)+'</h3>'+
        '<span class="cat-model__group">'+esc(m.tag || 'Чехол')+'</span>'+
      '</div>'+
      '<a class="cat-model__photo" href="case-model.html?slug='+m.slug+'"><img src="'+esc(v0.img)+'" alt="'+esc(m.title)+'" loading="lazy"></a>'+
      '<div class="cat-model__meta">'+
        '<p class="cat-model__desc">'+esc(m.sub || '')+'</p>'+
        '<div class="cat-spec"><span class="k">Цена</span><span class="v">'+esc(m.range)+'</span></div>'+
        '<div class="cat-spec"><span class="k">Размер</span><span class="v">'+esc(v0.size)+'</span></div>'+
        '<div class="cat-spec"><span class="k">Вес</span><span class="v">'+esc(v0.weight)+'</span></div>'+
        '<div class="cat-model__cta"><a class="cat-btn" href="case-model.html?slug='+m.slug+'">Смотреть все варианты ('+m.variants.length+') <span class="cat-btn__go">→</span></a></div>'+
      '</div>'+
    '</article>';
  }).join('');

  root.innerHTML = html;
  if (window.__observeReveals) window.__observeReveals(root);
})();
