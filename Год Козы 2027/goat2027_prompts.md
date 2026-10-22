# Год Козы 2027 — готовые промпты для генерации (50 работ)

Копируете промпт под работой → генерируете в Midjourney / DALL-E / Flux / Kandinsky / Kling / Runway и т.п. → обрабатываете по инструкции «Что делать после генерации» → дальше работаете с файлом по `goat2027_batch_plan.md` (имя файла из matrix).

## Общий negative prompt (для генераторов с негативом)

`text, watermark, logo, letters, signature, username, blurry, low quality, jpeg artifacts, extra limbs, deformed hands, deformed face, cropped, frame, border mockup`

## Что делать после генерации

**Фото (p01–p15):**
1. Апскейл до минимум 4 МП (лучше 12–24 МП) — но **без «мыла»**.
2. Проверка рук/лиц/зубов в 100% (типичный ИИ-брак → отказ).
3. Экспорт: JPEG, sRGB, ≤45 МБ. Имя = колонка `Filename` из matrix (`goat2027-p01-horns.jpg`).

**Вектор (v01–v20):**
- Вариант А (настоящий вектор): PNG → Illustrator → Image Trace (preset High Fidelity Photo или 3-6 colors) → Expand → почистить узлы → сохранить EPS/AI + JPG-превью.
- Вариант Б (без Illustrator): генерируйте сразу качественно (минимум 2048 px), загружайте как растровую иллюстрацию, категория из matrix (8 или 15), тип контента — Illustrations. В батче-плане пометьте, что файл растровый.
- Имя файла: `goat2027-v01-banner.eps` (или `.jpg` для варианта Б — тогда поправьте Filename в CSV под реальное расширение).

**Видео (vid01–vid15):**
1. Генерируйте сразу в нужном разрешении: HD 1920×1080 (16:9), вертикали — **нативно 9:16 / 1080×1920**, квадрат — 1080×1080. Апскейл = отказ.
2. Длительность 5–60 с (вертикалям — 10–30 с), кадр 24/25/30.
3. Без текста, титров, переходов и логотипов в кадре; движение должно читаться с первого взгляда.
4. Кодек H.264 (MP4). Имя: `goat2027-vid01-fire.mp4` и т.д.

---

## Батч 1 — Vector (10)

### 1. goat2027-v01-banner.eps — Баннер изумруд+сливовый
```
Horizontal banner design for lunar new year 2027 year of the goat, stylized goat head in emerald green and plum purple, plum blossom branches, oriental cloud motifs, cream background, flat vector illustration style, elegant, festive, clean negative space on the right side for text, no text --ar 3:1
```

### 2. goat2027-v02-poster.eps — Постер лаки-палитра
```
Vertical poster design year of the goat 2027, stylized goat in lucky colors emerald green deep red and purple, ornamental frame with cloud and blossom pattern, starburst texture background, flat vector illustration, festive lunar new year, no text --ar 2:3
```

### 3. goat2027-v03-papercut.eps — Paper-cut
```
Chinese paper cut artwork, goat silhouette in the center surrounded by lanterns plum blossom and auspicious clouds, layered red and gold paper, intricate symmetrical cuts, traditional lunar new year decoration, flat vector style, no text --ar 2:3
```

### 4. goat2027-v04-inkline.eps — Ч/б line art
```
Minimal black ink line art of a goat head, single continuous flowing line, swirling oriental cloud pattern woven around it, cream paper background, elegant calligraphic brush strokes, oriental minimalism, no text --ar 3:2
```

### 5. goat2027-v05-riso.eps — Ризограф
```
Risograph print style goat head, misregistered multicolor layers in pink blue and yellow, visible grain and paper texture, retro offset printing look, trendy poster art, lunar new year goat zodiac, no text --ar 4:5
```

### 6. goat2027-v06-midcen.eps — Mid-century
```
Mid century modern illustration of a geometric goat, atomic starburst, boomerang shapes, teal orange and cream palette, flat shapes, retro 1950s poster style, lunar new year goat zodiac, no text --ar 3:2
```

### 7. goat2027-v07-scandi.eps — Скандинавский минимал
```
Scandinavian minimal illustration, simple goat silhouette, small crescent moon and pine branch, soft pastel colors, cozy calm composition, nordic wall art style, lots of negative space, no text --ar 4:5
```

### 8. goat2027-v08-pattern.eps — Бесшовный паттерн
```
Seamless repeating pattern tile, small goat silhouettes, oriental clouds and plum blossom motifs, balanced festive palette of red green and purple on cream, flat vector surface design, evenly distributed elements, no text --ar 1:1
```

### 9. goat2027-v09-wrap.eps — Обёрточная бумага
```
Three sheets of wrapping paper designs side by side, playful goat pattern in red color scheme, green color scheme and cream color scheme, gift wrap product mockup style, flat vector print designs, lunar new year theme, no text --ar 3:2
```

### 10. goat2027-v10-hongbao.eps — Хунбао
```
Set of four red envelope hongbao designs, goat motifs and ornamental gold cloud pattern, vertical envelope shapes arranged in a row, traditional lunar new year money gift packets, flat vector illustration, no text --ar 3:4
```

---

## Батч 2 — Vector (10)

### 11. goat2027-v11-lanterns.eps — Фонари
```
Illustration set of traditional Chinese paper lanterns, one large central lantern with a small goat emblem and red tassel, two smaller lanterns around, fine ornamental linework, festival poster style, flat vector, no text --ar 4:5
```

### 12. goat2027-v12-calendar.eps — Календарь 2027
```
Year 2027 calendar illustration, circular goat zodiac wheel in the center, clean month grid below, decorative cloud corners, red green and cream palette, printable planner page design, flat vector, blank calendar grid, no text except numbers 2027 --ar 3:4
```

### 13. goat2027-v13-logo.eps — Goat-логотип
```
Minimal goat logo mark, geometric ram horn shapes forming an abstract monogram, single line construction, centered on white background, modern brand identity style, vector logo design, no text --ar 1:1
```

### 14. goat2027-v14-card.eps — Открытка с местом под текст
```
Lunar new year greeting card layout, elegant goat ornament border with plum blossom and clouds, completely blank cream space in the center for custom text, flat vector stationery design, red and green accents, no text --ar 3:2
```

### 15. goat2027-v15-yang.eps — goat/sheep/ram объяснение
```
Educational flat illustration comparing three horned animals side by side: mountain goat, fluffy sheep and ram, simple labeled diagram style with the Chinese character 羊 above them, clean vector infographic look, cream background, no other text --ar 3:2
```

### 16. goat2027-v16-pixel.eps — 8-bit
```
Pixel art goat character, retro 8 bit arcade game style, blocky shading, bright red and gold pixels, cute mascot on dark pixel background, isometric-free flat sprite look, nostalgic videogame art, no text --ar 1:1
```

### 17. goat2027-v17-linocut.eps — Линогравюра
```
Linocut relief print of a horned goat, black and red ink, uneven hand printed texture, rough carved edges, simple decorative folk border, handmade craft poster, rustic paper texture, no text --ar 2:3
```

### 18. goat2027-v18-tet.eps — Вьетнамский Тет
```
Vietnamese tet inspired illustration of a goat with yellow apricot blossom mai branches, fresh spring green and yellow palette, folk ornament details, lunar new year vietnam style, flat vector, no text --ar 3:4
```

### 19. goat2027-v19-seollal.eps — Корейский Соллаль
```
Korean seollal themed illustration of a goat with soft taegeuk red and blue pattern accents, hanbok inspired color palette, calm respectful holiday mood, flat vector korean lunar new year style, no text --ar 3:4
```

### 20. goat2027-v20-fire.eps — Огненная Коза
```
Dramatic fire goat zodiac illustration, stylized goat with yin flame energy and ember sparks, deep cosmic starry night background, red orange and purple glow, dynamic mystical astrology poster, flat vector with glow effects, no text --ar 2:3
```

---

## Батч 3 — Photo (8)

### 21. goat2027-p01-horns.jpg — Девушка в рогах
```
Photorealistic lifestyle photo, smiling young woman wearing a soft plush goat horn headband, sitting at a warm home dinner table decorated for lunar new year, red paper lanterns and plum blossom in background, cozy evening light, natural skin tones, shallow depth of field, 50mm lens --ar 3:2 --style raw
```

### 22. goat2027-p02-masks.jpg — Дети в масках
```
Photorealistic photo, group of happy children wearing handmade paper goat masks at a school craft party, paints and paper on the table, festive lunar new year classroom decoration, bright daylight, candid moment, documentary style --ar 3:2 --style raw
```

### 23. goat2027-p03-food.jpg — Еда флэтлей
```
Photorealistic top view flatlay, festive lunar new year dinner table, lamb stew dish, tangerines, fresh herbs, chopsticks, one red envelope, warm wooden table surface, soft daylight, food photography, appetizing --ar 3:2 --style raw
```

### 24. goat2027-p04-hands.jpg — Руки с конвертом
```
Photorealistic close up, adult hands holding a red hongbao envelope decorated with a small goat ornament and cloud pattern, soft warm indoor light, blurred festive background, macro details of paper texture --ar 3:2 --style raw
```

### 25. goat2027-p05-interior.jpg — Гостиная с декором
```
Photorealistic interior photo, cozy living room decorated for lunar new year, ceramic goat figurine on the coffee table, red paper lanterns, red cushions on sofa, warm evening lamp light, lifestyle magazine photography --ar 3:2 --style raw
```

### 26. goat2027-p06-farm.jpg — Коза с лентой
```
Photorealistic animal portrait, curious farm goat wearing a gentle red ribbon bow, snowy countryside background with a wooden barn, soft winter daylight, shallow depth of field, natural colors --ar 3:2 --style raw
```

### 27. goat2027-p07-embroid.jpg — Макро вышивки
```
Photorealistic macro photograph, handmade embroidery with a goat motif, colorful thread stitches in red green and gold on natural linen fabric, visible textile texture, soft studio light, craft photography --ar 3:2 --style raw
```

### 28. goat2027-p08-yoga.jpg — Goat yoga
```
Photorealistic outdoor photo, goat yoga class on green grass, adults holding yoga poses on mats while small friendly goats walk around, sunny spring day, lifestyle wellness photography, natural candid moment --ar 3:2 --style raw
```

---

## Батч 4 — Photo (7)

### 29. goat2027-p09-family.jpg — ИИ-семья (fictional!)
```
Photorealistic image of a fictional happy family of three, mother father and child smiling at a home dinner table decorated for lunar new year, red lanterns and small goat ornament, warm evening light, stock photo style --ar 3:2 --style raw
```
⚠ В портале: галки «Created using generative AI tools» + «People and Property are fictional».

### 30. goat2027-p10-brush.jpg — Кисть и иероглиф 羊
```
Photorealistic still life, calligraphy brush lying beside an ink stone, handmade paper with the freshly brushed Chinese character 羊 in black ink, small red seal stamp, warm wooden desk, soft window light, cultural photography --ar 3:2 --style raw
```

### 31. goat2027-p11-window.jpg — Фигурка на подоконнике
```
Photorealistic minimal still life, small ceramic goat figurine on a snowy windowsill, lit candle and pine branch nearby, frosty winter daylight through the glass, cozy calm mood, lifestyle photography --ar 3:2 --style raw
```

### 32. goat2027-p12-baker.jpg — Пекарень и печенье
```
Photorealistic photo, focused woman baker in an apron decorating goat shaped cookies with icing piping bag, warm home kitchen, flour on the table, holiday baking mood, natural light, candid lifestyle photography --ar 3:2 --style raw
```

### 33. goat2027-p13-market.jpg — Ночной рынок
```
Photorealistic night market scene, red lanterns glowing above a stall full of plush goat toys, people browsing in the blurred background, vibrant city street, travel photography, warm bokeh lights --ar 3:2 --style raw
```

### 34. goat2027-p14-hanging.jpg — Женщина вешает вырезку
```
Photorealistic photo, gentle elderly woman taping a red paper cutting decoration onto a home window, soft winter daylight, calm traditional atmosphere, documentary lifestyle photography, warm skin tones --ar 3:2 --style raw
```

### 35. goat2027-p15-balloon.jpg — Ребёнок со шаром
```
Photorealistic photo, happy child holding a red goat shaped balloon, walking among lunar new year street parade decorations, daytime city festival, colorful festive mood, candid family photography --ar 3:2 --style raw
```

---

## Батч 5 — Video HD/4K (8)

Промпты для Runway / Kling / Luma / Veo. Длительность 5–15 с, луп.

### 36. goat2027-vid01-fire.mp4 — Огненная коза + искры
```
Motion graphic loop, stylized goat figure made of fire and glowing embers on a dark cosmic background, sparks rise slowly upward, flames flicker gently, cinematic glow, seamless loop, 4K --ar 16:9
```

### 37. goat2027-vid02-brush.mp4 — Кисть пишет 羊 (4K)
```
Close top down view, calligraphy brush slowly paints bold black ink strokes on cream paper, ink flows along the bristles, warm studio light, meditative slow motion, then hand places a small red seal stamp beside the strokes, 4K --ar 16:9
```
⚠ Китайские иероглифы генераторы рисуют плохо: лучше получить «мазки туши» и наложить 羊 в постобработке (Illustrator/Photoshop), либо оставить абстрактные мазки.

### 38. goat2027-vid03-lanterns.mp4 — Фонари качаются
```
Night footage, red paper lanterns swinging gently in a light breeze, warm inner glow, soft bokeh of blurred street lights behind, slow subtle camera drift, festive calm mood, seamless loop --ar 16:9
```

### 39. goat2027-vid04-candles.mp4 — Свечи и конверты
```
Slow close video, warm candle flames flicker beside red envelopes and a small goat figurine on a wooden table, cozy evening interior, soft bokeh background, gentle camera push in, calm holiday mood --ar 16:9
```

### 40. goat2027-vid05-papercut.mp4 — Слои paper-cut
```
Motion video, layered paper cut artwork of a goat, camera slowly reveals deeper layers of red and white paper, moving light and shadow glide across the surface, elegant craft showcase, top down view --ar 16:9
```

### 41. goat2027-vid06-incense.mp4 — Благовония и слива
```
Meditative video, thin incense smoke rising slowly beside a plum blossom branch in a small vase, calm ritual still life, soft directional light, gentle drift of smoke, peaceful mood, seamless loop --ar 16:9
```

### 42. goat2027-vid07-moon.mp4 — Коза под луной
```
Dreamy night scene, goat silhouette standing on a hill under a glowing full moon, clouds drift slowly across a starry purple blue sky, subtle glow, mystical calm atmosphere, slow motion --ar 16:9
```

### 43. goat2027-vid08-dumpling.mp4 — Пар из-под цзяоцзы
```
Appetizing close video, steaming dumplings in a bamboo basket on a wooden table, warm steam rises slowly, soft kitchen light, slight camera movement, cozy home cooking mood --ar 16:9
```

---

## Батч 6 — Video вертикали + квадрат (7)

Генерировать **сразу вертикально 9:16** (или квадрат 1:1) — не кадрировать из 16:9.

### 44. goat2027-vid09-confetti.mp4 — Конфетти 9:16
```
Vertical slow motion video, red green and purple confetti ribbons falling from the top on a clean cream background, soft studio light, festive celebration mood, seamless loop --ar 9:16
```

### 45. goat2027-vid10-lanterns.mp4 — Фонари вверх 9:16
```
Vertical video, red lanterns slowly rising into a dark night sky, warm glow, drifting bokeh, dreamy wishful mood, slow elegant motion --ar 9:16
```

### 46. goat2027-vid11-ink.mp4 — Мазок туши 9:16
```
Vertical close top down video, black ink brush draws one long flowing line across cream paper, visible paper fiber texture, calm slow pace, minimal elegant --ar 9:16
```

### 47. goat2027-vid12-plush.mp4 — Плюшевая коза 9:16
```
Vertical video, slow camera pan over a soft plush goat toy wearing a red ribbon, cozy warm indoor light, shallow depth of field, gentle gift guide mood --ar 9:16
```

### 48. goat2027-vid13-moon.mp4 — Полумесяц и коза 9:16
```
Vertical video, goat silhouette under a bright crescent moon, stars twinkle, clouds drift across a deep blue purple night sky, mystical calm slow motion --ar 9:16
```

### 49. goat2027-vid14-fabric.mp4 — Текстиль 9:16
```
Vertical video, slow camera pan over printed textile with a repeating pattern of goats clouds and plum blossom in red green and purple, visible fabric weave texture, product showcase style --ar 9:16
```

### 50. goat2027-vid15-hands.mp4 — Руки открывают хунбао 1:1
```
Square close top view video, hands slowly open a red hongbao envelope on a wooden table in warm light, revealing a money gift inside, gentle deliberate movement, festive mood --ar 1:1
```

---

## Полный цикл (одна работа, пример)

1. Берёте промпт №1 (v01) → генерируете в Midjourney (`--ar 3:1` в конце) или другом генераторе.
2. Получили PNG → для вектора: Illustrator → Image Trace → EPS. Имя: `goat2027-v01-banner.eps`.
3. Проверяете по чек-листу (чистота, размеры, нет текста в кадре).
4. Метаданные: берёте Title и Keywords из `goat2027_adobe_upload.csv`, строка 1 — или генерируете через `batch-keyworder.html` и сверяете с matrix.
5. Грузите файл + строку CSV в портал Adobe → reorder первых 10 ключей → модерация.
