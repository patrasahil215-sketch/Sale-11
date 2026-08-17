// Cart Array
let cart = JSON.parse(localStorage.getItem('sale11_cart')) || [];
updateCartCount();

function addToCart(name, price) {
    cart.push({ name: name, price: price });
    localStorage.setItem('sale11_cart', JSON.stringify(cart));
    updateCartCount();
    alert(name + ' added to Cart 🛒');
}

function updateCartCount() {
    document.getElementById('cartCountBadge').innerText = cart.length;
}

function openCartModal() {
    document.getElementById('cartModal').style.display = 'block';
    const container = document.getElementById('cartItemsContainer');
    container.innerHTML = '';
    let total = 0;

    if(cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        document.getElementById('cartTotalPrice').innerText = '0';
        return;
    }

    cart.forEach((item, index) => {
        total += item.price;
        container.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:center; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span>${item.name} - ₹${item.price}</span>
            <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer;">❌</button>
        </div>`;
    });
    document.getElementById('cartTotalPrice').innerText = total;
}

function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('sale11_cart', JSON.stringify(cart));
    updateCartCount();
    openCartModal();
}

function openCheckoutModal() {
    if(cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    closeCartModal();
    document.getElementById('checkoutModal').style.display = 'block';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
}

function placeOrder() {
    const name = document.getElementById('checkoutName').value;
    const phone = document.getElementById('checkoutPhone').value;
    const address = document.getElementById('checkoutAddress').value;
    const city = document.getElementById('checkoutCity').value;
    const pincode = document.getElementById('checkoutPincode').value;

    if(name && phone && address && city && pincode) {
        alert('🎉 Order Placed Successfully! Thank you for shopping with Sale 11.');
        cart = [];
        localStorage.removeItem('sale11_cart');
        updateCartCount();
        closeCheckoutModal();
    } else {
        alert('Please fill in all delivery address details.');
    }
}

// Wishlist System
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
        container.innerHTML += `<div style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.name} - ₹${item.price}</div>`;
    });
}
function closeWishlistModal() { document.getElementById('wishlistModal').style.display = 'none'; }

// Login Functions
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
