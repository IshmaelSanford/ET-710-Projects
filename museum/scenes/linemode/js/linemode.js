(function() {
    // --- Constants & Config ---
    const COLS = 80;
    const ROWS = 24;
    const SPEED = 8; // Speed for blocker
    
    // --- DOM Elements ---
    const terminalWrapper = document.getElementById('terminal-wrapper');
    const terminalOutput = document.getElementById('terminal-output');
    const commandForm = document.getElementById('command');
    const cmdInput = document.getElementById('cmd-input');
    const statusLine = document.getElementById('status-line');

    // --- State ---
    let currentAnimation = null; // To store requestAnimationFrame ID or interval
    let animationCleanup = null; // Function to clean up current animation (remove elements, etc)

    // --- Blocker / Sweep Animation ---
    const blocker = (function() {
        let ctx;
        let position = 0;
        let length = 0;
        let charWidth = 0;
        let charHeight = 0;
        let animationFrameId;

        function init() {
            const canvas = document.createElement('canvas');
            canvas.id = 'blocker';
            // Append to body, but we need to position it over the terminal wrapper
            document.body.appendChild(canvas);
            ctx = canvas.getContext('2d');
            
            // Initial resize
            resize();
            window.addEventListener('resize', resize);
        }

        function resize() {
            if (!ctx || !terminalWrapper) return;
            
            // Get dimensions of the terminal wrapper
            const rect = terminalWrapper.getBoundingClientRect();
            
            ctx.canvas.width = rect.width;
            ctx.canvas.height = rect.height;
            ctx.canvas.style.position = 'fixed'; 
            ctx.canvas.style.top = rect.top + 'px';
            ctx.canvas.style.left = rect.left + 'px';
            ctx.canvas.style.zIndex = 100;
            
            // Calculate char dimensions
            charWidth = ctx.canvas.width / COLS;
            charHeight = ctx.canvas.height / ROWS;
            
            length = (COLS * ROWS) / SPEED;
        }

        function getCoords(pos) {
            const charsPerStep = SPEED;
            const totalChars = pos * charsPerStep;
            const x = totalChars % COLS;
            const y = Math.floor(totalChars / COLS);
            return { x, y };
        }

        function draw() {
            if (position < length) {
                // Clear a block
                const coords = getCoords(position);
                
                // Clear rect for revealed text
                ctx.clearRect(coords.x * charWidth, coords.y * charHeight, charWidth * SPEED, charHeight);
                
                // Draw blocker cursor (the sweeping block)
                const nextCoords = getCoords(position + 1);
                ctx.fillStyle = 'hsl(150, 100%, 50%)'; // Green
                ctx.fillRect(nextCoords.x * charWidth, nextCoords.y * charHeight, charWidth * SPEED, charHeight);

                position++;
                setTimeout(() => requestAnimationFrame(draw), 0); 
            } else {
                // Finish
                ctx.canvas.style.display = 'none';
                if (commandForm) commandForm.classList.remove('hide');
                initCustomCursor();
            }
        }

        function start() {
            if (!ctx) init();
            resize();
            
            ctx.canvas.style.display = 'block';
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            
            position = 0;
            if (commandForm) commandForm.classList.add('hide');
            
            draw();
        }

        return { start };
    })();

    // --- Custom Cursor Logic ---
    function initCustomCursor() {
        // Create a fake input display
        const cursorSpan = document.createElement('span');
        cursorSpan.id = 'cursor-block';
        cursorSpan.textContent = '▮';
        cursorSpan.style.animation = 'blink 1s step-end infinite';
        
        const inputDisplay = document.createElement('span');
        inputDisplay.id = 'input-display';
        
        // Insert before the real input
        commandForm.insertBefore(inputDisplay, cmdInput);
        commandForm.insertBefore(cursorSpan, cmdInput);
        
        // Hide real input but keep it focusable
        cmdInput.style.opacity = '0';
        cmdInput.style.position = 'absolute';
        cmdInput.style.left = '-9999px'; // Move off-screen to avoid caret
        
        // Sync logic
        cmdInput.addEventListener('input', () => {
            inputDisplay.textContent = cmdInput.value;
        });
        
        // Focus handling
        document.addEventListener('click', () => cmdInput.focus());
        cmdInput.focus();
    }

    // --- Glitch Effects ---
    function runGlitchEffects() {
        // White flash
        document.body.classList.add('booting');
        setTimeout(() => {
            document.body.classList.remove('booting');
        }, 150);

        // Vsync jitter
        if (terminalWrapper) {
            terminalWrapper.classList.add('jitter');
            setTimeout(() => {
                terminalWrapper.classList.remove('jitter');
            }, 500);
        }
    }

    // --- CRT Shutdown Logic ---
    function initiateShutdown(targetUrl) {
        // Check if running in iframe (XP scene)
        if (window.parent !== window) {
             printOutput("Launching Internet Explorer...");
             setTimeout(() => {
                 window.parent.postMessage({ type: 'open-window', target: 'win-ie' }, '*');
             }, 500);
             return;
        }

        // If targetUrl is not passed (e.g. from command line), get it
        if (!targetUrl) {
            const link = document.querySelector('a[data-ref="4"]');
            targetUrl = link ? link.href : '../geocities/index.html';
        }

        // Disable input
        if (cmdInput) cmdInput.disabled = true;
        
        const lines = [
            "Initiating shutdown sequence...",
            "Disconnecting from CERN-HTTPD...",
            "Closing socket connection...",
            "See you in the 90s..."
        ];

        let delay = 0;
        lines.forEach((line, index) => {
            setTimeout(() => {
                printOutput(line);
            }, delay);
            delay += 800;
        });

        setTimeout(() => {
            document.body.classList.add('crt-off');
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 600); // Wait for animation
        }, delay + 500);
    }

    // --- Command Line Logic ---
    function handleCommand(e) {
        e.preventDefault();
        const val = cmdInput.value.trim();
        cmdInput.value = '';
        // Update fake input display
        const inputDisplay = document.getElementById('input-display');
        if (inputDisplay) inputDisplay.textContent = '';
        
        if (!val) return;

        // Stop any running animation
        if (currentAnimation) {
            cancelAnimationFrame(currentAnimation);
            currentAnimation = null;
        }
        if (animationCleanup) {
            animationCleanup();
            animationCleanup = null;
        }

        // Print the command itself
        printOutput(`> ${val}`);

        const parts = val.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Number reference
        if (/^\d+$/.test(val)) {
            const refId = val;
            
            if (refId === '4') {
                initiateShutdown();
                return;
            }

            const link = document.querySelector(`a[data-ref="${refId}"]`);
            if (link) {
                window.location.href = link.href;
            } else {
                const links = document.querySelectorAll('a');
                let found = false;
                for (const l of links) {
                    if (l.textContent.includes(`[${refId}]`)) {
                        window.location.href = l.href;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    printOutput(`Reference [${refId}] not found.`);
                }
            }
            return;
        }

        // Commands
        switch (cmd) {
            case 'back':
            case 'b':
                history.back();
                break;
            case 'quit':
            case 'q':
                printOutput("Quit command not implemented."); 
                break;
            case 'help':
                window.location.href = 'help.html';
                break;
            case 'cmd':
            case 'cmds':
                printOutput("Available Commands:");
                printOutput("  render [--donut|--pyramid] : Render 3D ASCII object");
                printOutput("  matrix                     : Digital rain effect");
                printOutput("  pong                       : Play Pong");
                printOutput("  theme [--light|--coffee]   : Change color theme");
                printOutput("  clear                      : Clear terminal");
                printOutput("  guestbook                  : View guestbook");
                printOutput("  sysinfo, credits, version  : Info commands");
                break;
            case 'clear':
            case 'cls':
                terminalOutput.innerHTML = '';
                break;
            case 'render':
                handleRender(args);
                break;
            case 'matrix':
                startMatrix();
                break;
            case 'theme':
                handleTheme(args);
                break;
            case 'echo':
                printOutput(args.join(' '));
                break;
            case 'pong':
                startPong();
                break;
            case 'version':
                printOutput("Line Mode Browser v1.0 (CERN-HTTPD)");
                break;
            case 'sysinfo':
                printOutput("System: NeXTSTEP 3.3");
                printOutput("CPU: Motorola 68040 @ 25MHz");
                printOutput("Memory: 16MB");
                break;
            case 'credits':
                printOutput("Created by Ishmael Sanford");
                printOutput("Concept: Web UI Time Museum");
                break;
            case 'guestbook':
                fetchGuestbook();
                break;
            case 'ls':
                printOutput("Directory listing of /usr/bin:");
                printOutput("commands.txt  README  index.html  project.html  ux.html");
                break;
            default:
                printOutput(`Unknown command: ${val}`);
        }
    }

    // --- Custom Command Implementations ---

    function handleRender(args) {
        let type = 'donut';
        
        const pre = document.createElement('pre');
        pre.style.lineHeight = '10px';
        pre.style.fontSize = '10px';
        pre.style.overflow = 'hidden';
        terminalOutput.appendChild(pre);
        
        let A = 0, B = 0;
        
        function renderFrame() {
            let output = [];
            const width = 60;
            const height = 30;
            const zBuffer = new Array(width * height).fill(0);
            const buffer = new Array(width * height).fill(' ');

            if (type === 'donut') {
                for (let j = 0; j < 6.28; j += 0.07) {
                    for (let i = 0; i < 6.28; i += 0.02) {
                        const c = Math.sin(i), d = Math.cos(j), e = Math.sin(A), f = Math.sin(j), g = Math.cos(A), h = d + 2, D = 1 / (c * h * e + f * g + 5), l = Math.cos(i), m = Math.cos(B), n = Math.sin(B), t = c * h * g - f * e;
                        const x = (width / 2 + 30 * D * (l * h * m - t * n)) | 0;
                        const y = (height / 2 + 15 * D * (l * h * n + t * m)) | 0;
                        const o = x + width * y;
                        const N = (8 * ((f * e - c * d * g) * m - c * d * e - f * g - l * d * n)) | 0;
                        if (height > y && y > 0 && x > 0 && width > x && D > zBuffer[o]) {
                            zBuffer[o] = D;
                            buffer[o] = ".,-~:;=!*#$@"[N > 0 ? N : 0];
                        }
                    }
                }
            }

            let s = "";
            for(let k = 0; k < width * height; k++) {
                s += (k % width === 0 ? "\n" : "") + buffer[k];
            }
            pre.textContent = s;

            // Slowed down animation
            A += 0.04;
            B += 0.02;

            currentAnimation = requestAnimationFrame(renderFrame);
        }
        
        renderFrame();
        
        animationCleanup = () => {
            pre.remove();
        };
    }

    function startMatrix() {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '999';
        canvas.style.pointerEvents = 'none'; 
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%';
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = [];

        for (let x = 0; x < columns; x++) drops[x] = 1;

        function draw() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = letters.charAt(Math.floor(Math.random() * letters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            currentAnimation = requestAnimationFrame(draw);
        }
        
        draw();
        
        animationCleanup = () => {
            canvas.remove();
        };
        
        // Stop after 15 seconds automatically
        setTimeout(() => {
            if (canvas.parentNode) {
                canvas.remove();
                if (currentAnimation) cancelAnimationFrame(currentAnimation);
                currentAnimation = null;
            }
        }, 15000);
        
        // Click to stop
        canvas.addEventListener('click', () => {
             if (animationCleanup) animationCleanup();
             if (currentAnimation) cancelAnimationFrame(currentAnimation);
             currentAnimation = null;
        });
    }

    function handleTheme(args) {
        let theme = 'default';
        if (args.includes('--light')) {
            theme = 'light';
        } else if (args.includes('--coffee')) {
            theme = 'coffee';
        } else if (args.includes('--blue')) {
            theme = 'blue';
        }
        
        applyTheme(theme);
        localStorage.setItem('linemode-theme', theme);
    }

    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'light') {
            root.style.setProperty('--term-bg', '#ffffff');
            root.style.setProperty('--term-green', '#000000');
        } else if (theme === 'coffee') {
            root.style.setProperty('--term-bg', '#3c2f2f');
            root.style.setProperty('--term-green', '#d4b483');
        } else if (theme === 'blue') {
            root.style.setProperty('--term-bg', '#0000ff');
            root.style.setProperty('--term-green', '#ffffff');
        } else {
            root.style.setProperty('--term-bg', 'black');
            root.style.setProperty('--term-green', 'hsl(150, 100%, 50%)');
        }
    }

    function startPong() {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        canvas.style.border = '2px solid var(--term-green)';
        canvas.style.display = 'block';
        canvas.style.margin = '10px auto';
        terminalOutput.appendChild(canvas);
        terminalWrapper.scrollTop = terminalWrapper.scrollHeight;

        const ctx = canvas.getContext('2d');
        
        let ball = { x: 200, y: 150, dx: 2, dy: 2, r: 5 };
        let paddle = { x: 150, y: 280, w: 100, h: 10 };
        let score = 0;
        let playing = false;
        let countdown = 3;

        // Mouse control
        function movePaddle(e) {
            const rect = canvas.getBoundingClientRect();
            paddle.x = e.clientX - rect.left - paddle.w / 2;
        }
        canvas.addEventListener('mousemove', movePaddle);

        function drawGame() {
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--term-bg');
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--term-green');
            
            // Ball
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
            ctx.fill();
            
            // Paddle
            ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
            
            // Score
            ctx.font = "20px monospace";
            ctx.fillText("Score: " + score, 10, 25);
        }

        function loop() {
            if (!playing) return;
            
            drawGame();
            
            // Move
            ball.x += ball.dx;
            ball.y += ball.dy;
            
            // Bounce walls
            if (ball.x + ball.r > canvas.width || ball.x - ball.r < 0) ball.dx *= -1;
            if (ball.y - ball.r < 0) ball.dy *= -1;
            
            // Paddle collision
            if (ball.y + ball.r > paddle.y && 
                ball.x > paddle.x && 
                ball.x < paddle.x + paddle.w) {
                ball.dy *= -1;
                score++;
                ball.dx *= 1.1;
                ball.dy *= 1.1;
            }
            
            // Game over
            if (ball.y - ball.r > canvas.height) {
                playing = false;
                ctx.fillText("GAME OVER", 150, 150);
                currentAnimation = null;
            } else {
                currentAnimation = requestAnimationFrame(loop);
            }
        }
        
        // Countdown Loop
        function startCountdown() {
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--term-bg');
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--term-green');
            
            ctx.font = "16px monospace";
            ctx.textAlign = "center";
            ctx.fillText("CONTROLS: USE MOUSE TO MOVE PADDLE", canvas.width/2, 100);
            
            ctx.font = "40px monospace";
            ctx.fillText(countdown, canvas.width/2, 150);
            
            if (countdown > 0) {
                countdown--;
                setTimeout(startCountdown, 1000);
            } else {
                playing = true;
                loop();
            }
        }
        
        startCountdown();
        
        animationCleanup = () => {
            canvas.remove();
            playing = false;
        };
    }

    async function fetchGuestbook() {
        const SUPABASE_URL = 'https://vsyrqyobpaschrftjkmp.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeXJxeW9icGFzY2hyZnRqa21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTYxNzAsImV4cCI6MjA3OTk5MjE3MH0.s1a6_w0tBk8YhbM-L5tShU00csKdHvAXiUgb91qjDnw';

        if (!window.supabase) {
            printOutput("Error: Supabase client not loaded.");
            return;
        }

        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        printOutput("Fetching guestbook entries...");
        
        const { data, error } = await client
            .from('guestbook')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) {
            printOutput("Error fetching data.");
            return;
        }

        // ASCII Table
        printOutput("+----------------------+------------------------------------------+");
        printOutput("| Name                 | Message                                  |");
        printOutput("+----------------------+------------------------------------------+");
        
        data.forEach(row => {
            let name = filterProfanity(row.name || "Anonymous").padEnd(20).substring(0, 20);
            let msg = filterProfanity(row.message || "").padEnd(40).substring(0, 40);
            printOutput(`| ${name} | ${msg} |`);
        });
        
        printOutput("+----------------------+------------------------------------------+");
    }

    function filterProfanity(text) {
        if (!text) return '';
        const badWords = [
            'faggot', 'nigger', 
            'retard', 'spic', 'kike', 'chink', 'dyke', 'tranny'
        ];
        
        let filtered = text;
        badWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            filtered = filtered.replace(regex, '*'.repeat(word.length));
        });
        return filtered;
    }

    function printOutput(text) {
        if (!terminalOutput) return;
        const div = document.createElement('div');
        div.textContent = text;
        div.style.marginTop = '0.2em'; // Tighter spacing for commands
        terminalOutput.appendChild(div);
        // Scroll to bottom
        terminalWrapper.scrollTop = terminalWrapper.scrollHeight;
    }

    // --- Initialization ---
    document.addEventListener('DOMContentLoaded', () => {
        // Load theme
        const savedTheme = localStorage.getItem('linemode-theme');
        if (savedTheme) {
            applyTheme(savedTheme);
        }

        // Intercept link clicks
        document.querySelectorAll('a[data-ref]').forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('data-ref') === '4') {
                    e.preventDefault();
                    initiateShutdown(link.href);
                }
            });
        });

        // Setup command form
        if (commandForm) {
            commandForm.addEventListener('submit', handleCommand);
            // Focus input
            if (cmdInput) cmdInput.focus();
            
            // Keep focus
            document.addEventListener('click', () => {
                if (cmdInput) cmdInput.focus();
            });
        }
        
        // Run effects
        runGlitchEffects();
        
        // Start blocker
        blocker.start();
    });

})();
