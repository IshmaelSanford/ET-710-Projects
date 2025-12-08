document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. Momentum Scroll ---
    let currentScroll = window.scrollY;
    let targetScroll = window.scrollY;
    const ease = 0.02; // Controls the deceleration (approx 750ms settle time)

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
        // Check if external scroll happened (e.g. scrollbar drag, spacebar)
        // If actual scroll position differs significantly from our tracked position, sync them
        if (Math.abs(window.scrollY - currentScroll) > 5) {
            currentScroll = window.scrollY;
            targetScroll = window.scrollY;
        }

        // Linear Interpolation (Lerp)
        currentScroll += (targetScroll - currentScroll) * ease;
        
        // Apply scroll
        window.scrollTo(0, currentScroll);
        
        requestAnimationFrame(updateScroll);
    }
    updateScroll();

    // --- 1. Header Hide/Reveal on Scroll ---
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Only trigger if scrolled more than 50px to avoid top flicker
        if (currentScrollY > 50) {
            if (currentScrollY > lastScrollY) {
                // Scrolling DOWN -> Hide Header
                header.classList.add('header--hidden');
            } else {
                // Scrolling UP -> Show Header
                header.classList.remove('header--hidden');
            }
        } else {
            // At the very top, always show
            header.classList.remove('header--hidden');
        }
        
        lastScrollY = currentScrollY;
    });

    // --- 2. Smooth Scroll for Internal Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Update momentum target to scroll to section
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                
                targetScroll = offsetPosition;
                
                // Clamp to page bounds
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
            }
        });
    });

    // --- 3. Parallax & Scroll Animations ---
    
    // Elements to animate
    const heroBg = document.querySelector('.hero__bg');
    const heroContent = document.querySelector('.hero__content');
    
    const scrollLeftElements = document.querySelectorAll('.scroll-left');
    const scrollRightElements = document.querySelectorAll('.scroll-right');
    
    const layerBg = document.querySelector('.layer-bg');
    const layerMid = document.querySelector('.layer-mid');
    
    // Main Scroll Loop
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const viewportHeight = window.innerHeight;
        
        // A. Hero Parallax
        // Background moves slower (0.5 speed)
        if (heroBg) {
            heroBg.style.transform = `translateY(${scrollY * 0.5}px)`;
        }
        // Content moves slightly faster than bg but slower than scroll (0.2 speed)
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
            heroContent.style.opacity = 1 - (scrollY / 700); // Fade out
        }

        // B. Horizontal Movement (Section 2)
        // We calculate position relative to viewport center
        scrollLeftElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // If element is in view
            if (rect.top < viewportHeight && rect.bottom > 0) {
                // Calculate offset: 0 when centered, negative when below, positive when above
                const offset = (rect.top - viewportHeight / 2) * 0.1; 
                // Move from left to right as we scroll down
                el.style.transform = `translateX(${offset}px)`;
                el.style.opacity = 1; // Ensure visible
            }
        });

        scrollRightElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < viewportHeight && rect.bottom > 0) {
                const offset = (rect.top - viewportHeight / 2) * -0.1; 
                el.style.transform = `translateX(${offset}px)`;
                el.style.opacity = 1;
            }
        });

        // C. Layered Parallax (Section 3)
        const worksSection = document.querySelector('.section-works');
        if (worksSection) {
            const rect = worksSection.getBoundingClientRect();
            // Only animate when section is near viewport
            if (rect.top < viewportHeight && rect.bottom > 0) {
                // Calculate a relative scroll value for this section
                const sectionScroll = (viewportHeight - rect.top);
                
                if (layerBg) {
                    // Background text moves slowly
                    layerBg.style.transform = `translateX(${sectionScroll * 0.1}px)`;
                }
                if (layerMid) {
                    // Floating cards move vertically at different speeds
                    const cards = layerMid.querySelectorAll('.floating-card');
                    cards.forEach((card, index) => {
                        const speed = index % 2 === 0 ? -0.1 : 0.15;
                        card.style.transform = `translateY(${sectionScroll * speed}px)`;
                    });
                }
            }
        }
    });

    // --- 4. Intersection Observer for Fade-ins ---
    const observerOptions = {
        threshold: 0.2, // Trigger when 20% visible
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.reveal-text').forEach(el => observer.observe(el));
    
    // --- 5. Contact & Services Text Oscillation ---
    const group1 = document.querySelectorAll('.contact-line.group-1');
    const group2 = document.querySelector('.contact-line.group-2');
    
    const servicesGroupA = document.querySelectorAll('.services-line.group-a');
    const servicesGroupB = document.querySelectorAll('.services-line.group-b');
    
    let time = 0;
    let scrollVelocity = 0;
    let lastScrollYForVelocity = window.scrollY;
    
    // Animation Loop
    function animateText() {
        // Calculate scroll velocity
        const currentScrollY = window.scrollY;
        const delta = Math.abs(currentScrollY - lastScrollYForVelocity);
        lastScrollYForVelocity = currentScrollY;
        
        // Add velocity to speed (decaying)
        // Base speed is 0.005 (slower), add scroll influence
        // We smooth the velocity input so it doesn't jump too hard
        scrollVelocity += (delta - scrollVelocity) * 0.1;
        
        // Speed multiplier: Base + Scroll Factor
        const speed = 0.005 + (scrollVelocity * 0.002);
        
        // Advance time
        time += speed;
        
        // Calculate positions (Sine wave for oscillation)
        // Amplitude 50px
        const x1 = Math.sin(time) * 50; 
        const x2 = Math.sin(time + Math.PI) * 50; // Opposite phase
        
        // Apply transforms to Contact Section
        group1.forEach(el => {
            el.style.transform = `translateX(${x1}px)`;
        });
        
        if (group2) {
            group2.style.transform = `translateX(${x2}px)`;
        }

        // Apply transforms to Services Section
        servicesGroupA.forEach(el => {
            el.style.transform = `translateX(${x1}px)`;
        });
        
        servicesGroupB.forEach(el => {
            el.style.transform = `translateX(${x2}px)`;
        });
        
        requestAnimationFrame(animateText);
    }
    
    // Start animation loop
    animateText();

    // --- 6. Contact Overlay Logic ---
    const btnWorkWithUs = document.querySelector('.btn-accent');
    const contactOverlay = document.getElementById('contactOverlay');
    const contactModal = document.getElementById('contactModal');
    const btnToForm = document.getElementById('btnToForm');
    const btnBack = document.getElementById('btnBack');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const viewIntro = document.getElementById('viewIntro');
    const viewForm = document.getElementById('viewForm');

    // Open Overlay
    btnWorkWithUs.addEventListener('click', (e) => {
        e.preventDefault();
        contactOverlay.classList.add('active');
    });

    // Close Overlay (Click outside modal)
    contactOverlay.addEventListener('click', (e) => {
        if (e.target === contactOverlay) {
            closeOverlay();
        }
    });

    // Close Overlay (X button)
    btnCloseModal.addEventListener('click', () => {
        closeOverlay();
    });

    // Close Overlay (Esc key)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contactOverlay.classList.contains('active')) {
            closeOverlay();
        }
    });

    function closeOverlay() {
        contactOverlay.classList.remove('active');
        // Reset view after transition
        setTimeout(() => {
            viewForm.style.display = 'none';
            viewIntro.style.display = 'block';
        }, 1000);
    }

    // Switch to Form
    btnToForm.addEventListener('click', () => {
        viewIntro.style.display = 'none';
        viewForm.style.display = 'block';
    });

    // Back to Intro
    btnBack.addEventListener('click', () => {
        viewForm.style.display = 'none';
        viewIntro.style.display = 'block';
    });

});
