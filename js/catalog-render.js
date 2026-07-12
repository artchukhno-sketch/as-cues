// Рендер каталога киёв из window.CATALOG (js/catalog-data.js).
// Редакционный язык: модели на линиях, фото-кий «парит» на белом,
// данные (цена·размер·вес) + кнопка «Смотреть все варианты (N)».
(function () {
  var root = document.getElementById('catalog-root');
  if (!root || !window.CATALOG) return;

  var t = window.t || function (s) { return s; };
  var asset = window.asset || function (p) { return p; };   // из /uk/ и /en/ картинки лежат уровнем выше

  // «~160 см» → число + единица отдельно (единицу переводим: см → cm, г → g)
  function num(s){ s=String(s||''); var m=s.match(/([~\d.,]+)\s*([а-яё]+)?/i); return m?{n:m[1],u:m[2]||''}:{n:s,u:''}; }

  var html = window.CATALOG.map(function (m, i) {
    var v0 = m.variants[0];
    var size = num(v0.size || '~160 см'), weight = num(v0.weight || '~700 г');
    var nn = ('0' + (i + 1)).slice(-2);
    return ''+
    '<article class="cat-model reveal" id="model-'+m.slug+'" data-slug="'+m.slug+'">'+
      '<div class="cat-model__top">'+
        '<span class="cat-model__num">'+nn+'</span>'+
        '<h3 class="cat-model__name">'+t(m.title)+'</h3>'+
      '</div>'+
      '<a class="cat-model__photo" href="model.html?slug='+m.slug+'"><img src="'+asset(v0.img)+'" alt="'+t(m.title)+'" loading="lazy"></a>'+
      '<div class="cat-model__meta">'+
        '<div class="cat-spec"><span class="k">'+t('Ценовая категория')+'</span><span class="v">'+m.range+'</span></div>'+
        '<div class="cat-spec"><span class="k">'+t('Размеры')+'</span><span class="v">'+size.n+' <small>'+t(size.u||'см')+'</small></span></div>'+
        '<div class="cat-spec"><span class="k">'+t('Вес')+'</span><span class="v">'+weight.n+' <small>'+t(weight.u||'г')+'</small></span></div>'+
        '<div class="cat-model__cta"><a class="cat-btn" href="model.html?slug='+m.slug+'">'+t('Смотреть все варианты')+' ('+m.variants.length+') <span class="cat-btn__go">→</span></a></div>'+
      '</div>'+
    '</article>';
  }).join('');

  root.innerHTML = html;
  if (window.__observeReveals) window.__observeReveals(root);
})();
