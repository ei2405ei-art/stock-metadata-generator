/* make-screenshots.js — снимает скриншоты приложения headless Edge.
   Запуск: node tools/make-screenshots.js
   Без зависимостей: child_process + встроенный WebSocket (CDP).
   Результат: ../screenshots/*.png */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const path = require("path");
const os = require("os");

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const CDP_PORT = 9444;
const APP_URL = encodeURI("file:///" + path.join(__dirname, "..", "stock-topics-prompts.html").replace(/\\/g, "/"));
const OUT_DIR = path.join(__dirname, "..", "screenshots");
const PROFILE = path.join(os.tmpdir(), "edge-shot-profile");

/* сцены: name, width, height, mobile, scale, scroll(sel,offset), steps[] */
const SCENES = [
  { name: "themes-desktop", width: 1440, height: 1000, scale: 1, scroll: null, steps: [] },
  { name: "grid-desktop", width: 1440, height: 1000, scale: 1, scroll: { sel: "#grid-out", offset: 0 },
    steps: ["#tabs .tab[data-tab=\"grid\"]", "#g-run"] },
  { name: "export-desktop", width: 1440, height: 1000, scale: 1, scroll: { sel: "#bp-out", offset: 0 },
    steps: ["#tabs .tab[data-tab=\"grid\"]", "#g-run", "#g-to-plan", "#tabs .tab[data-tab=\"export\"]", "#bp-run"] },
  { name: "themes-mobile", width: 390, height: 844, scale: 2, mobile: true, scroll: null, steps: [] },
  { name: "grid-mobile", width: 390, height: 844, scale: 2, mobile: true, scroll: { sel: "#grid-out", offset: 56 },
    steps: ["#tabs .tab[data-tab=\"grid\"]", "#g-run"] }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => { try { resolve(JSON.parse(d)) } catch (e) { reject(e) } });
    }).on("error", reject);
  });
}

async function waitForCdp() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await getJson("http://127.0.0.1:" + CDP_PORT + "/json/list");
      const page = list.find(t => t.type === "page");
      if (page && page.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch (e) { /* ещё не поднялся */ }
    await sleep(200);
  }
  throw new Error("CDP не поднялся за 10 с");
}

function connect(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.method + ": " + msg.error.message));
      else resolve(msg.result);
    }
  });
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });
  const send = async (method, params) => {
    await ready;
    const mid = ++id;
    const p = new Promise((resolve, reject) => pending.set(mid, { resolve, reject }));
    ws.send(JSON.stringify({ id: mid, method, params: params || {} }));
    return p;
  };
  return { send, close: () => ws.close() };
}

async function main() {
  if (!fs.existsSync(EDGE)) throw new Error("Edge не найден: " + EDGE);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const child = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=" + CDP_PORT, "--user-data-dir=" + PROFILE,
    "about:blank"
  ], { stdio: "ignore", detached: false });

  try {
    const wsUrl = await waitForCdp();
    const cdp = connect(wsUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");

    for (const sc of SCENES) {
      await cdp.send("Emulation.setDeviceMetricsOverride", {
        width: sc.width, height: sc.height,
        deviceScaleFactor: sc.scale, mobile: !!sc.mobile
      });
      await cdp.send("Page.navigate", { url: APP_URL });
      // ждём полной загрузки
      for (let i = 0; i < 60; i++) {
        const r = await cdp.send("Runtime.evaluate", { expression: "document.readyState" });
        if (r.result.value === "complete") break;
        await sleep(100);
      }
      await sleep(600); // отрисовка + инициализация

      for (const sel of sc.steps) {
        const expr = "(async()=>{const el=document.querySelector(" + JSON.stringify(sel) +
          ");if(!el)return 'missing';el.click();await new Promise(r=>setTimeout(r,450));return 'ok'})()";
        const r = await cdp.send("Runtime.evaluate", { expression: expr, awaitPromise: true });
        if (r.result.value !== "ok") console.log("  [" + sc.name + "] шаг не выполнен: " + sel);
      }

      if (sc.scroll) {
        const expr = "(async()=>{const el=document.querySelector(" + JSON.stringify(sc.scroll.sel) +
          ");if(!el)return 'missing';el.scrollIntoView({block:'start'});window.scrollBy(0,-" + sc.scroll.offset +
          ");await new Promise(r=>setTimeout(r,250));return 'ok'})()";
        await cdp.send("Runtime.evaluate", { expression: expr, awaitPromise: true });
      }

      const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
      const file = path.join(OUT_DIR, sc.name + ".png");
      fs.writeFileSync(file, Buffer.from(shot.data, "base64"));
      const kb = Math.round(fs.statSync(file).size / 1024);
      console.log(sc.name + ".png — " + sc.width + "x" + sc.height + (sc.mobile ? " @2x" : "") + ", " + kb + " КБ");
    }
    cdp.close();
  } finally {
    try { child.kill() } catch (e) { /* уже убит */ }
  }
  console.log("Готово: " + OUT_DIR);
}

main().catch(e => { console.error(e.message); process.exit(1) });
