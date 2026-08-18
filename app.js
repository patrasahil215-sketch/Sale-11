/* =========================================================
   SALE 11 - BASIC STORE + ADMIN SYSTEM
   Step 1
   ========================================================= */

// ---------- STORAGE ----------
const PRODUCTS_KEY = "sale11_products";
const ORDERS_KEY = "sale11_orders";
const CUSTOMERS_KEY = "sale11_customers";
const SETTINGS_KEY = "sale11_settings";
const CART_KEY = "sale11_cart";
const WISHLIST_KEY = "sale11_wishlist";
const USER_KEY = "sale11_current_user";

// ---------- DEFAULT PRODUCTS ----------
const defaultProducts = [
    {
        id: "P1001",
        name: "Sample Fashion Product",
        category: "Fashion",
        price: 399,
        mrp: 699,
        resellPrice: 300,
        stock: 10,
        image: "",
        description: "Sample product. You can edit or delete this product.",
        meeshoLink: "",
        sizes: "",
        colors: ""
    }
];

// ---------- GET DATA ----------
function getProducts() {
    const data = localStorage.getItem(PRODUCTS_KEY);

    if (!data) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
        return [...defaultProducts];
    }

    try {
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function saveProducts(products) {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function getOrders() {
    try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveOrders(orders) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function getCustomers() {
    try {
        return JSON.parse(localStorage.getItem(CUSTOMERS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCustomers(customers) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch {
        return [];
    }
}

function saveWishlist(list) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
}

// ---------- ADMIN LOGIN ----------
function checkAdminAccess() {
    const loggedIn = sessionStorage.getItem("sale11_admin_auth");

    if (loggedIn === "true") {
        openAdminDashboard();
        return;
    }

    const password = prompt("🔐 Enter Admin Password:");

    if (password === null) return;

    /*
      IMPORTANT:
      This is only a temporary client-side gate.
      A real secure admin login requires a backend/authentication service.
    */

    if (password === "CHANGE_THIS_ADMIN_PASSWORD") {
        sessionStorage.setItem("sale11_admin_auth", "true");
        openAdminDashboard();
        alert("✅ Welcome to Sale 11 Admin!");
    } else {
        alert("❌ Incorrect Password!");
    }
}

function logoutAdmin() {
    sessionStorage.removeItem("sale11_admin_auth");
    switchTab("store");
}

// ---------- PAGE SWITCH ----------
function switchTab(tab) {
    const store = document.getElementById("customerStoreView");
    const admin = document.getElementById("adminDashboardView");

    if (tab === "admin") {
        if (store) store.style.display = "none";
        if (admin) admin.style.display = "block";
    } else {
        if (store) store.style.display = "block";
        if (admin) admin.style.display = "none";
    }
}

function openAdminDashboard() {
    switchTab("admin");
    switchAdminTab("dashboard");
    updateAdminDashboard();
}

function switchAdminTab(tab) {
    const tabs = {
        dashboard: "adminTabDashboard",
        products: "adminTabProducts",
        orders: "adminTabOrders",
        customers: "adminTabCustomers",
        settings: "adminTabSettings"
    };

    Object.keys(tabs).forEach(key => {
        const el = document.getElementById(tabs[key]);
        if (el) el.style.display = key === tab ? "block" : "none";
    });

    const buttons = {
        dashboard: "tabBtnDash",
        products: "tabBtnProds",
        orders: "tabBtnOrders",
        customers: "tabBtnCust",
        settings: "tabBtnSett"
    };

    Object.keys(buttons).forEach(key => {
        const btn = document.getElementById(buttons[key]);
        if (btn) btn.classList.toggle("active", key === tab);
    });

    if (tab === "dashboard") updateAdminDashboard();
    if (tab === "products") renderAdminProducts();
    if (tab === "orders") renderAdminOrders();
    if (tab === "customers") renderAdminCustomers();
}

// ---------- PRODUCTS ----------
function renderProducts() {
    const grid = document.getElementById("productsGrid");
    if (!grid) return;

    const products = getProducts();

    if (!products.length) {
        grid.innerHTML = "<p>No products available.</p>";
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card">

            <button class="wishlist-btn"
                onclick="toggleWishlist('${product.id}')">
                ❤️
            </button>

            ${
                product.image
                ? `<img src="${product.image}"
                        alt="${escapeHtml(product.name)}"
                        onclick="openProductDetail('${product.id}')">`
                : `<div style="
                        height:180px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#eee;
                        border-radius:6px;
                        font-size:45px;">
                        📦
                   </div>`
            }

            <div>
                <span class="resell-badge">Reselling Product</span>

                <h3 onclick="openProductDetail('${product.id}')">
                    ${escapeHtml(product.name)}
                </h3>

                <div class="price">
                    ₹${Number(product.price || 0)}
                    <span class="mrp">₹${Number(product.mrp || 0)}</span>
                </div>

                <p style="font-size:11px;color:#777;">
                    ${escapeHtml(product.category || "")}
                </p>
            </div>

            <button class="btn-primary"
                onclick="addToCart('${product.id}')">
                Add to Cart
            </button>

        </div>
    `).join("");
}

// ---------- ADD PRODUCT ----------
function saveAdminProduct() {

    const name = document.getElementById("adminProdName")?.value.trim();
    const price = Number(document.getElementById("adminProdPrice")?.value);
    const mrp = Number(document.getElementById("adminProdMrp")?.value);
    const resellPrice = Number(document.getElementById("adminProdResell")?.value || 0);
    const category = document.getElementById("adminProdCat")?.value;
    const stock = Number(document.getElementById("adminProdStock")?.value || 0);
    const description = document.getElementById("adminProdDesc")?.value.trim();

    const imageInput = document.getElementById("adminProdFileInput");
    const existingImage = document.getElementById("adminProdImgBase64")?.value || "";

    if (!name || !price || !mrp) {
        alert("⚠️ Product Name, Selling Price और MRP भरना जरूरी है.");
        return;
    }

    const products = getProducts();

    const editIndex = Number(
        document.getElementById("editProductIndex")?.value || -1
    );

    const product = {
        id: editIndex >= 0
            ? products[editIndex].id
            : "P" + Date.now(),

        name,
        category,
        price,
        mrp,
        resellPrice,
        stock,
        description,
        image: existingImage,
        meeshoLink: "",
        sizes: "",
        colors: ""
    };

    const finishSave = () => {

        if (editIndex >= 0) {
            products[editIndex] = product;
        } else {
            products.push(product);
        }

        saveProducts(products);

        alert(
            editIndex >= 0
            ? "✅ Product updated!"
            : "✅ Product added!"
        );

        clearProductForm();
        renderAdminProducts();
        renderProducts();
        updateAdminDashboard();
    };

    if (
        imageInput &&
        imageInput.files &&
        imageInput.files[0]
    ) {

        const reader = new FileReader();

        reader.onload = function(event) {
            product.image = event.target.result;

            const hidden = document.getElementById("adminProdImgBase64");
            if (hidden) hidden.value = product.image;

            finishSave();
        };

        reader.readAsDataURL(imageInput.files[0]);

    } else {
        finishSave();
    }
}

// ---------- IMAGE PREVIEW ----------
function handleImageFileSelect(event) {

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        const preview = document.getElementById("imagePreview");
        const container = document.getElementById("imagePreviewContainer");
        const hidden = document.getElementById("adminProdImgBase64");

        if (preview) preview.src = e.target.result;
        if (container) container.style.display = "block";
        if (hidden) hidden.value = e.target.result;
    };

    reader.readAsDataURL(file);
}

// ---------- ADMIN PRODUCT LIST ----------
function renderAdminProducts() {

    const tbody = document.getElementById("adminProductsTableBody");
    if (!tbody) return;

    const products = getProducts();

    tbody.innerHTML = products.map((p, index) => `
        <tr style="border-bottom:1px solid var(--border-color);">

            <td style="padding:8px;">
                ${
                    p.image
                    ? `<img src="${p.image}"
                            style="width:50px;height:50px;object-fit:cover;border-radius:5px;">`
                    : "📦"
                }
            </td>

            <td style="padding:8px;">
                ${escapeHtml(p.name)}
            </td>

            <td style="padding:8px;">
                ₹${Number(p.price || 0)}
            </td>

            <td style="padding:8px;">
                ${Number(p.stock || 0)}
            </td>

            <td style="padding:8px;">
                <button onclick="editAdminProduct(${index})"
                    class="btn-secondary">
                    Edit
                </button>

                <button onclick="deleteAdminProduct(${index})"
                    class="btn-secondary">
                    Delete
                </button>
            </td>

        </tr>
    `).join("");
}

function editAdminProduct(index) {

    const products = getProducts();
    const p = products[index];

    if (!p) return;

    document.getElementById("editProductIndex").value = index;

    document.getElementById("adminProdName").value = p.name || "";
    document.getElementById("adminProdPrice").value = p.price || "";
    document.getElementById("adminProdMrp").value = p.mrp || "";
    document.getElementById("adminProdResell").value = p.resellPrice || "";
    document.getElementById("adminProdCat").value = p.category || "Fashion";
    document.getElementById("adminProdStock").value = p.stock || 0;
    document.getElementById("adminProdDesc").value = p.description || "";

    document.getElementById("adminProdImgBase64").value = p.image || "";

    const preview = document.getElementById("imagePreview");
    const container = document.getElementById("imagePreviewContainer");

    if (p.image && preview && container) {
        preview.src = p.image;
        container.style.display = "block";
    }

    const title = document.getElementById("adminFormTitle");
    const saveBtn = document.getElementById("adminSaveBtn");

    if (title) title.innerText = "✏️ Edit Product";
    if (saveBtn) saveBtn.innerText = "Update Product";
}

function deleteAdminProduct(index) {

    if (!confirm("Delete this product?")) return;

    const products = getProducts();

    products.splice(index, 1);

    saveProducts(products);

    renderAdminProducts();
    renderProducts();
    updateAdminDashboard();
}

function clearProductForm() {

    const ids = [
        "adminProdName",
        "adminProdPrice",
        "adminProdMrp",
        "adminProdResell",
        "adminProdDesc",
        "adminProdImgBase64"
    ];

    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });

    const stock = document.getElementById("adminProdStock");
    if (stock) stock.value = 10;

    const edit = document.getElementById("editProductIndex");
    if (edit) edit.value = -1;

    const previewContainer =
        document.getElementById("imagePreviewContainer");

    if (previewContainer)
        previewContainer.style.display = "none";

    const fileInput =
        document.getElementById("adminProdFileInput");

    if (fileInput)
        fileInput.value = "";

    const title = document.getElementById("adminFormTitle");
    const saveBtn = document.getElementById("adminSaveBtn");

    if (title) title.innerText = "➕ Add New Product";
    if (saveBtn) saveBtn.innerText = "Save Product";
}

// ---------- CART ----------
function addToCart(productId) {

    const products = getProducts();
    const product = products.find(p => p.id === productId);

    if (!product) return;

    if (Number(product.stock || 0) <= 0) {
        alert("❌ Product is out of stock.");
        return;
    }

    const cart = getCart();

    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1
        });
    }

    saveCart(cart);

    updateCartBadge();

    alert("✅ Added to cart!");
}

function updateCartBadge() {

    const count = getCart()
        .reduce((total, item) => total + Number(item.quantity || 0), 0);

    const badge = document.getElementById("cartCountBadge");

    if (badge) badge.innerText = count;
}

function renderCart() {

    const container =
        document.getElementById("cartItemsContainer");

    if (!container) return;

    const cart = getCart();
    const products = getProducts();

    if (!cart.length) {
        container.innerHTML = "<p>Cart is empty.</p>";
        updateCartTotals();
        return;
    }

    container.innerHTML = cart.map(item => {

        const product = products.find(p => p.id === item.id);

        if (!product) return "";

        return `
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                padding:8px 0;
                border-bottom:1px solid var(--border-color);
            ">

                <div>
                    <strong>${escapeHtml(product.name)}</strong>

                    <div style="font-size:12px;">
                        ₹${Number(product.price || 0)}
                        × ${Number(item.quantity || 1)}
                    </div>
                </div>

                <button
                    onclick="removeFromCart('${product.id}')"
                    class="btn-secondary"
                    style="width:auto;">
                    Remove
                </button>

            </div>
        `;
    }).join("");

    updateCartTotals();
}

function removeFromCart(productId) {

    const cart = getCart()
        .filter(item => item.id !== productId);

    saveCart(cart);

    renderCart();
    updateCartBadge();
}

function updateCartTotals() {

    const cart = getCart();
    const products = getProducts();

    const subtotal = cart.reduce((total, item) => {

        const product =
            products.find(p => p.id === item.id);

        return total +
            (Number(product?.price || 0) *
             Number(item.quantity || 0));

    }, 0);

    const delivery = subtotal >= 499 || subtotal === 0 ? 0 : 50;

    const subtotalEl = document.getElementById("cartSubtotal");
    const deliveryEl = document.getElementById("cartDeliveryCalc");
    const totalEl = document.getElementById("cartTotalPrice");

    if (subtotalEl) subtotalEl.innerText = subtotal;
    if (deliveryEl) deliveryEl.innerText = delivery;
    if (totalEl) totalEl.innerText = subtotal + delivery;
}

// ---------- CART MODAL ----------
function openCartModal() {

    const modal = document.getElementById("cartModal");

    if (!modal) return;

    modal.style.display = "flex";

    renderCart();
}

function closeCartModal() {

    const modal = document.getElementById("cartModal");

    if (modal) modal.style.display = "none";
}

// ---------- CUSTOMER LOGIN ----------
function openLoginModal() {

    const modal = document.getElementById("loginModal");

    if (!modal) {
        alert("Login system is being prepared.");
        return;
    }

    modal.style.display = "flex";
}

function closeLoginModal() {

    const modal = document.getElementById("loginModal");

    if (modal) modal.style.display = "none";
}

// ---------- BASIC DEMO OTP FLOW ----------
// IMPORTANT: This is NOT real SMS OTP.
// Real OTP requires an authentication/SMS backend.

let demoOTP = null;

function sendCustomerOTP() {

    const input =
        document.getElementById("otpMobileInput");

    if (!input) return;

    const phone = input.value.trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
        alert("📱 Enter a valid 10-digit Indian mobile number.");
        return;
    }

    demoOTP =
        Math.floor(100000 + Math.random() * 900000).toString();

    const display =
        document.getElementById("otpMobileDisplay");

    if (display)
        display.innerText = "+91 " + phone;

    const loginStep =
        document.getElementById("otpLoginStep");

    const verifyStep =
        document.getElementById("otpVerifyStep");

    if (loginStep) loginStep.style.display = "none";
    if (verifyStep) verifyStep.style.display = "block";

    /*
      DEMO ONLY:
      Shows OTP on screen.
      Do NOT use this as production authentication.
    */

    alert("Demo OTP: " + demoOTP);
}

function verifyCustomerOTP() {

    const input =
        document.getElementById("customerOTPInput");

    const mobile =
        document.getElementById("otpMobileInput");

    if (!input || !mobile) return;

    if (input.value.trim() !== demoOTP) {
        alert("❌ Incorrect OTP.");
        return;
    }

    const phone = mobile.value.trim();

    const customer = {
        id: "C" + Date.now(),
        name: "Sale 11 Customer",
        phone: phone
    };

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(customer)
    );

    let customers = getCustomers();

    const exists =
        customers.some(c => c.phone === phone);

    if (!exists) {
        customers.push(customer);
        saveCustomers(customers);
    }

    alert("✅ Login successful!");

    closeLoginModal();

    demoOTP = null;

    updateAdminDashboard();
}

// ---------- ACCOUNT ----------
function handleLogout() {

    localStorage.removeItem(USER_KEY);

    alert("You have been logged out.");

    closeLoginModal();
}

function getCurrentUser() {

    try {
        return JSON.parse(
            localStorage.getItem(USER_KEY)
        );
    } catch {
        return null;
    }
}

// ---------- ORDERS ----------
function placeOrder() {

    const user = getCurrentUser();

    if (!user) {
        alert("📱 Please login first.");
        openLoginModal();
        return;
    }

    const cart = getCart();

    if (!cart.length) {
        alert("🛒 Your cart is empty.");
        return;
    }

    const name =
        document.getElementById("checkoutName")?.value.trim();

    const phone =
        document.getElementById("checkoutPhone")?.value.trim();

    const address =
     
