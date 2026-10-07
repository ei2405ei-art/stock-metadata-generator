// ==UserScript==
// @name         Adobe Stock — авто-заполнение метаданных (batch-keyworder)
// @namespace    batch-keyworder
// @version      1.0.0
// @description  Подтягивает заголовок и ключи с локального helper-сервера (localhost:8787) и заполняет форму загрузки на Adobe Stock
// @match        https://stock.adobe.com/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @run-at       document-idle
// @noframes
// ==/UserScript==

(function(){
  "use strict";

  const SERVER = "http://localhost:8787";
  const FILE_RE = /\S[^<>()"\\]*?\.(?:jpe?g|png|webp|tiff?|gif|heic|mp4|mov|m4v)\b/i;

  const done = new Map();      // имя файла → {ok, at}
  let last = null;             // последние заполненные метаданные
  let serverOk = null;

  /* ---------- утилиты ---------- */

  function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

  function httpGet(url){
    return new Promise((resolve, reject) => {
      if(typeof GM_xmlhttpRequest === "function"){
        GM_xmlhttpRequest({method:"GET", url, timeout:5000, onload:r => {
          if(r.status >= 200 && r.status < 300) resolve(r.responseText);
          else reject(new Error("HTTP " + r.status));
        }, onerror:e => reject(new Error(String(e && e.statusText || "network")))});
      }else{
        fetch(url).then(r => r.ok ? r.text() : Promise.reject(new Error("HTTP " + r.status))).then(resolve, reject);
      }
    });
  }

  function visible(el){
    if(!el || !el.getClientRects) return false;
    const r = el.getBoundingClientRect();
    if(r.width < 4 || r.height < 4) return false;
    const st = getComputedStyle(el);
    return st.visibility !== "hidden" && st.display !== "none";
  }

  function setNativeValue(el, value){
    const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    if(desc && desc.set) desc.set.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", {bubbles:true}));
    el.dispatchEvent(new Event("change", {bubbles:true}));
  }

  function pressKey(el, key){
    const opts = {key, code:key === "Enter" ? "Enter" : key, keyCode:key === "Enter" ? 13 : 0, which:key === "Enter" ? 13 : 0, bubbles:true, cancelable:true};
    el.dispatchEvent(new KeyboardEvent("keydown", opts));
    el.dispatchEvent(new KeyboardEvent("keypress", opts));
    el.dispatchEvent(new KeyboardEvent("keyup", opts));
  }

  /* ---------- поиск полей ---------- */

  const TITLE_RE = /^(title|названи|заголов)/i;
  const KW_RE    = /(keyword|ключев|ключ|тег)/i;

  function fieldsIn(scope){
    const root = scope || document;
    return Array.from(root.querySelectorAll("input, textarea")).filter(visible);
  }

  function matchField(els, re){
    for(const el of els){
      const blob = [el.placeholder, el.getAttribute("aria-label"), el.name, el.id, el.title].filter(Boolean).join(" ");
      if(re.test(blob)) return el;
    }
    return null;
  }

  function matchLabelField(re){
    for(const lab of Array.from(document.querySelectorAll("label, [class*=label], [class*=title]"))){
      if(!visible(lab)) continue;
      const t = (lab.textContent || "").trim();
      if(!re.test(t)) continue;
      if(lab.control) return lab.control;
      const inp = lab.querySelector("input, textarea");
      if(inp) return inp;
      const forId = lab.getAttribute("for");
      if(forId){
        const byId = document.getElementById(forId);
        if(byId) return byId.tagName === "INPUT" || byId.tagName === "TEXTAREA" ? byId : byId.querySelector("input, textarea");
      }
      const next = lab.parentElement && lab.parentElement.querySelector("input, textarea");
      if(next) return next;
    }
    return null;
  }

  function findTitle(scope){
    const els = fieldsIn(scope);
    return matchField(els, TITLE_RE) || matchLabelField(TITLE_RE) || null;
  }

  function findKeywords(scope){
    const els = fieldsIn(scope);
    return matchField(els, KW_RE) || matchLabelField(KW_RE) || null;
  }

  // карточка файла: поднимаемся от текста имени файла к контейнеру с полем ввода
  function cardFor(node){
    let el = node.nodeType === 3 ? node.parentElement : node;
    for(let i = 0; el && i < 9; i++, el = el.parentElement){
      if(el.querySelector && el.querySelector("input, textarea")) return el;
    }
    return null;
  }

  /* ---------- заполнение ---------- */

  async function fillTitle(el, value){
    el.focus();
    setNativeValue(el, value);
    el.dispatchEvent(new Event("blur", {bubbles:true}));
  }

  async function fillKeywords(el, kw){
    el.focus();
    for(const word of kw){
      setNativeValue(el, String(word));
      await sleep(120);
      pressKey(el, "Enter");
      await sleep(160);
    }
    el.dispatchEvent(new Event("blur", {bubbles:true}));
  }

  async function fillForm(meta, scope, name){
    const titleEl = findTitle(scope);
    const kwEl = findKeywords(scope);
    const parts = [];

    if(titleEl && meta.title){
      await fillTitle(titleEl, meta.title);
      parts.push("заголовок ✓");
    }
    if(kwEl && Array.isArray(meta.keywords) && meta.keywords.length){
      await fillKeywords(kwEl, meta.keywords);
      parts.push("ключи ✓ (" + meta.keywords.length + ")");
    }
    if(!titleEl) parts.push("поле заголовка не найдено");
    if(!kwEl) parts.push("поле ключей не найдено");
    panelLog((parts.length ? "✓ " : "") + name + ": " + parts.join(", "), parts.length && titleEl ? "ok" : "warn");
  }

  /* ---------- панель ---------- */

  let panel, panelBody, panelLogEl;

  function buildPanel(){
    panel = document.createElement("div");
    panel.id = "bk-helper-panel";
    panel.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:2147483647;width:330px;background:#111;color:#eee;font:12px/1.45 system-ui,sans-serif;border:1px solid #444;border-radius:8px;box-shadow:0 6px 24px rgba(0,0,0,.45)";
    panel.innerHTML =
      '<div style="padding:8px 10px;background:#1b1b1b;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center;cursor:pointer" id="bk-head">' +
        '<b>batch-keyworder → Adobe</b><span id="bk-toggle">–</span></div>' +
      '<div id="bk-body" style="padding:8px 10px">' +
        '<div id="bk-status" style="margin-bottom:6px;color:#aaa">сервер: проверка…</div>' +
        '<div id="bk-log" style="max-height:150px;overflow:auto;color:#ccc;white-space:pre-wrap"></div>' +
        '<div style="margin-top:8px;display:flex;gap:6px">' +
          '<button id="bk-copy-t" style="flex:1">Копировать заголовок</button>' +
          '<button id="bk-copy-k" style="flex:1">Копировать ключи</button></div>' +
      '</div>';
    document.body.appendChild(panel);
    panelBody = panel.querySelector("#bk-body");
    panelLogEl = panel.querySelector("#bk-log");
    panel.querySelector("#bk-head").onclick = () => {
      const hidden = panelBody.style.display === "none";
      panelBody.style.display = hidden ? "" : "none";
      panel.querySelector("#bk-toggle").textContent = hidden ? "–" : "+";
    };
    panel.querySelector("#bk-copy-t").onclick = () => last && copy(last.title || "");
    panel.querySelector("#bk-copy-k").onclick = () => last && copy((last.keywords || []).join(", "));
    const st = panel.querySelector("#bk-status");
    httpGet(SERVER + "/health").then(t => {
      const h = JSON.parse(t);
      serverOk = true;
      st.style.color = "#7c7";
      st.textContent = "сервер: ок · " + (h.count != null ? h.count + " файлов" : "") + (h.folder ? " · " + h.folder.split(/[\\/]/).pop() : "");
      if(h.note) panelLog(h.note, "warn");
    }).catch(e => {
      serverOk = false;
      st.style.color = "#e77";
      st.textContent = "сервер недоступен — запустите helper/start.bat";
    });
  }

  function panelLog(msg, kind){
    if(!panelLogEl) return;
    const color = kind === "warn" ? "#ea7" : kind === "ok" ? "#7d7" : "#aaa";
    const line = document.createElement("div");
    line.style.color = color;
    line.textContent = new Date().toLocaleTimeString() + "  " + msg;
    panelLogEl.appendChild(line);
    panelLogEl.scrollTop = panelLogEl.scrollHeight;
    while(panelLogEl.children.length > 60) panelLogEl.removeChild(panelLogEl.firstChild);
  }

  function copy(text){
    if(navigator.clipboard) navigator.clipboard.writeText(text).then(() => panelLog("скопировано в буфер", "ok"));
  }

  /* ---------- основной цикл ---------- */

  function scanNames(){
    const names = new Set();
    const walker = document.createTreeWalker(document.body || document, NodeFilter.SHOW_TEXT);
    let n, guard = 0;
    while((n = walker.nextNode()) && guard++ < 60000){
      const t = n.nodeValue && n.nodeValue.trim();
      if(t && t.length < 220 && FILE_RE.test(t) && t.split(/\s+/).length < 12){
        const m = t.match(FILE_RE);
        if(m){
          const name = t.slice(m.index).split(/\s{2,}|\n/)[0].trim();
          if(name.length < 180) names.add(name);
        }
      }
    }
    return names;
  }

  async function processFile(name){
    let meta;
    try{
      const text = await httpGet(SERVER + "/meta?file=" + encodeURIComponent(name));
      meta = JSON.parse(text);
    }catch(e){
      const msg = String(e && e.message || e);
      if(/HTTP 404/.test(msg)){
        done.set(name, {ok:false});
        panelLog("нет метаданных для «" + name + "» (сгенерируйте их в приложении)", "warn");
      }else{
        panelLog("сервер не ответил для «" + name + "»: " + msg, "warn");
      }
      return;
    }
    if(!meta || !meta.title){
      done.set(name, {ok:false});
      return;
    }
    last = meta;
    done.set(name, {ok:true});

    // ищем карточку с именем файла и заполняем её; иначе — форму целиком
    let scope = null;
    const walker = document.createTreeWalker(document.body || document, NodeFilter.SHOW_TEXT);
    let n;
    while((n = walker.nextNode())){
      if((n.nodeValue || "").indexOf(name) !== -1){ scope = cardFor(n); break; }
    }
    await fillForm(meta, scope, name);
  }

  async function tick(){
    if(document.hidden) return;
    try{
      const names = scanNames();
      for(const name of names){
        if(done.has(name)) continue;
        done.set(name, {pending:true});
        await processFile(name);
        await sleep(300);
      }
    }catch(e){
      panelLog("ошибка цикла: " + (e && e.message || e), "warn");
    }
  }

  function init(){
    if(!/stock\.adobe\.com/.test(location.host)) return;
    buildPanel();
    panelLog("готов ищу имена файлов на странице…", "");
    setInterval(tick, 2500);
    setTimeout(tick, 800);
  }

  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
