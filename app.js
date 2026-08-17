function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
    checkLoginState();
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function handleLogin() {
    const name = document.getElementById('userNameInput').value;
    const phone = document.getElementById('userPhoneInput').value;

    if(name && phone) {
        localStorage.setItem('sale11_user_name', name);
        localStorage.setItem('sale11_user_phone', phone);
        alert('Login Successful!');
        checkLoginState();
    } else {
        alert('Please enter both name and mobile number.');
    }
}

function checkLoginState() {
    const savedName = localStorage.getItem('sale11_user_name');
    const savedPhone = localStorage.getItem('sale11_user_phone');
    const authContainer = document.getElementById('authContainer');
    const profileContainer = document.getElementById('profileContainer');

    if(savedName && savedPhone) {
        authContainer.style.display = 'none';
        profileContainer.style.display = 'block';
        document.getElementById('displayUserName').innerText = 'Name: ' + savedName;
        document.getElementById('displayUserPhone').innerText = 'Phone: ' + savedPhone;
    } else {
        authContainer.style.display = 'block';
        profileContainer.style.display = 'none';
    }
}

function handleLogout() {
    localStorage.removeItem('sale11_user_name');
    localStorage.removeItem('sale11_user_phone');
    alert('Logged out successfully.');
    checkLoginState();
}
