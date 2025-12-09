document.addEventListener('DOMContentLoaded', () => {
    
    // --- Configuration ---
    const museumItems = [
        {
            title: "Pedestrian Crossing",
            description: "This composite image was created using Adobe Photoshop. It blends multiple elements to portray a surreal, comedic disaster scene in the middle of a city street. The background features tall skyscrapers at dusk, while the foreground is dominated by an oversized, glossy blue stick-figure striding casually through the intersection. Explosions, fire, and cracks in the pavement have been added around its feet and along the roadway, suggesting that each step causes massive destruction. The contrast between the harmless, cartoonish character and the cinematic chaos around it creates an ironic, light-hearted twist on a classic monster-movie city rampage.",
            resolution: "1365 x 768",
            type: "PNG",
            origin: "Unknown Source / Deep Web",
            threat: "High (Cognitive Hazard)",
            image: "images/terror_frame.png",
            audio: {
                enter: 'audio/ped_enter_quip.mp3',
                main: 'audio/pedestrian_crossing.mp3',
                next: 'audio/ped_extra_1.mp3',
                skips: ['audio/ped_crossing_skip_1.mp3', 'audio/ped_crossing_skip_2.mp3', 'audio/ped_crossing_skip_3.mp3', 'audio/ped_crossing_skip_4.mp3']
            }
        },
        {
            title: "rm -rf /",
            description: "A visual representation of when a user unknowingly executes a destructive command in a Unix-like operating system. Within this absurdly opulent Baroque frame, we behold the martyrdom of a computer, caught in the instant before total digital obliteration. The crude red “X” slashed across the burning machine is both warning label and execution mark, a visual scream of the infamous command that erases everything. By wrapping this catastrophic user error in gilded ornament, the piece elevates a tech disaster to the status of sacred relic—a solemn, golden shrine to overconfidence, bad decisions, and the moment you realize you have just deleted your entire life.",
            resolution: "1920 x 1080",
            type: "PNG",
            origin: "Mainframe / Sector 0",
            threat: "Critical (System Instability)",
            image: "images/bad_computer.png",
            audio: {
                enter: 'audio/rm_enter_quip.mp3',
                main: 'audio/rm-rf.mp3',
                skips: ['audio/rm_skip_1.mp3', 'audio/rm_skip_2.mp3', 'audio/rm_skip_3.mp3']
            }
        }
    ];

    let currentIndex = 0;

    // --- Audio System ---
    class AudioManager {
        constructor() {
            this.enabled = false;
            this.currentAudio = null;
            this.currentPriority = 0;
            this.hasPlayedWelcome = false;
            this.isLocked = true; // Start locked
            this.hasClickedOnce = false; // Track first click
            
            this.PRIORITY = {
                IDLE: 0,
                QUIP: 1,
                REACTION: 2, // Skips, Impatience
                MAIN: 3      // Welcome, Descriptions
            };

            this.assets = {
                welcome: 'audio/welcome.mp3',
                firstClick: 'audio/first_click.mp3',
                idles: ['audio/idle_1.mp3', 'audio/idle_2.mp3', 'audio/idle_3.mp3'],
                impatient: ['audio/nav_impatient_1.mp3', 'audio/nav_impatient_2.mp3', 'audio/nav_impatient_3.mp3', 'audio/nav_impatient_4.mp3']
            };
            
            this.idleTimer = null;
            this.navClickTimes = [];

            // Global Idle Reset
            ['mousemove', 'click', 'keydown'].forEach(evt => {
                window.addEventListener(evt, () => this.resetIdleTimer());
            });
        }

        enable() {
            this.enabled = true;
            document.querySelector('.audio-toggle').classList.remove('muted');
            if (!this.hasPlayedWelcome) {
                // Lock UI
                document.body.classList.add('ui-locked');
                
                setTimeout(() => {
                    this.play(this.assets.welcome, this.PRIORITY.MAIN, () => {
                        // Unlock UI when welcome finishes
                        this.isLocked = false;
                        document.body.classList.remove('ui-locked');
                    });
                }, 1000);
                this.hasPlayedWelcome = true;
            } else {
                this.isLocked = false;
                document.body.classList.remove('ui-locked');
            }
            this.resetIdleTimer();
        }

        disable() {
            this.enabled = false;
            this.stop();
            document.querySelector('.audio-toggle').classList.add('muted');
            clearTimeout(this.idleTimer);
            // If we disable, we should probably unlock just in case
            this.isLocked = false;
            document.body.classList.remove('ui-locked');
        }

        toggle() {
            if (this.enabled) this.disable();
            else this.enable();
        }

        play(src, priority, onEndedCallback) {
            if (!this.enabled) return;

            // Priority Check
            if (this.currentAudio && !this.currentAudio.paused) {
                if (priority <= this.currentPriority) {
                    return; // Don't interrupt higher or equal priority
                }
                this.stop();
            }

            const audio = new Audio(src);
            this.currentAudio = audio;
            this.currentPriority = priority;
            
            audio.play().catch(e => console.log("Audio play failed:", e));
            
            audio.onended = () => {
                this.currentAudio = null;
                this.currentPriority = 0;
                this.resetIdleTimer();
                if (onEndedCallback) onEndedCallback();
            };
        }

        stop() {
            if (this.currentAudio) {
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
                this.currentAudio = null;
                this.currentPriority = 0;
            }
        }

        playRandom(arr, priority) {
            if (!arr || arr.length === 0) return;
            const src = arr[Math.floor(Math.random() * arr.length)];
            this.play(src, priority);
        }

        playEnterQuip(item) {
            if (this.isLocked) return;
            if (item.audio && item.audio.enter) {
                this.play(item.audio.enter, this.PRIORITY.QUIP);
            }
        }

        playMainCommentary(item) {
            if (this.isLocked) return;

            // First Click Check
            if (!this.hasClickedOnce) {
                this.hasClickedOnce = true;
                
                if (!this.enabled) return;

                // Start Siren
                const sirenOverlay = document.querySelector('.siren-overlay');
                if (sirenOverlay) sirenOverlay.classList.add('active');

                this.play(this.assets.firstClick, this.PRIORITY.MAIN, () => {
                    // On ended (backup stop)
                    if (sirenOverlay) sirenOverlay.classList.remove('active');
                    
                    // After first click audio finishes, play the actual main commentary
                    this.playMainCommentary(item);
                });

                // Add timeupdate listener to currentAudio to stop 4s early
                if (this.currentAudio) {
                    const audio = this.currentAudio;
                    const checkTime = () => {
                        if (audio.duration && (audio.duration - audio.currentTime <= 3)) {
                            if (sirenOverlay) sirenOverlay.classList.remove('active');
                            audio.removeEventListener('timeupdate', checkTime);
                        }
                    };
                    audio.addEventListener('timeupdate', checkTime);
                }
                return;
            }

            if (item.audio && item.audio.main) {
                this.play(item.audio.main, this.PRIORITY.MAIN, () => {
                    // Check for chained audio (e.g. ped_extra_1)
                    if (item.audio.next && document.querySelector('.terminal-panel.active')) {
                        // Only play if panel is still open
                        this.play(item.audio.next, this.PRIORITY.MAIN);
                    }
                });
            }
        }

        playSkip(item) {
            if (this.isLocked) return;
            if (this.currentAudio && this.currentPriority === this.PRIORITY.MAIN) {
                // Check if current audio is the main track for this item
                // Simple check: if the src string contains the filename
                const mainFile = item.audio.main.split('/').pop();
                const nextFile = item.audio.next ? item.audio.next.split('/').pop() : null;
                const firstClickFile = this.assets.firstClick.split('/').pop();

                // Stop siren if skipping first click audio
                if (this.currentAudio.src.includes(firstClickFile)) {
                    const sirenOverlay = document.querySelector('.siren-overlay');
                    if (sirenOverlay) sirenOverlay.classList.remove('active');
                }
                
                if (this.currentAudio.src.includes(mainFile) || (nextFile && this.currentAudio.src.includes(nextFile)) || this.currentAudio.src.includes(firstClickFile)) {
                    this.stop();
                    if (item.audio.skips) {
                        this.playRandom(item.audio.skips, this.PRIORITY.REACTION);
                    }
                }
            }
        }

        checkImpatience() {
            if (this.isLocked) return;
            const now = Date.now();
            this.navClickTimes.push(now);
            this.navClickTimes = this.navClickTimes.filter(t => now - t < 7000);
            
            if (this.navClickTimes.length >= 3) {
                this.playRandom(this.assets.impatient, this.PRIORITY.REACTION);
                this.navClickTimes = [];
            }
        }

        resetIdleTimer() {
            clearTimeout(this.idleTimer);
            if (!this.enabled || this.isLocked) return;
            
            this.idleTimer = setTimeout(() => {
                if (!this.currentAudio || this.currentAudio.paused) {
                    this.playRandom(this.assets.idles, this.PRIORITY.IDLE);
                }
            }, 40000 + Math.random() * 20000);
        }
    }

    const audioManager = new AudioManager();

    // --- Elements ---
    const scene = document.querySelector('.scene');
    const paintingContainer = document.querySelector('.painting-container');
    const terminalPanel = document.querySelector('.terminal-panel');
    const btnClose = document.querySelector('.btn-close');
    const cursorDebug = document.getElementById('cursor-debug');
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingProgress = document.querySelector('.loading-progress');
    const btnPrev = document.querySelector('.nav-btn.prev');
    const btnNext = document.querySelector('.nav-btn.next');
    
    // Panel Fields
    const elTitle = document.getElementById('info-title');
    const elDesc = document.getElementById('info-desc');
    const elRes = document.getElementById('info-res');
    const elType = document.getElementById('info-type');
    const elOrigin = document.getElementById('info-origin');
    const elThreat = document.getElementById('info-threat');

    // --- Loading Sequence ---
    let loadPercent = 0;
    const loadInterval = setInterval(() => {
        loadPercent += Math.random() * 5;
        if (loadPercent >= 100) {
            loadPercent = 100;
            clearInterval(loadInterval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                // Show Audio Consent
                document.querySelector('.audio-consent-modal').classList.remove('hidden');
            }, 500);
        }
        loadingProgress.style.width = `${loadPercent}%`;
    }, 100);

    // --- Audio UI Handlers ---
    document.getElementById('btn-audio-yes').addEventListener('click', () => {
        document.querySelector('.audio-consent-modal').classList.add('hidden');
        audioManager.enable();
    });

    document.getElementById('btn-audio-no').addEventListener('click', () => {
        document.querySelector('.audio-consent-modal').classList.add('hidden');
        audioManager.disable();
    });

    document.querySelector('.audio-toggle').addEventListener('click', () => {
        audioManager.toggle();
    });

    // --- A) AGI / Object Detection Network ---
    const canvas = document.getElementById('networkCanvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;
    
    // Configuration
    const NODE_POOL_SIZE = 200;
    const CONNECTION_DIST = 100;
    const MOUSE_DIST = 150;
    
    // State
    let nodes = [];
    let boxes = [];
    let mouse = { x: -1000, y: -1000 };

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class AGINode {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.active = false;
            this.life = 0;
            this.maxLife = 0;
            this.isExcited = false;
        }

        activate(x, y, life) {
            this.x = x;
            this.y = y;
            this.active = true;
            this.life = life;
            this.maxLife = life;
            this.isExcited = false;
        }

        update() {
            if (!this.active) return;
            this.life--;
            if (this.life <= 0) {
                this.active = false;
                return;
            }

            // Jitter
            const jitter = this.isExcited ? 3 : 0.2;
            this.x += (Math.random() - 0.5) * jitter;
            this.y += (Math.random() - 0.5) * jitter;
        }

        draw() {
            if (!this.active) return;
            // Opacity 100% (Solid)
            ctx.fillStyle = this.isExcited ? `rgba(255, 50, 50, 1)` : `rgba(150, 150, 150, 1)`;
            const size = this.isExcited ? 6 : 4;
            ctx.fillRect(this.x - size/2, this.y - size/2, size, size);
        }
    }

    class DetectionBox {
        constructor(x, y, w, h, type) {
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
            this.type = type; // 'true' or 'false'
            
            // Longer life for false positives to simulate "thinking"
            if (this.type === 'false') {
                this.life = 200 + Math.random() * 200; 
            } else {
                this.life = 120 + Math.random() * 120; 
            }
            
            this.maxLife = this.life;
            // Target size for subtle animation
            this.targetW = w * (0.9 + Math.random() * 0.2);
            this.targetH = h * (0.9 + Math.random() * 0.2);

            // Generate Label
            const funnyObjects = ["CAT", "HORSE", "HOTDOG", "CHAIR", "VOID", "GHOST", "PIXEL", "ERROR", "UNDEFINED", "TOASTER", "BIRD?", "NOT_HOTDOG", "SIMULATION"];
            const obj = funnyObjects[Math.floor(Math.random() * funnyObjects.length)];
            const acc = (10 + Math.random() * 80).toFixed(1); // Low accuracy for funny ones
            
            if (this.type === 'true') {
                this.labelText = `CONFIRMED [${(0.9 + Math.random()*0.09).toFixed(2)}]`;
            } else {
                // Mix of "ANALYZING..." and funny detections
                if (Math.random() < 0.3) {
                    this.labelText = `ANALYZING...`;
                } else {
                    this.labelText = `DETECTED: ${obj} (${acc}%)`;
                }
            }
        }

        update() {
            this.life--;
            // Smoothly change size
            this.w += (this.targetW - this.w) * 0.01;
            this.h += (this.targetH - this.h) * 0.01;
        }

        draw() {
            // Opacity 100% for stroke/text
            const color = this.type === 'true' ? `0, 255, 0` : `255, 0, 0`;
            
            ctx.strokeStyle = `rgba(${color}, 1)`;
            ctx.lineWidth = 1;
            ctx.strokeRect(this.x, this.y, this.w, this.h);
            
            // Fill (keep subtle)
            ctx.fillStyle = `rgba(${color}, 0.1)`;
            ctx.fillRect(this.x, this.y, this.w, this.h);

            // Label
            if (this.life > 10) {
                ctx.fillStyle = `rgba(${color}, 1)`;
                ctx.font = '10px monospace';
                ctx.fillText(this.labelText, this.x, this.y - 5);
            }
        }
    }

    // Initialize Pool
    for (let i = 0; i < NODE_POOL_SIZE; i++) {
        nodes.push(new AGINode());
    }

    function getInactiveNode() {
        return nodes.find(n => !n.active);
    }

    function spawnNodeInRect(rect, life) {
        const node = getInactiveNode();
        if (node) {
            const x = rect.x + Math.random() * rect.w;
            const y = rect.y + Math.random() * rect.h;
            node.activate(x, y, life);
        }
    }

    let nextFalseSpawnTime = Date.now() + 2000;

    function animateNetwork() {
        ctx.clearRect(0, 0, width, height);

        // --- 1. Detection Boxes ---
        const painting = document.querySelector('.painting-container');
        const rect = painting ? painting.getBoundingClientRect() : null;
        const isHovering = painting && painting.classList.contains('scanning');

        // A) True Positives (Painting)
        // Spawn if hovering (high chance) or random (low chance)
        // Only if no true box exists currently (to prevent stacking)
        const hasTrueBox = boxes.some(b => b.type === 'true');
        const spawnTrue = (isHovering && Math.random() < 0.05) || (!isHovering && Math.random() < 0.001);
        
        if (rect && spawnTrue && !hasTrueBox) {
            const margin = 30;
            boxes.push(new DetectionBox(
                rect.left - margin + (Math.random() * 20 - 10),
                rect.top - margin + (Math.random() * 20 - 10),
                rect.width + margin * 2,
                rect.height + margin * 2,
                'true'
            ));
        }

        // B) False Positives (Random)
        // Only 1 at a time, 5-10s interval
        const hasFalseBox = boxes.some(b => b.type === 'false');
        if (Date.now() > nextFalseSpawnTime && !hasFalseBox) {
            const w = 100 + Math.random() * 300;
            const h = 100 + Math.random() * 300;
            boxes.push(new DetectionBox(
                Math.random() * (width - w),
                Math.random() * (height - h),
                w, h, 'false'
            ));
            // Set next spawn time (5-10s)
            nextFalseSpawnTime = Date.now() + 5000 + Math.random() * 5000;
        }

        // Update & Draw Boxes
        boxes = boxes.filter(b => b.life > 0);
        boxes.forEach(b => {
            b.update();
            b.draw();
            // Spawn nodes inside active boxes - Reduced rate, longer life
            if (Math.random() < 0.1) {
                spawnNodeInRect({x: b.x, y: b.y, w: b.w, h: b.h}, 100);
            }
        });

        // --- 2. Nodes ---
        // Spawn around mouse - Increased rate, larger range
        if (mouse.x > 0 && Math.random() < 0.1) {
            const range = 300;
            spawnNodeInRect({x: mouse.x - range/2, y: mouse.y - range/2, w: range, h: range}, 120);
        }
        
        // Spawn random noise - Very reduced rate
        if (Math.random() < 0.005) {
             spawnNodeInRect({x: 0, y: 0, w: width, h: height}, 200);
        }

        // Process Active Nodes
        const activeNodes = nodes.filter(n => n.active);
        
        activeNodes.forEach(node => {
            // Check if inside any box
            node.isExcited = false;
            for (let b of boxes) {
                if (node.x > b.x && node.x < b.x + b.w && node.y > b.y && node.y < b.y + b.h) {
                    node.isExcited = true;
                    break;
                }
            }

            node.update();
            node.draw();

            // Connections
            activeNodes.forEach(other => {
                if (node === other) return;
                // Optimization: simple check
                if (Math.abs(node.x - other.x) > CONNECTION_DIST) return;
                if (Math.abs(node.y - other.y) > CONNECTION_DIST) return;

                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < CONNECTION_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(other.x, other.y);
                    // Solid connections, fading only by distance
                    const opacity = (1 - dist / CONNECTION_DIST);
                    ctx.strokeStyle = node.isExcited ? `rgba(255, 50, 50, ${opacity})` : `rgba(150, 150, 150, ${opacity})`;
                    ctx.lineWidth = node.isExcited ? 3 : 1.5;
                    ctx.stroke();
                }
            });
            
            // Mouse Connection
            const dx = node.x - mouse.x;
            const dy = node.y - mouse.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < MOUSE_DIST) {
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(100, 255, 100, ${1 - dist / MOUSE_DIST})`;
                ctx.stroke();
            }
        });

        // --- 3. Label ---
        // Prefer a 'true' box, else painting center
        let labelTarget = { x: width/2 + 200, y: height/2 - 100 }; // Default
        const trueBox = boxes.find(b => b.type === 'true');
        
        if (trueBox) {
            labelTarget = { x: trueBox.x + trueBox.w, y: trueBox.y };
        } else {
             const painting = document.querySelector('.painting-container');
             if (painting) {
                 const rect = painting.getBoundingClientRect();
                 labelTarget = { x: rect.right, y: rect.top };
             }
        }
        
        drawLabel(labelTarget);

        requestAnimationFrame(animateNetwork);
    }

    function drawLabel(pos) {
        const padding = 8;
        const text = museumItems[currentIndex].title;
        const textWidth = ctx.measureText(text).width;
        
        // Label Box
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(pos.x + 10, pos.y - 20, textWidth + padding * 2, 24);
        
        // Label Text
        ctx.fillStyle = '#0f0';
        ctx.font = '12px monospace';
        ctx.fillText(text, pos.x + 10 + padding, pos.y - 4);
        
        // Connecting line
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + 10, pos.y - 8);
        ctx.strokeStyle = '#0f0';
        ctx.stroke();
    }

    animateNetwork();


    // --- Navigation Logic ---
    let isNavigating = false;

    function updatePanelData() {
        const item = museumItems[currentIndex];
        elTitle.innerText = item.title;
        elDesc.innerText = item.description;
        elRes.innerText = item.resolution;
        elType.innerText = item.type;
        elOrigin.innerText = item.origin;
        elThreat.innerText = item.threat;
    }
    updatePanelData();

    function navigate(direction) {
        if (isNavigating) return;
        
        // Audio: Check impatience and handle interruption
        audioManager.checkImpatience();
        audioManager.playSkip(museumItems[currentIndex]);

        isNavigating = true;

        // Close panel if open
        closePanel();

        const currentWall = document.querySelector('.wall.active');
        const nextWall = document.querySelector('.wall.next'); // The buffer wall

        // Determine Next Index
        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentIndex + 1) % museumItems.length;
        } else {
            nextIndex = (currentIndex - 1 + museumItems.length) % museumItems.length;
        }

        // Update Content of Next Wall
        const nextImg = nextWall.querySelector('.painting-frame');
        nextImg.src = museumItems[nextIndex].image;
        nextImg.alt = museumItems[nextIndex].title;

        // Fisheye/Blur Transition Logic
        // We use perspective and rotation to simulate looking around (Inside Cube)
        const perspective = '1000px';
        const blurAmount = '30px'; 
        
        // Rotation angles (Inverted for inside-cube feel)
        const exitRotate = direction === 'next' ? '45deg' : '-45deg';
        const enterRotate = direction === 'next' ? '-45deg' : '45deg';
        
        const currentExitX = direction === 'next' ? '-50%' : '50%'; 
        const nextEnterX = direction === 'next' ? '50%' : '-50%';

        // Prepare Next Wall
        nextWall.style.transition = 'none'; // Instant setup
        nextWall.style.transform = `perspective(${perspective}) translateX(${nextEnterX}) rotateY(${enterRotate}) scale(0.8)`;
        nextWall.style.filter = `blur(${blurAmount})`;
        nextWall.style.opacity = '0';
        nextWall.style.display = 'flex';
        nextWall.classList.add('active'); // Make it visible
        
        // Force Reflow
        void nextWall.offsetWidth;

        // 2. Animate
        // Enable transitions
        const duration = 1000; // ms
        const ease = "cubic-bezier(0.25, 1, 0.5, 1)"; // Smooth easeOut

        currentWall.style.transition = `transform ${duration}ms ${ease}, filter ${duration}ms ease, opacity ${duration}ms ease`;
        nextWall.style.transition = `transform ${duration}ms ${ease}, filter ${duration}ms ease, opacity ${duration}ms ease`;

        // Move Current Out
        currentWall.style.transform = `perspective(${perspective}) translateX(${currentExitX}) rotateY(${exitRotate}) scale(0.8)`;
        currentWall.style.filter = `blur(${blurAmount})`;
        currentWall.style.opacity = '0';

        // Move Next In
        nextWall.style.transform = `perspective(${perspective}) translateX(0) rotateY(0) scale(1)`;
        nextWall.style.filter = 'blur(0)';
        nextWall.style.opacity = '1';

        // 3. Cleanup after animation
        setTimeout(() => {
            // Reset Current Wall to be the new "Next" (buffer)
            currentWall.classList.remove('active');
            currentWall.classList.add('next');
            currentWall.style.display = 'none';
            currentWall.style.transform = '';
            currentWall.style.transition = '';
            currentWall.style.filter = '';
            currentWall.style.opacity = '';

            // Finalize Next Wall as the new Active
            nextWall.classList.remove('next');
            nextWall.classList.add('active');
            nextWall.style.transition = ''; // Clear transition for parallax
            nextWall.style.filter = '';

            // Update Index and Panel Data
            currentIndex = nextIndex;
            updatePanelData();

            isNavigating = false;
        }, duration);
    }

    btnNext.addEventListener('click', () => navigate('next'));
    btnPrev.addEventListener('click', () => navigate('prev'));


    // --- B) Mouse Tracking + Parallax + Debug Text ---
    const debugPhrases = [
        "world.container{WALL}",
        "world.container{FLOOR}",
        "thinking...",
        "likely: BIRD (29% accuracy)",
        "analyzing geometry...",
        "null reference exception",
        "rendering: 99%",
        "entity: UNKNOWN",
        "sector: 7G",
        "light_level: 0.4"
    ];

    let lastDebugUpdate = 0;
    let targetZoomZ = 0;
    let currentZoomZ = 0;
    const MIN_ZOOM = -100;
    const MAX_ZOOM = 800; 
    const ZOOM_EASE = 0.01;

    function updateSceneTransform() {
        // Always request next frame to keep loop alive
        requestAnimationFrame(updateSceneTransform);

        if (isNavigating) return;

        // Smooth Zoom
        currentZoomZ += (targetZoomZ - currentZoomZ) * ZOOM_EASE;

        // Normalize mouse position (-1 to 1)
        const xNorm = (mouse.x / width) * 2 - 1;
        const yNorm = (mouse.y / height) * 2 - 1;

        // Apply subtle transform
        const rotateY = xNorm * 5; 
        const rotateX = -yNorm * 5; 
        const translateX = -xNorm * 10; 
        const translateY = -yNorm * 10;
        
        scene.style.transform = `
            translate3d(${translateX}px, ${translateY}px, ${currentZoomZ}px) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg)
        `;
    }
    
    // Start the loop
    updateSceneTransform();

    // Scroll Wheel Zoom
    window.addEventListener('wheel', (e) => {
        if (isNavigating) return;
        
        const zoomSpeed = 2;
        targetZoomZ -= e.deltaY * zoomSpeed;

        // Clamp
        if (targetZoomZ > MAX_ZOOM) targetZoomZ = MAX_ZOOM;
        if (targetZoomZ < MIN_ZOOM) targetZoomZ = MIN_ZOOM;
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        // Update Debug Text
        cursorDebug.style.left = e.clientX + 'px';
        cursorDebug.style.top = e.clientY + 'px';

        // Only update text occasionally or if hovering background
        // Check if hovering painting
        const isHoveringPainting = e.target.closest('.painting-container');
        
        if (!isHoveringPainting) {
            cursorDebug.style.display = 'block';
            if (Date.now() - lastDebugUpdate > 200) { // Update every 200ms
                const phrase = debugPhrases[Math.floor(Math.random() * debugPhrases.length)];
                cursorDebug.innerText = `> ${phrase}`;
                lastDebugUpdate = Date.now();
            }
        } else {
            cursorDebug.style.display = 'none';
        }
    });


    // --- C) Hover Scan + Terminal Panel ---
    
    const allPaintingContainers = document.querySelectorAll('.painting-container');

    allPaintingContainers.forEach(container => {
        container.addEventListener('mouseenter', () => {
            document.body.classList.add('dark-mode');
            container.classList.add('scanning');
            
            // Audio: Enter Quip
            audioManager.playEnterQuip(museumItems[currentIndex]);
        });

        // Click to open analysis
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            terminalPanel.classList.add('active');
            // Audio: Main Commentary
            audioManager.playMainCommentary(museumItems[currentIndex]);
        });

        container.addEventListener('mouseleave', () => {
            // Only close/skip if the panel is NOT active (i.e. we just hovered without clicking)
            if (!terminalPanel.classList.contains('active')) {
                document.body.classList.remove('dark-mode');
                container.classList.remove('scanning');
                // Audio: Interruption Skip (will only trigger if Main was playing, which shouldn't happen on hover-only, but safe to keep)
                audioManager.playSkip(museumItems[currentIndex]);
            } else {
                // If panel IS active, just remove the scanning effect but keep dark mode and panel open
                container.classList.remove('scanning');
            }
        });
    });

    // Function to close everything
    function closePanel() {
        document.body.classList.remove('dark-mode');
        allPaintingContainers.forEach(el => el.classList.remove('scanning'));
        terminalPanel.classList.remove('active');
    }

    // Close on X button
    btnClose.addEventListener('click', (e) => {
        e.stopPropagation(); 
        closePanel();
        audioManager.playSkip(museumItems[currentIndex]); // Stop audio when manually closing
    });

    // Close on Click Outside
    document.addEventListener('click', (e) => {
        if (terminalPanel.classList.contains('active')) {
            // If click is NOT inside panel AND NOT inside the painting container
            if (!terminalPanel.contains(e.target) && !e.target.closest('.painting-container')) {
                closePanel();
                audioManager.playSkip(museumItems[currentIndex]);
            }
        }
    });

});
