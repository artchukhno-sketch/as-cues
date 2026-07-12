// AS Cues — переводы. Язык определяется по папке в адресе: /uk/… → uk, /en/… → en, иначе ru.
// t('Цена') отдаёт строку на текущем языке; если перевода нет — возвращает исходную русскую,
// поэтому страница никогда не остаётся с пустым местом.
(function () {
  var path = location.pathname;
  var lang = /\/uk(\/|$)/.test(path) ? 'uk' : /\/en(\/|$)/.test(path) ? 'en' : 'ru';

  var dict = (window.I18N && window.I18N[lang]) || {};

  window.LANG = lang;

  // Неразрывный пробел приходит в двух видах: как сущность &nbsp; (из разметки)
  // и как символ U+00A0 (внутри строк словаря). Сводим оба к обычному пробелу,
  // чтобы ключ находился независимо от написания.
  function norm(s) {
    return String(s).replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ');
  }

  var byNorm = {};
  Object.keys(dict).forEach(function (k) { byNorm[norm(k)] = dict[k]; });

  window.t = function (s) {
    if (s == null || s === '') return '';
    if (dict[s] != null) return dict[s];
    var v = byNorm[norm(s)];
    return v == null ? s : v;
  };

  // Пути к картинкам лежат в общих данных относительно корня («img/models/…»).
  // Со страницы в /uk/ или /en/ до корня нужно подняться на уровень выше.
  var base = lang === 'ru' ? '' : '../';
  window.asset = function (p) {
    if (!p) return p;
    if (/^(https?:)?\/\//.test(p) || p.charAt(0) === '/') return p;   // абсолютный — не трогаем
    return base + p;
  };

  // Единицы измерения приклеены к числу в данных: «~1150г», «166см», «~160 см».
  // Переводим только хвост (г → g, см → cm), число не трогаем.
  // Габариты записаны русской буквой «х» («90х11,5х5») — меняем на знак умножения:
  // на английской версии кириллица в размерах выглядит как ошибка.
  var UNITS = { 'см': 'см', 'г': 'г', 'кг': 'кг', 'мм': 'мм' };
  window.tUnit = function (s) {
    if (s == null || s === '') return '';
    return String(s)
      // (?=\d) — заглядывание вперёд: цифра не «съедается», поэтому в «95х8х5»
      // заменяются обе «х», а не только первая
      .replace(/(?<=\d)\s*[хx]\s*(?=\d)/gi, '×')
      .replace(/([а-яё]+)\s*$/i, function (m, u) {
        return UNITS[u] ? ' ' + window.t(u) : m;
      });
  };
})();
