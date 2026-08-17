// Wishlist System Array
let wishlist = JSON.parse(localStorage.getItem('sale11_wishlist')) || [];

function toggleWishlist(productName, price, btnElement) {
    const index = wishlist.findIndex(item => item.name === productName);
    if(index > -1) {
        wishlist.splice(index, 1);
        btnElement.classList.remove('active');
        alert(productName + ' removed from Wishlist');
    } else {
        wishlist.push({ name: productName, price: price });
        btnElement.classList.add('active');
        alert(productName + ' added to Wishlist ❤️');
    }
    localStorage.setItem('sale11_wishlist', JSON.stringify(wishlist));
}

function openWishlistModal() {
    document.getElementById('wishlistModal').style.display = 'block';
    const container = document.getElementById('wishlistItemsContainer');
    container.innerHTML = '';
    
    if(wishlist.length === 0) {
        container.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
    }

    wishlist.forEach(item => {
        container.innerHTML += `<div style="padding: 10px; border-bottom: 1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
            <span>${item.name} - ₹${item.price}</span>
        </div>`;
    });
}

function closeWishlistModal() {
    document.getElementById('wishlistModal').style.display = 'none';
}

// Reviews Modal
function openReviewModal(productName, rating, count) {
    document.getElementById('reviewModal').style.display = 'block';
    document.getElementById('reviewProductName').innerText = productName + ' Reviews';
    document.getElementById('reviewStats').innerText = `⭐ ${rating} | Based on ${count} reviews`;
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
}

// Search Filter Function
function filterProducts() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let cards = document.getElementsByClassName('product-card');
    
    for (let i = 0; i < cards.length; i++) {
        let title = cards[i].getElementsByTagName('h3')[0].innerText.toLowerCase();
        if (title.includes(input)) {
            cards[i].style.display = "";
        } else {
            cards[i].style.display = "none";
        }
    }
}

// Sorting Function
function sortProducts() {
    let sortValue = document.getElementById('sortSelect').value;
    alert('Sorting applied: ' + sortValue);
}

// Login System Functions
function openLoginModal() { document.getElementById('loginModal').style.display = 'block'; checkLoginState(); }
function closeLoginModal() { document.getElementById('loginModal').style.display = 'none'; }
function handleLogin() {
    const name = document.getElementById('userNameInput').value;
    const phone = document.getElementById('userPhoneInput').value;
    if(name && phone) {
        localStorage.setItem('sale11_user_name', name);
        localStorage.setItem('sale11_user_phone', phone);
        alert('Login Successful!');
        checkLoginState();
    } else { alert('Please enter both name and mobile number.'); }
}
function checkLoginState() {
    const savedName = localStorage.getItem('sale11_user_name');
    const savedPhone = localStorage.getItem('sale11_user_phone');
    if(savedName && savedPhone) {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('profileContainer').style.display = 'block';
        document.getElementById('displayUserName').innerText = 'Name: ' + savedName;
        document.getElementById('displayUserPhone').innerText = 'Phone: ' + savedPhone;
    } else {
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('profileContainer').style.display = 'none';
    }
}
function handleLogout() {
    localStorage.removeItem('sale11_user_name');
    localStorage.removeItem('sale11_user_phone');
    alert('Logged out successfully.');
    checkLoginState();
}
