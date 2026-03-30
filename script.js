document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('eggCanvas');
    const ctx = canvas.getContext('2d');
    const wrapper = document.querySelector('.canvas-wrapper');
    
    const colorPicker = document.getElementById('colorPicker');
    const btnPencil = document.getElementById('btnPencil');
    const btnEraser = document.getElementById('btnEraser');
    const btnClear = document.getElementById('btnClear');
    const btnDownload = document.getElementById('btnDownload');
    const toggleGrid = document.getElementById('toggleGrid');
    const gridOverlay = document.getElementById('gridOverlay');
    const imgLoader = document.getElementById('imgLoader');
    
    // State
    const SIZE = 16;
    let isDrawing = false;
    let currentMode = 'pencil'; // 'pencil' or 'eraser'
    
    // Initialize transparent canvas
    function clearCanvas() {
        ctx.clearRect(0, 0, SIZE, SIZE);
    }
    
    // Attempt to load `egg.png` from local project if available (might fail due to CORS)
    function loadInitialTexture() {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
             ctx.drawImage(img, 0, 0, SIZE, SIZE);
        };
        img.onerror = () => {
             console.log("No default egg.png found or CORS blocked. Waiting for manual upload.");
        };
        img.src = 'egg.png';
    }
    
    loadInitialTexture();

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
        // Calculate coordinates within the visible wrapper scaled size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        let clientX = e.clientX;
        let clientY = e.clientY;

        // Support touch events
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
        
        // Bounds checking
        if (x < 0 || x >= SIZE || y < 0 || y >= SIZE) return;

        if (currentMode === 'pencil') {
            ctx.fillStyle = colorPicker.value;
            ctx.fillRect(x, y, 1, 1);
        } else if (currentMode === 'eraser') {
            ctx.clearRect(x, y, 1, 1);
        }
    }

    // Mouse Events
    wrapper.addEventListener('mousedown', (e) => {
        isDrawing = true;
        drawPixel(e);
    });
    
    wrapper.addEventListener('mousemove', drawPixel);
    
    window.addEventListener('mouseup', () => {
        isDrawing = false;
    });

    // Touch Events for mobile
    wrapper.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent scrolling
        isDrawing = true;
        drawPixel(e);
    }, {passive: false});

    wrapper.addEventListener('touchmove', (e) => {
        e.preventDefault();
        drawPixel(e);
    }, {passive: false});

    window.addEventListener('touchend', () => {
        isDrawing = false;
    });

    // Clear Button
    btnClear.addEventListener('click', () => {
        if(confirm("Are you sure you want to clear the entire canvas?")) {
            clearCanvas();
        }
    });

    // Grid Toggle
    toggleGrid.addEventListener('change', (e) => {
        if (e.target.checked) {
            gridOverlay.classList.remove('hidden');
        } else {
            gridOverlay.classList.add('hidden');
        }
    });

    // Image Upload
    imgLoader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Resize drawn image into exactly 16x16
                ctx.clearRect(0, 0, SIZE, SIZE);
                ctx.drawImage(img, 0, 0, SIZE, SIZE);
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
