/* =========================================================
   SALE 11
   app.js — PART 1 / 5
   Core Data + Storage + Helpers + Product Data
   ========================================================= */

"use strict";


/* =========================================================
   1. SHORT DOM HELPER
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   2. STORAGE KEYS
   ========================================================= */

const KEYS = {
    products: "sale11_products",
    orders: "sale11_orders",
    customers: "sale11_customers",
    categories: "sale11_categories",
    settings: "sale11_settings",
    cart: "sale11_cart",
    wishlist: "sale11_wishlist",
    currentUser: "sale11_current_user",
    adminAuth: "sale11_admin_auth"
};


/* =========================================================
   3. DEFAULT CATEGORIES
   ========================================================= */

const DEFAULT_CATEGORIES = [
    "Fashion",
    "Electronics",
    "Home & Kitchen",
    "Beauty",
    "Kids",
    "Best Sellers"
];


/* =========================================================
   4. DEFAULT SETTINGS
   ========================================================= */

const DEFAULT_SETTINGS = {
    storeName: "Sale 11",
    supportPhone: "",
    deliveryCharge: 49,
    freeDeliveryAbove: 499,
    upiId: "",
    codEnabled: true,
    upiEnabled: false,
    currency: "₹"
};


/* =========================================================
   5. ADMIN CONFIG
   ========================================================= */

const ADMIN_CONFIG = {
    mobile: "7089297902",
    password: "S@hil1235"
};

let adminAuth = null;

function saveAdminAuth() {
    try {
        if (adminAuth && adminAuth.loggedIn) {
            sessionStorage.setItem(KEYS.adminAuth, JSON.stringify(adminAuth));
        } else {
            sessionStorage.removeItem(KEYS.adminAuth);
        }
    } catch (error) {
        console.error("Sale 11: could not save admin auth", error);
    }
}

function loadAdminAuth() {
    try {
        const raw = sessionStorage.getItem(KEYS.adminAuth);
        if (!raw) { adminAuth = null; return; }
        const parsed = JSON.parse(raw);
        adminAuth = parsed && parsed.loggedIn ? parsed : null;
    } catch (error) {
        adminAuth = null;
        sessionStorage.removeItem(KEYS.adminAuth);
    }
}

let currentDashboardPeriod = "all";

function getAdminPeriod() {
    return currentDashboardPeriod || "all";
}

function setAdminPeriod(period) {
    const value = String(period || "all");
    currentDashboardPeriod =
        value === "7" ? "7days" :
        value === "30" ? "30days" :
        value === "today" ? "today" :
        "all";
    renderAdminDashboard();
}



/* =========================================================
   6. GLOBAL STATE
   ========================================================= */

let products = [];
let orders = [];
let customers = [];
let categories = [];
let settings = {};

let cart = [];
let wishlist = [];

let currentCustomer = null;
let selectedProduct = null;

let selectedProductImageIndex = 0;
let selectedProductSize = "";
let selectedProductColor = "";
let selectedProductQuantity = 1;

let adminProductPage = 1;
let adminOrderPage = 1;

const ADMIN_PRODUCTS_PER_PAGE = 10;
const ADMIN_ORDERS_PER_PAGE = 10;


/* =========================================================
   7. SAFE JSON READ
   ========================================================= */

function readStorage(key, fallback) {

    try {

        const value = localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        const parsed = JSON.parse(value);

        return parsed ?? fallback;

    } catch (error) {

        console.warn(
            "Storage read error:",
            key,
            error
        );

        return fallback;
    }
}


/* =========================================================
   8. SAFE JSON WRITE
   ========================================================= */

function writeStorage(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    } catch (error) {

        console.error(
            "Storage write error:",
            key,
            error
        );

        showToast(
            "Storage full. Please reduce image size.",
            "error"
        );

        return false;
    }
}


/* =========================================================
   9. LOAD ALL DATA
   ========================================================= */

function loadAllData() {

    products =
        readStorage(
            KEYS.products,
            []
        );

    orders =
        readStorage(
            KEYS.orders,
            []
        );

    customers =
        readStorage(
            KEYS.customers,
            []
        );

    categories =
        readStorage(
            KEYS.categories,
            [...DEFAULT_CATEGORIES]
        );

    settings =
        {
            ...DEFAULT_SETTINGS,
            ...readStorage(
                KEYS.settings,
                {}
            )
        };

    cart =
        readStorage(
            KEYS.cart,
            []
        );

    wishlist =
        readStorage(
            KEYS.wishlist,
            []
        );

    normalizeAllProducts();
}


/* =========================================================
   10. SAVE PRODUCTS
   ========================================================= */

function saveProducts() {

    return writeStorage(
        KEYS.products,
        products
    );
}


/* =========================================================
   11. SAVE ORDERS
   ========================================================= */

function saveOrders() {

    return writeStorage(
        KEYS.orders,
        orders
    );
}


/* =========================================================
   12. SAVE CUSTOMERS
   ========================================================= */

function saveCustomers() {

    return writeStorage(
        KEYS.customers,
        customers
    );
}


/* =========================================================
   13. SAVE CATEGORIES
   ========================================================= */

function saveCategories() {

    return writeStorage(
        KEYS.categories,
        categories
    );
}


/* =========================================================
   14. SAVE SETTINGS
   ========================================================= */

function saveSettings() {

    return writeStorage(
        KEYS.settings,
        settings
    );
}


/* =========================================================
   15. SAVE CART
   ========================================================= */

function saveCart() {

    return writeStorage(
        KEYS.cart,
        cart
    );
}


/* =========================================================
   16. SAVE WISHLIST
   ========================================================= */

function saveWishlist() {

    return writeStorage(
        KEYS.wishlist,
        wishlist
    );
}


/* =========================================================
   17. STRING HELPER
   ========================================================= */

function safeString(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value);
}


/* =========================================================
   18. NUMBER HELPER
   ========================================================= */

function numberValue(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;
}


/* =========================================================
   19. CURRENCY FORMAT
   ========================================================= */

function formatCurrency(value) {

    const amount =
        numberValue(value);

    return (
        settings.currency || "₹"
    ) +
        amount.toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );
}


/* =========================================================
   20. HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return safeString(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   21. ATTRIBUTE ESCAPE
   ========================================================= */

function escapeAttribute(value) {

    return escapeHTML(value);
}


/* =========================================================
   22. SLUGIFY
   ========================================================= */

function slugify(value) {

    return safeString(value)
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );
}


/* =========================================================
   23. GENERATE ID
   ========================================================= */

function generateId(prefix = "ID") {

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .slice(2, 8)
    );
}


/* =========================================================
   24. GENERATE ORDER ID
   ========================================================= */

function generateOrderId() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );

    const random =
        Math.floor(
            1000 +
            Math.random() * 9000
        );

    return (
        "S11-" +
        year +
        month +
        day +
        "-" +
        random
    );
}


/* =========================================================
   25. DATE FORMAT
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   26. DATE + TIME FORMAT
   ========================================================= */

function formatDateTime(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "-";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   27. PARSE COMMA LIST
   ========================================================= */

function parseList(value) {

    if (Array.isArray(value)) {

        return value
            .map(item =>
                safeString(item).trim()
            )
            .filter(Boolean);
    }

    return safeString(value)
        .split(",")
        .map(item =>
            item.trim()
        )
        .filter(Boolean);
}


/* =========================================================
   28. IMAGE VALIDATION
   ========================================================= */

function isValidImageData(value) {

    if (!value) {
        return false;
    }

    const image =
        safeString(value);

    return (
        image.startsWith("data:image/") ||
        image.startsWith("https://") ||
        image.startsWith("http://") ||
        image.startsWith("/")
    );
}


/* =========================================================
   29. PRODUCT NORMALIZER
   ========================================================= */

function normalizeProduct(product) {

    const item =
        product || {};

    const images =
        Array.isArray(
            item.images
        )
            ? item.images
                .filter(
                    image =>
                        isValidImageData(
                            image
                        )
                )
                .slice(0, 6)
            : [];

    /*
       पुराने product में सिर्फ image
       field हो तो उसे भी support करेंगे.
    */

    if (
        !images.length &&
        isValidImageData(
            item.image
        )
    ) {
        images.push(
            item.image
        );
    }

    return {

        id:
            item.id ||
            generateId("P"),

        name:
            safeString(
                item.name
            ),

        sku:
            safeString(
                item.sku
            ),

        category:
            safeString(
                item.category
            ),

        description:
            safeString(
                item.description
            ),

        details:
            safeString(
                item.details
            ),

        features:
            Array.isArray(
                item.features
            )
                ? item.features
                : parseList(
                    item.features
                ),

        price:
            numberValue(
                item.price
            ),

        mrp:
            numberValue(
                item.mrp
            ),

        costPrice:
            numberValue(
                item.costPrice ??
                item.resellPrice
            ),

        resellPrice:
            numberValue(
                item.resellPrice ??
                item.costPrice
            ),

        discount:
            numberValue(
                item.discount
            ),

        stock:
            Math.max(
                0,
                Math.floor(
                    numberValue(
                        item.stock
                    )
                )
            ),

        sizes:
            parseList(
                item.sizes
            ),

        colors:
            parseList(
                item.colors
            ),

        images,

        image:
            images[0] || "",

        active:
            item.active !== false,

        createdAt:
            item.createdAt ||
            new Date().toISOString(),

        updatedAt:
            item.updatedAt ||
            new Date().toISOString()
    };
}


/* =========================================================
   30. NORMALIZE ALL PRODUCTS
   ========================================================= */

function normalizeAllProducts() {

    products =
        products.map(
            normalizeProduct
        );

    /*
       Storage में normalized data
       save कर देते हैं.
    */

    writeStorage(
        KEYS.products,
        products
    );
}


/* =========================================================
   31. FIND PRODUCT
   ========================================================= */

function findProduct(productId) {

    return (
        products.find(
            product =>
                String(
                    product.id
                ) ===
                String(
                    productId
                )
        ) || null
    );
}


/* =========================================================
   32. GET ACTIVE PRODUCTS
   ========================================================= */

function getActiveProducts() {

    return products.filter(
        product =>
            product.active !== false
    );
}


/* =========================================================
   33. GET CATEGORY NAME
   ========================================================= */

function getCategoryName(category) {

    if (
        category &&
        typeof category === "object"
    ) {

        return safeString(
            category.name
        );
    }

    return safeString(
        category
    );
}


/* =========================================================
   34. GET STOCK TEXT
   ========================================================= */

function getStockText(product) {

    if (!product) {
        return "Out of Stock";
    }

    const stock =
        numberValue(
            product.stock
        );

    if (stock <= 0) {
        return "Out of Stock";
    }

    if (stock <= 5) {
        return `Only ${stock} left`;
    }

    return `${stock} in stock`;
}


/* =========================================================
   35. GET STOCK CLASS
   ========================================================= */

function getStockClass(product) {

    if (!product) {
        return "stock-out";
    }

    const stock =
        numberValue(
            product.stock
        );

    if (stock <= 0) {
        return "stock-out";
    }

    if (stock <= 5) {
        return "stock-low";
    }

    return "stock-text";
}


/* =========================================================
   36. GET DISCOUNT PERCENT
   ========================================================= */

function getDiscountPercent(product) {

    if (!product) {
        return 0;
    }

    const mrp =
        numberValue(
            product.mrp
        );

    const price =
        numberValue(
            product.price
        );

    if (
        mrp <= 0 ||
        price <= 0 ||
        price >= mrp
    ) {
        return 0;
    }

    return Math.round(
        (
            (mrp - price) /
            mrp
        ) * 100
    );
}


/* =========================================================
   37. GET CUSTOMER
   ========================================================= */

function getCurrentCustomer() {

    const mobile =
        localStorage.getItem(
            KEYS.currentUser
        );

    if (!mobile) {
        return null;
    }

    return (
        customers.find(
            customer =>
                String(
                    customer.mobile
                ) ===
                String(
                    mobile
                )
        ) || null
    );
}


/* =========================================================
   38. GET ORDERS
   ========================================================= */

function getOrders() {

    return orders;
}


/* =========================================================
   39. GET CUSTOMERS
   ========================================================= */

function getCustomers() {

    return customers;
}


/* =========================================================
   40. GET PRODUCTS
   ========================================================= */

function getProducts() {

    return products;
}


/* =========================================================
   41. GET SETTINGS
   ========================================================= */

function getSettings() {

    return {
        ...DEFAULT_SETTINGS,
        ...settings
    };
}


/* =========================================================
   42. GET CART COUNT
   ========================================================= */

function getCartCount() {

    return cart.reduce(
        (
            total,
            item
        ) => {

            return (
                total +
                numberValue(
                    item.quantity
                )
            );
        },
        0
    );
}


/* =========================================================
   43. SET TEXT SAFELY
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        $(id);

    if (element) {

        element.textContent =
            safeString(
                value
            );
    }
}


/* =========================================================
   44. SET HTML SAFELY
   ========================================================= */

function setHTML(
    id,
    value
) {

    const element =
        $(id);

    if (element) {

        element.innerHTML =
            value || "";
    }
}


/* =========================================================
   45. SET INPUT VALUE
   ========================================================= */

function setInputValue(
    id,
    value
) {

    const element =
        $(id);

    if (element) {

        element.value =
            value ?? "";
    }
}


/* =========================================================
   46. GET INPUT VALUE
   ========================================================= */

function getInputValue(id) {

    const element =
        $(id);

    return element
        ? element.value.trim()
        : "";
}


/* =========================================================
   47. GET CHECKED VALUE
   ========================================================= */

function getCheckedValue(
    name
) {

    const element =
        document.querySelector(
            `input[name="${name}"]:checked`
        );

    return element
        ? element.value
        : "";
}


/* =========================================================
   48. ADMIN LOGIN STATE
   ========================================================= */



/* =========================================================
   49. SET ADMIN LOGIN STATE
   ========================================================= */

function setAdminLoginState(
    loggedIn
) {

    if (loggedIn) {

        sessionStorage.setItem(
            KEYS.adminAuth,
            "true"
        );

    } else {

        sessionStorage.removeItem(
            KEYS.adminAuth
        );
    }
}


/* =========================================================
   50. CUSTOMER LOGIN STATE
   ========================================================= */

function isCustomerLoggedIn() {

    return Boolean(
        getCurrentCustomer()
    );
}


/* =========================================================
   51. NORMALIZE CUSTOMER
   ========================================================= */

function normalizeCustomer(
    customer
) {

    const item =
        customer || {};

    return {

        id:
            item.id ||
            generateId("C"),

        name:
            safeString(
                item.name
            ),

        mobile:
            safeString(
                item.mobile
            ),

        email:
            safeString(
                item.email
            ),

        address:
            item.address || {},

        orders:
            Array.isArray(
                item.orders
            )
                ? item.orders
                : [],

        createdAt:
            item.createdAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };
}


/* =========================================================
   52. NORMALIZE ALL CUSTOMERS
   ========================================================= */

function normalizeAllCustomers() {

    customers =
        customers.map(
            normalizeCustomer
        );

    saveCustomers();
}


/* =========================================================
   53. GET CUSTOMER BY MOBILE
   ========================================================= */

function findCustomerByMobile(
    mobile
) {

    const value =
        safeString(
            mobile
        ).replace(
            /\D/g,
            ""
        );

    return (
        customers.find(
            customer =>
                safeString(
                    customer.mobile
                ).replace(
                    /\D/g,
                    ""
                ) === value
        ) || null
    );
}


/* =========================================================
   54. CREATE CUSTOMER
   ========================================================= */

function createCustomer(
    data
) {

    const customer =
        normalizeCustomer(
            data
        );

    customers.push(
        customer
    );

    saveCustomers();

    return customer;
}


/* =========================================================
   55. CURRENT USER MOBILE
   ========================================================= */

function getCurrentUserMobile() {

    return (
        localStorage.getItem(
            KEYS.currentUser
        ) || ""
    );
}


/* =========================================================
   56. SET CURRENT USER
   ========================================================= */

function setCurrentUser(
    mobile
) {

    if (mobile) {

        localStorage.setItem(
            KEYS.currentUser,
            safeString(
                mobile
            )
        );

    } else {

        localStorage.removeItem(
            KEYS.currentUser
        );
    }
}


/* =========================================================
   57. INITIALIZE DEFAULT DATA
   ========================================================= */

function initializeDefaultData() {

    if (
        !Array.isArray(
            categories
        ) ||
        !categories.length
    ) {

        categories =
            [...DEFAULT_CATEGORIES];

        saveCategories();
    }

    if (
        !settings ||
        typeof settings !== "object"
    ) {

        settings =
            {
                ...DEFAULT_SETTINGS
            };

        saveSettings();
    }

    normalizeAllCustomers();
}


/* =========================================================
   58. IMAGE FILE VALIDATION
   ========================================================= */

function validateImageFile(
    file
) {

    if (!file) {
        return false;
    }

    if (
        !file.type ||
        !file.type.startsWith(
            "image/"
        )
    ) {

        showToast(
            "Please select an image file.",
            "error"
        );

        return false;
    }

    /*
       Maximum 5 MB per image.
    */

    if (
        file.size >
        5 * 1024 * 1024
    ) {

        showToast(
            "Each image must be below 5 MB.",
            "error"
        );

        return false;
    }

    return true;
}


/* =========================================================
   59. READ IMAGE AS DATA URL
   ========================================================= */

function readImageAsDataURL(
    file
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const reader =
                new FileReader();

            reader.onload =
                event => {

                    resolve(
                        event.target.result
                    );
                };

            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Image could not be read."
                        )
                    );
                };

            reader.readAsDataURL(
                file
            );
        }
    );
}


/* =========================================================
   60. CREATE EMPTY PRODUCT
   ========================================================= */

function createEmptyProduct() {

    return {

        id:
            generateId("P"),

        name: "",

        sku: "",

        category: "",

        description: "",

        details: "",

        features: [],

        price: 0,

        mrp: 0,

        costPrice: 0,

        resellPrice: 0,

        discount: 0,

        stock: 0,

        sizes: [],

        colors: [],

        images: [],

        image: "",

        active: true,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    };
}


/* =========================================================
   61. UPDATE CART BADGE
   ========================================================= */

function updateCartBadge() {

    const count =
        getCartCount();

    document
        .querySelectorAll(
            ".cart-badge"
        )
        .forEach(
            badge => {

                badge.textContent =
                    String(
                        count
                    );

                badge.style.display =
                    count > 0
                        ? ""
                        : "none";
            }
        );
}


/* =========================================================
   62. UPDATE WISHLIST COUNT
   ========================================================= */

function updateWishlistCount() {

    document
        .querySelectorAll(
            "[data-wishlist-count]"
        )
        .forEach(
            element => {

                element.textContent =
                    String(
                        wishlist.length
                    );
            }
        );
}


/* =========================================================
   63. SIMPLE TOAST
   ========================================================= */

function showToast(
    message,
    type = "info"
) {

    const container =
        $("toastContainer");

    if (!container) {

        console.log(
            `[${type}]`,
            message
        );

        return;
    }

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        `toast ${type}`;

    toast.textContent =
        safeString(
            message
        );

    container.appendChild(
        toast
    );

    setTimeout(
        () => {

            toast.classList.add(
                "hide"
            );

            setTimeout(
                () => {

                    toast.remove();

                },
                250
            );

        },
        3000
    );
}


/* =========================================================
   64. CONFIRM ACTION
   ========================================================= */

function confirmAction(
    message,
    callback
) {

    if (
        window.confirm(
            message
        )
    ) {

        if (
            typeof callback ===
            "function"
        ) {

            callback();
        }

        return true;
    }

    return false;
}


/* =========================================================
   65. INITIAL DATA LOAD
   ========================================================= */

loadAllData();

initializeDefaultData();

updateCartBadge();

updateWishlistCount();


/* =========================================================
   PART 1 END
   ========================================================= */
   /* =========================================================
   SALE 11
   app.js — PART 2 / 5
   Store + Categories + Products + Product Details + Wishlist
   ========================================================= */


/* =========================================================
   1. PRODUCT IMAGE
   ========================================================= */

function getProductImage(
    product,
    index = 0
) {

    if (!product) {
        return "";
    }

    const images =
        Array.isArray(product.images)
            ? product.images
            : [];

    if (
        images[index] &&
        isValidImageData(
            images[index]
        )
    ) {
        return images[index];
    }

    if (
        images[0] &&
        isValidImageData(
            images[0]
        )
    ) {
        return images[0];
    }

    if (
        product.image &&
        isValidImageData(
            product.image
        )
    ) {
        return product.image;
    }

    return "";
}


/* =========================================================
   2. PRODUCT IMAGE HTML
   ========================================================= */

function productImageHTML(
    product,
    className = "product-image"
) {

    const image =
        getProductImage(
            product
        );

    if (!image) {

        return `
            <div class="product-image-placeholder">
                <span>🛍️</span>
            </div>
        `;
    }

    return `
        <img
            class="${className}"
            src="${escapeAttribute(image)}"
            alt="${escapeAttribute(product.name)}"
            loading="lazy"
        >
    `;
}


/* =========================================================
   3. RENDER CATEGORY BAR
   ========================================================= */

function renderCategories(
    selectedCategory = "All"
) {

    const container =
        document.querySelector(
            ".category-scroll"
        );

    if (!container) {
        return;
    }

    const allCategories = [
        "All",
        ...categories
            .filter(Boolean)
            .filter(
                category =>
                    category !== "All"
            )
    ];

    container.innerHTML =
        allCategories
            .map(
                category => {

                    const active =
                        category ===
                        selectedCategory
                            ? "active"
                            : "";

                    return `
                        <button
                            type="button"
                            class="category-btn ${active}"
                            data-category="${escapeAttribute(category)}"
                        >
                            ${escapeHTML(category)}
                        </button>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   4. CURRENT CATEGORY
   ========================================================= */

let currentCategory = "All";


/* =========================================================
   5. CURRENT SEARCH
   ========================================================= */

let currentSearch = "";


/* =========================================================
   6. CURRENT SORT
   ========================================================= */

let currentSort = "default";


/* =========================================================
   7. FILTER PRODUCTS
   ========================================================= */

function getFilteredProducts() {

    let result =
        getActiveProducts();

    if (
        currentCategory &&
        currentCategory !== "All"
    ) {

        result =
            result.filter(
                product =>
                    safeString(
                        product.category
                    ).toLowerCase() ===
                    safeString(
                        currentCategory
                    ).toLowerCase()
            );
    }

    if (currentSearch) {

        const query =
            currentSearch
                .toLowerCase()
                .trim();

        result =
            result.filter(
                product => {

                    const text = [
                        product.name,
                        product.category,
                        product.description,
                        product.details,
                        product.sku,
                        ...(product.features || [])
                    ]
                        .join(" ")
                        .toLowerCase();

                    return text.includes(
                        query
                    );
                }
            );
    }

    result =
        [...result];

    switch (currentSort) {

        case "price-low":
            result.sort(
                (a, b) =>
                    numberValue(a.price) -
                    numberValue(b.price)
            );
            break;

        case "price-high":
            result.sort(
                (a, b) =>
                    numberValue(b.price) -
                    numberValue(a.price)
            );
            break;

        case "newest":
            result.sort(
                (a, b) =>
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
            );
            break;

        case "name":
            result.sort(
                (a, b) =>
                    safeString(a.name)
                        .localeCompare(
                            safeString(b.name)
                        )
            );
            break;

        default:
            break;
    }

    return result;
}


/* =========================================================
   8. PRODUCT CARD
   ========================================================= */

function createProductCard(
    product
) {

    if (!product) {
        return "";
    }

    const price =
        numberValue(
            product.price
        );

    const mrp =
        numberValue(
            product.mrp
        );

    const discount =
        getDiscountPercent(
            product
        );

    const stock =
        numberValue(
            product.stock
        );

    const isWishlisted =
        wishlist.includes(
            product.id
        );

    const outOfStock =
        stock <= 0;

    const image =
        getProductImage(
            product
        );

    return `
        <article
            class="product-card"
            data-product-id="${escapeAttribute(product.id)}"
        >

            <div class="product-image-wrap">

                ${
                    image
                        ? `
                            <img
                                class="product-image"
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(product.name)}"
                                loading="lazy"
                                data-action="product-detail"
                                data-id="${escapeAttribute(product.id)}"
                            >
                        `
                        : `
                            <div
                                class="product-image-placeholder"
                                data-action="product-detail"
                                data-id="${escapeAttribute(product.id)}"
                            >
                                <span>🛍️</span>
                            </div>
                        `
                }

                <button
                    type="button"
                    class="product-wishlist-btn ${isWishlisted ? "active" : ""}"
                    data-action="wishlist"
                    data-id="${escapeAttribute(product.id)}"
                    aria-label="Wishlist"
                >
                    ${isWishlisted ? "♥" : "♡"}
                </button>

                ${
                    discount > 0
                        ? `
                            <span class="product-discount">
                                ${discount}% OFF
                            </span>
                        `
                        : ""
                }

            </div>


            <div class="product-card-body">

                <div class="product-category">
                    ${escapeHTML(
                        product.category || "Product"
                    )}
                </div>

                <h3
                    class="product-name"
                    data-action="product-detail"
                    data-id="${escapeAttribute(product.id)}"
                >
                    ${escapeHTML(
                        product.name || "Unnamed Product"
                    )}
                </h3>


                <div class="product-price-row">

                    <span class="product-price">
                        ${formatCurrency(price)}
                    </span>

                    ${
                        mrp > price
                            ? `
                                <span class="product-mrp">
                                    ${formatCurrency(mrp)}
                                </span>
                            `
                            : ""
                    }

                </div>


                <div class="product-meta">

                    <span class="${getStockClass(product)}">
                        ${escapeHTML(
                            getStockText(product)
                        )}
                    </span>

                    ${
                        product.sku
                            ? `
                                <span>
                                    SKU:
                                    ${escapeHTML(
                                        product.sku
                                    )}
                                </span>
                            `
                            : ""
                    }

                </div>


                <div class="product-actions">

                    <button
                        type="button"
                        class="product-buy-btn"
                        data-action="product-detail"
                        data-id="${escapeAttribute(product.id)}"
                        ${outOfStock ? "disabled" : ""}
                    >
                        ${
                            outOfStock
                                ? "Out of Stock"
                                : "View Product"
                        }
                    </button>

                </div>

            </div>

        </article>
    `;
}


/* =========================================================
   9. RENDER PRODUCTS
   ========================================================= */

function renderProducts() {

    const grid =
        $("productsGrid");

    if (!grid) {
        return;
    }

    const filtered =
        getFilteredProducts();

    if (!filtered.length) {

        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    🛍️
                </div>

                <h3>
                    No products found
                </h3>

                <p>
                    Try another category or search.
                </p>
            </div>
        `;

        return;
    }

    grid.innerHTML =
        filtered
            .map(
                product =>
                    createProductCard(
                        product
                    )
            )
            .join("");
}


/* =========================================================
   10. SHOW CATEGORY
   ========================================================= */

function selectCategory(
    category
) {

    currentCategory =
        category || "All";

    renderCategories(
        currentCategory
    );

    renderProducts();

    const productsSection =
        document.querySelector(
            ".products-section"
        );

    if (
        productsSection &&
        category !== "All"
    ) {

        productsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* =========================================================
   11. SEARCH PRODUCTS
   ========================================================= */

function searchProducts(
    value
) {

    currentSearch =
        safeString(
            value
        );

    renderProducts();
}


/* =========================================================
   12. SORT PRODUCTS
   ========================================================= */

function sortProducts(
    value
) {

    currentSort =
        safeString(
            value
        );

    renderProducts();
}


/* =========================================================
   13. PRODUCT DETAIL
   ========================================================= */

function openProductDetail(
    productId
) {

    const product =
        findProduct(
            productId
        );

    if (!product) {

        showToast(
            "Product not found.",
            "error"
        );

        return;
    }

    selectedProduct =
        product;

    selectedProductImageIndex = 0;

    selectedProductSize =
        product.sizes &&
        product.sizes.length
            ? product.sizes[0]
            : "";

    selectedProductColor =
        product.colors &&
        product.colors.length
            ? product.colors[0]
            : "";

    selectedProductQuantity = 1;

    renderProductDetail();

    openModal(
        "productDetailModal"
    );
}


/* =========================================================
   14. RENDER PRODUCT DETAIL
   ========================================================= */

function renderProductDetail() {

    const product =
        selectedProduct;

    if (!product) {
        return;
    }

    const mainImage =
        $("productMainImage");

    const thumbs =
        $("productThumbs");

    const title =
        $("productDetailTitle");

    const category =
        $("productDetailCategory");

    const price =
        $("productDetailPrice");

    const mrp =
        $("productDetailMrp");

    const discount =
        $("productDetailDiscount");

    const stock =
        $("productDetailStock");

    const description =
        $("productDetailDescription");

    const details =
        $("productDetailDetails");

    if (title) {

        title.textContent =
            product.name ||
            "Product";
    }

    if (category) {

        category.textContent =
            product.category ||
            "";
    }

    if (price) {

        price.textContent =
            formatCurrency(
                product.price
            );
    }

    if (mrp) {

        if (
            numberValue(
                product.mrp
            ) >
            numberValue(
                product.price
            )
        ) {

            mrp.textContent =
                formatCurrency(
                    product.mrp
                );

            mrp.style.display =
                "";

        } else {

            mrp.textContent =
                "";

            mrp.style.display =
                "none";
        }
    }

    if (discount) {

        const percent =
            getDiscountPercent(
                product
            );

        discount.textContent =
            percent > 0
                ? `${percent}% OFF`
                : "";

        discount.style.display =
            percent > 0
                ? ""
                : "none";
    }

    if (stock) {

        stock.textContent =
            getStockText(
                product
            );

        stock.className =
            `detail-stock ${getStockClass(product)}`;
    }

    if (description) {

        description.textContent =
            product.description ||
            "No description available.";
    }

    if (details) {

        const features =
            Array.isArray(
                product.features
            )
                ? product.features
                : [];

        details.innerHTML =
            product.details
                ? `
                    <p>
                        ${escapeHTML(
                            product.details
                        )}
                    </p>
                `
                : "";

        if (features.length) {

            details.innerHTML += `
                <ul>
                    ${features
                        .map(
                            feature =>
                                `<li>${escapeHTML(feature)}</li>`
                        )
                        .join("")}
                </ul>
            `;
        }
    }

    renderProductMainImage();

    renderProductThumbs();

    renderProductSizes();

    renderProductColors();

    updateProductQuantityUI();
}


/* =========================================================
   15. RENDER MAIN PRODUCT IMAGE
   ========================================================= */

function renderProductMainImage() {

    const element =
        $("productMainImage");

    if (!element || !selectedProduct) {
        return;
    }

    const image =
        getProductImage(
            selectedProduct,
            selectedProductImageIndex
        );

    if (image) {

        element.src =
            image;

        element.alt =
            selectedProduct.name || "Product";

        element.style.display =
            "";
    } else {

        element.removeAttribute(
            "src"
        );

        element.alt =
            "No product image";

        element.style.display =
            "none";
    }
}


/* =========================================================
   16. PRODUCT THUMBNAILS
   ========================================================= */

function renderProductThumbs() {

    const container =
        $("productThumbs");

    if (!container || !selectedProduct) {
        return;
    }

    const images =
        Array.isArray(
            selectedProduct.images
        )
            ? selectedProduct.images
                .filter(
                    isValidImageData
                )
                .slice(0, 6)
            : [];

    if (!images.length) {

        container.innerHTML =
            "";

        return;
    }

    container.innerHTML =
        images
            .map(
                (
                    image,
                    index
                ) => {

                    const active =
                        index ===
                        selectedProductImageIndex
                            ? "active"
                            : "";

                    return `
                        <button
                            type="button"
                            class="product-thumb ${active}"
                            data-image-index="${index}"
                            data-product-image="true"
                        >
                            <img
                                src="${escapeAttribute(image)}"
                                alt="${escapeAttribute(selectedProduct.name)}"
                            >
                        </button>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   17. SELECT PRODUCT IMAGE
   ========================================================= */

function selectProductImage(
    index
) {

    if (!selectedProduct) {
        return;
    }

    const images =
        Array.isArray(
            selectedProduct.images
        )
            ? selectedProduct.images
            : [];

    const numericIndex =
        Number(index);

    if (
        !Number.isInteger(
            numericIndex
        ) ||
        !images[numericIndex]
    ) {
        return;
    }

    selectedProductImageIndex =
        numericIndex;

    renderProductMainImage();

    renderProductThumbs();
}


/* =========================================================
   18. RENDER SIZE OPTIONS
   ========================================================= */

function renderProductSizes() {

    const container =
        $("productSizeOptions");

    if (!container || !selectedProduct) {
        return;
    }

    const sizes =
        Array.isArray(
            selectedProduct.sizes
        )
            ? selectedProduct.sizes
            : [];

    if (!sizes.length) {

        container.innerHTML =
            "";

        return;
    }

    container.innerHTML =
        sizes
            .map(
                size => {

                    const active =
                        size ===
                        selectedProductSize
                            ? "active"
                            : "";

                    return `
                        <button
                            type="button"
                            class="size-chip option-chip ${active}"
                            data-size="${escapeAttribute(size)}"
                        >
                            ${escapeHTML(size)}
                        </button>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   19. SELECT SIZE
   ========================================================= */

function selectProductSize(
    size
) {

    selectedProductSize =
        safeString(
            size
        );

    renderProductSizes();
}


/* =========================================================
   20. RENDER COLOR OPTIONS
   ========================================================= */

function renderProductColors() {

    const container =
        $("productColorOptions");

    if (!container || !selectedProduct) {
        return;
    }

    const colors =
        Array.isArray(
            selectedProduct.colors
        )
            ? selectedProduct.colors
            : [];

    if (!colors.length) {

        container.innerHTML =
            "";

        return;
    }

    container.innerHTML =
        colors
            .map(
                color => {

                    const active =
                        color ===
                        selectedProductColor
                            ? "active"
                            : "";

                    return `
                        <button
                            type="button"
                            class="option-chip ${active}"
                            data-color="${escapeAttribute(color)}"
                        >
                            ${escapeHTML(color)}
                        </button>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   21. SELECT COLOR
   ========================================================= */

function selectProductColor(
    color
) {

    selectedProductColor =
        safeString(
            color
        );

    renderProductColors();
}


/* =========================================================
   22. QUANTITY UPDATE
   ========================================================= */

function updateProductQuantity(
    change
) {

    if (!selectedProduct) {
        return;
    }

    const stock =
        Math.max(
            0,
            numberValue(
                selectedProduct.stock
            )
        );

    let quantity =
        numberValue(
            selectedProductQuantity
        );

    quantity +=
        numberValue(
            change
        );

    quantity =
        Math.max(
            1,
            quantity
        );

    if (stock > 0) {

        quantity =
            Math.min(
                quantity,
                stock
            );
    }

    selectedProductQuantity =
        quantity;

    updateProductQuantityUI();
}


/* =========================================================
   23. SET PRODUCT QUANTITY
   ========================================================= */

function setProductQuantity(
    value
) {

    if (!selectedProduct) {
        return;
    }

    let quantity =
        Math.floor(
            numberValue(
                value
            )
        );

    quantity =
        Math.max(
            1,
            quantity
        );

    const stock =
        numberValue(
            selectedProduct.stock
        );

    if (stock > 0) {

        quantity =
            Math.min(
                quantity,
                stock
            );
    }

    selectedProductQuantity =
        quantity;

    updateProductQuantityUI();
}


/* =========================================================
   24. UPDATE QUANTITY UI
   ========================================================= */

function updateProductQuantityUI() {

    const input =
        $("productQuantity");

    if (input) {

        input.value =
            String(
                selectedProductQuantity
            );
    }
}


/* =========================================================
   25. GET SELECTED PRODUCT OPTIONS
   ========================================================= */

function getSelectedProductOptions() {

    return {

        size:
            selectedProductSize || "",

        color:
            selectedProductColor || "",

        quantity:
            Math.max(
                1,
                numberValue(
                    selectedProductQuantity
                )
            )
    };
}


/* =========================================================
   26. ADD TO WISHLIST
   ========================================================= */

function toggleWishlist(
    productId
) {

    const product =
        findProduct(
            productId
        );

    if (!product) {
        return;
    }

    const index =
        wishlist.indexOf(
            productId
        );

    if (index >= 0) {

        wishlist.splice(
            index,
            1
        );

        showToast(
            "Removed from wishlist.",
            "info"
        );

    } else {

        wishlist.push(
            productId
        );

        showToast(
            "Added to wishlist.",
            "success"
        );
    }

    saveWishlist();

    updateWishlistCount();

    renderProducts();
}


/* =========================================================
   27. IS WISHLISTED
   ========================================================= */

function isProductWishlisted(
    productId
) {

    return wishlist.includes(
        productId
    );
}


/* =========================================================
   28. REMOVE FROM WISHLIST
   ========================================================= */

function removeFromWishlist(
    productId
) {

    const index =
        wishlist.indexOf(
            productId
        );

    if (index === -1) {
        return;
    }

    wishlist.splice(
        index,
        1
    );

    saveWishlist();

    updateWishlistCount();

    renderProducts();

    if (
        typeof renderWishlist ===
        "function"
    ) {

        renderWishlist();
    }
}


/* =========================================================
   29. GET WISHLIST PRODUCTS
   ========================================================= */

function getWishlistProducts() {

    return wishlist
        .map(
            productId =>
                findProduct(
                    productId
                )
        )
        .filter(Boolean);
}


/* =========================================================
   30. RENDER WISHLIST
   ========================================================= */

function renderWishlist() {

    const container =
        $("wishlistItems");

    if (!container) {
        return;
    }

    const items =
        getWishlistProducts();

    if (!items.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    ♡
                </div>

                <h3>
                    Your wishlist is empty
                </h3>

                <p>
                    Products you save will appear here.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        items
            .map(
                product => {

                    const image =
                        getProductImage(
                            product
                        );

                    return `
                        <div
                            class="cart-item"
                            data-product-id="${escapeAttribute(product.id)}"
                        >

                            <div class="cart-item-image">

                                ${
                                    image
                                        ? `
                                            <img
                                                src="${escapeAttribute(image)}"
                                                alt="${escapeAttribute(product.name)}"
                                            >
                                        `
                                        : `
                                            <div class="product-image-placeholder">
                                                🛍️
                                            </div>
                                        `
                                }

                            </div>

                            <div class="cart-item-info">

                                <h4>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </h4>

                                <div class="cart-item-price">
                                    ${formatCurrency(
                                        product.price
                                    )}
                                </div>

                                <div class="cart-item-actions">

                                    <button
                                        type="button"
                                        class="product-buy-btn"
                                        data-action="product-detail"
                                        data-id="${escapeAttribute(product.id)}"
                                    >
                                        View
                                    </button>

                                    <button
                                        type="button"
                                        class="table-action danger"
                                        data-action="remove-wishlist"
                                        data-id="${escapeAttribute(product.id)}"
                                    >
                                        Remove
                                    </button>

                                </div>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   31. ADD SELECTED PRODUCT TO CART
   ========================================================= */

function addSelectedProductToCart() {

    if (!selectedProduct) {

        showToast(
            "Please select a product.",
            "error"
        );

        return;
    }

    const stock =
        numberValue(
            selectedProduct.stock
        );

    if (stock <= 0) {

        showToast(
            "This product is out of stock.",
            "error"
        );

        return;
    }

    const options =
        getSelectedProductOptions();

    const quantity =
        options.quantity;

    if (
        quantity > stock
    ) {

        showToast(
            "Selected quantity is not available.",
            "error"
        );

        return;
    }

    const existing =
        cart.find(
            item =>
                String(
                    item.productId
                ) ===
                String(
                    selectedProduct.id
                ) &&
                safeString(
                    item.size
                ) ===
                safeString(
                    options.size
                ) &&
                safeString(
                    item.color
                ) ===
                safeString(
                    options.color
                )
        );

    if (existing) {

        const newQuantity =
            numberValue(
                existing.quantity
            ) +
            quantity;

        if (
            newQuantity >
            stock
        ) {

            showToast(
                "Maximum available stock reached.",
                "warning"
            );

            return;
        }

        existing.quantity =
            newQuantity;

    } else {

        cart.push({

            id:
                generateId("CART"),

            productId:
                selectedProduct.id,

            name:
                selectedProduct.name,

            price:
                numberValue(
                    selectedProduct.price
                ),

            image:
                getProductImage(
                    selectedProduct
                ),

            size:
                options.size,

            color:
                options.color,

            quantity:
                quantity
        });
    }

    saveCart();

    updateCartBadge();

    showToast(
        "Product added to cart.",
        "success"
    );

    closeModal(
        "productDetailModal"
    );

    renderCart();
}


/* =========================================================
   32. DIRECT BUY
   ========================================================= */

function buySelectedProduct() {

    if (!selectedProduct) {
        return;
    }

    const stock =
        numberValue(
            selectedProduct.stock
        );

    if (stock <= 0) {

        showToast(
            "This product is out of stock.",
            "error"
        );

        return;
    }

    const options =
        getSelectedProductOptions();

    cart = [
        {
            id:
                generateId("CART"),

            productId:
                selectedProduct.id,

            name:
                selectedProduct.name,

            price:
                numberValue(
                    selectedProduct.price
                ),

            image:
                getProductImage(
                    selectedProduct
                ),

            size:
                options.size,

            color:
                options.color,

            quantity:
                options.quantity
        }
    ];

    saveCart();

    updateCartBadge();

    closeModal(
        "productDetailModal"
    );

    renderCart();

    openModal(
        "cartModal"
    );
}


/* =========================================================
   33. OPEN WISHLIST
   ========================================================= */

function openWishlistModal() {

    renderWishlist();

    openModal(
        "wishlistModal"
    );
}


/* =========================================================
   34. CATEGORY CLICK HANDLER
   ========================================================= */

function handleCategoryClick(
    event
) {

    const button =
        event.target.closest(
            "[data-category]"
        );

    if (!button) {
        return;
    }

    const category =
        button.getAttribute(
            "data-category"
        );

    selectCategory(
        category
    );
}


/* =========================================================
   35. PRODUCT GRID CLICK HANDLER
   ========================================================= */

function handleProductGridClick(
    event
) {

    const target =
        event.target.closest(
            "[data-action]"
        );

    if (!target) {
        return;
    }

    const action =
        target.getAttribute(
            "data-action"
        );

    const productId =
        target.getAttribute(
            "data-id"
        );

    if (!productId) {
        return;
    }

    switch (action) {

        case "product-detail":

            openProductDetail(
                productId
            );

            break;

        case "wishlist":

            event.stopPropagation();

            toggleWishlist(
                productId
            );

            break;

        case "remove-wishlist":

            removeFromWishlist(
                productId
            );

            break;

        default:
            break;
    }
}


/* =========================================================
   36. PRODUCT DETAIL CLICK HANDLER
   ========================================================= */

function handleProductDetailClick(
    event
) {

    const imageButton =
        event.target.closest(
            "[data-product-image]"
        );

    if (imageButton) {

        const index =
            imageButton.getAttribute(
                "data-image-index"
            );

        selectProductImage(
            index
        );

        return;
    }

    const sizeButton =
        event.target.closest(
            "[data-size]"
        );

    if (sizeButton) {

        selectProductSize(
            sizeButton.getAttribute(
                "data-size"
            )
        );

        return;
    }

    const colorButton =
        event.target.closest(
            "[data-color]"
        );

    if (colorButton) {

        selectProductColor(
            colorButton.getAttribute(
                "data-color"
            )
        );

        return;
    }
}


/* =========================================================
   37. INITIAL STORE RENDER
   ========================================================= */

function initializeStoreView() {

    renderCategories(
        currentCategory
    );

    renderProducts();

    renderWishlist();

    updateCartBadge();

    updateWishlistCount();
}


/* =========================================================
   38. EVENT BINDING — CATEGORY
   ========================================================= */

function bindCategoryEvents() {

    const container =
        document.querySelector(
            ".category-scroll"
        );

    if (!container) {
        return;
    }

    container.addEventListener(
        "click",
        handleCategoryClick
    );
}


/* =========================================================
   39. EVENT BINDING — PRODUCT GRID
   ========================================================= */

function bindProductGridEvents() {

    const grid =
        $("productsGrid");

    if (!grid) {
        return;
    }

    grid.addEventListener(
        "click",
        handleProductGridClick
    );
}


/* =========================================================
   40. EVENT BINDING — PRODUCT DETAIL
   ========================================================= */

function bindProductDetailEvents() {

    const modal =
        $("productDetailModal");

    if (!modal) {
        return;
    }

    modal.addEventListener(
        "click",
        handleProductDetailClick
    );
}


/* =========================================================
   41. SEARCH EVENT
   ========================================================= */

function bindSearchEvent() {

    const searchInput =
        document.querySelector(
            ".search-box input"
        );

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener(
        "input",
        event => {

            searchProducts(
                event.target.value
            );
        }
    );
}


/* =========================================================
   42. SORT EVENT
   ========================================================= */

function bindSortEvent() {

    const sortSelect =
        document.querySelector(
            ".sort-area select"
        );

    if (!sortSelect) {
        return;
    }

    sortSelect.addEventListener(
        "change",
        event => {

            sortProducts(
                event.target.value
            );
        }
    );
}


/* =========================================================
   43. INITIALIZE STORE EVENTS
   ========================================================= */

function bindStoreEvents() {

    bindCategoryEvents();

    bindProductGridEvents();

    bindProductDetailEvents();

    bindSearchEvent();

    bindSortEvent();
}


/* =========================================================
   44. PRODUCT IMAGE FILES HELPER
   ========================================================= */

async function readProductImageFiles(
    fileList
) {

    if (!fileList) {
        return [];
    }

    const files =
        Array.from(
            fileList
        ).slice(0, 6);

    const validFiles =
        files.filter(
            validateImageFile
        );

    if (
        validFiles.length <
        files.length
    ) {

        showToast(
            "Some images were skipped.",
            "warning"
        );
    }

    const results =
        [];

    for (
        const file
        of validFiles
    ) {

        try {

            const data =
                await readImageAsDataURL(
                    file
                );

            if (data) {

                results.push(
                    data
                );
            }

        } catch (error) {

            console.error(
                "Image read error:",
                error
            );
        }
    }

    return results.slice(
        0,
        6
    );
}


/* =========================================================
   45. INITIALIZE PART 2
   ========================================================= */

function initializePart2() {

    bindStoreEvents();

    initializeStoreView();
}


/* =========================================================
   PART 2 END
   ========================================================= */
   /* =========================================================
   SALE 11
   APP.JS — PART 3 / 5
   CART + CHECKOUT + CUSTOMER + ORDERS
   ========================================================= */

/* =========================================================
   MODAL HELPERS
   ========================================================= */

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove("active");
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    if (!document.querySelector(".modal.active")) document.body.classList.remove("modal-open");
}

function closeAllModals() {
    document.querySelectorAll(".modal.active").forEach(modal => {
        modal.classList.remove("active");
        modal.classList.add("hidden");
        modal.setAttribute("aria-hidden", "true");
    });
    document.body.classList.remove("modal-open");
}


/* =========================================================
   CART CALCULATIONS
   ========================================================= */

function getCartItemProduct(item) {
    return products.find(product => product.id === item.productId);
}

function getCartSubtotal() {
    return cart.reduce((total, item) => {
        const product = getCartItemProduct(item);

        if (!product) return total;

        const price = numberValue(item.price || product.price);

        return total + (price * numberValue(item.quantity, 1));
    }, 0);
}

function getCartQuantity() {
    return cart.reduce((total, item) => {
        return total + numberValue(item.quantity, 1);
    }, 0);
}

function getDeliveryCharge(subtotal = getCartSubtotal()) {
    if (subtotal <= 0) return 0;

    if (
        numberValue(settings.freeDeliveryAbove, 0) > 0 &&
        subtotal >= numberValue(settings.freeDeliveryAbove, 0)
    ) {
        return 0;
    }

    return numberValue(settings.deliveryCharge, 0);
}

function getCartTotal() {
    const subtotal = getCartSubtotal();
    const delivery = getDeliveryCharge(subtotal);

    return subtotal + delivery;
}


/* =========================================================
   CART ITEM HTML
   ========================================================= */

function createCartItemHTML(item, index) {
    const product = getCartItemProduct(item);

    if (!product) return "";

    const quantity = Math.max(1, numberValue(item.quantity, 1));
    const price = numberValue(item.price || product.price);
    const lineTotal = price * quantity;

    const image = getProductImage(product);

    const options = [];

    if (item.size) {
        options.push(`Size: ${escapeHTML(item.size)}`);
    }

    if (item.color) {
        options.push(`Color: ${escapeHTML(item.color)}`);
    }

    return `
        <div class="cart-item" data-cart-index="${index}">

            <div class="cart-item-image">
                ${
                    image
                        ? `<img src="${escapeHTML(image)}"
                                alt="${escapeHTML(product.name)}">`
                        : `<div class="product-image-placeholder">No Image</div>`
                }
            </div>

            <div class="cart-item-info">

                <div class="cart-item-title">
                    ${escapeHTML(product.name)}
                </div>

                <div class="cart-item-price">
                    ${formatCurrency(price)}
                </div>

                ${
                    options.length
                        ? `
                            <div class="cart-item-options">
                                ${options.join(" • ")}
                            </div>
                          `
                        : ""
                }

                <div class="cart-item-actions">

                    <div class="quantity-control">

                        <button
                            type="button"
                            class="qty-btn cart-qty-minus"
                            data-index="${index}">
                            −
                        </button>

                        <input
                            type="number"
                            class="qty-input cart-qty-input"
                            data-index="${index}"
                            value="${quantity}"
                            min="1"
                            max="${Math.max(
                                1,
                                numberValue(product.stock, 999)
                            )}">

                        <button
                            type="button"
                            class="qty-btn cart-qty-plus"
                            data-index="${index}">
                            +
                        </button>

                    </div>

                    <button
                        type="button"
                        class="table-action cart-remove-btn"
                        data-index="${index}">
                        Remove
                    </button>

                </div>
            </div>

            <div class="cart-item-total">
                ${formatCurrency(lineTotal)}
            </div>

        </div>
    `;
}


/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart() {
    const cartContainer = document.getElementById("cartItemsContainer");

    if (!cartContainer) return;

    if (!cart.length) {
        cartContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add products to your cart to continue.</p>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="closeModal('cartModal')">
                    Continue Shopping
                </button>
            </div>
        `;

        updateCartSummary();

        return;
    }

    cartContainer.innerHTML = cart
        .map((item, index) => createCartItemHTML(item, index))
        .join("");

    updateCartSummary();

    bindCartItemEvents();
}


/* =========================================================
   CART SUMMARY
   ========================================================= */

function updateCartSummary() {
    const subtotal = getCartSubtotal();
    const delivery = getDeliveryCharge(subtotal);
    const total = subtotal + delivery;

    const subtotalEl = document.getElementById("cartSubtotal");
    const deliveryEl = document.getElementById("cartDelivery");
    const totalEl = document.getElementById("cartTotal");

    if (subtotalEl) {
        subtotalEl.textContent = formatCurrency(subtotal);
    }

    if (deliveryEl) {
        deliveryEl.textContent =
            delivery === 0
                ? "FREE"
                : formatCurrency(delivery);
    }

    if (totalEl) {
        totalEl.textContent = formatCurrency(total);
    }
}


/* =========================================================
   CART EVENTS
   ========================================================= */

function bindCartItemEvents() {
    document.querySelectorAll(".cart-qty-minus").forEach(button => {
        button.addEventListener("click", () => {
            const index = numberValue(button.dataset.index);

            if (!cart[index]) return;

            cart[index].quantity = Math.max(
                1,
                numberValue(cart[index].quantity, 1) - 1
            );

            saveCart();
            renderCart();
            updateCartBadge();
        });
    });

    document.querySelectorAll(".cart-qty-plus").forEach(button => {
        button.addEventListener("click", () => {
            const index = numberValue(button.dataset.index);

            if (!cart[index]) return;

            const product = getCartItemProduct(cart[index]);

            if (!product) return;

            const maxStock = Math.max(
                1,
                numberValue(product.stock, 999)
            );

            cart[index].quantity = Math.min(
                maxStock,
                numberValue(cart[index].quantity, 1) + 1
            );

            saveCart();
            renderCart();
            updateCartBadge();
        });
    });

    document.querySelectorAll(".cart-qty-input").forEach(input => {
        input.addEventListener("change", () => {
            const index = numberValue(input.dataset.index);

            if (!cart[index]) return;

            const product = getCartItemProduct(cart[index]);

            if (!product) return;

            const maxStock = Math.max(
                1,
                numberValue(product.stock, 999)
            );

            let quantity = numberValue(input.value, 1);

            quantity = Math.max(1, quantity);
            quantity = Math.min(maxStock, quantity);

            cart[index].quantity = quantity;

            saveCart();
            renderCart();
            updateCartBadge();
        });
    });

    document.querySelectorAll(".cart-remove-btn").forEach(button => {
        button.addEventListener("click", () => {
            const index = numberValue(button.dataset.index);

            if (!cart[index]) return;

            cart.splice(index, 1);

            saveCart();
            renderCart();
            updateCartBadge();

            showToast("Product removed from cart.", "success");
        });
    });
}


/* =========================================================
   OPEN CART
   ========================================================= */

function openCart() {
    renderCart();
    openModal("cartModal");
}


/* =========================================================
   CHECKOUT LOGIN CHECK
   ========================================================= */

function proceedToCheckout() {
    if (!cart.length) {
        showToast("Your cart is empty.", "warning");
        return;
    }

    if (!getCurrentCustomer()) {
        closeModal("cartModal");

        showCustomerLogin();

        showToast(
            "Please login before checkout.",
            "info"
        );

        return;
    }

    prepareCheckoutForm();

    closeModal("cartModal");
    openModal("checkoutModal");
}


/* =========================================================
   CUSTOMER LOGIN
   ========================================================= */

function showCustomerLogin() {
    const nameInput = document.getElementById("customerLoginName");
    const mobileInput = document.getElementById("customerLoginMobile");

    if (nameInput) {
        nameInput.value = "";
    }

    if (mobileInput) {
        mobileInput.value = "";
    }

    openModal("customerLoginModal");
}


/* =========================================================
   CUSTOMER LOGIN SUBMIT
   ========================================================= */

function handleCustomerLogin(event) {
    event.preventDefault();

    const nameInput = document.getElementById("customerLoginName");
    const mobileInput = document.getElementById("customerLoginMobile");

    const name = String(
        nameInput?.value || ""
    ).trim();

    const mobile = String(
        mobileInput?.value || ""
    ).replace(/\D/g, "");

    if (!name) {
        showToast("Please enter your name.", "warning");
        nameInput?.focus();
        return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
        showToast(
            "Please enter a valid 10-digit mobile number.",
            "warning"
        );

        mobileInput?.focus();
        return;
    }

    let customer = customers.find(
        item => item.mobile === mobile
    );

    if (customer) {
        customer.name = name;

        customer.updatedAt =
            new Date().toISOString();
    } else {
        customer = normalizeCustomer({
            id: generateId("CUS"),
            name,
            mobile,
            email: "",
            address: {},
            ordersCount: 0,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        customers.push(customer);
    }

    currentCustomer = customer;

    saveCustomers();
    saveCurrentCustomer();

    closeModal("customerLoginModal");

    updateCustomerUI();

    showToast(
        `Welcome, ${name}!`,
        "success"
    );

    if (cart.length) {
        prepareCheckoutForm();
        openModal("checkoutModal");
    }
}


/* =========================================================
   PREPARE CHECKOUT FORM
   ========================================================= */

function prepareCheckoutForm() {
    const customer = getCurrentCustomer();

    if (!customer) return;

    const fields = {
        checkoutName: customer.name || "",
        checkoutMobile: customer.mobile || "",
        checkoutHouse: customer.address?.house || "",
        checkoutArea: customer.address?.area || "",
        checkoutLandmark: customer.address?.landmark || "",
        checkoutCity: customer.address?.city || "",
        checkoutState: customer.address?.state || "",
        checkoutPincode: customer.address?.pincode || ""
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);

        if (element) {
            element.value = value;
        }
    });

    renderCheckoutSummary();
}


/* =========================================================
   CHECKOUT SUMMARY
   ========================================================= */

function renderCheckoutSummary() {
    const subtotal = getCartSubtotal();
    const delivery = getDeliveryCharge(subtotal);
    const total = subtotal + delivery;

    const checkoutSubtotal =
        document.getElementById("checkoutSubtotal");

    const checkoutDelivery =
        document.getElementById("checkoutDelivery");

    const checkoutTotal =
        document.getElementById("checkoutTotal");

    if (checkoutSubtotal) {
        checkoutSubtotal.textContent =
            formatCurrency(subtotal);
    }

    if (checkoutDelivery) {
        checkoutDelivery.textContent =
            delivery === 0
                ? "FREE"
                : formatCurrency(delivery);
    }

    if (checkoutTotal) {
        checkoutTotal.textContent =
            formatCurrency(total);
    }

    const checkoutItems =
        document.getElementById("checkoutItems");

    if (!checkoutItems) return;

    checkoutItems.innerHTML = cart.map(item => {
        const product = getCartItemProduct(item);

        if (!product) return "";

        const quantity =
            numberValue(item.quantity, 1);

        const price =
            numberValue(item.price || product.price);

        return `
            <div class="order-item">

                <div class="order-item-image">
                    ${
                        getProductImage(product)
                            ? `
                                <img
                                    src="${escapeHTML(
                                        getProductImage(product)
                                    )}"
                                    alt="${escapeHTML(
                                        product.name
                                    )}">
                              `
                            : `
                                <div class="product-image-placeholder">
                                    No Image
                                </div>
                              `
                    }
                </div>

                <div class="order-item-info">

                    <strong>
                        ${escapeHTML(product.name)}
                    </strong>

                    <span>
                        Qty: ${quantity}
                    </span>

                    ${
                        item.size
                            ? `<span>Size: ${escapeHTML(item.size)}</span>`
                            : ""
                    }

                    ${
                        item.color
                            ? `<span>Color: ${escapeHTML(item.color)}</span>`
                            : ""
                    }

                </div>

                <strong>
                    ${formatCurrency(price * quantity)}
                </strong>

            </div>
        `;
    }).join("");
}


/* =========================================================
   PAYMENT METHOD
   ========================================================= */

function getSelectedPaymentMethod() {
    const selected = document.querySelector(
        'input[name="paymentMethod"]:checked'
    );

    if (!selected) {
        return "COD";
    }

    return String(selected.value || "COD")
        .toUpperCase();
}


/* =========================================================
   CHECK PAYMENT OPTIONS
   ========================================================= */

function updatePaymentOptions() {
    const codEnabled =
        settings.codEnabled !== false;

    const upiEnabled =
        settings.upiEnabled === true;

    const codInput = document.querySelector(
        'input[name="paymentMethod"][value="COD"]'
    );

    const upiInput = document.querySelector(
        'input[name="paymentMethod"][value="UPI"]'
    );

    if (codInput) {
        codInput.disabled = !codEnabled;

        if (!codEnabled && codInput.checked) {
            codInput.checked = false;
        }
    }

    if (upiInput) {
        upiInput.disabled = !upiEnabled;

        if (!upiEnabled && upiInput.checked) {
            upiInput.checked = false;
        }
    }

    const firstAvailable =
        document.querySelector(
            'input[name="paymentMethod"]:not(:disabled)'
        );

    if (
        firstAvailable &&
        !document.querySelector(
            'input[name="paymentMethod"]:checked'
        )
    ) {
        firstAvailable.checked = true;
    }
}


/* =========================================================
   CHECKOUT FORM SUBMIT
   ========================================================= */
async function handleCheckoutSubmit(event) {
    event.preventDefault();

    if (!cart.length) {
        showToast(
            "Your cart is empty.",
            "warning"
        );

        closeModal("checkoutModal");
        return;
    }

    const customer = getCurrentCustomer();

    if (!customer) {
        closeModal("checkoutModal");
        showCustomerLogin();
        return;
    }

    const name =
        document.getElementById("checkoutName")?.value.trim() || "";

    const mobile =
        document.getElementById("checkoutMobile")?.value
            .replace(/\D/g, "") || "";

    const address =
        document.getElementById("checkoutAddress")?.value.trim() || "";

    const landmark =
        document.getElementById("checkoutLandmark")?.value.trim() || "";

    const city =
        document.getElementById("checkoutCity")?.value.trim() || "";

    const state =
        document.getElementById("checkoutState")?.value.trim() || "";

    const pincode =
        document.getElementById("checkoutPincode")?.value
            .replace(/\D/g, "") || "";

    const paymentMethod =
        getSelectedPaymentMethod();

    if (!name) {
        showToast("Please enter your name.", "warning");
        return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
        showToast(
            "Please enter a valid mobile number.",
            "warning"
        );
        return;
    }

    if (!address) {
        showToast(
            "Please enter your complete address.",
            "warning"
        );
        return;
    }

    if (!city) {
        showToast(
            "Please enter your city.",
            "warning"
        );
        return;
    }

    if (!state) {
        showToast(
            "Please enter your state.",
            "warning"
        );
        return;
    }

    if (!/^\d{6}$/.test(pincode)) {
        showToast(
            "Please enter a valid 6-digit pincode.",
            "warning"
        );
        return;
    }

    if (
        paymentMethod === "COD" &&
        settings.codEnabled === false
    ) {
        showToast(
            "Cash on Delivery is currently disabled.",
            "warning"
        );
        return;
    }

    if (
        paymentMethod === "UPI" &&
        settings.upiEnabled !== true
    ) {
        showToast(
            "UPI is currently disabled.",
            "warning"
        );
        return;
    }

    /* -----------------------------------------------------
       CHECK STOCK BEFORE ORDER
       ----------------------------------------------------- */

    for (const item of cart) {
        const product =
            getCartItemProduct(item);

        if (!product) {
            showToast(
                "One product is no longer available.",
                "error"
            );
            return;
        }

        const requested =
            numberValue(item.quantity, 1);

        const stock =
            numberValue(product.stock, 0);

        if (stock < requested) {
            showToast(
                `${product.name} has only ${stock} item(s) left.`,
                "warning"
            );
            return;
        }

        if (stock <= 0) {
            showToast(
                `${product.name} is out of stock.`,
                "warning"
            );
            return;
        }
    }

    const deliveryAddress = {
        address,
        landmark,
        city,
        state,
        pincode,
        fullAddress: [
            address,
            landmark,
            city,
            state,
            pincode
        ]
            .filter(Boolean)
            .join(", ")
    };

    const subtotal =
        getCartSubtotal();

    const deliveryCharge =
        getDeliveryCharge(subtotal);

    const total =
        subtotal + deliveryCharge;

    const orderId =
        generateOrderId();

    const orderItems =
        cart.map(item => {
            const product =
                getCartItemProduct(item);

            const quantity =
                numberValue(item.quantity, 1);

            const price =
                numberValue(
                    item.price || product.price
                );

            return {
                productId: product.id,
                sku: product.sku || "",
                name: product.name,
                image: getProductImage(product),
                price,
                quantity,
                size: item.size || "",
                color: item.color || "",
                lineTotal: price * quantity
            };
        });

    const now =
        new Date().toISOString();

    const order = {
        id: orderId,
        orderId,

        customerId:
            customer.id,

        customerName:
            name,

        customerMobile:
            mobile,

        customer: {
            id: customer.id,
            name,
            mobile,
            email: customer.email || ""
        },

        address: deliveryAddress,

        items: orderItems,

        subtotal,

        deliveryCharge,

        total,

        paymentMethod,

        paymentStatus:
            paymentMethod === "COD"
                ? "Pending"
                : "Pending",

        status: "Pending",

        createdAt: now,
        updatedAt: now,

        notes: "",

        cancellationReason: ""
    };

    orders.unshift(order);

    /* -----------------------------------------------------
       UPDATE PRODUCT STOCK
       ----------------------------------------------------- */

    orderItems.forEach(orderItem => {
        const product =
            products.find(
                item =>
                    item.id === orderItem.productId
            );

        if (!product) return;

        product.stock =
            Math.max(
                0,
                numberValue(product.stock, 0) -
                numberValue(orderItem.quantity, 1)
            );

        product.updatedAt = now;
    });

    /* -----------------------------------------------------
       UPDATE CUSTOMER
       ----------------------------------------------------- */

    customer.name = name;
    customer.mobile = mobile;
    customer.address = address;

    customer.ordersCount =
        numberValue(customer.ordersCount, 0) + 1;

    customer.totalSpent =
        numberValue(customer.totalSpent, 0) + total;

    customer.updatedAt = now;

    currentCustomer = customer;

    /* -----------------------------------------------------
       SAVE EVERYTHING
       ----------------------------------------------------- */

    saveProducts();
    saveOrders();
    saveCustomers();
    saveCurrentCustomer();

    cart = [];

    saveCart();

    updateCartBadge();

    closeModal("checkoutModal");

    renderProducts();

    showOrderSuccess(order);

    showToast(
        `Order ${orderId} placed successfully!`,
        "success"
    );
}


/* =========================================================
   ORDER SUCCESS
   ========================================================= */

function showOrderSuccess(order) {
    const message =
        `Order ${order.orderId} has been placed successfully.`;

    openAccountOrders();
}


/* =========================================================
   CUSTOMER UI
   ========================================================= */

function updateCustomerUI() {
    const customer =
        getCurrentCustomer();

    document
        .querySelectorAll("[data-customer-name]")
        .forEach(element => {
            element.textContent =
                customer?.name || "Account";
        });

    document
        .querySelectorAll("[data-customer-mobile]")
        .forEach(element => {
            element.textContent =
                customer?.mobile || "";
        });

    const accountName =
        document.getElementById("accountName");

    if (accountName) {
        accountName.textContent =
            customer?.name || "Guest";
    }

    const accountMobile =
        document.getElementById("accountMobile");

    if (accountMobile) {
        accountMobile.textContent =
            customer?.mobile || "";
    }

    const loginButtons =
        document.querySelectorAll(
            ".customer-login-btn"
        );

    loginButtons.forEach(button => {
        button.textContent =
            customer
                ? "Account"
                : "Login";
    });
}


/* =========================================================
   CUSTOMER ACCOUNT
   ========================================================= */

function openAccount() {
    const customer =
        getCurrentCustomer();

    if (!customer) {
        showCustomerLogin();
        return;
    }

    renderAccount();

    openModal("accountModal");
}


/* =========================================================
   RENDER ACCOUNT
   ========================================================= */

function renderAccount() {
    const customer =
        getCurrentCustomer();

    if (!customer) return;

    const name =
        document.getElementById("accountName");

    const mobile =
        document.getElementById("accountMobile");


    if (name) {
        name.textContent =
            customer.name || "Customer";
    }

    if (mobile) {
        mobile.textContent =
            customer.mobile || "";
    }

    renderCustomerOrders();
}


/* =========================================================
   CUSTOMER ORDERS
   ========================================================= */

function getCustomerOrders() {
    const customer =
        getCurrentCustomer();

    if (!customer) return [];

    return orders
        .filter(order => {
            return (
                order.customerId === customer.id ||
                order.customerMobile === customer.mobile
            );
        })
        .sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );
}


/* =========================================================
   ORDER STATUS LABEL
   ========================================================= */

function getOrderStatusLabel(status) {
    const labels = {
        Pending: "Pending",
        Confirmed: "Confirmed",
        Packed: "Packed",
        Shipped: "Shipped",
        "Out for Delivery": "Out for Delivery",
        Delivered: "Delivered",
        Cancelled: "Cancelled"
    };

    return labels[status] || status || "Pending";
}


/* =========================================================
   ORDER STATUS CLASS
   ========================================================= */

function getOrderStatusClass(status) {
    return String(status || "Pending")
        .toLowerCase()
        .replace(/\s+/g, "-");
}


/* =========================================================
   CUSTOMER ORDER CARD
   ========================================================= */

function createCustomerOrderHTML(order) {
    const firstItem =
        order.items?.[0];

    const moreItems =
        Math.max(
            0,
            (order.items?.length || 0) - 1
        );

    const image =
        firstItem?.image || "";

    return `
        <div
            class="order-card"
            data-order-id="${escapeHTML(order.id)}">

            <div class="order-card-header">

                <div>
                    <div class="order-id">
                        ${escapeHTML(order.orderId || order.id)}
                    </div>

                    <div class="customer-sub">
                        ${formatDateTime(order.createdAt)}
                    </div>
                </div>

                <span
                    class="status-badge status-${escapeHTML(
                        getOrderStatusClass(order.status)
                    )}">
                    ${escapeHTML(
                        getOrderStatusLabel(order.status)
                    )}
                </span>

            </div>

            <div class="order-card-body">

                <div class="order-items">

                    <div class="order-item">

                        <div class="order-item-image">

                            ${
                                image
                                    ? `
                                        <img
                                            src="${escapeHTML(image)}"
                                            alt="${escapeHTML(
                                                firstItem?.name || "Product"
                                            )}">
                                      `
                                    : `
                                        <div class="product-image-placeholder">
                                            No Image
                                        </div>
                                      `
                            }

                        </div>

                        <div class="order-item-info">

                            <strong>
                                ${escapeHTML(
                                    firstItem?.name ||
                                    "Order"
                                )}
                            </strong>

                            <span>
                                Qty:
                                ${numberValue(
                                    firstItem?.quantity,
                                    1
                                )}
                            </span>

                            ${
                                moreItems
                                    ? `
                                        <span>
                                            + ${moreItems}
                                            more item(s)
                                        </span>
                                      `
                                    : ""
                            }

                        </div>

                        <strong>
                            ${formatCurrency(order.total)}
                        </strong>

                    </div>

                </div>

                <div class="order-card-footer">

                    <span>
                        Payment:
                        <strong>
                            ${escapeHTML(
                                order.paymentMethod
                            )}
                        </strong>
                    </span>

                    <button
                        type="button"
                        class="btn btn-secondary"
                        onclick="openCustomerOrderDetails('${escapeHTML(
                            order.id
                        )}')">
                        View Order
                    </button>

                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   RENDER CUSTOMER ORDERS
   ========================================================= */

function renderCustomerOrders() {
    const container =
        document.getElementById("customerOrdersList");

    if (!container) return;

    const customerOrders =
        getCustomerOrders();

    if (!customerOrders.length) {
        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-state-icon">
                    📦
                </div>

                <h3>No orders yet</h3>

                <p>
                    Your orders will appear here.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        customerOrders
            .map(createCustomerOrderHTML)
            .join("");
}


/* =========================================================
   OPEN CUSTOMER ORDER DETAILS
   ========================================================= */

function openCustomerOrderDetails(orderId) {
    const order =
        orders.find(
            item =>
                item.id === orderId ||
                item.orderId === orderId
        );

    if (!order) {
        showToast(
            "Order not found.",
            "error"
        );
        return;
    }

    renderCustomerOrderDetails(order);

    openModal("orderDetailsModal");
}


/* =========================================================
   RENDER ORDER DETAILS
   ========================================================= */

function renderCustomerOrderDetails(order) {
    const container =
        document.getElementById(
            "orderDetailsContent"
        );

    if (!container) return;

    const status =
        getOrderStatusLabel(order.status);

    const itemsHTML =
        (order.items || [])
            .map(item => {
                return `
                    <div class="order-item">

                        <div class="order-item-image">

                            ${
                                item.image
                                    ? `
                                        <img
                                            src="${escapeHTML(item.image)}"
                                            alt="${escapeHTML(item.name)}">
                                      `
                                    : `
                                        <div class="product-image-placeholder">
                                            No Image
                                        </div>
                                      `
                            }

                        </div>

                        <div class="order-item-info">

                            <strong>
                                ${escapeHTML(item.name)}
                            </strong>

                            <span>
                                Qty:
                                ${numberValue(item.quantity, 1)}
                            </span>

                            ${
                                item.size
                                    ? `
                                        <span>
                                            Size:
                                            ${escapeHTML(item.size)}
                                        </span>
                                      `
                                    : ""
                            }

                            ${
                                item.color
                                    ? `
                                        <span>
                                            Color:
                                            ${escapeHTML(item.color)}
                                        </span>
                                      `
                                    : ""
                            }

                        </div>

                        <strong>
                            ${formatCurrency(
                                numberValue(item.lineTotal, 0)
                            )}
                        </strong>

                    </div>
                `;
            })
            .join("");

    container.innerHTML = `

        <div class="order-summary-grid">

            <div class="order-summary-card">

                <span>Order ID</span>

                <strong>
                    ${escapeHTML(
                        order.orderId || order.id
                    )}
                </strong>

            </div>

            <div class="order-summary-card">

                <span>Date</span>

                <strong>
                    ${formatDateTime(order.createdAt)}
                </strong>

            </div>

            <div class="order-summary-card">

                <span>Status</span>

                <strong>
                    ${escapeHTML(status)}
                </strong>

            </div>

            <div class="order-summary-card">

                <span>Payment</span>

                <strong>
                    ${escapeHTML(
                        order.paymentMethod
                    )}
                </strong>

            </div>

        </div>


        <div class="dashboard-card">

            <div class="dashboard-card-header">
                <h3>Order Items</h3>
            </div>

            <div class="order-items">
                ${itemsHTML}
            </div>

        </div>


        <div class="dashboard-card">

            <div class="dashboard-card-header">
                <h3>Delivery Address</h3>
            </div>

            <p>
                ${escapeHTML(
                    order.customerName || ""
                )}
            </p>

            <p>
                ${escapeHTML(
                    order.customerMobile || ""
                )}
            </p>

            <p>
                ${escapeHTML(
                    order.address?.fullAddress || ""
                )}
            </p>

        </div>


        <div class="dashboard-card">

            <div class="dashboard-card-header">
                <h3>Order Total</h3>
            </div>

            <div class="cart-summary">

                <div class="cart-summary-row">
                    <span>Subtotal</span>
                    <strong>
                        ${formatCurrency(
                            order.subtotal
                        )}
                    </strong>
                </div>

                <div class="cart-summary-row">
                    <span>Delivery</span>
                    <strong>
                        ${
                            numberValue(
                                order.deliveryCharge,
                                0
                            ) === 0
                                ? "FREE"
                                : formatCurrency(
                                    order.deliveryCharge
                                )
                        }
                    </strong>
                </div>

                <div class="cart-summary-row cart-total">
                    <span>Total</span>
                    <strong>
                        ${formatCurrency(order.total)}
                    </strong>
                </div>

            </div>

        </div>


        <div class="order-tracker">

            ${renderOrderTracker(order.status)}

        </div>
    `;
}


/* =========================================================
   ORDER TRACKER
   ========================================================= */

function renderOrderTracker(currentStatus) {
    const steps = [
        "Pending",
        "Confirmed",
        "Packed",
        "Shipped",
        "Out for Delivery",
        "Delivered"
    ];

    if (currentStatus === "Cancelled") {
        return `
            <div class="tracker-step active">
                <div class="tracker-step-circle">×</div>
                <div class="tracker-step-label">
                    Cancelled
                </div>
            </div>
        `;
    }

    const currentIndex =
        steps.indexOf(currentStatus);

    return steps
        .map((step, index) => {

            const active =
                currentIndex >= index;

            return `
                <div class="tracker-step ${
                    active ? "active" : ""
                }">

                    <div class="tracker-step-circle">
                        ${
                            active
                                ? "✓"
                                : index + 1
                        }
                    </div>

                    <div class="tracker-step-label">
                        ${escapeHTML(step)}
                    </div>

                </div>

                ${
                    index < steps.length - 1
                        ? `
                            <div class="tracker-line ${
                                currentIndex > index
                                    ? "active"
                                    : ""
                            }"></div>
                          `
                        : ""
                }
            `;
        })
        .join("");
}


/* =========================================================
   ACCOUNT ORDERS OPEN
   ========================================================= */

function openAccountOrders() {
    const customer =
        getCurrentCustomer();

    if (!customer) {
        showCustomerLogin();
        return;
    }

    renderAccount();

    openModal("accountModal");
}


/* =========================================================
   ACCOUNT PROFILE
   ========================================================= */

function openAccountProfile() {
    const customer =
        getCurrentCustomer();

    if (!customer) {
        showCustomerLogin();
        return;
    }

    const nameInput =
        document.getElementById(
            "profileName"
        );

    const mobileInput =
        document.getElementById(
            "profileMobile"
        );

    const emailInput =
        document.getElementById(
            "profileEmail"
        );

    if (nameInput) {
        nameInput.value =
            customer.name || "";
    }

    if (mobileInput) {
        mobileInput.value =
            customer.mobile || "";
    }

    if (emailInput) {
        emailInput.value =
            customer.email || "";
    }

    openModal("profileModal");
}


/* =========================================================
   PROFILE UPDATE
   ========================================================= */

function handleProfileUpdate(event) {
    event.preventDefault();

    const customer =
        getCurrentCustomer();

    if (!customer) {
        showCustomerLogin();
        return;
    }

    const name =
        document.getElementById(
            "profileName"
        )?.value.trim() || "";

    const email =
        document.getElementById(
            "profileEmail"
        )?.value.trim() || "";

    if (!name) {
        showToast(
            "Name cannot be empty.",
            "warning"
        );
        return;
    }

    customer.name = name;
    customer.email = email;

    customer.updatedAt =
        new Date().toISOString();

    currentCustomer = customer;

    saveCustomers();
    saveCurrentCustomer();

    updateCustomerUI();
    renderAccount();

    closeModal("profileModal");

    showToast(
        "Profile updated successfully.",
        "success"
    );
}


/* =========================================================
   LOGOUT CUSTOMER
   ========================================================= */

function logoutCustomer() {
    currentCustomer = null;

    saveCurrentCustomer();

    closeAllModals();

    updateCustomerUI();

    showToast(
        "You have been logged out.",
        "success"
    );
}


/* =========================================================
   INVOICE HTML
   ========================================================= */

function createInvoiceHTML(order) {
    const storeName =
        settings.storeName || "Sale 11";

    const items =
        (order.items || [])
            .map(item => `
                <tr>

                    <td>
                        ${escapeHTML(item.name)}
                        ${
                            item.size || item.color
                                ? `
                                    <br>
                                    <small>
                                        ${
                                            item.size
                                                ? `Size: ${escapeHTML(item.size)}`
                                                : ""
                                        }
                                        ${
                                            item.size && item.color
                                                ? " • "
                                                : ""
                                        }
                                        ${
                                            item.color
                                                ? `Color: ${escapeHTML(item.color)}`
                                                : ""
                                        }
                                    </small>
                                  `
                                : ""
                        }
                    </td>

                    <td>
                        ${numberValue(item.quantity, 1)}
                    </td>

                    <td>
                        ${formatCurrency(item.price)}
                    </td>

                    <td>
                        ${formatCurrency(item.lineTotal)}
                    </td>

                </tr>
            `)
            .join("");

    return `
        <div class="invoice">

            <div class="invoice-header">

                <div>
                    <h2>
                        ${escapeHTML(storeName)}
                    </h2>

                    <p>
                        Order Invoice
                    </p>
                </div>

                <div>
                    <strong>
                        ${escapeHTML(
                            order.orderId || order.id
                        )}
                    </strong>

                    <p>
                        ${formatDateTime(order.createdAt)}
                    </p>
                </div>

            </div>


            <div class="invoice-meta">

                <div>
                    <strong>Customer</strong>

                    <p>
                        ${escapeHTML(
                            order.customerName || ""
                        )}
                    </p>

                    <p>
                        ${escapeHTML(
                            order.customerMobile || ""
                        )}
                    </p>
                </div>

                <div>
                    <strong>Delivery Address</strong>

                    <p>
                        ${escapeHTML(
                            order.address?.fullAddress || ""
                        )}
                    </p>
                </div>

            </div>


            <table class="invoice-table">

                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>
                    ${items}
                </tbody>

            </table>


            <div class="invoice-total">

                <div>
                    <span>Subtotal</span>
                    <strong>
                        ${formatCurrency(order.subtotal)}
                    </strong>
                </div>

                <div>
                    <span>Delivery</span>
                    <strong>
                        ${
                            numberValue(
                                order.deliveryCharge,
                                0
                            ) === 0
                                ? "FREE"
                                : formatCurrency(
                                    order.deliveryCharge
                                )
                        }
                    </strong>
                </div>

                <div>
                    <span>Total</span>
                    <strong>
                        ${formatCurrency(order.total)}
                    </strong>
                </div>

            </div>


            <div class="invoice-footer">

                <p>
                    Payment Method:
                    <strong>
                        ${escapeHTML(
                            order.paymentMethod
                        )}
                    </strong>
                </p>

                <p>
                    Order Status:
                    <strong>
                        ${escapeHTML(
                            getOrderStatusLabel(
                                order.status
                            )
                        )}
                    </strong>
                </p>

            </div>

        </div>
    `;
}


/* =========================================================
   OPEN INVOICE
   ========================================================= */

function openOrderInvoice(orderId) {
    const order =
        orders.find(
            item =>
                item.id === orderId ||
                item.orderId === orderId
        );

    if (!order) {
        showToast(
            "Order not found.",
            "error"
        );
        return;
    }

    const container =
        document.getElementById(
            "invoiceContent"
        );

    if (!container) {
        showToast(
            "Invoice section is unavailable.",
            "error"
        );
        return;
    }

    container.innerHTML =
        createInvoiceHTML(order);

    openModal("invoiceModal");
}


/* =========================================================
   PRINT INVOICE
   ========================================================= */

function printInvoice() {
    const invoice =
        document.getElementById(
            "invoiceContent"
        );

    if (!invoice) return;

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );

    if (!printWindow) {
        showToast(
            "Please allow popups to print invoice.",
            "warning"
        );
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>

            <title>Sale 11 Invoice</title>

            <style>

                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    color: #111;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 25px;
                }

                th,
                td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }

                .invoice-header,
                .invoice-meta,
                .invoice-total {
                    display: flex;
                    justify-content: space-between;
                    gap: 30px;
                    margin-bottom: 25px;
                }

                .invoice-total {
                    flex-direction: column;
                    align-items: flex-end;
                }

                img {
                    max-width: 80px;
                }

            </style>

        </head>

        <body>

            ${invoice.innerHTML}

            <script>
                window.onload = function () {
                    window.print();
                };
            <\/script>

        </body>
        </html>
    `);

    printWindow.document.close();
}


/* =========================================================
   CHECKOUT BUTTON BINDING
   ========================================================= */

function bindCheckoutButtons() {

    const checkoutForm =
        document.getElementById(
            "checkoutForm"
        );

    if (checkoutForm) {
        checkoutForm.addEventListener(
            "submit",
            handleCheckoutSubmit
        );
    }

    document
        .querySelectorAll(
            "[data-action='checkout']"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                proceedToCheckout
            );
        });
}


/* =========================================================
   CUSTOMER EVENT BINDING
   ========================================================= */

function bindCustomerEvents() {

    const customerLoginForm =
        document.getElementById(
            "customerLoginForm"
        );

    if (customerLoginForm) {
        customerLoginForm.addEventListener(
            "submit",
            handleCustomerLogin
        );
    }

    const profileForm =
        document.getElementById(
            "customerProfileForm"
        );

    if (profileForm) {
        profileForm.addEventListener(
            "submit",
            handleProfileUpdate
        );
    }

    document
        .querySelectorAll(
            ".customer-login-btn"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                showCustomerLogin
            );
        });

    document
        .querySelectorAll(
            ".account-btn"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                openAccount
            );
        });
}


/* =========================================================
   PAYMENT EVENT BINDING
   ========================================================= */

function bindPaymentEvents() {

    document
        .querySelectorAll(
            'input[name="paymentMethod"]'
        )
        .forEach(input => {
            input.addEventListener(
                "change",
                () => {
                    updatePaymentOptions();
                }
            );
        });

    updatePaymentOptions();
}


/* =========================================================
   CART HEADER BUTTONS
   ========================================================= */

function bindCartButtons() {

    document
        .querySelectorAll(
            ".cart-btn, [data-action='cart']"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                openCart
            );

        });
}


/* =========================================================
   MODAL CLOSE EVENTS
   ========================================================= */

function bindModalEvents() {

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const modalId =
                        button.dataset.closeModal;

                    if (modalId) {
                        closeModal(modalId);
                    } else {
                        closeAllModals();
                    }

                }
            );

        });

    document
        .querySelectorAll(".modal-backdrop")
        .forEach(backdrop => {

            backdrop.addEventListener(
                "click",
                event => {

                    if (
                        event.target !== backdrop
                    ) {
                        return;
                    }

                    const modal =
                        backdrop.closest(".modal");

                    if (modal) {
                        closeModal(modal.id);
                    }

                }
            );

        });

    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            closeAllModals();

        }
    );
}


/* =========================================================
   STORAGE SYNC
   ========================================================= */

function refreshApplicationFromStorage() {

    products =
        loadProducts();

    orders =
        loadOrders();

    customers =
        loadCustomers();

    categories =
        loadCategories();

    settings =
        loadSettings();

    cart =
        loadCart();

    wishlist =
        loadWishlist();

    currentCustomer =
        loadCurrentCustomer();

    updateCartBadge();
    updateWishlistCount();
    updateCustomerUI();
    updatePaymentOptions();

    renderProducts();
}


/* =========================================================
   CROSS-TAB STORAGE UPDATE
   ========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (!event.key) return;

        const importantKeys = [
            KEYS.products,
            KEYS.orders,
            KEYS.customers,
            KEYS.categories,
            KEYS.settings,
            KEYS.cart,
            KEYS.wishlist,
            KEYS.currentUser
        ];

        if (
            importantKeys.includes(event.key)
        ) {
            refreshApplicationFromStorage();
        }
    }
);


/* =========================================================
   PART 3 INITIALIZATION
   ========================================================= */

function initializePart3() {

    bindCheckoutButtons();

    bindCustomerEvents();

    bindPaymentEvents();

    bindCartButtons();

    bindModalEvents();

    updateCustomerUI();

    updatePaymentOptions();

    updateCartBadge();

    updateWishlistCount();
}


/* =========================================================
   RUN PART 3
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePart3,
        { once: true }
    );

} else {

    initializePart3();

}


/* =========================================================
   PART 3 END
   ========================================================= */
   /* =========================================================
   SALE 11
   APP.JS — PART 4 / 5
   ADMIN LOGIN + ADMIN DASHBOARD + PRODUCTS + ORDERS
   ========================================================= */


/* =========================================================
   ADMIN LOGIN
   ========================================================= */

function showAdminLogin() {
    const mobileInput =
        document.getElementById("adminMobile");

    const passwordInput =
        document.getElementById("adminPassword");

    if (mobileInput) {
        mobileInput.value = "";
    }

    if (passwordInput) {
        passwordInput.value = "";
    }

    openModal("adminLoginModal");
}


/* =========================================================
   ADMIN LOGIN SUBMIT
   ========================================================= */

function handleAdminLogin(event) {
    event.preventDefault();

    const mobile =
        String(
            document.getElementById(
                "adminMobile"
            )?.value || ""
        ).trim();

    const password =
        String(
            document.getElementById(
                "adminPassword"
            )?.value || ""
        );

    if (!mobile) {
        showToast(
            "Please enter admin mobile number.",
            "warning"
        );
        return;
    }

    if (!password) {
        showToast(
            "Please enter admin password.",
            "warning"
        );
        return;
    }

    /*
       IMPORTANT:
       ADMIN_CONFIG is defined in PART 1.
       Replace YOUR_ADMIN_MOBILE and
       YOUR_ADMIN_PASSWORD there with your own details.
    */

    if (
        mobile !== ADMIN_CONFIG.mobile ||
        password !== ADMIN_CONFIG.password
    ) {
        showToast(
            "Invalid admin mobile number or password.",
            "error"
        );

        return;
    }

    adminAuth = {
        loggedIn: true,
        mobile,
        loginAt: new Date().toISOString()
    };

    saveAdminAuth();

    closeModal("adminLoginModal");

    showAdminDashboard();

    showToast(
        "Admin login successful.",
        "success"
    );
}


/* =========================================================
   ADMIN AUTH CHECK
   ========================================================= */

function isAdminLoggedIn() {
    return Boolean(
        adminAuth &&
        adminAuth.loggedIn === true &&
        adminAuth.mobile === ADMIN_CONFIG.mobile
    );
}


/* =========================================================
   OPEN ADMIN DASHBOARD
   ========================================================= */

function showAdminDashboard() {

    if (!isAdminLoggedIn()) {
        showAdminLogin();
        return;
    }

    const storeView =
        document.getElementById(
            "customerStoreView"
        );

    const adminView =
        document.getElementById(
            "adminDashboardView"
        );

    if (storeView) {
        storeView.style.display = "none";
    }

    if (adminView) {
        adminView.style.display = "block";
    }

    renderAdminDashboard();

    showAdminTab("dashboard");
}


/* =========================================================
   RETURN TO STORE
   ========================================================= */

function showCustomerStore() {

    const storeView =
        document.getElementById(
            "customerStoreView"
        );

    const adminView =
        document.getElementById(
            "adminDashboardView"
        );

    if (adminView) {
        adminView.style.display = "none";
    }

    if (storeView) {
        storeView.style.display = "";
    }

    renderProducts();
}


/* =========================================================
   ADMIN LOGOUT
   ========================================================= */

function logoutAdmin() {

    adminAuth = {
        loggedIn: false,
        mobile: "",
        loginAt: ""
    };

    saveAdminAuth();

    showCustomerStore();

    showToast(
        "Admin logged out.",
        "success"
    );
}


/* =========================================================
   ADMIN TAB
   ========================================================= */

function showAdminTab(tabName) {

    if (!isAdminLoggedIn()) {
        showAdminLogin();
        return;
    }

    const tabMap = {
        dashboard: "adminTabDashboard",
        products: "adminTabProducts",
        orders: "adminTabOrders",
        customers: "adminTabCustomers",
        reports: "adminTabReports",
        categories: "adminTabCategories",
        settings: "adminTabSettings"
    };

    Object.values(tabMap).forEach(id => {
        const section =
            document.getElementById(id);

        if (section) {
            section.style.display = "none";
        }
    });

    const activeId =
        tabMap[tabName];

    const activeSection =
        document.getElementById(activeId);

    if (activeSection) {
        activeSection.style.display = "block";
    }

    document
        .querySelectorAll(".admin-tab")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.tab === tabName ||
                button.dataset.adminTab === tabName
            );

        });

    if (tabName === "dashboard") {
        renderAdminDashboard();
    }

    if (tabName === "products") {
        renderAdminProducts();
    }

    if (tabName === "orders") {
        renderAdminOrders();
    }

    if (tabName === "customers") {
        renderAdminCustomers();
    }

    if (tabName === "reports") {
        renderAdminReports();
    }

    if (tabName === "categories") {
        renderAdminCategories();
    }

    if (tabName === "settings") {
        renderAdminSettings();
    }
}


/* =========================================================
   DATE HELPERS FOR ADMIN
   ========================================================= */

function getStartOfDay(date = new Date()) {
    const value = new Date(date);

    value.setHours(
        0,
        0,
        0,
        0
    );

    return value;
}


function getStartOfDaysAgo(days) {
    const date =
        getStartOfDay();

    date.setDate(
        date.getDate() - days
    );

    return date;
}


function isOrderWithinPeriod(order, period) {

    const created =
        new Date(order.createdAt);

    if (Number.isNaN(created.getTime())) {
        return false;
    }

    const now =
        new Date();

    if (period === "today") {
        return created >= getStartOfDay(now);
    }

    if (period === "7days") {
        return created >= getStartOfDaysAgo(7);
    }

    if (period === "30days") {
        return created >= getStartOfDaysAgo(30);
    }

    return true;
}


/* =========================================================
   ADMIN ORDER FILTER
   ========================================================= */

// Dashboard period is stored in currentDashboardPeriod (defined in PART 1).


function getOrdersForPeriod(period) {

    return orders.filter(order => {
        return isOrderWithinPeriod(
            order,
            period
        );
    });
}


/* =========================================================
   ADMIN DASHBOARD STATS
   ========================================================= */

function calculateDashboardStats(
    period = "all"
) {

    const periodOrders =
        getOrdersForPeriod(period);

    const validOrders =
        periodOrders.filter(
            order =>
                order.status !== "Cancelled"
        );

    const revenue =
        validOrders.reduce(
            (sum, order) =>
                sum +
                numberValue(
                    order.total,
                    0
                ),
            0
        );

    const pending =
        periodOrders.filter(
            order =>
                order.status === "Pending"
        ).length;

    const delivered =
        periodOrders.filter(
            order =>
                order.status === "Delivered"
        ).length;

    const cancelled =
        periodOrders.filter(
            order =>
                order.status === "Cancelled"
        ).length;

    const confirmed =
        periodOrders.filter(
            order =>
                order.status === "Confirmed"
        ).length;

    const packed =
        periodOrders.filter(
            order =>
                order.status === "Packed"
        ).length;

    const shipped =
        periodOrders.filter(
            order =>
                order.status === "Shipped"
        ).length;

    const outForDelivery =
        periodOrders.filter(
            order =>
                order.status === "Out for Delivery"
        ).length;

    return {
        revenue,
        orders: periodOrders.length,
        pending,
        delivered,
        cancelled,
        confirmed,
        packed,
        shipped,
        outForDelivery,
        products: products.length,
        customers: customers.length
    };
}


/* =========================================================
   UPDATE ELEMENT TEXT
   ========================================================= */

function setAdminText(
    ids,
    value
) {

    const list =
        Array.isArray(ids)
            ? ids
            : [ids];

    list.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    });
}


/* =========================================================
   RENDER ADMIN DASHBOARD
   ========================================================= */

function renderAdminDashboard() {

    if (!isAdminLoggedIn()) {
        return;
    }

    const period =
        getAdminPeriod();

    const stats =
        calculateDashboardStats(
            period
        );

    setAdminText(
        [
            "statRevenue",
            "dashboardRevenue",
            "totalRevenue"
        ],
        formatCurrency(stats.revenue)
    );

    setAdminText(
        [
            "statOrders",
            "dashboardOrders",
            "totalOrders"
        ],
        stats.orders
    );

    setAdminText(
        [
            "statProducts",
            "statProds",
            "dashboardProducts",
            "totalProducts"
        ],
        stats.products
    );

    setAdminText(
        [
            "statCustomers",
            "statCusts",
            "dashboardCustomers",
            "totalCustomers"
        ],
        stats.customers
    );

    setAdminText(
        [
            "statPending",
            "pendingOrders",
            "dashboardPending"
        ],
        stats.pending
    );

    setAdminText(
        [
            "statDelivered",
            "deliveredOrders",
            "dashboardDelivered"
        ],
        stats.delivered
    );

    setAdminText(
        [
            "statCancelled",
            "cancelledOrders",
            "dashboardCancelled"
        ],
        stats.cancelled
    );

    setAdminText(
        "statConfirmed",
        stats.confirmed
    );

    setAdminText(
        "statPacked",
        stats.packed
    );

    setAdminText(
        "statShipped",
        stats.shipped
    );

    setAdminText(
        "statOutForDelivery",
        stats.outForDelivery
    );

    renderDashboardStatusSummary(
        stats
    );

    renderRecentOrders();
}


/* =========================================================
   STATUS SUMMARY
   ========================================================= */

function renderDashboardStatusSummary(stats) {

    const container =
        document.getElementById(
            "statusSummary"
        );

    if (!container) return;

    const items = [
        ["Pending", stats.pending],
        ["Confirmed", stats.confirmed],
        ["Packed", stats.packed],
        ["Shipped", stats.shipped],
        ["Out for Delivery", stats.outForDelivery],
        ["Delivered", stats.delivered],
        ["Cancelled", stats.cancelled]
    ];

    container.innerHTML =
        items.map(item => `
            <div class="status-item">

                <span class="status-item-label">
                    ${escapeHTML(item[0])}
                </span>

                <strong class="status-item-value">
                    ${item[1]}
                </strong>

            </div>
        `).join("");
}


/* =========================================================
   RECENT ORDERS
   ========================================================= */

function renderRecentOrders() {

    const container =
        document.getElementById(
            "dashboardOrdersTable"
        );

    if (!container) return;

    const recent =
        [...orders]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 10);

    if (!recent.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No orders yet</h3>
                <p>
                    New customer orders will appear here.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML =
        recent.map(order => `
            <div class="order-summary-card">

                <div>
                    <strong>
                        ${escapeHTML(
                            order.orderId || order.id
                        )}
                    </strong>

                    <div class="customer-sub">
                        ${escapeHTML(
                            order.customerName || "Customer"
                        )}
                    </div>
                </div>

                <div>
                    <strong>
                        ${formatCurrency(
                            order.total
                        )}
                    </strong>

                    <div>
                        <span class="status-badge status-${escapeHTML(
                            getOrderStatusClass(
                                order.status
                            )
                        )}">
                            ${escapeHTML(
                                getOrderStatusLabel(
                                    order.status
                                )
                            )}
                        </span>
                    </div>
                </div>

            </div>
        `).join("");
}


/* =========================================================
   PRODUCT FORM RESET
   ========================================================= */

function resetProductForm() {

    const form =
        document.getElementById(
            "productForm"
        );

    if (form) {
        form.reset();
    }

    const idInput =
        document.getElementById(
            "productId"
        );

    if (idInput) {
        idInput.value = "";
    }

    const preview =
        document.getElementById(
            "productImagePreview"
        );

    if (preview) {
        preview.innerHTML = "";
    }

    const formTitle =
        document.getElementById(
            "productModalTitle"
        );

    if (formTitle) {
        formTitle.textContent =
            "Add Product";
    }

    const imageInput =
        document.getElementById(
            "productImages"
        );

    if (imageInput) {
        imageInput.value = "";
    }

    window.adminProductImages = [];
}


/* =========================================================
   OPEN ADD PRODUCT
   ========================================================= */

function openAddProduct() {

    if (!isAdminLoggedIn()) {
        showAdminLogin();
        return;
    }

    resetProductForm();

    populateProductCategoryOptions();

    openModal("productFormModal");
}


/* =========================================================
   CATEGORY OPTIONS
   ========================================================= */

function populateProductCategoryOptions() {

    const select =
        document.getElementById(
            "productCategory"
        );

    if (!select) return;

    const current =
        select.value;

    select.innerHTML =
        categories.map(category => `
            <option value="${escapeHTML(category)}">
                ${escapeHTML(category)}
            </option>
        `).join("");

    if (current) {
        select.value = current;
    }
}


/* =========================================================
   PARSE LIST INPUT
   ========================================================= */

function parseListInput(value) {

    if (Array.isArray(value)) {
        return value
            .map(item => String(item).trim())
            .filter(Boolean);
    }

    return String(value || "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
}


/* =========================================================
   GET PRODUCT FORM DATA
   ========================================================= */

function getProductFormData() {

    const name =
        document.getElementById(
            "productName"
        )?.value.trim() || "";

    const sku =
        document.getElementById(
            "productId"
        )?.value.trim() || "";

    const category =
        document.getElementById(
            "productCategory"
        )?.value || "";

    const description =
        document.getElementById(
            "productDescription"
        )?.value.trim() || "";

    const details =
        document.getElementById(
            "productDetails"
        )?.value.trim() || "";

    const features =
        document.getElementById(
            "productFeatures"
        )?.value || "";

    const price =
        numberValue(
            document.getElementById(
                "productPrice"
            )?.value,
            0
        );

    const mrp =
        numberValue(
            document.getElementById(
                "productMrp"
            )?.value,
            0
        );

    const costPrice =
        numberValue(
            document.getElementById(
                "productCost"
            )?.value ||
            document.getElementById(
                "productResellPrice"
            )?.value,
            0
        );

    const stock =
        Math.max(
            0,
            numberValue(
                document.getElementById(
                    "productStock"
                )?.value,
                0
            )
        );

    const sizes =
        parseListInput(
            document.getElementById(
                "productSizes"
            )?.value
        );

    const colors =
        parseListInput(
            document.getElementById(
                "productColors"
            )?.value
        );

    const activeInput =
        document.getElementById(
            "productActive"
        );

    const active =
        activeInput
            ? activeInput.checked
            : true;

    return {
        name,
        sku,
        category,
        description,
        details,
        features,
        price,
        mrp,
        costPrice,
        stock,
        sizes,
        colors,
        active
    };
}


/* =========================================================
   CALCULATE DISCOUNT
   ========================================================= */

function calculateProductDiscount(
    price,
    mrp
) {

    if (
        mrp <= 0 ||
        price <= 0 ||
        price >= mrp
    ) {
        return 0;
    }

    return Math.round(
        ((mrp - price) / mrp) * 100
    );
}


/* =========================================================
   SAVE PRODUCT
   ========================================================= */

async function handleProductFormSubmit(event) {

    event.preventDefault();

    if (!isAdminLoggedIn()) {
        showAdminLogin();
        return;
    }

    const data =
        getProductFormData();

    if (!data.name) {
        showToast(
            "Product name is required.",
            "warning"
        );
        return;
    }

    if (!data.category) {
        showToast(
            "Please select a category.",
            "warning"
        );
        return;
    }

    if (data.price <= 0) {
        showToast(
            "Selling price must be greater than 0.",
            "warning"
        );
        return;
    }

    if (data.mrp > 0 && data.mrp < data.price) {
        showToast(
            "MRP cannot be lower than selling price.",
            "warning"
        );
        return;
    }

    const productId =
        document.getElementById(
            "productId"
        )?.value.trim() || "";

    const now =
        new Date().toISOString();

    let existing =
        productId
            ? products.find(
                product =>
                    product.id === productId
            )
            : null;

    let images =
        Array.isArray(
            window.adminProductImages
        )
            ? [...window.adminProductImages]
            : [];

    /*
       Keep old images while editing
       if no new images were selected.
    */

    if (
        existing &&
        !images.length &&
        Array.isArray(existing.images)
    ) {
        images = [...existing.images];
    }

    images =
        images
            .filter(isValidImageData)
            .slice(0, 6);

    const product = normalizeProduct({
        id:
            existing?.id ||
            generateId("PRD"),

        name: data.name,

        sku:
            data.sku ||
            existing?.sku ||
            `SKU-${Date.now()}`,

        category: data.category,

        description: data.description,

        details: data.details,

        features: data.features,

        price: data.price,

        mrp: data.mrp,

        discount:
            calculateProductDiscount(
                data.price,
                data.mrp
            ),

        costPrice: data.costPrice,

        resellPrice: data.costPrice,

        stock: data.stock,

        sizes: data.sizes,

        colors: data.colors,

        images,

        active: data.active,

        createdAt:
            existing?.createdAt ||
            now,

        updatedAt: now
    });

    if (existing) {

        const index =
            products.findIndex(
                item =>
                    item.id === existing.id
            );

        if (index !== -1) {
            products[index] = product;
        }

        showToast(
            "Product updated successfully.",
            "success"
        );

    } else {

        products.unshift(product);

        showToast(
            "Product added successfully.",
            "success"
        );
    }

    saveProducts();

    resetProductForm();

    closeModal("productFormModal");

    renderAdminProducts();

    renderProducts();
}


/* =========================================================
EDIT PRODUCT
   ========================================================= */

function editProduct(productId) {

    if (!isAdminLoggedIn()) {
        showAdminLogin();
        return;
    }

    const product =
        products.find(
            item =>
                item.id === productId
        );

    if (!product) {
        showToast(
            "Product not found.",
            "error"
        );
        return;
    }

    populateProductCategoryOptions();

    const values = {
        productId: product.id,
        productName: product.name || "",
        productSku: product.sku || "",
        productCategory: product.category || "",
        productDescription: product.description || "",
        productDetails: product.details || "",
        productFeatures: Array.isArray(product.features)
            ? product.features.join(", ")
            : product.features || "",
        productPrice: product.price || "",
        productMrp: product.mrp || "",
        productCostPrice:
            product.costPrice ||
            product.resellPrice ||
            "",
        productStock: product.stock || 0,
        productSizes:
            Array.isArray(product.sizes)
                ? product.sizes.join(", ")
                : product.sizes || "",
        productColors:
            Array.isArray(product.colors)
                ? product.colors.join(", ")
                : product.colors || ""
    };

    Object.entries(values).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(id);

            if (element) {
                element.value = value;
            }

        }
    );

    const active =
        document.getElementById(
            "productActive"
        );

    if (active) {
        active.checked =
            product.active !== false;
    }

    window.adminProductImages =
        Array.isArray(product.images)
            ? [...product.images]
            : [];

    renderAdminProductImagePreviews();

    const formTitle =
        document.getElementById(
            "productModalTitle"
        );

    if (formTitle) {
        formTitle.textContent =
            "Edit Product";
    }

    openModal("productFormModal");
}


/* =========================================================
   DELETE PRODUCT
   ========================================================= */

function deleteProduct(productId) {

    if (!isAdminLoggedIn()) {
        showAdminLogin();
        return;
    }

    const product =
        products.find(
            item =>
                item.id === productId
        );

    if (!product) {
        showToast(
            "Product not found.",
            "error"
        );
        return;
    }

    confirmAction(
        `Delete "${product.name}"?`,
        () => {

            products =
                products.filter(
                    item =>
                        item.id !== productId
                );

            saveProducts();

            cart =
                cart.filter(
                    item =>
                        item.productId !== productId
                );

            wishlist =
                wishlist.filter(
                    id =>
                        id !== productId
                );

            saveCart();
            saveWishlist();

            updateCartBadge();
            updateWishlistCount();

            renderAdminProducts();
            renderProducts();

            showToast(
                "Product deleted.",
                "success"
            );
        }
    );
}


/* =========================================================
   IMAGE PREVIEW
   ========================================================= */

function renderAdminProductImagePreviews() {

    const container =
        document.getElementById(
            "productImagePreview"
        );

    if (!container) return;

    const images =
        Array.isArray(
            window.adminProductImages
        )
            ? window.adminProductImages
            : [];

    if (!images.length) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML =
        images.map(
            (image, index) => `
                <div class="image-preview-item">

                    <img
                        src="${escapeHTML(image)}"
                        alt="Product image ${index + 1}">

                    <button
                        type="button"
                        class="image-preview-remove"
                        data-image-index="${index}">
                        ×
                    </button>

                </div>
            `
        ).join("");

    container
        .querySelectorAll(
            ".image-preview-remove"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        numberValue(
                            button.dataset.imageIndex
                        );

                    window.adminProductImages
                        .splice(index, 1);

                    renderAdminProductImagePreviews();

                }
            );

        });
}


/* =========================================================
   PRODUCT IMAGE FILE SELECTION
   ========================================================= */

async function handleAdminProductImages(
    event
) {

    if (!isAdminLoggedIn()) {
        showAdminLogin();
        return;
    }

    const files =
        Array.from(
            event.target.files || []
        );

    if (!files.length) {
        return;
    }

    const existing =
        Array.isArray(
            window.adminProductImages
        )
            ? window.adminProductImages
            : [];

    if (
        existing.length + files.length > 6
    ) {
        showToast(
            "Maximum 6 images allowed per product.",
            "warning"
        );
    }

    const remaining =
        Math.max(
            0,
            6 - existing.length
        );

    const selected =
        files.slice(
            0,
            remaining
        );

    for (const file of selected) {

        if (
            !isValidImageFile(file)
        ) {
            showToast(
                `${file.name} is not a valid image or is larger than 5 MB.`,
                "warning"
            );

            continue;
        }

        try {

            const data =
                await readImageAsDataURL(
                    file
                );

            if (
                isValidImageData(data)
            ) {
                existing.push(data);
            }

        } catch (error) {

            showToast(
                `Could not read ${file.name}.`,
                "error"
            );
        }
    }

    window.adminProductImages =
        existing.slice(0, 6);

    renderAdminProductImagePreviews();

    event.target.value = "";
}


/* =========================================================
   ADMIN PRODUCT TABLE
   ========================================================= */

function renderAdminProducts() {

    const container =
        document.getElementById(
            "adminProductsTable"
        ) ||
        document.getElementById(
            "adminProductsTable"
        );

    if (!container) return;

    const pageSize = 10;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                products.length /
                pageSize
            )
        );

    adminProductPage =
        Math.min(
            adminProductPage,
            totalPages
        );

    const start =
        (adminProductPage - 1) *
        pageSize;

    const pageProducts =
        products.slice(
            start,
            start + pageSize
        );

    if (!pageProducts.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No products found</h3>
                <p>
                    Add your first product.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="table-wrapper">

            <table class="admin-table">

                <thead>

                    <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>

                    ${pageProducts.map(product => {

                        const image =
                            getProductImage(product);

                        const stock =
                            numberValue(
                                product.stock,
                                0
                            );

                        return `
                            <tr>

                                <td>

                                    <div class="table-product">

                                        <div class="table-product-image">

                                            ${
                                                image
                                                    ? `
                                                        <img
                                                            src="${escapeHTML(image)}"
                                                            alt="${escapeHTML(product.name)}">
                                                      `
                                                    : `
                                                        <div class="product-image-placeholder">
                                                            No Image
                                                        </div>
                                                      `
                                            }

                                        </div>

                                        <div class="table-product-info">

                                            <strong>
                                                ${escapeHTML(
                                                    product.name
                                                )}
                                            </strong>

                                            <small>
                                                ${
                                                    product.images?.length || 0
                                                }
                                                image(s)
                                            </small>

                                        </div>

                                    </div>

                                </td>

                                <td>
                                    ${escapeHTML(
                                        product.sku || "-"
                                    )}
                                </td>

                                <td>
                                    ${escapeHTML(
                                        product.category || "-"
                                    )}
                                </td>

                                <td>
                                    <strong>
                                        ${formatCurrency(
                                            product.price
                                        )}
                                    </strong>
                                </td>

                                <td>

                                    <span class="${
                                        stock <= 0
                                            ? "stock-out"
                                            : stock <= 5
                                                ? "stock-low"
                                                : "stock-text"
                                    }">

                                        ${stock}

                                    </span>

                                </td>

                                <td>

                                    <span class="status-badge">

                                        ${
                                            product.active === false
                                                ? "Inactive"
                                                : "Active"
                                        }

                                    </span>

                                </td>

                                <td>

                                    <div class="table-actions">

                                        <button
                                            type="button"
                                            class="table-action"
                                            onclick="editProduct('${escapeHTML(product.id)}')">
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            class="table-action"
                                            onclick="deleteProduct('${escapeHTML(product.id)}')">
                                            Delete
                                        </button>

                                    </div>

                                </td>

                            </tr>
                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>
    `;

    renderProductPagination(
        totalPages
    );
}


/* =========================================================
PRODUCT PAGINATION
   ========================================================= */

function renderProductPagination(
    totalPages
) {

    const container =
        document.getElementById(
            "productsPagination"
        );

    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = "";

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        html += `
            <button
                type="button"
                class="page-btn ${
                    page === adminProductPage
                        ? "active"
                        : ""
                }"
                data-product-page="${page}">
                ${page}
            </button>
        `;
    }

    container.innerHTML = html;

    container
        .querySelectorAll(
            "[data-product-page]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    adminProductPage =
                        numberValue(
                            button.dataset.productPage
                        );

                    renderAdminProducts();

                }
            );

        });
}


/* =========================================================
   ORDER ADMIN FILTER
   ========================================================= */

function getAdminOrderSearchValue() {

    const input =
        document.getElementById(
            "adminOrderSearch"
        ) ||
        document.getElementById(
            "adminOrderSearch"
        );

    return String(
        input?.value || ""
    )
        .trim()
        .toLowerCase();
}


function getAdminOrderStatusFilter() {

    const select =
        document.getElementById(
            "adminOrderStatusFilter"
        ) ||
        document.getElementById(
            "adminOrderStatusFilter"
        );

    return String(
        select?.value || ""
    );
}


/* =========================================================
   FILTER ADMIN ORDERS
   ========================================================= */

function getFilteredAdminOrders() {

    const search =
        getAdminOrderSearchValue();

    const status =
        getAdminOrderStatusFilter();

    return [...orders]
        .filter(order => {

            const matchesSearch =
                !search ||
                String(
                    order.orderId ||
                    order.id ||
                    ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    order.customerName ||
                    ""
                )
                    .toLowerCase()
                    .includes(search) ||
                String(
                    order.customerMobile ||
                    ""
                )
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                !status ||
                order.status === status;

            return (
                matchesSearch &&
                matchesStatus
            );
        })
        .sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );
}


/* =========================================================
   RENDER ADMIN ORDERS
   ========================================================= */

function renderAdminOrders() {

    const container =
        document.getElementById(
            "adminOrdersTable"
        ) ||
        document.getElementById(
            "adminOrdersTable"
        );

    if (!container) return;

    const filtered =
        getFilteredAdminOrders();

    const pageSize = 10;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                filtered.length /
                pageSize
            )
        );

    adminOrderPage =
        Math.min(
            adminOrderPage,
            totalPages
        );

    const start =
        (adminOrderPage - 1) *
        pageSize;

    const pageOrders =
        filtered.slice(
            start,
            start + pageSize
        );

    if (!pageOrders.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No orders found</h3>
                <p>
                    Try changing the search or filter.
                </p>
            </div>
        `;

        return;
    }

    container.innerHTML = `
        <div class="table-wrapper">

            <table class="admin-table">

                <thead>

                    <tr>
                        <th>Order</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>

                    ${pageOrders.map(order => `

                        <tr>

                            <td>

                                <strong>
                                    ${escapeHTML(
                                        order.orderId ||
                                        order.id
                                    )}
                                </strong>

                                <div class="customer-sub">
                                    ${
                                        order.items?.length || 0
                                    }
                                    item(s)
                                </div>

                            </td>

                            <td>

                                <strong>
                                    ${escapeHTML(
                                        order.customerName ||
                                        "Customer"
                                    )}
                                </strong>

                                <div class="customer-sub">
                                    ${escapeHTML(
                                        order.customerMobile ||
                                        ""
                                    )}
                                </div>

                            </td>

                            <td class="amount-cell">

                                <strong>
                                    ${formatCurrency(
                                        order.total
                                    )}
                                </strong>

                            </td>

                            <td>
                                ${escapeHTML(
                                    order.paymentMethod ||
                                    "-"
                                )}
                            </td>

                            <td>

                                <select
                                    class="admin-status-select"
                                    data-order-status-id="${escapeHTML(
                                        order.id
                                    )}">

                                    ${[
                                        "Pending",
                                        "Confirmed",
                                        "Packed",
                                        "Shipped",
                                        "Out for Delivery",
                                        "Delivered",
                                        "Cancelled"
                                    ].map(status => `
                                        <option
                                            value="${escapeHTML(status)}"
                                            ${
                                                order.status === status
                                                    ? "selected"
                                                    : ""
                                            }>
                                            ${escapeHTML(status)}
                                        </option>
                                    `).join("")}

                                </select>

                            </td>

                            <td>
                                ${formatDateTime(
                                    order.createdAt
                                )}
                            </td>

                            <td>

                                <div class="table-actions">

                                    <button
                                        type="button"
                                        class="table-action"
                                        onclick="openAdminOrderDetails('${escapeHTML(order.id)}')">
                                        View
                                    </button>

                                    <button
                                        type="button"
                                        class="table-action"
                                        onclick="openOrderInvoice('${escapeHTML(order.id)}')">
                                        Invoice
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `).join("")}

                </tbody>

            </table>

        </div>
    `;

    bindAdminOrderStatusEvents();

    renderOrderPagination(
        totalPages
    );
}


/* =========================================================
   ORDER STATUS UPDATE
   ========================================================= */

function updateOrderStatus(
    orderId,
    newStatus
) {

    if (!isAdminLoggedIn()) {
        showAdminLogin();
        return;
    }

    const order =
        orders.find(
            item =>
                item.id === orderId
        );

    if (!order) {
        showToast(
            "Order not found.",
            "error"
        );
        return;
    }

    order.status =
        newStatus;

    order.updatedAt =
        new Date().toISOString();

    if (newStatus === "Delivered") {
        order.paymentStatus =
            order.paymentMethod === "COD"
                ? "Paid"
                : order.paymentStatus;
    }

    if (newStatus === "Cancelled") {
        order.cancellationReason =
            order.cancellationReason ||
            "Cancelled by admin";
    }

    saveOrders();

    renderAdminOrders();
    renderAdminDashboard();

    showToast(
        `Order status changed to ${newStatus}.`,
        "success"
    );
}


/* =========================================================
   ADMIN ORDER STATUS EVENTS
   ========================================================= */

function bindAdminOrderStatusEvents() {

    document
        .querySelectorAll(
            "[data-order-status-id]"
        )
        .forEach(select => {

            select.addEventListener(
                "change",
                () => {

                    updateOrderStatus(
                        select.dataset.orderStatusId,
                        select.value
                    );

                }
            );

        });
}


/* =========================================================
   ORDER PAGINATION
   ========================================================= */

function renderOrderPagination(
    totalPages
) {

    const container =
        document.getElementById(
            "ordersPagination"
        );

    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = "";
        return;
    }

    let html = "";

    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        html += `
            <button
                type="button"
                class="page-btn ${
                    page === adminOrderPage
                        ? "active"
                        : ""
                }"
                data-order-page="${page}">
                ${page}
            </button>
        `;
    }

    container.innerHTML = html;

    container
        .querySelectorAll(
            "[data-order-page]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    adminOrderPage =
                        numberValue(
                            button.dataset.orderPage
                        );

                    renderAdminOrders();

                }
            );

        });
}


/* =========================================================
   ADMIN ORDER DETAILS
   ========================================================= */

function openAdminOrderDetails(
    orderId
) {

    if (!isAdminLoggedIn()) {
        showAdminLogin();
        return;
    }

    const order =
        orders.find(
            item =>
                item.id === orderId
        );

    if (!order) {
        showToast(
            "Order not found.",
            "error"
        );
        return;
    }

    renderAdminOrderDetails(
        order
    );

    openModal(
        "adminOrderDetailsModal"
    );
}


/* =========================================================
   RENDER ADMIN ORDER DETAILS
   ========================================================= */

function renderAdminOrderDetails(
    order
) {

    const container =
        document.getElementById(
            "adminOrderDetailsContent"
        );

    if (!container) return;

    const items =
        (order.items || [])
            .map(item => `
                <div class="order-item">

                    <div class="order-item-image">

                        ${
                            item.image
                                ? `
                                    <img
                                        src="${escapeHTML(item.image)}"
                                        alt="${escapeHTML(item.name)}">
                                  `
                                : `
                                    <div class="product-image-placeholder">
                                        No Image
                                    </div>
                                  `
                        }

                    </div>

                    <div class="order-item-info">

                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <span>
                            Qty:
                            ${numberValue(item.quantity, 1)}
                        </span>

                        ${
                            item.size
                                ? `
                                    <span>
                                        Size:
                                        ${escapeHTML(item.size)}
                                    </span>
                                  `
                                : ""
                        }

                        ${
                            item.color
                                ? `
                                    <span>
                                        Color:
                                        ${escapeHTML(item.color)}
                                    </span>
                                  `
                                : ""
                        }

                    </div>

                    <strong>
                        ${formatCurrency(
                            item.lineTotal
                        )}
                    </strong>

                </div>
            `)
            .join("");

    container.innerHTML = `

        <div class="order-summary-grid">

            <div class="order-summary-card">
                <span>Order ID</span>
                <strong>
                    ${escapeHTML(
                        order.orderId ||
                        order.id
                    )}
                </strong>
            </div>

            <div class="order-summary-card">
                <span>Status</span>
                <strong>
                    ${escapeHTML(
                        order.status
                    )}
                </strong>
            </div>

            <div class="order-summary-card">
                <span>Payment</span>
                <strong>
                    ${escapeHTML(
                        order.paymentMethod
                    )}
                </strong>
            </div>

            <div class="order-summary-card">
                <span>Total</span>
                <strong>
                    ${formatCurrency(
                        order.total
                    )}
                </strong>
            </div>

        </div>


        <div class="dashboard-card">

            <div class="dashboard-card-header">
                <h3>Customer</h3>
            </div>

            <p>
                <strong>
                    ${escapeHTML(
                        order.customerName ||
                        ""
                    )}
                </strong>
            </p>

            <p>
                ${escapeHTML(
                    order.customerMobile ||
                    ""
                )}
            </p>

        </div>


        <div class="dashboard-card">

            <div class="dashboard-card-header">
                <h3>Delivery Address</h3>
            </div>

            <p>
                ${escapeHTML(
                    order.address?.fullAddress ||
                    ""
                )}
            </p>

        </div>


        <div class="dashboard-card">

            <div class="dashboard-card-header">
                <h3>Products</h3>
            </div>

            <div class="order-items">
                ${items}
            </div>

        </div>


        <div class="dashboard-card">

            <div class="cart-summary">

                <div class="cart-summary-row">
                    <span>Subtotal</span>
                    <strong>
                        ${formatCurrency(
                            order.subtotal
                        )}
                    </strong>
                </div>

                <div class="cart-summary-row">
                    <span>Delivery</span>
                    <strong>
                        ${
                            numberValue(
                                order.deliveryCharge,
                                0
                            ) === 0
                                ? "FREE"
                                : formatCurrency(
                                    order.deliveryCharge
                                )
                        }
                    </strong>
                </div>

                <div class="cart-summary-row cart-total">
                    <span>Total</span>
                    <strong>
                        ${formatCurrency(
                            order.total
                        )}
                    </strong>
                </div>

            </div>

        </div>


        <div class="form-footer">

            <button
                type="button"
                class="btn btn-secondary"
                onclick="openOrderInvoice('${escapeHTML(order.id)}')">
                View Invoice
            </button>

        </div>
    `;
}


/* =========================================================
   ADMIN CUSTOMERS
   ========================================================= */

function renderAdminCustomers() {

    const container =
        document.getElementById(
            "adminCustomersGrid"
        ) ||
        document.getElementById(
            "adminCustomersGrid"
        );

    if (!container) return;

    if (!customers.length) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No customers yet</h3>
                <p>
                    Customer accounts will appear here.
                </p>
            </div>
        `;

        return;
    }

    const sorted =
        [...customers].sort(
            (a, b) =>
                new Date(b.updatedAt || b.createdAt) -
                new Date(a.updatedAt || a.createdAt)
        );

    container.innerHTML =
        sorted.map(customer => `

            <div class="customer-card">

                <div class="customer-card-top">

                    <div class="customer-avatar">
                        ${escapeHTML(
                            (
                                customer.name ||
                                "C"
                            )
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </div>

                    <div class="customer-card-info">

                        <strong>
                            ${escapeHTML(
                                customer.name ||
                                "Customer"
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                customer.mobile ||
                                ""
                            )}
                        </span>

                    </div>

                </div>

                <div class="customer-card-meta">

                    <div class="customer-meta-box">

                        <span>Orders</span>

                        <strong>
                            ${numberValue(
                                customer.ordersCount,
                                0
                            )}
                        </strong>

                    </div>

                    <div class="customer-meta-box">

                        <span>Total Spent</span>

                        <strong>
                            ${formatCurrency(
                                customer.totalSpent
                            )}
                        </strong>

                    </div>

                </div>

                <button
                    type="button"
                    class="btn btn-secondary"
                    onclick="openAdminCustomerDetails('${escapeHTML(customer.id)}')">
                    View Details
                </button>

            </div>

        `).join("");
}


/* =========================================================
   ADMIN CUSTOMER DETAILS
   ========================================================= */

function openAdminCustomerDetails(
    customerId
) {

    if (!isAdminLoggedIn()) {
        showAdminLogin();
        return;
    }

    const customer =
        customers.find(
            item =>
                item.id === customerId
        );

    if (!customer) {
        showToast(
            "Customer not found.",
            "error"
        );
        return;
    }

    const customerOrders =
        orders.filter(
            order =>
                order.customerId === customer.id ||
                order.customerMobile === customer.mobile
        );

    const container =
        document.getElementById(
            "customerDetailsContent"
        );

    if (!container) return;

    container.innerHTML = `

        <div class="customer-card">

            <div class="customer-card-top">

                <div class="customer-avatar">
                    ${escapeHTML(
                        (
                            customer.name ||
                            "C"
                        )
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div class="customer-card-info">

                    <strong>
                        ${escapeHTML(
                            customer.name ||
                            "Customer"
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            customer.mobile ||
                            ""
                        )}
                    </span>

                    ${
                        customer.email
                            ? `
                                <span>
                                    ${escapeHTML(
                                        customer.email
                                    )}
                                </span>
                              `
                            : ""
                    }

                </div>

            </div>

        </div>


        <div class="order-summary-grid">

            <div class="order-summary-card">
                <span>Total Orders</span>
                <strong>
                    ${customerOrders.length}
                </strong>
            </div>

            <div class="order-summary-card">
                <span>Total Spent</span>
                <strong>
                    ${formatCurrency(
                        customer.totalSpent
                    )}
                </strong>
            </div>

        </div>


        <div class="dashboard-card">

            <div class="dashboard-card-header">
                <h3>Saved Address</h3>
            </div>

            <p>
                ${escapeHTML(
                    customer.address?.fullAddress ||
                    "No saved address"
                )}
            </p>

        </div>
    `;

    openModal(
        "customerDetailsModal"
    );
}


/* =========================================================
   PART 4 INITIALIZATION
   ========================================================= */

function initializePart4() {

    const adminLoginForm =
        document.getElementById(
            "adminLoginForm"
        );

    if (adminLoginForm) {
        adminLoginForm.addEventListener(
            "submit",
            handleAdminLogin
        );
    }


    const productForm =
        document.getElementById(
            "productForm"
        );

    if (productForm) {
        productForm.addEventListener(
            "submit",
            handleProductFormSubmit
        );
    }


    const imageInput =
        document.getElementById(
            "productImages"
        );

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            handleAdminProductImages
        );

    }


    document
        .querySelectorAll(".admin-tab")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const tab =
                        button.dataset.tab ||
                        button.dataset.adminTab;

                    if (tab) {
                        showAdminTab(tab);
                    }

                }
            );

        });


    document
        .querySelectorAll(
            ".period-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".period-btn"
                        )
                        .forEach(item => {
                            item.classList.remove(
                                "active"
                            );
                        });

                    button.classList.add(
                        "active"
                    );

                    renderAdminDashboard();

                }
            );

        });


    const orderSearch =
        document.getElementById(
            "adminOrderSearch"
        ) ||
        document.getElementById(
            "adminOrderSearch"
        );

    if (orderSearch) {

        orderSearch.addEventListener(
            "input",
            () => {

                adminOrderPage = 1;

                renderAdminOrders();

            }
        );

    }


    const orderStatusFilter =
        document.getElementById(
            "adminOrderStatusFilter"
        ) ||
        document.getElementById(
            "adminOrderStatusFilter"
        );

    if (orderStatusFilter) {

        orderStatusFilter.addEventListener(
            "change",
            () => {

                adminOrderPage = 1;

                renderAdminOrders();

            }
        );

    }


    updateCustomerUI();
}


/* =========================================================
   PART 4 END
   ========================================================= */
   /* =========================================================
   SALE 11
   PROFESSIONAL E-COMMERCE STORE
   APP.JS — PART 5 / 5
   ========================================================= */


/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettingsForm() {
    const storeName = document.getElementById("settingStoreName");
    const supportPhone = document.getElementById("settingSupportPhone");
    const deliveryCharge = document.getElementById("settingDeliveryCharge");
    const freeDeliveryAbove = document.getElementById("settingFreeDeliveryAbove");
    const upiId = document.getElementById("settingUpiId");
    const codEnabled = document.getElementById("settingCodEnabled");
    const upiEnabled = document.getElementById("settingUpiEnabled");

    if (storeName) storeName.value = settings.storeName || "";
    if (supportPhone) supportPhone.value = settings.supportPhone || "";
    if (deliveryCharge) deliveryCharge.value = settings.deliveryCharge ?? 49;
    if (freeDeliveryAbove) {
        freeDeliveryAbove.value = settings.freeDeliveryAbove ?? 499;
    }
    if (upiId) upiId.value = settings.upiId || "";
    if (codEnabled) codEnabled.checked = settings.codEnabled !== false;
    if (upiEnabled) upiEnabled.checked = settings.upiEnabled === true;
}


function saveSettingsFromForm() {
    const storeName = document.getElementById("settingStoreName");
    const supportPhone = document.getElementById("settingSupportPhone");
    const deliveryCharge = document.getElementById("settingDeliveryCharge");
    const freeDeliveryAbove = document.getElementById("settingFreeDeliveryAbove");
    const upiId = document.getElementById("settingUpiId");
    const codEnabled = document.getElementById("settingCodEnabled");
    const upiEnabled = document.getElementById("settingUpiEnabled");

    settings = {
        ...settings,

        storeName: storeName
            ? String(storeName.value).trim()
            : settings.storeName,

        supportPhone: supportPhone
            ? String(supportPhone.value).trim()
            : settings.supportPhone,

        deliveryCharge: deliveryCharge
            ? Math.max(0, Number(deliveryCharge.value) || 0)
            : settings.deliveryCharge,

        freeDeliveryAbove: freeDeliveryAbove
            ? Math.max(0, Number(freeDeliveryAbove.value) || 0)
            : settings.freeDeliveryAbove,

        upiId: upiId
            ? String(upiId.value).trim()
            : settings.upiId,

        codEnabled: codEnabled
            ? codEnabled.checked
            : settings.codEnabled,

        upiEnabled: upiEnabled
            ? upiEnabled.checked
            : settings.upiEnabled
    };

    saveSettings();
    renderSettingsForm();

    showToast("Settings saved successfully.", "success");
}


/* =========================================================
   CATEGORY ADMIN
   ========================================================= */

function renderAdminCategories() {
    const container =
        document.getElementById("adminCategoriesGrid");

    if (!container) return;

    container.innerHTML = "";

    categories.forEach(category => {
        const count = products.filter(
            product => product.category === category
        ).length;

        const card = document.createElement("div");
        card.className = "category-admin-card";

        card.innerHTML = `
            <div class="category-admin-info">
                <strong>${escapeHTML(category)}</strong>
                <span>${count} product${count === 1 ? "" : "s"}</span>
            </div>

            <div class="table-actions">
                <button
                    type="button"
                    class="table-action"
                    data-category-edit="${escapeHTML(category)}">
                    Edit
                </button>

                <button
                    type="button"
                    class="table-action danger"
                    data-category-delete="${escapeHTML(category)}">
                    Delete
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}


function addCategory(categoryName) {
    const name = String(categoryName || "").trim();

    if (!name) {
        showToast("Please enter a category name.", "warning");
        return false;
    }

    const exists = categories.some(
        category => category.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
        showToast("This category already exists.", "warning");
        return false;
    }

    categories.push(name);
    saveCategories();

    renderCategories();
    renderAdminCategories();

    showToast("Category added successfully.", "success");

    return true;
}


function editCategory(oldName) {
    const newName = window.prompt(
        "Enter the new category name:",
        oldName
    );

    if (newName === null) return;

    const name = String(newName).trim();

    if (!name) {
        showToast("Category name cannot be empty.", "warning");
        return;
    }

    const exists = categories.some(
        category =>
            category !== oldName &&
            category.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
        showToast("This category already exists.", "warning");
        return;
    }

    categories = categories.map(category =>
        category === oldName ? name : category
    );

    products = products.map(product => ({
        ...product,
        category:
            product.category === oldName
                ? name
                : product.category
    }));

    saveCategories();
    saveProducts();

    renderCategories();
    renderProducts();
    renderAdminCategories();
    renderAdminProducts();

    showToast("Category updated successfully.", "success");
}


function deleteCategory(categoryName) {
    const usedProducts = products.filter(
        product => product.category === categoryName
    );

    if (usedProducts.length > 0) {
        showToast(
            `Cannot delete "${categoryName}" because ${usedProducts.length} product(s) use this category.`,
            "warning"
        );
        return;
    }

    confirmAction(
        `Delete category "${categoryName}"?`,
        () => {
            categories = categories.filter(
                category => category !== categoryName
            );

            saveCategories();

            renderCategories();
            renderAdminCategories();

            showToast("Category deleted.", "success");
        }
    );
}


/* =========================================================
   CATEGORY EVENT BINDINGS
   ========================================================= */

function bindCategoryAdminEvents() {
    const addButtons = [
        document.getElementById("addCategoryBtn"),
        document.getElementById("emptyAddCategoryBtn")
    ].filter(Boolean);

    addButtons.forEach(button => {
        if (button.dataset.bound === "true") return;

        button.dataset.bound = "true";

        button.addEventListener("click", () => {
            const value = window.prompt("Enter the new category name:", "");
            if (value !== null) addCategory(value);
        });
    });

    const container =
        document.getElementById("adminCategoriesGrid");

    if (!container || container.dataset.bound === "true") return;

    container.dataset.bound = "true";

    container.addEventListener("click", event => {
        const editButton = event.target.closest(
            "[data-category-edit]"
        );

        if (editButton) {
            editCategory(editButton.dataset.categoryEdit);
            return;
        }

        const deleteButton = event.target.closest(
            "[data-category-delete]"
        );

        if (deleteButton) {
            deleteCategory(deleteButton.dataset.categoryDelete);
        }
    });
}


/* =========================================================
   REPORTS
   ========================================================= */

function getReportData(period = "30") {
    const now = Date.now();

    let start = 0;

    if (period === "1" || period === "today") {
        start = now - 24 * 60 * 60 * 1000;
    } else if (period === "7" || period === "7days") {
        start = now - 7 * 24 * 60 * 60 * 1000;
    } else if (period === "30" || period === "30days") {
        start = now - 30 * 24 * 60 * 60 * 1000;
    }

    const filteredOrders = orders.filter(order => {
        if (!start) return true;

        const time = new Date(order.createdAt).getTime();

        return !Number.isNaN(time) && time >= start;
    });

    const deliveredOrders = filteredOrders.filter(
        order => String(order.status).toLowerCase() === "delivered"
    );

    const cancelledOrders = filteredOrders.filter(
        order => String(order.status).toLowerCase() === "cancelled"
    );

    const pendingOrders = filteredOrders.filter(order => {
        const status = String(order.status).toLowerCase();

        return [
            "pending",
            "confirmed",
            "packed",
            "shipped",
            "out for delivery"
        ].includes(status);
    });

    const revenue = deliveredOrders.reduce(
        (sum, order) => sum + Number(order.total || order.amount || 0),
        0
    );

    const orderValue = filteredOrders.reduce(
        (sum, order) => sum + Number(order.total || order.amount || 0),
        0
    );

    return {
        orders: filteredOrders,
        deliveredOrders,
        cancelledOrders,
        pendingOrders,
        revenue,
        orderValue,
        averageOrderValue:
            filteredOrders.length > 0
                ? orderValue / filteredOrders.length
                : 0
    };
}


function renderReports(period = "30") {
    const data = getReportData(period);

    const revenueElements = [
        document.getElementById("reportTotalSales")
    ].filter(Boolean);

    const orderElements = [
        document.getElementById("reportTotalOrders")
    ].filter(Boolean);

    const averageElements = [
        document.getElementById("reportAverageOrder")
    ].filter(Boolean);

    const deliveredElements = [
        document.getElementById("reportDeliveredOrders")
    ].filter(Boolean);

    revenueElements.forEach(
        element => element.textContent = formatCurrency(data.revenue)
    );

    orderElements.forEach(
        element => element.textContent = data.orders.length
    );

    averageElements.forEach(
        element =>
            element.textContent = formatCurrency(
                data.averageOrderValue
            )
    );

    deliveredElements.forEach(
        element =>
            element.textContent = data.deliveredOrders.length
    );

}


/* =========================================================
   REPORT PERIOD BUTTONS
   ========================================================= */

function bindReportPeriodButtons() {
    const buttons = document.querySelectorAll(
        "[data-report-period]"
    );

    buttons.forEach(button => {
        if (button.dataset.bound === "true") return;

        button.dataset.bound = "true";

        button.addEventListener("click", () => {
            buttons.forEach(item =>
                item.classList.remove("active")
            );

            button.classList.add("active");

            renderReports(
                button.dataset.reportPeriod || "30"
            );
        });
    });
}


/* =========================================================
   SETTINGS EVENTS
   ========================================================= */

function bindSettingsEvents() {
    const saveButtons = [
        document.getElementById("saveSettingsBtn"),
        document.getElementById("saveSettingsBtn")
    ].filter(Boolean);

    saveButtons.forEach(button => {
        if (button.dataset.bound === "true") return;

        button.dataset.bound = "true";

        button.addEventListener(
            "click",
            saveSettingsFromForm
        );
    });

    renderSettingsForm();
}


/* =========================================================
   ADMIN TAB INITIALIZATION
   ========================================================= */

function refreshAdminSection(sectionName) {
    switch (sectionName) {
        case "dashboard":
            renderDashboardStats(
                currentDashboardPeriod || "all"
            );
            break;

        case "products":
            renderAdminProducts();
            break;

        case "orders":
            renderAdminOrders();
            break;

        case "customers":
            renderAdminCustomers();
            break;

        case "reports":
            renderReports("30");
            break;

        case "categories":
            renderAdminCategories();
            break;

        case "settings":
            renderSettingsForm();
            break;
    }
}


/* =========================================================
   GLOBAL SEARCH
   ========================================================= */

function bindGlobalSearch() {
    const searchInput =
        document.getElementById("searchInput") ||
        document.querySelector(".search-box input");

    if (!searchInput || searchInput.dataset.globalBound === "true") {
        return;
    }

    searchInput.dataset.globalBound = "true";

    searchInput.addEventListener("input", event => {
        searchProducts(event.target.value);
    });
}


/* =========================================================
   CUSTOMER / ADMIN BUTTONS
   ========================================================= */

function bindHeaderActions() {
    const adminButtons = document.querySelectorAll(
        "[data-open-admin], #openAdminBtn, #adminBtn"
    );

    adminButtons.forEach(button => {
        if (button.dataset.headerBound === "true") return;

        button.dataset.headerBound = "true";

        button.addEventListener("click", () => {
            if (isAdminLoggedIn()) {
                showAdminDashboard();
            } else {
                openModal("adminLoginModal");
            }
        });
    });

    const accountButtons = document.querySelectorAll(
        "[data-open-account], #accountBtn"
    );

    accountButtons.forEach(button => {
        if (button.dataset.headerBound === "true") return;

        button.dataset.headerBound = "true";

        button.addEventListener("click", () => {
            openAccountModal();
        });
    });

    const cartButtons = document.querySelectorAll(
        "[data-open-cart], #cartBtn"
    );

    cartButtons.forEach(button => {
        if (button.dataset.headerBound === "true") return;

        button.dataset.headerBound = "true";

        button.addEventListener("click", () => {
            openCartModal();
        });
    });

    const wishlistButtons = document.querySelectorAll(
        "[data-open-wishlist], #wishlistBtn"
    );

    wishlistButtons.forEach(button => {
        if (button.dataset.headerBound === "true") return;

        button.dataset.headerBound = "true";

        button.addEventListener("click", () => {
            openWishlistModal();
        });
    });
}


/* =========================================================
   MODAL CLOSE EVENTS
   ========================================================= */

function bindModalCloseEvents() {
    document.addEventListener("click", event => {
        const closeButton = event.target.closest(
            "[data-close-modal]"
        );

        if (closeButton) {
            const modalId =
                closeButton.dataset.closeModal;

            if (modalId) {
                closeModal(modalId);
            } else {
                closeAllModals();
            }

            return;
        }

        if (
            event.target.classList.contains("modal-backdrop")
        ) {
            const modal = event.target.closest(".modal");

            if (modal) {
                closeModal(modal.id);
            }
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeAllModals();
        }
    });
}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function bindMobileNavigation() {
    const items = document.querySelectorAll(".mobile-nav-item");
    items.forEach(item => {
        if (item.dataset.mobileBound === "true") return;
        item.dataset.mobileBound = "true";
        item.addEventListener("click", () => {
            const action = item.dataset.mobileNav || item.dataset.action || "";
            document.querySelectorAll(".mobile-nav-item").forEach(btn => btn.classList.remove("active"));
            item.classList.add("active");
            switch (action) {
                case "home": showCustomerStore(); window.scrollTo({top:0,behavior:"smooth"}); break;
                case "categories": showCustomerStore(); document.querySelector(".category-strip")?.scrollIntoView({behavior:"smooth",block:"start"}); break;
                case "wishlist": openWishlistModal(); break;
                case "cart": openCart(); break;
                case "account": openAccount(); break;
            }
        });
    });
}


/* =========================================================
   SCROLL TO TOP
   ========================================================= */

function bindScrollTop() {
    const button =
        document.getElementById("scrollTopBtn") ||
        document.querySelector(".scroll-top");

    if (!button || button.dataset.bound === "true") {
        return;
    }

    button.dataset.bound = "true";

    window.addEventListener("scroll", () => {
        button.classList.toggle(
            "show",
            window.scrollY > 400
        );
    });

    button.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


/* =========================================================
STORAGE SYNC
   ========================================================= */

function bindStorageSync() {
    window.addEventListener("storage", event => {
        if (!event.key) return;

        loadAllData();

        updateCartBadge();
        updateWishlistCount();

        if (isAdminLoggedIn()) {
            renderAdminProducts();
            renderAdminOrders();
            renderAdminCustomers();
            renderAdminCategories();
            renderSettingsForm();
        } else {
            renderProducts();
        }
    });
}


/* =========================================================
FINAL APP INITIALIZATION
   ========================================================= */

function initializePart5() {
    try {
        loadAdminAuth();
        loadAllData();
        initializeDefaultData();

        updateCartBadge();
        updateWishlistCount();

        renderCategories();
        renderProducts();

        bindCategoryAdminEvents();
        bindReportPeriodButtons();
        bindSettingsEvents();
        bindGlobalSearch();
        bindHeaderActions();
        bindModalCloseEvents();
        bindMobileNavigation();
        bindScrollTop();
        bindStorageSync();

        if (isAdminLoggedIn()) {
            showAdminDashboard();
        } else {
            showCustomerStore();
        }

        console.log(
            "Sale 11: App initialized successfully."
        );
    } catch (error) {
        console.error(
            "Sale 11 initialization error:",
            error
        );

        showToast(
            "Some store features could not be initialized.",
            "error"
        );
    }
}


/* =========================================================
SAFE START
   ========================================================= */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        ensureWishlistModal();
        initializePart5();
    }, { once: true });
} else {
    ensureWishlistModal();
    initializePart5();
}


/* =========================================================
   PART 5 END
   ========================================================= */

/* =========================================================
   V4 COMPATIBILITY FIXES
   ========================================================= */
function ensureWishlistModal() {
    if (document.getElementById("wishlistModal")) return;
    const el = document.createElement("div");
    el.id = "wishlistModal";
    el.className = "modal-overlay hidden";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML = `<div class="modal modal-medium"><div class="modal-header"><div><span class="modal-kicker">SALE 11</span><h2>Wishlist</h2></div><button type="button" class="modal-close" data-close-modal="wishlistModal">×</button></div><div id="wishlistItems" class="modal-body"></div></div>`;
    document.body.appendChild(el);
}
function openCartModal() { return openCart(); }

/* =========================================================
   HTML COMPATIBILITY ALIASES
   Existing index.html handlers -> current app functions.
========================================================= */
function switchTab(tab) {
    if (tab === "admin") return showAdminDashboard();
    if (tab === "store") return showCustomerStore();
}

function openOrdersModal() {
    if (typeof isCustomerLoggedIn === "function" && isCustomerLoggedIn()) {
        return openAccountOrders();
    }
    return showCustomerLogin();
}

function openAccountModal() {
    return openAccount();
}

function openWishlist() {
    return openWishlistModal();
}

function filterCategory(category) {
    return selectCategory(category);
}

function scrollToProducts() {
    const el = document.getElementById("productsGrid");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function adminLogout() {
    return logoutAdmin();
}

function switchAdminTab(tab) {
    return showAdminTab(tab);
}

function setDashboardPeriod(period) {
    return setAdminPeriod(period);
}

function openProductModal(productId) {
    return openAddProduct(productId);
}
