# batch-keyworder skill

name: batch-keyworder
description: Use when working on batch-keyworder.html (batch title+keywords generation, drag&drop folders, Ollama/OpenRouter/Qwen/Together, EXIF/JPEG+MP4 metadata write, results/history separation)
---

# Key points
- Main file: Генератор для ключевания/batch-keyworder.html
- Providers: OpenRouter, Qwen (Alibaba), Ollama, Together AI
- Ollama: messages[0].content must be string (not array); multimodal only when imageDataUrl exists
- Results tab shows only last session (lastSessionResults); History tab shows saved sessions
- Tabs: panels .panel, only active shown; History panel must not leak to other tabs
- fileCount button toggles to Files tab and scrolls to #files-grid
- Drag&drop: read dt.files + dt.items synchronously, recursive folder traversal, global on window, body.drop-hot
- JPEG preserves EXIF + bytes; updates XMP APP1, IPTC IIM APP13
- MP4/MOV updates moov/udta/meta/ilst, fixes stco/co64, handles moov location
- MAX_FILES=30, title <=70, keywords 40-49 (target 45)
- AI without frame: allowed (text-only), prompt forbids inventing frame content
- Alibaba error text: "Нужен ключ Alibaba Cloud Model Studio (DashScope) API key (sk-...). Бесплатная квота доступна новым аккаунтам."
- History stored in IndexedDB + localStorage, renderHistory/loadHistorySessions

## Critical fixes applied
- ollamaRequest: content is string prompt when no image, array only with image
- Separated results vs history: lastSessionResults rendered only in Results; sessions saved on batch end
- Tabs switch correctly; added tab-history panel
- fileCount has onclick to switch tab and scroll
- filesFromDrop rewritten for folders and text-drag ignore
- AI fallback without image fixed
- Why-block for non-AI results with ai_error
