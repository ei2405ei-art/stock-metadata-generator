const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const PROJECTS_DIR = path.join(__dirname, 'projects');

if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true });

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function safeName(name) {
  return String(name || '')
    .replace(/[^a-zA-Zа-яА-ЯёЁ0-9 _\-().\[\]]/g, '')
    .trim();
}

app.get('/api/projects', (req, res) => {
  try {
    const list = [];
    for (const f of fs.readdirSync(PROJECTS_DIR)) {
      if (!f.endsWith('.json')) continue;
      const p = path.join(PROJECTS_DIR, f);
      const st = fs.statSync(p);
      list.push({ name: path.basename(f, '.json'), size: st.size, modified: st.mtime });
    }
    list.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/projects', (req, res) => {
  try {
    const name = safeName(req.body.name);
    if (!name) return res.status(400).json({ error: 'Некорректное имя проекта' });
    const file = path.join(PROJECTS_DIR, name + '.json');
    fs.writeFileSync(file, JSON.stringify(req.body.data, null, 2));
    res.json({ ok: true, name });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/projects/:name', (req, res) => {
  try {
    const name = safeName(req.params.name);
    const file = path.join(PROJECTS_DIR, name + '.json');
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Проект не найден' });
    res.json(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.delete('/api/projects/:name', (req, res) => {
  try {
    const name = safeName(req.params.name);
    const file = path.join(PROJECTS_DIR, name + '.json');
    if (fs.existsSync(file)) fs.unlinkSync(file);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log('Vector Studio запущен: http://localhost:' + PORT);
});
