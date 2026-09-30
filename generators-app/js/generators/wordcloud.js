var WordcloudGen = {
  palettes: {
    sunset: ['#FF6B6B','#FFA07A','#FFD700','#FF4500','#DC143C'],
    ocean: ['#006994','#40E0D0','#48D1CC','#5F9EA0','#00CED1'],
    forest: ['#228B22','#32CD32','#006400','#8FBC8F','#9ACD32'],
    neon: ['#FF00FF','#00FFFF','#FF1493','#7FFF00','#FF6344'],
    pastel: ['#FFB3BA','#FFDFBA','#FFFFBA','#BAFFC9','#BAE1FF']
  },

  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">☁️ Облака слов</h2><p class="page-subtitle">Визуализация текста по частоте слов</p>';
    s += App.buildSettings('wordcloud', [
      { title: '📝 Текст', content: WordcloudGen._textSection() },
      { title: '🎨 Стиль', content: WordcloudGen._styleSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreview('wordcloud');
    s += '</div></div>';
    document.getElementById('page-wordcloud').innerHTML = s;
    App.bindRange('wc-minsize', 'wc-minsize-v', 'px');
    App.bindRange('wc-maxsize', 'wc-maxsize-v', 'px');
    App.bindColor('wc-bg-color', 'wc-bg-color-v');
  },

  _textSection: function() {
    var h = '<div class="form-group"><label>Текст</label>';
    h += '<textarea id="wc-text" rows="5" placeholder="Вставьте текст для облака слов...">Код функция переменная массив цикл строка ошибка данные сеть сервер браузер файл папка экран система алгоритм память процессор программа код код функция переменная</textarea></div>';
    h += '<div class="form-group"><label>Макс. слов</label>';
    h += '<div class="range-row"><input type="range" id="wc-maxwords" min="5" max="80" value="30">';
    h += '<span class="range-val" id="wc-maxwords-v">30</span></div></div>';
    return h;
  },

  _styleSection: function() {
    var h = '<div class="form-group"><label>Палитра</label><div class="btn-group" style="flex-direction:column">';
    var names = Object.keys(WordcloudGen.palettes);
    for (var i = 0; i < names.length; i++) {
      h += '<input type="radio" name="wc-palette" id="wc-p-' + names[i] + '" value="' + names[i] + '"' + (i === 0 ? ' checked' : '') + '>';
      h += '<label for="wc-p-' + names[i] + '">' + names[i] + '</label>';
    }
    h += '</div></div>';
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>Мин. размер</label>';
    h += '<div class="range-row"><input type="range" id="wc-minsize" min="8" max="24" value="12">';
    h += '<span class="range-val" id="wc-minsize-v">12px</span></div></div>';
    h += '<div class="form-group"><label>Макс. размер</label>';
    h += '<div class="range-row"><input type="range" id="wc-maxsize" min="24" max="72" value="48">';
    h += '<span class="range-val" id="wc-maxsize-v">48px</span></div></div>';
    h += '</div>';
    h += App.buildBgSection('wc');
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="wc-bold" checked><span class="toggle-slider"></span></label><span style="font-size:12px">Жирный шрифт</span></div>';
    h += '<div class="form-group"><label>Форма</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="wc-shape" id="wc-s-rect" value="rect" checked><label for="wc-s-rect">Прямоугольник</label>';
    h += '<input type="radio" name="wc-shape" id="wc-s-circle" value="circle"><label for="wc-s-circle">Круг</label>';
    h += '<input type="radio" name="wc-shape" id="wc-s-diamond" value="diamond"><label for="wc-s-diamond">Ромб</label>';
    h += '</div></div>';
    return h;
  },

  generate: function() {
    try {
      console.log('[Wordcloud] generate');
      var text = document.getElementById('wc-text').value.trim();
      if (!text) { alert('Введите текст'); return; }
      var maxWords = parseInt(document.getElementById('wc-maxwords').value) || 30;
      var palette = WordcloudGen._getRadioVal('wc-palette');
      var colors = WordcloudGen.palettes[palette] || WordcloudGen.palettes.sunset;
      var minSize = parseInt(document.getElementById('wc-minsize').value) || 12;
      var maxSize = parseInt(document.getElementById('wc-maxsize').value) || 48;
      var bgColor = App.getBgColor('wc');
      var bold = document.getElementById('wc-bold').checked;
      var shape = WordcloudGen._getRadioVal('wc-shape');

      // Word frequency
      var words = text.toLowerCase().replace(/[^а-яa-zа-яё\s]/g, '').split(/\s+/);
      var freq = {};
      for (var i = 0; i < words.length; i++) {
        if (words[i].length >= 2) freq[words[i]] = (freq[words[i]] || 0) + 1;
      }
      var sorted = Object.keys(freq).sort(function(a, b) { return freq[b] - freq[a]; });
      sorted = sorted.slice(0, maxWords);
      if (sorted.length === 0) { alert('Нет слов для отображения'); return; }
      var maxFreq = freq[sorted[0]];

      var w = 800, h = 500;
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">';
      svg += App.renderBgRect('wc', w, h);

      // Simple spiral placement
      var placed = [];
      for (var j = 0; j < sorted.length; j++) {
        var word = sorted[j];
        var size = minSize + (maxSize - minSize) * (freq[word] / maxFreq);
        var fontSize = Math.round(size);
        var fw = bold ? ' font-weight="bold"' : '';
        var fill = colors[j % colors.length];
        var wordW = word.length * fontSize * 0.55;
        var wordH = fontSize * 1.2;

        // Try spiral placement
        var cx = w / 2, cy = h / 2;
        var placed2 = false;
        for (var t = 0; t < 500; t++) {
          var angle = t * 0.15;
          var radius = t * 0.8;
          var px = cx + radius * Math.cos(angle);
          var py = cy + radius * Math.sin(angle);
          var rect = { x: px - wordW / 2, y: py - wordH / 2, w: wordW, h: wordH };

          // Shape check
          if (shape === 'circle') {
            var dx = (px - cx) / (w * 0.45);
            var dy = (py - cy) / (h * 0.45);
            if (dx * dx + dy * dy > 1) continue;
          } else if (shape === 'diamond') {
            if (Math.abs(px - cx) / (w * 0.45) + Math.abs(py - cy) / (h * 0.45) > 1) continue;
          }

          if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > w || rect.y + rect.h > h) continue;
          var overlap = false;
          for (var p = 0; p < placed.length; p++) {
            if (rect.x < placed[p].x + placed[p].w && rect.x + rect.w > placed[p].x &&
                rect.y < placed[p].y + placed[p].h && rect.y + rect.h > placed[p].y) {
              overlap = true; break;
            }
          }
          if (!overlap) {
            svg += '<text x="' + px.toFixed(1) + '" y="' + py.toFixed(1) + '" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize + '"' + fw + ' fill="' + fill + '" font-family="sans-serif">' + word + '</text>';
            placed.push(rect);
            placed2 = true;
            break;
          }
        }
      }

      svg += '</svg>';
      document.getElementById('preview-wordcloud').innerHTML = svg;
    } catch (e) {
      console.error('[Wordcloud] error:', e);
      alert('Ошибка: ' + e.message);
    }
  },

  _getRadioVal: function(name) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) { if (els[i].checked) return els[i].value; }
    return '';
  }
};

window.WordcloudGen = WordcloudGen;
