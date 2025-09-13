function init(){
    loadLogo();
    loadThemme();
            
}

function loadThemme(){
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.querySelector('.theme-icon');
            
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }

    loadSocials();
}

function loadLogo(){
    let num = Math.floor(Math.random() * 3) + 1;
    document.getElementById('Logo').src = '/images/logos/logo_' + num +".png";
}

function toggleTheme() {
    const body = document.body;
    
    const themeIcon = document.querySelector('.theme-icon');
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'dark') {
        body.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }

    loadSocials();
}

function loadSocials(){
    const swapImages = document.querySelectorAll('.theme-swap');
    swapImages.forEach(element => {
            const srcParts = element.src.split('.');
            const extension = srcParts.pop(); // Get the last part (extension)
            const baseName = srcParts.join('.'); // Join everything else back
            const theme = document.body.getAttribute('data-theme') == null ? 'light' : 'dark' 
            element.src = baseName.split("-")[0] + "-" + theme + '.' + extension;
        });
}