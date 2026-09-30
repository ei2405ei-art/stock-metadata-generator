(function () {
'use strict';

/* ================= Утилиты ================= */
function $(id) { return document.getElementById(id); }
function fmt(n) { return String(Math.round(n * 100) / 100); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function deg2rad(d) { return d * Math.PI / 180; }
function rad2deg(r) { return r * 180 / Math.PI; }
function uid() { return 'o' + Math.random().toString(36).slice(2, 10); }
function deepClone(x) { return JSON.parse(JSON.stringify(x)); }
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function normalizeHex(v) {
  let s = String(v).trim().replace(/^#/, '');
  if (s.length === 3) s = s.split('').map(c => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  return '#' + s.toUpperCase();
}
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs, parent) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(el);
  return el;
}

/* ================= Состояние ================= */
const state = {
  artboard: { width: 1200, height: 800, background: '#ffffff' },
  objects: [],
  selectedIds: [],
  selNodes: [],
  tool: 'select',
  zoom: 1,
  pan: { x: 80, y: 60 },
  showGrid: true,
  snap: true,
  gridSize: 20,
  spacePressed: false,
  projectName: 'untitled',
  mode: 'idle',
  drag: null,
  history: [],
  historyIndex: -1,
  inChange: false,
  pen: null,
  nudgeTimer: null,
};

const WORK_MARGIN = 900;
const TOOL_NAMES = { select: 'Выделение', node: 'Узлы', pen: 'Перо', rect: 'Прямоугольник', ellipse: 'Эллипс', line: 'Линия', polygon: 'Многоугольник', star: 'Звезда', text: 'Текст', hand: 'Рука' };
const CURSORS = { select: 'default', node: 'default', pen: 'crosshair', rect: 'crosshair', ellipse: 'crosshair', line: 'crosshair', polygon: 'crosshair', star: 'crosshair', text: 'text', hand: 'grab' };
const SHAPE_TOOLS = ['rect', 'ellipse', 'line', 'polygon', 'star'];
const DEFAULT_STROKE_TOOLS = ['line', 'polygon', 'star', 'path'];

/* DOM */
const viewport = $('viewport');
const world = $('world');
const svg = $('artboardSVG');
const selectionLayer = $('selectionLayer');
const nodeLayer = $('nodeLayer');
const marquee = $('marquee');

/* ================= Объекты ================= */
function makeObject(type, props) {
  const base = {
    id: uid(), type: type, name: '',
    x: 0, y: 0, width: 0, height: 0, rotation: 0,
    fill: '#ffffff', fillOpacity: 1,
    stroke: 'none', strokeOpacity: 1, strokeWidth: 1, strokeDash: null,
    opacity: 1, visible: true, locked: false,
  };
  return Object.assign(base, props);
}
const DEFAULT_NAMES = { rect: 'Прямоугольник', ellipse: 'Эллипс', line: 'Линия', polygon: 'Многоугольник', star: 'Звезда', text: 'Текст', path: 'Контур' };
function defaultName(o) {
  const n = (DEFAULT_NAMES[o.type] || 'Объект');
  let i = 1;
  while (state.objects.some(x => x.name === n + ' ' + i)) i++;
  return n + ' ' + i;
}
function getObj(id) { return state.objects.find(o => o.id === id); }
function selectedObjs() { return state.selectedIds.map(getObj).filter(Boolean); }

function textSize(o) {
  const fs = o.fontSize || 16;
  const lines = String(o.text || '').split('\n');
  let w = 10;
  for (const l of lines) w = Math.max(w, l.length * fs * 0.62);
  return { w, h: lines.length * fs * 1.35 };
}
function pathBounds(o) {
  const ns = o.nodes || [];
  if (!ns.length) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of ns) {
    const pts = [n.x, n.y];
    if (n.inX != null) { pts.push(n.inX); pts.push(n.inY); }
    if (n.outX != null) { pts.push(n.outX); pts.push(n.outY); }
    for (let i = 0; i < pts.length; i += 2) {
      minX = Math.min(minX, pts[i]); maxX = Math.max(maxX, pts[i]);
      minY = Math.min(minY, pts[i + 1]); maxY = Math.max(maxY, pts[i + 1]);
    }
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
function objBounds(o) {
  if (o.type === 'path') return pathBounds(o);
  if (o.type === 'text') { const s = textSize(o); return { x: o.x, y: o.y, width: s.w, height: s.h }; }
  return { x: o.x, y: o.y, width: o.width, height: o.height };
}
function mergedBounds() {
  const bs = selectedObjs().map(objBounds);
  if (!bs.length) return null;
  let x = Infinity, y = Infinity, r = -Infinity, b = -Infinity;
  for (const bb of bs) {
    x = Math.min(x, bb.x); y = Math.min(y, bb.y);
    r = Math.max(r, bb.x + bb.width); b = Math.max(b, bb.y + bb.height);
  }
  return { x, y, width: r - x, height: b - y };
}
function transformPt(p, cx, cy, rot) {
  const a = deg2rad(rot);
  const dx = p.x - cx, dy = p.y - cy;
  return { x: cx + dx * Math.cos(a) - dy * Math.sin(a), y: cy + dx * Math.sin(a) + dy * Math.cos(a) };
}

/* ================= Геометрия путей ================= */
function pathD(nodes, closed) {
  if (!nodes || !nodes.length) return '';
  let d = 'M ' + fmt(nodes[0].x) + ' ' + fmt(nodes[0].y);
  const n = nodes.length;
  for (let i = 0; i < n; i++) {
    if (!closed && i === n - 1) break;
    const a = nodes[i], b = nodes[(i + 1) % n];
    const out = (a.outX != null), inn = (b.inX != null);
    if (out && inn) d += ' C ' + fmt(a.outX) + ' ' + fmt(a.outY) + ', ' + fmt(b.inX) + ' ' + fmt(b.inY) + ', ' + fmt(b.x) + ' ' + fmt(b.y);
    else if (out) d += ' Q ' + fmt(a.outX) + ' ' + fmt(a.outY) + ', ' + fmt(b.x) + ' ' + fmt(b.y);
    else if (inn) d += ' Q ' + fmt(b.inX) + ' ' + fmt(b.inY) + ', ' + fmt(b.x) + ' ' + fmt(b.y);
    else d += ' L ' + fmt(b.x) + ' ' + fmt(b.y);
  }
  if (closed && n > 2) d += 'Z';
  return d;
}
function polygonPoints(o) {
  const cx = o.x + o.width / 2, cy = o.y + o.height / 2;
  const r = Math.max(1, Math.abs(o.width) / 2);
  const sides = Math.max(3, o.sides || 5);
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = deg2rad(o.startAngle || 0) + i * Math.PI * 2 / sides;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}
function starPoints(o) {
  const cx = o.x + o.width / 2, cy = o.y + o.height / 2;
  const rOut = Math.max(1, Math.abs(o.width) / 2);
  const rIn = (o.ratio != null ? o.ratio / 100 : 0.5) * rOut;
  const sides = Math.max(3, o.sides || 5);
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = deg2rad(o.startAngle || 0) + i * Math.PI * 2 / sides;
    pts.push([cx + rOut * Math.cos(a), cy + rOut * Math.sin(a)]);
    const a2 = a + Math.PI / sides;
    pts.push([cx + rIn * Math.cos(a2), cy + rIn * Math.sin(a2)]);
  }
  return pts;
}

/* ================= Рендер ================= */
function buildEl(o) {
  let el;
  switch (o.type) {
    case 'rect':
      el = svgEl('rect', { x: o.x, y: o.y, width: o.width, height: o.height });
      if (o.rx) el.setAttribute('rx', o.rx);
      break;
    case 'ellipse':
      el = svgEl('ellipse', { cx: o.x + o.width / 2, cy: o.y + o.height / 2, rx: Math.abs(o.width) / 2, ry: Math.abs(o.height) / 2 });
      break;
    case 'line':
      el = svgEl('line', { x1: o.x, y1: o.y, x2: o.x + o.width, y2: o.y + o.height });
      break;
    case 'polygon':
      el = svgEl('polygon', { points: polygonPoints(o).map(p => fmt(p[0]) + ',' + fmt(p[1])).join(' ') });
      break;
    case 'star':
      el = svgEl('polygon', { points: starPoints(o).map(p => fmt(p[0]) + ',' + fmt(p[1])).join(' ') });
      break;
    case 'text': {
      el = svgEl('text', {
        x: o.x, y: o.y, 'font-size': o.fontSize || 16,
        'font-family': o.fontFamily || 'Arial', 'font-weight': o.fontWeight || 'normal',
        'text-anchor': o.align || 'start', 'dominant-baseline': 'text-before-edge',
      });
      const lh = (o.lineHeight || 1.35) * (o.fontSize || 16);
      String(o.text || '').split('\n').forEach((ln, i) => {
        const t = svgEl('tspan', { x: o.x, dy: i === 0 ? 0 : lh, 'xml:space': 'preserve' }, el);
        t.textContent = ln;
      });
      break;
    }
    case 'path':
      el = svgEl('path', { d: pathD(o.nodes || [], o.closed) });
      break;
  }
  el.setAttribute('fill', (o.fill == null || o.fill === 'none') ? 'none' : o.fill);
  el.setAttribute('fill-opacity', o.fillOpacity != null ? o.fillOpacity : 1);
  el.setAttribute('stroke', (o.stroke == null || o.stroke === 'none') ? 'none' : o.stroke);
  el.setAttribute('stroke-opacity', o.strokeOpacity != null ? o.strokeOpacity : 1);
  el.setAttribute('stroke-width', o.strokeWidth || 0);
  el.setAttribute('stroke-linejoin', 'round');
  el.setAttribute('stroke-linecap', 'round');
  if (o.strokeDash) el.setAttribute('stroke-dasharray', o.strokeDash);
  el.setAttribute('opacity', o.opacity != null ? o.opacity : 1);
  if (o.rotation && o.type !== 'path') {
    const b = objBounds(o);
    el.setAttribute('transform', 'rotate(' + o.rotation + ' ' + (b.x + b.width / 2) + ' ' + (b.y + b.height / 2) + ')');
  }
  if (o.type === 'rect' || o.type === 'ellipse' || o.type === 'polygon' || o.type === 'star' || o.type === 'path') {
    el.style.pointerEvents = 'all';
  }
  return el;
}

function renderCanvas() {
  const W = state.artboard.width + WORK_MARGIN * 2;
  const H = state.artboard.height + WORK_MARGIN * 2;
  svg.setAttribute('width', W);
  svg.setAttribute('height', H);
  svg.innerHTML = '';
  const defs = svgEl('defs', {}, svg);
  if (state.showGrid) {
    const g = state.gridSize;
    const pat = svgEl('pattern', { id: 'grid', width: g, height: g, patternUnits: 'userSpaceOnUse' }, defs);
    svgEl('path', { d: 'M ' + g + ' 0 L 0 0 0 ' + g, fill: 'none', stroke: 'rgba(130,130,145,.3)', 'stroke-width': 1 }, pat);
  }
  svgEl('rect', { x: -WORK_MARGIN, y: -WORK_MARGIN, width: W, height: H, fill: '#202127' }, svg);
  if (state.showGrid) svgEl('rect', { x: -WORK_MARGIN, y: -WORK_MARGIN, width: W, height: H, fill: 'url(#grid)' }, svg);
  svgEl('rect', { x: 0, y: 0, width: state.artboard.width, height: state.artboard.height, fill: state.artboard.background, stroke: '#4a5cff', 'stroke-width': 1 }, svg);

  const g = svgEl('g', {}, svg);
  for (const o of state.objects) {
    if (!o.visible) continue;
    const el = buildEl(o);
    el.setAttribute('data-id', o.id);
    if (o.locked) el.style.pointerEvents = 'none';
    g.appendChild(el);
  }

  if (state.pen) {
    const d = pathD(state.pen.nodes, state.pen.closed);
    if (d) svgEl('path', { d: d, fill: 'none', stroke: '#4a5cff', 'stroke-width': 1, 'stroke-dasharray': '5 4' }, g);
    const ns = state.pen.nodes;
    if (ns.length && state.pen.previewPt) {
      const last = ns[ns.length - 1];
      svgEl('line', { x1: last.x, y1: last.y, x2: state.pen.previewPt.x, y2: state.pen.previewPt.y, stroke: '#4a5cff', 'stroke-width': 1, 'stroke-dasharray': '3 3' }, g);
    }
  }

  renderSelection();
  renderNodes();
}

function render() {
  renderCanvas();
  updateLayers();
  updateProperties();
  updateStatus();
  updateHistoryButtons();
}

/* ---------- Выделение ---------- */
function renderSelection() {
  selectionLayer.innerHTML = '';
  if (!state.selectedIds.length) return;
  const objs = selectedObjs();
  if (!objs.length) return;
  const isMulti = objs.length > 1;
  let b, rot = 0;
  if (isMulti) b = mergedBounds();
  else { b = objBounds(objs[0]); rot = (objs[0].type === 'path') ? 0 : (objs[0].rotation || 0); }
  const pad = 4 / state.zoom;
  const box = { x: b.x - pad, y: b.y - pad, width: b.width + pad * 2, height: b.height + pad * 2 };
  const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
  const hs = 8 / state.zoom, off = hs / 2;

  const sel = document.createElement('div');
  sel.className = 'sel-box';
  sel.style.left = box.x + 'px'; sel.style.top = box.y + 'px';
  sel.style.width = box.width + 'px'; sel.style.height = box.height + 'px';
  if (rot) { sel.style.transformOrigin = '50% 50%'; sel.style.transform = 'rotate(' + rot + 'deg)'; }
  selectionLayer.appendChild(sel);

  const positions = {
    nw: [box.x, box.y], n: [box.x + box.width / 2, box.y], ne: [box.x + box.width, box.y],
    e: [box.x + box.width, box.y + box.height / 2], se: [box.x + box.width, box.y + box.height],
    s: [box.x + box.width / 2, box.y + box.height], sw: [box.x, box.y + box.height], w: [box.x, box.y + box.height / 2],
  };
  const keys = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  for (const k of keys) {
    let p = { x: positions[k][0], y: positions[k][1] };
    if (rot) p = transformPt(p, cx, cy, rot);
    const h = document.createElement('div');
    h.className = 'sel-handle ' + k;
    h.style.width = hs + 'px'; h.style.height = hs + 'px';
    h.style.left = (p.x - off) + 'px'; h.style.top = (p.y - off) + 'px';
    h.dataset.handle = k;
    selectionLayer.appendChild(h);
  }
  const rhp = transformPt({ x: cx, y: box.y - 24 / state.zoom }, cx, cy, rot);
  const rh = document.createElement('div');
  rh.className = 'sel-handle rot';
  rh.style.width = hs + 'px'; rh.style.height = hs + 'px';
  rh.style.left = (rhp.x - off) + 'px'; rh.style.top = (rhp.y - off) + 'px';
  rh.dataset.handle = 'rot';
  selectionLayer.appendChild(rh);
}

/* ---------- Узлы ---------- */
function drawTipLine(x0, y0, x1, y1) {
  if (x1 == null) return;
  const ln = document.createElement('div');
  ln.className = 'tip-line';
  const dx = x1 - x0, dy = y1 - y0;
  ln.style.width = Math.max(1, Math.hypot(dx, dy)) + 'px';
  ln.style.left = x0 + 'px'; ln.style.top = y0 + 'px';
  ln.style.transform = 'rotate(' + rad2deg(Math.atan2(dy, dx)) + 'deg)';
  nodeLayer.appendChild(ln);
}
function drawTip(n, side, oid, idx) {
  const x = side === 'in' ? n.inX : n.outX;
  const y = side === 'in' ? n.inY : n.outY;
  const t = document.createElement('div');
  t.className = 'tip-pt';
  const hs = 6 / state.zoom;
  t.style.width = hs + 'px'; t.style.height = hs + 'px';
  t.style.left = x + 'px'; t.style.top = y + 'px';
  t.dataset.tip = oid + ':' + idx + ':' + side;
  nodeLayer.appendChild(t);
}
function renderNodes() {
  nodeLayer.innerHTML = '';
  const hs = 7 / state.zoom;
  if (state.tool === 'node') {
    for (const o of selectedObjs()) {
      if (o.type !== 'path' || !o.nodes) continue;
      o.nodes.forEach((n, i) => {
        const isSel = state.selNodes.some(s => s.id === o.id && s.index === i);
        if (isSel) {
          drawTipLine(n.x, n.y, n.inX, n.inY);
          drawTipLine(n.x, n.y, n.outX, n.outY);
          if (n.inX != null) drawTip(n, 'in', o.id, i);
          if (n.outX != null) drawTip(n, 'out', o.id, i);
        }
        const d = document.createElement('div');
        d.className = 'node-pt' + (isSel ? ' selected' : '');
        d.style.width = hs + 'px'; d.style.height = hs + 'px';
        d.style.left = n.x + 'px'; d.style.top = n.y + 'px';
        d.dataset.node = o.id + ':' + i;
        nodeLayer.appendChild(d);
      });
    }
  }
  if (state.pen) {
    state.pen.nodes.forEach((n, i) => {
      const d = document.createElement('div');
      d.className = 'node-pt hover';
      d.style.width = hs + 'px'; d.style.height = hs + 'px';
      d.style.left = n.x + 'px'; d.style.top = n.y + 'px';
      nodeLayer.appendChild(d);
    });
  }
}

/* ================= Координаты ================= */
function screenToDoc(clientX, clientY) {
  const r = world.getBoundingClientRect();
  return { x: (clientX - r.left) / state.zoom, y: (clientY - r.top) / state.zoom };
}
function maybeSnap(p) {
  if (!state.snap) return p;
  const g = state.gridSize;
  return { x: Math.round(p.x / g) * g, y: Math.round(p.y / g) * g };
}
function objectAtDocPoint(p) {
  const r = world.getBoundingClientRect();
  const sx = r.left + p.x * state.zoom;
  const sy = r.top + p.y * state.zoom;
  const el = document.elementFromPoint(sx, sy);
  let cur = el;
  while (cur && cur !== svg) {
    if (cur.getAttribute) {
      const id = cur.getAttribute('data-id');
      if (id) return id;
    }
    cur = cur.parentNode;
  }
  return null;
}
function updateWorldTransform() {
  world.style.transform = 'translate(' + state.pan.x + 'px, ' + state.pan.y + 'px) scale(' + state.zoom + ')';
}

/* ================= История ================= */
function snapshotString() { return JSON.stringify({ objects: state.objects, artboard: state.artboard }); }
function beginChange() { state.inChange = true; }
function commitChange() {
  if (!state.inChange) return;
  state.inChange = false;
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snapshotString());
  if (state.history.length > 100) state.history.shift();
  state.historyIndex = state.history.length - 1;
  updateHistoryButtons();
}
function cancelChange() { state.inChange = false; }
function restoreState(s) {
  const d = JSON.parse(s);
  state.objects = d.objects;
  state.artboard = d.artboard;
  state.selectedIds = state.selectedIds.filter(id => state.objects.some(o => o.id === id));
  state.selNodes = [];
  state.pen = null;
  state.inChange = false;
  render();
}
function undo() {
  if (state.historyIndex <= 0) return;
  state.inChange = false;
  state.historyIndex--;
  restoreState(state.history[state.historyIndex]);
}
function redo() {
  if (state.historyIndex >= state.history.length - 1) return;
  state.inChange = false;
  state.historyIndex++;
  restoreState(state.history[state.historyIndex]);
}
function pushHistory() {
  state.inChange = false;
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(snapshotString());
  if (state.history.length > 100) state.history.shift();
  state.historyIndex = state.history.length - 1;
  updateHistoryButtons();
}

/* ================= События мыши ================= */
function onDown(e) {
  if (e.button !== 0 && e.button !== 1) return;
  const p = screenToDoc(e.clientX, e.clientY);
  try { viewport.setPointerCapture(e.pointerId); } catch (_) {}

  if (e.button === 1 || state.spacePressed || state.tool === 'hand') {
    state.drag = { type: 'pan', originPan: { x: state.pan.x, y: state.pan.y }, startClient: { x: e.clientX, y: e.clientY } };
    state.mode = 'pan';
    return;
  }

  const t = e.target;
  if (t.dataset && t.dataset.handle && state.tool === 'select') {
    startResizeOrRotate(e, t.dataset.handle, p);
    return;
  }
  if (t.dataset && (t.dataset.node || t.dataset.tip) && state.tool === 'node') {
    startNodeEdit(e, t.dataset, p);
    return;
  }

  if (state.tool === 'pen') { penDown(e, p); return; }
  if (SHAPE_TOOLS.indexOf(state.tool) >= 0) { startShapeDraw(e, p); return; }
  if (state.tool === 'text') { placeText(p); return; }

  // select / node (как выделение для объектов)
  const id = objectAtDocPoint(p);
  if (id) {
    const o = getObj(id);
    if (!o || o.locked) return;
    if (e.shiftKey) {
      if (state.selectedIds.includes(id)) { state.selectedIds = state.selectedIds.filter(x => x !== id); state.selNodes = []; render(); return; }
      state.selectedIds.push(id);
      state.selNodes = [];
      render();
      return;
    }
    if (!state.selectedIds.includes(id)) { state.selectedIds = [id]; state.selNodes = []; }
    startMove(e, p);
    render();
    return;
  }
  if (!e.shiftKey) { state.selectedIds = []; state.selNodes = []; }
  startMarquee(e, p);
  render();
}

function onMove(e) {
  const p = screenToDoc(e.clientX, e.clientY);
  updateStatusCursor(p);
  const g = state.drag;
  if (!g) { if (state.tool === 'select') updateCursor(p); return; }

  if (g.type === 'pan') {
    state.pan = { x: g.originPan.x + (e.clientX - g.startClient.x), y: g.originPan.y + (e.clientY - g.startClient.y) };
    updateWorldTransform(); render(); return;
  }
  const sp = maybeSnap(p);

  if (g.type === 'move') {
    g.moved = true;
    const dx = sp.x - g.startDoc.x, dy = sp.y - g.startDoc.y;
    for (const rec of g.objs) {
      const o = getObj(rec.id); if (!o) continue;
      if (o.type === 'path') {
        o.nodes = rec.nodes.map(n => ({
          x: n.x + dx, y: n.y + dy,
          inX: n.inX != null ? n.inX + dx : null, inY: n.inY != null ? n.inY + dy : null,
          outX: n.outX != null ? n.outX + dx : null, outY: n.outY != null ? n.outY + dy : null,
        }));
      } else { o.x = rec.x + dx; o.y = rec.y + dy; }
    }
    render(); return;
  }
  if (g.type === 'resize') { resizeUpdate(e, sp); return; }
  if (g.type === 'rotate') { rotateUpdate(p); return; }
  if (g.type === 'draw') { drawUpdate(p, sp, e); return; }
  if (g.type === 'marquee') {
    g.cur = p;
    const x = Math.min(g.startDoc.x, p.x), y = Math.min(g.startDoc.y, p.y);
    marquee.style.display = 'block';
    marquee.style.left = x + 'px'; marquee.style.top = y + 'px';
    marquee.style.width = Math.abs(p.x - g.startDoc.x) + 'px'; marquee.style.height = Math.abs(p.y - g.startDoc.y) + 'px';
    return;
  }
  if (g.type === 'node') nodeDragUpdate(p, sp);
  if (g.type === 'tip') tipDragUpdate(p, e);
  if (g.type === 'pen') penDrag(p, e);
}

function onUp(e) {
  const g = state.drag;
  state.drag = null;
  if (!g) { state.mode = 'idle'; return; }

  if (g.type === 'draw') {
    const o = getObj(g.objId);
    if (o) {
      if (o.width === 0 && o.height === 0) {
        state.objects.splice(state.objects.indexOf(o), 1);
        cancelChange();
      } else { state.selectedIds = [o.id]; state.selNodes = []; commitChange(); }
    }
  }
  if (g.type === 'marquee') {
    marquee.style.display = 'none';
    const a = g.startDoc, b = g.cur || a;
    const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), w = Math.abs(b.x - a.x), h = Math.abs(b.y - a.y);
    for (const o of state.objects) {
      if (!o.visible || o.locked) continue;
      const bb = objBounds(o);
      if (bb.x < x + w && bb.x + bb.width > x && bb.y < y + h && bb.y + bb.height > y) {
        if (!state.selectedIds.includes(o.id)) state.selectedIds.push(o.id);
      }
    }
    state.selNodes = [];
  }
  if (g.type === 'pen') {
    const P = state.pen;
    if (P) {
      if (P.moved && P.nodes.length) {
        const n = P.nodes[P.nodes.length - 1];
        n.outX = P.previewPt.x; n.outY = P.previewPt.y;
        n.inX = n.x - (P.previewPt.x - n.x); n.inY = n.y - (P.previewPt.y - n.y);
        n.smooth = true;
      }
      P.previewPt = null;
      state.mode = 'pen';
    }
  }
  if (['move', 'resize', 'rotate', 'node', 'tip'].indexOf(g.type) >= 0) {
    if (g.type === 'move' && !g.moved) cancelChange();
    else commitChange();
  }
  state.mode = 'idle';
  render();
}

function startMove(e, p) {
  beginChange();
  state.mode = 'move';
  state.drag = {
    type: 'move', startDoc: p, moved: false,
    objs: selectedObjs().map(o => deepClone(o)),
  };
}

function startMarquee(e, p) {
  state.drag = { type: 'marquee', startDoc: p, cur: p };
  state.mode = 'marquee';
}

function startResizeOrRotate(e, handle, p) {
  const objs = selectedObjs();
  if (!objs.length) return;
  beginChange();
  const isMulti = objs.length > 1;
  const b = isMulti ? mergedBounds() : objBounds(objs[0]);
  if (!b) return;
  const g = {
    type: handle === 'rot' ? 'rotate' : 'resize', handle, isMulti,
    b: b, center: { x: b.x + b.width / 2, y: b.y + b.height / 2 },
    objs: objs.map(o => deepClone(o)),
    rot: (!isMulti && objs[0].type !== 'path') ? (objs[0].rotation || 0) : 0,
    startDoc: p,
  };
  if (handle === 'rot') {
    g.startAngle = Math.atan2(p.y - g.center.y, p.x - g.center.x);
    g.baseRot = (!isMulti && objs[0].type !== 'path') ? (objs[0].rotation || 0) : 0;
  }
  state.drag = g;
  state.mode = g.type;
}

function resizeUpdate(e, sp) {
  const g = state.drag;
  const b = g.b, cx = g.center.x, cy = g.center.y;
  const hp = g.rot ? transformPt(sp, cx, cy, -g.rot) : sp;
  const H = g.handle;
  const hasX = H.indexOf('e') >= 0 || H.indexOf('w') >= 0;
  const hasY = H.indexOf('n') >= 0 || H.indexOf('s') >= 0;
  let nx = b.x, ny = b.y, nw = b.width, nh = b.height;

  if (e.altKey) {
    let w = b.width, h = b.height;
    if (hasX) w = Math.abs(hp.x - cx) * 2;
    if (hasY) h = Math.abs(hp.y - cy) * 2;
    if (e.shiftKey) { const m = Math.max(w, h); w = m; h = m; }
    w = Math.max(1, w); h = Math.max(1, h);
    nx = cx - w / 2; ny = cy - h / 2; nw = w; nh = h;
  } else {
    if (hasX) {
      const anchorX = H.indexOf('w') >= 0 ? b.x + b.width : b.x;
      nw = Math.max(1, Math.abs(hp.x - anchorX));
      nx = H.indexOf('w') >= 0 ? Math.min(anchorX, hp.x) : b.x;
    }
    if (hasY) {
      const anchorY = H.indexOf('n') >= 0 ? b.y + b.height : b.y;
      nh = Math.max(1, Math.abs(hp.y - anchorY));
      ny = H.indexOf('n') >= 0 ? Math.min(anchorY, hp.y) : b.y;
    }
    if (e.shiftKey) {
      const anchorX = H.indexOf('w') >= 0 ? b.x + b.width : b.x;
      const anchorY = H.indexOf('n') >= 0 ? b.y + b.height : b.y;
      const dx = Math.abs(hp.x - anchorX), dy = Math.abs(hp.y - anchorY);
      const kk = Math.max(dx / Math.max(1, b.width), dy / Math.max(1, b.height));
      const w2 = Math.max(1, b.width * kk), h2 = Math.max(1, b.height * kk);
      nw = w2; nh = h2;
      nx = H.indexOf('w') >= 0 ? anchorX - w2 : anchorX;
      ny = H.indexOf('n') >= 0 ? anchorY - h2 : anchorY;
    }
  }
  applyBoundsToObjects(g, nx, ny, nw, nh);
}

function applyBoundsToObjects(g, nx, ny, nw, nh) {
  const b = g.b;
  const kx = b.width ? nw / b.width : 1;
  const ky = b.height ? nh / b.height : 1;
  if (g.isMulti) {
    for (const rec of g.objs) {
      const o = getObj(rec.id); if (!o) continue;
      const ob = objBounds(o);
      const dx = (ob.x - b.x) * kx, dy = (ob.y - b.y) * ky;
      applyBoundsTo(o, nx + dx, ny + dy, ob.width * kx, ob.height * ky);
    }
  } else {
    applyBoundsTo(getObj(g.objs[0].id), nx, ny, nw, nh);
  }
  render();
}

function applyBoundsTo(o, nx, ny, nw, nh) {
  if (!o) return;
  const b = objBounds(o);
  const kx = b.width ? nw / b.width : 1;
  const ky = b.height ? nh / b.height : 1;
  if (o.type === 'path') {
    o.nodes = o.nodes.map(n => ({
      x: (n.x - b.x) * kx + nx, y: (n.y - b.y) * ky + ny,
      inX: n.inX != null ? (n.inX - b.x) * kx + nx : null, inY: n.inY != null ? (n.inY - b.y) * ky + ny : null,
      outX: n.outX != null ? (n.outX - b.x) * kx + nx : null, outY: n.outY != null ? (n.outY - b.y) * ky + ny : null,
    }));
  } else { o.x = nx; o.y = ny; o.width = nw; o.height = nh; if (o.type === 'text') o.fontSize = Math.max(1, (o.fontSize || 16) * (kx + ky) / 2); }
}

function rotateUpdate(p) {
  const g = state.drag;
  const angDeg = normalizeAngle(rad2deg(Math.atan2(p.y - g.center.y, p.x - g.center.x)) - g.startAngle);
  const a = deg2rad(angDeg), ca = Math.cos(a), sa = Math.sin(a);
  const gcx = g.center.x, gcy = g.center.y;
  for (const rec of g.objs) {
    const o = getObj(rec.id); if (!o) continue;
    if (o.type === 'path') {
      o.nodes = o.nodes.map(n => {
        const rx = gcx + (n.x - gcx) * ca - (n.y - gcy) * sa;
        const ry = gcy + (n.x - gcx) * sa + (n.y - gcy) * ca;
        const tr = (x, y) => { const rxx = gcx + (x - gcx) * ca - (y - gcy) * sa; const ryy = gcy + (x - gcx) * sa + (y - gcy) * ca; return [rxx, ryy]; };
        return {
          x: rx, y: ry,
          inX: n.inX != null ? tr(n.inX, n.inY)[0] : null, inY: n.inX != null ? tr(n.inX, n.inY)[1] : null,
          outX: n.outX != null ? tr(n.outX, n.outY)[0] : null, outY: n.outX != null ? tr(n.outX, n.outY)[1] : null,
        };
      });
    } else {
      const b = objBounds(o);
      const ocx = b.x + b.width / 2, ocy = b.y + b.height / 2;
      const dx = ocx - gcx, dy = ocy - gcy;
      o.x += (gcx + dx * ca - dy * sa) - ocx;
      o.y += (gcy + dx * sa + dy * ca) - ocy;
      o.rotation = normalizeAngle((o.rotation || 0) + angDeg);
    }
  }
  render();
}
function normalizeAngle(a) { a = a % 360; if (a < 0) a += 360; return a; }

/* ---------- Рисование фигур ---------- */
function startShapeDraw(e, p) {
  beginChange();
  const s0 = maybeSnap(p);
  const o = makeObject(state.tool, { x: s0.x, y: s0.y, width: 0, height: 0 });
  if (o.type === 'polygon') { o.sides = 5; o.startAngle = -90; }
  if (o.type === 'star') { o.sides = 5; o.ratio = 50; o.startAngle = -90; }
  if (DEFAULT_STROKE_TOOLS.indexOf(o.type) >= 0) { o.stroke = '#000000'; o.strokeWidth = 2; o.fill = o.type === 'path' ? 'none' : '#ffffff'; }
  state.objects.push(o);
  state.drag = { type: 'draw', objId: o.id, startDoc: s0 };
  state.mode = 'draw';
  render();
}
function drawUpdate(p, sp, e) {
  const o = getObj(state.drag.objId); if (!o) return;
  const s = state.drag.startDoc;
  if (o.type === 'line') {
    o.x = s.x; o.y = s.y; o.width = sp.x - s.x; o.height = sp.y - s.y;
    if (e.shiftKey) {
      const dx = sp.x - s.x, dy = sp.y - s.y;
      const len = Math.max(Math.abs(dx), Math.abs(dy));
      const ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
      o.width = Math.cos(ang) * len * Math.sign(dx || 1);
      o.height = Math.sin(ang) * len * Math.sign(dy || 1);
    }
    render(); return;
  }
  if (o.type === 'polygon' || o.type === 'star') {
    const a = Math.atan2(sp.y - s.y, sp.x - s.x);
    o.startAngle = rad2deg(a) - 90;
    o.width = Math.abs(sp.x - s.x) || 1;
    o.height = Math.abs(sp.y - s.y) || 1;
    if (e.shiftKey) { const m = Math.max(o.width, o.height); o.width = m; o.height = m; }
    if (e.altKey) { o.x = s.x - o.width; o.y = s.y - o.height; o.width *= 2; o.height *= 2; }
    else { o.x = Math.min(s.x, sp.x); o.y = Math.min(s.y, sp.y); }
    render(); return;
  }
  let w = Math.abs(sp.x - s.x), h = Math.abs(sp.y - s.y);
  if (e.shiftKey) { const m = Math.max(w, h); w = m; h = m; }
  if (e.altKey) { o.x = s.x - w; o.y = s.y - h; o.width = w * 2; o.height = h * 2; }
  else { o.x = Math.min(s.x, sp.x); o.y = Math.min(s.y, sp.y); o.width = w; o.height = h; }
  render();
}

/* ---------- Перо ---------- */
function penDown(e, p) {
  if (!state.pen) state.pen = { nodes: [], closed: false, previewPt: null };
  const P = state.pen;
  const first = P.nodes[0];
  const tol = 8 / state.zoom;
  if (first && P.nodes.length >= 2 && Math.hypot(p.x - first.x, p.y - first.y) < tol) {
    finishPen(true);
    return;
  }
  P.nodes.push({ x: p.x, y: p.y, inX: null, inY: null, outX: null, outY: null, smooth: false });
  P.lastAdd = Date.now();
  P.anchor = { x: p.x, y: p.y };
  P.moved = false;
  P.previewPt = null;
  state.mode = 'pen-drag';
  state.drag = { type: 'pen', startDoc: p };
  render();
}
function penDrag(p, e) {
  const P = state.pen; if (!P || !P.anchor) return;
  if (Math.hypot(p.x - P.anchor.x, p.y - P.anchor.y) > 3 / state.zoom) {
    P.moved = true;
    P.previewPt = p;
  }
  render();
}
function finishPen(closed) {
  const P = state.pen;
  if (!P) return;
  if (P.nodes.length >= 2) {
    beginChange();
    const o = makeObject('path', { nodes: deepClone(P.nodes), closed: closed, fill: 'none', stroke: '#000000', strokeWidth: 2 });
    state.objects.push(o);
    state.selectedIds = [o.id]; state.selNodes = [];
    commitChange();
  }
  state.pen = null; state.mode = 'idle'; state.drag = null;
  if (state.tool === 'pen') setTool('node');
  else render();
}
function cancelPen() {
  state.pen = null; state.mode = 'idle'; state.drag = null;
  render();
}

/* ---------- Узлы ---------- */
function startNodeEdit(e, ds, p) {
  const spec = ds.node ? ds.node.split(':') : ds.tip.split(':');
  const id = spec[0], idx = Number(spec[1]);
  const o = getObj(id); if (!o || o.locked) return;
  if (e.shiftKey) {
    if (state.selNodes.some(s => s.id === id && s.index === idx)) state.selNodes = state.selNodes.filter(s => !(s.id === id && s.index === idx));
    else state.selNodes.push({ id, index: idx });
  } else {
    state.selNodes = [{ id, index: idx }];
  }
  if (!state.selectedIds.includes(id)) state.selectedIds = [id];
  beginChange();
  state.mode = 'node';
  state.drag = {
    type: ds.tip ? 'tip' : 'node', id: id, index: idx,
    side: ds.tip ? ds.tip.split(':')[2] : null,
    startDoc: p, origNode: deepClone(o.nodes[idx]),
  };
  render();
}
function nodeDragUpdate(p, sp) {
  const g = state.drag;
  const o = getObj(g.id); if (!o || !o.nodes[g.index]) return;
  const dx = sp.x - g.startDoc.x, dy = sp.y - g.startDoc.y;
  const n = o.nodes[g.index], orig = g.origNode;
  n.x = orig.x + dx; n.y = orig.y + dy;
  n.inX = orig.inX != null ? orig.inX + dx : null;
  n.inY = orig.inY != null ? orig.inY + dy : null;
  n.outX = orig.outX != null ? orig.outX + dx : null;
  n.outY = orig.outY != null ? orig.outY + dy : null;
  render();
}
function tipDragUpdate(p, e) {
  const g = state.drag;
  const o = getObj(g.id); if (!o || !o.nodes[g.index]) return;
  const n = o.nodes[g.index], orig = g.origNode;
  const dx = p.x - g.startDoc.x, dy = p.y - g.startDoc.y;
  if (g.side === 'in') {
    n.inX = orig.inX + dx; n.inY = orig.inY + dy;
    if (n.smooth) { n.outX = n.x + (n.x - n.inX); n.outY = n.y + (n.y - n.inY); }
  } else {
    n.outX = orig.outX + dx; n.outY = orig.outY + dy;
    if (n.smooth) { n.inX = n.x + (n.x - n.outX); n.inY = n.y + (n.y - n.outY); }
  }
  render();
}
function deleteSelectedNodes() {
  if (!state.selNodes.length) return;
  beginChange();
  const byId = {};
  for (const s of state.selNodes) (byId[s.id] = byId[s.id] || []).push(s.index);
  for (const id in byId) {
    const o = getObj(id); if (!o) continue;
    byId[id].sort((a, b) => b - a).forEach(i => o.nodes.splice(i, 1));
    if (o.nodes.length < 2) state.objects.splice(state.objects.indexOf(o), 1);
  }
  state.selNodes = [];
  commitChange();
  render();
}

/* ---------- Текст ---------- */
function placeText(p) {
  beginChange();
  const o = makeObject('text', { x: p.x, y: p.y, text: 'Текст', fontSize: 32, fontFamily: 'Arial', fontWeight: 'normal', align: 'start', fill: '#000000', stroke: 'none', strokeWidth: 0 });
  state.objects.push(o);
  state.selectedIds = [o.id]; state.selNodes = [];
  commitChange();
  render();
  $('pText').focus(); $('pText').select();
}

/* ================= Команды ================= */
function deleteSelected() {
  if (!state.selectedIds.length) return;
  beginChange();
  state.objects = state.objects.filter(o => !state.selectedIds.includes(o.id));
  state.selectedIds = []; state.selNodes = [];
  commitChange();
  render();
}
function duplicateSelected() {
  if (!state.selectedIds.length) return;
  beginChange();
  const newOnes = [];
  for (const o of state.objects) {
    if (state.selectedIds.includes(o.id)) {
      const c = deepClone(o); c.id = uid();
      if (c.type === 'path') c.nodes.forEach(n => { n.x += 10; n.y += 10; if (n.inX != null) { n.inX += 10; n.inY += 10; } if (n.outX != null) { n.outX += 10; n.outY += 10; } });
      else { c.x += 10; c.y += 10; }
      newOnes.push(c);
    }
  }
  state.objects.push.apply(state.objects, newOnes);
  state.selectedIds = newOnes.map(o => o.id); state.selNodes = [];
  commitChange();
  render();
}
let clipboard = null;
function copySelected() {
  clipboard = deepClone(selectedObjs());
  statusFlash('Скопировано: ' + clipboard.length);
}
function paste() {
  if (!clipboard || !clipboard.length) return;
  beginChange();
  const newOnes = clipboard.map(c => {
    const o = deepClone(c); o.id = uid();
    if (o.type === 'path') o.nodes.forEach(n => { n.x += 20; n.y += 20; if (n.inX != null) { n.inX += 20; n.inY += 20; } if (n.outX != null) { n.outX += 20; n.outY += 20; } });
    else { o.x += 20; o.y += 20; }
    return o;
  });
  state.objects.push.apply(state.objects, newOnes);
  state.selectedIds = newOnes.map(o => o.id); state.selNodes = [];
  commitChange();
  render();
}
function selectAll() {
  state.selectedIds = state.objects.filter(o => o.visible && !o.locked).map(o => o.id);
  state.selNodes = [];
  render();
}
function translateObj(o, dx, dy) {
  if (o.type === 'path') {
    o.nodes.forEach(n => {
      n.x += dx; n.y += dy;
      if (n.inX != null) { n.inX += dx; n.inY += dy; }
      if (n.outX != null) { n.outX += dx; n.outY += dy; }
    });
  } else { o.x += dx; o.y += dy; }
}
function moveLayer(dir) {
  const sel = state.selectedIds.filter(id => state.objects.some(o => o.id === id));
  if (!sel.length) return;
  beginChange();
  if (dir > 0) {
    for (let i = 0; i < sel.length; i++) {
      const id = sel[sel.length - 1 - i];
      const idx = state.objects.findIndex(o => o.id === id);
      if (idx < state.objects.length - 1) {
        const arr = state.objects.splice(idx, 1);
        state.objects.splice(idx + 1, 0, arr[0]);
      }
    }
  } else {
    for (const id of sel) {
      const idx = state.objects.findIndex(o => o.id === id);
      if (idx > 0) {
        const arr = state.objects.splice(idx, 1);
        state.objects.splice(idx - 1, 0, arr[0]);
      }
    }
  }
  commitChange();
  render();
}
function toFront() { toLayerEdge(1); }
function toBack() { toLayerEdge(-1); }
function toLayerEdge(dir) {
  const sel = state.objects.filter(o => state.selectedIds.includes(o.id));
  if (!sel.length) return;
  beginChange();
  state.objects = state.objects.filter(o => !state.selectedIds.includes(o.id));
  if (dir > 0) state.objects.push.apply(state.objects, sel);
  else state.objects = sel.concat(state.objects);
  commitChange();
  render();
}

/* ================= Панель слоёв ================= */
const LAYER_ICONS = {
  rect: 'M4 4h16v16H4z', ellipse: 'M12 4a8 8 0 100 16 8 8 0 000-16z', line: 'M5 19L19 5',
  polygon: 'M12 3l9 5.5-3.5 10h-11L3 8.5z', star: 'M12 2l3 7.5 7.5.5-5.7 5 1.8 7.5-6.6-4-6.6 4 1.8-7.5L1.5 10 9 9.5z',
  text: 'M5 6h14M12 6v12M9 18h6', path: 'M4 20c2-6 6-6 8-12',
};
function eyeIcon(vis) {
  const c = vis ? '#7b8cff' : '#8a8e9a';
  return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${c}" stroke-width="2"><path d="M1 12s4-7.5 11-7.5S23 12 23 12s-4 7.5-11 7.5S1 12 1 12z"/><circle cx="12" cy="12" r="3" fill="${c}" stroke="none"/></svg>`;
}
function lockIcon(lock) {
  const c = lock ? '#7b8cff' : '#8a8e9a';
  return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${c}" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>`;
}
function updateLayers() {
  const list = $('layersList');
  list.innerHTML = '';
  for (let i = state.objects.length - 1; i >= 0; i--) {
    const o = state.objects[i];
    const div = document.createElement('div');
    div.className = 'layer-item' + (state.selectedIds.includes(o.id) ? ' selected' : '');
    div.dataset.lid = o.id;
    div.innerHTML =
      '<span class="li-icon"><svg viewBox="0 0 24 24"><path d="' + (LAYER_ICONS[o.type] || '') + '"/></svg></span>' +
      '<span class="li-name ' + (o.visible ? '' : 'dim') + '">' + escapeHtml(o.name) + '</span>' +
      '<button class="li-toggle" data-act="vis">' + eyeIcon(o.visible) + '</button>' +
      '<button class="li-toggle" data-act="lock">' + lockIcon(o.locked) + '</button>';
    list.appendChild(div);
  }
}
$('layersList').addEventListener('click', e => {
  const item = e.target.closest('.layer-item');
  if (!item) return;
  const id = item.dataset.lid;
  const act = e.target.closest('[data-act]');
  if (act) {
    const o = getObj(id); if (!o) return;
    if (act.dataset.act === 'vis') { o.visible = !o.visible; }
    else { o.locked = !o.locked; }
    render();
    return;
  }
  if (e.shiftKey) {
    if (state.selectedIds.includes(id)) state.selectedIds = state.selectedIds.filter(x => x !== id);
    else state.selectedIds.push(id);
  } else {
    state.selectedIds = [id];
  }
  state.selNodes = [];
  render();
});
$('layersList').addEventListener('dblclick', e => {
  const item = e.target.closest('.layer-item');
  if (!item) return;
  const o = getObj(item.dataset.lid); if (!o) return;
  const name = prompt('Имя слоя:', o.name);
  if (name != null && name.trim()) { o.name = name.trim(); render(); }
});

/* ================= Панель свойств ================= */
function r1(v) { return Math.round((v || 0) * 10) / 10; }
function updateProperties() {
  const objs = selectedObjs();
  $('abW').value = state.artboard.width;
  $('abH').value = state.artboard.height;
  $('abBg').value = state.artboard.background;
  $('abBgHex').value = state.artboard.background;

  if (!objs.length) {
    $('grpSelection').style.display = 'none';
    $('noSelection').style.display = 'block';
    return;
  }
  $('grpSelection').style.display = 'block';
  $('noSelection').style.display = 'none';

  const one = objs[0];
  const b = objBounds(one);
  const multi = objs.length > 1;
  const mb = multi ? mergedBounds() : b;

  $('pX').value = r1(mb.x); $('pY').value = r1(mb.y);
  $('pW').value = r1(mb.width); $('pH').value = r1(mb.height);
  $('pW').disabled = multi; $('pH').disabled = multi;
  $('pRot').value = r1(one.rotation || 0);

  const fv = one.fill === 'none' ? '#ffffff' : one.fill;
  $('pFill').value = fv; $('pFillHex').value = fv;
  $('pFillOp').value = Math.round((one.fillOpacity != null ? one.fillOpacity : 1) * 100);
  $('pFillOpNum').value = $('pFillOp').value;
  const sv = one.stroke === 'none' ? '#000000' : one.stroke;
  $('pStroke').value = sv; $('pStrokeHex').value = sv;
  $('pStrokeW').value = one.strokeWidth || 0;
  $('pStrokeOp').value = Math.round((one.strokeOpacity != null ? one.strokeOpacity : 1) * 100);
  $('pStrokeOpNum').value = $('pStrokeOp').value;
  $('pDash').checked = !!one.strokeDash;
  $('pOpacity').value = Math.round((one.opacity != null ? one.opacity : 1) * 100);
  $('pOpacityNum').value = $('pOpacity').value;

  $('grpShape').style.display = one.type === 'rect' || one.type === 'polygon' || one.type === 'star' ? 'block' : 'none';
  $('rowRadius').style.display = one.type === 'rect' ? 'flex' : 'none';
  $('rowSides').style.display = one.type === 'polygon' || one.type === 'star' ? 'flex' : 'none';
  $('pRadius').value = one.rx || 0;
  $('pSides').value = one.sides || 5;
  $('pRatio').value = one.ratio != null ? one.ratio : 50;

  $('grpText').style.display = one.type === 'text' ? 'block' : 'none';
  $('pText').value = one.text || '';
  $('pFontSize').value = one.fontSize || 16;
  $('pFontFamily').value = one.fontFamily || 'Arial';
  $('pFontWeight').value = one.fontWeight || 'normal';
  $('pAlign').value = one.align || 'start';

  $('grpPath').style.display = one.type === 'path' ? 'block' : 'none';
  $('pNodeCount').textContent = 'Узлов: ' + (one.nodes ? one.nodes.length : 0);
  $('pPathClosed').textContent = one.closed ? 'Разомкнуть' : 'Замкнуть';
  $('pPathClosed').style.display = one.type === 'path' ? '' : 'none';
}

/* Привязка свойств */
function bindNum(id, applyFn) {
  const el = $(id);
  el.addEventListener('change', () => {
    const v = parseFloat(el.value);
    if (isNaN(v)) return;
    beginChange();
    applyFn(selectedObjs(), v);
    commitChange();
    render();
  });
}
function bindColorGroup(id, hexId, noneId, prop, opId, opNumId) {
  const col = $(id), hex = $(hexId), none = $(noneId), op = $(opId), opn = $(opNumId);
  const setColor = v => {
    beginChange();
    for (const o of selectedObjs()) o[prop] = v;
    renderCanvas();
  };
  col.addEventListener('input', () => { hex.value = col.value.toUpperCase(); setColor(col.value); });
  col.addEventListener('change', () => commitChange());
  hex.addEventListener('change', () => {
    const v = normalizeHex(hex.value);
    if (v) { col.value = v; setColor(v); }
    commitChange();
  });
  none.addEventListener('click', () => { setColor('none'); commitChange(); });
  op.addEventListener('input', () => { opn.value = op.value; beginChange(); for (const o of selectedObjs()) o[prop + 'Opacity'] = op.value / 100; renderCanvas(); });
  op.addEventListener('change', () => commitChange());
  opn.addEventListener('change', () => {
    const v = clamp(parseFloat(opn.value) || 100, 0, 100);
    op.value = v;
    beginChange();
    for (const o of selectedObjs()) o[prop + 'Opacity'] = v / 100;
    renderCanvas();
    commitChange();
  });
}

bindNum('pX', (objs, v) => {
  if (objs.length === 1) {
    const o = objs[0];
    if (o.type === 'path') translateObj(o, v - objBounds(o).x, 0);
    else o.x = v;
  } else { const d = v - mergedBounds().x; objs.forEach(o => translateObj(o, d, 0)); }
});
bindNum('pY', (objs, v) => {
  if (objs.length === 1) {
    const o = objs[0];
    if (o.type === 'path') translateObj(o, 0, v - objBounds(o).y);
    else o.y = v;
  } else { const d = v - mergedBounds().y; objs.forEach(o => translateObj(o, 0, d)); }
});
bindNum('pW', (objs, v) => {
  if (objs.length !== 1) return;
  const o = objs[0], b = objBounds(o);
  if (!b.width) return;
  applyBoundsTo(o, b.x, b.y, v, b.height);
});
bindNum('pH', (objs, v) => {
  if (objs.length !== 1) return;
  const o = objs[0], b = objBounds(o);
  if (!b.height) return;
  applyBoundsTo(o, b.x, b.y, b.width, v);
});
bindNum('pRot', (objs, v) => { objs.forEach(o => { if (o.type !== 'path') o.rotation = v; }); });

bindColorGroup('pFill', 'pFillHex', 'pFillNone', 'fill', 'pFillOp', 'pFillOpNum');
bindColorGroup('pStroke', 'pStrokeHex', 'pStrokeNone', 'stroke', 'pStrokeOp', 'pStrokeOpNum');

bindNum('pStrokeW', (objs, v) => objs.forEach(o => { o.strokeWidth = Math.max(0, v); }));
$('pDash').addEventListener('change', () => {
  beginChange();
  for (const o of selectedObjs()) o.strokeDash = $('pDash').checked ? '6 4' : null;
  commitChange();
  render();
});
$('pOpacity').addEventListener('input', () => {
  $('pOpacityNum').value = $('pOpacity').value;
  beginChange();
  for (const o of selectedObjs()) o.opacity = $('pOpacity').value / 100;
  renderCanvas();
});
$('pOpacity').addEventListener('change', () => commitChange());
$('pOpacityNum').addEventListener('change', () => {
  const v = clamp(parseFloat($('pOpacityNum').value) || 100, 0, 100);
  $('pOpacity').value = v;
  beginChange();
  for (const o of selectedObjs()) o.opacity = v / 100;
  renderCanvas();
  commitChange();
});

bindNum('pRadius', (objs, v) => objs.forEach(o => { if (o.type === 'rect') o.rx = Math.max(0, v); }));
bindNum('pSides', (objs, v) => objs.forEach(o => { if (o.type === 'polygon' || o.type === 'star') o.sides = Math.max(3, Math.round(v)); }));
bindNum('pRatio', (objs, v) => objs.forEach(o => { if (o.type === 'star') o.ratio = clamp(v, 5, 95); }));

$('pText').addEventListener('input', () => {
  beginChange();
  for (const o of selectedObjs()) if (o.type === 'text') o.text = $('pText').value;
  renderCanvas();
});
$('pText').addEventListener('change', () => commitChange());
bindNum('pFontSize', (objs, v) => objs.forEach(o => { if (o.type === 'text') o.fontSize = Math.max(1, v); }));
function bindSelect(id, fn) {
  $(id).addEventListener('change', () => { beginChange(); fn(selectedObjs(), $(id).value); commitChange(); render(); });
}
bindSelect('pFontFamily', (objs, v) => objs.forEach(o => { if (o.type === 'text') o.fontFamily = v; }));
bindSelect('pFontWeight', (objs, v) => objs.forEach(o => { if (o.type === 'text') o.fontWeight = v; }));
bindSelect('pAlign', (objs, v) => objs.forEach(o => { if (o.type === 'text') o.align = v; }));

$('pPathClosed').addEventListener('click', () => {
  const paths = selectedObjs().filter(o => o.type === 'path');
  if (!paths.length) return;
  beginChange();
  paths.forEach(o => { o.closed = !o.closed; });
  commitChange();
  render();
});
$('pNodeSmooth').addEventListener('click', () => {
  if (!state.selNodes.length) return;
  beginChange();
  for (const s of state.selNodes) {
    const o = getObj(s.id); if (!o || !o.nodes[s.index]) continue;
    const n = o.nodes[s.index];
    n.smooth = true;
    if (n.inX == null && n.outX == null) {
      const prev = o.nodes[(s.index - 1 + o.nodes.length) % o.nodes.length];
      const next = o.nodes[(s.index + 1) % o.nodes.length];
      if (prev) { n.inX = n.x + (prev.x - n.x) * 0.3; n.inY = n.y + (prev.y - n.y) * 0.3; }
      if (next) { n.outX = n.x + (next.x - n.x) * 0.3; n.outY = n.y + (next.y - n.y) * 0.3; }
    } else if (n.inX == null && n.outX != null) { n.inX = n.x - (n.outX - n.x); n.inY = n.y - (n.outY - n.y); }
    else if (n.outX == null && n.inX != null) { n.outX = n.x - (n.inX - n.x); n.outY = n.y - (n.inY - n.y); }
  }
  commitChange();
  render();
});
$('pNodeCorner').addEventListener('click', () => {
  if (!state.selNodes.length) return;
  beginChange();
  for (const s of state.selNodes) { const o = getObj(s.id); if (o && o.nodes[s.index]) o.nodes[s.index].smooth = false; }
  commitChange();
  render();
});
$('pNodeDelete').addEventListener('click', deleteSelectedNodes);

$('pDup').addEventListener('click', duplicateSelected);
$('pDel').addEventListener('click', deleteSelected);

/* Артборд */
bindNum('abW', () => { state.artboard.width = Math.max(10, parseInt($('abW').value) || 10); updateWorldTransform(); });
bindNum('abH', () => { state.artboard.height = Math.max(10, parseInt($('abH').value) || 10); updateWorldTransform(); });
$('abBg').addEventListener('input', () => { state.artboard.background = $('abBg').value; $('abBgHex').value = $('abBg').value.toUpperCase(); renderCanvas(); });
$('abBg').addEventListener('change', () => pushHistory());
$('abBgHex').addEventListener('change', () => {
  const v = normalizeHex($('abBgHex').value);
  if (v) { state.artboard.background = v; $('abBg').value = v; renderCanvas(); pushHistory(); }
});

/* ================= Статус / зум ================= */
function updateStatus() {
  $('stTool').textContent = TOOL_NAMES[state.tool] || '';
  $('stCount').textContent = state.selectedIds.length ? 'Выбрано: ' + state.selectedIds.length : '';
  $('stZoom').textContent = Math.round(state.zoom * 100) + '%';
  $('zoomLabel').textContent = Math.round(state.zoom * 100) + '%';
}
function updateStatusCursor(p) {
  if (p) $('stCursor').textContent = Math.round(p.x) + ', ' + Math.round(p.y);
}
function updateHistoryButtons() {
  $('btnUndo').disabled = state.historyIndex <= 0;
  $('btnRedo').disabled = state.historyIndex >= state.history.length - 1;
}
let flashTimer = null;
function statusFlash(msg) {
  $('stCount').textContent = msg;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => { $('stCount').textContent = state.selectedIds.length ? 'Выбрано: ' + state.selectedIds.length : ''; }, 1800);
}
function zoomBy(factor) {
  const r = viewport.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const doc = screenToDoc(cx, cy);
  state.zoom = clamp(state.zoom * factor, 0.05, 64);
  state.pan.x = cx - r.left - doc.x * state.zoom;
  state.pan.y = cy - r.top - doc.y * state.zoom;
  updateWorldTransform();
  render();
}
function fitView() {
  const r = viewport.getBoundingClientRect();
  const aw = state.artboard.width + 100, ah = state.artboard.height + 100;
  state.zoom = clamp(Math.min(r.width / aw, r.height / ah), 0.05, 4);
  state.pan.x = (r.width - state.artboard.width * state.zoom) / 2;
  state.pan.y = (r.height - state.artboard.height * state.zoom) / 2;
  updateWorldTransform();
  render();
}

function setTool(t) {
  if (state.pen && t !== 'pen') cancelPen();
  state.tool = t;
  state.selNodes = [];
  document.querySelectorAll('#toolbar .tool-btn').forEach(b => b.classList.toggle('active', b.dataset.tool === t));
  viewport.style.cursor = CURSORS[t] || 'default';
  render();
}
function updateCursor(p) {
  const r = world.getBoundingClientRect();
  const sx = r.left + p.x * state.zoom, sy = r.top + p.y * state.zoom;
  const el = document.elementFromPoint(sx, sy);
  if (el && el.dataset && el.dataset.handle) viewport.style.cursor = 'crosshair';
  else viewport.style.cursor = 'default';
}

/* ================= Сохранение / открытие ================= */
function openSaveModal() {
  $('saveName').value = state.projectName;
  loadProjectList($('saveList'), true);
  showModal('saveModal');
}
function openOpenModal() {
  loadProjectList($('openList'), false);
  showModal('openModal');
}
function loadProjectList(container, isSave) {
  fetch('/api/projects').then(r => r.json()).then(list => {
    container.innerHTML = '';
    const empty = container.parentNode.querySelector('.modal-empty');
    empty.style.display = list.length ? 'none' : 'block';
    for (const pr of list) {
      const div = document.createElement('div');
      div.className = 'project-row';
      const meta = document.createElement('span');
      meta.className = 'pr-date';
      meta.textContent = new Date(pr.modified).toLocaleString('ru-RU');
      const nm = document.createElement('span');
      nm.className = 'pr-name';
      nm.textContent = pr.name;
      const del = document.createElement('button');
      del.className = 'pr-del'; del.textContent = '✕';
      del.addEventListener('click', ev => {
        ev.stopPropagation();
        if (confirm('Удалить проект "' + pr.name + '"?')) {
          fetch('/api/projects/' + encodeURIComponent(pr.name), { method: 'DELETE' })
            .then(() => loadProjectList(container, isSave));
        }
      });
      div.appendChild(nm); div.appendChild(meta); div.appendChild(del);
      div.addEventListener('click', () => {
        if (isSave) $('saveName').value = pr.name;
        else { openProject(pr.name); hideModal('openModal'); }
      });
      container.appendChild(div);
    }
  }).catch(() => {});
}
function openProject(name) {
  fetch('/api/projects/' + encodeURIComponent(name))
    .then(r => r.json())
    .then(data => {
      state.objects = data.objects || [];
      if (data.artboard) state.artboard = data.artboard;
      state.projectName = name;
      state.selectedIds = []; state.selNodes = [];
      cancelChange();
      pushHistory();
      fitView();
      statusFlash('Открыт: ' + name);
    })
    .catch(() => alert('Не удалось открыть проект'));
}
function saveProject() {
  const name = $('saveName').value.trim();
  if (!name) { alert('Введите имя проекта'); return; }
  const data = { artboard: state.artboard, objects: state.objects };
  fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, data: data }),
  })
    .then(r => r.json())
    .then(() => { state.projectName = name; hideModal('saveModal'); statusFlash('Сохранено: ' + name); })
    .catch(() => alert('Ошибка сохранения'));
}
$('saveConfirm').addEventListener('click', saveProject);

function openNewModal() {
  $('newW').value = state.artboard.width;
  $('newH').value = state.artboard.height;
  showModal('newModal');
}
$('newConfirm').addEventListener('click', () => {
  const w = Math.max(10, parseInt($('newW').value) || 10);
  const h = Math.max(10, parseInt($('newH').value) || 10);
  state.objects = [];
  state.selectedIds = []; state.selNodes = [];
  state.artboard = { width: w, height: h, background: '#ffffff' };
  state.projectName = 'untitled';
  cancelChange();
  pushHistory();
  fitView();
  hideModal('newModal');
  statusFlash('Новый документ');
});

function showModal(id) {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('show'));
  $(id).classList.add('show');
}
function hideModal(id) { $(id).classList.remove('show'); }
document.querySelectorAll('[data-close]').forEach(b => {
  b.addEventListener('click', e => hideModal(e.target.closest('.modal-overlay').id));
});
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('show'); });
});
$('saveName').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveProject(); } });

/* ================= Экспорт ================= */
function buildExportSvg() {
  const w = state.artboard.width, h = state.artboard.height;
  let s = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">';
  s += '<rect width="' + w + '" height="' + h + '" fill="' + state.artboard.background + '"/>';
  const ser = new XMLSerializer();
  for (const o of state.objects) {
    if (!o.visible) continue;
    s += ser.serializeToString(buildEl(o));
  }
  s += '</svg>';
  return s;
}
function download(filename, content, mime) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function exportSvg() {
  download('project.svg', buildExportSvg(), 'image/svg+xml');
}
function exportPng() {
  const w = state.artboard.width, h = state.artboard.height;
  const scale = 2;
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = w * scale; canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, w, h);
    canvas.toBlob(b => download('project.png', b, 'image/png'), 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(buildExportSvg());
}

/* ================= Клавиатура ================= */
window.addEventListener('keydown', e => {
  const inField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT';
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && inField && (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'y')) return;
  if (ctrl) {
    const k = e.key.toLowerCase();
    if (k === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
    if (k === 'y') { e.preventDefault(); redo(); return; }
    if (k === 's') { e.preventDefault(); openSaveModal(); return; }
    if (k === 'o') { e.preventDefault(); openOpenModal(); return; }
    if (k === 'd') { e.preventDefault(); duplicateSelected(); return; }
    if (k === 'c') { e.preventDefault(); copySelected(); return; }
    if (k === 'v') { e.preventDefault(); paste(); return; }
    if (k === 'a') { e.preventDefault(); selectAll(); return; }
    if (k === 'n') { e.preventDefault(); openNewModal(); return; }
    if (k === '=' || k === '+') { e.preventDefault(); zoomBy(1.2); return; }
    if (k === '-') { e.preventDefault(); zoomBy(1 / 1.2); return; }
    if (k === '0') { e.preventDefault(); fitView(); return; }
    return;
  }
  if (inField) return;
  const tk = { v: 'select', a: 'node', p: 'pen', r: 'rect', e: 'ellipse', l: 'line', o: 'polygon', s: 'star', t: 'text', h: 'hand' };
  const k = e.key.toLowerCase();
  if (tk[k]) { setTool(tk[k]); return; }
  if (e.key === ' ') { state.spacePressed = true; viewport.style.cursor = 'grab'; return; }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    if (state.tool === 'node' && state.selNodes.length) deleteSelectedNodes();
    else deleteSelected();
    return;
  }
  if (e.key === 'Enter' && state.pen) { e.preventDefault(); finishPen(false); return; }
  if (e.key === 'Escape') {
    if (state.pen) cancelPen();
    else { state.selectedIds = []; state.selNodes = []; render(); }
    return;
  }
  if (e.key === ']') { toFront(); return; }
  if (e.key === '[') { toBack(); return; }
  if (e.key.startsWith('Arrow') && state.selectedIds.length) {
    e.preventDefault();
    beginChange();
    clearTimeout(state.nudgeTimer);
    state.nudgeTimer = setTimeout(() => { commitChange(); }, 500);
    const d = e.shiftKey ? 10 : 1;
    const dx = e.key === 'ArrowRight' ? d : e.key === 'ArrowLeft' ? -d : 0;
    const dy = e.key === 'ArrowDown' ? d : e.key === 'ArrowUp' ? -d : 0;
    for (const o of selectedObjs()) translateObj(o, dx, dy);
    render();
  }
});
window.addEventListener('keyup', e => {
  if (e.key === ' ') { state.spacePressed = false; viewport.style.cursor = CURSORS[state.tool] || 'default'; }
});

/* ================= Мышь / зум ================= */
viewport.addEventListener('pointerdown', onDown);
window.addEventListener('pointermove', onMove);
window.addEventListener('pointerup', onUp);
viewport.addEventListener('wheel', e => {
  e.preventDefault();
  const doc = screenToDoc(e.clientX, e.clientY);
  const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
  state.zoom = clamp(state.zoom * factor, 0.05, 64);
  state.pan.x = e.clientX - viewport.getBoundingClientRect().left - doc.x * state.zoom;
  state.pan.y = e.clientY - viewport.getBoundingClientRect().top - doc.y * state.zoom;
  updateWorldTransform();
  render();
}, { passive: false });
viewport.addEventListener('dblclick', e => {
  if (state.pen) {
    e.preventDefault();
    if (state.pen.nodes.length && Date.now() - (state.pen.lastAdd || 0) < 400) state.pen.nodes.pop();
    finishPen(false);
  }
});

/* ================= Кнопки ================= */
function bindToolbar() {
  document.querySelectorAll('#toolbar .tool-btn').forEach(b => b.addEventListener('click', () => setTool(b.dataset.tool)));
  $('btnNew').addEventListener('click', openNewModal);
  $('btnOpen').addEventListener('click', openOpenModal);
  $('btnSave').addEventListener('click', openSaveModal);
  $('btnUndo').addEventListener('click', undo);
  $('btnRedo').addEventListener('click', redo);
  $('btnExportSvg').addEventListener('click', exportSvg);
  $('btnExportPng').addEventListener('click', exportPng);
  $('btnZoomIn').addEventListener('click', () => zoomBy(1.2));
  $('btnZoomOut').addEventListener('click', () => zoomBy(1 / 1.2));
  $('btnZoomFit').addEventListener('click', fitView);
  $('chkGrid').addEventListener('change', () => { state.showGrid = $('chkGrid').checked; render(); });
  $('chkSnap').addEventListener('change', () => { state.snap = $('chkSnap').checked; });
  $('btnAddLayer').addEventListener('click', () => {
    beginChange();
    const o = makeObject('rect', { x: 100, y: 100, width: 120, height: 80, rx: 4, fill: '#7b8cff', stroke: '#5a6bff', strokeWidth: 2 });
    state.objects.push(o);
    state.selectedIds = [o.id]; state.selNodes = [];
    commitChange();
    render();
  });
  $('btnToFront').addEventListener('click', toFront);
  $('btnToBack').addEventListener('click', toBack);
  $('btnForward').addEventListener('click', () => moveLayer(1));
  $('btnBackward').addEventListener('click', () => moveLayer(-1));
  $('btnDupLayer').addEventListener('click', duplicateSelected);
}

/* ================= Инициализация ================= */
function addObj(o, select) {
  o.name = defaultName(o);
  state.objects.push(o);
  if (select) { state.selectedIds = [o.id]; state.selNodes = []; }
  return o;
}
function initDemo() {
  addObj(makeObject('rect', { x: 100, y: 80, width: 240, height: 160, rx: 10, fill: '#4a5cff', stroke: '#3a4ae0', strokeWidth: 2 }));
  addObj(makeObject('ellipse', { x: 420, y: 80, width: 160, height: 160, fill: '#ff5d8f', stroke: 'none', strokeWidth: 0 }));
  addObj(makeObject('star', { x: 660, y: 80, width: 160, height: 160, sides: 5, ratio: 50, startAngle: -90, fill: '#ffd166', stroke: 'none', strokeWidth: 0 }));
  addObj(makeObject('text', { x: 100, y: 300, text: 'Привет!\nЭто Vector Studio', fontSize: 44, fontFamily: 'Arial', fontWeight: 'bold', fill: '#2b2d33', stroke: 'none', strokeWidth: 0 }));
  addObj(makeObject('path', { closed: false, fill: 'none', stroke: '#06d6a0', strokeWidth: 3, nodes: [
    { x: 100, y: 480, inX: null, inY: null, outX: null, outY: null, smooth: false },
    { x: 220, y: 420, inX: null, inY: null, outX: null, outY: null, smooth: false },
    { x: 340, y: 520, inX: null, inY: null, outX: null, outY: null, smooth: false },
  ] }));
  addObj(makeObject('path', { closed: true, fill: '#a78bfa', stroke: '#7c6ff0', strokeWidth: 2, nodes: [
    { x: 560, y: 440, smooth: true, inX: 525, inY: 455, outX: 600, outY: 410 },
    { x: 680, y: 470, smooth: true, inX: 640, inY: 470, outX: 710, outY: 485 },
    { x: 640, y: 560, smooth: true, inX: 670, inY: 540, outX: 610, outY: 570 },
    { x: 560, y: 530, smooth: true, inX: 575, inY: 545, outX: 540, outY: 520 },
  ] }));
}
function init() {
  initDemo();
  pushHistory();
  bindToolbar();
  setTool('select');
  updateWorldTransform();
  fitView();
  render();
}
init();

})();
