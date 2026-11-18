---
name: stock-topics-prompts
description: Use when building or working on the Stock Topics & Prompts app — поиск актуальных тем Adobe Stock и генератор промптов для фото/видео/вектора (сезонный календарь, evergreen-ниши, промпт-шаблоны, batch-планы, экспорт).
---

# Stock Topics & Prompts (актуальные темы + промпты)

## What This Project Is

Будущее однофайловое HTML-приложение: на вход — формат (фото/видео/вектор) и дата,
на выход — актуальные темы с дедлайнами + готовые промпты (EN, с `--ar`, negative prompt,
именами файлов ≤30 символов, посевными ключами) и batch-планами. Реализация —
vanilla HTML/CSS/JS, без бэкенда, как `metadata-generator.html`. Поиск — по встроенной
тематической базе (не live web), генерация промптов — по шаблонам с подстановкой слотов.

Скилл — ТЗ/спецификация для создания приложения в отдельном чате.

## Key Files

| File | Purpose |
|------|---------|
| `themes and promts/Adobe_Stock_актуальные_темы_2027.md` (.html/.pdf) | Исследование: календарь тем, дедлайны, тренды 2026–2027, evergreen-ниши — первоисточник данных для встраивания в приложение |
| `themes and promts/*_промты_2027.md` | Готовые сетки («Праздничный декор», «Уютный интерьер», «Зимняя природа») — эталон формата вывода |
| `Год Козы 2027/goat2027_prompts.md` | Эталон структуры промптов и пост-инструкций |
| `themes and promts/Adobe_Stock_чек-лист_перед_загрузкой.md` | Чек-лист, встраивать как финальный шаг |
| `.opencode/skills/stock-topics-prompts/SKILL.md` | Этот скилл |
| `Promts october 2026/stock-topics-prompts.html` | Готовое однофайловое приложение (темы, промпты, батч-план, чек-лист) |
| `Promts october 2026/phone-server.js` + `запуск-для-телефона.bat` | Локальный сервер без зависимостей, чтобы открыть приложение на телефоне в той же Wi-Fi-сети |
| `Promts october 2026/icon-180.png`, `icon-512.png`, `manifest.webmanifest` | Иконка и манифест для ярлыка на главном экране телефона (генератор — `%TEMP%\opencode\gen_icon.js`, чистый Node+zlib) |
| `Promts october 2026/README.md` | Описание приложения для GitHub: скриншоты, быстрый старт, структура |
| `Promts october 2026/tools/make-screenshots.js` | Пересъёмка 5 скриншотов (headless Edge, CDP, без зависимостей): `node tools/make-screenshots.js` → `../screenshots/` |
| `index.html` (корень) | Лендинг для GitHub Pages: две карточки — Metadata Generator и Topics & Prompts |
| `metadata-generator.html` (корень) | Референс архитектуры однофайлового приложения, UI, localStorage |

## Data Model (встраиваемая тематическая база)

```js
// themes: статичный массив, наполнение из Adobe_Stock_актуальные_темы_2027
{
  id: "cozy-interior",
  titleRu: "Уютный интерьер",
  formats: ["photo", "video"],
  season: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"], // месяцы пика
  deadlineNote: "зимний пик — до 22.10 (за 10–12 недель)",
  evergreen: true,          // продаётся вне сезона
  hooks: ["камин", "тёплый свет", "плед без рождественского клише", "луп мерцания огня"],
  avoid: ["christmas tree", "ornaments", "Merry Christmas", "даты года"],
  subjectEn: "cozy winter interior",        // якорь для промптов
  peopleLikely: false,       // model release?
  competitionHint: "низкая/средняя"
}
// promptTemplates: по формату
{
  format: "photo",
  template: "Photorealistic {style} photograph, {subject}, {setting}, {lighting}, {mood}, {extras}, {constraint} --ar {ratio}",
  ratios: ["3:2", "4:5", "1:1"],
  filenamePattern: "cozyint-p{n:02d}-{slug}.jpg",
  negative: "text, watermark, ...",
  postGen: ["апскейл ≥4 МП", "JPEG sRGB ≤45 МБ"]
}
```

## App Features (спека)

1. **Тематизатор:** дата/месяц → список актуальных тем (дедлайн «горит», «скоро», «evergreen»), фильтр по формату, показ hooks/avoid.
2. **Генератор сетки:** выбранная тема + количество (10/20) → N промптов по шаблону с разнообразием subjects/hooks, имя файла, negative, `--ar`, посевные ключи, post-gen чек-лист. Видео: 6×16:9 + 4×9:16 (вертикали сразу 9:16, в ключах `vertical`+`video`).
3. **Batch-план:** батчи по 5–10 с распределением фото/видео/вектор и приоритетом по дедлайнам.
4. **Экспорт:** `.md` сетки (как готовые файлы тем) + копирование промпта.
5. **localStorage:** история тем и последних сеток.

## Hard Rules (менять только по явной просьбе)

| Правило | Значение |
|---|---|
| Промпты | EN, `--ar` в конце, `no text` для вектора/фото без людей |
| Имя файла | ≤30 символов латиницей, вид: `prefix-p01-slug.jpg`, `prefix-vid01-slug.mp4` |
| Evergreen | без дат/годов в промптах; «winter/holiday», не «Christmas 2026» |
| Negative | общий фото: `text, watermark, logo, letters, signature, blurry, low quality, jpeg artifacts, extra limbs, deformed hands, cropped, mockup, hdr, overprocessed, 3d render, cgi, illustration, painting, cartoon, plastic shading` + запрет темы (напр. `christmas tree`). Запрет 3d/cgi добавлен после анализа отказов: «рендерный» вид = отказ «Проблемы с качеством» |
| Дедлайн сезонки | загружать за **10–12 недель** до пика (модерация 1–3 нед) |
| Метаданные | Title 120–180 (2 предложения), ключи 40–49 (первые 3 — фразы), `no people`/`nobody` только если людей нет |
| Модели | опционально OpenRouter: `max_tokens: 3000`, `:free` модели без кредитов (как в stock-metadata-generator) |
| Люди в кадре | помечать «model release», либо руки без лица / спина |
| Видео | 5–60 с (вертикали 10–30 с), 24/25/30 к/с, H.264, движение обязательно |
| Одна перспектива | aerial/drone-слот **никогда** не сочетать с indoor-деталями (living room, fireplace, table, window, lamplight) — сломанный ракурс = отказ «качество» |
| Логика сцены | сюжет жизненно правдоподобен: случайные объекты (печь посреди леса) не подмешивать к природным сюжетам |
| Свет и настроение | тёплый свет только с тёплым настроением, холодный только с холодным (смесь warm/cool = отказ) |
| Спрос и уникальность | перед загрузкой найти сюжет в поиске Adobe Stock; тысячи одинаковых ракурсов → сузить контекст; из серии грузить **1 лучший кадр** (анти-«похожий контент») |

## Prompt Coherence & Diversity (v2, окт 2026)

**Источник правок:** анализ 30 отказов (73% «Проблемы с качеством» — в т.ч. ИИ-артефакты и сломанная геометрия) + баг генератора: шаблон склеивал несовместимые слоты («Aerial drone photograph … near a stone fireplace» посреди заснеженного леса). Правила ниже — обязательны при любых правках шаблонов.

### Совместимость слотов фото (константы в коде)

```js
PHOTO_SET_OUT   = ["in soft daylight","in an open airy space"]            // природа/улица
PHOTO_SET_AERIAL= ["in soft daylight"]                                    // только aerial
PHOTO_SET_IN    = ["in a cozy living room","by a large window","on a rustic wooden table",
                   "near a stone fireplace","indoors in warm lamplight","against a dark warm background"]
WARM_L = ["warm ambient light","natural window light","golden hour backlight","candlelight glow"]
COOL_L = ["cool daylight contrast","bright overcast light","soft diffused daylight","gentle side light"]
WARM_M = ["inviting warm mood","intimate evening mood","calm cozy atmosphere"]
COOL_M = ["fresh airy feeling","serene peaceful mood","quiet meditative mood"]
// видео: VWARM_L/VCOOL_L, VWARM_M/VCOOL_M — аналогично
```

### Классификация сюжета (regex по subject, EN)

- `indoorSubj`: living room, interior, indoors, window, table, desk, kitchen, bedroom, fireplace, cafe, office, lamp
- `natureSubj`: forest, woods, pine, tree, mountain, river, lake, field, meadow, sky, beach, snow, valley, hill, canyon, waterfall, countryside, landscape, roof, rooftop, porch, garden, yard, street, barn, fence, cabin, chalet, exterior, outdoor
- `aerialSubj`: aerial, drone, from above, bird, birds eye

### Правила выбора (функции)

1. **style** (`pickPhotoStyle`): aerial только если subject сам про дрон/вид сверху; indoor-сюжет → никогда aerial; nature → только Photorealistic/Natural light/Documentary (aerial в ротацию **не добавлять** — ветка «close-up of pine branch» стала aerial-промптом); люди → Candid lifestyle; макро-слова → Macro.
2. **setting** (`pickPhotoSetting`): aerial → только `PHOTO_SET_AERIAL`; nature → `PHOTO_SET_OUT`; indoor → `PHOTO_SET_IN`; иначе полный пул. Antidub через `pickNotIn`.
3. **lighting/mood**: один паритет `(k+round)%2` — тёплый/холодный семейство света и настроения из пары пулов; никогда не мешать warm и cool в одном промпте.
4. **warns в buildGrid (фото)**: aerial+indoor в готовом промпте → `Конфликт перспективы`; warm+cool → `Смешан тёплый и холодный свет`.

### Ротация слотов (без изменений, плюс)

- `subject` из хуков темы (карусель), кадры-обрамления FRAMES (`close-up of`, `wide view of`, `detail of`)
- extras включает `authentic natural imperfections` (анти-пластик ИИ) и `clean composition with copy space`
- первый 3–4 промпта — ядро темы, дальше кросс-слоты; дубликаты промптов крутятся по extras

### Что нельзя делать при доработках

- Не «чинить» aerial ротацией для nature (только явный aerial в subject)
- Не возвращать свободный `rot(f.setting)` без фильтра по классификации сюжета
- Не ослаблять negative (3d render, cgi и т.д. — защита от отказов)
- Hard Rules и этот раздел — не удалять; любое ослабление — только по явной просьбе Елен

## Связанный проект

`image-generator.html` (та же папка) — генератор изображений (SiliconFlow/Pollinations/fal) для проверки этих промптов в деле; провайдер и качество — отдельный скилл не нужен, ключи SiliconFlow в localStorage `imgcfg`.

## UI (как metadata-generator)

Тёмная тема через CSS-переменные; три вкладки: **Темы → Сетка → Экспорт**; кнопки Copy
у каждого блока; мобильная адаптация (sticky-вкладки, тапы ≥40px, инпуты 16px против
зума iOS, таблицы с горизонтальным скроллом, safe-area). Копирование: clipboard API с
fallback на `execCommand` (работает на `file://` и не-secure http), скачивание .md с
fallback на prompt-окно. Названия и подписи — RU, промпты — EN.

## Verification

- `node --check` вырезанного JS или открыть в браузере, консоль без ошибок
- Сгенерированная сетка сравнивается с эталоном `уютный-интерьер_промты_2027.md` (структура: header, callout, батчи, post-gen, посевные ключи)
- Тесты: JS вырезается в `%TEMP%\stp_check.js` (маркер `/* ================= UI ================= */` делит data/UI), затем `stp_ui_stub`, `stp_ui_handlers` (18 сценариев), `stp_done_test` (4 сценария), смоук (buildGrid/urgency/календарь) из `%TEMP%\opencode\`
- `phone-server.js`: `node --check` + живой запуск (HTTP 200 на `/`, 403 на path traversal)
- Публикация: репозиторий публичный, GitHub Pages (ветка master, корень `/`),
  адрес приложения: `https://ei2405ei-art.github.io/stock-metadata-generator/Promts%20october%202026/stock-topics-prompts.html`
  (HTTPS = пункт «Установить приложение» в Chrome Android; iPhone — Safari → «На экран "Домой"»)
