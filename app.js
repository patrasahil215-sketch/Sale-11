// Theme Toggle Function
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    let icon = document.getElementById('darkModeIcon');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('sale11_theme', 'dark');
        if(icon) icon.className = "fas fa-sun";
    } else {
        localStorage.setItem('sale11_theme', 'light');
        if(icon) icon.className = "fas fa-moon";
    }
}

// Admin Access & Security Modal Function
function checkAdminAccess() {
    let isAdminLoggedIn = sessionStorage.getItem('sale11_admin_auth');
    let modal = document.getElementById('adminLoginModal');
    
    if(isAdminLoggedIn === 'true') {
        openAdminDashboard();
    } else if(modal) {
        modal.style.display = 'flex';
    } else {
        // Fallback agar modal missing ho
        let pass = prompt('Enter Admin Password (default: admin123):');
        if(pass === 'admin123') {
            sessionStorage.setItem('sale11_admin_auth', 'true');
            openAdminDashboard();
        } else if(pass !== null) {
            alert('Incorrect Password!');
        }
    }
}

function closeAdminLoginModal() {
    let modal = document.getElementById('adminLoginModal');
    if(modal) modal.style.display = 'none';
}

function verifyAdminPassword() {
    let passElem = document.getElementById('adminPasswordInput');
    let pass = passElem ? passElem.value : '';
    if(pass === 'admin123') {
        sessionStorage.setItem('sale11_admin_auth', 'true');
        closeAdminLoginModal();
        openAdminDashboard();
    } else {
        alert('Incorrect Admin Password! (Default is admin123)');
    }
}
