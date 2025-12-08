document.addEventListener('DOMContentLoaded', () => {
    // --- Window Management ---
    const windows = document.querySelectorAll('.xp-window');
    const taskbarItems = document.getElementById('taskbar-items');
    let highestZ = 100;
    const ALWAYS_ON_TOP_Z = 99999;

    function bringToFront(win) {
        if (win.id === 'win-message') {
            // Keep it on top
            win.style.zIndex = ALWAYS_ON_TOP_Z;
        } else {
            // Only increment if it's not already the top (excluding always-on-top)
            if (win.style.zIndex != highestZ) {
                highestZ++;
                // Ensure we don't exceed the always-on-top layer
                if (highestZ >= ALWAYS_ON_TOP_Z) {
                    highestZ = ALWAYS_ON_TOP_Z - 1;
                }
                win.style.zIndex = highestZ;
            }
        }
        updateTaskbarActive(win.id);
    }

    windows.forEach(win => {
        makeDraggable(win);
        makeResizable(win);
        setupWindowControls(win);
        createTaskbarItem(win);
        
        // Bring to front on mousedown
        win.addEventListener('mousedown', () => {
            bringToFront(win);
        });

        // Handle clicks inside iframes
        const iframe = win.querySelector('iframe');
        if (iframe) {
            const attachListener = () => {
                try {
                    // Check if we can access the content
                    const doc = iframe.contentDocument;
                    if (doc) {
                        doc.addEventListener('mousedown', () => bringToFront(win));
                        doc.addEventListener('click', () => bringToFront(win)); // Fallback
                    }
                } catch (e) {
                    console.warn('Cannot access iframe content for bring-to-front:', e);
                }
            };

            iframe.addEventListener('load', attachListener);
            // Try immediately in case it's already loaded
            attachListener();
        }
    });

    function makeDraggable(elmnt) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = elmnt.querySelector('.title-bar');

        if (header) {
            header.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function makeResizable(win) {
        const resizers = ['r', 'b', 'br'];
        resizers.forEach(type => {
            const resizer = document.createElement('div');
            resizer.className = `resizer resizer-${type}`;
            win.appendChild(resizer);
            
            resizer.addEventListener('mousedown', initResize);

            function initResize(e) {
                e.preventDefault();
                window.addEventListener('mousemove', resize);
                window.addEventListener('mouseup', stopResize);
            }

            function resize(e) {
                if (type === 'r' || type === 'br') {
                    win.style.width = (e.clientX - win.getBoundingClientRect().left) + 'px';
                }
                if (type === 'b' || type === 'br') {
                    win.style.height = (e.clientY - win.getBoundingClientRect().top) + 'px';
                }
            }

            function stopResize() {
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);
            }
        });
    }

    function setupWindowControls(win) {
        const closeBtn = win.querySelector('.close');
        const minBtn = win.querySelector('button[aria-label="Minimize"]');
        const maxBtn = win.querySelector('button[aria-label="Maximize"]');

        if (closeBtn) {
            closeBtn.onclick = () => {
                win.style.display = 'none';
                const taskItem = document.getElementById(`task-${win.id}`);
                if (taskItem) taskItem.style.display = 'none';
            };
        }

        if (minBtn) {
            minBtn.onclick = () => {
                win.style.display = 'none';
                const taskItem = document.getElementById(`task-${win.id}`);
                if (taskItem) taskItem.classList.remove('active');
            };
        }
        
        // Maximize/Restore
        if (maxBtn) {
            maxBtn.onclick = () => {
                if (win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.top = win.dataset.prevTop;
                    win.style.left = win.dataset.prevLeft;
                    win.style.width = win.dataset.prevWidth;
                    win.style.height = win.dataset.prevHeight;
                } else {
                    win.dataset.prevTop = win.style.top;
                    win.dataset.prevLeft = win.style.left;
                    win.dataset.prevWidth = win.style.width;
                    win.dataset.prevHeight = win.style.height;
                    
                    win.classList.add('maximized');
                    win.style.top = '0';
                    win.style.left = '0';
                    win.style.width = '100%';
                    win.style.height = 'calc(100% - 30px)'; // Minus taskbar
                }
            };
        }
    }

    function createTaskbarItem(win) {
        const title = win.querySelector('.title-bar-text').textContent;
        const btn = document.createElement('div');
        btn.className = 'taskbar-item';
        btn.id = `task-${win.id}`;
        btn.innerHTML = `<span class="icon"></span> ${title}`;
        
        btn.onclick = () => {
            if (win.style.display === 'none') {
                win.style.display = 'flex';
                bringToFront(win);
                btn.classList.add('active');
            } else {
                if (win.style.zIndex == highestZ) {
                    win.style.display = 'none';
                    btn.classList.remove('active');
                } else {
                    bringToFront(win);
                    btn.classList.add('active');
                }
            }
        };

        taskbarItems.appendChild(btn);
    }

    function updateTaskbarActive(activeId) {
        document.querySelectorAll('.taskbar-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = document.getElementById(`task-${activeId}`);
        if (activeItem) activeItem.classList.add('active');
    }

    // --- Paint App Logic ---
    const canvas = document.getElementById('paint-canvas');
    const cursorIndicator = document.getElementById('cursor-indicator');
    
    if (canvas) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        let painting = false;
        let color = '#000000';
        let tool = 'pencil'; // pencil, eraser, fill
        let brushSize = 2;

        // Undo History
        let history = [];
        let historyStep = -1;

        function saveState() {
            historyStep++;
            if (historyStep < history.length) {
                history.length = historyStep;
            }
            history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        }

        // Resize canvas to fit container
        function resizeCanvas() {
            const container = canvas.parentElement;
            if (container.clientWidth === 0 || container.clientHeight === 0) return;

            // Create temp canvas to store current image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Only copy if canvas has content
            if (canvas.width > 0 && canvas.height > 0) {
                tempCtx.drawImage(canvas, 0, 0);
            }

            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;

            // Fill white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Restore content
            if (tempCanvas.width > 0 && tempCanvas.height > 0) {
                ctx.drawImage(tempCanvas, 0, 0);
            }
            
            if (history.length === 0) {
                saveState();
            }
        }
        
        // Use ResizeObserver to handle window open/maximize
        const resizeObserver = new ResizeObserver(() => resizeCanvas());
        resizeObserver.observe(canvas.parentElement);

        function startPosition(e) {
            if (tool === 'fill') {
                floodFill(e);
                return;
            }
            painting = true;
            draw(e);
        }

        function finishedPosition() {
            if (painting) {
                painting = false;
                ctx.beginPath();
                saveState();
            }
        }

        function draw(e) {
            if (!painting) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';
            ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }

        // Flood Fill Algorithm
        function floodFill(e) {
            const rect = canvas.getBoundingClientRect();
            const startX = Math.floor(e.clientX - rect.left);
            const startY = Math.floor(e.clientY - rect.top);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imageData.data;
            
            // Get target color
            const startPos = (startY * canvas.width + startX) * 4;
            const startR = pixels[startPos];
            const startG = pixels[startPos + 1];
            const startB = pixels[startPos + 2];
            const startA = pixels[startPos + 3];

            // Parse fill color
            const fillColor = hexToRgb(color);
            
            // Don't fill if color is same
            if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b) return;

            const stack = [[startX, startY]];
            
            while (stack.length) {
                const [x, y] = stack.pop();
                const pos = (y * canvas.width + x) * 4;
                
                if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
                
                if (pixels[pos] === startR && pixels[pos + 1] === startG && pixels[pos + 2] === startB && pixels[pos + 3] === startA) {
                    pixels[pos] = fillColor.r;
                    pixels[pos + 1] = fillColor.g;
                    pixels[pos + 2] = fillColor.b;
                    pixels[pos + 3] = 255;
                    
                    stack.push([x + 1, y]);
                    stack.push([x - 1, y]);
                    stack.push([x, y + 1]);
                    stack.push([x, y - 1]);
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            saveState();
        }

        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 0, g: 0, b: 0 };
        }
        
        function rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        // Cursor Indicator Logic
        function updateCursor(e) {
            if (!cursorIndicator) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Only show if inside canvas
            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                cursorIndicator.style.display = 'block';
                cursorIndicator.style.left = e.clientX + 'px';
                cursorIndicator.style.top = e.clientY + 'px';
                cursorIndicator.style.width = brushSize + 'px';
                cursorIndicator.style.height = brushSize + 'px';
                
                if (tool === 'eraser') {
                    cursorIndicator.style.borderColor = '#000';
                    cursorIndicator.style.backgroundColor = '#fff';
                } else if (tool === 'fill') {
                    cursorIndicator.style.display = 'none'; // Use default cursor for fill
                    canvas.style.cursor = 'crosshair';
                } else {
                    // Outlined size indicator (transparent background)
                    cursorIndicator.style.borderColor = '#000'; 
                    cursorIndicator.style.backgroundColor = 'transparent';
                    canvas.style.cursor = 'none';
                }
            } else {
                cursorIndicator.style.display = 'none';
            }
        }

        canvas.addEventListener('mousedown', startPosition);
        canvas.addEventListener('mouseup', finishedPosition);
        canvas.addEventListener('mousemove', (e) => {
            draw(e);
            updateCursor(e);
        });
        canvas.addEventListener('mouseleave', () => {
            finishedPosition();
            if (cursorIndicator) cursorIndicator.style.display = 'none';
        });

        // Tools
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                color = e.target.style.backgroundColor;
                tool = 'pencil';
                updateColorInputs(color);
            });
        });

        document.getElementById('tool-pencil').addEventListener('click', () => tool = 'pencil');
        document.getElementById('tool-eraser').addEventListener('click', () => tool = 'eraser');
        document.getElementById('tool-fill').addEventListener('click', () => tool = 'fill');
        document.getElementById('tool-clear').addEventListener('click', () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveState();
        });
        
        const undoBtn = document.getElementById('tool-undo');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                if (historyStep > 0) {
                    historyStep--;
                    const canvasData = history[historyStep];
                    ctx.putImageData(canvasData, 0, 0);
                }
            });
        }
        
        // Brush Size
        const sizeInput = document.getElementById('brush-size');
        if (sizeInput) {
            sizeInput.addEventListener('input', (e) => {
                brushSize = parseInt(e.target.value);
            });
        }

        // Color Picker
        const colorPicker = document.getElementById('color-picker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                color = e.target.value;
                tool = 'pencil';
                updateColorInputs(color);
            });
        }
        
        // RGB Inputs
        const rInput = document.getElementById('color-r');
        const gInput = document.getElementById('color-g');
        const bInput = document.getElementById('color-b');
        
        function updateColorInputs(hexColor) {
            const rgb = hexToRgb(hexColor);
            if (rInput) rInput.value = rgb.r;
            if (gInput) gInput.value = rgb.g;
            if (bInput) bInput.value = rgb.b;
            if (colorPicker) colorPicker.value = hexColor;
            
            // Update first swatch as "current color"
            const firstSwatch = document.querySelector('.color-swatch');
            if (firstSwatch) {
                firstSwatch.style.backgroundColor = hexColor;
            }
        }
        
        function updateColorFromRGB() {
            const r = Math.min(255, Math.max(0, parseInt(rInput.value) || 0));
            const g = Math.min(255, Math.max(0, parseInt(gInput.value) || 0));
            const b = Math.min(255, Math.max(0, parseInt(bInput.value) || 0));
            
            color = rgbToHex(r, g, b);
            tool = 'pencil';
            if (colorPicker) colorPicker.value = color;
            
            const firstSwatch = document.querySelector('.color-swatch');
            if (firstSwatch) {
                firstSwatch.style.backgroundColor = color;
            }
        }
        
        if (rInput) rInput.addEventListener('input', updateColorFromRGB);
        if (gInput) gInput.addEventListener('input', updateColorFromRGB);
        if (bInput) bInput.addEventListener('input', updateColorFromRGB);
        
        // Save functionality (Composite over white)
        const saveBtn = document.getElementById('tool-save');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tCtx = tempCanvas.getContext('2d');
                
                // Fill white first
                tCtx.fillStyle = '#ffffff';
                tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                // Draw image
                tCtx.drawImage(canvas, 0, 0);
                
                const link = document.createElement('a');
                link.download = 'my-drawing.png';
                link.href = tempCanvas.toDataURL();
                link.click();
            });
        }
    }
    
    // Start Menu (Visual only)
    const startBtn = document.querySelector('.start-button');
    startBtn.addEventListener('click', () => {
        startBtn.classList.toggle('active');
    });

    // --- Desktop Icons ---
    const icons = document.querySelectorAll('.desktop-icon');
    
    icons.forEach(icon => {
        // Single click to select
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            // Deselect all others
            icons.forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
        });

        // Double click to open
        icon.addEventListener('dblclick', () => {
            const targetId = icon.dataset.target;
            
            // Special case for IE icon - now handled by window
            if (icon.id === 'icon-ie') {
                // Just let it open the window defined in data-target
            }

            if (targetId) {
                const win = document.getElementById(targetId);
                if (win) {
                    win.style.display = 'flex';
                    bringToFront(win);
                    
                    // Ensure taskbar item is active/created
                    let taskItem = document.getElementById(`task-${targetId}`);
                    if (!taskItem) {
                        createTaskbarItem(win);
                        taskItem = document.getElementById(`task-${targetId}`);
                    }
                    if (taskItem) taskItem.classList.add('active');
                }
            }
        });
    });

    // Handle icons inside windows (like File Explorer)
    document.querySelectorAll('.window-body .desktop-icon').forEach(icon => {
        icon.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            const targetId = icon.dataset.target;
            if (targetId) {
                const win = document.getElementById(targetId);
                if (win) {
                    win.style.display = 'flex';
                    bringToFront(win);
                    
                    let taskItem = document.getElementById(`task-${targetId}`);
                    if (!taskItem) {
                        createTaskbarItem(win);
                        taskItem = document.getElementById(`task-${targetId}`);
                    }
                    if (taskItem) taskItem.classList.add('active');
                }
            }
        });
        
        // Selection logic for window icons
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            // Deselect siblings
            const siblings = icon.parentElement.querySelectorAll('.desktop-icon');
            siblings.forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
        });
    });

    // Deselect on desktop click
    document.querySelector('.desktop').addEventListener('click', () => {
        icons.forEach(i => i.classList.remove('selected'));
    });

    // --- Clock ---
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        
        const timeString = hours + ':' + strMinutes + ' ' + ampm;
        const tray = document.querySelector('.tray');
        if (tray) {
            tray.textContent = timeString;
        }
    }

    setInterval(updateClock, 1000);
    updateClock();

    // --- Scatter Windows on Load ---
    function scatterWindows() {
        const desktop = document.querySelector('.desktop');
        const desktopRect = desktop.getBoundingClientRect();
        
        windows.forEach(win => {
            // Make visible
            win.style.display = 'flex';
            
            // Update taskbar
            const taskItem = document.getElementById(`task-${win.id}`);
            if (taskItem) taskItem.classList.add('active');

            const rect = win.getBoundingClientRect();
            const winWidth = rect.width || parseInt(win.style.width) || 400;
            const winHeight = rect.height || parseInt(win.style.height) || 300;

            if (win.id === 'win-message') {
                // Center the message window
                const centerX = (desktopRect.width - winWidth) / 2;
                const centerY = (desktopRect.height - winHeight) / 2;
                
                win.style.left = Math.max(0, centerX) + 'px';
                win.style.top = Math.max(0, centerY) + 'px';
                win.style.zIndex = ALWAYS_ON_TOP_Z;
            } else {
                // Random position for others
                const maxX = desktopRect.width - winWidth;
                const maxY = desktopRect.height - winHeight - 40; // Minus taskbar approx
                
                const randomX = Math.max(0, Math.floor(Math.random() * maxX));
                const randomY = Math.max(0, Math.floor(Math.random() * maxY));
                
                win.style.left = randomX + 'px';
                win.style.top = randomY + 'px';
                
                // Random Z-index to shuffle stacking
                highestZ++;
                if (highestZ >= ALWAYS_ON_TOP_Z) highestZ = ALWAYS_ON_TOP_Z - 1;
                win.style.zIndex = highestZ;
            }
        });
    }

    // Handle messages from iframes
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'open-window') {
            const targetId = event.data.target;
            const win = document.getElementById(targetId);
            if (win) {
                win.style.display = 'flex';
                bringToFront(win);
                
                // Ensure taskbar item is active/created
                let taskItem = document.getElementById(`task-${targetId}`);
                if (!taskItem) {
                    createTaskbarItem(win);
                    taskItem = document.getElementById(`task-${targetId}`);
                }
                if (taskItem) taskItem.classList.add('active');
            }
        }
    });
    
    // Small delay to ensure layout is ready
    setTimeout(scatterWindows, 100);
});
