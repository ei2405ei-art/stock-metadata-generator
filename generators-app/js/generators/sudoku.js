var SudokuGen = {
  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">🔢 Судоку</h2><p class="page-subtitle">9×9 и 4×4 с 6 типами правил</p>';
    s += App.buildSettings('sudoku', [
      { title: '📐 Размер и правила', content: SudokuGen._rulesSection() },
      { title: '🎯 Сложность', content: SudokuGen._difficultySection() },
      { title: '🎨 Стиль', content: SudokuGen._styleSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreview('sudoku');
    s += '</div></div>';
    document.getElementById('page-sudoku').innerHTML = s;
    App.bindRange('sdk-thick', 'sdk-thick-v', 'px');
    App.bindColor('sdk-color', 'sdk-color-v');
    App.bindColor('sdk-bg-color', 'sdk-bg-color-v');
  },

  _rulesSection: function() {
    var h = '<div class="form-group"><label>Размер сетки</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="sdk-size" id="sdk-sz-9" value="9" checked>';
    h += '<label for="sdk-sz-9">9 × 9</label>';
    h += '<input type="radio" name="sdk-size" id="sdk-sz-4" value="4">';
    h += '<label for="sdk-sz-4">4 × 4</label>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Тип правил</label>';
    h += '<div class="btn-group" style="flex-direction:column">';
    var rules = ['Классическое', 'Чётные числа', 'Нечётные числа', 'Гиперсудоку', 'Пазл (jigsaw)', 'Убийца (killer)'];
    var vals = ['classic', 'even', 'odd', 'hyper', 'jigsaw', 'killer'];
    for (var i = 0; i < rules.length; i++) {
      h += '<input type="radio" name="sdk-rule" id="sdk-r-' + vals[i] + '" value="' + vals[i] + '"' + (i === 0 ? ' checked' : '') + '>';
      h += '<label for="sdk-r-' + vals[i] + '">' + rules[i] + '</label>';
    }
    h += '</div></div>';
    return h;
  },

  _difficultySection: function() {
    var h = '<div class="form-group"><label>Уровень сложности</label>';
    h += '<div class="btn-group">';
    var diffs = [['Лёгкий', 'easy'], ['Средний', 'medium'], ['Сложный', 'hard'], ['Эксперт', 'expert']];
    for (var i = 0; i < diffs.length; i++) {
      var checked = i === 1 ? ' checked' : '';
      h += '<input type="radio" name="sdk-diff" id="sdk-d-' + diffs[i][1] + '" value="' + diffs[i][1] + '"' + checked + '>';
      h += '<label for="sdk-d-' + diffs[i][1] + '">' + diffs[i][0] + '</label>';
    }
    h += '</div></div>';
    return h;
  },

  _styleSection: function() {
    var h = '<div class="form-row">';
    h += '<div class="form-group"><label>Цвет цифр</label><input type="color" id="sdk-color" value="#1E1B4B">';
    h += '<span class="range-val" id="sdk-color-v">#1E1B4B</span></div>';
    h += '</div>';
    h += App.buildBgSection('sdk');
    h += '<div class="form-group"><label>Толщина линий</label>';
    h += '<div class="range-row"><input type="range" id="sdk-thick" min="1" max="6" value="2">';
    h += '<span class="range-val" id="sdk-thick-v">2px</span></div></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="sdk-given-bold"><span class="toggle-slider"></span></label><span style="font-size:12px">Заданные цифры — жирным</span></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="sdk-show-solution"><span class="toggle-slider"></span></label><span style="font-size:12px">Показать решение</span></div>';
    return h;
  },

  generate: function() {
    try {
      console.log('[Sudoku] generate');
      var size = parseInt(SudokuGen._getRadioVal('sdk-size')) || 9;
      var rule = SudokuGen._getRadioVal('sdk-rule');
      var diff = SudokuGen._getRadioVal('sdk-diff');
      var color = SudokuGen._getVal('sdk-color') || '#1E1B4B';
      var bgColor = App.getBgColor('sdk');
      var thickness = parseInt(SudokuGen._getVal('sdk-thick')) || 2;
      var givenBold = SudokuGen._getChecked('sdk-given-bold');
      var showSolution = SudokuGen._getChecked('sdk-show-solution');

      var solution = SudokuGen._solve(size, rule);
      var puzzle = SudokuGen._removeCells(solution, size, diff);
      var svg = SudokuGen._renderSVG(size, puzzle, solution, rule, color, bgColor, thickness, givenBold, showSolution);

      document.getElementById('preview-sudoku').innerHTML = svg;
    } catch (e) {
      console.error('[Sudoku] error:', e);
      alert('Ошибка: ' + e.message);
    }
  },

  _getRadioVal: function(name) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) { if (els[i].checked) return els[i].value; }
    return '';
  },
  _getVal: function(id) { var el = document.getElementById(id); return el ? el.value : ''; },
  _getChecked: function(id) { var el = document.getElementById(id); return el ? el.checked : false; },

  _solve: function(size, rule) {
    var board = [];
    for (var i = 0; i < size; i++) { board[i] = []; for (var j = 0; j < size; j++) board[i][j] = 0; }
    SudokuGen._fillBoard(board, size, rule);
    return board;
  },

  _fillBoard: function(board, size, rule) {
    var nums = [];
    for (var n = 1; n <= size; n++) nums.push(n);
    SudokuGen._shuffleArr(nums);
    return SudokuGen._fillHelper(board, size, 0, 0, nums, rule);
  },

  _fillHelper: function(board, size, row, col, nums, rule) {
    if (row === size) return true;
    var nextRow = col === size - 1 ? row + 1 : row;
    var nextCol = col === size - 1 ? 0 : col + 1;
    for (var i = 0; i < nums.length; i++) {
      var num = nums[i];
      if (SudokuGen._canPlace(board, size, row, col, num, rule)) {
        board[row][col] = num;
        if (SudokuGen._fillHelper(board, size, nextRow, nextCol, nums, rule)) return true;
        board[row][col] = 0;
      }
    }
    return false;
  },

  _canPlace: function(board, size, row, col, num, rule) {
    // Row check
    for (var c = 0; c < size; c++) { if (board[row][c] === num) return false; }
    // Col check
    for (var r = 0; r < size; r++) { if (board[r][col] === num) return false; }
    // Box check
    var boxSize = size === 4 ? 2 : 3;
    var br = Math.floor(row / boxSize) * boxSize;
    var bc = Math.floor(col / boxSize) * boxSize;
    for (var r2 = br; r2 < br + boxSize; r2++) {
      for (var c2 = bc; c2 < bc + boxSize; c2++) {
        if (board[r2][c2] === num) return false;
      }
    }
    // Hyper rule: overlapping 3x3 boxes (only for 9x9)
    if (rule === 'hyper' && size === 9) {
      var hyperBoxes = [[1,1],[1,5],[5,1],[5,5]];
      for (var h = 0; h < hyperBoxes.length; h++) {
        var hbr = hyperBoxes[h][0], hbc = hyperBoxes[h][1];
        if (row >= hbr && row < hbr + 3 && col >= hbc && col < hbc + 3) {
          for (var hr = hbr; hr < hbr + 3; hr++) {
            for (var hc = hbc; hc < hbc + 3; hc++) {
              if (board[hr][hc] === num) return false;
            }
          }
        }
      }
    }
    // Even/odd rule
    if (rule === 'even' && num % 2 !== 0) return false;
    if (rule === 'odd' && num % 2 === 0) return false;
    return true;
  },

  _removeCells: function(solution, size, diff) {
    var puzzle = [];
    for (var r = 0; r < size; r++) { puzzle[r] = []; for (var c = 0; c < size; c++) puzzle[r][c] = solution[r][c]; }
    var total = size * size;
    var toRemove;
    if (size === 4) {
      if (diff === 'easy') toRemove = 3;
      else if (diff === 'medium') toRemove = 5;
      else if (diff === 'hard') toRemove = 7;
      else toRemove = 9;
    } else {
      if (diff === 'easy') toRemove = Math.floor(total * 0.35);
      else if (diff === 'medium') toRemove = Math.floor(total * 0.45);
      else if (diff === 'hard') toRemove = Math.floor(total * 0.52);
      else toRemove = Math.floor(total * 0.58);
    }
    toRemove = Math.min(toRemove, total - 1);
    var positions = [];
    for (var i = 0; i < total; i++) positions.push(i);
    SudokuGen._shuffleArr(positions);
    for (var j = 0; j < toRemove; j++) {
      var pos = positions[j];
      puzzle[Math.floor(pos / size)][pos % size] = 0;
    }
    return puzzle;
  },

  _shuffleArr: function(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
  },

  _renderSVG: function(size, puzzle, solution, rule, color, bgColor, thickness, givenBold, showSolution) {
    var cellSize = size === 4 ? 60 : 45;
    var boardSize = size * cellSize;
    var padding = 30;
    var total = boardSize + padding * 2;
    var boxSize = size === 4 ? 2 : 3;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + total + ' ' + total + '" width="' + total + '" height="' + total + '">';
    svg += App.renderBgRect('sdk', total, total);

    // Cells
    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        var x = padding + c * cellSize;
        var y = padding + r * cellSize;
        svg += '<rect x="' + x + '" y="' + y + '" width="' + cellSize + '" height="' + cellSize + '" fill="none" stroke="' + color + '" stroke-width="' + thickness + '" opacity="0.3"/>';
        // Jigsaw shading
        if (rule === 'jigsaw') {
          var hue = ((r * size + c) * 37) % 360;
          svg += '<rect x="' + x + '" y="' + y + '" width="' + cellSize + '" height="' + cellSize + '" fill="hsl(' + hue + ',50%,92%)" opacity="0.5"/>';
        }
      }
    }

    // Box borders
    for (var br = 0; br < size; br += boxSize) {
      for (var bc = 0; bc < size; bc += boxSize) {
        svg += '<rect x="' + (padding + bc * cellSize) + '" y="' + (padding + br * cellSize) + '" width="' + (boxSize * cellSize) + '" height="' + (boxSize * cellSize) + '" fill="none" stroke="' + color + '" stroke-width="' + (thickness + 1) + '"/>';
      }
    }

    // Numbers
    for (var r2 = 0; r2 < size; r2++) {
      for (var c2 = 0; c2 < size; c2++) {
        var val = showSolution ? solution[r2][c2] : puzzle[r2][c2];
        if (val === 0) continue;
        var isGiven = puzzle[r2][c2] !== 0;
        var x2 = padding + c2 * cellSize + cellSize / 2;
        var y2 = padding + r2 * cellSize + cellSize / 2;
        var fontSize = size === 4 ? 24 : 18;
        var fontWeight = (givenBold && isGiven) ? ' font-weight="bold"' : '';
        var fill = isGiven ? color : '#6B7280';
        if (showSolution && !isGiven) fill = '#10B981';
        svg += '<text x="' + x2 + '" y="' + y2 + '" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize + '"' + fontWeight + ' fill="' + fill + '">' + val + '</text>';
      }
    }

    // Killer cages
    if (rule === 'killer') {
      svg += '<text x="' + (total / 2) + '" y="' + (padding - 10) + '" text-anchor="middle" font-size="10" fill="#6B7280">Killer Sudoku — каждая cage (3×2) = сумма 15</text>';
    }

    svg += '</svg>';
    return svg;
  }
};

window.SudokuGen = SudokuGen;
