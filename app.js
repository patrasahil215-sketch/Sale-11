// Default Products Database
let products = JSON.parse(localStorage.getItem('sale11_products')) || [
    { name: 'Classic Kurti', price: 499, mrp: 999, img: 'https://via.placeholder.com/150' },
    { name: 'Smart Watch', price: 1299, mrp: 2999, img: 'https://via.placeholder.com/150' }
];

renderProducts();

// Render Products on Home Page
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    products.forEach((prod, index) => {
        grid.innerHTML += `
            <div class="product-card">
                <button class="wishlist-btn" onclick="toggleWishlist('${prod.name}', ${prod.price}, this)"><i class="fas fa-heart"></i></button>
                <img src="${prod.img}" alt="Product">
                <h3>${prod.name}</h3>
                <p class="price">₹${prod.price} <span class="mrp">₹${prod.mrp}</span></p>
                <button class="btn-primary" onclick="addToCart('${prod.name}', ${prod.price})">Add to Cart</button>
            </div>
        `;
    });
}

// Admin Panel Functions
function openAdminModal() {
    document.getElementById('adminModal').style.display = 'block';
    renderAdminProductList();
}

function closeAdminModal() {
    document.getElementById('adminModal').style.display = 'none';
}

function addNewProduct() {
    const name = document.getElementById('adminProdName').value;
    const price = Number(document.getElementById('adminProdPrice').value);
    const mrp = Number(document.getElementById('adminProdMrp').value);
    const img = document.getElementById('adminProdImg').value || 'https://via.placeholder.com/150';

    if(name && price && mrp) {
        products.push({ name, price, mrp, img });
        localStorage.setItem('sale11_products', JSON.stringify(products));
        renderProducts();
        renderAdminProductList();
        alert('Product added successfully!');
        document.getElementById('adminProdName').value = '';
        document.getElementById('adminProdPrice').value = '';
        document.getElementById('adminProdMrp').value = '';
        document.getElementById('adminProdImg').value = '';
    } else {
        alert('Please fill out product name, price, and MRP.');
    }
}

function renderAdminProductList() {
    const listContainer = document.getElementById('adminProductList');
    listContainer.innerHTML = '';
    products.forEach((prod, index) => {
        listContainer.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 6px 0; border-bottom: 1px solid #eee;">
                <span>${prod.name} (₹${prod.price})</span>
                <button onclick="deleteProduct(${index})" style="background:none; border:none; color:red; cursor:pointer;">Delete</button>
            </div>
        `;
    });
}

function deleteProduct(index) {
    products.splice(index, 1);
    localStorage.setItem('sale11_products', JSON.stringify(products));
    renderProducts();
    renderAdminProductList();
    alert('Product deleted.');
}

// Cart Array & Logic
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

function closeCartModal() { document.getElementById('cartModal').style.display = 'none'; }
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('sale11_cart', JSON.stringify(cart));
    updateCartCount();
    openCartModal();
}

function openCheckoutModal() {
    if(cart.length === 0) { alert('Your cart is empty!'); return; }
    closeCartModal();
    document.getElementById('checkoutModal').style.display = 'block';
}
function closeCheckoutModal() { document.getElementById('checkoutModal').style.display = 'none'; }

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

// Wishlist & Login Functions
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
    if(wishlist.length === 0) { container.innerHTML = '<p>Your wishlist is empty.</p>'; return; }
    wishlist.forEach(item => {
        container.innerHTML += `<div style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.name} - ₹${item.price}</div>`;
    });
}
function closeWishlistModal() { document.getElementById('wishlistModal').style.display = 'none'; }

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
