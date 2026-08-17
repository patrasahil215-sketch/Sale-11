// Secure Admin Access with Password: s@hil2026
function checkAdminAccess() {
    let isAdminLoggedIn = sessionStorage.getItem('sale11_admin_auth');
    
    if(isAdminLoggedIn === 'true') {
        openAdminDashboard();
    } else {
        let pass = prompt('🔐 Enter Admin Password to Access Control Panel:');
        if(pass === 's@hil2026') {
            sessionStorage.setItem('sale11_admin_auth', 'true');
            openAdminDashboard();
            alert('✅ Welcome to Admin Dashboard!');
        } else if(pass !== null) {
            alert('❌ Incorrect Password! Access Denied.');
        }
    }
}
