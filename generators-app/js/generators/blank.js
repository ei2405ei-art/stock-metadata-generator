var BlankGen = {
  presets: [
    { name: 'Instagram (1:1)', w: 1080, h: 1080 },
    { name: 'YouTube Thumbnail', w: 1280, h: 720 },
    { name: 'Facebook Cover', w: 820, h: 312 },
    { name: 'Twitter Header', w: 1500, h: 500 },
    { name: 'Presentation 16:9', w: 1920, h: 1080 },
    { name: 'A4 (300dpi)', w: 2480, h: 3508 },
    { name: 'Banner 728×90', w: 728, h: 90 },
    { name: 'Logo Square', w: 500, h: 500 },
    { name: 'Story (9:16)', w: 1080, h: 1920 },
    { name: 'Custom', w: 800, h: 600 }
  ],

  initPage: function() {
    var s = '';
    s += '<div class="gen-layout"><div class="gen-sidebar">';
    s += '<h2 class="page-title">📄 Пустые шаблоны</h2><p class="page-subtitle">Чистые SVG-шаблоны различных размеров</p>';
    s += App.buildSettings('blank', [
      { title: '📐 Размер', content: BlankGen._sizeSection() },
      { title: '🎨 Фон', content: BlankGen._styleSection() }
    ]);
    s += '</div><div class="gen-preview">';
    s += App.buildPreview('blank');
    s += '</div></div>';
    document.getElementById('page-blank').innerHTML = s;
    App.bindRange('bl-w', 'bl-w-v', 'px');
    App.bindRange('bl-h', 'bl-h-v', 'px');
    App.bindRange('bl-labelsize', 'bl-labelsize-v');
    App.bindColor('bl-bg-color', 'bl-bg-color-v');
    App.bindColor('bl-bg', 'bl-bg-v');
  },

  _sizeSection: function() {
    var h = '<div class="form-group"><label>Пресет</label>';
    h += '<select id="bl-preset" onchange="BlankGen._applyPreset()">';
    for (var i = 0; i < BlankGen.presets.length; i++) {
      h += '<option value="' + i + '">' + BlankGen.presets[i].name + ' (' + BlankGen.presets[i].w + '×' + BlankGen.presets[i].h + ')</option>';
    }
    h += '</select></div>';
    h += '<div class="form-row">';
    h += '<div class="form-group"><label>Ширина</label>';
    h += '<div class="range-row"><input type="range" id="bl-w" min="100" max="4000" value="800" step="10">';
    h += '<span class="range-val" id="bl-w-v">800px</span></div></div>';
    h += '<div class="form-group"><label>Высота</label>';
    h += '<div class="range-row"><input type="range" id="bl-h" min="100" max="4000" value="600" step="10">';
    h += '<span class="range-val" id="bl-h-v">600px</span></div></div>';
    h += '</div>';
    return h;
  },

  _styleSection: function() {
    var h = App.buildBgSection('bl');
    h += '<div class="form-group"><label>Граница</label>';
    h += '<div class="btn-group">';
    h += '<input type="radio" name="bl-border" id="bl-b-none" value="none" checked><label for="bl-b-none">Нет</label>';
    h += '<input type="radio" name="bl-border" id="bl-b-thin" value="thin"><label for="bl-b-thin">Тонкая</label>';
    h += '<input type="radio" name="bl-border" id="bl-b-bold" value="bold"><label for="bl-b-bold">Жирная</label>';
    h += '<input type="radio" name="bl-border" id="bl-b-dashed" value="dashed"><label for="bl-b-dashed">Пунктир</label>';
    h += '</div></div>';
    h += '<div class="form-group"><label>Цвет границы</label><input type="color" id="bl-border-color" value="#CCCCCC"></div>';
    h += '<div class="form-group"><label>Размер шрифта метки</label>';
    h += '<div class="range-row"><input type="range" id="bl-labelsize" min="0" max="24" value="12">';
    h += '<span class="range-val" id="bl-labelsize-v">12</span></div></div>';
    return h;
  },

  _applyPreset: function() {
    var idx = parseInt(document.getElementById('bl-preset').value);
    var preset = BlankGen.presets[idx];
    document.getElementById('bl-w').value = preset.w;
    document.getElementById('bl-h').value = preset.h;
    document.getElementById('bl-w-v').textContent = preset.w + 'px';
    document.getElementById('bl-h-v').textContent = preset.h + 'px';
  },

  generate: function() {
    try {
      console.log('[Blank] generate');
      var w = parseInt(document.getElementById('bl-w').value) || 800;
      var h = parseInt(document.getElementById('bl-h').value) || 600;
      var border = BlankGen._getRadioVal('bl-border');
      var borderColor = document.getElementById('bl-border-color').value || '#CCCCCC';
      var labelSize = parseInt(document.getElementById('bl-labelsize').value) || 12;

      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">';
      svg += App.renderBgRect('bl', w, h);

      if (border === 'thin') {
        svg += '<rect x="0.5" y="0.5" width="' + (w - 1) + '" height="' + (h - 1) + '" fill="none" stroke="' + borderColor + '" stroke-width="1"/>';
      } else if (border === 'bold') {
        svg += '<rect x="2" y="2" width="' + (w - 4) + '" height="' + (h - 4) + '" fill="none" stroke="' + borderColor + '" stroke-width="3"/>';
      } else if (border === 'dashed') {
        svg += '<rect x="4" y="4" width="' + (w - 8) + '" height="' + (h - 8) + '" fill="none" stroke="' + borderColor + '" stroke-width="1" stroke-dasharray="8,4"/>';
      }

      if (labelSize > 0) {
        svg += '<text x="' + (w / 2) + '" y="' + (h / 2) + '" text-anchor="middle" dominant-baseline="central" font-size="' + labelSize + '" fill="#999" font-family="sans-serif">' + w + ' × ' + h + '</text>';
      }

      svg += '</svg>';
      document.getElementById('preview-blank').innerHTML = svg;
    } catch (e) {
      console.error('[Blank] error:', e);
      alert('Ошибка: ' + e.message);
    }
  },

  _getRadioVal: function(name) {
    var els = document.getElementsByName(name);
    for (var i = 0; i < els.length; i++) { if (els[i].checked) return els[i].value; }
    return '';
  }
};

window.BlankGen = BlankGen;
