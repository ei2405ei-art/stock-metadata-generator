var CryptogramGen = {
  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">🔐 Криптограммы</h2><p class="page-subtitle">Шифры буквами, цифрами и символами</p>';
    s += App.buildSettings('cryptogram', [
      { title: '🌍 Язык и шифр', content: CryptogramGen._langSection() },
      { title: '📝 Текст', content: CryptogramGen._textSection() },
      { title: '👁️ Позиция ответа', content: CryptogramGen._answerSection() },
      { title: '🎨 Стиль', content: CryptogramGen._styleSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreviewRow('cryptogram', 'Загадка', 'Ответ');
    s += '</div></div>';
    document.getElementById('page-cryptogram').innerHTML = s;
    App.bindRange('cr-shift', 'cr-shift-v', 'px');
    App.bindRange('cr-fontsize', 'cr-fontsize-v');
    App.bindColor('cr-color', 'cr-color-v');
    App.bindColor('cr-bg-color', 'cr-bg-color-v');
  },

  _langSection: function() {
    var h = '<div class="form-group"><label>Язык</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="cr-lang" id="cr-l-ru" value="ru" checked><label for="cr-l-ru">Русский</label>';
    h += '<input type="radio" name="cr-lang" id="cr-l-en" value="en"><label for="cr-l-en">Английский</label>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Тип шифра</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="cr-cipher" id="cr-c-let" value="letters" checked><label for="cr-c-let">Буквы</label>';
    h += '<input type="radio" name="cr-cipher" id="cr-c-num" value="numbers"><label for="cr-c-num">Цифры</label>';
    h += '<input type="radio" name="cr-cipher" id="cr-c-sym" value="symbols"><label for="cr-c-sym">Символы</label>';
    h += '</div></div>';
    return h;
  },

  _textSection: function() {
    var h = '<div class="form-group"><label>Текст для шифрования</label>';
    h += '<textarea id="cr-text" rows="4" placeholder="Введите текст или оставьте пусто для генерации...">Математика — это язык, на котором Бог написал Вселенную</textarea></div>';
    h += '<div class="form-group"><label>Тема цитаты</label><select id="cr-theme">';
    h += '<option value="science">Наука</option><option value="philosophy">Философия</option><option value="nature">Природа</option>';
    h += '<option value="math">Математика</option><option value="tech">Технологии</option></select></div>';
    return h;
  },

  _answerSection: function() {
    var h = '<div class="form-group"><label>Позиция ответа</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="cr-pos" id="cr-p-side" value="side" checked><label for="cr-p-side">Справа</label>';
    h += '<input type="radio" name="cr-pos" id="cr-p-bot" value="bottom"><label for="cr-p-bot">Снизу</label>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Сдвиг подсказки (px)</label>';
    h += '<div class="range-row"><input type="range" id="cr-shift" min="0" max="50" value="10">';
    h += '<span class="range-val" id="cr-shift-v">10</span></div></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="cr-rotate-answer"><span class="toggle-slider"></span></label><span style="font-size:12px">Повернуть ответ на 180°</span></div>';
    return h;
  },

  _styleSection: function() {
    var h = '<div class="form-group"><label>Заголовок</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="cr-title" id="cr-t-none" value="none"><label for="cr-t-none">Без заголовка</label>';
    h += '<input type="radio" name="cr-title" id="cr-t-num" value="numbered" checked><label for="cr-t-num">Номер</label>';
    h += '<input type="radio" name="cr-title" id="cr-t-cat" value="category"><label for="cr-t-cat">Категория</label>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Стиль ячейки</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="cr-cell" id="cr-cs-box" value="box" checked><label for="cr-cs-box">Квадраты</label>';
    h += '<input type="radio" name="cr-cell" id="cr-cs-circle" value="circle"><label for="cr-cs-circle">Круги</label>';
    h += '<input type="radio" name="cr-cell" id="cr-cs-diamond" value="diamond"><label for="cr-cs-diamond">Ромбы</label>';
    h += '</div></div>';
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>Размер шрифта</label>';
    h += '<div class="range-row"><input type="range" id="cr-fontsize" min="14" max="32" value="20">';
    h += '<span class="range-val" id="cr-fontsize-v">20</span></div></div>';
    h += '</div>';
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>Цвет шрифта</label><input type="color" id="cr-color" value="#1E1B4B">';
    h += '<span class="range-val" id="cr-color-v">#1E1B4B</span></div>';
    h += '</div>';
    h += App.buildBgSection('cr');
    return h;
  },

  generate: function() {
    try {
      console.log('[Cryptogram] generate');
      var lang = CryptogramGen._getRadioVal('cr-lang');
      var cipher = CryptogramGen._getRadioVal('cr-cipher');
      var text = document.getElementById('cr-text').value.trim();
      var answerPos = CryptogramGen._getRadioVal('cr-pos');
      var shift = parseInt(document.getElementById('cr-shift').value) || 0;
      var rotate = document.getElementById('cr-rotate-answer').checked;
      var titleMode = CryptogramGen._getRadioVal('cr-title');
      var cellStyle = CryptogramGen._getRadioVal('cr-cell');
      var fontSize = parseInt(document.getElementById('cr-fontsize').value) || 20;
      var color = document.getElementById('cr-color').value || '#1E1B4B';
      var bgColor = App.getBgColor('cr');

      if (!text) text = CryptogramGen._generateQuote(lang);

      var puzzle = CryptogramGen._encrypt(text, cipher, lang);
      var solution = CryptogramGen._buildSolution(text, cipher);

      var puzzleSvg = CryptogramGen._renderCrypto(puzzle.puzzleLetters, puzzle.mapping, fontSize, color, bgColor, cellStyle, titleMode, puzzle.number, 'puzzle');
      var answerSvg = CryptogramGen._renderCrypto(solution.letters, solution.mapping, fontSize, color, bgColor, cellStyle, 'none', 0, 'answer');

      document.getElementById('preview-cryptogram-puzzle').innerHTML = puzzleSvg;
      var ansEl = document.getElementById('preview-cryptogram-answer');
      ansEl.innerHTML = answerSvg;
      if (rotate) ansEl.style.transform = 'rotate(180deg)';
      else ansEl.style.transform = 'none';
    } catch (e) {
      console.error('[Cryptogram] error:', e);
      alert('Ошибка: ' + e.message);
    }
  },

  _getRadioVal: function(name) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) { if (els[i].checked) return els[i].value; }
    return '';
  },

  _generateQuote: function(lang) {
    var quotes = {
      ru: [
        'Математика — это язык, на котором Бог написал Вселенную',
        'Наука — это проверенные знания',
        'Природа не терпит пустоты',
        'Всё в мире подчиняется законам чисел',
        'Знание — это сила',
        'Лучшее доказательство того что возможно — это попробовать',
        'Мы то что мы делаем каждый день'
      ],
      en: [
        'Mathematics is the language of the universe',
        'Science is verified knowledge',
        'Knowledge is power',
        'The best proof that something is possible is to try it',
        'Nature does not tolerate emptiness',
        'Everything follows the laws of numbers',
        'We are what we do every day'
      ]
    };
    var arr = quotes[lang] || quotes.ru;
    return arr[Math.floor(Math.random() * arr.length)];
  },

  _encrypt: function(text, cipher, lang) {
    var letters = text.toUpperCase().split('');
    var uniqueLetters = [];
    var seen = {};
    for (var i = 0; i < letters.length; i++) {
      var ch = letters[i];
      if (/[А-ЯA-Z]/.test(ch) && !seen[ch]) {
        seen[ch] = true;
        uniqueLetters.push(ch);
      }
    }
    var pool;
    if (cipher === 'numbers') {
      pool = [];
      for (var n = 1; n <= 30; n++) pool.push(String(n));
    } else if (cipher === 'symbols') {
      pool = ['!','@','#','$','%','&','*','?','+','-','=','~','^','<','>','|','/','\\','(',')','[',']','{','}','_'];
    } else {
      pool = [];
      var src = lang === 'en' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ';
      for (var j = 0; j < src.length; j++) pool.push(src[j]);
    }
    CryptogramGen._shuffleArr(pool);
    var mapping = {};
    for (var k = 0; k < uniqueLetters.length; k++) {
      mapping[uniqueLetters[k]] = pool[k % pool.length];
    }
    var result = [];
    for (var m = 0; m < letters.length; m++) {
      if (/[А-ЯA-Z]/.test(letters[m])) result.push(mapping[letters[m]]);
      else result.push(letters[m]);
    }
    return { puzzleLetters: result, mapping: mapping, number: Math.floor(Math.random() * 999) + 1 };
  },

  _buildSolution: function(text, cipher) {
    var letters = text.toUpperCase().split('');
    var mapping = {};
    for (var i = 0; i < letters.length; i++) {
      if (/[А-ЯA-Z]/.test(letters[i]) && !mapping[letters[i]]) {
        mapping[letters[i]] = letters[i];
      }
    }
    return { letters: letters, mapping: mapping };
  },

  _shuffleArr: function(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
  },

  _renderCrypto: function(letters, mapping, fontSize, color, bgColor, cellStyle, titleMode, number, type) {
    var cellSize = fontSize + 16;
    var lineH = cellSize + 14;
    var maxPerLine = 18;
    var lines = [];
    var currentLine = [];
    for (var i = 0; i < letters.length; i++) {
      if (letters[i] === ' ') {
        if (currentLine.length > 0) lines.push(currentLine);
        lines.push([' ']);
        currentLine = [];
      } else {
        currentLine.push(letters[i]);
        if (currentLine.length >= maxPerLine) { lines.push(currentLine); currentLine = []; }
      }
    }
    if (currentLine.length > 0) lines.push(currentLine);

    var maxLen = 0;
    for (var l = 0; l < lines.length; l++) { if (lines[l].length > maxLen) maxLen = lines[l].length; }
    var w = maxLen * cellSize + 60;
    var titleH = titleMode !== 'none' ? 40 : 10;
    var h = lines.length * lineH + titleH + 40;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">';
    svg += App.renderBgRect('cr', w, h);

    if (titleMode !== 'none') {
      var titleText = titleMode === 'numbered' ? ('#' + number) : 'Криптограмма';
      svg += '<text x="' + (w / 2) + '" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="' + color + '">' + titleText + '</text>';
    }

    for (var li = 0; li < lines.length; li++) {
      var line = lines[li];
      for (var ci = 0; ci < line.length; ci++) {
        if (line[ci] === ' ') continue;
        var x = 30 + ci * cellSize;
        var y = titleH + li * lineH;

        if (cellStyle === 'circle') {
          svg += '<circle cx="' + (x + cellSize / 2) + '" cy="' + (y + cellSize / 2) + '" r="' + (cellSize / 2 - 2) + '" fill="none" stroke="' + color + '" stroke-width="1.5" opacity="0.3"/>';
        } else if (cellStyle === 'diamond') {
          var dx = x + cellSize / 2, dy = y + cellSize / 2, ds = cellSize / 2 - 2;
          svg += '<polygon points="' + dx + ',' + (dy - ds) + ' ' + (dx + ds) + ',' + dy + ' ' + dx + ',' + (dy + ds) + ' ' + (dx - ds) + ',' + dy + '" fill="none" stroke="' + color + '" stroke-width="1.5" opacity="0.3"/>';
        } else {
          svg += '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="' + (cellSize - 4) + '" height="' + (cellSize - 4) + '" fill="none" stroke="' + color + '" stroke-width="1.5" opacity="0.3" rx="2"/>';
        }

        var textY = y + cellSize / 2 + 2;
        var displayLetter = type === 'puzzle' ? (mapping[line[ci]] || line[ci]) : line[ci];
        svg += '<text x="' + (x + cellSize / 2) + '" y="' + textY + '" text-anchor="middle" font-size="' + fontSize + '" fill="' + color + '" font-family="monospace">' + displayLetter + '</text>';
      }
    }

    svg += '</svg>';
    return svg;
  }
};

window.CryptogramGen = CryptogramGen;
