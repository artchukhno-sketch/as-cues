// Блок «Конструкция» на странице модели: любую модель собираем в любой из четырёх сборок.
// Это не выбор товара — цена, порода и размер от конструкции не зависят. Схемы показаны
// сразу, все четыре рядом: разницу видно с одного взгляда, кликать не нужно.
// Схемы общие для всех моделей (js/construction-data.js).
(function () {
  var root = document.getElementById('construction-root');
  if (!root || !window.CONSTRUCTIONS) return;

  var t = window.t || function (s) { return s; };
  var asset = window.asset || function (p) { return p; };
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var items = window.CONSTRUCTIONS.map(function (c, i) {
    return ''+
    '<div class="constr__item">'+
      '<div class="constr__fig"><img src="'+esc(asset(c.img))+'" alt="'+esc(t(c.title))+'" loading="lazy"></div>'+
      '<div class="constr__cap">'+
        '<span class="constr__num">'+('0'+(i+1)).slice(-2)+'</span>'+
        '<h3 class="constr__name">'+esc(t(c.title))+'</h3>'+
        '<p class="constr__short">'+esc(t(c.short))+'</p>'+
      '</div>'+
    '</div>';
  }).join('');

  root.innerHTML = ''+
  '<div class="constr reveal">'+
    '<div class="constr__head">'+
      '<span class="constr__label">'+t('Конструкция')+'</span>'+
      '<p class="constr__lead">'+t('Эту модель можно собрать в любой из конструкций — уточните у менеджера.')+'</p>'+
    '</div>'+
    '<div class="constr__list">'+items+'</div>'+
  '</div>';

  if (window.__observeReveals) window.__observeReveals(root);
})();
