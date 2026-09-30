var App = {
  currentPage: 'home',
  generators: {
    maze: { title: 'Лабиринты', icon: '🌀', desc: 'Квадратные, соты, треугольные и круговые лабиринты с решением', status: 'ready' },
    sudoku: { title: 'Судоку', icon: '🔢', desc: 'Классическое судоку 9×9 и 4×4 с 6 типами правил', status: 'ready' },
    cryptogram: { title: 'Криптограммы', icon: '🔐', desc: 'Шифры буквами, цифрами и символами. Русский и английский', status: 'ready' },
    crossword: { title: 'Кроссворды', icon: '📝', desc: 'Кроссворды со словами и подсказками, CSP-алгоритм', status: 'ready' },
    wordsearch: { title: 'Филворды', icon: '🔍', desc: 'Спрята́нные слова с L-поворотами, реверсом и изгибами', status: 'ready' },
    geometric: { title: 'Паттерны', icon: '🔷', desc: 'Геометрические узоры: линии, круги, волны и др.', status: 'ready' },
    stereogram: { title: 'Стереограммы', icon: '👁️', desc: 'SIRDS стереограммы с картами глубины', status: 'ready' },
    gradient: { title: 'Градиенты', icon: '🎨', desc: 'Линейные, радиальные, многоцветные с масками', status: 'ready' },
    wordcloud: { title: 'Облака слов', icon: '☁️', desc: 'Визуализация текста по частоте слов', status: 'ready' },
    flowchart: { title: 'Блок-схемы', icon: '📊', desc: 'Генерация блок-схем из текста', status: 'ready' },
    grid: { title: 'Шаблоны сеток', icon: '📐', desc: 'Пустые сетки для скетчинга и заметок', status: 'ready' },
    blank: { title: 'Пустые шаблоны', icon: '📄', desc: 'Чистые SVG-шаблоны различных размеров', status: 'ready' }
  },

  init: function() {
    console.log('[App] init');
    var self = this;
    var links = document.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function(e) {
        e.preventDefault();
        var page = this.getAttribute('data-page');
        if (page) self.navigate(page);
      });
    }
    Limits.init();
    this.renderHome();
    var hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById('page-' + hash)) {
      this.navigate(hash);
    }
  },

  _initialized: {},

  navigate: function(page) {
    console.log('[App] navigate to', page);
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) pages[i].classList.remove('active');
    var target = document.getElementById('page-' + page);
    if (target) target.classList.add('active');
    var links = document.querySelectorAll('.nav-link');
    for (var j = 0; j < links.length; j++) {
      links[j].classList.toggle('active', links[j].getAttribute('data-page') === page);
    }
    this.currentPage = page;
    window.location.hash = page;

    // Initialize generator page on first visit
    if (!this._initialized[page]) {
      var genNames = ['maze','sudoku','cryptogram','crossword','wordsearch','geometric','stereogram','gradient','wordcloud','flowchart','grid','blank'];
      for (var g = 0; g < genNames.length; g++) {
        if (page === genNames[g] && window[genNames[g].charAt(0).toUpperCase() + genNames[g].slice(1) + 'Gen']) {
          var genObj = window[genNames[g].charAt(0).toUpperCase() + genNames[g].slice(1) + 'Gen'];
          if (typeof genObj.initPage === 'function') {
            genObj.initPage();
            this._initialized[page] = true;
          }
          break;
        }
      }
    }
  },

  renderHome: function() {
    var el = document.getElementById('page-home');
    var html = '<h1 class="page-title">📦 ScriptStock</h1>';
    html += '<p class="page-subtitle">Генераторы стокового контента — головоломки, графика, шаблоны</p>';
    html += '<div class="home-grid">';
    var keys = Object.keys(this.generators);
    for (var i = 0; i < keys.length; i++) {
      var g = this.generators[keys[i]];
      var badgeCls = g.status === 'ready' ? 'badge badge-ready' : 'badge badge-soon';
      var badgeText = g.status === 'ready' ? 'ГОТОВО' : 'СКОРО';
      html += '<div class="home-card" onclick="App.navigate(\'' + keys[i] + '\')">';
      html += '<div class="card-badge"><span class="' + badgeCls + '">' + badgeText + '</span></div>';
      html += '<div class="card-icon">' + g.icon + '</div>';
      html += '<h3>' + g.title + '</h3>';
      html += '<p>' + g.desc + '</p>';
      html += '</div>';
    }
    html += '</div>';
    el.innerHTML = html;
  },

  buildSettings: function(genId, sections) {
    var html = '';
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      var openCls = i < 3 ? ' open' : '';
      html += '<div class="accordion' + openCls + '" id="acc-' + genId + '-' + i + '">';
      html += '<button class="accordion-header" onclick="App.toggleAccordion(this)">';
      html += '<span>' + s.title + '</span><span class="accordion-arrow">▼</span>';
      html += '</button>';
      html += '<div class="accordion-body">' + s.content + '</div>';
      html += '</div>';
    }
    html += '<div class="actions-bar">';
    var genName = genId.charAt(0).toUpperCase() + genId.slice(1) + 'Gen';
    html += '<button class="btn btn-primary" onclick="' + genName + '.generate()">⚡ Сгенерировать</button>';
    html += '<button class="btn btn-outline" onclick="ExportManager.exportPNG(\'' + genId + '\')">📥 PNG</button>';
    html += '<button class="btn btn-outline" onclick="ExportManager.exportSVG(\'' + genId + '\')">📥 SVG</button>';
    html += '<div class="batch-control">';
    html += '<label><input type="range" id="batch-' + genId + '" min="1" max="10" value="1" onchange="document.getElementById(\'batch-val-' + genId + '\').textContent=this.value"> ×<span id="batch-val-' + genId + '">1</span></label>';
    html += '<button class="btn btn-sm btn-success" onclick="ExportManager.batchExport(\'' + genId + '\')">📦 Пакет</button>';
    html += '</div></div>';
    return html;
  },

  buildPreview: function(genId) {
    return '<p class="preview-label">Предпросмотр</p><div class="preview-area" id="preview-' + genId + '"></div>';
  },

  buildPreviewRow: function(genId, leftLabel, rightLabel) {
    var html = '<p class="preview-label">Предпросмотр</p>';
    html += '<div class="preview-row">';
    html += '<div class="preview-panel"><p class="preview-label">' + leftLabel + '</p><div class="preview-area" id="preview-' + genId + '-puzzle"></div></div>';
    html += '<div class="preview-panel"><p class="preview-label">' + rightLabel + '</p><div class="preview-area" id="preview-' + genId + '-answer"></div></div>';
    html += '</div>';
    return html;
  },

  toggleAccordion: function(btn) {
    var acc = btn.parentElement.parentElement;
    acc.classList.toggle('open');
  },

  buildBgSection: function(genId) {
    var h = '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="' + genId + '-transparent"><span class="toggle-slider"></span></label><span style="font-size:12px">Прозрачный фон</span></div>';
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>Цвет фона</label><input type="color" id="' + genId + '-bg-color" value="#FFFFFF">';
    h += '<span class="range-val" id="' + genId + '-bg-color-v">#FFFFFF</span></div>';
    h += '</div>';
    return h;
  },

  isTransparent: function(genId) {
    var el = document.getElementById(genId + '-transparent');
    return el ? el.checked : false;
  },

  getBgColor: function(genId, defaultColor) {
    if (this.isTransparent(genId)) return 'none';
    var el = document.getElementById(genId + '-bg-color');
    return el ? el.value : (defaultColor || '#FFFFFF');
  },

  renderBgRect: function(genId, w, h) {
    var bg = this.getBgColor(genId);
    if (bg === 'none') {
      return '<defs><pattern id="' + genId + '-chk" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#F0F0F0"/><rect width="10" height="10" fill="#DCDCDC"/><rect x="10" y="10" width="10" height="10" fill="#DCDCDC"/></pattern></defs><rect width="' + w + '" height="' + h + '" fill="url(#' + genId + '-chk)"/>';
    }
    return '<rect width="' + w + '" height="' + h + '" fill="' + bg + '"/>';
  },

  bindRange: function(inputId, displayId, suffix) {
    var el = document.getElementById(inputId);
    var disp = document.getElementById(displayId);
    if (!el || !disp) return;
    el.addEventListener('input', function() { disp.textContent = el.value + (suffix || ''); });
  },

  bindColor: function(inputId, displayId) {
    var el = document.getElementById(inputId);
    var disp = document.getElementById(displayId);
    if (!el || !disp) return;
    el.addEventListener('input', function() { disp.textContent = el.value; });
  },

  hash: function(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  }
};

var Limits = {
  MAX_PER_DAY: 100,
  STORAGE_KEY: 'scriptstock_limits',

  _getData: function() {
    try {
      var raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      var today = new Date().toDateString();
      if (data.date !== today) {
        data = { date: today, downloads: 0, history: [] };
        this._save(data);
      }
      return data;
    } catch (e) {
      return { date: new Date().toDateString(), downloads: 0, history: [] };
    }
  },

  _save: function(data) {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  },

  init: function() {
    var data = this._getData();
    this._updateUI(data);
  },

  canDownload: function() {
    var data = this._getData();
    return data.downloads < this.MAX_PER_DAY;
  },

  remaining: function() {
    var data = this._getData();
    return Math.max(0, this.MAX_PER_DAY - data.downloads);
  },

  recordDownload: function(genId, svgContent) {
    var data = this._getData();
    data.downloads++;

    var contentHash = App.hash(svgContent || '');
    var duplicate = false;
    for (var i = 0; i < data.history.length; i++) {
      if (data.history[i].hash === contentHash) {
        duplicate = true;
        break;
      }
    }
    data.history.push({
      gen: genId,
      hash: contentHash,
      ts: Date.now(),
      duplicate: duplicate
    });

    if (data.history.length > 500) data.history = data.history.slice(-500);
    this._save(data);
    this._updateUI(data);
    return { ok: !duplicate, duplicate: duplicate, remaining: this.MAX_PER_DAY - data.downloads };
  },

  _updateUI: function(data) {
    var el = document.getElementById('dl-limit');
    if (el) el.textContent = this.MAX_PER_DAY - (data ? data.downloads : 0);
    var badge = document.getElementById('user-info');
    if (badge) badge.style.display = 'flex';
  }
};

var Uniqueness = {
  STORAGE_KEY: 'scriptstock_hashes',

  _getHashes: function() {
    try {
      var raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  },

  _save: function(hashes) {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(hashes)); } catch (e) {}
  },

  check: function(svgContent) {
    var h = App.hash(svgContent || '');
    var hashes = this._getHashes();
    for (var i = 0; i < hashes.length; i++) {
      if (hashes[i] === h) return false;
    }
    return true;
  },

  register: function(svgContent) {
    var h = App.hash(svgContent || '');
    var hashes = this._getHashes();
    hashes.push(h);
    if (hashes.length > 1000) hashes = hashes.slice(-1000);
    this._save(hashes);
  }
};

document.addEventListener('DOMContentLoaded', function() { App.init(); });
