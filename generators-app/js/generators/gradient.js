var GradientGen = {
  masks: ['none','stripes','dots','grid','diamonds','circle','vignette','rings','waves'],

  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">🎨 Градиенты</h2><p class="page-subtitle">Линейные, радиальные, маски и эффекты</p>';
    s += App.buildSettings('gradient', [
      { title: '📐 Тип градиента', content: GradientGen._typeSection() },
      { title: '🎨 Цвета', content: GradientGen._colorSection() },
      { title: '🖼️ Фон', content: App.buildBgSection('gr') },
      { title: '🎭 Маска', content: GradientGen._maskSection() },
      { title: '✨ Эффекты', content: GradientGen._effectsSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreview('gradient');
    s += '</div></div>';
    document.getElementById('page-gradient').innerHTML = s;
    App.bindRange('gr-angle', 'gr-angle-v', '°');
    App.bindRange('gr-size', 'gr-size-v', '%');
    App.bindRange('gr-mask-size', 'gr-mask-size-v', 'px');
    App.bindRange('gr-mask-opacity', 'gr-mask-opacity-v', '%');
    App.bindRange('gr-vignette', 'gr-vignette-v', '%');
    App.bindRange('gr-glitch', 'gr-glitch-v', '%');
    App.bindRange('gr-grain', 'gr-grain-v', '%');
    App.bindRange('gr-noise', 'gr-noise-v', '%');
    App.bindRange('gr-blur', 'gr-blur-v', 'px');
    App.bindColor('gr-bg-color', 'gr-bg-color-v');
    GradientGen._initStops();
  },

  _typeSection: function() {
    var h = '<div class="form-group"><label>Тип</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="gr-type" id="gr-t-lin" value="linear" checked><label for="gr-t-lin">Линейный</label>';
    h += '<input type="radio" name="gr-type" id="gr-t-rad" value="radial"><label for="gr-t-rad">Радиальный</label>';
    h += '<input type="radio" name="gr-type" id="gr-t-conic" value="conic"><label for="gr-t-conic">Конический</label>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Угол (для линейного)</label>';
    h += '<div class="range-row"><input type="range" id="gr-angle" min="0" max="360" value="135">';
    h += '<span class="range-val" id="gr-angle-v">135°</span></div></div>';
    h += '<div class="form-group"><label>Размер (для радиального)</label>';
    h += '<div class="range-row"><input type="range" id="gr-size" min="20" max="100" value="50">';
    h += '<span class="range-val" id="gr-size-v">50%</span></div></div>';
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>Ширина</label>';
    h += '<div class="range-row"><input type="range" id="gr-w" min="200" max="1600" value="800" step="50">';
    h += '<span class="range-val" id="gr-w-v">800</span></div></div>';
    h += '<div class="form-group"><label>Высота</label>';
    h += '<div class="range-row"><input type="range" id="gr-h" min="200" max="1200" value="600" step="50">';
    h += '<span class="range-val" id="gr-h-v">600</span></div></div>';
    h += '</div>';
    return h;
  },

  _colorSection: function() {
    var h = '<div class="form-group"><label>Цветовые точки (стопы)</label>';
    h += '<div id="gr-stops"></div>';
    h += '<button class="btn btn-sm btn-outline" onclick="GradientGen._addStop()" style="margin-top:6px">+ Добавить цвет</button></div>';
    return h;
  },

  _maskSection: function() {
    var h = '<div class="form-group"><label>Маска</label>';
    h += '<div class="btn-group" style="flex-direction:column">';
    var names = ['Нет','Полоски','Точки','Сетка','Ромбы','Круг','Виньетка','Кольца','Волны'];
    for (var i = 0; i < GradientGen.masks.length; i++) {
      h += '<input type="radio" name="gr-mask" id="gr-m-' + GradientGen.masks[i] + '" value="' + GradientGen.masks[i] + '"' + (i === 0 ? ' checked' : '') + '>';
      h += '<label for="gr-m-' + GradientGen.masks[i] + '">' + names[i] + '</label>';
    }
    h += '</div></div>';
    h += '<div class="form-group"><label>Размер элемента маски</label>';
    h += '<div class="range-row"><input type="range" id="gr-mask-size" min="4" max="100" value="20">';
    h += '<span class="range-val" id="gr-mask-size-v">20px</span></div></div>';
    h += '<div class="form-group"><label>Прозрачность маски</label>';
    h += '<div class="range-row"><input type="range" id="gr-mask-opacity" min="0" max="100" value="50">';
    h += '<span class="range-val" id="gr-mask-opacity-v">50%</span></div></div>';
    return h;
  },

  _effectsSection: function() {
    var h = '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="gr-glitch-on"><span class="toggle-slider"></span></label><span style="font-size:12px">Глитч-эффект</span></div>';
    h += '<div class="form-group"><label>Сила глитча</label>';
    h += '<div class="range-row"><input type="range" id="gr-glitch" min="0" max="50" value="15">';
    h += '<span class="range-val" id="gr-glitch-v">15%</span></div></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="gr-texture-on"><span class="toggle-slider"></span></label><span style="font-size:12px">Текстура</span></div>';
    h += '<div class="form-group"><label>Зернистость</label>';
    h += '<div class="range-row"><input type="range" id="gr-grain" min="0" max="100" value="20">';
    h += '<span class="range-val" id="gr-grain-v">20%</span></div></div>';
    h += '<div class="form-group"><label>Шум</label>';
    h += '<div class="range-row"><input type="range" id="gr-noise" min="0" max="100" value="10">';
    h += '<span class="range-val" id="gr-noise-v">10%</span></div></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="gr-blur-on"><span class="toggle-slider"></span></label><span style="font-size:12px">Размытие</span></div>';
    h += '<div class="form-group"><label>Сила размытия</label>';
    h += '<div class="range-row"><input type="range" id="gr-blur" min="0" max="20" value="3">';
    h += '<span class="range-val" id="gr-blur-v">3px</span></div></div>';
    h += '<div class="form-group"><label>Стиль виньетки</label>';
    h += '<div class="range-row"><input type="range" id="gr-vignette" min="0" max="100" value="40">';
    h += '<span class="range-val" id="gr-vignette-v">40%</span></div></div>';
    return h;
  },

  _stopCount: 0,

  _initStops: function() {
    GradientGen._stopCount = 0;
    GradientGen._addStop('#7C3AED', 0);
    GradientGen._addStop('#F59E0B', 50);
    GradientGen._addStop('#10B981', 100);
  },

  _addStop: function(color, pos) {
    color = color || GradientGen._randomColor();
    pos = pos !== undefined ? pos : Math.floor(Math.random() * 100);
    var id = GradientGen._stopCount++;
    var container = document.getElementById('gr-stops');
    var div = document.createElement('div');
    div.className = 'form-row';
    div.style.alignItems = 'center';
    div.style.marginBottom = '4px';
    div.innerHTML = '<input type="color" id="gr-stop-color-' + id + '" value="' + color + '" style="width:40px;height:28px;border:1px solid #ccc;border-radius:4px;padding:1px;cursor:pointer"><input type="range" id="gr-stop-pos-' + id + '" min="0" max="100" value="' + pos + '" style="flex:1;accent-color:#7C3AED"><span style="font-size:10px;min-width:30px;text-align:right" id="gr-stop-pos-v-' + id + '">' + pos + '%</span><button class="btn btn-sm" style="color:#EF4444;border:none;padding:2px 4px;cursor:pointer" onclick="this.parentElement.remove()">✕</button>';
    container.appendChild(div);
    var range = document.getElementById('gr-stop-pos-' + id);
    var disp = document.getElementById('gr-stop-pos-v-' + id);
    range.addEventListener('input', function() { disp.textContent = range.value + '%'; });
  },

  _randomColor: function() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  },

  generate: function() {
    try {
      console.log('[Gradient] generate');
      var type = GradientGen._getRadioVal('gr-type');
      var angle = parseInt(document.getElementById('gr-angle').value) || 135;
      var size = parseInt(document.getElementById('gr-size').value) || 50;
      var w = parseInt(document.getElementById('gr-w').value) || 800;
      var h = parseInt(document.getElementById('gr-h').value) || 600;
      var mask = GradientGen._getRadioVal('gr-mask');
      var maskSize = parseInt(document.getElementById('gr-mask-size').value) || 20;
      var maskOpacity = parseInt(document.getElementById('gr-mask-opacity').value) || 50;
      var glitchOn = document.getElementById('gr-glitch-on').checked;
      var glitch = parseInt(document.getElementById('gr-glitch').value) || 0;
      var textureOn = document.getElementById('gr-texture-on').checked;
      var grain = parseInt(document.getElementById('gr-grain').value) || 0;
      var noise = parseInt(document.getElementById('gr-noise').value) || 0;
      var blurOn = document.getElementById('gr-blur-on').checked;
      var blur = parseInt(document.getElementById('gr-blur').value) || 0;
      var vignette = parseInt(document.getElementById('gr-vignette').value) || 0;

      // Collect stops
      var stops = [];
      var stopEls = document.querySelectorAll('#gr-stops .form-row');
      for (var i = 0; i < stopEls.length; i++) {
        var colorEl = stopEls[i].querySelector('input[type="color"]');
        var posEl = stopEls[i].querySelector('input[type="range"]');
        if (colorEl && posEl) {
          stops.push({ color: colorEl.value, pos: parseInt(posEl.value) });
        }
      }
      stops.sort(function(a, b) { return a.pos - b.pos; });

      if (stops.length < 2) { alert('Добавьте минимум 2 цвета'); return; }

      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">';
      svg += App.renderBgRect('gr', w, h);
      svg += '<defs>';

      // Gradient
      if (type === 'linear') {
        var rad = angle * Math.PI / 180;
        var x1 = (50 - 50 * Math.cos(rad)).toFixed(1);
        var y1 = (50 - 50 * Math.sin(rad)).toFixed(1);
        var x2 = (50 + 50 * Math.cos(rad)).toFixed(1);
        var y2 = (50 + 50 * Math.sin(rad)).toFixed(1);
        svg += '<linearGradient id="gr-grad" x1="' + x1 + '%" y1="' + y1 + '%" x2="' + x2 + '%" y2="' + y2 + '%">';
      } else if (type === 'radial') {
        svg += '<radialGradient id="gr-grad" cx="50%" cy="50%" r="' + size + '%">';
      } else {
        svg += '<linearGradient id="gr-grad" x1="0%" y1="0%" x2="100%" y2="0%">';
      }

      for (var j = 0; j < stops.length; j++) {
        svg += '<stop offset="' + stops[j].pos + '%" stop-color="' + stops[j].color + '"/>';
      }

      if (type === 'linear' || type === 'conic') svg += '</linearGradient>';
      else svg += '</radialGradient>';

      // Blur filter
      if (blurOn && blur > 0) {
        svg += '<filter id="gr-blur-filter"><feGaussianBlur stdDeviation="' + blur + '"/></filter>';
      }

      // Texture filter
      if (textureOn) {
        svg += '<filter id="gr-tex-filter">';
        svg += '<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3"/>';
        svg += '<feColorMatrix type="saturate" values="0"/>';
        svg += '<feBlend in="SourceGraphic" mode="overlay"/>';
        svg += '</filter>';
      }

      // Mask pattern
      if (mask !== 'none') {
        svg += '<mask id="gr-mask">';
        svg += '<rect width="' + w + '" height="' + h + '" fill="white"/>';
        if (mask === 'stripes') {
          for (var sy = 0; sy < h; sy += maskSize * 2) {
            svg += '<rect x="0" y="' + sy + '" width="' + w + '" height="' + maskSize + '" fill="black" opacity="' + (maskOpacity / 100) + '"/>';
          }
        } else if (mask === 'dots') {
          for (var dy = 0; dy < h; dy += maskSize * 2) {
            for (var dx = 0; dx < w; dx += maskSize * 2) {
              svg += '<circle cx="' + (dx + maskSize) + '" cy="' + (dy + maskSize) + '" r="' + (maskSize * 0.3) + '" fill="black" opacity="' + (maskOpacity / 100) + '"/>';
            }
          }
        } else if (mask === 'grid') {
          for (var gy = 0; gy < h; gy += maskSize) {
            svg += '<rect x="0" y="' + gy + '" width="' + w + '" height="1" fill="black" opacity="' + (maskOpacity / 100) + '"/>';
          }
          for (var gx = 0; gx < w; gx += maskSize) {
            svg += '<rect x="' + gx + '" y="0" width="1" height="' + h + '" fill="black" opacity="' + (maskOpacity / 100) + '"/>';
          }
        } else if (mask === 'diamonds') {
          for (var ddy = 0; ddy < h; ddy += maskSize * 2) {
            for (var ddx = 0; ddx < w; ddx += maskSize * 2) {
              var dcx = ddx + maskSize, dcy = ddy + maskSize;
              svg += '<polygon points="' + dcx + ',' + (dcy - maskSize * 0.4) + ' ' + (dcx + maskSize * 0.4) + ',' + dcy + ' ' + dcx + ',' + (dcy + maskSize * 0.4) + ' ' + (dcx - maskSize * 0.4) + ',' + dcy + '" fill="black" opacity="' + (maskOpacity / 100) + '"/>';
            }
          }
        } else if (mask === 'circle') {
          svg += '<circle cx="' + (w / 2) + '" cy="' + (h / 2) + '" r="' + (Math.min(w, h) * 0.3) + '" fill="none" stroke="black" stroke-width="' + maskSize + '" opacity="' + (maskOpacity / 100) + '"/>';
        } else if (mask === 'vignette') {
          svg += '<radialGradient id="vig-mask"><stop offset="0%" stop-color="white"/><stop offset="100%" stop-color="black"/></radialGradient>';
          svg += '<rect width="' + w + '" height="' + h + '" fill="url(#vig-mask)" opacity="' + (maskOpacity / 100) + '"/>';
        } else if (mask === 'rings') {
          for (var ri = maskSize; ri < Math.max(w, h); ri += maskSize * 2) {
            svg += '<circle cx="' + (w / 2) + '" cy="' + (h / 2) + '" r="' + ri + '" fill="none" stroke="black" stroke-width="' + (maskSize * 0.3) + '" opacity="' + (maskOpacity / 100) + '"/>';
          }
        } else if (mask === 'waves') {
          for (var wy = 0; wy < h; wy += maskSize * 2) {
            var wd = 'M0,' + wy;
            for (var wx = 0; wx <= w; wx += 4) {
              wd += 'L' + wx + ',' + (wy + Math.sin(wx * 0.1) * maskSize * 0.5);
            }
            wd += 'L' + w + ',' + (wy + maskSize) + 'L0,' + (wy + maskSize) + 'Z';
            svg += '<path d="' + wd + '" fill="black" opacity="' + (maskOpacity / 100) + '"/>';
          }
        }
        svg += '</mask>';
      }

      svg += '</defs>';

      // Main gradient rect
      var attrs = ' fill="url(#gr-grad)"';
      if (mask !== 'none') attrs += ' mask="url(#gr-mask)"';
      if (blurOn && blur > 0) attrs += ' filter="url(#gr-blur-filter)"';
      if (textureOn) attrs += ' filter="url(#gr-tex-filter)"';
      svg += '<rect width="' + w + '" height="' + h + '"' + attrs + '/>';

      // Glitch
      if (glitchOn && glitch > 0) {
        var slices = 3 + Math.floor(Math.random() * 6);
        for (var g = 0; g < slices; g++) {
          var gy = Math.floor(Math.random() * h);
          var gh = 2 + Math.floor(Math.random() * 20);
          var gdx = (Math.random() - 0.5) * glitch * 3;
          var gColor = stops[Math.floor(Math.random() * stops.length)].color;
          svg += '<rect x="' + gdx + '" y="' + gy + '" width="' + w + '" height="' + gh + '" fill="' + gColor + '" opacity="0.2"/>';
        }
      }

      // Vignette overlay
      if (vignette > 0 && mask !== 'vignette') {
        svg += '<radialGradient id="vig-over"><stop offset="0%" stop-color="transparent"/><stop offset="100%" stop-color="rgba(0,0,0,' + (vignette / 100) + ')"/></radialGradient>';
        svg += '<rect width="' + w + '" height="' + h + '" fill="url(#vig-over)"/>';
      }

      // Grain overlay
      if (textureOn && grain > 0) {
        svg += '<filter id="grain-f"><feTurbulence type="turbulence" baseFrequency="0.8" numOctaves="4"/><feColorMatrix type="saturate" values="0"/></filter>';
        svg += '<rect width="' + w + '" height="' + h + '" filter="url(#grain-f)" opacity="' + (grain / 100 * 0.3) + '"/>';
      }

      svg += '</svg>';
      document.getElementById('preview-gradient').innerHTML = svg;
    } catch (e) {
      console.error('[Gradient] error:', e);
      alert('Ошибка: ' + e.message);
    }
  },

  _getRadioVal: function(name) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) { if (els[i].checked) return els[i].value; }
    return '';
  }
};

window.GradientGen = GradientGen;
