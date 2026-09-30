var MazeGen = {
  settings: {},

  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">🌀 Лабиринты</h2><p class="page-subtitle">4 типа сетки с решением и маркерами</p>';
    s += App.buildSettings('maze', [
      { title: '📐 Тип сетки', content: MazeGen._gridTypeSection() },
      { title: '📏 Размер', content: MazeGen._sizeSection() },
      { title: '✏️ Стиль линий', content: MazeGen._lineStyleSection() },
      { title: '🎨 Цвет и градиент', content: MazeGen._colorSection() },
      { title: '🧭 Решение и маркеры', content: MazeGen._solutionSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreviewRow('maze', 'Лабиринт', 'Решение');
    s += '</div></div>';
    document.getElementById('page-maze').innerHTML = s;
    MazeGen._bindControls();
  },

  _gridTypeSection: function() {
    var h = '<div class="form-group"><label>Тип сетки</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="maze-grid" id="mz-g-sq" value="square" checked>';
    h += '<label for="mz-g-sq">Квадраты</label>';
    h += '<input type="radio" name="maze-grid" id="mz-g-hx" value="hex">';
    h += '<label for="mz-g-hx">Соты</label>';
    h += '<input type="radio" name="maze-grid" id="mz-g-tr" value="triangle">';
    h += '<label for="mz-g-tr">Треугольники</label>';
    h += '<input type="radio" name="maze-grid" id="mz-g-ci" value="circle">';
    h += '<label for="mz-g-ci">Круговая</label>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Алгоритм</label><select id="mz-algo">';
    h += '<option value="dfs">Обход в глубину (DFS)</option>';
    h += '<option value="prim">Алгоритм Прима</option>';
    h += '<option value="kruskal">Алгоритм Краскала</option>';
    h += '<option value="wilson">Алгоритм Уилсона</option>';
    h += '</select></div>';
    return h;
  },

  _sizeSection: function() {
    var h = '<div class="form-row">';
    h += '<div class="form-group"><label>Столбцы</label>';
    h += '<div class="range-row"><input type="range" id="mz-cols" min="3" max="40" value="15">';
    h += '<span class="range-val" id="mz-cols-v">15</span></div></div>';
    h += '<div class="form-group"><label>Строки</label>';
    h += '<div class="range-row"><input type="range" id="mz-rows" min="3" max="40" value="12">';
    h += '<span class="range-val" id="mz-rows-v">12</span></div></div>';
    h += '</div>';
    h += '<div class="form-group"><label>Отступ от края (px)</label>';
    h += '<div class="range-row"><input type="range" id="mz-margin" min="50" max="300" value="100">';
    h += '<span class="range-val" id="mz-margin-v">100</span></div></div>';
    return h;
  },

  _lineStyleSection: function() {
    var h = '<div class="form-group"><label>Толщина линий</label>';
    h += '<div class="range-row"><input type="range" id="mz-thick" min="1" max="30" value="2">';
    h += '<span class="range-val" id="mz-thick-v">2</span></div></div>';
    h += '<div class="form-group"><label>Стиль линий</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="mz-lstyle" id="mz-ls-sol" value="solid" checked>';
    h += '<label for="mz-ls-sol">Сплошные</label>';
    h += '<input type="radio" name="mz-lstyle" id="mz-ls-das" value="dash">';
    h += '<label for="mz-ls-das">Пунктир</label>';
    h += '<input type="radio" name="mz-lstyle" id="mz-ls-dbl" value="double">';
    h += '<label for="mz-ls-dbl">Двойные</label>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Концы линий</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="mz-cap" id="mz-cap-r" value="round" checked>';
    h += '<label for="mz-cap-r">Круглые</label>';
    h += '<input type="radio" name="mz-cap" id="mz-cap-s" value="square">';
    h += '<label for="mz-cap-s">Квадратные</label>';
    h += '<input type="radio" name="mz-cap" id="mz-cap-b" value="butt">';
    h += '<label for="mz-cap-b">Плоские</label>';
    h += '</div></div>';
    return h;
  },

  _colorSection: function() {
    var h = '<div class="form-row">';
    h += '<div class="form-group"><label>Цвет стен</label><input type="color" id="mz-wall-color" value="#1E1B4B">';
    h += '<span class="range-val" id="mz-wall-color-v">#1E1B4B</span></div>';
    h += '</div>';
    h += App.buildBgSection('mz');
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="mz-gradient"><span class="toggle-slider"></span></label><span style="font-size:12px">Градиент по стенам</span></div>';
    h += '<div class="form-group" style="margin-top:6px"><label>Направление градиента</label>';
    h += '<select id="mz-grad-dir"><option value="h">Горизонтальный</option><option value="v">Вертикальный</option><option value="d">По диагонали</option></select></div>';
    return h;
  },

  _solutionSection: function() {
    var h = '<div class="form-row">';
    h += '<div class="form-group"><label>Старт</label><input type="color" id="mz-start-color" value="#10B981">';
    h += '<span class="range-val" id="mz-start-color-v">#10B981</span></div>';
    h += '<div class="form-group"><label>Финиш</label><input type="color" id="mz-end-color" value="#EF4444">';
    h += '<span class="range-val" id="mz-end-color-v">#EF4444</span></div>';
    h += '</div>';
    h += '<div class="form-group"><label>Маркер старта</label><select id="mz-start-marker"><option value="circle">● Круг</option><option value="square">■ Квадрат</option><option value="triangle">▲ Треугольник</option><option value="star">★ Звезда</option></select></div>';
    h += '<div class="form-group"><label>Маркер финиша</label><select id="mz-end-marker"><option value="circle">● Круг</option><option value="square">■ Квадрат</option><option value="triangle">▲ Треугольник</option><option value="star">★ Звезда</option></select></div>';
    return h;
  },

  _bindControls: function() {
    App.bindRange('mz-cols', 'mz-cols-v');
    App.bindRange('mz-rows', 'mz-rows-v');
    App.bindRange('mz-margin', 'mz-margin-v', 'px');
    App.bindRange('mz-thick', 'mz-thick-v', 'px');
    App.bindColor('mz-wall-color', 'mz-wall-color-v');
    App.bindColor('mz-bg-color', 'mz-bg-color-v');
    App.bindColor('mz-start-color', 'mz-start-color-v');
    App.bindColor('mz-end-color', 'mz-end-color-v');
  },

  _getVal: function(id) { var el = document.getElementById(id); return el ? el.value : ''; },
  _getChecked: function(id) { var el = document.getElementById(id); return el ? el.checked : false; },
  _getRadio: function(name) { var els = document.getElementsByName(name); for (var i = 0; i < els.length; i++) { if (els[i].checked) return els[i].value; } return ''; },

  generate: function() {
    try {
      console.log('[Maze] generate');
      var gridType = MazeGen._getRadio('maze-grid');
      var cols = parseInt(MazeGen._getVal('mz-cols')) || 15;
      var rows = parseInt(MazeGen._getVal('mz-rows')) || 12;
      var margin = parseInt(MazeGen._getVal('mz-margin')) || 100;
      var thickness = parseInt(MazeGen._getVal('mz-thick')) || 2;
      var lineStyle = MazeGen._getRadio('mz-lstyle');
      var lineCap = MazeGen._getRadio('mz-cap');
      var wallColor = MazeGen._getVal('mz-wall-color') || '#1E1B4B';
      var bgColor = App.getBgColor('mz');
      var useGradient = MazeGen._getChecked('mz-gradient');
      var gradDir = MazeGen._getVal('mz-grad-dir');
      var startColor = MazeGen._getVal('mz-start-color') || '#10B981';
      var endColor = MazeGen._getVal('mz-end-color') || '#EF4444';
      var startMarker = MazeGen._getVal('mz-start-marker');
      var endMarker = MazeGen._getVal('mz-end-marker');
      var algo = MazeGen._getVal('mz-algo');

      var style = { thickness: thickness, lineStyle: lineStyle, lineCap: lineCap, wallColor: wallColor, bgColor: bgColor, useGradient: useGradient, gradDir: gradDir, startColor: startColor, endColor: endColor, startMarker: startMarker, endMarker: endMarker, margin: margin };

      if (gridType === 'square') {
        var data = MazeGen._genSquareData(cols, rows, algo);
        document.getElementById('preview-maze-puzzle').innerHTML = MazeGen._buildSquareSvg(data, cols, rows, style, false);
        document.getElementById('preview-maze-answer').innerHTML = MazeGen._buildSquareSvg(data, cols, rows, style, true);
      } else if (gridType === 'hex') {
        var data = MazeGen._genHexData(cols, rows);
        document.getElementById('preview-maze-puzzle').innerHTML = MazeGen._buildHexSvg(data, cols, rows, style, false);
        document.getElementById('preview-maze-answer').innerHTML = MazeGen._buildHexSvg(data, cols, rows, style, true);
      } else if (gridType === 'triangle') {
        var data = MazeGen._genTriData(cols, rows);
        document.getElementById('preview-maze-puzzle').innerHTML = MazeGen._buildTriSvg(data, cols, rows, style, false);
        document.getElementById('preview-maze-answer').innerHTML = MazeGen._buildTriSvg(data, cols, rows, style, true);
      } else if (gridType === 'circle') {
        var data = MazeGen._genCircleData(cols);
        document.getElementById('preview-maze-puzzle').innerHTML = MazeGen._buildCircleSvg(data, cols, style, false);
        document.getElementById('preview-maze-answer').innerHTML = MazeGen._buildCircleSvg(data, cols, style, true);
      }
    } catch (e) {
      console.error('[Maze] error:', e);
      alert('Ошибка: ' + e.message);
    }
  },

  _resolveWallColor: function(style) {
    var wc = style.wallColor;
    if (style.useGradient) {
      var dirAttr = '';
      if (style.gradDir === 'v') dirAttr = ' x2="0%" y2="100%"';
      else if (style.gradDir === 'd') dirAttr = ' x2="100%" y2="100%"';
      else dirAttr = ' x2="100%" y2="0%"';
      return { color: 'url(#mz-grad)', defs: '<defs><linearGradient id="mz-grad" x1="0%" y1="0%"' + dirAttr + '><stop offset="0%" stop-color="' + wc + '"/><stop offset="100%" stop-color="#A78BFA"/></linearGradient></defs>' };
    }
    return { color: wc, defs: '' };
  },

  _svgOpen: function(w, h) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">';
  },

  _dashArr: function(style) {
    return style.lineStyle === 'dash' ? ' stroke-dasharray="' + (style.thickness * 3) + ',' + (style.thickness * 2) + '"' : '';
  },

  _solutionSvg: function(solution, margin, cellSize, thickness) {
    if (!solution || solution.length < 2) return '';
    var pts = '';
    for (var i = 0; i < solution.length; i++) {
      var px = margin + solution[i][0] * cellSize + cellSize / 2;
      var py = margin + solution[i][1] * cellSize + cellSize / 2;
      pts += (i === 0 ? 'M' : 'L') + px + ',' + py;
    }
    return '<path d="' + pts + '" fill="none" stroke="#F59E0B" stroke-width="' + (thickness + 2) + '" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>';
  },

  // ---- Square ----
  _genSquareData: function(cols, rows, algo) {
    var grid = MazeGen._genGrid(cols, rows, algo);
    var solution = MazeGen._solveMaze(grid, cols, rows, 0, 0, cols - 1, rows - 1);
    return { grid: grid, solution: solution };
  },

  _buildSquareSvg: function(data, cols, rows, style, showSolution) {
    var cellSize = 30;
    var margin = style.margin;
    var w = cols * cellSize + margin * 2;
    var h = rows * cellSize + margin * 2;
    var dashArr = MazeGen._dashArr(style);
    var doubleOffset = style.lineStyle === 'double' ? style.thickness * 0.8 : 0;
    var resolved = MazeGen._resolveWallColor(style);
    var wc = resolved.color;

    var svg = MazeGen._svgOpen(w, h);
    svg += App.renderBgRect('mz', w, h);
    svg += resolved.defs;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = margin + c * cellSize;
        var y = margin + r * cellSize;
        var cell = data.grid[r * cols + c];
        var strokeAttr = style.lineStyle === 'double' ? 'stroke-width="' + (style.thickness * 0.4) + '"' : 'stroke-width="' + style.thickness + '"';

        if (cell & 1) {
          svg += '<line x1="' + x + '" y1="' + y + '" x2="' + (x + cellSize) + '" y2="' + y + '" stroke="' + wc + '" ' + strokeAttr + dashArr + ' stroke-linecap="' + style.lineCap + '"/>';
          if (style.lineStyle === 'double') svg += '<line x1="' + x + '" y1="' + (y - doubleOffset) + '" x2="' + (x + cellSize) + '" y2="' + (y - doubleOffset) + '" stroke="' + wc + '" ' + strokeAttr + dashArr + ' stroke-linecap="' + style.lineCap + '"/>';
        }
        if (cell & 2) {
          svg += '<line x1="' + (x + cellSize) + '" y1="' + y + '" x2="' + (x + cellSize) + '" y2="' + (y + cellSize) + '" stroke="' + wc + '" ' + strokeAttr + dashArr + ' stroke-linecap="' + style.lineCap + '"/>';
          if (style.lineStyle === 'double') svg += '<line x1="' + (x + cellSize + doubleOffset) + '" y1="' + y + '" x2="' + (x + cellSize + doubleOffset) + '" y2="' + (y + cellSize) + '" stroke="' + wc + '" ' + strokeAttr + dashArr + ' stroke-linecap="' + style.lineCap + '"/>';
        }
        if (cell & 4) {
          svg += '<line x1="' + x + '" y1="' + (y + cellSize) + '" x2="' + (x + cellSize) + '" y2="' + (y + cellSize) + '" stroke="' + wc + '" ' + strokeAttr + dashArr + ' stroke-linecap="' + style.lineCap + '"/>';
          if (style.lineStyle === 'double') svg += '<line x1="' + x + '" y1="' + (y + cellSize + doubleOffset) + '" x2="' + (x + cellSize) + '" y2="' + (y + cellSize + doubleOffset) + '" stroke="' + wc + '" ' + strokeAttr + dashArr + ' stroke-linecap="' + style.lineCap + '"/>';
        }
        if (cell & 8) {
          svg += '<line x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y + cellSize) + '" stroke="' + wc + '" ' + strokeAttr + dashArr + ' stroke-linecap="' + style.lineCap + '"/>';
          if (style.lineStyle === 'double') svg += '<line x1="' + (x - doubleOffset) + '" y1="' + y + '" x2="' + (x - doubleOffset) + '" y2="' + (y + cellSize) + '" stroke="' + wc + '" ' + strokeAttr + dashArr + ' stroke-linecap="' + style.lineCap + '"/>';
        }
      }
    }

    svg += '<rect x="' + margin + '" y="' + margin + '" width="' + (cols * cellSize) + '" height="' + (rows * cellSize) + '" fill="none" stroke="' + wc + '" stroke-width="' + style.thickness + '"/>';

    if (showSolution) svg += MazeGen._solutionSvg(data.solution, margin, cellSize, style.thickness);

    svg += MazeGen._renderMarker(margin + cellSize / 2, margin + cellSize / 2, style.startMarker, style.startColor, cellSize * 0.35);
    svg += MazeGen._renderMarker(margin + (cols - 1) * cellSize + cellSize / 2, margin + (rows - 1) * cellSize + cellSize / 2, style.endMarker, style.endColor, cellSize * 0.35);

    svg += '</svg>';
    return svg;
  },

  // ---- Hexagonal ----
  _genHexData: function(cols, rows) {
    var totalCells = cols * rows;
    var visited = [];
    var walls = [];
    for (var i = 0; i < totalCells; i++) { visited[i] = false; walls[i] = [true, true, true, true, true, true]; }
    var stack = [];
    visited[0] = true;
    stack.push(0);

    while (stack.length > 0) {
      var cur = stack[stack.length - 1];
      var r = Math.floor(cur / cols);
      var c = cur % cols;
      var neighbors = MazeGen._hexNeighbors(c, r, cols, rows);
      var unvisited = [];
      for (var n = 0; n < neighbors.length; n++) {
        if (!visited[neighbors[n].idx]) unvisited.push(neighbors[n]);
      }
      if (unvisited.length === 0) { stack.pop(); continue; }
      var next = unvisited[Math.floor(Math.random() * unvisited.length)];
      walls[cur][next.wallDir] = false;
      walls[next.idx][(next.wallDir + 3) % 6] = false;
      visited[next.idx] = true;
      stack.push(next.idx);
    }
    return { walls: walls };
  },

  _buildHexSvg: function(data, cols, rows, style, showSolution) {
    var cellSize = 28;
    var hexH = cellSize * Math.sqrt(3);
    var margin = style.margin;
    var w = cols * cellSize * 1.5 + margin * 2;
    var h = rows * hexH + margin * 2 + hexH;
    var dashArr = MazeGen._dashArr(style);
    var resolved = MazeGen._resolveWallColor(style);
    var wc = resolved.color;

    var svg = MazeGen._svgOpen(w, h);
    svg += App.renderBgRect('mz', w, h);
    svg += resolved.defs;

    for (var r2 = 0; r2 < rows; r2++) {
      for (var c2 = 0; c2 < cols; c2++) {
        var cx = margin + c2 * cellSize * 1.5 + cellSize;
        var cy = margin + r2 * hexH + hexH / 2 + (c2 % 2 === 1 ? hexH / 2 : 0);
        var cellWalls = data.walls[r2 * cols + c2];
        var dirs = [0, 60, 120, 180, 240, 300];
        for (var d = 0; d < 6; d++) {
          if (!cellWalls[d]) continue;
          var a1 = (dirs[d] - 30) * Math.PI / 180;
          var a2 = (dirs[d] + 30) * Math.PI / 180;
          var x1 = cx + cellSize * 0.8 * Math.cos(a1);
          var y1 = cy + cellSize * 0.8 * Math.sin(a1);
          var x2 = cx + cellSize * 0.8 * Math.cos(a2);
          var y2 = cy + cellSize * 0.8 * Math.sin(a2);
          svg += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + wc + '" stroke-width="' + style.thickness + '"' + dashArr + ' stroke-linecap="' + style.lineCap + '"/>';
        }
      }
    }

    svg += MazeGen._renderMarker(margin + cellSize, margin + hexH / 2, style.startMarker, style.startColor, cellSize * 0.3);
    var lastCx = margin + (cols - 1) * cellSize * 1.5 + cellSize;
    var lastCy = margin + (rows - 1) * hexH + hexH / 2 + ((cols - 1) % 2 === 1 ? hexH / 2 : 0);
    svg += MazeGen._renderMarker(lastCx, lastCy, style.endMarker, style.endColor, cellSize * 0.3);

    svg += '</svg>';
    return svg;
  },

  _hexNeighbors: function(c, r, cols, rows) {
    var n = [];
    var even = c % 2 === 0;
    var dirs = even ? [[0,-1],[1,-1],[1,0],[0,1],[-1,0],[-1,-1]] : [[0,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]];
    var wallDirs = [0,1,2,3,4,5];
    for (var i = 0; i < dirs.length; i++) {
      var nc = c + dirs[i][0], nr = r + dirs[i][1];
      if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) n.push({ idx: nr * cols + nc, wallDir: wallDirs[i] });
    }
    return n;
  },

  // ---- Triangular ----
  _genTriData: function(cols, rows) {
    var total = cols * rows;
    var visited = [];
    var wallsT = [];
    for (var i = 0; i < total; i++) { visited[i] = false; wallsT[i] = [true, true, true]; }
    var stack = [0];
    visited[0] = true;

    while (stack.length > 0) {
      var cur = stack[stack.length - 1];
      var rc = Math.floor(cur / cols);
      var cc = cur % cols;
      var neigh = MazeGen._triNeighbors(cc, rc, cols, rows);
      var unv = [];
      for (var n = 0; n < neigh.length; n++) { if (!visited[neigh[n].idx]) unv.push(neigh[n]); }
      if (unv.length === 0) { stack.pop(); continue; }
      var next = unv[Math.floor(Math.random() * unv.length)];
      wallsT[cur][next.wallFrom] = false;
      wallsT[next.idx][next.wallTo] = false;
      visited[next.idx] = true;
      stack.push(next.idx);
    }
    return { walls: wallsT };
  },

  _buildTriSvg: function(data, cols, rows, style, showSolution) {
    var cellSize = 28;
    var margin = style.margin;
    var w = cols * cellSize + margin * 2;
    var h = rows * cellSize * 0.866 + margin * 2;
    var dashArr = MazeGen._dashArr(style);
    var resolved = MazeGen._resolveWallColor(style);
    var wc = resolved.color;

    var svg = MazeGen._svgOpen(w, h);
    svg += App.renderBgRect('mz', w, h);
    svg += resolved.defs;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var isUp = (r + c) % 2 === 0;
        var x = margin + c * cellSize;
        var y = margin + r * cellSize * 0.866;
        var cw = data.walls[r * cols + c];
        var triPts;
        if (isUp) {
          triPts = [[x, y + cellSize * 0.866], [x + cellSize / 2, y], [x + cellSize, y + cellSize * 0.866]];
        } else {
          triPts = [[x, y], [x + cellSize / 2, y + cellSize * 0.866], [x + cellSize, y]];
        }
        var wallLines;
        if (isUp) {
          wallLines = [[triPts[0], triPts[2]], [triPts[2], triPts[1]], [triPts[1], triPts[0]]];
        } else {
          wallLines = [[triPts[0], triPts[2]], [triPts[0], triPts[1]], [triPts[2], triPts[1]]];
        }
        for (var wi = 0; wi < 3; wi++) {
          if (!cw[wi]) continue;
          var a = wallLines[wi][0], b = wallLines[wi][1];
          svg += '<line x1="' + a[0].toFixed(1) + '" y1="' + a[1].toFixed(1) + '" x2="' + b[0].toFixed(1) + '" y2="' + b[1].toFixed(1) + '" stroke="' + wc + '" stroke-width="' + style.thickness + '"' + dashArr + ' stroke-linecap="' + style.lineCap + '"/>';
        }
      }
    }

    svg += MazeGen._renderMarker(margin + cellSize / 2, margin + cellSize * 0.866 * 0.7, style.startMarker, style.startColor, cellSize * 0.25);
    svg += MazeGen._renderMarker(margin + (cols - 1) * cellSize + cellSize / 2, margin + (rows - 1) * cellSize * 0.866 + cellSize * 0.3, style.endMarker, style.endColor, cellSize * 0.25);

    svg += '</svg>';
    return svg;
  },

  _triNeighbors: function(c, r, cols, rows) {
    var n = [];
    var isUp = (r + c) % 2 === 0;
    if (isUp) {
      if (r > 0) n.push({ idx: (r-1)*cols+c, wallFrom: 1, wallTo: 2 });
      if (c < cols-1) n.push({ idx: r*cols+c+1, wallFrom: 1, wallTo: 2 });
      if (r > 0 && c > 0) n.push({ idx: (r-1)*cols+c-1, wallFrom: 2, wallTo: 1 });
    } else {
      if (r < rows-1) n.push({ idx: (r+1)*cols+c, wallFrom: 1, wallTo: 2 });
      if (c > 0) n.push({ idx: r*cols+c-1, wallFrom: 2, wallTo: 1 });
      if (r < rows-1 && c < cols-1) n.push({ idx: (r+1)*cols+c+1, wallFrom: 1, wallTo: 2 });
    }
    return n;
  },

  // ---- Circular ----
  _genCircleData: function(rings) {
    var cellArc = 12;
    var totalCells = rings * cellArc;
    var visited = [];
    var wallsR = [];
    for (var i = 0; i < totalCells; i++) { visited[i] = false; wallsR[i] = [true, true]; }
    var stack = [0];
    visited[0] = true;

    while (stack.length > 0) {
      var cur = stack[stack.length - 1];
      var ring = Math.floor(cur / cellArc);
      var seg = cur % cellArc;
      var neigh = MazeGen._circleNeighbors(ring, seg, rings, cellArc);
      var unv = [];
      for (var n = 0; n < neigh.length; n++) { if (!visited[neigh[n].idx]) unv.push(neigh[n]); }
      if (unv.length === 0) { stack.pop(); continue; }
      var next = unv[Math.floor(Math.random() * unv.length)];
      wallsR[cur][next.wallFrom] = false;
      wallsR[next.idx][next.wallTo] = false;
      visited[next.idx] = true;
      stack.push(next.idx);
    }
    return { walls: wallsR };
  },

  _buildCircleSvg: function(data, rings, style, showSolution) {
    var cellArc = 12;
    var margin = style.margin;
    var size = rings * 50 + margin * 2;
    var cx = size / 2, cy = size / 2;
    var ringSpacing = 50;
    var dashArr = MazeGen._dashArr(style);
    var resolved = MazeGen._resolveWallColor(style);
    var wc = resolved.color;

    var svg = MazeGen._svgOpen(size, size);
    svg += App.renderBgRect('mz', size, size);
    svg += resolved.defs;

    for (var ring2 = 0; ring2 < rings; ring2++) {
      var radius = (ring2 + 1) * ringSpacing;
      svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="none" stroke="' + wc + '" stroke-width="' + style.thickness + '"' + dashArr + '/>';

      for (var seg2 = 0; seg2 < cellArc; seg2++) {
        var cellIdx = ring2 * cellArc + seg2;
        var cw = data.walls[cellIdx];
        var angle = (seg2 / cellArc) * Math.PI * 2;

        if (cw[0]) {
          var innerR = ring2 * ringSpacing;
          var lx1 = cx + innerR * Math.cos(angle);
          var ly1 = cy + innerR * Math.sin(angle);
          var lx2 = cx + radius * Math.cos(angle);
          var ly2 = cy + radius * Math.sin(angle);
          svg += '<line x1="' + lx1.toFixed(1) + '" y1="' + ly1.toFixed(1) + '" x2="' + lx2.toFixed(1) + '" y2="' + ly2.toFixed(1) + '" stroke="' + wc + '" stroke-width="' + style.thickness + '"' + dashArr + ' stroke-linecap="' + style.lineCap + '"/>';
        }
      }
    }

    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (rings * ringSpacing) + '" fill="none" stroke="' + wc + '" stroke-width="' + (style.thickness + 1) + '"/>';

    if (showSolution) {
      var sol = '';
      for (var i = 0; i < rings; i++) {
        var rr = (i + 0.5) * ringSpacing;
        var a = (i * 2 / cellArc) * Math.PI;
        var sx = cx + rr * Math.cos(a);
        var sy = cy + rr * Math.sin(a);
        sol += (i === 0 ? 'M' : 'L') + sx.toFixed(1) + ',' + sy.toFixed(1);
      }
      svg += '<path d="' + sol + '" fill="none" stroke="#F59E0B" stroke-width="' + (style.thickness + 2) + '" stroke-linecap="round" opacity="0.7"/>';
    }

    svg += MazeGen._renderMarker(cx - ringSpacing * 0.3, cy, style.startMarker, style.startColor, 12);
    svg += MazeGen._renderMarker(cx + rings * ringSpacing * 0.5, cy, style.endMarker, style.endColor, 12);

    svg += '</svg>';
    return svg;
  },

  _circleNeighbors: function(ring, seg, rings, cellArc) {
    var n = [];
    n.push({ idx: ring * cellArc + (seg + 1) % cellArc, wallFrom: 0, wallTo: 0 });
    n.push({ idx: ring * cellArc + (seg - 1 + cellArc) % cellArc, wallFrom: 0, wallTo: 0 });
    if (ring > 0) n.push({ idx: (ring - 1) * cellArc + seg, wallFrom: 1, wallTo: 1 });
    if (ring < rings - 1) n.push({ idx: (ring + 1) * cellArc + seg, wallFrom: 1, wallTo: 1 });
    return n;
  },

  // ---- Common: DFS grid generation ----
  _genGrid: function(cols, rows, algo) {
    var grid = [];
    var total = cols * rows;
    for (var i = 0; i < total; i++) grid[i] = 15;
    var visited = [];
    for (var v = 0; v < total; v++) visited[v] = false;
    var stack = [0];
    visited[0] = true;
    while (stack.length > 0) {
      var cur = stack[stack.length - 1];
      var c = cur % cols, r = Math.floor(cur / cols);
      var neighbors = [];
      if (r > 0 && !visited[cur - cols]) neighbors.push({ idx: cur - cols, wall: 1 });
      if (c < cols - 1 && !visited[cur + 1]) neighbors.push({ idx: cur + 1, wall: 2 });
      if (r < rows - 1 && !visited[cur + cols]) neighbors.push({ idx: cur + cols, wall: 4 });
      if (c > 0 && !visited[cur - 1]) neighbors.push({ idx: cur - 1, wall: 8 });
      if (neighbors.length === 0) { stack.pop(); continue; }
      var next = neighbors[Math.floor(Math.random() * neighbors.length)];
      grid[cur] &= ~next.wall;
      grid[next.idx] &= ~(next.wall === 1 ? 4 : next.wall === 2 ? 8 : next.wall === 4 ? 1 : 2);
      visited[next.idx] = true;
      stack.push(next.idx);
    }
    return grid;
  },

  _solveMaze: function(grid, cols, rows, sx, sy, ex, ey) {
    var visited = [];
    var parent = [];
    var total = cols * rows;
    for (var i = 0; i < total; i++) { visited[i] = false; parent[i] = -1; }
    var q = [sy * cols + sx];
    visited[sy * cols + sx] = true;
    while (q.length > 0) {
      var cur = q.shift();
      if (cur === ey * cols + ex) break;
      var c = cur % cols, r = Math.floor(cur / cols);
      var cell = grid[cur];
      var moves = [[-1, 0, 1], [1, 0, 2], [0, 1, 4], [0, -1, 8]];
      for (var m = 0; m < moves.length; m++) {
        var nc = c + moves[m][0], nr = r + moves[m][1];
        if (nc >= 0 && nc < cols && nr >= 0 && nr < rows && (cell & moves[m][2]) === 0) {
          var ni = nr * cols + nc;
          if (!visited[ni]) { visited[ni] = true; parent[ni] = cur; q.push(ni); }
        }
      }
    }
    var path = [];
    var idx = ey * cols + ex;
    while (idx !== -1) {
      path.unshift([idx % cols, Math.floor(idx / cols)]);
      idx = parent[idx];
    }
    return path;
  },

  _renderMarker: function(cx, cy, type, color, size) {
    var s = '';
    if (type === 'circle') {
      s = '<circle cx="' + cx + '" cy="' + cy + '" r="' + size + '" fill="' + color + '"/>';
    } else if (type === 'square') {
      s = '<rect x="' + (cx - size) + '" y="' + (cy - size) + '" width="' + (size * 2) + '" height="' + (size * 2) + '" fill="' + color + '"/>';
    } else if (type === 'triangle') {
      s = '<polygon points="' + cx + ',' + (cy - size) + ' ' + (cx - size) + ',' + (cy + size) + ' ' + (cx + size) + ',' + (cy + size) + '" fill="' + color + '"/>';
    } else if (type === 'star') {
      var pts = '';
      for (var i = 0; i < 10; i++) {
        var a = (i * 36 - 90) * Math.PI / 180;
        var r = i % 2 === 0 ? size : size * 0.4;
        pts += (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1) + ' ';
      }
      s = '<polygon points="' + pts + '" fill="' + color + '"/>';
    }
    return s;
  }
};

window.MazeGen = MazeGen;
