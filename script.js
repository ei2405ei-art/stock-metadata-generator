(() => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const previewContainer = document.getElementById('previewContainer');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const speedSlider = document.getElementById('speed');
    const speedValue = document.getElementById('speedValue');
    const animBtns = document.querySelectorAll('.anim-btn');
    const removeBtn = document.getElementById('removeBtn');

    let sourceImage = null;
    let animFrame = null;
    let currentAnimation = null;
    let startTime = 0;
    let isRecording = false;
    let recordedFrames = [];

    const GIF_WIDTH = 480;
    const GIF_FPS = 20;
    const GIF_DURATION_MS = 2000;

    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) loadImage(e.target.files[0]);
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files[0]) loadImage(e.dataTransfer.files[0]);
    });

    function loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                sourceImage = img;
                const scale = Math.min(GIF_WIDTH / img.width, 1);
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                previewContainer.classList.add('active');
                uploadArea.style.display = 'none';
                animBtns.forEach(b => b.classList.remove('active'));
                currentAnimation = null;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    speedSlider.addEventListener('input', () => {
        speedValue.textContent = parseFloat(speedSlider.value).toFixed(1) + 'x';
    });

    animBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            animBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentAnimation = btn.dataset.animation;
        });
    });

    removeBtn.addEventListener('click', () => {
        stopAnimation();
        sourceImage = null;
        recordedFrames = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        previewContainer.classList.remove('active');
        uploadArea.style.display = '';
        fileInput.value = '';
        downloadBtn.disabled = true;
        animBtns.forEach(b => b.classList.remove('active'));
        currentAnimation = null;
    });

    startBtn.addEventListener('click', startAnimation);
    stopBtn.addEventListener('click', stopAnimation);
    downloadBtn.addEventListener('click', exportGIF);

    function startAnimation() {
        if (!sourceImage || !currentAnimation) return;
        stopAnimation();
        startTime = performance.now();
        isRecording = true;
        recordedFrames = [];
        startBtn.disabled = true;
        stopBtn.disabled = false;
        downloadBtn.disabled = true;
        animate();
    }

    function stopAnimation() {
        if (animFrame) cancelAnimationFrame(animFrame);
        animFrame = null;
        isRecording = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        if (recordedFrames.length > 0) downloadBtn.disabled = false;
    }

    function animate() {
        if (!isRecording) return;
        const now = performance.now();
        const elapsed = now - startTime;
        const speed = parseFloat(speedSlider.value);
        const t = (elapsed * speed) / 1000;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        switch (currentAnimation) {
            case 'pulse': drawPulse(t, cx, cy); break;
            case 'rotate': drawRotate(t, cx, cy); break;
            case 'shake': drawShake(t); break;
            case 'float': drawFloat(t, cx, cy); break;
            case 'glow': drawGlow(t); break;
            case 'wave': drawWave(t); break;
            case 'zoom': drawZoom(t, cx, cy); break;
            case 'rgb': drawRGB(t); break;
        }

        ctx.restore();

        if (isRecording) {
            const frameInterval = 1000 / GIF_FPS;
            if (recordedFrames.length === 0 || (elapsed - recordedFrames[recordedFrames.length - 1].time) >= frameInterval) {
                recordedFrames.push({
                    data: ctx.getImageData(0, 0, canvas.width, canvas.height),
                    time: elapsed
                });
            }
        }

        if (isRecording && elapsed >= GIF_DURATION_MS) {
            if (recordedFrames.length === 0) {
                recordedFrames.push({
                    data: ctx.getImageData(0, 0, canvas.width, canvas.height),
                    time: 0
                });
            }
            stopAnimation();
            return;
        }

        animFrame = requestAnimationFrame(animate);
    }

    function drawPulse(t, cx, cy) {
        const scale = 1 + 0.15 * Math.sin(t * Math.PI * 2);
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    }

    function drawRotate(t, cx, cy) {
        const angle = t * Math.PI * 0.5;
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.translate(-cx, -cy);
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    }

    function drawShake(t) {
        const decay = Math.max(0, 1 - (t % 3) / 3);
        const dx = 10 * Math.sin(t * 20) * decay;
        const dy = 6 * Math.cos(t * 16) * decay;
        ctx.drawImage(sourceImage, dx, dy, canvas.width, canvas.height);
    }

    function drawFloat(t, cx, cy) {
        const dy = 15 * Math.sin(t * Math.PI);
        const shadowDist = 10 + dy * 0.5;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetY = shadowDist;
        ctx.drawImage(sourceImage, 0, dy, canvas.width, canvas.height);
    }

    function drawGlow(t) {
        const hue = (t * 60) % 360;
        const glow = 15 + 20 * Math.abs(Math.sin(t * Math.PI));
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        ctx.shadowBlur = glow;
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
        ctx.shadowBlur = glow * 0.6;
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    }

    function drawWave(t) {
        const sliceH = 2;
        for (let y = 0; y < canvas.height; y += sliceH) {
            const dx = 12 * Math.sin((y / 25) + t * Math.PI * 2);
            ctx.drawImage(sourceImage, 0, y, canvas.width, sliceH, dx, y, canvas.width, sliceH);
        }
    }

    function drawZoom(t, cx, cy) {
        const scale = 1 + 0.2 * Math.sin(t * Math.PI * 2);
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
    }

    function drawRGB(t) {
        const offset = Math.round(5 + 5 * Math.sin(t * Math.PI * 2));
        const w = canvas.width, h = canvas.height;

        const tmp = document.createElement('canvas');
        tmp.width = w;
        tmp.height = h;
        const tmpCtx = tmp.getContext('2d');
        tmpCtx.drawImage(sourceImage, 0, 0, w, h);
        const src = tmpCtx.getImageData(0, 0, w, h);
        const sd = src.data;

        const rCvs = document.createElement('canvas');
        rCvs.width = w; rCvs.height = h;
        const rCtx = rCvs.getContext('2d');
        const rImg = rCtx.createImageData(w, h);

        const gCvs = document.createElement('canvas');
        gCvs.width = w; gCvs.height = h;
        const gCtx = gCvs.getContext('2d');
        const gImg = gCtx.createImageData(w, h);

        const bCvs = document.createElement('canvas');
        bCvs.width = w; bCvs.height = h;
        const bCtx = bCvs.getContext('2d');
        const bImg = bCtx.createImageData(w, h);

        for (let i = 0; i < sd.length; i += 4) {
            rImg.data[i] = sd[i]; rImg.data[i+1] = 0; rImg.data[i+2] = 0; rImg.data[i+3] = 255;
            gImg.data[i] = 0; gImg.data[i+1] = sd[i+1]; gImg.data[i+2] = 0; gImg.data[i+3] = 255;
            bImg.data[i] = 0; bImg.data[i+1] = 0; bImg.data[i+2] = sd[i+2]; bImg.data[i+3] = 255;
        }

        rCtx.putImageData(rImg, 0, 0);
        gCtx.putImageData(gImg, 0, 0);
        bCtx.putImageData(bImg, 0, 0);

        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'lighter';
        ctx.drawImage(rCvs, -offset, 0);
        ctx.drawImage(gCvs, 0, 0);
        ctx.drawImage(bCvs, offset, 0);
        ctx.globalCompositeOperation = 'source-over';
    }

    function exportGIF() {
        if (recordedFrames.length === 0) return;
        downloadBtn.disabled = true;
        downloadBtn.textContent = '⏳ Генерация GIF...';

        setTimeout(() => {
            try {
                const w = recordedFrames[0].data.width;
                const h = recordedFrames[0].data.height;
                const palette = buildPalette();
                const frames = recordedFrames.map(f => quantizeFrame(f.data, palette));
                const delay = Math.round(100 / GIF_FPS);
                const blob = encodeGIF(w, h, palette, frames, delay);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'animated.gif';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (err) {
                console.error(err);
                alert('Ошибка экспорта: ' + err.message);
            }
            downloadBtn.disabled = false;
            downloadBtn.textContent = '💾 Скачать GIF';
        }, 100);
    }

    function buildPalette() {
        const pal = [];
        for (let r = 0; r < 6; r++) {
            for (let g = 0; g < 6; g++) {
                for (let b = 0; b < 6; b++) {
                    pal.push([
                        Math.round(r * 255 / 5),
                        Math.round(g * 255 / 5),
                        Math.round(b * 255 / 5)
                    ]);
                }
            }
        }
        while (pal.length < 256) pal.push([0, 0, 0]);
        return pal;
    }

    function quantizeFrame(imageData, palette) {
        const d = imageData.data;
        const pixels = new Uint8Array(d.length / 4);
        for (let i = 0; i < pixels.length; i++) {
            const idx = i * 4;
            pixels[i] = findClosest(d[idx], d[idx + 1], d[idx + 2], palette);
        }
        return pixels;
    }

    function findClosest(r, g, b, palette) {
        let best = 0, bestDist = Infinity;
        for (let i = 0; i < 216; i++) {
            const [pr, pg, pb] = palette[i];
            const dr = r - pr, dg = g - pg, db = b - pb;
            const dist = dr * dr + dg * dg + db * db;
            if (dist < bestDist) { bestDist = dist; best = i; }
        }
        return best;
    }

    function encodeGIF(w, h, palette, frames, delay) {
        const buf = [];
        const write = (b) => buf.push(b & 0xff);
        const writeStr = (s) => { for (let i = 0; i < s.length; i++) write(s.charCodeAt(i)); };
        const write16 = (v) => { write(v & 0xff); write((v >> 8) & 0xff); };

        writeStr('GIF89a');
        write16(w);
        write16(h);
        write(0xf7);
        write(0);
        write(0);

        for (let i = 0; i < 256; i++) {
            write(palette[i][0]);
            write(palette[i][1]);
            write(palette[i][2]);
        }

        frames.forEach(pixels => {
            write(0x21);
            write(0xf9);
            write(4);
            write(0x00);
            write16(delay);
            write(0);
            write(0);

            write(0x2c);
            write16(0);
            write16(0);
            write16(w);
            write16(h);
            write(0);

            const minCodeSize = 8;
            write(minCodeSize);

            const lzw = lzwEncode(minCodeSize, pixels);
            for (let i = 0; i < lzw.length; i += 255) {
                const chunk = lzw.slice(i, i + 255);
                write(chunk.length);
                chunk.forEach(b => write(b));
            }
            write(0);
        });

        write(0x3b);
        return new Blob([new Uint8Array(buf)], { type: 'image/gif' });
    }

    function lzwEncode(minCodeSize, pixels) {
        const clearCode = 1 << minCodeSize;
        const eoiCode = clearCode + 1;
        let codeSize = minCodeSize + 1;
        let nextCode = eoiCode + 1;
        const table = new Map();
        for (let i = 0; i < clearCode; i++) table.set(i, i);

        const out = [];
        let curBits = 0;
        let curVal = 0;

        const emit = (code) => {
            curVal |= (code << curBits);
            curBits += codeSize;
            while (curBits >= 8) {
                out.push(curVal & 0xff);
                curVal >>= 8;
                curBits -= 8;
            }
        };

        emit(clearCode);

        let current = pixels[0];
        for (let i = 1; i < pixels.length; i++) {
            const key = (current << 12) | pixels[i];
            if (table.has(key)) {
                current = table.get(key);
            } else {
                emit(current);
                if (nextCode < 4096) {
                    table.set(key, nextCode++);
                    if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
                } else {
                    emit(clearCode);
                    table.clear();
                    for (let j = 0; j < clearCode; j++) table.set(j, j);
                    nextCode = eoiCode + 1;
                    codeSize = minCodeSize + 1;
                }
                current = pixels[i];
            }
        }
        emit(current);
        emit(eoiCode);
        if (curBits > 0) out.push(curVal & 0xff);
        return out;
    }
})();
