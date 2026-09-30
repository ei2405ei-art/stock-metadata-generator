var GeometricGen = {
  palettes: {
    sunset: ['#FF6B6B','#FFA07A','#FFD700','#FF4500','#DC143C','#FF69B4'],
    ocean: ['#006994','#40E0D0','#48D1CC','#5F9EA0','#20B2AA','#00CED1'],
    forest: ['#228B22','#32CD32','#006400','#8FBC8F','#2E8B57','#9ACD32'],
    neon: ['#FF00FF','#00FFFF','#FF1493','#7FFF00','#FF6344','#00FF7F'],
    pastel: ['#FFB3BA','#FFDFBA','#FFFFBA','#BAFFC9','#BAE1FF','#E8BAFF'],
    mono: ['#1a1a2e','#16213e','#0f3460','#533483','#e94560','#2c2c54'],
    warm: ['#FF4500','#FF6347','#FF7F50','#FF8C00','#FFA500','#FFD700'],
    cool: ['#1E90FF','#4169E1','#6495ED','#7B68EE','#9370DB','#BA55D3'],
    earth: ['#8B4513','#A0522D','#CD853F','#DEB887','#D2B48C','#F5DEB3'],
    candy: ['#FF69B4','#FF1493','#C71585','#DB7093','#FFB6C1','#FFC0CB']
  },

  types: ['stripes','circles','waves','triangles','hexagons','diamonds','dots','checkerboard','spirals','mandala'],

  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">🔷 Геометрические паттерны</h2><p class="page-subtitle">10 типов узоров с палитрами и эффектами</p>';
    s += App.buildSettings('geometric', [
      { title: '📐 Тип паттерна', content: GeometricGen._typeSection() },
      { title: '🎨 Палитра', content: GeometricGen._paletteSection() },
      { title: '📏 Размеры', content: GeometricGen._sizeSection() },
      { title: '🖼️ Фон', content: App.buildBgSection('geo') },
      { title: '✨ Эффекты', content: GeometricGen._effectsSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreview('geometric');
    s += '</div></div>';
    document.getElementById('page-geometric').innerHTML = s;
    App.bindRange('geo-rotation', 'geo-rotation-v', '°');
    App.bindRange('geo-scale', 'geo-scale-v', '%');
    App.bindRange('geo-gap', 'geo-gap-v', 'px');
    App.bindRange('geo-stroke', 'geo-stroke-v', 'px');
    App.bindRange('geo-mirror-x', 'geo-mirror-x-v', '');
    App.bindRange('geo-mirror-y', 'geo-mirror-y-v', '');
    App.bindRange('geo-mirror-r', 'geo-mirror-r-v', '°');
    App.bindRange('geo-glitch', 'geo-glitch-v', '%');
    App.bindRange('geo-opacity', 'geo-opacity-v', '%');
    App.bindColor('geo-bg-color', 'geo-bg-color-v');
  },

  _typeSection: function() {
    var types = [['Полоски','stripes'],['Круги','circles'],['Волны','waves'],['Треугольники','triangles'],['Шестиугольники','hexagons'],['Ромбы','diamonds'],['Точки','dots'],['Шахматы','checkerboard'],['Спирали','spirals'],['Мандала','mandala']];
    var h = '<div class="form-group"><label>Тип узора</label><div class="btn-group" style="flex-direction:column">';
    for (var i = 0; i < types.length; i++) {
      h += '<input type="radio" name="geo-type" id="geo-t-' + types[i][1] + '" value="' + types[i][1] + '"' + (i === 0 ? ' checked' : '') + '>';
      h += '<label for="geo-t-' + types[i][1] + '">' + types[i][0] + '</label>';
    }
    h += '</div></div>';
    return h;
  },

  _paletteSection: function() {
    var h = '<div class="form-group"><label>Палитра</label><div class="btn-group" style="flex-direction:column">';
    var palNames = Object.keys(GeometricGen.palettes);
    for (var i = 0; i < palNames.length; i++) {
      h += '<input type="radio" name="geo-palette" id="geo-p-' + palNames[i] + '" value="' + palNames[i] + '"' + (i === 0 ? ' checked' : '') + '>';
      h += '<label for="geo-p-' + palNames[i] + '">' + palNames[i] + ' <span style="display:inline-flex;gap:2px;margin-left:4px">';
      var colors = GeometricGen.palettes[palNames[i]];
      for (var c = 0; c < Math.min(5, colors.length); c++) {
        h += '<span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:' + colors[c] + '"></span>';
      }
      h += '</span></label>';
    }
    h += '</div></div>';
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>Цвет 1</label><input type="color" id="geo-color1" value="#7C3AED"></div>';
    h += '<div class="form-group"><label>Цвет 2</label><input type="color" id="geo-color2" value="#F59E0B"></div>';
    h += '</div>';
    return h;
  },

  _sizeSection: function() {
    var h = '<div class="form-group"><label>Размер элемента</label>';
    h += '<div class="range-row"><input type="range" id="geo-scale" min="10" max="200" value="50">';
    h += '<span class="range-val" id="geo-scale-v">50%</span></div></div>';
    h += '<div class="form-group"><label>Расстояние</label>';
    h += '<div class="range-row"><input type="range" id="geo-gap" min="0" max="60" value="8">';
    h += '<span class="range-val" id="geo-gap-v">8px</span></div></div>';
    h += '<div class="form-group"><label>Обводка</label>';
    h += '<div class="range-row"><input type="range" id="geo-stroke" min="0" max="8" value="2">';
    h += '<span class="range-val" id="geo-stroke-v">2px</span></div></div>';
    h += '<div class="form-group"><label>Вращение</label>';
    h += '<div class="range-row"><input type="range" id="geo-rotation" min="0" max="360" value="0">';
    h += '<span class="range-val" id="geo-rotation-v">0°</span></div></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="geo-fill" checked><span class="toggle-slider"></span></label><span style="font-size:12px">Заливка</span></div>';
    return h;
  },

  _effectsSection: function() {
    var h = '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="geo-glitch-on"><span class="toggle-slider"></span></label><span style="font-size:12px">Глитч-эффект</span></div>';
    h += '<div class="form-group"><label>Сила глитча</label>';
    h += '<div class="range-row"><input type="range" id="geo-glitch" min="0" max="50" value="15">';
    h += '<span class="range-val" id="geo-glitch-v">15%</span></div></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="geo-texture-on"><span class="toggle-slider"></span></label><span style="font-size:12px">Текстура</span></div>';
    h += '<div class="form-group"><label>Текстура</label><select id="geo-texture">';
    h += '<option value="noise">Шум</option><option value="grain">Зернистость</option><option value="dots">Точечная</option><option value="lines">Линейная</option></select></div>';
    h += '<div class="form-group"><label">Прозрачность текстуры</label>';
    h += '<div class="range-row"><input type="range" id="geo-opacity" min="0" max="100" value="20">';
    h += '<span class="range-val" id="geo-opacity-v">20%</span></div></div>';
    h += '<div class="form-group"><label>Зеркалирование</label>';
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>По X</label><div class="range-row"><input type="range" id="geo-mirror-x" min="1" max="4" value="1"><span class="range-val" id="geo-mirror-x-v">1</span></div></div>';
    h += '<div class="form-group"><label>По Y</label><div class="range-row"><input type="range" id="geo-mirror-y" min="1" max="4" value="1"><span class="range-val" id="geo-mirror-y-v">1</span></div></div>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Поворот зеркала</label>';
    h += '<div class="range-row"><input type="range" id="geo-mirror-r" min="0" max="360" value="0">';
    h += '<span class="range-val" id="geo-mirror-r-v">0°</span></div></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="geo-circle-bg"><span class="toggle-slider"></span></label><span style="font-size:12px">Круглый фон</span></div>';
    return h;
  },

  generate: function() {
    try {
      console.log('[Geometric] generate');
      var type = GeometricGen._getRadioVal('geo-type');
      var palette = GeometricGen._getRadioVal('geo-palette');
      var scale = parseInt(document.getElementById('geo-scale').value) || 50;
      var gap = parseInt(document.getElementById('geo-gap').value) || 8;
      var stroke = parseInt(document.getElementById('geo-stroke').value) || 2;
      var rotation = parseInt(document.getElementById('geo-rotation').value) || 0;
      var fill = document.getElementById('geo-fill').checked;
      var glitchOn = document.getElementById('geo-glitch-on').checked;
      var glitch = parseInt(document.getElementById('geo-glitch').value) || 0;
      var textureOn = document.getElementById('geo-texture-on').checked;
      var texture = document.getElementById('geo-texture').value;
      var opacity = parseInt(document.getElementById('geo-opacity').value) || 0;
      var mirrorX = parseInt(document.getElementById('geo-mirror-x').value) || 1;
      var mirrorY = parseInt(document.getElementById('geo-mirror-y').value) || 1;
      var circleBg = document.getElementById('geo-circle-bg').checked;
      var color1 = document.getElementById('geo-color1').value || '#7C3AED';
      var color2 = document.getElementById('geo-color2').value || '#F59E0B';

      var colors = GeometricGen.palettes[palette] || GeometricGen.palettes.sunset;
      var w = 600, h = 600;
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">';
      svg += App.renderBgRect('geo', w, h);

      // Defs
      svg += '<defs>';
      // Texture patterns
      if (textureOn) {
        svg += '<filter id="geo-tex">';
        if (texture === 'noise' || texture === 'grain') svg += '<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3"/>';
        else if (texture === 'dots') svg += '<feTurbulence type="turbulence" baseFrequency="0.3" numOctaves="1"/>';
        else svg += '<feTurbulence type="fractalNoise" baseFrequency="0.02 0.8" numOctaves="1"/>';
        svg += '<feColorMatrix type="saturate" values="0"/><feBlend in="SourceGraphic" mode="overlay"/></filter>';
        svg += '<rect id="geo-tex-rect" width="' + w + '" height="' + h + '" filter="url(#geo-tex)" opacity="' + (opacity / 100) + '"/>';
      }
      svg += '</defs>';

      if (circleBg) {
        svg += '<clipPath id="circleClip"><circle cx="' + (w / 2) + '" cy="' + (h / 2) + '" r="' + (w / 2 - 20) + '"/></clipPath>';
        svg += '<g clip-path="url(#circleClip)">';
      }

      // Draw pattern
      svg += GeometricGen._drawPattern(type, w, h, scale, gap, stroke, rotation, fill, colors, color1, color2);

      if (circleBg) svg += '</g>';

      // Glitch effect
      if (glitchOn && glitch > 0) {
        var slices = 3 + Math.floor(Math.random() * 5);
        for (var i = 0; i < slices; i++) {
          var sy = Math.floor(Math.random() * h);
          var sh = 2 + Math.floor(Math.random() * 20);
          var dx = (Math.random() - 0.5) * glitch * 2;
          svg += '<rect x="' + dx + '" y="' + sy + '" width="' + w + '" height="' + sh + '" fill="' + (i % 2 === 0 ? color1 : color2) + '" opacity="0.15"/>';
        }
      }

      // Texture overlay
      if (textureOn) svg += '<use href="#geo-tex-rect"/>';

      svg += '</svg>';
      document.getElementById('preview-geometric').innerHTML = svg;
    } catch (e) {
      console.error('[Geometric] error:', e);
      alert('Ошибка: ' + e.message);
    }
  },

  _getRadioVal: function(name) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) { if (els[i].checked) return els[i].value; }
    return '';
  },

  _drawPattern: function(type, w, h, scale, gap, stroke, rotation, fill, colors, c1, c2) {
    var svg = '';
    var s = scale;
    var step = s + gap;

    if (type === 'stripes') {
      for (var y = -h; y < h * 2; y += step) {
        var ci = Math.floor(Math.abs(y / step)) % colors.length;
        svg += '<line x1="0" y1="' + y + '" x2="' + w + '" y2="' + y + '" stroke="' + colors[ci] + '" stroke-width="' + s + '" opacity="0.8" transform="rotate(' + rotation + ',' + (w / 2) + ',' + (h / 2) + ')"/>';
      }
    } else if (type === 'circles') {
      var maxR = Math.sqrt(w * w + h * h) / 2;
      for (var r = s; r < maxR; r += step) {
        var ci2 = Math.floor(r / step) % colors.length;
        svg += '<circle cx="' + (w / 2) + '" cy="' + (h / 2) + '" r="' + r + '" fill="' + (fill ? colors[ci2] : 'none') + '" stroke="' + colors[ci2] + '" stroke-width="' + stroke + '" opacity="0.7"/>';
      }
    } else if (type === 'waves') {
      for (var y2 = -h; y2 < h * 2; y2 += step) {
        var ci3 = Math.floor(Math.abs(y2 / step)) % colors.length;
        var d = 'M0,' + y2;
        for (var x = 0; x <= w; x += 4) {
          d += 'L' + x + ',' + (y2 + Math.sin(x * 0.05 + y2 * 0.1) * s * 0.5);
        }
        svg += '<path d="' + d + '" fill="none" stroke="' + colors[ci3] + '" stroke-width="' + stroke + '" opacity="0.7"/>';
      }
    } else if (type === 'triangles') {
      for (var ty = 0; ty < h + s; ty += step) {
        for (var tx = 0; tx < w + s; tx += step) {
          var ci4 = (Math.floor(tx / step) + Math.floor(ty / step)) % colors.length;
          var pts = tx + ',' + (ty - s * 0.6) + ' ' + (tx - s * 0.5) + ',' + (ty + s * 0.4) + ' ' + (tx + s * 0.5) + ',' + (ty + s * 0.4);
          svg += '<polygon points="' + pts + '" fill="' + (fill ? colors[ci4] : 'none') + '" stroke="' + colors[ci4] + '" stroke-width="' + stroke + '" opacity="0.7" transform="rotate(' + rotation + ',' + tx + ',' + ty + ')"/>';
        }
      }
    } else if (type === 'hexagons') {
      var hexR = s * 0.5;
      var hexH = hexR * Math.sqrt(3);
      for (var hy = -hexH; hy < h + hexH; hy += hexH * 1.5) {
        for (var hx = -hexR * 2; hx < w + hexR * 2; hx += hexR * 3) {
          var ci5 = (Math.floor(hx / (hexR * 3)) + Math.floor(hy / (hexH * 1.5))) % colors.length;
          var pts2 = '';
          for (var a = 0; a < 6; a++) {
            var angle = (a * 60 - 30) * Math.PI / 180;
            pts2 += (hx + hexR * Math.cos(angle)).toFixed(1) + ',' + (hy + hexR * Math.sin(angle)).toFixed(1) + ' ';
          }
          svg += '<polygon points="' + pts2 + '" fill="' + (fill ? colors[ci5] : 'none') + '" stroke="' + colors[ci5] + '" stroke-width="' + stroke + '" opacity="0.7"/>';
        }
      }
    } else if (type === 'diamonds') {
      for (var dy = -s; dy < h + s; dy += step) {
        for (var dx = -s; dx < w + s; dx += step) {
          var ci6 = (Math.floor(dx / step) + Math.floor(dy / step)) % colors.length;
          var pts3 = dx + ',' + (dy - s * 0.5) + ' ' + (dx + s * 0.5) + ',' + dy + ' ' + dx + ',' + (dy + s * 0.5) + ' ' + (dx - s * 0.5) + ',' + dy;
          svg += '<polygon points="' + pts3 + '" fill="' + (fill ? colors[ci6] : 'none') + '" stroke="' + colors[ci6] + '" stroke-width="' + stroke + '" opacity="0.7" transform="rotate(' + rotation + ',' + dx + ',' + dy + ')"/>';
        }
      }
    } else if (type === 'dots') {
      for (var dy2 = 0; dy2 < h + s; dy2 += step) {
        for (var dx2 = 0; dx2 < w + s; dx2 += step) {
          var ci7 = (Math.floor(dx2 / step) + Math.floor(dy2 / step)) % colors.length;
          svg += '<circle cx="' + dx2 + '" cy="' + dy2 + '" r="' + (s * 0.3) + '" fill="' + colors[ci7] + '" opacity="0.7"/>';
        }
      }
    } else if (type === 'checkerboard') {
      var cs = s;
      for (var cy = 0; cy < h + cs; cy += cs) {
        for (var cx = 0; cx < w + cs; cx += cs) {
          var isBlack = (Math.floor(cx / cs) + Math.floor(cy / cs)) % 2 === 0;
          if (isBlack) svg += '<rect x="' + cx + '" y="' + cy + '" width="' + cs + '" height="' + cs + '" fill="' + c1 + '" opacity="0.6"/>';
          else svg += '<rect x="' + cx + '" y="' + cy + '" width="' + cs + '" height="' + cs + '" fill="' + c2 + '" opacity="0.6"/>';
        }
      }
    } else if (type === 'spirals') {
      var cx2 = w / 2, cy2 = h / 2;
      for (var sp = 0; sp < 3; sp++) {
        var d2 = 'M' + cx2 + ',' + cy2;
        var a2 = sp * 120;
        for (var t = 0; t < 720; t += 5) {
          var rad = (t * Math.PI / 180);
          var r2 = t * 0.3;
          var x2 = cx2 + r2 * Math.cos(rad + a2 * Math.PI / 180);
          var y2 = cy2 + r2 * Math.sin(rad + a2 * Math.PI / 180);
          d2 += 'L' + x2.toFixed(1) + ',' + y2.toFixed(1);
        }
        svg += '<path d="' + d2 + '" fill="none" stroke="' + colors[sp % colors.length] + '" stroke-width="' + stroke + '" opacity="0.6"/>';
      }
    } else if (type === 'mandala') {
      var mcx = w / 2, mcy = h / 2;
      var rings = Math.floor(h / (s * 2));
      for (var ri = 1; ri <= rings; ri++) {
        var mr = ri * s;
        var petals = 4 + ri * 2;
        for (var pi = 0; pi < petals; pi++) {
          var pa = (pi / petals) * Math.PI * 2;
          var px = mcx + mr * Math.cos(pa);
          var py = mcy + mr * Math.sin(pa);
          var ci8 = (ri + pi) % colors.length;
          svg += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="' + (s * 0.2) + '" fill="' + (fill ? colors[ci8] : 'none') + '" stroke="' + colors[ci8] + '" stroke-width="' + stroke + '" opacity="0.6"/>';
        }
        svg += '<circle cx="' + mcx + '" cy="' + mcy + '" r="' + mr + '" fill="none" stroke="' + colors[ri % colors.length] + '" stroke-width="0.5" opacity="0.3"/>';
      }
    }

    return svg;
  }
};

window.GeometricGen = GeometricGen;
