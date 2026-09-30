var FlowchartGen = {
  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">📊 Блок-схемы</h2><p class="page-subtitle">Генерация блок-схем из текста</p>';
    s += App.buildSettings('flowchart', [
      { title: '📝 Данные', content: FlowchartGen._dataSection() },
      { title: '🎨 Стиль', content: FlowchartGen._styleSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreview('flowchart');
    s += '</div></div>';
    document.getElementById('page-flowchart').innerHTML = s;
    App.bindRange('fc-fontsize', 'fc-fontsize-v', 'px');
    App.bindColor('fc-bg-color', 'fc-bg-color-v');
  },

  _dataSection: function() {
    var h = '<div class="form-group"><label>Блоки (по одному на строку)</label>';
    h += '<textarea id="fc-text" rows="6" placeholder="Начало&#10;Получить данные&#10;Проверка&#10;Обработка&#10;Вывод результата&#10;Конец">Начало\nПолучить входные данные\nПроверка условий\nЕсли условие верно\nОбработать данные\nИначе\nПропустить\nВывести результат\nКонец</textarea></div>';
    h += '<div class="form-group"><label>Типы блоков (через запятую, по порядку)</label>';
    h += '<textarea id="fc-types" rows="3" placeholder="start,process,decision,process,end">start,process,decision,process,process,process,process,process,end</textarea></div>';
    h += '<div class="form-group"><label>Шаблон</label>';
    h += '<select id="fc-template" onchange="FlowchartGen._applyTemplate()">';
    h += '<option value="custom">Свой</option>';
    h += '<option value="algorithm">Алгоритм</option>';
    h += '<option value="user-story">Пользовательская история</option>';
    h += '<option value="pipeline">Пайплайн</option>';
    h += '</select></div>';
    return h;
  },

  _styleSection: function() {
    var h = '<div class="form-row">';
    h += '<div class="form-group"><label>Цвет блоков</label><input type="color" id="fc-color" value="#7C3AED">';
    h += '<span class="range-val" id="fc-color-v">#7C3AED</span></div>';
    h += '<div class="form-group"><label>Цвет текста</label><input type="color" id="fc-text-color" value="#FFFFFF">';
    h += '<span class="range-val" id="fc-text-color-v">#FFFFFF</span></div>';
    h += '</div>';
    h += App.buildBgSection('fc');
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>Цвет рамки</label><input type="color" id="fc-stroke" value="#1E1B4B">';
    h += '<span class="range-val" id="fc-stroke-v">#1E1B4B</span></div>';
    h += '</div>';
    h += '<div class="form-group"><label>Размер шрифта</label>';
    h += '<div class="range-row"><input type="range" id="fc-fontsize" min="8" max="20" value="12">';
    h += '<span class="range-val" id="fc-fontsize-v">12px</span></div></div>';
    h += '<div class="form-group"><label>Направление</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="fc-dir" id="fc-d-down" value="down" checked><label for="fc-d-down">Сверху вниз</label>';
    h += '<input type="radio" name="fc-dir" id="fc-d-right" value="right"><label for="fc-d-right">Слева направо</label>';
    h += '</div></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="fc-shadow"><span class="toggle-slider"></span></label><span style="font-size:12px">Тень блоков</span></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="fc-rounded" checked><span class="toggle-slider"></span></label><span style="font-size:12px">Скруглённые углы</span></div>';
    return h;
  },

  _applyTemplate: function() {
    var tpl = document.getElementById('fc-template').value;
    if (tpl === 'algorithm') {
      document.getElementById('fc-text').value = 'Начало\nВвод данных\nПроверка条件\nОбработка\nВывод\nКонец';
      document.getElementById('fc-types').value = 'start,process,decision,process,process,end';
    } else if (tpl === 'user-story') {
      document.getElementById('fc-text').value = 'Пользователь заходит\nВыбирает действие\nСистема обрабатывает\nРезультат\nКонец';
      document.getElementById('fc-types').value = 'start,process,process,process,end';
    } else if (tpl === 'pipeline') {
      document.getElementById('fc-text').value = 'Данные\nОчистка\nТрансформация\nМодель\nОценка\nДеплой';
      document.getElementById('fc-types').value = 'process,process,process,process,process,process';
    }
  },

  generate: function() {
    try {
      console.log('[Flowchart] generate');
      var text = document.getElementById('fc-text').value.trim();
      var typesStr = document.getElementById('fc-types').value.trim();
      if (!text) { alert('Введите блоки'); return; }

      var lines = text.split('\n');
      var types = typesStr.split(',').map(function(t) { return t.trim().toLowerCase(); });
      var color = document.getElementById('fc-color').value || '#7C3AED';
      var textColor = document.getElementById('fc-text-color').value || '#FFFFFF';
      var bgColor = App.getBgColor('fc');
      var strokeColor = document.getElementById('fc-stroke').value || '#1E1B4B';
      var fontSize = parseInt(document.getElementById('fc-fontsize').value) || 12;
      var direction = FlowchartGen._getRadioVal('fc-dir');
      var shadow = document.getElementById('fc-shadow').checked;
      var rounded = document.getElementById('fc-rounded').checked;

      var isVertical = direction === 'down';
      var blockW = 180, blockH = 50, gap = 30;
      var total = lines.length;
      var w = isVertical ? blockW + 80 : total * (blockW + gap) + 80;
      var h = isVertical ? total * (blockH + gap) + 80 : blockH + 80;

      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">';
      svg += App.renderBgRect('fc', w, h);

      if (shadow) {
        svg += '<defs><filter id="fc-shadow"><feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.15"/></filter></defs>';
      }

      for (var i = 0; i < lines.length; i++) {
        var type = types[i] || 'process';
        var x, y;
        if (isVertical) {
          x = (w - blockW) / 2;
          y = 30 + i * (blockH + gap);
        } else {
          x = 30 + i * (blockW + gap);
          y = (h - blockH) / 2;
        }

        var filterAttr = shadow ? ' filter="url(#fc-shadow)"' : '';
        var rx = rounded ? ' rx="8"' : '';

        if (type === 'start' || type === 'end') {
          var rr = blockH / 2;
          svg += '<rect x="' + x + '" y="' + y + '" width="' + blockW + '" height="' + blockH + '"' + rx + ' fill="' + color + '" stroke="' + strokeColor + '" stroke-width="1.5"' + filterAttr + '/>';
        } else if (type === 'decision') {
          var dx = x + blockW / 2, dy = y + blockH / 2;
          var dw = blockW * 0.6, dh = blockH * 0.7;
          svg += '<polygon points="' + dx + ',' + (dy - dh) + ' ' + (dx + dw) + ',' + dy + ' ' + dx + ',' + (dy + dh) + ' ' + (dx - dw) + ',' + dy + '" fill="' + color + '" stroke="' + strokeColor + '" stroke-width="1.5"' + filterAttr + '/>';
        } else if (type === 'io') {
          var iw = blockW * 0.85;
          svg += '<polygon points="' + (x + blockW * 0.1) + ',' + y + ' ' + (x + blockW) + ',' + y + ' ' + (x + blockW * 0.9) + ',' + (y + blockH) + ' ' + x + ',' + (y + blockH) + '" fill="' + color + '" stroke="' + strokeColor + '" stroke-width="1.5"' + filterAttr + '/>';
        } else {
          svg += '<rect x="' + x + '" y="' + y + '" width="' + blockW + '" height="' + blockH + '"' + rx + ' fill="' + color + '" stroke="' + strokeColor + '" stroke-width="1.5"' + filterAttr + '/>';
        }

        // Text
        var textX = x + blockW / 2;
        var textY = y + blockH / 2;
        svg += '<text x="' + textX + '" y="' + textY + '" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize + '" fill="' + textColor + '" font-family="sans-serif">' + lines[i] + '</text>';

        // Arrow
        if (i < lines.length - 1) {
          var ax, ay, bx, by;
          if (isVertical) {
            ax = w / 2; ay = y + blockH;
            bx = w / 2; by = y + blockH + gap;
          } else {
            ax = x + blockW; ay = h / 2;
            bx = x + blockW + gap; by = h / 2;
          }
          svg += '<line x1="' + ax + '" y1="' + ay + '" x2="' + bx + '" y2="' + by + '" stroke="' + strokeColor + '" stroke-width="1.5" marker-end="url(#fc-arrow)"/>';
        }
      }

      // Arrow marker
      svg += '<defs><marker id="fc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="' + strokeColor + '"/></marker></defs>';

      svg += '</svg>';
      document.getElementById('preview-flowchart').innerHTML = svg;
    } catch (e) {
      console.error('[Flowchart] error:', e);
      alert('Ошибка: ' + e.message);
    }
  },

  _getRadioVal: function(name) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) { if (els[i].checked) return els[i].value; }
    return '';
  }
};

window.FlowchartGen = FlowchartGen;
