let products = JSON.parse(localStorage.getItem('sale11_products')) || [
    { name: 'Classic Kurti', price: 499, mrp: 999, category: 'Fashion', img: 'https://via.placeholder.com/150' },
    { name: 'Smart Watch', price: 1299, mrp: 2999, category: 'Electronics', img: 'https://via.placeholder.com/150' },
    { name: 'Bedsheet Set', price: 699, mrp: 1499, category: 'Home', img: 'https://via.placeholder.com/150' }
];

let currentCategory = 'All';
renderProducts();

function renderProducts(filteredList = products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    if(filteredList.length === 0) {
        grid.innerHTML = '<p>No products found in this category.</p>';
        return;
    }

    filteredList.forEach((prod, index) => {
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

function filterCategory(category) {
    currentCategory = category;
    
    // Update active button style
    let buttons = document.getElementsByClassName('cat-btn');
    for(let btn of buttons) {
        btn.classList.remove('active');
        if(btn.innerText.includes(category) || (category === 'All' && btn.innerText === 'All')) {
            btn.classList.add('active');
        }
    }

    if(category === 'All') {
        renderProducts(products);
    } else {
        let filtered = products.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// Cart & Coupon System
let cart = JSON.parse(localStorage.getItem('sale11_cart')) || [];
let discountAmount = 0;
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
    renderCartItems();
}

function renderCartItems() {
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
        container.innerHTML += `<div style="display:flex; justify-content:space-between; align-items:center; padding: 6px 0; border-bottom: 1px solid #eee;">
            <span>${item.name} - ₹${item.price}</span>
            <button onclick="removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer;">❌</button>
        </div>`;
    });

    let finalTotal = total - discountAmount;
    if(finalTotal < 0) finalTotal = 0;
    document.getElementById('cartTotalPrice').innerText = finalTotal;
}

function closeCartModal() { document.getElementById('cartModal').style.display = 'none'; }
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('sale11_cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

function applyCoupon() {
    const code = document.getElementById('couponInput').value.trim().toUpperCase();
    if(code === 'SALE11') {
        discountAmount = 50;
        document.getElementById('couponMsg').innerText = '🎉 Coupon Applied! Flat ₹50 OFF';
        renderCartItems();
    } else {
        alert('Invalid Code. Try SALE11');
    }
}

function openCheckoutModal() {
    if(cart.length === 0) { alert('Your cart is empty!'); return; }
    closeCartModal();
    document.getElementById('checkoutModal').style.display = 'block';
}
function closeCheckoutModal() { document.getElementById('checkoutModal').style.display = 'none'; }

// Orders System
let orders = JSON.parse(localStorage.getItem('sale11_orders')) || [];

function placeOrder() {
    const name = document.getElementById('checkoutName').value;
    const phone = document.getElementById('checkoutPhone').value;
    const address = document.getElementById('checkoutAddress').value;
    const city = document.getElementById('checkoutCity').value;
    const pincode = document.getElementById('checkoutPincode').value;

    if(name && phone && address && city && pincode) {
        let orderDetails = {
            id: 'ORD' + Math.floor(100000 + Math.random() * 900000),
            items: [...cart],
            date: new Date().toLocaleDateString(),
            status: 'Order Placed (Confirmed)'
        };
        orders.push(orderDetails);
        localStorage.setItem('sale11_orders', JSON.stringify(orders));

        alert('🎉 Order Placed Successfully!');
        cart = [];
        discountAmount = 0;
        localStorage.removeItem('sale11_cart');
        updateCartCount();
        closeCheckoutModal();
    } else {
        alert('Please fill all details.');
    }
}

function openOrdersModal() {
    closeLoginModal();
    document.getElementById('ordersModal').style.display = 'block';
    const container = document.getElementById('ordersContainer');
    container.innerHTML = '';

    if(orders.length === 0) {
        container.innerHTML = '<p>No orders placed yet.</p>';
        return;
    }

    orders.forEach(ord => {
        container.innerHTML += `
            <div style="background:#f9f9f9; padding: 10px; margin-bottom: 10px; border-radius: 5px; border-left: 4px solid #d81b60;">
                <p><strong>Order ID:</strong> ${ord.id}</p>
                <p><strong>Date:</strong> ${ord.date}</p>
                <p><strong>Status:</strong> <span style="color: green; font-weight:bold;">${ord.status}</span></p>
                <p style="font-size: 13px; color: #555; margin-top: 5px;">Items: ${ord.items.map(i => i.name).join(', ')}</p>
            </div>
        `;
    });
}
function closeOrdersModal() { document.getElementById('ordersModal').style.display = 'none'; }

// Admin Panel
function openAdminModal() { document.getElementById('adminModal').style.display = 'block'; renderAdminProductList(); }
function closeAdminModal() { document.getElementById('adminModal').style.display = 'none'; }
function addNewProduct() {
    const name = document.getElementById('adminProdName').value;
    const price = Number(document.getElementById('adminProdPrice').value);
    const mrp = Number(document.getElementById('adminProdMrp').value);
    const category = document.getElementById('adminProdCat').value;
    const img = document.getElementById('adminProdImg').value || 'https://via.placeholder.com/150';

    if(name && price && mrp) {
        products.push({ name, price, mrp, category, img });
        localStorage.setItem('sale11_products', JSON.stringify(products));
        filterCategory(currentCategory);
        renderAdminProductList();
        alert('Product added!');
        document.getElementById('adminProdName').value = '';
        document.getElementById('adminProdPrice').value = '';
        document.getElementById('adminProdMrp').value = '';
        document.getElementById('adminProdImg').value = '';
    } else { alert('Fill all product fields.'); }
}
function renderAdminProductList() {
    const listContainer = document.getElementById('adminProductList');
    listContainer.innerHTML = '';
    products.forEach((prod, index) => {
        listContainer.innerHTML += `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 4px 0; border-bottom: 1px solid #eee;">
                <span>${prod.name} (${prod.category})</span>
                <button onclick="deleteProduct(${index})" style="background:none; border:none; color:red; cursor:pointer;">Delete</button>
            </div>
        `;
    });
}
function deleteProduct(index) {
    products.splice(index, 1);
    localStorage.setItem('sale11_products', JSON.stringify(products));
    filterCategory(currentCategory);
    renderAdminProductList();
}

// Search & Wishlist
function filterProducts() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let baseList = currentCategory === 'All' ? products : products.filter(p => p.category === currentCategory);
    let filtered = baseList.filter(p => p.name.toLowerCase().includes(input));
    renderProducts(filtered);
}

let wishlist = JSON.parse(localStorage.getItem('sale11_wishlist')) || [];
function toggleWishlist(productName, price, btnElement) {
    const index = wishlist.findIndex(item => item.name === productName);
    if(index > -1) {
        wishlist.splice(index, 1);
        btnElement.classList.remove('active');
    } else {
        wishlist.push({ name: productName, price: price });
        btnElement.classList.add('active');
    }
    localStorage.setItem('sale11_wishlist', JSON.stringify(wishlist));
}
function openWishlistModal() {
    document.getElementById('wishlistModal').style.display = 'block';
    const container = document.getElementById('wishlistItemsContainer');
    container.innerHTML = wishlist.length === 0 ? '<p>Your wishlist is empty.</p>' : '';
    wishlist.forEach(item => { container.innerHTML += `<div>${item.name} - ₹${item.price}</div>`; });
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
    } else { alert('Enter name and phone.'); }
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
    alert('Logged out.');
    checkLoginState();
}
