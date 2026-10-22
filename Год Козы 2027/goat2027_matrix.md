# Год Козы 2027 — матрица тем (50 работ)

Полные метаданные — в `goat2027_matrix.csv` (13 колонок). Готовый CSV для портала Adobe — `goat2027_adobe_upload.csv` (строго `Filename,Title,Keywords,Category,Releases`).

## Файлы

| Файл | Что это |
|---|---|
| `goat2027_matrix.csv` | Полная таблица: концепт, Title ≤70 (портал), Title 120–180 (Shutterstock/описания/генератор), 40–49 EN ключей, RU-ключи (справочно), категория, флаги |
| `goat2027_adobe_upload.csv` | Загрузочный CSV под Contributor Portal (50 строк, EN, категория — номер 1–21) |
| `goat2027_batch_plan.md` | Календарь 6 батчей, workflow, ТЗ по форматам |

## Правила, заложенные в таблицу (из `Генератор для ключевания/`)

- **Title ≤70 символов, без запятых** — субъект + действие/контекст; каждое важное слово продублировано в ключах.
- **Title long 120–180** — 2 предложения (что в кадре → смысл и применение); для Shutterstock и как источник `metadata-generator.html`.
- **Keywords 40–49**, порядок = вес; **первые 3 — двухсловные фразы, уникальные для каждой из 50 работ** (анти-дубли в серии).
- **Только EN** в портале. RU-колонка — справочная, в загрузку НЕ идёт.
- `no people` + `nobody` проставлены там, где людей нет. Видео вертикали содержат `vertical` + `video`.
- Повтор одного ключа внутри строки исключён.

## Распределение

| № | Файл | Формат | Концепт | Категория | Флаги |
|---|---|---|---|---|---|
| 1 | goat2027-v01-banner.eps | vector | Баннер, изумруд+сливовый, без золота | 8 | AI |
| 2 | goat2027-v02-poster.eps | vector | Постер, лаки-цвета зелёный/красный/фиолетовый | 8 | AI |
| 3 | goat2027-v03-papercut.eps | vector | Paper-cut: коза, фонари, слива | 15 | AI |
| 4 | goat2027-v04-inkline.eps | vector | Ч/б line art с облаками | 8 | AI |
| 5 | goat2027-v05-riso.eps | vector | Ризограф, многоцветные слои | 8 | AI |
| 6 | goat2027-v06-midcen.eps | vector | Mid-century геометрия | 8 | AI |
| 7 | goat2027-v07-scandi.eps | vector | Скандинавский минимал, луна+сосна | 8 | AI |
| 8 | goat2027-v08-pattern.eps | vector | Бесшовный паттерн | 8 | AI |
| 9 | goat2027-v09-wrap.eps | vector | Обёрточная бумага, набор из 3 | 8 | AI |
| 10 | goat2027-v10-hongbao.eps | vector | Хунбао, набор конвертов | 15 | AI |
| 11 | goat2027-v11-lanterns.eps | vector | Набор бумажных фонарей | 15 | AI |
| 12 | goat2027-v12-calendar.eps | vector | Календарь 2027 с зодиакальным колесом | 8 | AI |
| 13 | goat2027-v13-logo.eps | vector | Goat-логотип, монограмма из рогов | 8 | AI |
| 14 | goat2027-v14-card.eps | vector | Открытка с местом под текст/логотип | 8 | AI |
| 15 | goat2027-v15-yang.eps | vector | Объяснение goat/sheep/ram + иероглиф 羊 | 15 | AI |
| 16 | goat2027-v16-pixel.eps | vector | 8-bit pixel goat | 8 | AI |
| 17 | goat2027-v17-linocut.eps | vector | Линогравюра | 8 | AI |
| 18 | goat2027-v18-tet.eps | vector | Вьетнамский Тет, цветок абрикоса | 15 | AI |
| 19 | goat2027-v19-seollal.eps | vector | Корейский Соллаль, тэгык | 15 | AI |
| 20 | goat2027-v20-fire.eps | vector | Огненная Коза 丁未, космос | 8 | AI |
| 21 | goat2027-p01-horns.jpg | photo | Девушка в рогах на лунном ужине | 12 | model release |
| 22 | goat2027-p02-masks.jpg | photo | Дети в бумажных масках в школе | 12 | model release (дети) |
| 23 | goat2027-p03-food.jpg | photo | Флэтлей: баранина, мандарины, конверт | 7 | без людей |
| 24 | goat2027-p04-hands.jpg | photo | Руки с хунбао, макро | 12 | без лиц → release не нужен |
| 25 | goat2027-p05-interior.jpg | photo | Гостиная с декором лунного НГ | 12 | без людей |
| 26 | goat2027-p06-farm.jpg | photo | Коза с красной лентой, зимняя ферма | 1 | без людей |
| 27 | goat2027-p07-embroid.jpg | photo | Макро вышивки с козой на льне | 9 | без людей |
| 28 | goat2027-p08-yoga.jpg | photo | Goat yoga на улице | 18 | model release |
| 29 | goat2027-p09-family.jpg | photo | ИИ-семья за лунным столом | 12 | fictional + AI-чекбоксы |
| 30 | goat2027-p10-brush.jpg | photo | Натюрморт: кисть, тушь, иероглиф 羊 | 15 | без людей |
| 31 | goat2027-p11-window.jpg | photo | Фигурка козы на снежном подоконнике | 12 | без людей |
| 32 | goat2027-p12-baker.jpg | photo | Пекарень декорирует печенье-коз | 7 | model release |
| 33 | goat2027-p13-market.jpg | photo | Ночной рынок: фонари, плюшевые козы | 12 | по факту |
| 34 | goat2027-p14-hanging.jpg | photo | Пожилая женщина вешает вырезку | 15 | model release |
| 35 | goat2027-p15-balloon.jpg | photo | Ребёнок со шаром-козой на параде | 12 | model release (ребёнок) |
| 36 | goat2027-vid01-fire.mp4 | video | Огненная коза + искры, луп HD | 8 | AI |
| 37 | goat2027-vid02-brush.mp4 | video | Кисть пишет 羊, 4K, руки в кадре | 15 | AI |
| 38 | goat2027-vid03-lanterns.mp4 | video | Качающиеся фонари ночью, HD | 15 | AI |
| 39 | goat2027-vid04-candles.mp4 | video | Свечи + конверты + фигурка, HD | 12 | AI |
| 40 | goat2027-vid05-papercut.mp4 | video | Раскрытие слоёв paper-cut, HD | 15 | AI |
| 41 | goat2027-vid06-incense.mp4 | video | Дым благовоний + ветка сливы, HD | 15 | AI |
| 42 | goat2027-vid07-moon.mp4 | video | Коза под луной, дрейф облаков, HD | 8 | AI |
| 43 | goat2027-vid08-dumpling.mp4 | video | Пар из-под цзяоцзы, HD | 7 | AI |
| 44 | goat2027-vid09-confetti.mp4 | video | Конфетти, вертикаль 9:16 | 8 | AI |
| 45 | goat2027-vid10-lanterns.mp4 | video | Взлёт фонарей, вертикаль 9:16 | 15 | AI |
| 46 | goat2027-vid11-ink.mp4 | video | Мазок туши, вертикаль 9:16 | 15 | AI |
| 47 | goat2027-vid12-plush.mp4 | video | Плюшевая коза, пан, вертикаль 9:16 | 12 | AI |
| 48 | goat2027-vid13-moon.mp4 | video | Полумесяц + коза, вертикаль 9:16 | 8 | AI |
| 49 | goat2027-vid14-fabric.mp4 | video | Пан по текстильному паттерну, 9:16 | 8 | AI |
| 50 | goat2027-vid15-hands.mp4 | video | Руки открывают хунбао, квадрат 1:1 | 12 | AI |

## Смысловые якоря (уникальные первые фразы)

`goat banner` · `year goat` · `paper cut` · `ink goat` · `riso goat` · `mid century` · `scandi goat` · `goat pattern` · `paper wrap` · `red envelope` · `lantern set` · `goat calendar` · `goat logo` · `greeting card` · `zodiac quiz` · `pixel goat` · `linocut goat` · `viet tet` · `korean seollal` · `fire goat` · `woman goat horns` · `children goat masks` · `lamb tangerine` · `hands red envelope` · `living room lunar` · `goat red ribbon` · `goat embroidery` · `goat yoga class` · `family lunar photo` · `brush ink goat` · `goat figurine snow` · `baker goat cookies` · `market lantern stall` · `woman paper cutting` · `child goat balloon` · `fire goat loop` · `brush painting yang` · `lanterns swinging night` · `candle envelope table` · `papercut layers reveal` · `incense smoke plum` · `moon goat silhouette` · `dumplings steaming` · `confetti drop vertical` · `lanterns rising vertical` · `ink stroke vertical` · `plush goat pan` · `crescent moon goat` · `textile pattern pan` · `envelope opening hands`

## Ключевые словарные группы (общие для серии)

- **Зодиак:** goat, sheep, ram, zodiac, 2027, lunar, chinese, new, year, fire, yin, yang, horoscope, astrology
- **Праздник:** celebration, festival, festive, greeting, tradition, culture, asia, oriental, auspicious, fortune, luck
- **Объекты:** lantern, envelope, hongbao, blossom, plum, cloud, paper, cut, ink, brush, pattern, ribbon, balloon
- **Палитра года:** emerald, green, purple, plum, red, cream (лаки-зелёный+фиолетовый вместо золота)
- **Видео:** video + vertical (для 9:16) + глаголы движения (swinging, rising, falling, drifting, painting)

## Как использовать с metadata-generator.html / batch-keyworder.html

1. Готовите файл строго по имени из колонки `Filename` (≤30 симв., латиница, байт-в-байт).
2. Запускаете батч (≤30 файлов в batch-keyworder). Модель выдаёт title ≤70 и 40–49 ключей.
3. Сверяете выход с колонками `Title EN` и `Seed keywords EN` этой матрицы: якорные фразы (первые 3) должны сохраниться, дубли между файлами серии — исключены (`prevNote` / usedKeywords).
4. При расхождении правите вручную по матрице — она и есть эталон серии.
5. Экспорт в `goat2027_adobe_upload.csv` (перегенерировать из matrix можно скриптом или вручную).
6. Отправка: файлы + CSV **в одной сессии**; reorder первых 10 ключей в портале.

## Напоминания по контенту

- Палитра: **лаки-зелёный, красный, фиолетовый**; золото — только в узких «классических» нишах (v03, v10, v27), это осознанный выбор, а не мейнстрим.
- Иероглиф 羊 (ян) входит в 祥 (благополучие) и 善 (доброта) — смысловой крючок для заголовков.
- Даты: Новый год по лунному календарю — **6 февраля 2027**, год Огненной Козы 丁未 до 25 января 2028.
- Локали в ключах уже заложены: vietnam/tet, korea/seollal, saigon/hanoi/seoul.
