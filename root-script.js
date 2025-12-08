document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. Momentum Scroll ---
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
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                targetScroll = offsetPosition;
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
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

});
