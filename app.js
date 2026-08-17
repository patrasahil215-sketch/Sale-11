// Check saved theme on load
if (localStorage.getItem('sale11_theme') === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeIcon').className = "fas fa-sun";
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    let icon = document.getElementById('darkModeIcon');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('sale11_theme', 'dark');
        icon.className = "fas fa-sun";
    } else {
        localStorage.setItem('sale11_theme', 'light');
        icon.className = "fas fa-moon";
    }
}
