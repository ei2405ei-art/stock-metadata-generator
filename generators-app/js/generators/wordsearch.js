var WordsearchGen = {
  words: {
    ru: ['КОД','ЦИКЛ','ФУНКЦИЯ','МАССИВ','СТРОКА','ПЕРЕМЕННАЯ','СЕРВЕР','ДАННЫЕ','ОШИБКА','СЕТЬ','ФАЙЛ','ПАПКА','КЛАВИША','ЭКРАН','СИСТЕМА','АЛГОРИТМ','БРАУЗЕР','ПАМЯТЬ','ПРОЦЕССОР','ПРОГРАММА'],
    en: ['CODE','LOOP','FUNCTION','ARRAY','STRING','VARIABLE','SERVER','DATA','ERROR','NETWORK','FILE','FOLDER','KEYBOARD','SCREEN','SYSTEM','ALGORITHM','BROWSER','MEMORY','PROCESSOR','PROGRAM']
  },

  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">🔍 Филворды</h2><p class="page-subtitle">Спрята́нные слова с L-поворотами</p>';
    s += App.buildSettings('wordsearch', [
      { title: '🌍 Язык и размер', content: WordsearchGen._langSection() },
      { title: '📐 Направления', content: WordsearchGen._directionSection() },
      { title: '🎨 Стиль', content: WordsearchGen._styleSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreview('wordsearch');
    s += '</div></div>';
    document.getElementById('page-wordsearch').innerHTML = s;
    App.bindRange('ws-fontsize', 'ws-fontsize-v', 'px');
    App.bindColor('ws-bg-color', 'ws-bg-color-v');
  },

  _langSection: function() {
    var h = '<div class="form-group"><label>Язык</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="ws-lang" id="ws-l-ru" value="ru" checked><label for="ws-l-ru">Русский</label>';
    h += '<input type="radio" name="ws-lang" id="ws-l-en" value="en"><label for="ws-l-en">Английский</label>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Размер сетки</label>';
    h += '<div class="range-row"><input type="range" id="ws-size" min="8" max="25" value="14">';
    h += '<span class="range-val" id="ws-size-v">14</span></div></div>';
    h += '<div class="form-group"><label>Количество слов</label>';
    h += '<div class="range-row"><input type="range" id="ws-wordcount" min="3" max="15" value="8">';
    h += '<span class="range-val" id="ws-wordcount-v">8</span></div></div>';
    h += '<div class="form-group"><label>Свои слова (через запятую)</label>';
    h += '<textarea id="ws-custom-words" rows="2" placeholder="КОД, ЦИКЛ, СЕТЬ..."></textarea></div>';
    return h;
  },

  _directionSection: function() {
    var h = '<div class="form-group"><label>Направления</label>';
    h += '<div style="display:flex;flex-direction:column;gap:4px">';
    var dirs = [['→ Вправо', 'right'], ['← Влево', 'left'], ['↓ Вниз', 'down'], ['↑ Вверх', 'up']];
    var checked = ['right','left','down'];
    for (var i = 0; i < dirs.length; i++) {
      var chk = checked.indexOf(dirs[i][1]) >= 0 ? ' checked' : '';
      h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="ws-dir-' + dirs[i][1] + '"' + chk + '><span class="toggle-slider"></span></label><span style="font-size:12px">' + dirs[i][0] + '</span></div>';
    }
    h += '</div></div>';
    h += '<div class="form-group"><label>Макс. поворотов (L-shape)</label>';
    h += '<div class="range-row"><input type="range" id="ws-turns" min="0" max="3" value="1">';
    h += '<span class="range-val" id="ws-turns-v">1</span></div></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="ws-reverse" checked><span class="toggle-slider"></span></label><span style="font-size:12px">Разрешить реверс (задом наперёд)</span></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="ws-diagonal"><span class="toggle-slider"></span></label><span style="font-size:12px">Диагональные направления</span></div>';
    return h;
  },

  _styleSection: function() {
    var h = '<div class="form-row">';
    h += '<div class="form-group"><label>Цвет букв</label><input type="color" id="ws-text-color" value="#1E1B4B">';
    h += '<span class="range-val" id="ws-text-color-v">#1E1B4B</span></div>';
    h += '</div>';
    h += App.buildBgSection('ws');
    h += '<div class="form-group"><label>Размер шрифта</label>';
    h += '<div class="range-row"><input type="range" id="ws-fontsize" min="12" max="28" value="18">';
    h += '<span class="range-val" id="ws-fontsize-v">18px</span></div></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="ws-show-solution"><span class="toggle-slider"></span></label><span style="font-size:12px">Показать решение</span></div>';
    h += '<div class="form-group"><label>Рамка ячейки</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="ws-border" id="ws-b-none" value="none"><label for="ws-b-none">Нет</label>';
    h += '<input type="radio" name="ws-border" id="ws-b-thin" value="thin" checked><label for="ws-b-thin">Тонкая</label>';
    h += '<input type="radio" name="ws-border" id="ws-b-bold" value="bold"><label for="ws-b-bold">Жирная</label>';
    h += '</div></div>';
    return h;
  },

  generate: function() {
    try {
      console.log('[Wordsearch] generate');
      var lang = WordsearchGen._getRadioVal('ws-lang');
      var size = parseInt(document.getElementById('ws-size').value) || 14;
      var wordCount = parseInt(document.getElementById('ws-wordcount').value) || 8;
      var maxTurns = parseInt(document.getElementById('ws-turns').value) || 1;
      var allowReverse = document.getElementById('ws-reverse').checked;
      var allowDiag = document.getElementById('ws-diagonal').checked;
      var textColors = document.getElementById('ws-text-color').value || '#1E1B4B';
      var bgColor = App.getBgColor('ws');
      var fontSize = parseInt(document.getElementById('ws-fontsize').value) || 18;
      var showSolution = document.getElementById('ws-show-solution').checked;
      var border = WordsearchGen._getRadioVal('ws-border');

      var dirs = [];
      if (document.getElementById('ws-dir-right').checked) dirs.push([0, 1]);
      if (document.getElementById('ws-dir-left').checked) dirs.push([0, -1]);
      if (document.getElementById('ws-dir-down').checked) dirs.push([1, 0]);
      if (document.getElementById('ws-dir-up').checked) dirs.push([-1, 0]);
      if (allowDiag) { dirs.push([1, 1]); dirs.push([1, -1]); dirs.push([-1, 1]); dirs.push([-1, -1]); }
      if (dirs.length === 0) dirs = [[0, 1], [0, -1], [1, 0]];

      var customWords = document.getElementById('ws-custom-words').value.trim();
      var wordPool = [];
      if (customWords) {
        var parts = customWords.split(',');
        for (var i = 0; i < parts.length; i++) {
          var w = parts[i].trim().toUpperCase().replace(/[^А-ЯA-Z]/g, '');
          if (w.length >= 3 && w.length <= size) wordPool.push(w);
        }
      }
      if (wordPool.length < wordCount) {
        var src = WordsearchGen.words[lang] || WordsearchGen.words.ru;
        var shuffled = src.slice();
        WordsearchGen._shuffleArr(shuffled);
        for (var j = 0; j < shuffled.length && wordPool.length < wordCount; j++) {
          if (shuffled[j].length <= size) wordPool.push(shuffled[j]);
        }
      }

      var grid = [];
      for (var r = 0; r < size; r++) { grid[r] = []; for (var c = 0; c < size; c++) grid[r][c] = ''; }
      var placed = [];

      for (var wi = 0; wi < wordPool.length; wi++) {
        var word = wordPool[wi];
        var result = WordsearchGen._placeWord(grid, word, size, dirs, maxTurns);
        if (result) {
          placed.push({ word: word, cells: result });
        }
      }

      // Fill empty cells with random letters
      var alphabet = lang === 'en' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ';
      for (var r2 = 0; r2 < size; r2++) {
        for (var c2 = 0; c2 < size; c2++) {
          if (!grid[r2][c2]) grid[r2][c2] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }

      var svg = WordsearchGen._renderSVG(grid, size, placed, textColors, bgColor, fontSize, showSolution, border);
      document.getElementById('preview-wordsearch').innerHTML = svg;
    } catch (e) {
      console.error('[Wordsearch] error:', e);
      alert('Ошибка: ' + e.message);
    }
  },

  _getRadioVal: function(name) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) { if (els[i].checked) return els[i].value; }
    return '';
  },

  _shuffleArr: function(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
  },

  _placeWord: function(grid, word, size, dirs, maxTurns) {
    // Try random placements
    for (var attempt = 0; attempt < 200; attempt++) {
      var r = Math.floor(Math.random() * size);
      var c = Math.floor(Math.random() * size);
      var dir = dirs[Math.floor(Math.random() * dirs.length)];
      var result = WordsearchGen._tryPlace(grid, word, r, c, dir, size, maxTurns, 0);
      if (result) return result;
    }
    return null;
  },

  _tryPlace: function(grid, word, startR, startC, dir, size, maxTurnsLeft, turnCount) {
    var cells = [];
    var r = startR, c = startC;
    var currentDir = dir;
    var remaining = word;

    for (var i = 0; i < word.length; i++) {
      if (r < 0 || r >= size || c < 0 || c >= size) return null;
      if (grid[r][c] && grid[r][c] !== word[i]) return null;
      cells.push([r, c]);
      if (i < word.length - 1) {
        var nr = r + currentDir[0];
        var nc = c + currentDir[1];
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && (!grid[nr][nc] || grid[nr][nc] === word[i + 1])) {
          r = nr; c = nc;
        } else if (turnCount < maxTurnsLeft) {
          // Try turning
          var turnDirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
          WordsearchGen._shuffleArr(turnDirs);
          var found = false;
          for (var t = 0; t < turnDirs.length; t++) {
            var tr = r + turnDirs[t][0];
            var tc = c + turnDirs[t][1];
            if (tr >= 0 && tr < size && tc >= 0 && tc < size && (!grid[tr][tc] || grid[tr][tc] === word[i + 1])) {
              r = tr; c = tc;
              currentDir = turnDirs[t];
              turnCount++;
              found = true;
              break;
            }
          }
          if (!found) return null;
        } else {
          return null;
        }
      }
    }

    // Place the word
    for (var j = 0; j < cells.length; j++) {
      grid[cells[j][0]][cells[j][1]] = word[j];
    }
    return cells;
  },

  _renderSVG: function(grid, size, placed, textColor, bgColor, fontSize, showSolution, border) {
    var cellSize = fontSize + 8;
    var total = size * cellSize + 20;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" width="' + total + '" height="' + total + '">';
    svg += App.renderBgRect('ws', total, total);

    // Build solution cell set
    var solutionCells = {};
    if (showSolution) {
      for (var p = 0; p < placed.length; p++) {
        for (var c = 0; c < placed[p].cells.length; c++) {
          solutionCells[placed[p].cells[c][0] + ',' + placed[p].cells[c][1]] = true;
        }
      }
    }

    // Border style
    var strokeW = border === 'bold' ? '1.5' : border === 'thin' ? '0.5' : '0';
    var strokeOp = border !== 'none' ? ' opacity="0.2"' : '';

    for (var r = 0; r < size; r++) {
      for (var c2 = 0; c2 < size; c2++) {
        var x = 10 + c2 * cellSize;
        var y = 10 + r * cellSize;
        if (border !== 'none') {
          svg += '<rect x="' + x + '" y="' + y + '" width="' + cellSize + '" height="' + cellSize + '" fill="none" stroke="' + textColor + '" stroke-width="' + strokeW + '"' + strokeOp + '/>';
        }
        var isSol = solutionCells[r + ',' + c2];
        var fill = isSol ? '#7C3AED' : textColor;
        var opacity = isSol ? ' opacity="0.9"' : '';
        svg += '<text x="' + (x + cellSize / 2) + '" y="' + (y + cellSize / 2 + 1) + '" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize + '" font-family="monospace" fill="' + fill + '"' + opacity + '>' + grid[r][c2] + '</text>';
      }
    }

    svg += '</svg>';
    return svg;
  }
};

window.WordsearchGen = WordsearchGen;
