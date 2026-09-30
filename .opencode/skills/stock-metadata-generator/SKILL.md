---
name: stock-metadata-generator
description: Use when working on metadata-generator.html (Adobe Stock / Shutterstock title & keywords generator), its prompt, OpenRouter integration, batch processing, CSV/TXT export, or stock platform limits.
---

# Stock Media Attribution (Adobe Stock / Shutterstock)

## What This Project Is

Однофайловое HTML-приложение (`metadata-generator.html`, ~1350 строк) для генерации
метаданных фотостоков: title (EN+RU), keywords (EN+RU), category, no_people.
Мультимодальные модели через OpenRouter API анализируют кадр(ы) и пишут продающие
метаданные по заданной методологии. Без бэкенда, без сборки — открыть в браузере.

## Key Files

| File | Purpose |
|------|---------|
| `metadata-generator.html` | Всё приложение: HTML + CSS + JS |
| `.opencode/skills/stock-metadata-generator/SKILL.md` | Этот скилл |
| `stock_video_requirements_2026.md` | Требования видео-платформ (справочно) |
| `attributor.js` / `stock-attributor.html` / `metadata_generator.py` | Устаревшие версии, не используются |

## Hard Rules (менять только по просьбе пользователя)

| Параметр | Значение |
|---|---|
| Title | ровно 2 предложения, **120–180 символов**, цель ~140 |
| Keywords | **40–49**, первые 3 — фразы из 2 слов, остальные — одиночные |
| Дозаполнение ключей | минимум **40** (не добивать до 49 общими словами) |
| Слово «Концепция» | **запрещено** в промпте и в заголовках (используем «смысл») |
| `no people` | только если людей в кадре нет |
| max_tokens | **3000** (явно: без него OpenRouter считает по максимуму модели → 402 на пустом балансе) |
| Бесплатные модели | только `:free` / `openrouter/free`, если нет кредитов |

## Prompt Methodology (живёт в JS-строке ~строки 1000-1014)

Собирается конкатенацией строк в `aiForEntry()`:

1. **Роль + тип контента + контекст** (файл, камера, дата, ISO, диафрагма, цвета, GPS)
2. **`prevNote`** — блок «РАНЕЕ ИСПОЛЬЗОВАНО В ЭТОЙ СЕРИИ» (до 120 ключей + 5 заголовков)
3. **TITLE** — ровно 2 предложения; жёсткий кап 180 символов (EN: цель ~160, диапазон
   140–180; RU: 120–180, цель ~140). 1-е предложение — ЧТО В КАДРЕ, начиная с реального
   поискового запроса Adobe Stock (конкретное существительное + действие + обстановка);
   2-е — СМЫСЛ + одно конкретное применение. В промпте есть явные примеры ХОРОШО/ПЛОХО
   и список запрещённых «водяных» фраз («для маркетинга», «универсальный дизайн» и т.п.).
   Уникальность в серии (макс. 2–3 слова совпадения), каждой работе — своё применение
4. **ПРИМЕНЕНИЕ И КОММЕРЧЕСКИЕ АКЦЕНТЫ** — целевая аудитория (маркетинг, HR, финансы,
   образование, ретейл), конкретный формат/задача во 2-м предложении, 3–5 ключей-применений
5. **KEYWORDS** — 40–49, низкочастотные long-tail; ЗАПРЕЩЁННЫЕ шаблоны:
   mental health, work stress, life crisis, digital fatigue, burnout, stress relief,
   self care, well being, work life; избегать сверхобщих (man, woman, hand, water, …)
6. **Смысловой слой** — только во 2-м предложении, в keywords НЕ включать
7. **АНТИ-SIMILAR** — каждая работа = новый смысл/ракурс/первые 2 ключа
8. **RU** — тот же смысл, 120–180 символов, 40–49 ключей

## Key Functions

| Function | Роль |
|---|---|
| `aiForEntry(entry, cfg)` | кадры/изображение → промпт → `llmRequest(cfg, …)` → `parseAI` |
| `readCfg()` | собирает настройки выбранного провайдера из DOM: `{provider:"openrouter", key, model}` либо `{provider:"ollama", url, model}`; возвращает `{ok:false, err}` если ключа нет |
| `llmRequest(cfg, prompt, imgs)` | маршрутизация: `ollama` → `ollamaRequest`, иначе `openrouterRequest` |
| `ollamaRequest(cfg, prompt, imgs)` | локальный провайдер: POST `{url}/api/chat`, `format:"json"`, `keep_alive:"30m"`, `num_ctx:8192`, таймаут 600 с, base64 **без** префикса `data:`; ответ нормализуется в `{choices:[{message:{content}}]}` |
| `applyProviderUI()` | показывает/скрывает панели OpenRouter и Ollama, пишет подсказку; выбор провайдера хранится в `ai_provider` |
| `openrouterRequest(model, key, prompt, imgs, base)` | OpenAI-совместимый POST; `base` не передан → OpenRouter, передан → Model Studio (`isOpenRouter=false`). Ретраи (429/5xx/сеть, 4 попытки), таймаут 90с, `max_tokens: 3000`; 401/403 → «ключ отклонён», 429 → «превышен лимит», 402 → понятный текст про кредиты/квоту |
| `aiGenerate()` | одиночная генерация; при 402 или `MODEL_UNAVAILABLE` → авто-переключение на `openrouter/free` |
| `aiBatch()` | батч: последовательный проход (1 воркер, задержка 2с — чтобы не ловить 429); до 3 повторных проходов по упавшим (пауза 8с, задержка 4с); 402/`MODEL_UNAVAILABLE` → `openrouter/free` |
| `parseAI(content)` | вытаскивает JSON: снимает ```-fences, обрезает от первого `{` до последнего `}`, чистит control chars, латает обрезанный ответ |
| `cleanAIKeywords(kws, noPeople, used)` | 3 уникальные фразы → одиночные → дозаполнение до 40; `slice(0,49)` |
| `fitTitle(s)` | обрезка ≤180 по границе слова (не <120) |
| `buildMeta(fname, title, kw, entry)` | центральная сборка метаданных; **кап 180 здесь тоже** |
| `genTitle()` / `genKeywords()` | эвристика из имени файла — **только fallback** |
| `syncAllGenerated()` | перед экспортом подтягивает живые ИИ-данные в `records` |
| `entryMetaById(id)` | приоритет у `entry.generated` (живые данные), потом запись, потом эвристика |
| `saveRecord(meta)` | upsert по `file_id` (иначе по `filename`) |
| `getVideoFrames(file, n)` | до 3 кадров; 1-й без перемотки (`onloadeddata` + retry), далее seek 25%/75%; таймаут 45с |

## Source Marker (`source`)

Каждая запись помечается:
- `source: "ai"` — реально атрибутировано моделью
- `source: "heuristic` — fallback из имени файла + поле `ai_error` с причиной

`source` входит в `EN_FIELDS` и в общий CSV/JSON — видно, где настоящие данные.

## Models

**Бесплатные (ротируются, проверяй каталог openrouter.ai с фильтром Free):**
- `openrouter/free` — авто-роутер с фильтром по capability (vision), **дефолт**
- `google/gemma-4-26b-a4b-it:free`, `google/gemma-4-31b-it:free`
- `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`, `nvidia/nemotron-nano-12b-v2-vl:free`

**Платные:** `qwen/qwen3-vl-30b-a3b-instruct`, `qwen/qwen3-vl-8b-instruct`,
`qwen/qwen2.5-vl-72b-instruct`, `qwen/qwen3-vl-235b-a22b-instruct`,
`google/gemini-2.5-flash`, `openai/gpt-4o-mini`

Лимит бесплатных: ~20 req/min, ~200–1000/сутки. Повышается покупкой ≥$10 кредитов
(не обязательно тратить их на free-модели).

## Провайдеры (переключатель в UI)

| Провайдер | Когда | Детали |
|---|---|---|
| `openrouter` | облако, быстрее | Нужен ключ. Авто-переход на `openrouter/free` при 402 / `MODEL_UNAVAILABLE` |
| `qwen` | Alibaba Model Studio, быстро | Vision. Нужен ключ `sk-…`. Поля: ключ, модель, базовый адрес. Бесплатная квота новичкам. Автопереходов нет |
| `ollama` | локально, бесплатно, без лимитов | Ключ не нужен. Требуется `setx OLLAMA_ORIGINS *` и перезапуск Ollama. На CPU без GPU ~2–4 мин на файл. Переходы на другие модели НЕ применяются |

Qwen в Model Studio работает через OpenAI-совместимый endpoint, поэтому переиспользуется
`openrouterRequest(model, key, prompt, imgs, base)`; признак `isOpenRouter = !base` отличает
его от OpenRouter и отключает автопереход на `:free`. Адреса: `dashscope-intl.aliyuncs.com`
(международный) или `dashscope.aliyuncs.com` (Китай). Модели: `qwen3-vl-plus`, `qwen3-vl-flash`,
`qwen-vl-max`, `qwen2.5-vl-72b-instruct`.

**DeepSeek использовать нельзя:** его публичный API text-only, vision-моделей нет —
описать изображение он не способен. Нужен именно Qwen (или любая другая VL-модель).

Модели для 8 ГБ ОЗУ: `qwen2.5vl:3b` (рекомендуется), `qwen2.5vl:7b` (медленно),
`moondream` (быстро, слабее). Скачивание: `ollama pull qwen2.5vl:3b`.

## State

- `fileEntries[]` — файлы: `{id: Date.now()+Math.random(), file, exif, colors, vmeta, thumbUrl, ctype, generated}`
- `records[]` — записи метаданных (в памяти, **не** в localStorage), рендер в таблице Records
- `usedKeywords` (Set), `usedTitles[]` — анти-дубли по серии, НЕ сбрасываются между батчами
- `keywordList[]` — редактируемые ключи текущего файла
- localStorage: только `or_key` и `or_model`

## Editing Conventions

- Всё в одном файле; vanilla JS, без зависимостей
- Тёмная тема через CSS-переменные (`--accent`, `--bg`, `--card`, `--text2`)
- Промпт — конкатенация строк внутри `aiForEntry()`
- **После правок JS:** проверить синтаксис, извлека `<script>` и оборачивая в `new Function(...)` через временный node-скрипт в `%TEMP%\opencode`
- PowerShell выводит кириллицу в mojibake — для проверки использовать node, не `Select-String`
- После изменений просить пользователя сделать **Ctrl+F5**

## Known Issues & Fixes

| Симптом | Причина / решение |
|---|---|
| CSV содержит имя файла вместо описания | ИИ не отработал → fallback. Проверить `source`/`ai_error`. Добавлено: 402 → авто-переключение на `openrouter/free`, `syncAllGenerated()` перед экспортом, приоритет `entry.generated` в `entryMetaById` |
| `HTTP 402 ... can only afford N` | Не задан `max_tokens` → OpenRouter считает по максимуму модели (32768/65536). Фикс: явный `max_tokens: 3000` + автопереход на `openrouter/free` |
| `MODEL_UNAVAILABLE: модель ... недоступна` | `:free`-slug исчез при ротации каталога (404 / 400 «no endpoints found»). Single и batch один раз переключаются на `openrouter/free` |
| `Ollama: не удалось обратиться к ...` | Ollama не запущена или браузер блокирует CORS. Лечится `setx OLLAMA_ORIGINS *` + перезапуск терминала и Ollama |
| `MODEL_UNAVAILABLE ... ollama pull` (404 от Ollama) | Модель не скачана локально. Показываем готовую команду `ollama pull <model>` |
| Заголовок > 180 / > 200 знаков | Устаревшая страница в кэше браузера — Ctrl+F5. Кап стоит в `fitTitle()` и `buildMeta()` |
| «не удалось получить кадр из видео» | H.265/HEVC, AV1 или сверхвысокий битрейт → пережать MP4/H.264 |
| Из 20 работ описано меньше | Раньше сдавались после 4 попыток; теперь 2 доп. прохода по упавшим |
| Модель возвращает не JSON | `parseAI` чинит fences/мусор вокруг JSON; при `finish_reason=length` — латает незакрытые кавычки |
| Модель повторяет ключи серии | `usedKeywords`/`prevNote`; при старте батча наполняются из `records` |
| Бесплатная модель исчезла (404) | Ротация free-моделей → переключиться на `openrouter/free` |
| Слова-пустышки в ключах | Держать `STOP_KW`/`GENERIC_KW` и список запрещённых фраз в промпте синхронно |

## Platform Reference

| Rule | Value |
|---|---|
| Title | 2 предложения, 120–180 символов |
| Keywords | 40–49 (первые 3 — фразы) |
| `no people` | только когда людей нет |
| AI disclosure | `Created using generative AI` |
| Видео | MP4/H.264, 5–60 с, от 1920×1080 |
