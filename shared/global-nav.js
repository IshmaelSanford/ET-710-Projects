(function() {
    // 1. Determine Root Path dynamically
    const script = document.currentScript;
    // Fallback if currentScript is not supported (older browsers) or if loaded asynchronously in a way that loses context
    // But for this simple injection, it should work.
    const src = script ? script.getAttribute('src') : '../shared/global-nav.js';
    const rootPath = src.replace('shared/global-nav.js', '');

    // 2. Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = rootPath + 'shared/global-nav.css'; 
    document.head.appendChild(link);

    // 3. Define Pages (Ordered to match index.html)
    const pages = [
        'Project_11/Project_11.html',
        'museum/scenes/linemode/index.html',
        'Project_9/Project_9.html',
        'Project_8/Project_8.html',
        'Project_1/Project_1.html',
        'Project_2/Project_2.html',
        'Project_3/Project_3_1.html',
        'Project_3/Project_3_2.html',
        'Project_4/Project_4.html',
        'Project_5/Project_5.html',
        'Project_6/Project_6.html',
        'Project_7/Project_7_1.html',
        'Project_7/Project_7_2.html',
        'Project_10/Project_10.html',
        'Project_12/Project_12.html'
    ];

    // 4. Find Current Page
    const path = window.location.pathname;
    // Normalize path separators and decode URI components just in case
    const normalizedPath = decodeURIComponent(path).replace(/\\/g, '/');
    
    let currentIndex = -1;
    for (let i = 0; i < pages.length; i++) {
        // Check if the end of the path matches the page entry
        if (normalizedPath.endsWith(pages[i])) {
            currentIndex = i;
            break;
        }
    }

    // 5. Determine Links
    const homeLink = rootPath + 'index.html';
    let prevLink = null;
    let nextLink = null;
    
    if (currentIndex > 0) {
        prevLink = rootPath + pages[currentIndex - 1];
    }
    
    if (currentIndex < pages.length - 1 && currentIndex !== -1) {
        nextLink = rootPath + pages[currentIndex + 1];
    }

    // 6. Create HTML
    const nav = document.createElement('div');
    nav.className = 'global-nav-container';
    nav.innerHTML = `
        <div class="global-nav-tab">
            <div class="nav-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>
            <div class="nav-links">
                <a href="${homeLink}" class="nav-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    Home
                </a>
                
                ${prevLink ? `
                <div class="nav-separator"></div>
                <a href="${prevLink}" class="nav-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    Prev
                </a>` : ''}
                
                ${nextLink ? `
                <div class="nav-separator"></div>
                <a href="${nextLink}" class="nav-link">
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </a>` : ''}
            </div>
        </div>
    `;

    document.body.appendChild(nav);

})();