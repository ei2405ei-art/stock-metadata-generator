/* phone-server.js — локальный сервер для телефона (zero dependencies).
   Запуск: двойной клик по «запуск-для-телефона.bat».
   Откройте напечатанный адрес http://192.168.x.x:8080/ в браузере телефона
   (телефон и ПК должны быть в одной Wi-Fi-сети). */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = __dirname;
const FIRST_PORT = 8080;
const MAX_PORT = 8090;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".mp4": "video/mp4"
};

function safePath(urlPath) {
  let p = decodeURIComponent(urlPath.split("?")[0]);
  if (p === "/") p = "/stock-topics-prompts.html";
  const abs = path.normalize(path.join(ROOT, p));
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) return null;
  return abs;
}

const server = http.createServer((req, res) => {
  const abs = safePath(req.url || "/");
  if (!abs) {
    res.writeHead(403);
    return res.end("403 Forbidden");
  }
  fs.readFile(abs, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("404 Not Found");
    }
    const type = MIME[path.extname(abs).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    res.end(data);
  });
});

function lanAddresses() {
  const out = [];
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) out.push(net.address);
    }
  }
  return out;
}

function listen(port) {
  server.once("error", (e) => {
    if (e.code === "EADDRINUSE" && port < MAX_PORT) listen(port + 1);
    else {
      console.error("Не удалось запустить сервер: " + e.message);
      process.exit(1);
    }
  });
  server.listen(port, "0.0.0.0", () => {
    console.log("");
    console.log("  Stock Topics & Prompts — локальный сервер запущен");
    console.log("  Телефон и ПК: одна Wi-Fi-сеть. Откройте в браузере телефона:");
    console.log("");
    const ips = lanAddresses();
    if (!ips.length) {
      console.log("    http://localhost:" + port + "/   (IP в локальной сети не найден)");
    } else {
      for (const ip of ips) console.log("    http://" + ip + ":" + port + "/");
    }
    console.log("");
    console.log("  Остановить: закройте это окно (или Ctrl+C).");
    console.log("");
  });
}

listen(FIRST_PORT);
