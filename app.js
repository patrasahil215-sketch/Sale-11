// --- Navigation & Modal Open/Close Controls ---

function openSupportModal() {
    let modal = document.getElementById('supportModal');
    if(modal) modal.style.display = 'flex';
}
function closeSupportModal() {
    let modal = document.getElementById('supportModal');
    if(modal) modal.style.display = 'none';
}

function openCartModal() {
    let modal = document.getElementById('cartModal');
    if(modal) {
        modal.style.display = 'flex';
        renderCartItems();
    }
}
function closeCartModal() {
    let modal = document.getElementById('cartModal');
    if(modal) modal.style.display = 'none';
}

function openWishlistModal() {
    let modal = document.getElementById('wishlistModal');
    if(modal) {
        modal.style.display = 'flex';
        const container = document.getElementById('wishlistItemsContainer');
        if(container) {
            container.innerHTML = wishlist.length === 0 ? '<p>Your wishlist is empty.</p>' : '';
            wishlist.forEach(item => { 
                container.innerHTML += `<div style="padding:6px 0; border-bottom:1px solid var(--border-color); display:flex; justify-content:space-between;"><span>${item.name} - ₹${item.price}</span></div>`; 
            });
        }
    }
}
function closeWishlistModal() {
    let modal = document.getElementById('wishlistModal');
    if(modal) modal.style.display = 'none';
}

function openLoginModal() {
    let modal = document.getElementById('loginModal');
    if(modal) {
        modal.style.display = 'flex';
        checkLoginState();
    }
}
function closeLoginModal() {
    let modal = document.getElementById('loginModal');
    if(modal) modal.style.display = 'none';
}
