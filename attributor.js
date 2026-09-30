#!/usr/bin/env node
/**
 * Advanced Stock Metadata Attributor
 * Для атрибуции изображений и видео для Adobe Stock / Shutterstock.
 *
 * Использование:
 *   node attributor.js <файл> [-o result.csv]
 *   node attributor.js --batch <папка> [-o result.csv]
 *   node attributor.js --interactive
 *   node attributor.js --dry-run
 *
 * Требования:
 *   set OPENAI_API_KEY=sk-...
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".avi", ".mkv", ".webm"]);

const SYSTEM_PROMPT = `Ты — профессиональный атрибутор изображений и видео для фотостоков (Adobe Stock, Shutterstock).
Твоя цель — максимальная коммерческая эффективность и продажи через поиск (SEO).

## ГЛАВНЫЙ ПРИНЦИП
Описывай не только объект, но и: идею, состояние, эмоцию, сценарий использования.
Примеры:
  стресс → burnout / overload / pressure
  природа → recovery / healing / escape
  работа → productivity / deadline / digital fatigue

## TITLE — ПРАВИЛА
- Ровно 2 предложения
- До 200 символов
- 1 предложение — сцена: кто + что делает + где ИЛИ что + как выглядит
- 2 предложение — концепция: идея, смысл, применение, эмоциональный слой
- Если vector → добавить "vector illustration" в конец Title
- Если нет фона → добавить "isolated on white background" или "no background"

## KEYWORDS — ПРАВИЛА
- Ровно 49 ключевых слов (всего)
- Без повторов слов
- Без одинаковых корней (burn / burnout — нельзя оба)
- Ключи 1–3: только 2 слова, реальные поисковые запросы, НЕ повторяют Title
- Ключи 4–49: только 1 слово, уникальные
- Покрывать: объекты, людей, действия, окружение, эмоции, состояния, концепции, категории
- Если людей нет → обязательно включить "no people"
- Если есть человек → НЕ использовать "no people"

## РАСШИРЕННЫЕ КОНЦЕПЦИИ (варьировать!)
burnout, digital fatigue, decision fatigue, cognitive overload,
emotional suppression, life crisis, existential crisis, isolation,
recovery, healing, work pressure, productivity decline, survival mode,
mental block, problem dead end, silent pressure, internal conflict,
life transition, emotional collapse, mental blockage

## ЗАПРЕЩЕНО
- Повторы слов
- Слабые слова: nice, good, beautiful, amazing
- Бессмысленные ключи
- Копирование шаблонов

## АНТИ-SIMILAR
- Менять формулировки Title
- Менять смысл второго предложения
- Менять первые 2 ключа
- Менять концептуальный угол

## ОСОБЫЕ АКЦЕНТЫ
- Для людей: эмоции, состояние, поза
- Для окружения: усиливать смысл (ночь → давление, лес → восстановление)
- Для света: soft light → calm / healing, dark → stress / isolation

## ДЛЯ ВИДЕО
- Добавлять: движение, процесс, изменение состояния`;

function buildUserPrompt(filename, isVideo) {
  if (isVideo) {
    return `Проанализируй видеофайл '${filename}' и сгенерируй метаданные для Adobe Stock.
Описывай движение, процесс, изменение состояния.

Формат — ТОЛЬКО валидный JSON без markdown-обёрток:
{
  "title_en": "Title на английском (2 предложения, до 200 символов)",
  "keywords_en": ["слово1", "слово2", ...],
  "title_ru": "Заголовок на русском (2 предложения)",
  "keywords_ru": ["слово1", "слово2", ...],
  "is_vector": false,
  "has_people": true,
  "media_type": "video"
}

ВАЖНО:
- keywords_en: ровно 49 элементов. Первые 3 — фразы из 2 слов. Остальные — по 1 слову.
- keywords_ru: ровно 49 элементов. Первые 3 — фразы из 2 слов. Остальные — по 1 слову.
- Описывай движение, процесс, изменение состояния во времени.
- Никаких повторов слов.
- Если людей нет → "no people" в ключи.`;
  }
  return `Проанализируй это изображение и сгенерируй метаданные для Adobe Stock.

Формат — ТОЛЬКО валидный JSON без markdown-обёрток:
{
  "title_en": "Title на английском (2 предложения, до 200 символов)",
  "keywords_en": ["слово1", "слово2", ...],
  "title_ru": "Заголовок на русском (2 предложения)",
  "keywords_ru": ["слово1", "слово2", ...],
  "is_vector": false,
  "has_people": true,
  "media_type": "photo"
}

ВАЖНО:
- keywords_en: ровно 49 элементов. Первые 3 — фразы из 2 слов. Остальные — по 1 слову.
- keywords_ru: ровно 49 элементов. Первые 3 — фразы из 2 слов. Остальные — по 1 слову.
- Никаких повторов слов внутри одного списка ключей.
- Никаких одинаковых корней (burn / burnout — нельзя оба).
- Если людей нет → добавить "no people" в ключи.
- Если вектор → is_vector: true и добавить "vector illustration" в конец title_en.
- media_type: "photo", "illustration", "vector", или "video".`;
}

function getMimeType(ext) {
  const map = {
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
    ".gif": "image/gif", ".bmp": "image/bmp", ".tiff": "image/tiff",
    ".webp": "image/webp",
  };
  return map[ext] || "image/jpeg";
}

function validateMetadata(data) {
  const errors = [];
  if (!data.title_en) errors.push("title_en отсутствует");
  else if (data.title_en.length > 200) errors.push(`title_en: ${data.title_en.length} символов (макс 200)`);
  if (!data.title_ru) errors.push("title_ru отсутствует");

  for (const lang of ["en", "ru"]) {
    const key = `keywords_${lang}`;
    const kws = data[key];
    if (!Array.isArray(kws)) { errors.push(`${key} не массив`); continue; }
    if (kws.length !== 49) errors.push(`${key}: ${kws.length} ключей (ожидается 49)`);
    for (let i = 0; i < Math.min(3, kws.length); i++) {
      if (kws[i].split(/\s+/).length < 2) errors.push(`${key}[${i}] должен быть фразой: '${kws[i]}'`);
    }
    const seen = new Set();
    for (const kw of kws) {
      const low = kw.toLowerCase().trim();
      if (seen.has(low)) errors.push(`${key}: дубликат '${kw}'`);
      seen.add(low);
    }
  }
  return errors;
}

function fixMetadata(data) {
  for (const lang of ["en", "ru"]) {
    const key = `keywords_${lang}`;
    if (!Array.isArray(data[key])) data[key] = [];
    while (data[key].length < 49) data[key].push("keyword");
    if (data[key].length > 49) data[key] = data[key].slice(0, 49);
  }
  data.title_en = data.title_en || "Untitled";
  data.title_ru = data.title_ru || "Без заголовка";
  data.is_vector = data.is_vector ?? false;
  data.has_people = data.has_people ?? true;
  data.media_type = data.media_type || "photo";
  return data;
}

async function callOpenAI(apiKey, systemPrompt, userContent) {
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`API error ${resp.status}: ${err}`);
  }

  const json = await resp.json();
  return json.choices[0].message.content.trim();
}

function parseJSON(raw) {
  let text = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(text);
}

async function analyzeImage(apiKey, filepath) {
  const filename = path.basename(filepath);
  const ext = path.extname(filepath).toLowerCase();
  console.log(`  Анализ: ${filename} ...`);

  const b64 = fs.readFileSync(filepath).toString("base64");
  const mime = getMimeType(ext);

  const userContent = [
    { type: "text", text: buildUserPrompt(filename, false) },
    { type: "image_url", image_url: { url: `data:${mime};base64,${b64}`, detail: "high" } },
  ];

  const raw = await callOpenAI(apiKey, SYSTEM_PROMPT, userContent);
  const data = parseJSON(raw);
  data.media_type = ext === ".svg" ? "vector" : data.media_type || "photo";
  return data;
}

async function analyzeVideo(apiKey, filepath) {
  const filename = path.basename(filepath);
  console.log(`  Видео: ${filename} (генерация по имени файла)...`);

  const userContent = buildUserPrompt(filename, true);
  const raw = await callOpenAI(apiKey, SYSTEM_PROMPT, userContent);
  const data = parseJSON(raw);
  data.media_type = "video";
  return data;
}

function writeCSV(rows, outputPath) {
  const headers = ["filename", "title_en", "keywords_en", "title_ru", "keywords_ru", "is_vector", "has_people", "media_type"];
  const lines = [headers.join(",")];

  for (const row of rows) {
    const line = headers.map(h => {
      let val = row[h] ?? "";
      if (Array.isArray(val)) val = val.join("; ");
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(",");
    lines.push(line);
  }

  fs.writeFileSync(outputPath, "\uFEFF" + lines.join("\n"), "utf-8");
  console.log(`\nРезультат сохранён: ${outputPath}`);
}

function dryRun() {
  console.log("DRY RUN: тестовый режим без API\n");
  const sample = {
    filename: "test.jpg",
    title_en: "Businessman working late at office desk under dim light. Concept of digital fatigue and work pressure.",
    keywords_en: [
      "work stress", "digital fatigue", "late night",
      "businessman", "office", "desk", "computer", "laptop",
      "overtime", "deadline", "pressure", "burnout", "fatigue",
      "exhaustion", "tired", "stressed", "overwork", "corporate",
      "night", "dark", "lamp", "screen", "isolation", "loneliness",
      "focus", "concentration", "productivity", "decline",
      "mental health", "anxiety", "overwhelm", "struggle",
      "survival mode", "cognitive overload", "decision fatigue",
      "emotional suppression", "silent pressure", "internal conflict",
      "no people", "realism", "concept", "business", "technology",
      "modern", "minimal", "dramatic", "moody",
    ],
    title_ru: "Бизнесмен поздно работает за офисным столом в тусклом свете. Концепция цифровой усталости и рабочего давления.",
    keywords_ru: [
      "рабочий стресс", "цифровая усталость", "поздний вечер",
      "бизнесмен", "офис", "стол", "компьютер", "ноутбук",
      "сверхурочные", "дедлайн", "давление", "выгорание", "усталость",
      "истощение", "уставший", "напряжение", "переработка", "корпоратив",
      "ночь", "темнота", "лампа", "экран", "изоляция", "одиночество",
      "фокус", "концентрация", "продуктивность", "снижение",
      "психическое здоровье", "тревога", "перегрузка", "борьба",
      "режим выживания", "когнитивная перегрузка", "усталость от решений",
      "подавление эмоций", "тихое давление", "внутренний конфликт",
      "без людей", "реализм", "концепция", "бизнес", "технологии",
      "современность", "минимализм", "драматизм", "настроение",
    ],
    is_vector: false,
    has_people: false,
    media_type: "photo",
  };
  writeCSV([sample], path.join(process.cwd(), "attributor_output.csv"));
  console.log("Тестовый CSV создан: attributor_output.csv");
}

async function processFile(apiKey, filepath) {
  if (!fs.existsSync(filepath)) {
    console.error(`  Файл не найден: ${filepath}`);
    return null;
  }
  const ext = path.extname(filepath).toLowerCase();
  try {
    let data;
    if (IMAGE_EXT.has(ext)) {
      data = await analyzeImage(apiKey, filepath);
    } else if (VIDEO_EXT.has(ext)) {
      data = await analyzeVideo(apiKey, filepath);
    } else {
      console.error(`  Неподдерживаемый формат: ${ext}`);
      return null;
    }
    const errors = validateMetadata(data);
    if (errors.length) {
      console.error(`  Предупреждения для ${path.basename(filepath)}:`);
      errors.forEach(e => console.error(`    - ${e}`));
    }
    data = fixMetadata(data);
    data.filename = path.basename(filepath);
    return data;
  } catch (err) {
    console.error(`  ОШИБКА для ${path.basename(filepath)}: ${err.message}`);
    return null;
  }
}

async function batchMode(apiKey, folder, outputPath) {
  if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
    console.error(`ОШИБКА: ${folder} не является папкой`);
    process.exit(1);
  }
  const files = fs.readdirSync(folder)
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext);
    })
    .sort();

  if (!files.length) { console.log(`В ${folder} нет поддерживаемых файлов`); return; }
  console.log(`Найдено файлов: ${files.length}`);

  const rows = [];
  for (let i = 0; i < files.length; i++) {
    console.log(`\n[${i + 1}/${files.length}]`);
    const result = await processFile(apiKey, path.join(folder, files[i]));
    if (result) {
      rows.push(result);
      console.log(`  OK: ${result.title_en.slice(0, 60)}...`);
    }
    if (i < files.length - 1) await new Promise(r => setTimeout(r, 1000));
  }
  if (rows.length) writeCSV(rows, outputPath);
  console.log(`\nОбработано: ${rows.length}/${files.length}`);
}

async function interactiveMode(apiKey, outputPath) {
  console.log("=== INTERACTIVE MODE ===");
  console.log("Введите путь к файлу (или 'quit'):\n");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = () => new Promise(resolve => rl.question("Файл> ", resolve));

  const rows = [];
  let input;
  while ((input = (await ask()).trim())) {
    if (["quit", "exit", "q", "выход"].includes(input.toLowerCase())) break;
    const result = await processFile(apiKey, input);
    if (result) {
      rows.push(result);
      console.log(`  OK: ${result.title_en.slice(0, 60)}...`);
      console.log(`  Ключи EN: ${result.keywords_en.slice(0, 5).join(", ")}...\n`);
    }
  }
  rl.close();
  if (rows.length) writeCSV(rows, outputPath);
  console.log("Готово.");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--dry-run")) { dryRun(); return; }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("ОШИБКА: Установите OPENAI_API_KEY");
    console.error("  $env:OPENAI_API_KEY = 'sk-...'");
    process.exit(1);
  }

  let outputPath = "attributor_output.csv";
  const outIdx = args.indexOf("-o");
  if (outIdx !== -1 && args[outIdx + 1]) {
    outputPath = args[outIdx + 1];
    args.splice(outIdx, 2);
  }

  const filtered = args.filter(a => a !== "-o" && a !== outputPath);

  if (filtered.includes("--interactive") || filtered.includes("-i")) {
    await interactiveMode(apiKey, outputPath);
  } else if (filtered.includes("--batch") || filtered.includes("-b")) {
    const bIdx = filtered.indexOf("--batch") !== -1 ? filtered.indexOf("--batch") : filtered.indexOf("-b");
    const folder = filtered[bIdx + 1];
    await batchMode(apiKey, folder, outputPath);
  } else if (filtered.length) {
    const rows = [];
    for (const f of filtered) {
      const result = await processFile(apiKey, f);
      if (result) rows.push(result);
    }
    if (rows.length) writeCSV(rows, outputPath);
  } else {
    console.log("Advanced Stock Metadata Attributor\n");
    console.log("Использование:");
    console.log("  node attributor.js <файл> [-o result.csv]");
    console.log("  node attributor.js --batch <папка> [-o result.csv]");
    console.log("  node attributor.js --interactive");
    console.log("  node attributor.js --dry-run");
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
