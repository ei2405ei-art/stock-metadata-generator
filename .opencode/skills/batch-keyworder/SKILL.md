# batch-keyworder skill

name: batch-keyworder
description: Use when working on batch-keyworder.html (batch title+keywords generation, drag&drop folders, Ollama/OpenRouter/Qwen/Together, EXIF/JPEG+MP4 metadata write, results/history separation)
---

# Key points
- Main file: Генератор для ключевания/batch-keyworder.html
- Providers: OpenRouter, Qwen (Alibaba), Ollama, Together AI
- Ollama: messages[0].content is a string; images go in a separate `images` array (base64 WITHOUT the `data:...;base64,` prefix). OpenAI-compatible providers (OpenRouter/Qwen/Together) use content array [{type:"text"}, {type:"image_url",image_url:{url:dataUrl}}]
- Results tab shows only last session (lastSessionResults); History tab shows saved sessions
- Tabs: panels .panel, only active shown; History panel must not leak to other tabs
- fileCount button toggles to Files tab and scrolls to #files-grid
- Drag&drop: read dt.files + dt.items synchronously, recursive folder traversal, global on window, body.drop-hot
- JPEG preserves EXIF + bytes; updates XMP APP1, IPTC IIM APP13
- MP4/MOV updates moov/udta/meta/ilst, fixes stco/co64, handles moov location
- MAX_FILES=30, title <=70, keywords 40-49 (target 45)
- AI without frame: allowed (text-only), prompt forbids inventing frame content
- Ollama on weak PC (i7-7500U, 8GB): cold model load ~45-90s, num_ctx=4096, keep_alive=4h. runBatch pre-warms the model with a ping before the loop
- Ollama env (setx): OLLAMA_ORIGINS=*, OLLAMA_KEEP_ALIVE=4h, OLLAMA_NUM_PARALLEL=1, OLLAMA_MAX_LOADED_MODELS=1
- Ollama autostart: the `ollama app.exe` tray does NOT spawn the API server on this PC. Autostart uses a VBScript (%LOCALAPPDATA%\Ollama\ollama-serve.vbs) that runs `ollama.exe serve` hidden; HKCU Run + Start Menu Ollama.lnk point to wscript.exe on that vbs
- Alibaba error text: "Нужен ключ Alibaba Cloud Model Studio (DashScope). Нет доступа к сайту или нет ключа? Переключитесь на Ollama (локально, бесплатно)."
- History stored in IndexedDB + localStorage, renderHistory/loadHistorySessions

## Critical fixes applied
- ollamaRequest: content is string prompt when no image, array only with image
- Separated results vs history: lastSessionResults rendered only in Results; sessions saved on batch end
- Tabs switch correctly; added tab-history panel
- fileCount has onclick to switch tab and scroll
- filesFromDrop rewritten for folders and text-drag ignore
- AI fallback without image fixed
- Why-block for non-AI results with ai_error
