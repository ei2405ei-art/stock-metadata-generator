var ExportManager = {
  getSVG: function(genId) {
    var preview = document.getElementById('preview-' + genId);
    if (!preview) {
      var puzzle = document.getElementById('preview-' + genId + '-puzzle');
      if (puzzle) preview = puzzle;
    }
    if (!preview) return null;
    var svg = preview.querySelector('svg');
    return svg || null;
  },

  svgToString: function(svg) {
    var clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    var serializer = new XMLSerializer();
    return serializer.serializeToString(clone);
  },

  svgToDataUrl: function(svg) {
    var str = this.svgToString(svg);
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(str)));
  },

  _checkAndRecord: function(genId, svg) {
    if (!Limits.canDownload()) {
      alert('Достигнут дневной лимит скачиваний (' + Limits.MAX_PER_DAY + '). Попробуйте завтра.');
      return false;
    }
    var str = this.svgToString(svg);
    var result = Limits.recordDownload(genId, str);
    if (result.duplicate) {
      if (!confirm('Контент не уникален! Скачать всё равно?')) return false;
    }
    Uniqueness.register(str);
    return true;
  },

  exportSVG: function(genId) {
    var svg = this.getSVG(genId);
    if (!svg) { alert('Сначала сгенерируйте контент'); return; }
    if (!this._checkAndRecord(genId, svg)) return;
    var str = this.svgToString(svg);
    var blob = new Blob([str], { type: 'image/svg+xml' });
    this.downloadBlob(blob, genId + '_' + this.randomId() + '.svg');
  },

  exportPNG: function(genId) {
    var svg = this.getSVG(genId);
    if (!svg) { alert('Сначала сгенерируйте контент'); return; }
    if (!this._checkAndRecord(genId, svg)) return;
    var dataUrl = this.svgToDataUrl(svg);
    var canvas = document.createElement('canvas');
    var vb = svg.getAttribute('viewBox');
    if (vb) {
      var parts = vb.split(/[\s,]+/);
      canvas.width = parseInt(parts[2]) || 800;
      canvas.height = parseInt(parts[3]) || 600;
    } else {
      canvas.width = svg.clientWidth || 800;
      canvas.height = svg.clientHeight || 600;
    }
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.onload = function() {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(function(blob) {
        ExportManager.downloadBlob(blob, genId + '_' + ExportManager.randomId() + '.png');
      }, 'image/png');
    };
    img.src = dataUrl;
  },

  batchExport: function(genId) {
    var count = parseInt(document.getElementById('batch-' + genId).value) || 1;
    if (count > Limits.remaining()) {
      alert('Недостаточно лимита. Осталось: ' + Limits.remaining());
      return;
    }
    for (var i = 0; i < count; i++) {
      if (i > 0) {
        var gen = window[genId + 'Gen'];
        if (gen && typeof gen.generate === 'function') gen.generate();
      }
      this.exportPNG(genId);
    }
  },

  downloadBlob: function(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
  },

  randomId: function() {
    return Math.floor(Math.random() * 900000000 + 100000000);
  }
};
