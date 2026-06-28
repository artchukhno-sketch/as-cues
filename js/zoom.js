// Лупа-зум для фото киёв (каталог + страница модели).
// При наведении на фото показывается квадрат-лупа с приближённым участком.
// High-res версия подхватывается автоматически из img/models/upscale/<имя>,
// если файл есть; иначе используется обычное фото (без потери резкости там, где апскейла нет).
(function () {
  // лупа только на устройствах с точным указателем (мышь) — на тач-экранах не нужна
  if (!window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var ZOOM = 2.2;          // кратность увеличения
  var LENS = 200;          // размер квадрата-лупы, px
  var GAP  = 16;           // зазор между курсором и низом лупы (под хвостик), px

  // путь к high-res версии: img/models/foo.jpg -> img/models/upscale/foo.jpg
  function hiResSrc(src) {
    return src.replace(/(.*\/)?([^\/]+)$/, function (_, dir, file) {
      return (dir || '') + 'upscale/' + file;
    });
  }

  // проверить, существует ли файл (для авто-подхвата апскейла)
  function resolveSource(img, cb) {
    var hi = hiResSrc(img.getAttribute('src'));
    var probe = new Image();
    probe.onload = function () { cb(hi, probe.naturalWidth, probe.naturalHeight); };
    probe.onerror = function () { cb(img.currentSrc || img.src, img.naturalWidth, img.naturalHeight); };
    probe.src = hi;
  }

  function attach(wrap) {
    var img = wrap.querySelector('img');
    if (!img || wrap.__zoomReady) return;
    wrap.__zoomReady = true;

    var lens = null, bgSrc = null;

    function ensureSource() {
      if (bgSrc) return;
      resolveSource(img, function (src) { bgSrc = src; if (lens) lens.style.backgroundImage = 'url("' + src + '")'; });
    }

    function show() {
      ensureSource();
      if (lens) return;
      lens = document.createElement('div');
      lens.className = 'zoom-lens';
      lens.style.width = LENS + 'px';
      lens.style.height = LENS + 'px';
      if (bgSrc) lens.style.backgroundImage = 'url("' + bgSrc + '")';
      wrap.appendChild(lens);
    }
    function hide() {
      if (lens) { lens.remove(); lens = null; }
    }
    function move(e) {
      if (!lens) return;
      var r = img.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      // за пределами картинки — прячем
      if (x < 0 || y < 0 || x > r.width || y > r.height) { hide(); return; }
      // лупа-тултип НАД курсором: центр по X на курсоре, низ лупы — выше курсора на GAP
      var lx = x - LENS / 2;
      var ly = y - LENS - GAP;
      lens.style.left = lx + 'px';
      lens.style.top  = ly + 'px';
      // фон лупы: участок вокруг точки под курсором, увеличенный в ZOOM раз
      lens.style.backgroundSize = (r.width * ZOOM) + 'px ' + (r.height * ZOOM) + 'px';
      var bx = x * ZOOM - LENS / 2;
      var by = y * ZOOM - LENS / 2;
      lens.style.backgroundPosition = (-bx) + 'px ' + (-by) + 'px';
    }

    wrap.addEventListener('mouseenter', show);
    wrap.addEventListener('mousemove', move);
    wrap.addEventListener('mouseleave', hide);
  }

  function init() {
    document.querySelectorAll('.cat-model__photo').forEach(attach);
  }

  // каталог/модель рендерятся скриптами — ждём, пока появятся фото
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
  // повторная инициализация после динамического рендера (catalog-render / model-render)
  window.addEventListener('load', init);
})();
