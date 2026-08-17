// Robust Data Initialization with Default Mock Data if empty
let products = JSON.parse(localStorage.getItem('sale11_products')) || [
    { 
        name: 'Classic Reselling Kurti', 
        price: 499, 
        mrp: 999, 
        resellPrice: 750, 
        category: 'Fashion', 
        img: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', 
        images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'], 
        description: 'High quality premium fabric festive kurti designed for modern reselling.', 
        features: 'Soft cotton, Breathable, Fast colors', 
        stock: 25, 
        rating: 4.6 
    },
    { 
        name: 'Smart Bluetooth Watch', 
        price: 1299, 
        mrp: 2999, 
        resellPrice: 1650, 
        category: 'Electronics', 
        img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'], 
        description: 'Advanced fitness smartwatch with heart rate monitor and Bluetooth calling.', 
        features: 'Waterproof, 7-day battery, AMOLED display', 
        stock: 12, 
        rating: 4.8 
    },
    { 
        name: 'Luxury Bedsheet Set', 
        price: 699, 
        mrp: 1499, 
        resellPrice: 950, 
        category: 'Home', 
        img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400', 
        images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400'], 
        description: 'Soft cotton double bedsheet with 2 matching pillow covers.', 
        features: 'Anti-wrinkle, Skin friendly, Easy wash', 
        stock: 8, 
        rating: 4.4 
    }
];

let orders = JSON.parse(localStorage.getItem('sale11_orders')) || [];
let customers = JSON.parse(localStorage.getItem('sale11_customers')) || [];
let cart = JSON.parse(localStorage.getItem('sale11_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('sale11_wishlist')) || [];
let savedAddresses = JSON.parse(localStorage.getItem('sale11_addresses')) || [];
let adminNotifications = JSON.parse(localStorage.getItem('sale11_notifications')) || [];
let settings = JSON.parse(localStorage.getItem('sale11_settings')) || { storeName: 'Sale 11', whatsapp: '+91 9876543210', delivery: 0, cod: 'Enabled' };

let currentCategory = 'All';
let discountAmount = 0;

// Initialize Store on Load
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartCount();
    startCountdown();
    if (localStorage.getItem('sale11_theme') === 'dark') {
        document.body.classList.add('dark-mode');
        let icon = document.getElementById('darkModeIcon');
        if(icon) icon.className = "fas fa-sun";
    }
});

// Theme Toggle
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

// Render Products in Store
function renderProducts(filteredList = products) {
    const grid = document.getElementById('productsGrid');
    if(!grid) return;
    grid.innerHTML = '';
    
    if(filteredList.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding:20px;">No products found.</p>';
        return;
    }

    filteredList.forEach((prod, index) => {
        let margin = prod.resellPrice ? prod.resellPrice - prod.price : Math.round(prod.price * 0.3);
        let discount = prod.mrp > prod.price ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) : 0;
        let stockBadge = prod.stock <= 0 ? `<span style="background:#e53935; color:#fff; font-size:10px; padding:2px 6px; border-radius:4px; position:absolute; top:10px; left:10px;">Out of Stock</span>` : '';

        grid.innerHTML += `
            <div class="product-card" style="position:relative;">
                ${stockBadge}
                <button class="wishlist-btn ${wishlist.some(w => w.name === prod.name) ? 'active' : ''}" onclick="toggleWishlist('${prod.name}', ${prod.price}, this)"><i class="fas fa-heart"></i></button>
                <img src="${prod.img || 'https://via.placeholder.com/150'}" alt="${prod.name}" onclick="openProductDetail(${index})" style="cursor:pointer;" title="Click for details">
                <h3 onclick="openProductDetail(${index})" style="cursor:pointer;">${prod.name}</h3>
                <span class="resell-badge">Margin: ₹${margin} | Resell: ₹${prod.resellPrice || (prod.price + margin)}</span>
                <p class="price">₹${prod.price} <span class="mrp">₹${prod.mrp}</span> <span style="font-size:11px; color:green; float:right;">${discount}% OFF</span></p>
                <div style="font-size:11px; color:#888; margin-bottom:8px;">★ ${prod.rating || 4.5} | Stock: ${prod.stock ?? 10}</div>
                <button class="btn-primary" onclick="addToCart('${prod.name}', ${prod.price})" ${prod.stock <= 0 ? 'disabled style="background:#ccc;cursor:not-allowed;"' : ''}>Add to Cart</button>
                <div style="display:flex; gap:5px; margin-top:5px;">
                    <button class="btn-secondary" onclick="shareProduct('${prod.name}', ${prod.price}, ${prod.resellPrice || (prod.price + margin)})"><i class="fas fa-share-alt"></i> Share</button>
                    <button class="btn-secondary" onclick="whatsappShare('${prod.name}', ${prod.price}, ${prod.resellPrice || (prod.price + margin)})" style="background:#25D366; color:#fff;"><i class="fab fa-whatsapp"></i></button>
                </div>
            </div>
        `;
    });
}

// Product Details & Reviews Modal
function openProductDetail(index) {
    const prod = products[index];
    const modal = document.getElementById('productDetailModal');
    const container = document.getElementById('productDetailContainer');
    
    let extraImagesHtml = '';
    if(prod.images && prod.images.length > 0) {
        prod.images.forEach(img => {
            extraImagesHtml += `<img src="${img}" style="width:60px; height:60px; object-fit:cover; border-radius:4px; cursor:pointer; border:1px solid #ccc;" onclick="document.getElementById('mainDetailImg').src='${img}'">`;
        });
    }

    container.innerHTML = `
        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 250px;">
                <img id="mainDetailImg" src="${prod.img}" style="width:100%; height:260px; object-fit:contain; border-radius:6px; cursor:pointer;" onclick="openImageZoom('${prod.img}', '${prod.name}')">
                <div style="display:flex; gap:5px; margin-top:8px; overflow-x:auto;">${extraImagesHtml}</div>
            </div>
            <div style="flex: 1; min-width: 250px;">
                <h2>${prod.name}</h2>
                <p class="price" style="font-size:18px; margin:5px 0;">₹${prod.price} <span class="mrp">₹${prod.mrp}</span></p>
                <span class="resell-badge">Reselling Price: ₹${prod.resellPrice || prod.price + 200}</span>
                <p style="font-size:13px; color:#666; margin:8px 0;"><strong>Category:</strong> ${prod.category}</p>
                <p style="font-size:13px; color:#666; margin:8px 0;"><strong>Features:</strong> ${prod.features || 'Standard high quality product'}</p>
                <p style="font-size:13px; margin:8px 0;">${prod.description || 'No description provided.'}</p>
                <p style="font-size:12px; color:green; font-weight:600; margin:10px 0;">✓ Cash on Delivery Available | ✓ Easy Returns within 7 Days</p>
                
                <div style="display:flex; gap:10px; margin-top:15px;">
                    <button class="btn-primary" onclick="addToCart('${prod.name}', ${prod.price}); closeProductDetailModal();">Add to Cart</button>
                    <button class="btn-primary" style="background:#388e3c;" onclick="buyNowDirect('${prod.name}', ${prod.price})">Buy Now</button>
                </div>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeProductDetailModal() {
    document.getElementById('productDetailModal').style.display = 'none';
}

// Direct Buy Now
function buyNowDirect(name, price) {
    closeProductDetailModal();
    cart = [{ name: name, price: price }];
    localStorage.setItem('sale11_cart', JSON.stringify(cart));
    updateCartCount();
    openCheckoutModal();
}

// Image Zoom Modal
function openImageZoom(imgUrl, prodName) {
    document.getElementById('zoomImageSrc').src = imgUrl;
    document.getElementById('zoomProductName').innerText = prodName;
    document.getElementById('imageZoomModal').style.display = 'block';
}
function closeZoomModal() {
    document.getElementById('imageZoomModal').style.display = 'none';
}

// Sharing & WhatsApp Reselling
function shareProduct(name, price, resellPrice) {
    if (navigator.share) {
        navigator.share({
            title: 'Sale 11 Reselling',
            text: `Check out ${name} at best reselling price ₹${resellPrice} (Your cost: ₹${price})!`,
            url: window.location.href,
        }).catch(() => {});
    } else {
        alert(`Product link copied for ${name}!`);
    }
}

function whatsappShare(name, price, resellPrice) {
    let msg = encodeURIComponent(`🔥 Hot Reselling Item! *${name}*\n💰 Resell Price: ₹${resellPrice}\n📦 Order now from Sale 11 Store!\nLink: ${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
}

// Countdown Timer
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

// Filtering & Sorting
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

function sortProducts() {
    let sortBy = document.getElementById('sortFilter').value;
    let sorted = [...products];
    if(sortBy === 'low-high') sorted.sort((a,b) => a.price - b.price);
    if(sortBy === 'high-low') sorted.sort((a,b) => b.price - a.price);
    if(sortBy === 'rating') sorted.sort((a,b) => (b.rating || 4.5) - (a.rating || 4.5));
    renderProducts(sorted);
}

// Search Suggestions
function showSearchSuggestions() {
    let input = document.getElementById('searchInput').value.toLowerCase();
    let box = document.getElementById('searchSuggestionsBox');
    if(!box) return;
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

// Cart Management
function addToCart(name, price) {
    let prod = products.find(p => p.name === name);
    if(prod && prod.stock <= 0) {
        alert('Sorry, product is out of stock!');
        return;
    }
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
    document.getElementById('cartModal').style.display = 'flex';
    renderCartItems();
}

function renderCartItems() {
    const container = document.getElementById('cartItemsContainer');
    if(!container) return;
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
    document.getElementById('checkoutModal').style.display = 'flex';
}
function closeCheckoutModal() { document.getElementById('checkoutModal').style.display = 'none'; }

// Payment Selection Toggle
document.addEventListener('change', function(e) {
    if(e.target.name === 'payment') {
        let qrBox = document.getElementById('upiScannerBox');
        if(qrBox) {
            qrBox.style.display = e.target.value === 'UPI' ? 'block' : 'none';
        }
    }
});

// Place Order & Update Inventory/Stats
function placeOrder() {
    const name = document.getElementById('checkoutName').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const address = document.getElementById('checkoutAddress').value.trim();
    const city = document.getElementById('checkoutCity').value.trim();
    const pincode = document.getElementById('checkoutPincode').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

    if(name && phone && address && city && pincode) {
        let orderDetails = {
            id: 'ORD' + Math.floor(100000 + Math.random() * 900000),
            customerName: name,
            phone: phone,
            address: `${address}, ${city} - ${pincode}`,
            items: [...cart],
            totalAmount: cart.reduce((sum, item) => sum + item.price, 0) - discountAmount,
            payment: paymentMethod,
            date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            timestamp: new Date().getTime(),
            status: 'Pending'
        };

        orders.push(orderDetails);
        localStorage.setItem('sale11_orders', JSON.stringify(orders));

        // Deduct Stock
        cart.forEach(cartItem => {
            let p = products.find(prod => prod.name === cartItem.name);
            if(p && p.stock > 0) {
                p.stock -= 1;
            }
        });
        localStorage.setItem('sale11_products', JSON.stringify(products));

        // Track Customer
        let existingCust = customers.find(c => c.phone === phone);
        if(!existingCust) {
            customers.push({ name: name, phone: phone, address: address, ordersCount: 1, totalSpent: orderDetails.totalAmount });
        } else {
            existingCust.ordersCount += 1;
            existingCust.totalSpent += orderDetails.totalAmount;
        }
        localStorage.setItem('sale11_customers', JSON.stringify(customers));

        // Add Notification
        adminNotifications.unshift({ text: `New order #${orderDetails.id} received from ${name}`, time: new Date().toLocaleTimeString() });
        localStorage.setItem('sale11_notifications', JSON.stringify(adminNotifications));

        alert('🎉 Order Placed Successfully!');
        cart = [];
        discountAmount = 0;
        localStorage.removeItem('sale11_cart');
        updateCartCount();
        closeCheckoutModal();
        renderProducts();
    } else { 
        alert('Please fill all required checkout fields.'); 
    }
}

// Orders Modal
function openOrdersModal() {
    closeLoginModal();
    document.getElementById('ordersModal').style.display = 'flex';
    const container = document.getElementById('ordersContainer');
    container.innerHTML = '';

    if(orders.length === 0) {
        container.innerHTML = '<p>No orders placed yet.</p>';
        return;
    }

    orders.forEach((ord, index) => {
        container.innerHTML += `
            <div style="background:var(--bg-color); padding: 10px; margin-bottom: 10px; border-radius: 5px; border-left: 4px solid var(--primary-color);">
                <p><strong>Order ID:</strong> ${ord.id}</p>
                <p><strong>Date:</strong> ${ord.date}</p>
                <p><strong>Status:</strong> <span style="color: green; font-weight:bold;">${ord.status}</span></p>
                <p style="font-size: 13px; color: var(--text-color); margin-top: 5px;">Items: ${ord.items.map(i => i.name).join(', ')} (₹${ord.totalAmount})</p>
                <div style="display:flex; gap:5px; margin-top:8px;">
                    <button onclick="openInvoice(${index})" class="btn-secondary" style="padding:4px 8px; font-size:11px;">Invoice 📄</button>
                </div>
            </div>
        `;
    });
}
function closeOrdersModal() { document.getElementById('ordersModal').style.display = 'none'; }

function openInvoice(index) {
    const ord = orders[index];
    document.getElementById('invOrderNo').innerHTML = '<strong>Order ID:</strong> ' + ord.id;
    document.getElementById('invDate').innerHTML = '<strong>Date:</strong> ' + ord.date;
    document.getElementById('invCustomer').innerHTML = '<strong>Customer:</strong> ' + ord.customerName;
    document.getElementById('invAddress').innerHTML = '<strong>Payment:</strong> ' + ord.payment;
    
    let listDiv = document.getElementById('invItemsList');
    listDiv.innerHTML = '<h4>Ordered Items:</h4>';
    ord.items.forEach(item => {
        listDiv.innerHTML += `<div style="display:flex; justify-content:space-between; font-size:14px; margin:4px 0;">
            <span>${item.name}</span>
            <span>₹${item.price}</span>
        </div>`;
    });
    document.getElementById('invTotal').innerText = 'Total: ₹' + ord.totalAmount;

    document.getElementById('ordersModal').style.display = 'none';
    document.getElementById('invoiceModal').style.display = 'flex';
}
function closeInvoiceModal() {
    document.getElementById('invoiceModal').style.display = 'none';
    document.getElementById('ordersModal').style.display = 'flex';
}

// Support, Policy & Address Modals
function openSupportModal() { document.getElementById('supportModal').style.display = 'flex'; }
function closeSupportModal() { document.getElementById('supportModal').style.display = 'none'; }
function submitSupportQuery() {
    let query = document.getElementById('supportQuery').value.trim();
    if(query) {
        alert('✅ Query submitted successfully! Support team will contact you.');
        document.getElementById('supportQuery').value = '';
        closeSupportModal();
    } else { alert('Please write your query first.'); }
}

function openPolicyModal(type) {
    document.getElementById('policyModal').style.display = 'flex';
    if(type === 'Terms') {
        document.getElementById('policyTitle').innerText = 'Terms & Conditions';
        document.getElementById('policyText').innerText = 'Welcome to Sale 11. By using our platform, you agree to comply with our reselling policies and code of conduct.';
    } else {
        document.getElementById('policyTitle').innerText = 'Privacy Policy';
        document.getElementById('policyText').innerText = 'We protect your personal data such as name, phone number, and address provided during checkout.';
    }
}
function closePolicyModal() { document.getElementById('policyModal').style.display = 'none'; }

function openAddressModal() {
    closeLoginModal();
    document.getElementById('addressModal').style.display = 'flex';
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
        container.innerHTML += `<div style="background:var(--bg-color); padding:8px; margin-bottom:5px; border-radius:4px; font-size:13px; display:flex; justify-content:space-between; align-items:center;">
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
    } else { alert('Please enter an address.'); }
}
function deleteAddress(idx) {
    savedAddresses.splice(idx, 1);
    localStorage.setItem('sale11_addresses', JSON.stringify(savedAddresses));
    renderAddresses();
}

// Wishlist
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
    document.getElementById('wishlistModal').style.display = 'flex';
    const container = document.getElementById('wishlistItemsContainer');
    container.innerHTML = wishlist.length === 0 ? '<p>Your wishlist is empty.</p>' : '';
    wishlist.forEach(item => { container.innerHTML += `<div>${item.name} - ₹${item.price}</div>`; });
}
function closeWishlistModal() { document.getElementById('wishlistModal').style.display = 'none'; }

// Customer Account Login
function openLoginModal() { document.getElementById('loginModal').style.display = 'flex'; checkLoginState(); }
function closeLoginModal() { document.getElementById('loginModal').style.display = 'none'; }
function handleLogin() {
    const name = document.getElementById('userNameInput').value.trim();
    const phone = document.getElementById('userPhoneInput').value.trim();
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


/* ========================================================
   PRO ADMIN PANEL LOGIC & SECURITY
   ======================================================== */

function checkAdminAccess() {
    let isAdminLoggedIn = sessionStorage.getItem('sale11_admin_auth');
    if(isAdminLoggedIn === 'true') {
        openAdminDashboard();
    } else {
        document.getElementById('adminLoginModal').style.display = 'flex';
    }
}

function closeAdminLoginModal() {
    document.getElementById('adminLoginModal').style.display = 'none';
}

function verifyAdminPassword() {
    let pass = document.getElementById('adminPasswordInput').value;
    if(pass === 'admin123') {
        sessionStorage.setItem('sale11_admin_auth', 'true');
        closeAdminLoginModal();
        openAdminDashboard();
    } else {
        alert('Incorrect Admin Password! (Default is admin123)');
    }
}

function openAdminDashboard() {
    document.getElementById('customerStoreView').style.display = 'none';
    document.getElementById('adminDashboardView').style.display = 'block';
    updateAdminDashboardStats();
    renderAdminProductTable();
    renderAdminOrders();
    renderAdminCustomers();
    renderAdminNotifications();
}

function switchTab(tab) {
    if(tab === 'store') {
        document.getElementById('adminDashboardView').style.display = 'none';
        document.getElementById('customerStoreView').style.display = 'block';
        renderProducts();
    }
}

// Admin Sub-Tabs Navigation
function switchAdminTab(tabName) {
    let tabs = ['dashboard', 'products', 'orders', 'customers', 'settings'];
    tabs.forEach(t => {
        let content = document.getElementById('adminTab' + t.charAt(0).toUpperCase() + t.slice(1));
        let btn = document.getElementById('tabBtn' + t.charAt(0).toUpperCase() + t.slice(1, 4));
        if(content) content.style.display = (t === tabName) ? 'block' : 'none';
    });
}

// Dashboard Stats Calculation
function updateAdminDashboardStats() {
    let totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
    let totalOrders = orders.length;
    let totalProducts = products.length;
    let totalCustomers = customers.length;
    let pendingOrders = orders.filter(o => o.status === 'Pending').length;

    let todayStr = new Date().toLocaleDateString();
    let todayRev = orders.filter(o => o.date.startsWith(todayStr)).reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);

    document.getElementById('statRevenue').innerText = totalRevenue;
    document.getElementById('statOrders').innerText = totalOrders;
    document.getElementById('statProds').innerText = totalProducts;
    document.getElementById('statCusts').innerText = totalCustomers;
    document.getElementById('statPending').innerText = pendingOrders;
    document.getElementById('statTodayRev').innerText = todayRev;
}

// Admin Product Management (Add, Edit, Delete, Stock update)
function saveAdminProduct() {
    const editIndex = Number(document.getElementById('editProductIndex').value);
    const name = document.getElementById('adminProdName').value.trim();
    const price = Number(document.getElementById('adminProdPrice').value);
    const mrp = Number(document.getElementById('adminProdMrp').value);
    const resellPrice = Number(document.getElementById('adminProdResell').value) || (price + 200);
    const category = document.getElementById('adminProdCat').value;
    const stock = Number(document.getElementById('adminProdStock').value) || 10;
    const rating = Number(document.getElementById('adminProdRating').value) || 4.5;
    const img = document.getElementById('adminProdImg').value.trim() || 'https://via.placeholder.com/150';
    const imagesInput = document.getElementById('adminProdImages').value;
    const description = document.getElementById('adminProdDesc').value.trim();
    const features = document.getElementById('adminProdFeatures').value.trim();

    let images = imagesInput ? imagesInput.split(',').map(item => item.trim()) : [img];

    if(name && price && mrp) {
        let productData = { name, price, mrp, resellPrice, category, stock, rating, img, images, description, features };
        
        if(editIndex === -1) {
            products.push(productData);
            alert('✅ Product added successfully!');
        } else {
            products[editIndex] = productData;
            alert('✅ Product updated successfully!');
        }

        localStorage.setItem('sale11_products', JSON.stringify(products));
        renderAdminProductTable();
        updateAdminDashboardStats();
        resetAdminForm();
    } else {
        alert('Please fill Name, Selling Price, and MRP.');
    }
}

function renderAdminProductTable() {
    const tbody = document.getElementById('adminProductsTableBody');
    const searchFilter = document.getElementById('adminSearchProd').value.toLowerCase();
    tbody.innerHTML = '';

    let filtered = products.filter(p => p.name.toLowerCase().includes(searchFilter));

    if(filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:15px;">No products found.</td></tr>`;
        return;
    }

    filtered.forEach((prod, index) => {
        let realIndex = products.indexOf(prod);
        tbody.innerHTML += `
            <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 10px;"><img src="${prod.img}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;"></td>
                <td style="padding: 10px;"><strong>${prod.name}</strong><br><span style="font-size:11px; color:#888;">${prod.category}</span></td>
                <td style="padding: 10px;">₹${prod.price} <span style="text-decoration:line-through; font-size:11px; color:#888;">₹${prod.mrp}</span></td>
                <td style="padding: 10px;">₹${prod.resellPrice || prod.price + 200}</td>
                <td style="padding: 10px;">
                    <input type="number" value="${prod.stock ?? 10}" style="width:60px; padding:3px;" onchange="updateStockDirect(${realIndex}, this.value)">
                </td>
                <td style="padding: 10px;">
                    <button onclick="editAdminProduct(${realIndex})" style="background:#1976d2; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Edit ✏️</button>
                    <button onclick="deleteAdminProduct(${realIndex})" style="background:#e53935; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Delete ❌</button>
                </td>
            </tr>
        `;
    });
}

function updateStockDirect(index, newStock) {
    products[index].stock = Number(newStock);
    localStorage.setItem('sale11_products', JSON.stringify(products));
}

function editAdminProduct(index) {
    const prod = products[index];
    document.getElementById('editProductIndex').value = index;
    document.getElementById('adminProdName').value = prod.name;
    document.getElementById('adminProdPrice').value = prod.price;
    document.getElementById('adminProdMrp').value = prod.mrp;
    document.getElementById('adminProdResell').value = prod.resellPrice || '';
    document.getElementById('adminProdCat').value = prod.category;
    document.getElementById('adminProdStock').value = prod.stock ?? 10;
    document.getElementById('adminProdRating').value = prod.rating || 4.5;
    document.getElementById('adminProdImg').value = prod.img;
    document.getElementById('adminProdImages').value = prod.images ? prod.images.join(', ') : '';
    document.getElementById('adminProdDesc').value = prod.description || '';
    document.getElementById('adminProdFeatures').value = prod.features || '';

    document.getElementById('adminFormTitle').innerText = '✏️ Edit Product';
    document.getElementById('adminSaveBtn').innerText = 'Update Product';
    document.getElementById('adminCancelBtn').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetAdminForm() {
    document.getElementById('editProductIndex').value = '-1';
    document.getElementById('adminProdName').value = '';
    document.getElementById('adminProdPrice').value = '';
    document.getElementById('adminProdMrp').value = '';
    document.getElementById('adminProdResell').value = '';
    document.getElementById('adminProdStock').value = '';
    document.getElementById('adminProdRating').value = '4.5';
    document.getElementById('adminProdImg').value = '';
    document.getElementById('adminProdImages').value = '';
    document.getElementById('adminProdDesc').value = '';
    document.getElementById('adminProdFeatures').value = '';

    document.getElementById('adminFormTitle').innerText = '➕ Add New Product';
    document.getElementById('adminSaveBtn').innerText = 'Save Product';
    document.getElementById('adminCancelBtn').style.display = 'none';
}

function deleteAdminProduct(index) {
    if(confirm('Are you sure you want to delete this product?')) {
        products.splice(index, 1);
        localStorage.setItem('sale11_products', JSON.stringify(products));
        renderAdminProductTable();
        updateAdminDashboardStats();
    }
}

// Order Management in Admin Panel
function renderAdminOrders() {
    const container = document.getElementById('adminOrdersContainer');
    const statusFilter = document.getElementById('adminOrderStatusFilter').value;
    container.innerHTML = '';

    let filteredOrders = orders.filter(o => statusFilter === 'All' || o.status === statusFilter);

    if(filteredOrders.length === 0) {
        container.innerHTML = '<p>No orders found for this status.</p>';
        return;
    }

    filteredOrders.forEach((ord, index) => {
        let realIndex = orders.indexOf(ord);
        container.innerHTML += `
            <div style="background: var(--bg-color); padding: 15px; margin-bottom: 12px; border-radius: 6px; border-left: 4px solid var(--primary-color);">
                <p><strong>Order ID:</strong> ${ord.id} | <strong>Date:</strong> ${ord.date}</p>
                <p><strong>Customer:</strong> ${ord.customerName} (${ord.phone})</p>
                <p><strong>Address:</strong> ${ord.address}</p>
                <p><strong>Items:</strong> ${ord.items.map(i => i.name).join(', ')} (<strong>₹${ord.totalAmount}</strong> - ${ord.payment})</p>
                <div style="margin-top: 10px; display: flex; align-items: center; gap: 10px;">
                    <label style="font-size: 13px; font-weight: 600;">Status:</label>
                    <select class="input-box" style="width: 160px; margin:0;" onchange="updateOrderStatus(${realIndex}, this.value)">
                        <option value="Pending" ${ord.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${ord.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Shipped" ${ord.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Out for Delivery" ${ord.status === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="Delivered" ${ord.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${ord.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </div>
            </div>
        `;
    });
}

function updateOrderStatus(index, newStatus) {
    orders[index].status = newStatus;
    localStorage.setItem('sale11_orders', JSON.stringify(orders));
    updateAdminDashboardStats();
    renderAdminOrders();
    alert('Order status updated to ' + newStatus);
}

// Customers List in Admin Panel
function renderAdminCustomers() {
    const container = document.getElementById('adminCustomersContainer');
    container.innerHTML = '';

    if(customers.length === 0) {
        container.innerHTML = '<p>No registered customers yet.</p>';
        return;
    }

    customers.forEach(cust => {
        container.innerHTML += `
            <div style="background: var(--bg-color); padding: 12px; margin-bottom: 8px; border-radius: 6px; font-size: 13px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${cust.name}</strong> (${cust.phone})<br>
                    <span style="color:#888;">Total Orders: ${cust.ordersCount} | Total Spent: ₹${cust.totalSpent}</span>
                </div>
            </div>
        `;
    });
}

// Notifications in Admin Panel
function renderAdminNotifications() {
    const list = document.getElementById('adminNotificationsList');
    list.innerHTML = '';
    if(adminNotifications.length === 0) {
        list.innerHTML = '<p style="font-size: 13px; color: #888;">No new alerts.</p>';
        return;
    }
    adminNotifications.forEach(notif => {
        list.innerHTML += `<div style="padding:6px 0; border-bottom:1px solid var(--border-color); font-size:13px;">🔔 ${notif.text} <span style="font-size:11px; color:#888; float:right;">${notif.time}</span></div>`;
    });
}

// Settings Save
function saveAdminSettings() {
    settings.storeName = document.getElementById('stStoreName').value;
    settings.whatsapp = document.getElementById('stWhatsapp').value;
    settings.delivery = document.getElementById('stDelivery').value;
    settings.cod = document.getElementById('stCodStatus').value;
    localStorage.setItem('sale11_settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
}
