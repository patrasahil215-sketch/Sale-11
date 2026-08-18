
     
/* =========================================================
   SALE 11 - COMPLETE STORE + ADMIN SYSTEM
   ========================================================= */

// ================= STORAGE KEYS =================

const PRODUCTS_KEY = "sale11_products";
const ORDERS_KEY = "sale11_orders";
const CUSTOMERS_KEY = "sale11_customers";
const SETTINGS_KEY = "sale11_settings";
const CART_KEY = "sale11_cart";
const WISHLIST_KEY = "sale11_wishlist";
const USER_KEY = "sale11_current_user";

// ================= DEFAULT SETTINGS =================

const defaultSettings = {
    deliveryCharge: 50,
    freeDeliveryLimit: 499,
    cod: "Enabled"
};

// ================= DEFAULT PRODUCTS =================

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

// ================= SAFE HTML =================

function escapeHtml(text) {
    if (text === null || text === undefined) return "";

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ================= PRODUCTS =================

function getProducts() {
    try {
        const data = localStorage.getItem(PRODUCTS_KEY);

        if (!data) {
            localStorage.setItem(
                PRODUCTS_KEY,
                JSON.stringify(defaultProducts)
            );

            return [...defaultProducts];
        }

        return JSON.parse(data) || [];
    } catch {
        return [];
    }
}

function saveProducts(products) {
    localStorage.setItem(
        PRODUCTS_KEY,
        JSON.stringify(products)
    );
}

// ================= ORDERS =================

function getOrders() {
    try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveOrders(orders) {
    localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(orders)
    );
}

// ================= CUSTOMERS =================

function getCustomers() {
    try {
        return JSON.parse(localStorage.getItem(CUSTOMERS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCustomers(customers) {
    localStorage.setItem(
        CUSTOMERS_KEY,
        JSON.stringify(customers)
    );
}

// ================= CART =================

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}

// ================= WISHLIST =================

function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch {
        return [];
    }
}

function saveWishlist(list) {
    localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(list)
    );
}

// ================= SETTINGS =================

function getSettings() {
    try {
        return {
            ...defaultSettings,
            ...(JSON.parse(
                localStorage.getItem(SETTINGS_KEY)
            ) || {})
        };
    } catch {
        return { ...defaultSettings };
    }
}

function saveSettings(settings) {
    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );
}

// ================= PAGE SWITCH =================

function switchTab(tab) {

    const store =
        document.getElementById("customerStoreView");

    const admin =
        document.getElementById("adminDashboardView");

    if (tab === "admin") {

        if (store) store.style.display = "none";
        if (admin) admin.style.display = "block";

    } else {

        if (store) store.style.display = "block";
        if (admin) admin.style.display = "none";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ================= ADMIN LOGIN =================

function checkAdminAccess() {

    const loggedIn =
        sessionStorage.getItem("sale11_admin_auth");

    if (loggedIn === "true") {
        openAdminDashboard();
        return;
    }

    const password =
        prompt("🔐 Enter Admin Password:");

    if (password === null) return;

    /*
      IMPORTANT:
      This is only a client-side demo password.
      Change the password below.
    */

    if (password === "CHANGE_THIS_ADMIN_PASSWORD") {

        sessionStorage.setItem(
            "sale11_admin_auth",
            "true"
        );

        openAdminDashboard();

        alert("✅ Welcome to Sale 11 Admin!");

    } else {

        alert("❌ Incorrect Password!");
    }
}

function logoutAdmin() {

    sessionStorage.removeItem(
        "sale11_admin_auth"
    );

    switchTab("store");
}

// ================= ADMIN DASHBOARD =================

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

        const el =
            document.getElementById(tabs[key]);

        if (el) {
            el.style.display =
                key === tab ? "block" : "none";
        }
    });

    const buttons = {
        dashboard: "tabBtnDash",
        products: "tabBtnProds",
        orders: "tabBtnOrders",
        customers: "tabBtnCust",
        settings: "tabBtnSett"
    };

    Object.keys(buttons).forEach(key => {

        const btn =
            document.getElementById(buttons[key]);

        if (btn) {
            btn.classList.toggle(
                "active",
                key === tab
            );
        }
    });

    if (tab === "dashboard")
        updateAdminDashboard();

    if (tab === "products")
        renderAdminProducts();

    if (tab === "orders")
        renderAdminOrders();

    if (tab === "customers")
        renderAdminCustomers();

    if (tab === "settings")
        loadAdminSettings();
}

// ================= ADMIN DASHBOARD STATS =================

function updateAdminDashboard() {

    const products = getProducts();
    const orders = getOrders();
    const customers = getCustomers();

    const revenue = orders.reduce(
        (sum, order) =>
            sum + Number(order.total || 0),
        0
    );

    const statRevenue =
        document.getElementById("statRevenue");

    const statOrders =
        document.getElementById("statOrders");

    const statProds =
        document.getElementById("statProds");

    const statCusts =
        document.getElementById("statCusts");

    if (statRevenue)
        statRevenue.innerText = revenue;

    if (statOrders)
        statOrders.innerText = orders.length;

    if (statProds)
        statProds.innerText = products.length;

    if (statCusts)
        statCusts.innerText = customers.length;

    const oldRevenue =
        document.getElementById("adminTotalRevenue");

    const oldOrders =
        document.getElementById("adminTotalOrders");

    const oldProducts =
        document.getElementById("adminTotalProds");

    if (oldRevenue)
        oldRevenue.innerText = "₹" + revenue;

    if (oldOrders)
        oldOrders.innerText = orders.length;

    if (oldProducts)
        oldProducts.innerText = products.length;
}

// ================= PRODUCTS DISPLAY =================

let currentCategory = "All";

function renderProducts() {

    const grid =
        document.getElementById("productsGrid");

    if (!grid) return;

    const products = getProducts();

    let filtered = products;

    if (
        currentCategory !== "All"
    ) {
        filtered = products.filter(
            product =>
                product.category === currentCategory
        );
    }

    const searchInput =
        document.getElementById("searchInput");

    const search =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

    if (search) {

        filtered = filtered.filter(product =>
            String(product.name)
                .toLowerCase()
                .includes(search)
        );
    }

    if (!filtered.length) {

        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:30px;">
                <h3>😔 No products found</h3>
                <p>Try another category or search.</p>
            </div>
        `;

        return;
    }

    const wishlist = getWishlist();

    grid.innerHTML = filtered.map(product => {

        const liked =
            wishlist.includes(product.id);

        return `
        <div class="product-card">

            <button
                class="wishlist-btn ${liked ? "active" : ""}"
                onclick="toggleWishlist('${product.id}')">
                ${liked ? "❤️" : "♡"}
            </button>

            ${
                product.image
                ?
                `<img
                    src="${product.image}"
                    alt="${escapeHtml(product.name)}"
                    onclick="openProductDetail('${product.id}')">`
                :
                `
                <div
                    onclick="openProductDetail('${product.id}')"
                    style="
                        height:180px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#eee;
                        border-radius:6px;
                        font-size:45px;
                        cursor:pointer;">
                    📦
                </div>
                `
            }

            <div>

                <span class="resell-badge">
                    Reselling Product
                </span>

                <h3
                    onclick="openProductDetail('${product.id}')">
                    ${escapeHtml(product.name)}
                </h3>

                <div class="price">
                    ₹${Number(product.price || 0)}
                    <span class="mrp">
                        ₹${Number(product.mrp || 0)}
                    </span>
                </div>

                <p style="font-size:11px;color:#777;">
                    ${escapeHtml(product.category || "")}
                </p>

                <p style="font-size:11px;color:#555;">
                    Stock: ${Number(product.stock || 0)}
                </p>

            </div>

            <button
                class="btn-primary"
                onclick="addToCart('${product.id}')"
                ${Number(product.stock || 0) <= 0 ? "disabled" : ""}>
                ${
                    Number(product.stock || 0) <= 0
                    ? "Out of Stock"
                    : "Add to Cart"
                }
            </button>

        </div>
        `;
    }).join("");
}

// ================= CATEGORY FILTER =================

function filterCategory(category) {

    currentCategory = category;

    document
        .querySelectorAll(".cat-btn")
        .forEach(btn => {

            btn.classList.remove("active");

            if (
                btn.innerText.trim()
                    .toLowerCase()
                    .includes(
                        category
                            .replace("All", "All")
                            .toLowerCase()
                    )
            ) {
                btn.classList.add("active");
            }
        });

    renderProducts();
}

// ================= SEARCH =================

function filterProductsSearch() {
    renderProducts();
}

function showSearchSuggestions() {
    renderProducts();
}

// ================= PRODUCT DETAIL =================

function openProductDetail(productId) {

    const product =
        getProducts().find(
            p => p.id === productId
        );

    if (!product) return;

    const modal =
        document.getElementById(
            "productDetailModal"
        );

    const container =
        document.getElementById(
            "productDetailContainer"
        );

    if (!modal || !container) return;

    container.innerHTML = `

        ${
            product.image
            ?
            `<img
                src="${product.image}"
                style="
                    width:100%;
                    max-height:300px;
                    object-fit:contain;
                    border-radius:8px;">`
            :
            `<div style="
                height:220px;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:70px;
                background:#eee;
                border-radius:8px;">
                📦
            </div>`
        }

        <h2 style="margin-top:15px;">
            ${escapeHtml(product.name)}
        </h2>

        <p style="color:#777;margin:8px 0;">
            ${escapeHtml(product.category || "")}
        </p>

        <h2 style="color:var(--primary-color);">
            ₹${Number(product.price || 0)}
            <del style="
                color:#888;
                font-size:14px;">
                ₹${Number(product.mrp || 0)}
            </del>
        </h2>

        ${
            product.resellPrice
            ?
            `<p style="margin-top:8px;">
                💰 Reselling Price:
                <strong>₹${Number(product.resellPrice)}</strong>
            </p>`
            : ""
        }

        <p style="
            font-size:13px;
            margin:12px 0;
            line-height:1.5;">
            ${escapeHtml(
                product.description ||
                "No description available."
            )}
        </p>

        <p style="font-size:13px;">
            📦 Stock:
            <strong>${Number(product.stock || 0)}</strong>
        </p>

        ${
            product.sizes
            ?
            `<p style="font-size:13px;">
                Size: ${escapeHtml(product.sizes)}
            </p>`
            : ""
        }

        ${
            product.colors
            ?
            `<p style="font-size:13px;">
                Colors: ${escapeHtml(product.colors)}
            </p>`
            : ""
        }

        <button
            class="btn-primary"
            style="margin-top:15px;"
            onclick="addToCart('${product.id}');closeProductDetailModal();">
            🛒 Add to Cart
        </button>
    `;

    modal.style.display = "flex";
}

function closeProductDetailModal() {

    const modal =
        document.getElementById(
            "productDetailModal"
        );

    if (modal)
        modal.style.display = "none";
}

// ================= ADMIN PRODUCT SAVE =================

function saveAdminProduct() {

    const name =
        document.getElementById("adminProdName")
        ?.value.trim();

    const price =
        Number(
            document.getElementById("adminProdPrice")
            ?.value
        );

    const mrp =
        Number(
            document.getElementById("adminProdMrp")
            ?.value
        );

    const resellPrice =
        Number(
            document.getElementById("adminProdResell")
            ?.value || 0
        );

    const category =
        document.getElementById("adminProdCat")
        ?.value || "Fashion";

    const stock =
        Number(
            document.getElementById("adminProdStock")
            ?.value || 0
        );

    const description =
        document.getElementById("adminProdDesc")
        ?.value.trim() || "";

    const imageInput =
        document.getElementById(
            "adminProdFileInput"
        );

    const existingImage =
        document.getElementById(
            "adminProdImgBase64"
        )?.value || "";

    if (!name || price <= 0 || mrp <= 0) {

        alert(
            "⚠️ Product Name, Selling Price और MRP भरना जरूरी है."
        );

        return;
    }

    const products = getProducts();

    const editIndex =
        Number(
            document.getElementById(
                "editProductIndex"
            )?.value || -1
        );

    const product = {

        id:
            editIndex >= 0
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

            products[editIndex] =
                product;

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

        const reader =
            new FileReader();

        reader.onload = function(event) {

            product.image =
                event.target.result;

            const hidden =
                document.getElementById(
                    "adminProdImgBase64"
                );

            if (hidden)
                hidden.value =
                    product.image;

            finishSave();
        };

        reader.readAsDataURL(
            imageInput.files[0]
        );

    } else {

        finishSave();
    }
}

// ================= IMAGE PREVIEW =================

function handleImageFileSelect(event) {

    const file =
        event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

        alert("Please select an image.");

        event.target.value = "";

        return;
    }

    const reader =
        new FileReader();

    reader.onload = function(e) {

        const preview =
            document.getElementById(
                "imagePreview"
            );

        const container =
            document.getElementById(
                "imagePreviewContainer"
            );

        const hidden =
            document.getElementById(
                "adminProdImgBase64"
            );

        if (preview)
            preview.src =
                e.target.result;

        if (container)
            container.style.display =
                "block";

        if (hidden)
            hidden.value =
                e.target.result;
    };

    reader.readAsDataURL(file);
}

// ================= ADMIN PRODUCT LIST =================

function renderAdminProducts() {

    const tbody =
        document.getElementById(
            "adminProductsTableBody"
        );

    if (!tbody) return;

    const products =
        getProducts();

    if (!products.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="padding:15px;text-align:center;">
                    No products.
                </td>
            </tr>
        `;

        return;
    }

    tbody.innerHTML =
        products.map((p, index) => `

        <tr style="
            border-bottom:1px solid var(--border-color);">

            <td style="padding:8px;">

                ${
                    p.image
                    ?
                    `<img
                        src="${p.image}"
                        style="
                            width:50px;
                            height:50px;
                            object-fit:cover;
                            border-radius:5px;">`
                    :
                    "📦"
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

                <button
                    onclick="editAdminProduct(${index})"
                    class="btn-secondary">
                    Edit
                </button>

                <button
                    onclick="deleteAdminProduct(${index})"
                    class="btn-secondary">
                    Delete
                </button>

            </td>

        </tr>

    `).join("");
}

// ================= EDIT PRODUCT =================

function editAdminProduct(index) {

    const products =
        getProducts();

    const p =
        products[index];

    if (!p) return;

    const setValue =
        (id, value) => {

            const el =
                document.getElementById(id);

            if (el)
                el.value =
                    value ?? "";
        };

    setValue(
        "editProductIndex",
        index
    );

    setValue(
        "adminProdName",
        p.name
    );

    setValue(
        "adminProdPrice",
        p.price
    );

    setValue(
        "adminProdMrp",
        p.mrp
    );

    setValue(
        "adminProdResell",
        p.resellPrice
    );

    setValue(
        "adminProdCat",
        p.category
    );

    setValue(
        "adminProdStock",
        p.stock
    );

    setValue(
        "adminProdDesc",
        p.description
    );

    setValue(
        "adminProdImgBase64",
        p.image
    );

    const preview =
        document.getElementById(
            "imagePreview"
        );

    const container =
        document.getElementById(
            "imagePreviewContainer"
        );

    if (
        p.image &&
        preview &&
        container
    ) {

        preview.src =
            p.image;

        container.style.display =
            "block";
    }

    const title =
        document.getElementById(
            "adminFormTitle"
        );

    const saveBtn =
        document.getElementById(
            "adminSaveBtn"
        );

    if (title)
        title.innerText =
            "✏️ Edit Product";

    if (saveBtn)
        saveBtn.innerText =
            "Update Product";

    switchAdminTab("products");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ================= DELETE PRODUCT =================

function deleteAdminProduct(index) {

    const products =
        getProducts();

    if (!products[index]) return;

    if (
        !confirm(
            `Delete "${products[index].name}"?`
        )
    ) return;

    const deletedId =
        products[index].id;

    products.splice(index, 1);

    saveProducts(products);

    const cart =
        getCart().filter(
            item =>
                item.id !== deletedId
        );

    saveCart(cart);

    const wishlist =
        getWishlist().filter(
            id =>
                id !== deletedId
        );

    saveWishlist(wishlist);

    renderAdminProducts();

    renderProducts();

    updateCartBadge();

    updateAdminDashboard();

    alert("✅ Product deleted.");
}

// ================= CLEAR PRODUCT FORM =================

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

        const el =
            document.getElementById(id);

        if (el)
            el.value = "";
    });

    const stock =
        document.getElementById(
            "adminProdStock"
        );

    if (stock)
        stock.value = 10;

    const edit =
        document.getElementById(
            "editProductIndex"
        );

    if (edit)
        edit.value = -1;

    const preview =
        document.getElementById(
            "imagePreview"
        );

    if (preview)
        preview.src = "";

    const previewContainer =
        document.getElementById(
            "imagePreviewContainer"
        );

    if (previewContainer)
        previewContainer.style.display =
            "none";

    const fileInput =
        document.getElementById(
            "adminProdFileInput"
        );

    if (fileInput)
        fileInput.value = "";

    const title =
        document.getElementById(
            "adminFormTitle"
        );

    const saveBtn =
        document.getElementById(
            "adminSaveBtn"
        );

    if (title)
        title.innerText =
            "➕ Add New Product";

    if (saveBtn)
        saveBtn.innerText =
            "Save Product";
}

// ================= CART =================

function addToCart(productId) {

    const product =
        getProducts().find(
            p => p.id === productId
        );

    if (!product) return;

    if (
        Number(product.stock || 0) <= 0
    ) {

        alert(
            "❌ Product is out of stock."
        );

        return;
    }

    const cart =
        getCart();

    const existing =
        cart.find(
            item =>
                item.id === productId
        );

    if (existing) {

        if (
            Number(existing.quantity) >=
            Number(product.stock)
        ) {

            alert(
                "⚠️ Maximum available stock reached."
            );

            return;
        }

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

    const count =
        getCart().reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );

    const badge =
        document.getElementById(
            "cartCountBadge"
        );

    if (badge)
        badge.innerText =
            count;
}

function changeCartQuantity(
    productId,
    change
) {

    const cart =
        getCart();

    const products =
        getProducts();

    const item =
        cart.find(
            x => x.id === productId
        );

    const product =
        products.find(
            x => x.id === productId
        );

    if (!item || !product) return;

    item.quantity =
        Number(item.quantity) +
        Number(change);

    if (item.quantity <= 0) {

        const newCart =
            cart.filter(
                x =>
                    x.id !== productId
            );

        saveCart(newCart);

    } else {

        if (
            item.quantity >
            Number(product.stock)
        ) {

            item.quantity =
                Number(product.stock);

            alert(
                "⚠️ Maximum stock reached."
            );
        }

        saveCart(cart);
    }

    renderCart();

    updateCartBadge();
}

function renderCart() {

    const container =
        document.getElementById(
            "cartItemsContainer"
        );

    if (!container) return;

    const cart =
        getCart();

    const products =
        getProducts();

    if (!cart.length) {

        container.innerHTML =
            "<p>Cart is empty.</p>";

        updateCartTotals();

        return;
    }

    container.innerHTML =
        cart.map(item => {

            const product =
                products.find(
                    p =>
                        p.id === item.id
                );

            if (!product)
                return "";

            return `
                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:10px;
                    padding:10px 0;
                    border-bottom:1px solid var(--border-color);">

                    <div style="flex:1;">

                        <strong>
                            ${escapeHtml(product.name)}
                        </strong>

                        <div style="
                            font-size:12px;
                            margin-top:4px;">
                            ₹${Number(product.price || 0)}
                        </div>

                        <div style="
                            display:flex;
                            align-items:center;
                            gap:7px;
                            margin-top:5px;">

                            <button
                                onclick="changeCartQuantity('${product.id}',-1)"
                                class="btn-secondary"
                                style="width:auto;margin:0;">
                                −
                            </button>

                            <strong>
                                ${Number(item.quantity || 1)}
                            </strong>

                            <button
                                onclick="changeCartQuantity('${product.id}',1)"
                                class="btn-secondary"
                                style="width:auto;margin:0;">
                                +
                            </button>

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

    const cart =
        getCart().filter(
            item =>
                item.id !== productId
        );

    saveCart(cart);

    renderCart();

    updateCartBadge();
}

function updateCartTotals() {

    const cart =
        getCart();

    const products =
        getProducts();

    const settings =
        getSettings();

    const subtotal =
        cart.reduce(
            (total, item) => {

                const product =
                    products.find(
                        p =>
                            p.id === item.id
                    );

                return total +
                    (
                        Number(
                            product?.price || 0
                        ) *
                        Number(
                            item.quantity || 0
                        )
                    );

            },
            0
        );

    const delivery =
        subtotal === 0
        ? 0
        : subtotal >=
            Number(
                settings.freeDeliveryLimit
            )
            ? 0
            : Number(
                settings.deliveryCharge
            );

    const subtotalEl =
        document.getElementById(
            "cartSubtotal"
        );

    const deliveryEl =
        document.getElementById(
            "cartDeliveryCalc"
        );

    const totalEl =
        document.getElementById(
            "cartTotalPrice"
        );

    if (subtotalEl)
        subtotalEl.innerText =
            subtotal;

    if (deliveryEl)
        deliveryEl.innerText =
            delivery;

    if (totalEl)
        totalEl.innerText =
            subtotal + delivery;
}

// ================= CART MODAL =================

function openCartModal() {

    const modal =
        document.getElementById(
            "cartModal"
        );

    if (!modal) return;

    modal.style.display =
        "flex";

    renderCart();
}

function closeCartModal() {

    const modal =
        document.getElementById(
            "cartModal"
        );

    if (modal)
        modal.style.display =
            "none";
}

// ================= WISHLIST =================

function toggleWishlist(productId) {

    let wishlist =
        getWishlist();

    if (
        wishlist.includes(productId)
    ) {

        wishlist =
            wishlist.filter(
                id =>
                    id !== productId
            );

        alert("Removed from wishlist.");

    } else {

        wishlist.push(productId);

        alert("❤️ Added to wishlist!");
    }

    saveWishlist(wishlist);

    renderProducts();

    renderWishlist();
}

function openWishlistModal() {

    const modal =
        document.getElementById(
            "wishlistModal"
        );

    if (!modal) return;

    modal.style.display =
        "flex";

    renderWishlist();
}

function closeWishlistModal() {

    const modal =
        document.getElementById(
            "wishlistModal"
        );

    if (modal)
        modal.style.display =
            "none";
}

function renderWishlist() {

    const container =
        document.getElementById(
            "wishlistItemsContainer"
        );

    if (!container) return;

    const wishlist =
        getWishlist();

    const products =
        getProducts();

    const items =
        wishlist
            .map(
                id =>
                    products.find(
                        p => p.id === id
                    )
            )
            .filter(Boolean);

    if (!items.length) {

        container.innerHTML =
            "<p>Your wishlist is empty.</p>";

        return;
    }

    container.innerHTML =
        items.map(product => `

        <div style="
            padding:10px 0;
            border-bottom:1px solid var(--border-color);">

            <strong>
                ${escapeHtml(product.name)}
            </strong>

            <p style="
                color:var(--primary-color);
                margin:5px 0;">
                ₹${Number(product.price || 0)}
            </p>

            <button
                class="btn-primary"
                onclick="addToCart('${product.id}')">
                Add to Cart
            </button>

            <button
                class="btn-secondary"
                onclick="toggleWishlist('${product.id}')">
                Remove ❤️
            </button>

        </div>

    `).join("");
}

// ================= LOGIN =================

function openLoginModal() {

    const modal =
        document.getElementById(
            "loginModal"
        );

    if (!modal) {

        alert(
            "Login section is not available in this HTML."
        );

        return;
    }

    modal.style.display =
        "flex";

    updateAccountUI();
}

function closeLoginModal() {

    const modal =
        document.getElementById(
            "loginModal"
        );

    if (modal)
        modal.style.display =
            "none";
}

function handleLogin() {

    const name =
        document.getElementById(
            "userNameInput"
        )?.value.trim();

    const phone =
        document.getElementById(
            "userPhoneInput"
        )?.value.trim();

    if (!name) {

        alert(
            "Please enter your name."
        );

        return;
    }

    if (
        !/^[6-9]\d{9}$/.test(phone)
    ) {

        alert(
            "📱 Enter a valid 10-digit mobile number."
        );

        return;
    }

    const customer = {
        id: "C" + Date.now(),
        name,
        phone
    };

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(customer)
    );

    let customers =
        getCustomers();

    const index =
        customers.findIndex(
            c =>
                c.phone === phone
        );

    if (index >= 0) {

        customers[index] =
            customer;

    } else {

        customers.push(customer);
    }

    saveCustomers(customers);

    alert(
        "✅ Login successful!"
    );

    updateAccountUI();

    updateAdminDashboard();
}

function updateAccountUI() {

    const userData =
        localStorage.getItem(
            USER_KEY
        );

    const auth =
        document.getElementById(
            "authContainer"
        );

    const profile =
        document.getElementById(
            "profileContainer"
        );

    if (!userData) {

        if (auth)
            auth.style.display =
                "block";

        if (profile)
            profile.style.display =
                "none";

        return;
    }

    try {

        const user =
            JSON.parse(userData);

        if (auth)
            auth.style.display =
                "none";

        if (profile)
            profile.style.display =
                "block";

        const name =
            document.getElementById(
                "displayUserName"
            );

        const phone =
            document.getElementById(
                "displayUserPhone"
            );

        if (name)
            name.innerText =
                "Name: " + user.name;

        if (phone)
            phone.innerText =
                "Mobile: " + user.phone;

    } catch {

        localStorage.removeItem(
            USER_KEY
        );
    }
}

function handleLogout() {

    localStorage.removeItem(
        USER_KEY
    );

    updateAccountUI();

    alert(
        "✅ You have been logged out."
    );
}

// ================= ORDERS MODAL =================

function openOrdersModal() {

    const modal =
        document.getElementById(
            "ordersModal"
        );

    if (!modal) {

        alert(
            "Orders section is not available in this HTML."
        );

        return;
    }

    modal.style.display =
        "flex";

    renderOrders();
}

function closeOrdersModal() {

    const modal =
        document.getElementById(
            "ordersModal"
        );

    if (modal)
        modal.style.display =
            "none";
}

function renderOrders() {

    const container =
        document.getElementById(
            "ordersContainer"
        );

    if (!container) return;

    const userData =
        localStorage.getItem(
            USER_KEY
        );

    if (!userData) {

        container.innerHTML =
            "<p>Please login to view orders.</p>";

        return;
    }

    let user;

    try {
        user =
            JSON.parse(userData);
    } catch {
        return;
    }

    const orders =
        getOrders().filter(
            order =>
                order.phone ===
                user.phone
        );

    if (!orders.length) {

        container.innerHTML =
            "<p>No orders placed yet.</p>";

        return;
    }

    container.innerHTML =
        orders.map(order => `

        <div style="
            border:1px solid var(--border-color);
            border-radius:8px;
            padding:10px;
            margin-bottom:10px;">

            <strong>
                Order #${escapeHtml(order.id)}
            </strong>

            <p style="font-size:12px;margin-top:5px;">
                Date: ${escapeHtml(order.date)}
            </p>

            <p style="font-size:12px;">
                Status:
                <strong>
                    ${escapeHtml(order.status || "Placed")}
                </strong>
            </p>

            <p>
                Total:
                <strong>
                    ₹${Number(order.total || 0)}
                </strong>
            </p>

            <button
                class="btn-secondary"
                onclick="openInvoice('${order.id}')">
                View Invoice
            </button>

        </div>

    `).join("");
}

// ================= CHECKOUT =================

function openCheckoutModal() {

    const cart =
        getCart();

    if (!cart.length) {

        alert(
            "🛒 Your cart is empty."
        );

        return;
    }

    const modal =
        document.getElementById(
            "checkoutModal"
        );

    if (!modal) return;

    const settings =
        getSettings();

    if (
        settings.cod !==
        "Enabled"
    ) {

        alert(
            "Cash on Delivery is currently disabled."
        );

        return;
    }

    modal.style.display =
        "flex";

    const userData =
        localStorage.getItem(
            USER_KEY
        );

    if (userData) {

        try {

            const user =
                JSON.parse(
                    userData
                );

            const name =
                document.getElementById(
                    "checkoutName"
                );

            const phone =
                document.getElementById(
                    "checkoutPhone"
                );

            if (name)
                name.value =
                    user.name || "";

            if (phone)
                phone.value =
                    user.phone || "";

        } catch {}
    }
}

function closeCheckoutModal() {

    const modal =
        document.getElementById(
            "checkoutModal"
        );

    if (modal)
        modal.style.display =
            "none";
}

// ================= PLACE ORDER =================

function placeOrder() {

    const cart =
        getCart();

    if (!cart.length) {

        alert(
            "🛒 Your cart is empty."
        );

        return;
    }

    const name =
        document.getElementById(
            "checkoutName"
        )?.value.trim();

    const phone =
        document.getElementById(
            "checkoutPhone"
        )?.value.trim();

    const address =
        document.getElementById(
            "checkoutAddress"
        )?.value.trim();

    const city =
        document.getElementById(
            "checkoutCity"
        )?.value.trim();

    const pincode =
        document.getElementById(
            "checkoutPincode"
        )?.value.trim();

    if (
        !name ||
        !phone ||
        !address ||
        !city ||
        !pincode
    ) {

        alert(
            "⚠️ Please fill all delivery details."
        );

        return;
    }

    if (
        !/^[6-9]\d{9}$/.test(phone)
    ) {

        alert(
            "📱 Enter a valid mobile number."
        );

        return;
    }

    if (
        !/^\d{6}$/.test(pincode)
    ) {

        alert(
            "📍 Enter a valid 6-digit pincode."
        );

        return;
    }

    const products =
        getProducts();

    let subtotal = 0;

    const orderItems = [];

    for (const item of cart) {

        const product =
            products.find(
                p =>
                    p.id === item.id
            );

        if (!product) continue;

        const quantity =
            Number(
                item.quantity || 1
            );

        if (
            quantity >
            Number(product.stock || 0)
        ) {

            alert(
                `❌ Not enough stock for ${product.name}`
            );

            return;
        }

        subtotal +=
            Number(product.price || 0) *
            quantity;

        orderItems.push({
            id: product.id,
            name: product.name,
            price: Number(product.price || 0),
            quantity
        });
    }

    const settings =
        getSettings();

    const delivery =
        subtotal >=
        Number(
            settings.freeDeliveryLimit
        )
        ? 0
        : Number(
            settings.deliveryCharge
        );

    const total =
        subtotal + delivery;

    const order = {

        id:
            "S11" +
            Date.now(),

        date:
            new Date().toLocaleString(
                "en-IN"
            ),

        customer:
            name,

        phone,

        address:
            `${address}, ${city} - ${pincode}`,

        payment:
            "Cash on Delivery",

        items:
            orderItems,

        subtotal,

        delivery,

        total,

        status:
            "Order Placed"
    };

    const orders =
        getOrders();

    orders.unshift(order);

    saveOrders(orders);

    // Reduce stock

    orderItems.forEach(item => {

        const product =
            products.find(
                p =>
                    p.id === item.id
            );

        if (product) {

            product.stock =
                Math.max(
                    0,
                    Number(product.stock) -
                    Number(item.quantity)
                );
        }
    });

    saveProducts(products);

    // Save customer

    let customers =
        getCustomers();

    const existing =
        customers.findIndex(
            c =>
                c.phone === phone
        );

    const customer = {
        id:
            existing >= 0
            ? customers[existing].id
            : "C" + Date.now(),

        name,
        phone
    };

    if (existing >= 0)
        customers[existing] =
            customer;
    else
        customers.push(customer);

    saveCustomers(customers);

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(customer)
    );

    // Clear cart

    saveCart([]);

    updateCartBadge();

    renderProducts();

    updateAdminDashboard();

    closeCheckoutModal();

    closeCartModal();

    alert(
        "🎉 Order placed successfully!\n\nOrder ID: " +
        order.id
    );

    openInvoice(order.id);
}

// ================= INVOICE =================

function openInvoice(orderId) {

    const order =
        getOrders().find(
            o =>
                o.id === orderId
        );

    if (!order) return;

    const modal =
        document.getElementById(
            "invoiceModal"
        );

    if (!modal) return;

    const orderNo =
        document.getElementById(
            "invOrderNo"
        );

    const date =
        document.getElementById(
            "invDate"
        );

    const customer =
        document.getElementById(
            "invCustomer"
        );

    const address =
        document.getElementById(
            "invAddress"
        );

    const items =
        document.getElementById(
            "invItemsList"
        );

    const total =
        document.getElementById(
            "invTotal"
        );

    if (orderNo)
        orderNo.innerHTML =
            "<strong>Order ID:</strong> " +
            escapeHtml(order.id);

    if (date)
        date.innerHTML =
            "<strong>Date:</strong> " +
            escapeHtml(order.date);

    if (customer)
        customer.innerHTML =
            "<strong>Customer:</strong> " +
            escapeHtml(order.customer) +
            "<br>Mobile: " +
            escapeHtml(order.phone);

    if (address)
        address.innerHTML =
            "<strong>Address:</strong> " +
            escapeHtml(order.address) +
            "<br><strong>Payment:</strong> " +
            escapeHtml(order.payment);

    if (items) {

        items.innerHTML =
            order.items.map(item => `

                <div style="
                    display:flex;
                    justify-content:space-between;
                    padding:5px 0;">

                    <span>
                        ${escapeHtml(item.name)}
                        × ${item.quantity}
                    </span>

                    <strong>
                        ₹${item.price * item.quantity}
                    </strong>

                </div>

            `).join("");
    }

    if (total)
        total.innerText =
            "Total: ₹" +
            Number(order.total || 0);

    modal.style.display =
        "flex";
}

function closeInvoiceModal() {

    const modal =
        document.getElementById(
            "invoiceModal"
        );

    if (modal)
        modal.style.display =
            "none";
}

// ================= ADMIN ORDERS =================

function renderAdminOrders() {

    const container =
        document.getElementById(
            "adminOrdersContainer"
        );

    if (!container) return;

    const orders =
        getOrders();

    if (!orders.length) {

        container.innerHTML =
            "<p>No orders yet.</p>";

        return;
    }

    container.innerHTML =
        orders.map(order => `

        <div style="
            border:1px solid var(--border-color);
            border-radius:8px;
            padding:12px;
            margin-bottom:12px;">

            <h4>
                🛒 Order #${escapeHtml(order.id)}
            </h4>

            <p style="font-size:12px;">
                ${escapeHtml(order.date)}
            </p>

            <p>
                <strong>
                    ${escapeHtml(order.customer)}
                </strong>
                <br>
                ${escapeHtml(order.phone)}
            </p>

            <p style="font-size:12px;">
                ${escapeHtml(order.address)}
            </p>

            <p>
                Total:
                <strong>
                    ₹${Number(order.total || 0)}
                </strong>
            </p>

            <label style="font-size:12px;">
                Order Status
            </label>

            <select
                class="input-box"
                onchange="updateOrderStatus('${order.id}',this.value)">

                ${[
                    "Order Placed",
                    "Confirmed",
                    "Packed",
                    "Shipped",
                    "Out for Delivery",
                    "Delivered",
                    "Cancelled"
                ].map(status => `
                    <option
                        value="${status}"
                        ${
                            order.status === status
                            ? "selected"
                            : ""
                        }>
                        ${status}
                    </option>
                `).join("")}

            </select>

            <button
                class="btn-secondary"
                onclick="openInvoice('${order.id}')">
                View Invoice
            </button>

        </div>

    `).join("");
}

function updateOrderStatus(
    orderId,
    status
) {

    const orders =
        getOrders();

    const order =
        orders.find(
            o =>
                o.id === orderId
        );

    if (!order) return;

    order.status =
        status;

    saveOrders(orders);

    renderAdminOrders();

    renderOrders();
}

// ================= ADMIN CUSTOMERS =================

function renderAdminCustomers() {

    const container =
        document.getElementById(
            "adminCustomersContainer"
        );

    if (!container) return;

    const customers =
        getCustomers();

    if (!customers.length) {

        container.innerHTML =
            "<p>No customers yet.</p>";

        return;
    }

    container.innerHTML =
        customers.map(customer => `

        <div style="
            padding:10px;
            border:1px solid var(--border-color);
            border-radius:7px;
            margin-bottom:8px;">

            <strong>
                ${escapeHtml(customer.name)}
            </strong>

            <p style="font-size:12px;">
                📱 ${escapeHtml(customer.phone)}
            </p>

        </div>

    `).join("");
}

// ================= ADMIN SETTINGS =================

function loadAdminSettings() {

    const settings =
        getSettings();

    const delivery =
        document.getElementById(
            "stDeliveryCharge"
        );

    const limit =
        document.getElementById(
            "stFreeLimit"
        );

    const cod =
        document.getElementById(
            "stCodToggle"
        );

    if (delivery)
        delivery.value =
            settings.deliveryCharge;

    if (limit)
        limit.value =
            settings.freeDeliveryLimit;

    if (cod)
        cod.value =
            settings.cod;
}

function saveAdminSettings() {

    const delivery =
        Number(
            document.getElementById(
                "stDeliveryCharge"
            )?.value || 0
        );

    const freeLimit =
        Number(
            document.getElementById(
                "stFreeLimit"
            )?.value || 0
        );

    const cod =
        document.getElementById(
            "stCodToggle"
        )?.value || "Enabled";

    saveSettings({

        deliveryCharge:
            delivery,

        freeDeliveryLimit:
            freeLimit,

        cod
    });

    updateCartTotals();

    alert(
        "✅ Store settings saved!"
    );
}

// ================= SUPPORT =================

function openSupportModal() {

    const modal =
        document.getElementById(
            "supportModal"
        );

    if (!modal) {

        alert(
            "Support section is not available."
        );

        return;
    }

    modal.style.display =
        "flex";
}

function closeSupportModal() {

    const modal =
        document.getElementById(
            "supportModal"
        );

    if (modal)
        modal.style.display =
            "none";
}

function submitSupportQuery() {

    const input =
        document.getElementById(
            "supportQuery"
        );

    const query =
        input?.value.trim();

    if (!query) {

        alert(
            "Please write your issue."
        );

        return;
    }

    alert(
        "✅ Your query has been submitted."
    );

    if (input)
        input.value = "";
}

// ================= DARK MODE =================

function toggleDarkMode() {

    const body =
        document.getElementById(
            "pageBody"
        );

    if (!body) return;

    body.classList.toggle(
        "dark-mode"
    );

    const dark =
        body.classList.contains(
            "dark-mode"
        );

    localStorage.setItem(
        "sale11_dark_mode",
        dark
            ? "true"
            : "false"
    );

    const icon =
        document.getElementById(
            "darkModeIcon"
        );

    if (icon) {

        icon.className =
            dark
            ? "fas fa-sun"
            : "fas fa-moon";
    }
}

function loadDarkMode() {

    const dark =
        localStorage.getItem(
            "sale11_dark_mode"
        ) === "true";

    const body =
        document.getElementById(
            "pageBody"
        );

    if (!body) return;

    body.classList.toggle(
        "dark-mode",
        dark
    );

    const icon =
        document.getElementById(
            "darkModeIcon"
        );

    if (icon) {

        icon.className =
            dark
            ? "fas fa-sun"
            : "fas fa-moon";
    }
}

// ================= POLICY =================

function openPolicyModal(type) {

    const modal =
        document.getElementById(
            "policyModal"
        );

    const title =
        document.getElementById(
            "policyTitle"
        );

    const text =
        document.getElementById(
            "policyText"
        );

    if (!modal || !title || !text)
        return;

    if (type === "Terms") {

        title.innerText =
            "Terms & Conditions";

        text.innerHTML = `
            <p>
                By using Sale 11, you agree to use
                the website responsibly.
            </p>

            <p style="margin-top:10px;">
                Product prices, availability and
                delivery information may change.
            </p>

            <p style="margin-top:10px;">
                Orders may be cancelled when a product
                is unavailable.
            </p>
        `;

    } else {

        title.innerText =
            "Privacy Policy";

        text.innerHTML = `
            <p>
                Sale 11 may store information required
                for orders and customer accounts.
            </p>

            <p style="margin-top:10px;">
                Customer information should only be
                used for legitimate store operations.
            </p>
        `;
    }

    modal.style.display =
        "flex";
}

function closePolicyModal() {

    const modal =
        document.getElementById(
            "policyModal"
        );

    if (modal)
        modal.style.display =
            "none";
}

// ================= SAVED ADDRESS =================

function getAddresses() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "sale11_addresses"
            )
        ) || [];

    } catch {

        return [];
    }
}

function saveAddresses(list) {

    localStorage.setItem(
        "sale11_addresses",
        JSON.stringify(list)
    );
}

function openAddressModal() {

    const modal =
        document.getElementById(
            "addressModal"
        );

    if (!modal) return;

    modal.style.display =
        "flex";

    renderAddresses();
}

function closeAddressModal() {

    const modal =
        document.getElementById(
            "addressModal"
        );

    if (modal)
        modal.style.display =
            "none";
}

function renderAddresses() {

    const container =
        document.getElementById(
            "addressList"
        );

    if (!container) return;

    const addresses =
        getAddresses();

    if (!addresses.length) {

        container.innerHTML =
            "<p>No saved addresses.</p>";

        return;
    }

    container.innerHTML =
        addresses.map(
            (address, index) => `

        <div style="
            padding:8px;
            border:1px solid var(--border-color);
            border-radius:6px;
            margin-bottom:6px;">

            ${escapeHtml(address)}

            <button
                class="btn-secondary"
                onclick="deleteAddress(${index})">
                Delete
            </button>

        </div>

    `).join("");
}

function saveNewAddress() {

    const input =
        document.getElementById(
            "newAddressInput"
        );

    const address =
        input?.value.trim();

    if (!address) {

        alert(
            "Please enter an address."
        );

        return;
    }

    const addresses =
        getAddresses();

    addresses.push(address);

    saveAddresses(addresses);

    if (input)
        input.value = "";

    renderAddresses();

    alert(
        "✅ Address saved."
    );
}

function deleteAddress(index) {

    const addresses =
        getAddresses();

    addresses.splice(
        index,
        1
    );

    saveAddresses(addresses);

    renderAddresses();
}

// ================= COUNTDOWN =================

let countdownSeconds =
    5 * 60 * 60 +
    45 * 60 +
    30;

function startCountdown() {

    const timer =
        document.getElementById(
            "countdownTimer"
        );

    if (!timer) return;

    function update() {

        const hours =
            Math.floor(
                countdownSeconds / 3600
            );

        const minutes =
            Math.floor(
                (countdownSeconds % 3600) /
                60
            );

        const seconds =
            countdownSeconds % 60;

        timer.innerText =
            String(hours).padStart(2, "0") +
            "h : " +
            String(minutes).padStart(2, "0") +
            "m : " +
            String(seconds).padStart(2, "0") +
            "s";

        if (countdownSeconds > 0)
            countdownSeconds--;
    }

    update();

    setInterval(
        update,
        1000
    );
}

// ================= CLOSE MODALS BY BACKDROP =================

window.addEventListener(
    "click",
    function(event) {

        if (
            event.target.classList &&
            event.target.classList.contains("modal")
        ) {

            event.target.style.display =
                "none";
        }
    }
);

// ================= INITIALIZE =================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        getProducts();

        getSettings();

        renderProducts();

        updateCartBadge();

        loadDarkMode();

        updateAccountUI();

        startCountdown();

        updateAdminDashboard();

    }
);
