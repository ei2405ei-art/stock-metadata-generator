"use strict";
/*
 * Локальный helper-сервер для автозаполнения Adobe Stock.
 * Отдаёт metadata-index.json (записанный batch-keyworder.html) по имени файла.
 * Первый запуск: показывает диалог выбора рабочей папки, запоминает её в server-config.json.
 * Смена папки: node server.js setup
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const PORT = 8787;
const CFG_PATH = path.join(__dirname, "server-config.json");

function log(msg){ console.log("[helper] " + msg); }

function loadCfg(){
  try{ return JSON.parse(fs.readFileSync(CFG_PATH, "utf8")); }catch(e){ return null; }
}
function saveCfg(cfg){
  fs.writeFileSync(CFG_PATH, JSON.stringify(cfg, null, 2), "utf8");
}

function pickFolderDialog(){
  const ps = [
    "Add-Type -AssemblyName System.Windows.Forms",
    "$d = New-Object System.Windows.Forms.FolderBrowserDialog",
    "$d.Description = 'Выберите рабочую папку: там лежат изображения и подпапка *_metadata'",
    "if ($d.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $d.SelectedPath }"
  ].join("; ");
  return new Promise(resolve => {
    execFile("powershell", ["-NoProfile", "-STA", "-Command", ps], {timeout: 120000}, (err, stdout) => {
      if(err) return resolve(null);
      resolve(String(stdout || "").trim() || null);
    });
  });
}

function findIndexFile(folder){
  const direct = path.join(folder, "metadata-index.json");
  if(fs.existsSync(direct)) return direct;
  let items = [];
  try{ items = fs.readdirSync(folder, {withFileTypes: true}); }catch(e){ return null; }
  for(const d of items){
    if(!d.isDirectory()) continue;
    const p = path.join(folder, d.name, "metadata-index.json");
    if(fs.existsSync(p)) return p;
  }
  return null;
}

function loadIndex(){
  const cfg = loadCfg();
  if(!cfg || !cfg.folder) return {err: "Папка не настроена — запустите start.bat заново"};
  if(!fs.existsSync(cfg.folder)) return {err: "Папка не найдена: " + cfg.folder + " — запустите node server.js setup"};
  const file = findIndexFile(cfg.folder);
  if(!file) return {err: "metadata-index.json не найден в " + cfg.folder + " — сначала сгенерируйте метаданные в приложении"};
  try{
    return {data: JSON.parse(fs.readFileSync(file, "utf8")), file, folder: cfg.folder};
  }catch(e){
    return {err: "metadata-index.json повреждён: " + e.message};
  }
}

function lookupIndex(data, rawName){
  const files = data.files || {};
  let name = String(rawName || "").replace(/\\/g, "/").split("/").pop().trim();
  try{ name = decodeURIComponent(name); }catch(e){}
  if(!name) return null;
  if(files[name]) return files[name];
  const lower = name.toLowerCase();
  for(const k in files){
    if(k.toLowerCase() === lower) return files[k];
  }
  // возможно, грузится _meta-копия, а в индексе только оригинал (или наоборот)
  if(/_meta\.[a-z0-9]+$/.test(lower)){
    const orig = lower.replace(/_meta(\.[a-z0-9]+)$/, "$1");
    for(const k in files) if(k.toLowerCase() === orig) return files[k];
  }else{
    const meta = lower.replace(/(\.[a-z0-9]+)$/, "_meta$1");
    for(const k in files) if(k.toLowerCase() === meta) return files[k];
  }
  return null;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Access-Control-Request-Private-Network",
  "Access-Control-Allow-Private-Network": "true"
};

function send(res, code, payload){
  const isStr = typeof payload === "string";
  res.writeHead(code, Object.assign({
    "Content-Type": isStr ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  }, CORS));
  res.end(isStr ? payload : JSON.stringify(payload));
}

/*
 * Релей к Ollama: запросы браузера идут на /ollama/<...> и проксируются в http://127.0.0.1:11434/<...>.
 * Зачем: браузер обрывает «молчащее» соединение к Ollama, пока модель считает ответ (на слабом CPU это 1-2 мин).
 * Релей сразу открывает ответ и раз в 5 с шлёт пробел — соединение не рвётся. Пробелы перед JSON безвредны (JSON.parse их игнорирует).
 */
function proxyOllama(req, res, u){
  const targetPath = (u.pathname.slice("/ollama".length) || "/") + (u.search || "");
  const chunks = [];
  req.on("data", c => chunks.push(c));
  req.on("end", () => {
    const bodyBuf = Buffer.concat(chunks);
    let headersSent = false, iv = null;
    const upHeaders = { "Content-Type": req.headers["content-type"] || "application/json" };
    const preq = http.request({ host: "127.0.0.1", port: 11434, path: targetPath, method: req.method, headers: upHeaders }, pres => {
      if(headersSent){
        const parts = [];
        pres.on("data", c => parts.push(c));
        pres.on("end", () => { if(iv) clearInterval(iv); try{ res.end(Buffer.concat(parts)); }catch(e){} });
        pres.on("error", () => { if(iv) clearInterval(iv); try{ res.end(); }catch(e){} });
      }else{
        headersSent = true;
        res.writeHead(pres.statusCode || 200, Object.assign({
          "Content-Type": pres.headers["content-type"] || "application/json; charset=utf-8",
          "Cache-Control": "no-store"
        }, CORS));
        pres.pipe(res);
      }
    });
    preq.on("error", err => {
      if(iv) clearInterval(iv);
      if(!headersSent && !res.headersSent){
        headersSent = true;
        try{ send(res, 502, { error: "Ollama недоступна: " + err.message }); }catch(e){}
      }else{
        try{ res.end(JSON.stringify({ error: "Ollama: " + err.message })); }catch(e){}
      }
    });
    setTimeout(() => {
      if(headersSent || res.headersSent) return;
      headersSent = true;
      res.writeHead(200, Object.assign({
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }, CORS));
      iv = setInterval(() => { try{ res.write(" "); }catch(e){} }, 5000);
    }, 300);
    if(bodyBuf.length) preq.write(bodyBuf);
    preq.end();
  });
}

const server = http.createServer((req, res) => {
  try{
    const u = new URL(req.url, "http://localhost:" + PORT);
    if(req.method === "OPTIONS") return send(res, 204, "");

    if(u.pathname === "/health"){
      const idx = loadIndex();
      return send(res, idx.err ? 200 : 200, {
        ok: true,
        folder: idx.folder || null,
        index: idx.file || null,
        count: idx.data ? Object.keys(idx.data.files || {}).length : 0,
        note: idx.err || null
      });
    }

    if(u.pathname === "/meta"){
      const file = u.searchParams.get("file");
      if(!file) return send(res, 400, {error: "нет параметра ?file=имя.jpg"});
      const idx = loadIndex();
      if(idx.err) return send(res, 503, {error: idx.err});
      const hit = lookupIndex(idx.data, file);
      if(!hit) return send(res, 404, {error: "для файла «" + file + "» метаданные не найдены"});
      return send(res, 200, hit);
    }

    if(u.pathname === "/list"){
      const idx = loadIndex();
      if(idx.err) return send(res, 503, {error: idx.err});
      return send(res, 200, {files: Object.keys(idx.data.files || {})});
    }

    if(u.pathname === "/ollama" || u.pathname.startsWith("/ollama/")){
      return proxyOllama(req, res, u);
    }

    return send(res, 404, {error: "неизвестный путь. Рабочие: /health, /meta?file=..., /list, /ollama/*"});
  }catch(e){
    return send(res, 500, {error: String(e && e.message || e)});
  }
});

(async () => {
  const forceSetup = process.argv.includes("setup");
  let cfg = forceSetup ? null : loadCfg();
  if(cfg && cfg.folder && fs.existsSync(cfg.folder)){
    log("Папка: " + cfg.folder);
  }else{
    log("Папка для Adobe Stock не настроена — открою диалог (можно отменить: релей Ollama работает и без папки)...");
    const folder = await pickFolderDialog();
    if(folder){
      saveCfg({folder});
      log("Папка сохранена: " + folder);
    }else{
      log("Папка не выбрана — доступны /health и /ollama/* (релей к Ollama).");
    }
  }
  server.listen(PORT, "127.0.0.1", () => {
    log("Работает: http://localhost:" + PORT + " — окно нужно держать открытым");
    log("Ollama-релей: http://localhost:" + PORT + "/ollama  (обход обрыва соединения)");
    log("Проверка: http://localhost:" + PORT + "/health");
  });
})();
