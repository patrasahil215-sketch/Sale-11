let products = JSON.parse(localStorage.getItem('sale11_products')) || [
    { name: 'Classic Kurti', price: 499, mrp: 999, category: 'Fashion', img: 'https://via.placeholder.com/150' },
    { name: 'Smart Watch', price: 1299, mrp: 2999, category: 'Electronics', img: 'https://via.placeholder.com/150' },
    { name: 'Bedsheet Set', price: 699, mrp: 1499, category: 'Home', img: 'https://via.placeholder.com/150' }
];

let currentCategory = 'All';
renderProducts();
startCountdown();

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
                <button class="share-btn" onclick="shareProduct('${prod.name}', ${prod.price})"><i class="fas fa-share-alt"></i> Share</button>
            </div>
        `;
    });
}

// Address Management
let savedAddresses = JSON.parse(localStorage.getItem('sale11_addresses')) || [];

function openAddressModal() {
    closeLoginModal();
    document.getElementById('addressModal').style.display = 'block';
    renderAddresses();
}

function closeAddressModal() { document.getElementById('addressModal').style.display = 'none'; }

function renderAddresses() {
    let container = document.getElementById('addressList');
    container.innerHTML = '';
    if(savedAddresses.length === 0) {
        container.innerHTML = '<p style="font-size:13px; color:#888;">No saved addresses yet.</p>';
        return;
    }
    savedAddresses.forEach((addr, idx) => {
        container.innerHTML += `<div style="background:#f9f9f9; padding:8px; margin-bottom:5px; border-radius:4px; font-size:13px; display:flex; justify-content:space-between; align-items:center;">
            <span>${addr}</span>
            <button onclick="deleteAddress(${idx})" style="background:none; border:none; color:red; cursor:pointer;">❌</button>
        </div>`;
    });
}

function saveNewAddress() {
    let newAddr = document.getElementById('newAddressInput').value.trim();
    if(newAddr) {
        savedAddresses.push(newAddr);
        localStorage.setItem('sale11_addresses', JSON.stringify(savedAddresses));
        document.getElementById('newAddressInput').value = '';
        renderAddresses();
    } else {
        alert('Please enter an address.');
    }
}

function deleteAddress(idx) {
    savedAddresses.splice(idx, 1);
    localStorage.setItem('sale11_addresses', JSON.stringify(savedAddresses));
    renderAddresses();
}

// Policy Modal
function openPolicyModal(type) {
    document.getElementById('policyModal').style.display = 'block';
    if(type === 'Terms') {
        document.getElementById('policyTitle').innerText = 'Terms & Conditions';
        document.getElementById('policyText').innerText = 'Welcome to Sale 11. By using our platform, you agree to comply with our reselling policies, pricing guidelines, and code of conduct. All orders are subject to availability and confirmation.';
    } else {
        document.getElementById('policyTitle').innerText = 'Privacy Policy';
        document.getElementById('policyText').innerText = 'We respect your privacy and protect your personal data such as name, phone number, and address provided during checkout. Your data is strictly used for order processing and delivery.';
    }
}
function closePolicyModal() { document.getElementById('policyModal').style.display = 'none'; }

function shareProduct(name, price) {
    if (navigator.share) {
        navigator.share({
            title: 'Sale 11 Store',
            text: `Check out ${name} for just ₹${price} on Sale 11!`,
            url: window.location.href,
        }).catch(() => {});
    } else {
        alert(`Product link copied for ${name}!`);
    }
}

function startCountdown() {
    let time = 5 * 3600 + 45 * 60 + 30;
    setInterval(() => {
        let hours = Math.floor(time / 3600);
        let minutes = Math.floor((time % 3600) / 60);
        let seconds = time % 60;
        let timerElem = document.getElementById('countdownTimer');
        if(timerElem) {
            timerElem.innerText = String(hours).padStart(2,'0') + 'h : ' + String(minutes).padStart(2,'0') + 'm : ' + String(seconds).padStart(2,'0') + 's';
        }
        if(time > 0) time--;
    }, 1000);
}

function filterCategory(category) {
    currentCategory = category;
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

function openSupportModal() { document.getElementById('supportModal').style.display = 'block'; }
function closeSupportModal() { document.getElementById('supportModal').style.display = 'none'; }
function submitSupportQuery() {
    let query = document.getElementById('supportQuery').value.trim();
    if(query) {
        alert('✅ Query submitted successfully! Support team will contact you.');
        document.getElementById('supportQuery').value = '';
        closeSupportModal();
    } else { alert('Please write your query first.'); }
}

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
    let badge = document.getElementById('cartCountBadge');
    if(badge) badge.innerText = cart.length;
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
    } else { alert('Invalid Code. Try SALE11'); }
}

function openCheckoutModal() {
    if(cart.length === 0) { alert('Your cart is empty!'); return; }
    closeCartModal();
    document.getElementById('checkoutModal').style.display = 'block';
}
function closeCheckoutModal() { document.getElementById('checkoutModal').style.display = 'none'; }

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
    } else { alert('Please fill all details.'); }
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

    orders.forEach((ord, index) => {
        container.innerHTML += `
            <div style="background:#f9f9f9; padding: 10px; margin-bottom: 10px; border-radius: 5px; border-left: 4px solid #d81b60;">
                <p><strong>Order ID:</strong> ${ord.id}</p>
                <p><strong>Date:</strong> ${ord.date}</p>
                <p><strong>Status:</strong> <span style="color: green; font-weight:bold;" id="status-${index}">${ord.status}</span></p>
                <p style="font-size: 13px; color: #555; margin-top: 5px;">Items: ${ord.items.map(i => i.name).join(', ')}</p>
                <div style="display:flex; gap:5px; margin-top:8px;">
                    <button onclick="openInvoice(${index})" class="btn-secondary" style="padding:4px 8px; font-size:11px;">Invoice 📄</button>
                    <button onclick="requestReturn(${index})" class="btn-secondary" style="background:#e53935; padding:4px 8px; font-size:11px;">Return Order 🔄</button>
                </div>
            </div>
        `;
    });
}
function closeOrdersModal() { document.getElementById('ordersModal').style.display = 'none'; }

function requestReturn(index) {
    orders[index].status = 'Return Requested';
    localStorage.setItem('sale11_orders', JSON.stringify(orders));
    let statusElem = document.getElementById(`status-${index}`);
    if(statusElem) statusElem.innerText = 'Return Requested';
    alert('Return request initiated.');
}

function openInvoice(index) {
    const ord = orders[index];
    document.getElementById('invOrderNo').innerHTML = '<strong>Order ID:</strong> ' + ord.id;
    document.getElementById('invDate').innerHTML = '<strong>Date:</strong> ' + ord.date;
    document.getElementById('invCustomer').innerHTML = '<strong>Customer:</strong> ' + (localStorage.getItem('sale11_user_name') || 'Valued Customer');
    document.getElementById('invAddress').innerHTML = '<strong>Payment:</strong> Cash on Delivery (Verified)';
    
    let listDiv = document.getElementById('invItemsList');
    listDiv.innerHTML = '<h4>Ordered Items:</h4>';
    let total = 0;
    ord.items.forEach(item => {
        total += item.price;
        listDiv.innerHTML += `<div style="display:flex; justify-content:space-between; font-size:14px; margin:4px 0;">
            <span>${item.name}</span>
            <span>₹${item.price}</span>
        </div>`;
    });
    document.getElementById('invTotal').innerText = 'Total: ₹' + total;

    document.getElementById('ordersModal').style.display = 'none';
    document.getElementById('invoiceModal').style.display = 'block';
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').style.display = 'none';
    document.getElementById('ordersModal').style.display = 'block';
}

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

function showSearchSuggestions() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let box = document.getElementById('searchSuggestionsBox');
    box.innerHTML = '';
    
    if(input.length === 0) {
        box.style.display = 'none';
        return;
    }

    let matches = products.filter(p => p.name.toLowerCase().includes(input) || p.category.toLowerCase().includes(input));

    if(matches.length > 0) {
        box.style.display = 'block';
        matches.forEach(m => {
            box.innerHTML += `<div class="suggestion-item" onclick="selectSuggestion('${m.name}')">${m.name} <span style="font-size:11px; color:#888;">(${m.category})</span></div>`;
        });
    } else {
        box.style.display = 'block';
        box.innerHTML = `<div class="suggestion-item" style="color:#888;">No products found</div>`;
    }
    renderProducts(matches);
}

function selectSuggestion(name) {
    document.getElementById('searchInput').value = name;
    document.getElementById('searchSuggestionsBox').style.display = 'none';
    let filtered = products.filter(p => p.name.toLowerCase() === name.toLowerCase());
    renderProducts(filtered);
}

document.addEventListener('click', function(e) {
    if(!e.target.closest('.search-container')) {
        let box = document.getElementById('searchSuggestionsBox');
        if(box) box.style.display = 'none';
    }
});

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
        let auth = document.getElementById('authContainer');
        let prof = document.getElementById('profileContainer');
        if(auth) auth.style.display = 'none';
        if(prof) prof.style.display = 'block';
        let dName = document.getElementById('displayUserName');
        let dPhone = document.getElementById('displayUserPhone');
        if(dName) dName.innerText = 'Name: ' + savedName;
        if(dPhone) dPhone.innerText = 'Phone: ' + savedPhone;
    } else {
        let auth = document.getElementById('authContainer');
        let prof = document.getElementById('profileContainer');
        if(auth) auth.style.display = 'block';
        if(prof) prof.style.display = 'none';
    }
}
function handleLogout() {
    localStorage.removeItem('sale11_user_name');
    localStorage.removeItem('sale11_user_phone');
    alert('Logged out.');
    checkLoginState();
}
