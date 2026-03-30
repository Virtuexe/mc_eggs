document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('eggCanvas');
    const ctx = canvas.getContext('2d');
    const wrapper = document.querySelector('.canvas-wrapper');
    
    const colorPicker = document.getElementById('colorPicker');
    const alphaSlider = document.getElementById('alphaSlider');
    const alphaValue = document.getElementById('alphaValue');
    const quickColors = document.getElementById('quickColors');
    const eggSwap = document.getElementById('eggSwap');
    const blendMode = document.getElementById('blendMode');
    
    const btnPencil = document.getElementById('btnPencil');
    const btnEraser = document.getElementById('btnEraser');
    const btnClear = document.getElementById('btnClear');
    const btnDownload = document.getElementById('btnDownload');
    const toggleGrid = document.getElementById('toggleGrid');
    const gridOverlay = document.getElementById('gridOverlay');
    const imgLoader = document.getElementById('imgLoader');
    
    const SIZE = 16;
    let isDrawing = false;
    let currentMode = 'pencil';
    
    // Minecraft Dyes
    const mcColors = [
        '#F9FFFE', '#F9801D', '#C74EBD', '#3AB3DA',
        '#FED83D', '#80C71F', '#F38BAA', '#474F52',
        '#9D9D97', '#169C9C', '#8932B8', '#3C44AA',
        '#835432', '#5E7C16', '#B02E26', '#1D1D21'
    ];

    // Populate Dyes
    mcColors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = color;
        swatch.addEventListener('click', () => {
            colorPicker.value = color;
            alphaSlider.value = 1;
            updateAlphaText();
        });
        quickColors.appendChild(swatch);
    });

    // Alpha text update
    function updateAlphaText() {
        alphaValue.innerText = Math.round(alphaSlider.value * 100) + '%';
    }
    alphaSlider.addEventListener('input', updateAlphaText);

    // Color conversion
    function hexToRgba(hex, alpha) {
        if (hex.charAt(0) === '#') { hex = hex.substring(1); }
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, SIZE, SIZE);
    }
    
    function loadEggImage(url) {
        clearCanvas();
        if (url === 'none') return;
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
             ctx.drawImage(img, 0, 0, SIZE, SIZE);
        };
        img.onerror = () => {
            console.error("Failed to load preset egg:", url);
        };
        img.src = url;
    }

    eggSwap.addEventListener('change', (e) => {
        loadEggImage(e.target.value);
    });

    // Tools Switching
    btnPencil.addEventListener('click', () => {
        currentMode = 'pencil';
        btnPencil.classList.add('active');
        btnEraser.classList.remove('active');
    });

    btnEraser.addEventListener('click', () => {
        currentMode = 'eraser';
        btnEraser.classList.add('active');
        btnPencil.classList.remove('active');
    });

    // Drawing Logic
    function getMousePos(e) {
        const rect = wrapper.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clientX = e.clientX;
        let clientY = e.clientY;

        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        }

        const x = Math.floor((clientX - rect.left) * scaleX);
        const y = Math.floor((clientY - rect.top) * scaleY);
        return { x, y };
    }

    function drawPixel(e) {
        if (!isDrawing) return;
        const { x, y } = getMousePos(e);
        
        if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;

        if (currentMode === 'pencil') {
            const color = hexToRgba(colorPicker.value, alphaSlider.value);
            const mode = blendMode.value;

            if (mode === 'source-over') {
                // In normal mode, clear the pixel first so transparency is clean
                ctx.clearRect(x, y, 1, 1);
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1);
            } else {
                // In blend modes, we draw OVER the existing egg pixels
                ctx.globalCompositeOperation = mode;
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1);
            }
        } else if (currentMode === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.fillRect(x, y, 1, 1);
            // Reset to normal after erase
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    // Mouse/Touch Events
    wrapper.addEventListener('mousedown', (e) => {
        isDrawing = true;
        drawPixel(e);
    });
    wrapper.addEventListener('mousemove', drawPixel);
    window.addEventListener('mouseup', () => { isDrawing = false; });
    
    wrapper.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        drawPixel(e);
    }, {passive: false});
    wrapper.addEventListener('touchmove', (e) => {
        e.preventDefault();
        drawPixel(e);
    }, {passive: false});
    window.addEventListener('touchend', () => { isDrawing = false; });

    // Clear Button
    btnClear.addEventListener('click', () => {
        if(confirm("Clear canvas?")) clearCanvas();
    });

    // Grid Toggle
    toggleGrid.addEventListener('change', (e) => {
        if (e.target.checked) gridOverlay.classList.remove('hidden');
        else gridOverlay.classList.add('hidden');
    });

    // Image Upload
    imgLoader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, SIZE, SIZE);
                ctx.drawImage(img, 0, 0, SIZE, SIZE);
                eggSwap.value = "none";
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Download Logic
    btnDownload.addEventListener('click', () => {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'custom_egg.png';
        link.href = dataURL;
        link.click();
    });
});
