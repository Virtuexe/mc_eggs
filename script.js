document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('eggCanvas');
    const ctx = canvas.getContext('2d');
    const wrapper = document.querySelector('.canvas-wrapper');
    
    const colorPicker = document.getElementById('colorPicker');
    const alphaSlider = document.getElementById('alphaSlider');
    const alphaValue = document.getElementById('alphaValue');
    const quickColors = document.getElementById('quickColors');
    const eggSwap = document.getElementById('eggSwap');
    
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
    
    // Hardcoded Egg Bases for 16x16
    // 0 = transparent, 1 = outline (#4A4A4A), 2 = body (#C5C5C5)
    const EGG_BASE_PIXELS = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
        [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
        [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
        [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
        [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
        [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
        [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,0,0,1,2,2,2,2,2,2,2,2,1,0,0,0],
        [0,0,0,0,1,1,2,2,2,2,1,1,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ];

    function drawBaseEgg(type) {
        clearCanvas();
        if (type === 'none') return;
        
        for(let y = 0; y < SIZE; y++) {
            for(let x = 0; x < SIZE; x++) {
                const p = EGG_BASE_PIXELS[y][x];
                if (p === 1) { // Outline
                    ctx.fillStyle = type === 'overlay_egg' ? '#222222' : '#4A4A4A';
                    ctx.fillRect(x, y, 1, 1);
                } else if (p === 2 && type === 'base_egg') { // Body (only base egg)
                    ctx.fillStyle = '#C5C5C5';
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    eggSwap.addEventListener('change', (e) => {
        drawBaseEgg(e.target.value);
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
            // Clear pixel first so transparency overwrites fully rather than blending
            ctx.clearRect(x, y, 1, 1); 
            ctx.fillStyle = hexToRgba(colorPicker.value, alphaSlider.value);
            ctx.fillRect(x, y, 1, 1);
        } else if (currentMode === 'eraser') {
            ctx.clearRect(x, y, 1, 1);
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
