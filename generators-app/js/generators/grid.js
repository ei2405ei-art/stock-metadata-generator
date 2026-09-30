var GridGen = {
  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">📐 Шаблоны сеток</h2><p class="page-subtitle">Пустые сетки для скетчинга и заметок</p>';
    s += App.buildSettings('grid', [
      { title: '📐 Тип сетки', content: GridGen._typeSection() },
      { title: '📏 Размеры', content: GridGen._sizeSection() },
      { title: '🎨 Стиль', content: GridGen._styleSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreview('grid');
    s += '</div></div>';
    document.getElementById('page-grid').innerHTML = s;
    App.bindRange('gd-cols', 'gd-cols-v');
    App.bindRange('gd-rows', 'gd-rows-v');
    App.bindRange('gd-cellsize', 'gd-cellsize-v', 'px');
    App.bindRange('gd-stroke', 'gd-stroke-v', 'px');
    App.bindRange('gd-opacity', 'gd-opacity-v', '%');
    App.bindRange('gd-accent', 'gd-accent-v');
    App.bindColor('gd-bg-color', 'gd-bg-color-v');
    App.bindColor('gd-color', 'gd-color-v');
    App.bindColor('gd-bg', 'gd-bg-v');
  },

  _typeSection: function() {
    var h = '<div class="form-group"><label>Тип</label>';
    h += '<div class="btn-group" style="flex-direction:column">';
    var types = [['Квадратная','square'],['Точечная','dots'],['Линейная','lined'],['Шестиугольная','hex'],['Треугольная','triangle'],['Изометрическая','iso'],['Сетка Лукаша','lucas'],['Крафт-бумага','kraft'],['Сетка Буллента','bullet']];
    for (var i = 0; i < types.length; i++) {
      h += '<input type="radio" name="gd-type" id="gd-t-' + types[i][1] + '" value="' + types[i][1] + '"' + (i === 0 ? ' checked' : '') + '>';
      h += '<label for="gd-t-' + types[i][1] + '">' + types[i][0] + '</label>';
    }
    h += '</div></div>';
    return h;
  },

  _sizeSection: function() {
    var h = '<div class="form-row">';
    h += '<div class="form-group"><label>Столбцы</label>';
    h += '<div class="range-row"><input type="range" id="gd-cols" min="2" max="50" value="12">';
    h += '<span class="range-val" id="gd-cols-v">12</span></div></div>';
    h += '<div class="form-group"><label>Строки</label>';
    h += '<div class="range-row"><input type="range" id="gd-rows" min="2" max="50" value="16">';
    h += '<span class="range-val" id="gd-rows-v">16</span></div></div>';
    h += '</div>';
    h += '<div class="form-group"><label>Размер ячейки</label>';
    h += '<div class="range-row"><input type="range" id="gd-cellsize" min="10" max="60" value="25">';
    h += '<span class="range-val" id="gd-cellsize-v">25px</span></div></div>';
    h += '<div class="form-group"><label>Отступ</label>';
    h += '<div class="range-row"><input type="range" id="gd-margin" min="20" max="100" value="40">';
    h += '<span class="range-val" id="gd-margin-v">40</span></div></div>';
    return h;
  },

  _styleSection: function() {
    var h = '<div class="form-row">';
    h += '<div class="form-group"><label>Цвет линий</label><input type="color" id="gd-color" value="#CCCCCC">';
    h += '<span class="range-val" id="gd-color-v">#CCCCCC</span></div>';
    h += '</div>';
    h += App.buildBgSection('gd');
    h += '<div class="form-group"><label>Толщина линий</label>';
    h += '<div class="range-row"><input type="range" id="gd-stroke" min="0.5" max="3" value="1" step="0.5">';
    h += '<span class="range-val" id="gd-stroke-v">1px</span></div></div>';
    h += '<div class="form-group"><label>Прозрачность</label>';
    h += '<div class="range-row"><input type="range" id="gd-opacity" min="10" max="100" value="50">';
    h += '<span class="range-val" id="gd-opacity-v">50%</span></div></div>';
    h += '<div class="form-group"><label>Акцентные линии каждые</label>';
    h += '<div class="range-row"><input type="range" id="gd-accent" min="0" max="10" value="5">';
    h += '<span class="range-val" id="gd-accent-v">5</span></div></div>';
    h += '<div class="form-group"><label>Цвет акцента</label><input type="color" id="gd-accent-color" value="#7C3AED"></div>';
    return h;
  },

  generate: function() {
    try {
      console.log('[Grid] generate');
      var type = GridGen._getRadioVal('gd-type');
      var cols = parseInt(document.getElementById('gd-cols').value) || 12;
      var rows = parseInt(document.getElementById('gd-rows').value) || 16;
      var cellSize = parseInt(document.getElementById('gd-cellsize').value) || 25;
      var margin = parseInt(document.getElementById('gd-margin').value) || 40;
      var color = document.getElementById('gd-color').value || '#CCCCCC';
      var bgColor = App.getBgColor('gd');
      var stroke = parseFloat(document.getElementById('gd-stroke').value) || 1;
      var opacity = parseInt(document.getElementById('gd-opacity').value) / 100 || 0.5;
      var accent = parseInt(document.getElementById('gd-accent').value) || 5;
      var accentColor = document.getElementById('gd-accent-color').value || '#7C3AED';

      var w = cols * cellSize + margin * 2;
      var h = rows * cellSize + margin * 2;
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">';
      svg += App.renderBgRect('gd', w, h);

      if (type === 'square' || type === 'lined' || type === 'kraft' || type === 'bullet' || type === 'lucas') {
        for (var r = 0; r <= rows; r++) {
          var isAccent = accent > 0 && r % accent === 0;
          var lineColor = isAccent ? accentColor : color;
          var lineW = isAccent ? stroke * 1.5 : stroke;
          var lineOp = isAccent ? opacity * 1.5 : opacity;
          svg += '<line x1="' + margin + '" y1="' + (margin + r * cellSize) + '" x2="' + (w - margin) + '" y2="' + (margin + r * cellSize) + '" stroke="' + lineColor + '" stroke-width="' + lineW + '" opacity="' + lineOp + '"/>';
        }
        for (var c = 0; c <= cols; c++) {
          var isAccent2 = accent > 0 && c % accent === 0;
          var lineColor2 = isAccent2 ? accentColor : color;
          var lineW2 = isAccent2 ? stroke * 1.5 : stroke;
          var lineOp2 = isAccent2 ? opacity * 1.5 : opacity;
          svg += '<line x1="' + (margin + c * cellSize) + '" y1="' + margin + '" x2="' + (margin + c * cellSize) + '" y2="' + (h - margin) + '" stroke="' + lineColor2 + '" stroke-width="' + lineW2 + '" opacity="' + lineOp2 + '"/>';
        }
        if (type === 'kraft') {
          svg += '<rect x="' + margin + '" y="' + margin + '" width="' + (cols * cellSize) + '" height="' + (rows * cellSize) + '" fill="none" stroke="' + color + '" stroke-width="' + (stroke * 2) + '" opacity="' + opacity + '"/>';
        }
      } else if (type === 'dots') {
        for (var r2 = 0; r2 <= rows; r2++) {
          for (var c2 = 0; c2 <= cols; c2++) {
            var isAccent3 = accent > 0 && (r2 % accent === 0 || c2 % accent === 0);
            var dotColor = isAccent3 ? accentColor : color;
            var dotR = isAccent3 ? stroke * 2 : stroke * 1.2;
            svg += '<circle cx="' + (margin + c2 * cellSize) + '" cy="' + (margin + r2 * cellSize) + '" r="' + dotR + '" fill="' + dotColor + '" opacity="' + opacity + '"/>';
          }
        }
      } else if (type === 'hex') {
        var hexH = cellSize * Math.sqrt(3) / 2;
        for (var hr = 0; hr < rows; hr++) {
          for (var hc = 0; hc < cols; hc++) {
            var hx = margin + hc * cellSize * 1.5;
            var hy = margin + hr * hexH * 2 + (hc % 2 === 1 ? hexH : 0);
            var pts = '';
            for (var a = 0; a < 6; a++) {
              var angle = (a * 60 - 30) * Math.PI / 180;
              pts += (hx + cellSize * 0.45 * Math.cos(angle)).toFixed(1) + ',' + (hy + cellSize * 0.45 * Math.sin(angle)).toFixed(1) + ' ';
            }
            svg += '<polygon points="' + pts + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" opacity="' + opacity + '"/>';
          }
        }
      } else if (type === 'triangle') {
        var triH = cellSize * 0.866;
        for (var tr = 0; tr < rows; tr++) {
          for (var tc = 0; tc < cols; tc++) {
            var tx = margin + tc * cellSize;
            var ty = margin + tr * triH;
            var up = (tr + tc) % 2 === 0;
            var pts2;
            if (up) pts2 = tx + ',' + (ty + triH) + ' ' + (tx + cellSize / 2) + ',' + ty + ' ' + (tx + cellSize) + ',' + (ty + triH);
            else pts2 = tx + ',' + ty + ' ' + (tx + cellSize / 2) + ',' + (ty + triH) + ' ' + (tx + cellSize) + ',' + ty;
            svg += '<polygon points="' + pts2 + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" opacity="' + opacity + '"/>';
          }
        }
      } else if (type === 'iso') {
        var isoH = cellSize * 0.866;
        for (var ir = 0; ir < rows; ir++) {
          for (var ic = 0; ic < cols; ic++) {
            var ix = margin + ic * cellSize;
            var iy = margin + ir * isoH;
            svg += '<line x1="' + ix + '" y1="' + iy + '" x2="' + (ix + cellSize / 2) + '" y2="' + (iy + isoH) + '" stroke="' + color + '" stroke-width="' + stroke + '" opacity="' + opacity + '"/>';
            svg += '<line x1="' + (ix + cellSize) + '" y1="' + iy + '" x2="' + (ix + cellSize / 2) + '" y2="' + (iy + isoH) + '" stroke="' + color + '" stroke-width="' + stroke + '" opacity="' + opacity + '"/>';
          }
        }
      }

      svg += '</svg>';
      document.getElementById('preview-grid').innerHTML = svg;
    } catch (e) {
      console.error('[Grid] error:', e);
      alert('Ошибка: ' + e.message);
    }
  },

  _getRadioVal: function(name) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) { if (els[i].checked) return els[i].value; }
    return '';
  }
};

window.GridGen = GridGen;
