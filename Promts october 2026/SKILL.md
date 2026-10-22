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
| Negative | общий: `text, watermark, logo, letters, signature, blurry, low quality, jpeg artifacts, extra limbs, deformed hands, cropped, mockup, hdr, overprocessed` + запрет темы (напр. `christmas tree`) |
| Дедлайн сезонки | загружать за **10–12 недель** до пика (модерация 1–3 нед) |
| Метаданные | Title 120–180 (2 предложения), ключи 40–49 (первые 3 — фразы), `no people`/`nobody` только если людей нет |
| Модели | опционально OpenRouter: `max_tokens: 3000`, `:free` модели без кредитов (как в stock-metadata-generator) |
| Люди в кадре | помечать «model release», либо руки без лица / спина |
| Видео | 5–60 с (вертикали 10–30 с), 24/25/30 к/с, H.264, движение обязательно |

## Prompt Diversity Algorithm

Для N промптов одной темы ротировать слоты, не повторяться:
- `subject` из хуков темы (карусель ~6–8 вариантов)
- `setting` (интерьер/лес/стол/окно/…), `lighting` (warm/soft/natural/backlight/…),
  `mood` (cozy/calm/magical/…), `extras` (macro/shallow depth of field/…), `style` (photorealistic/video/macro/aerial drone…)
- Первые 3–4 промпта — ядро темы (по хукам), дальше — кросс-слоты
- Проверять длину файла и слаг латиницей

## UI (как metadata-generator)

Тёмная тема через CSS-переменные; три вкладки: **Темы → Сетка → Экспорт**; кнопки Copy
у каждого блока; мобильная адаптация (sticky-вкладки, тапы ≥40px, инпуты 16px против
зума iOS, таблицы с горизонтальным скроллом, safe-area). Копирование: clipboard API с
fallback на `execCommand` (работает на `file://` и не-secure http), скачивание .md с
fallback на prompt-окно. Названия и подписи — RU, промпты — EN.

## Verification

- `node --check` вырезанного JS или открыть в браузере, консоль без ошибок
- Сгенерированная сетка сравнивается с эталоном `уютный-интерьер_промты_2027.md` (структура: header, callout, батчи, post-gen, посевные ключи)
- Тесты: JS вырезается в `%TEMP%\stp_check.js` (маркер `/* ================= UI ================= */` делит data/UI), затем `stp_ui_stub`, `stp_ui_handlers` (17 сценариев), `stp_done_test` (4 сценария), смоук (buildGrid/urgency/календарь) из `%TEMP%\opencode\`
- `phone-server.js`: `node --check` + живой запуск (HTTP 200 на `/`, 403 на path traversal)
