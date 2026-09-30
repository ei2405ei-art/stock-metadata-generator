var StereogramGen = {
  patterns: ['dots','stripes','circles','voronoi','noise'],
  depthMaps: ['sphere','pyramid','tunnel','heart','custom'],

  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">👁️ Стереограммы</h2><p class="page-subtitle">SIRDS с картами глубины и узорами</p>';
    s += App.buildSettings('stereogram', [
      { title: '🗺️ Карта глубины', content: StereogramGen._depthSection() },
      { title: '🎨 Паттерн текстуры', content: StereogramGen._patternSection() },
      { title: '📏 Параметры', content: StereogramGen._paramsSection() },
      { title: '🖼️ Фон', content: App.buildBgSection('stg') },
      { title: '🌈 Градиент на текстуре', content: StereogramGen._gradientSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreview('stereogram');
    s += '</div></div>';
    document.getElementById('page-stereogram').innerHTML = s;
    App.bindRange('stg-width', 'stg-width-v', 'px');
    App.bindRange('stg-height', 'stg-height-v', 'px');
    App.bindRange('stg-separation', 'stg-separation-v', 'px');
    App.bindRange('stg-depth', 'stg-depth-v', '%');
    App.bindRange('stg-scale', 'stg-scale-v', '%');
    App.bindRange('stg-hue-start', 'stg-hue-start-v', '°');
    App.bindRange('stg-hue-range', 'stg-hue-range-v', '°');
    App.bindColor('stg-bg-color', 'stg-bg-color-v');
  },

  _depthSection: function() {
    var h = '<div class="form-group"><label>Карта глубины</label>';
    h += '<div class="btn-group" style="flex-direction:column">';
    var maps = [['Сфера','sphere'],['Пирамида','pyramid'],['Тоннель','tunnel'],['Сердце','heart'],['Загрузить файл','custom']];
    for (var i = 0; i < maps.length; i++) {
      h += '<input type="radio" name="stg-depthmap" id="stg-dm-' + maps[i][1] + '" value="' + maps[i][1] + '"' + (i === 0 ? ' checked' : '') + '>';
      h += '<label for="stg-dm-' + maps[i][1] + '">' + maps[i][0] + '</label>';
    }
    h += '</div></div>';
    h += '<div class="form-group"><label>Загрузить карту глубины</label><input type="file" id="stg-depthfile" accept="image/*" style="font-size:12px"></div>';
    return h;
  },

  _patternSection: function() {
    var h = '<div class="form-group"><label>Тип узора</label>';
    h += '<div class="btn-group">';
    var pats = [['Точки','dots'],['Полоски','stripes'],['Круги','circles'],['Voronoi','voronoi'],['Шум','noise']];
    for (var i = 0; i < pats.length; i++) {
      h += '<input type="radio" name="stg-pattern" id="stg-p-' + pats[i][1] + '" value="' + pats[i][1] + '"' + (i === 0 ? ' checked' : '') + '>';
      h += '<label for="stg-p-' + pats[i][1] + '">' + pats[i][0] + '</label>';
    }
    h += '</div></div>';
    h += '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="stg-randomize" checked><span class="toggle-slider"></span></label><span style="font-size:12px">Рандомизировать паттерн</span></div>';
    return h;
  },

  _paramsSection: function() {
    var h = '<div class="form-row">';
    h += '<div class="form-group"><label>Ширина</label>';
    h += '<div class="range-row"><input type="range" id="stg-width" min="200" max="1200" value="800" step="50">';
    h += '<span class="range-val" id="stg-width-v">800px</span></div></div>';
    h += '<div class="form-group"><label>Высота</label>';
    h += '<div class="range-row"><input type="range" id="stg-height" min="150" max="800" value="400" step="50">';
    h += '<span class="range-val" id="stg-height-v">400px</span></div></div>';
    h += '</div>';
    h += '<div class="form-group"><label>Расстояние между паттернами</label>';
    h += '<div class="range-row"><input type="range" id="stg-separation" min="30" max="200" value="100">';
    h += '<span class="range-val" id="stg-separation-v">100px</span></div></div>';
    h += '<div class="form-group"><label>Глубина 3D</label>';
    h += '<div class="range-row"><input type="range" id="stg-depth" min="5" max="50" value="15">';
    h += '<span class="range-val" id="stg-depth-v">15%</span></div></div>';
    h += '<div class="form-group"><label>Масштаб паттерна</label>';
    h += '<div class="range-row"><input type="range" id="stg-scale" min="20" max="150" value="60">';
    h += '<span class="range-val" id="stg-scale-v">60%</span></div></div>';
    h += '<div class="form-group"><label>Режим просмотра</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="stg-view" id="stg-v-wall" value="wall" checked><label for="stg-v-wall">Стена (дивергенция)</label>';
    h += '<input type="radio" name="stg-view" id="stg-v-cross" value="cross"><label for="stg-v-cross">Крестообразный</label>';
    h += '<input type="radio" name="stg-view" id="stg-v-mirror" value="mirror"><label for="stg-v-mirror">Зеркальный</label>';
    h += '</div></div>';
    return h;
  },

  _gradientSection: function() {
    var h = '<div class="toggle-row"><label class="toggle"><input type="checkbox" id="stg-gradient-on"><span class="toggle-slider"></span></label><span style="font-size:12px">Градиент на текстуре</span></div>';
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>Начальный тон</label>';
    h += '<div class="range-row"><input type="range" id="stg-hue-start" min="0" max="360" value="200">';
    h += '<span class="range-val" id="stg-hue-start-v">200°</span></div></div>';
    h += '<div class="form-group"><label>Диапазон тонов</label>';
    h += '<div class="range-row"><input type="range" id="stg-hue-range" min="10" max="360" value="60">';
    h += '<span class="range-val" id="stg-hue-range-v">60°</span></div></div>';
    h += '</div>';
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>Цвет 1</label><input type="color" id="stg-color1" value="#4FC3F7"></div>';
    h += '<div class="form-group"><label>Цвет 2</label><input type="color" id="stg-color2" value="#7C3AED"></div>';
    h += '</div>';
    return h;
  },

  generate: function() {
    try {
      console.log('[Stereogram] generate');
      var depthMapType = StereogramGen._getRadioVal('stg-depthmap');
      var patternType = StereogramGen._getRadioVal('stg-pattern');
      var width = parseInt(document.getElementById('stg-width').value) || 800;
      var height = parseInt(document.getElementById('stg-height').value) || 400;
      var separation = parseInt(document.getElementById('stg-separation').value) || 100;
      var depthScale = parseInt(document.getElementById('stg-depth').value) || 15;
      var patternScale = parseInt(document.getElementById('stg-scale').value) || 60;
      var gradientOn = document.getElementById('stg-gradient-on').checked;
      var hueStart = parseInt(document.getElementById('stg-hue-start').value) || 200;
      var hueRange = parseInt(document.getElementById('stg-hue-range').value) || 60;
      var color1 = document.getElementById('stg-color1').value || '#4FC3F7';
      var color2 = document.getElementById('stg-color2').value || '#7C3AED';
      var randomize = document.getElementById('stg-randomize').checked;

      // Generate depth map
      var depthMap;
      if (depthMapType === 'custom') {
        var fileInput = document.getElementById('stg-depthfile');
        if (fileInput && fileInput.files && fileInput.files[0]) {
          var reader = new FileReader();
          reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
              depthMap = StereogramGen._imgToDepthMap(img, width, height);
              StereogramGen._renderStereogram(depthMap, width, height, separation, depthScale, patternType, patternScale, gradientOn, hueStart, hueRange, color1, color2, randomize);
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(fileInput.files[0]);
          return;
        }
        depthMap = StereogramGen._generateDepthMap('sphere', width, height);
      } else {
        depthMap = StereogramGen._generateDepthMap(depthMapType, width, height);
      }

      StereogramGen._renderStereogram(depthMap, width, height, separation, depthScale, patternType, patternScale, gradientOn, hueStart, hueRange, color1, color2, randomize);
    } catch (e) {
      console.error('[Stereogram] error:', e);
      alert('Ошибка: ' + e.message);
    }
  },

  _getRadioVal: function(name) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) { if (els[i].checked) return els[i].value; }
    return '';
  },

  _generateDepthMap: function(type, w, h) {
    var map = [];
    var cx = w / 2, cy = h / 2;
    for (var y = 0; y < h; y++) {
      map[y] = [];
      for (var x = 0; x < w; x++) {
        var d = 0;
        if (type === 'sphere') {
          var dx = (x - cx) / (w * 0.3);
          var dy = (y - cy) / (h * 0.4);
          var dist = Math.sqrt(dx * dx + dy * dy);
          d = dist < 1 ? Math.sqrt(1 - dist * dist) : 0;
        } else if (type === 'pyramid') {
          var px = Math.abs(x - cx) / (w * 0.4);
          var py = Math.abs(y - cy) / (h * 0.4);
          d = Math.max(0, 1 - Math.max(px, py));
        } else if (type === 'tunnel') {
          var tdx = (x - cx) / (w * 0.4);
          var tdy = (y - cy) / (h * 0.4);
          var tdist = Math.sqrt(tdx * tdx + tdy * tdy);
          d = tdist < 1 ? (1 - tdist) * 0.7 : 0;
          if (tdist > 0.3 && tdist < 0.5) d = 0.5;
        } else if (type === 'heart') {
          var hx = (x - cx) / (w * 0.3);
          var hy = -(y - cy) / (h * 0.35);
          var h2 = hx * hx + hy * hy - 1;
          d = h2 * h2 * h2 - hx * hy * hy < 0 ? 0.8 : 0;
        }
        map[y][x] = d;
      }
    }
    return map;
  },

  _imgToDepthMap: function(img, w, h) {
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    var data = ctx.getImageData(0, 0, w, h).data;
    var map = [];
    for (var y = 0; y < h; y++) {
      map[y] = [];
      for (var x = 0; x < w; x++) {
        var idx = (y * w + x) * 4;
        map[y][x] = (data[idx] + data[idx + 1] + data[idx + 2]) / (3 * 255);
      }
    }
    return map;
  },

  _renderStereogram: function(depthMap, w, h, separation, depthScale, patternType, patternScale, gradientOn, hueStart, hueRange, color1, color2, randomize) {
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');

    // Generate base pattern
    var patternW = Math.round(separation);
    var patternH = h;
    var patternData = ctx.createImageData(patternW, patternH);

    for (var py = 0; py < patternH; py++) {
      for (var px = 0; px < patternW; px++) {
        var idx = (py * patternW + px) * 4;
        var val = 0;
        if (patternType === 'dots') {
          val = ((px * 7 + py * 13) % 17 < 3) ? 255 : 0;
        } else if (patternType === 'stripes') {
          val = (px % 12 < 2) ? 200 : 50;
        } else if (patternType === 'circles') {
          var cdist = Math.sqrt(Math.pow(px - patternW / 2, 2) + Math.pow(py - patternH / 2, 2));
          val = (cdist % 30 < 5) ? 200 : 80;
        } else if (patternType === 'voronoi') {
          var minD = 999;
          for (var v = 0; v < 20; v++) {
            var vx = ((v * 73 + 17) % patternW);
            var vy = ((v * 47 + 31) % patternH);
            var vdist = Math.abs(px - vx) + Math.abs(py - vy);
            if (vdist < minD) minD = vdist;
          }
          val = (minD * 3) % 256;
        } else {
          val = Math.floor(Math.random() * 256);
        }

        if (gradientOn) {
          var t = px / patternW;
          var hue = (hueStart + t * hueRange) % 360;
          var rgb = StereogramGen._hslToRgb(hue / 360, 0.7, val / 255 * 0.5 + 0.25);
          patternData.data[idx] = rgb[0];
          patternData.data[idx + 1] = rgb[1];
          patternData.data[idx + 2] = rgb[2];
        } else {
          patternData.data[idx] = val;
          patternData.data[idx + 1] = val;
          patternData.data[idx + 2] = val;
        }
        patternData.data[idx + 3] = 255;
      }
    }

    // Create stereogram
    var imgData = ctx.createImageData(w, h);
    var pixels = imgData.data;
    var leftEye = [];
    var rightEye = [];

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        var d = depthMap[y] ? (depthMap[y][x] || 0) : 0;
        var shift = Math.round(d * depthScale * 0.1 * separation);
        var srcX = x % patternW;
        var srcY = y % patternH;
        var idx2 = (y * w + x) * 4;
        var srcIdx = (srcY * patternW + srcX) * 4;

        if (x >= separation) {
          var refX = x - separation + shift;
          var refSrcX = Math.round(refX) % patternW;
          if (refSrcX < 0) refSrcX += patternW;
          var refIdx = (srcY * patternW + refSrcX) * 4;
          pixels[idx2] = patternData.data[refIdx];
          pixels[idx2 + 1] = patternData.data[refIdx + 1];
          pixels[idx2 + 2] = patternData.data[refIdx + 2];
        } else {
          pixels[idx2] = patternData.data[srcIdx];
          pixels[idx2 + 1] = patternData.data[srcIdx + 1];
          pixels[idx2 + 2] = patternData.data[srcIdx + 2];
        }
        pixels[idx2 + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    var dataUrl = canvas.toDataURL('image/png');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">';
    svg += '<image href="' + dataUrl + '" width="' + w + '" height="' + h + '"/>';
    svg += '</svg>';
    document.getElementById('preview-stereogram').innerHTML = svg;
  },

  _hslToRgb: function(h, s, l) {
    var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      var hue2rgb = function(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
};

window.StereogramGen = StereogramGen;
