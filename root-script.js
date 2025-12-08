document.addEventListener('DOMContentLoaded', () => {
    
    /* 
    // --- 0. Momentum Scroll (Disabled for Scroll Snap) ---
    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;
    const ease = 0.05; // Slightly faster than Project 9 for better responsiveness

    // Capture wheel events to hijack scroll
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        targetScroll += e.deltaY;
        
        // Clamp targetScroll to page bounds
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    }, { passive: false });

    // Animation Loop for Smooth Scroll
    function updateScroll() {
        if (Math.abs(window.scrollY - currentScroll) > 5) {
            currentScroll = window.scrollY;
            targetScroll = window.scrollY;
        }

        currentScroll += (targetScroll - currentScroll) * ease;
        window.scrollTo(0, currentScroll);
        requestAnimationFrame(updateScroll);
    }
    updateScroll();
    */

    // --- 1. Header Hide/Reveal on Scroll ---
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 50) {
            if (currentScrollY > lastScrollY) {
                header.classList.add('header--hidden');
            } else {
                header.classList.remove('header--hidden');
            }
        } else {
            header.classList.remove('header--hidden');
        }
        lastScrollY = currentScrollY;
    });

    // --- 2. Smooth Scroll for Internal Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            // Only intercept if it's actually an anchor link
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                   targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // --- 3. Intersection Observer for Fade-ins ---
    const observerOptions = {
        threshold: 0.2,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-text, .about-text').forEach(el => observer.observe(el));

    // --- 4. Slideshow Logic ---
    setInterval(() => {
        document.querySelectorAll('img[data-slideshow]').forEach(img => {
            const slides = img.dataset.slideshow.split(',');
            let currentIndex = parseInt(img.dataset.index || 0);
            currentIndex = (currentIndex + 1) % slides.length;
            img.src = slides[currentIndex].trim();
            img.dataset.index = currentIndex;
        });
    }, 3000);

    // --- 5. 3D Sphere Hero Section ---
    initSphere();

});

function initSphere() {
    const scene = document.getElementById('scene');
    if (!scene) return;

    const projects = [
        { title: "Project 11", desc: "Virtual Museum Experience", img: "img/proj_11.png", link: "Project_11/Project_11.html" },
        { title: "Web UI Museum", desc: "History of User Interfaces", img: "img/proj_13.png", link: "museum/index.html" },
        { title: "Project 9", desc: "Parallax Scrolling", img: "img/proj_9.png", link: "Project_9/Project_9.html" },
        { title: "Project 8", desc: "Apple Style Minimalism", img: "img/proj_8.png", link: "Project_8/Project_8.html" },
        { title: "Project 1", desc: "HTML Basics", img: "img/proj_1.png", link: "Project_1/Project_1.html" },
        { title: "Project 2", desc: "CSS Styling", img: "img/proj_2.png", link: "Project_2/Project_2.html" },
        { title: "Project 3", desc: "Layouts & Flexbox", img: "img/proj_3_1.png", link: "Project_3/Project_3_1.html" },
        { title: "Project 4", desc: "Forms & Input", img: "img/proj_4.png", link: "Project_4/Project_4.html" },
        { title: "Project 5", desc: "Responsive Design", img: "img/proj_5.png", link: "Project_5/Project_5.html" },
        { title: "Project 6", desc: "Image Formats", img: "img/proj_6.png", link: "Project_6/Project_6.html" },
        { title: "Project 7", desc: "Advanced CSS", img: "img/proj_7_1.png", link: "Project_7/Project_7_1.html" },
        { title: "Project 10", desc: "JavaScript Basics", img: "img/proj_10.png", link: "Project_10/Project_10.html" },
        { title: "Project 12", desc: "Final Showcase", img: "img/proj_12.png", link: "Project_12/Project_12.html" }
    ];

    // Grid Configuration
    const cardWidth = 450; // Increased spacing for larger cards
    const cardHeight = 300; // Increased spacing for larger cards
    const gridCols = 14; // Reduced columns (less items)
    const gridRows = 6; // Reduced rows (less items)
    const radius = 3500; // Radius for spherical curve
    
    const pool = [];
    
    // Create Pool of Elements
    for (let i = 0; i < gridCols * gridRows; i++) {
        const card = document.createElement('div');
        card.className = 'project-card-3d';
        
        const img = document.createElement('img');
        // Initial placeholder
        img.src = projects[0].img;
        card.appendChild(img);
        
        scene.appendChild(card);
        
        pool.push({ 
            element: card, 
            img: img, 
            index: i,
            dataIndex: -1 
        });
    }

    // State
    let scrollX = 0;
    let scrollY = 0;
    let targetScrollX = 0;
    let targetScrollY = 0;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let autoScrollX = 0.5; // Slow auto scroll X
    let autoScrollY = 0.3; // Slow auto scroll Y (Diagonal)
    
    // DOM Elements for Info
    const titleEl = document.getElementById('heroTitle');
    const descEl = document.getElementById('heroDesc');
    const btnEl = document.getElementById('heroBtn');

    // Interaction
    const container = document.querySelector('.hero-3d-container');

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        
        targetScrollX -= deltaX * 1.5; // Invert drag for natural feel
        targetScrollY -= deltaY * 1.5;
        
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'grab';
    });

    // Animation Loop
    function animate() {
        // Auto Scroll
        if (!isDragging) {
            targetScrollX += autoScrollX;
            targetScrollY += autoScrollY;
        }

        // Reset Scroll Values to prevent precision loss and sporadic jitter
        const totalWidth = gridCols * cardWidth;
        const totalHeight = gridRows * cardHeight;

        // Reset when values get too large, but maintain the delta between target and current
        if (Math.abs(targetScrollX) > totalWidth * 50) {
            const resetAmount = Math.floor(targetScrollX / totalWidth) * totalWidth;
            targetScrollX -= resetAmount;
            scrollX -= resetAmount;
        }
        if (Math.abs(targetScrollY) > totalHeight * 50) {
            const resetAmount = Math.floor(targetScrollY / totalHeight) * totalHeight;
            targetScrollY -= resetAmount;
            scrollY -= resetAmount;
        }

        // Smooth Scroll (Lerp)
        scrollX += (targetScrollX - scrollX) * 0.1;
        scrollY += (targetScrollY - scrollY) * 0.1;

        let closestItem = null;
        let minDist = Infinity;

        // Info Panel Collision Logic
        const panel = document.querySelector('.hero-info-panel');
        const panelRect = panel ? panel.getBoundingClientRect() : null;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        pool.forEach((item, index) => {
            const col = index % gridCols;
            const row = Math.floor(index / gridCols);

            // Calculate relative position wrapping around the center
            let xRel = (col * cardWidth - scrollX) % totalWidth;
            let yRel = (row * cardHeight - scrollY) % totalHeight;
            
            // Center the wrap
            if (xRel < -totalWidth / 2) xRel += totalWidth;
            if (xRel > totalWidth / 2) xRel -= totalWidth;
            
            if (yRel < -totalHeight / 2) yRel += totalHeight;
            if (yRel > totalHeight / 2) yRel -= totalHeight;

            // Determine Content
            const worldCol = Math.round((scrollX + xRel) / cardWidth);
            const worldRow = Math.round((scrollY + yRel) / cardHeight);
            let pIndex = (Math.abs(worldCol * 113 + worldRow * 127)) % projects.length;
            
            if (item.dataIndex !== pIndex) {
                item.img.src = projects[pIndex].img;
                item.img.alt = projects[pIndex].title;
                item.data = projects[pIndex];
                item.dataIndex = pIndex;
            }

            // --- Magnification & Spacing Effect ---
            const dist2D = Math.sqrt(xRel * xRel + yRel * yRel);
            let scale = 1;
            
            // Apply magnification near center
            if (dist2D < 600) {
                const factor = (1 - dist2D / 600);
                // Removed repulsion (push) to prevent "speeding up" effect
                
                // Scale up the closer items (Subtler effect)
                scale = 1 + factor * 0.2; // Up to 1.2x scale
            }

            // 3D Projection: Spherical Section
            const angleX = xRel / radius;
            const angleY = yRel / radius;

            const x3d = radius * Math.cos(angleY) * Math.sin(angleX);
            const y3d = radius * Math.sin(angleY);
            const z3d = radius * Math.cos(angleY) * Math.cos(angleX) - radius;

            // Apply Transform
            item.element.style.transform = `translate3d(${x3d}px, ${y3d}px, ${z3d}px) rotateX(${-angleY}rad) rotateY(${angleX}rad) scale(${scale})`;
            // Ensure magnified items are on top
            item.element.style.zIndex = Math.round(scale * 100);

            // Visibility / Opacity
            const distFromCenter = Math.sqrt(angleX * angleX + angleY * angleY);
            let opacity = 1;

            if (distFromCenter > 1.57) { 
                opacity = 0;
            } else {
                opacity = Math.pow(Math.cos(distFromCenter), 4);
            }

            // --- Info Panel Transparency ---
            if (panelRect && opacity > 0.1) {
                // Project 3D point to 2D screen space
                const perspective = 1000; // Must match CSS perspective
                const scaleFactor = perspective / (perspective - z3d);
                const screenX = x3d * scaleFactor + centerX;
                const screenY = y3d * scaleFactor + centerY;

                // Check if center of card is within panel bounds (with some padding)
                if (screenX > panelRect.left && screenX < panelRect.right &&
                    screenY > panelRect.top && screenY < panelRect.bottom) {
                    opacity *= 0.1; // Make transparent
                }
            }

            item.element.style.opacity = Math.max(0, opacity);
            item.element.style.pointerEvents = opacity > 0.1 ? 'auto' : 'none';

            // Find Closest to Center
            const dist = xRel * xRel + yRel * yRel;
            if (dist < minDist) {
                minDist = dist;
                closestItem = item;
            }
            
            // Reset active state
            item.element.classList.remove('is-active');
            item.element.classList.remove('is-dimmed');
        });

        // Update Info Panel
        if (closestItem) {
            closestItem.element.classList.add('is-active');
            
            // Only update text if changed
            if (titleEl.dataset.targetText !== closestItem.data.title) {
                titleEl.dataset.targetText = closestItem.data.title;
                descEl.dataset.targetText = closestItem.data.desc;
                
                triggerGlitch(titleEl, closestItem.data.title);
                triggerGlitch(descEl, closestItem.data.desc);
                btnEl.href = closestItem.data.link;
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// Glitch Effect Helper
function triggerGlitch(element, newText) {
    if (element.dataset.glitchInterval) {
        clearInterval(parseInt(element.dataset.glitchInterval));
    }

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*';
    let iteration = 0;
    
    const interval = setInterval(() => {
        element.innerText = newText
            .split("")
            .map((letter, index) => {
                if (index < iteration) {
                    return newText[index];
                }
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");
        
        if (iteration >= newText.length) { 
            clearInterval(interval);
            delete element.dataset.glitchInterval;
            element.innerText = newText;
        }
        
        iteration += 2; // Speed of resolve
    }, 20);

    element.dataset.glitchInterval = interval;
}
