const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.static(path.join(__dirname)));

function proxyFetch(targetUrl, req, res) {
  const fwdHeaders = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (k === 'host' || k === 'origin' || k === 'referer' || k === 'connection') continue;
    fwdHeaders[k] = v;
  }

  const opts = { method: req.method, headers: fwdHeaders };
  if (req.body && Object.keys(req.body).length > 0) {
    opts.body = JSON.stringify(req.body);
  }

  const ts = new Date().toISOString().substring(11, 23);
  const bodyPreview = req.body ? JSON.stringify(req.body).substring(0, 300) : '';
  const bodyLen = req.body ? JSON.stringify(req.body).length : 0;
  console.log(`\n[${ts}] → ${req.method} ${targetUrl} (${bodyLen} bytes)`);
  if (bodyPreview) console.log(`  Body: ${bodyPreview}...`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000);
  opts.signal = controller.signal;

  fetch(targetUrl, opts)
    .then(async (upstream) => {
      clearTimeout(timeout);
      const ct = upstream.headers.get('content-type') || 'application/json';
      res.status(upstream.status).set('Content-Type', ct);

      if (ct.includes('application/json')) {
        const json = await upstream.json();
        console.log(`[${ts}] ← ${upstream.status} ${JSON.stringify(json).substring(0, 300)}`);
        res.json(json);
      } else {
        const buf = await upstream.arrayBuffer();
        console.log(`[${ts}] ← ${upstream.status} [${ct}] ${buf.byteLength} bytes`);
        res.send(Buffer.from(buf));
      }
    })
    .catch((err) => {
      clearTimeout(timeout);
      console.error(`[${ts}] ✗ FETCH ERROR: ${err.message}`);
      console.error(`  URL: ${targetUrl}`);
      if (err.cause) console.error(`  Cause: ${JSON.stringify(err.cause)}`);
      console.error(`  Stack: ${err.stack}`);
      if (!res.headersSent) {
        res.status(502).json({ error: err.message, cause: err.cause?.message });
      }
    });
}

// Grok (xAI)
app.all('/api/grok/*', (req, res) => {
  const subpath = req.params[0];
  proxyFetch(`https://api.x.ai/v1/videos/${subpath}`, req, res);
});

// Kling AI
app.all('/api/kling/*', (req, res) => {
  const subpath = req.params[0];
  proxyFetch(`https://api.kling.ai/v1/videos/${subpath}`, req, res);
});

// Google Veo (v1beta with predictLongRunning)
app.all('/api/veo/*', (req, res) => {
  const subpath = req.params[0];
  proxyFetch(`https://generativelanguage.googleapis.com/v1beta/${subpath}`, req, res);
});

// Fal.ai
app.all('/api/fal/*', (req, res) => {
  const subpath = req.params[0];
  proxyFetch(`https://queue.fal.run/fal-ai/${subpath}`, req, res);
});

// Generic proxy for downloading video blobs (Veo, etc.)
app.post('/api/proxy-download', (req, res) => {
  const { url, headers } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });
  proxyFetch(url, { method: 'GET', headers: headers || {} }, res);
});

app.listen(PORT, () => {
  console.log(`\n  AI Video Studio server running:`);
  console.log(`  http://localhost:${PORT}/video-generator.html\n`);
});

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught:', err.message);
});
process.on('unhandledRejection', (err) => {
  console.error('[FATAL] Unhandled:', err);
});
