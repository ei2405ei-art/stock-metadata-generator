var CrosswordGen = {
  words: {
    ru: [
      ['АЛГОРИТМ', 'Последовательность действий для решения задачи'],
      ['ПЕРЕМЕННАЯ', 'Именованная область памяти для хранения данных'],
      ['ФУНКЦИЯ', 'Именованный блок кода, выполняющий задачу'],
      ['ЦИКЛ', 'Повторяющийся блок команд'],
      ['МАССИВ', 'Упорядоченная коллекция элементов'],
      ['СТРОКА', 'Последовательность символов'],
      ['ОШИБКА', 'Неверное действие в программе'],
      ['КОД', 'Текст программы на языке программирования'],
      ['ДАННЫЕ', 'Информация для обработки'],
      ['СЕТЬ', 'Система соединённых компьютеров'],
      ['СЕРВЕР', 'Компьютер, предоставляющий услуги другим'],
      ['БРАУЗЕР', 'Программа для просмотра веб-страниц'],
      ['ФАЙЛ', 'Упорядоченные данные на диске'],
      ['ПАПКА', 'Контейнер для файлов'],
      ['КЛАВИША', 'Элемент клавиатуры для ввода символа'],
      ['ЭКРАН', 'Устройство отображения информации'],
      ['ПРОЦЕССОР', 'Центральное вычислительное устройство'],
      ['ПАМЯТЬ', 'Устройство хранения данных'],
      ['ДИСПЛЕЙ', 'Устройство вывода графической информации'],
      ['СИСТЕМА', 'Совокупность компонентов, работающих вместе']
    ],
    en: [
      ['ALGORITHM', 'A step-by-step procedure for solving a problem'],
      ['VARIABLE', 'A named storage location for data'],
      ['FUNCTION', 'A named block of code that performs a task'],
      ['LOOP', 'A repeating block of commands'],
      ['ARRAY', 'An ordered collection of elements'],
      ['STRING', 'A sequence of characters'],
      ['ERROR', 'An incorrect action in a program'],
      ['CODE', 'Text of a program in a programming language'],
      ['DATA', 'Information to be processed'],
      ['NETWORK', 'A system of connected computers'],
      ['SERVER', 'A computer that provides services to others'],
      ['BROWSER', 'A program for viewing web pages'],
      ['FILE', 'Ordered data on disk'],
      ['FOLDER', 'A container for files'],
      ['DISPLAY', 'A device for outputting graphical information'],
      ['MEMORY', 'A device for storing data'],
      ['SYSTEM', 'A set of components working together']
    ]
  },

  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">📝 Кроссворды</h2><p class="page-subtitle">Слова с подсказками, CSP-алгоритм</p>';
    s += App.buildSettings('crossword', [
      { title: '🌍 Язык и размер', content: CrosswordGen._langSection() },
      { title: '📝 Слова', content: CrosswordGen._wordsSection() },
      { title: '🎨 Стиль', content: CrosswordGen._styleSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreview('crossword');
    s += '</div></div>';
    document.getElementById('page-crossword').innerHTML = s;
    App.bindColor('cw-cell-color', 'cw-cell-color-v');
    App.bindColor('cw-bg-color', 'cw-bg-color-v');
  },

  _langSection: function() {
    var h = '<div class="form-group"><label>Язык</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="cw-lang" id="cw-l-ru" value="ru" checked><label for="cw-l-ru">Русский</label>';
    h += '<input type="radio" name="cw-lang" id="cw-l-en" value="en"><label for="cw-l-en">Английский</label>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Макс. слов</label>';
    h += '<div class="range-row"><input type="range" id="cw-max-words" min="5" max="20" value="10">';
    h += '<span class="range-val" id="cw-max-words-v">10</span></div></div>';
    h += '<div class="form-group"><label>Макс. длина слова</label>';
    h += '<div class="range-row"><input type="range" id="cw-max-len" min="3" max="12" value="9">';
    h += '<span class="range-val" id="cw-max-len-v">9</span></div></div>';
    return h;
  },

  _wordsSection: function() {
    var h = '<div class="form-group"><label>Свои слова (через запятую)</label>';
    h += '<textarea id="cw-custom-words" rows="3" placeholder="КОД, ФУНКЦИЯ, ЦИКЛ..."></textarea></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="cw-use-preset" checked><span class="toggle-slider"></span></label><span style="font-size:12px">Использовать встроенные слова</span></div>';
    return h;
  },

  _styleSection: function() {
    var h = '<div class="form-group"><label>Позиция подсказок</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="cw-clues" id="cw-cl-right" value="right" checked><label for="cw-cl-right">Справа</label>';
    h += '<input type="radio" name="cw-clues" id="cw-cl-below" value="below"><label for="cw-cl-below">Снизу</label>';
    h += '<input type="radio" name="cw-clues" id="cw-cl-split" value="split"><label for="cw-cl-split">Раздельно</label>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Заголовок</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="cw-title" id="cw-t-none" value="none"><label for="cw-t-none">Без заголовка</label>';
    h += '<input type="radio" name="cw-title" id="cw-t-num" value="numbered" checked><label for="cw-t-num">Номер</label>';
    h += '<input type="radio" name="cw-title" id="cw-t-cat" value="category"><label for="cw-t-cat">Категория</label>';
    h += '</div></div>';
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>Цвет ячеек</label><input type="color" id="cw-cell-color" value="#7C3AED">';
    h += '<span class="range-val" id="cw-cell-color-v">#7C3AED</span></div>';
    h += '</div>';
    h += App.buildBgSection('cw');
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="cw-numbered" checked><span class="toggle-slider"></span></label><span style="font-size:12px">Нумеровать ячейки</span></div>';
    return h;
  },

  generate: function() {
    try {
      console.log('[Crossword] generate');
      var lang = CrosswordGen._getRadioVal('cw-lang');
      var maxWords = parseInt(document.getElementById('cw-max-words').value) || 10;
      var maxLen = parseInt(document.getElementById('cw-max-len').value) || 9;
      var cluePos = CrosswordGen._getRadioVal('cw-clues');
      var cellColor = document.getElementById('cw-cell-color').value || '#7C3AED';
      var bgColor = App.getBgColor('cw');
      var numbered = document.getElementById('cw-numbered').checked;
      var usePreset = document.getElementById('cw-use-preset').checked;
      var customWords = document.getElementById('cw-custom-words').value.trim();

      var wordList = [];
      if (customWords) {
        var parts = customWords.split(',');
        for (var i = 0; i < parts.length; i++) {
          var w = parts[i].trim().toUpperCase();
          if (w.length >= 3 && w.length <= maxLen) wordList.push([w, '']);
        }
      }
      if (usePreset && wordList.length < maxWords) {
        var pool = CrosswordGen.words[lang] || CrosswordGen.words.ru;
        var shuffled = pool.slice();
        CrosswordGen._shuffleArr(shuffled);
        for (var j = 0; j < shuffled.length && wordList.length < maxWords; j++) {
          if (shuffled[j][0].length <= maxLen) wordList.push(shuffled[j]);
        }
      }
      if (wordList.length === 0) { alert('Добавьте слова для кроссворда'); return; }

      var placed = CrosswordGen._placeWords(wordList);
      var svg = CrosswordGen._renderSVG(placed, cellColor, bgColor, numbered, cluePos);

      document.getElementById('preview-crossword').innerHTML = svg;
    } catch (e) {
      console.error('[Crossword] error:', e);
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

  _placeWords: function(wordList) {
    var placed = [];
    if (wordList.length === 0) return placed;
    // Place first word horizontally in center
    var first = wordList[0];
    var startRow = 0, startCol = 0;
    placed.push({
      word: first[0], hint: first[1],
      row: startRow, col: startCol, dir: 'across',
      number: 1
    });

    // Try to place remaining words by finding intersections
    for (var i = 1; i < wordList.length; i++) {
      var word = wordList[i][0];
      var hint = wordList[i][1];
      var best = null;
      var bestScore = -1;
      for (var p = 0; p < placed.length; p++) {
        var pw = placed[p].word;
        for (var a = 0; a < word.length; a++) {
          for (var b = 0; b < pw.length; b++) {
            if (word[a] === pw[b]) {
              var nr, nc, nd;
              if (placed[p].dir === 'across') {
                nr = placed[p].row - a;
                nc = placed[p].col + b;
                nd = 'down';
              } else {
                nr = placed[p].row + b;
                nc = placed[p].col - a;
                nd = 'across';
              }
              if (CrosswordGen._canPlaceAt(placed, word, nr, nc, nd)) {
                var score = CrosswordGen._scorePlacement(placed, word, nr, nc, nd);
                if (score > bestScore) { bestScore = score; best = { row: nr, col: nc, dir: nd }; }
              }
            }
          }
        }
      }
      if (best) {
        placed.push({ word: word, hint: hint, row: best.row, col: best.col, dir: best.dir, number: placed.length + 1 });
      }
    }

    // Normalize coordinates
    var minR = Infinity, minC = Infinity;
    for (var k = 0; k < placed.length; k++) {
      if (placed[k].row < minR) minR = placed[k].row;
      if (placed[k].col < minC) minC = placed[k].col;
    }
    for (var m = 0; m < placed.length; m++) {
      placed[m].row -= minR;
      placed[m].col -= minC;
    }

    return placed;
  },

  _canPlaceAt: function(placed, word, row, col, dir) {
    for (var i = 0; i < word.length; i++) {
      var r = dir === 'down' ? row + i : row;
      var c = dir === 'across' ? col + i : col;
      if (r < 0 || c < 0) return false;
      // Check overlap with existing words
      for (var p = 0; p < placed.length; p++) {
        var pw = placed[p];
        for (var j = 0; j < pw.word.length; j++) {
          var pr = pw.dir === 'down' ? pw.row + j : pw.row;
          var pc = pw.dir === 'across' ? pw.col + j : pw.col;
          if (pr === r && pc === c) {
            if (pw.word[j] !== word[i]) return false;
          }
        }
      }
      // Check adjacency (perpendicular)
      for (var p2 = 0; p2 < placed.length; p2++) {
        var pw2 = placed[p2];
        for (var j2 = 0; j2 < pw2.word.length; j2++) {
          var pr2 = pw2.dir === 'down' ? pw2.row + j2 : pw2.row;
          var pc2 = pw2.dir === 'across' ? pw2.col + j2 : pw2.col;
          if (pr2 === r && pc2 === c) continue; // same cell = overlap, already checked
          if (dir === 'across') {
            if (pr2 === r && Math.abs(pc2 - c) === 1) return false;
          } else {
            if (pc2 === c && Math.abs(pr2 - r) === 1) return false;
          }
        }
      }
    }
    return true;
  },

  _scorePlacement: function(placed, word, row, col, dir) {
    var score = 0;
    for (var i = 0; i < word.length; i++) {
      var r = dir === 'down' ? row + i : row;
      var c = dir === 'across' ? col + i : col;
      for (var p = 0; p < placed.length; p++) {
        var pw = placed[p];
        for (var j = 0; j < pw.word.length; j++) {
          var pr = pw.dir === 'down' ? pw.row + j : pw.row;
          var pc = pw.dir === 'across' ? pw.col + j : pw.col;
          if (pr === r && pc === c) score += 10;
        }
      }
    }
    return score;
  },

  _renderSVG: function(placed, cellColor, bgColor, numbered, cluePos) {
    if (placed.length === 0) return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" width="200" height="100"><text x="100" y="50" text-anchor="middle" fill="#999">Нет слов</text></svg>';

    var cellSize = 30;
    var maxR = 0, maxC = 0;
    for (var i = 0; i < placed.length; i++) {
      for (var j = 0; j < placed[i].word.length; j++) {
        var r = placed[i].dir === 'down' ? placed[i].row + j : placed[i].row;
        var c = placed[i].dir === 'across' ? placed[i].col + j : placed[i].col;
        if (r > maxR) maxR = r;
        if (c > maxC) maxC = c;
      }
    }

    var across = [];
    var down = [];
    for (var k = 0; k < placed.length; k++) {
      if (placed[k].dir === 'across') across.push(placed[k]);
      else down.push(placed[k]);
    }
    // Re-number
    var num = 1;
    for (var a = 0; a < across.length; a++) across[a].number = num++;
    for (var d = 0; d < down.length; d++) down[d].number = num++;

    var gridW = (maxC + 1) * cellSize + 20;
    var gridH = (maxR + 1) * cellSize + 20;
    var clueW = cluePos === 'split' ? 220 : (cluePos === 'right' ? 220 : 0);
    var clueH = cluePos === 'below' ? (across.length + down.length) * 18 + 40 : 0;
    var totalW = gridW + clueW + 20;
    var totalH = gridH + clueH + 20;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + totalW + ' ' + totalH + '" width="' + totalW + '" height="' + totalH + '">';
    svg += App.renderBgRect('cw', totalW, totalH);

    // Build cell map
    var cellMap = {};
    for (var p = 0; p < placed.length; p++) {
      for (var pw = 0; pw < placed[p].word.length; pw++) {
        var cr = placed[p].dir === 'down' ? placed[p].row + pw : placed[p].row;
        var cc = placed[p].dir === 'across' ? placed[p].col + pw : placed[p].col;
        var key = cr + ',' + cc;
        if (!cellMap[key]) cellMap[key] = { letter: placed[p].word[pw], number: 0, filled: true };
      }
    }

    // Assign clue numbers to cells
    for (var p2 = 0; p2 < placed.length; p2++) {
      var key2 = placed[p2].row + ',' + placed[p2].col;
      if (cellMap[key2]) cellMap[key2].number = placed[p2].number;
    }

    // Draw cells
    for (var key3 in cellMap) {
      var parts = key3.split(',');
      var r3 = parseInt(parts[0]), c3 = parseInt(parts[1]);
      var x = 10 + c3 * cellSize;
      var y = 10 + r3 * cellSize;
      svg += '<rect x="' + x + '" y="' + y + '" width="' + cellSize + '" height="' + cellSize + '" fill="white" stroke="' + cellColor + '" stroke-width="1.5"/>';
      if (cellMap[key3].number > 0 && numbered) {
        svg += '<text x="' + (x + 3) + '" y="' + (y + 10) + '" font-size="8" fill="' + cellColor + '">' + cellMap[key3].number + '</text>';
      }
    }

    // Draw clues
    var clueX = gridW + 10;
    var clueY = 10;
    if (across.length > 0) {
      svg += '<text x="' + clueX + '" y="' + clueY + '" font-size="11" font-weight="bold" fill="' + cellColor + '">ПО ГОРИЗОНТАЛИ</text>';
      clueY += 16;
      for (var ac = 0; ac < across.length; ac++) {
        svg += '<text x="' + clueX + '" y="' + clueY + '" font-size="10" fill="#333">' + across[ac].number + '. ' + (across[ac].hint || across[ac].word) + '</text>';
        clueY += 16;
      }
      clueY += 8;
    }
    if (down.length > 0) {
      svg += '<text x="' + clueX + '" y="' + clueY + '" font-size="11" font-weight="bold" fill="' + cellColor + '">ПО ВЕРТИКАЛИ</text>';
      clueY += 16;
      for (var dc = 0; dc < down.length; dc++) {
        svg += '<text x="' + clueX + '" y="' + clueY + '" font-size="10" fill="#333">' + down[dc].number + '. ' + (down[dc].hint || down[dc].word) + '</text>';
        clueY += 16;
      }
    }

    svg += '</svg>';
    return svg;
  }
};

window.CrosswordGen = CrosswordGen;
