let currentLang = localStorage.getItem('sale11_lang') || 'en';

const translations = {
    en: {
        bannerText: "⚡ FLASH SALE LIVE!",
        bannerSub: "Hurry up! Massive discounts ending soon.",
        storeTitle: "Store Products",
        cartTitle: "Shopping Cart 🛒",
        checkoutBtn: "Proceed to Checkout",
        adminTitle: "Admin Dashboard 🛠️",
        wishlistTitle: "My Wishlist ❤️"
    },
    hi: {
        bannerText: "⚡ फ्लैश सेल लाइव!",
        bannerSub: "जल्दी करें! भारी छूट जल्द समाप्त हो रही है।",
        storeTitle: "स्टोर उत्पाद",
        cartTitle: "शॉपिंग कार्ट 🛒",
        checkoutBtn: "चेकआउट के लिए आगे बढ़ें",
        adminTitle: "एडमिन डैशबोर्ड 🛠️",
        wishlistTitle: "मेरी विशलिस्ट ❤️"
    }
};

function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'hi' : 'en';
    localStorage.setItem('sale11_lang', currentLang);
    applyTranslations();
}

function applyTranslations() {
    let langText = document.getElementById('langText');
    if(langText) {
        langText.innerText = currentLang === 'en' ? 'हिंदी' : 'English';
    }
}

// App load hone par language apply karein
applyTranslations();
