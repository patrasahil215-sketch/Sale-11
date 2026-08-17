let recentlyViewed = JSON.parse(localStorage.getItem('sale11_recent')) || [];

function addToRecentlyViewed(name, price, img, category) {
    // Check if already exists, remove old instance
    recentlyViewed = recentlyViewed.filter(p => p.name !== name);
    // Add to front of array
    recentlyViewed.unshift({ name, price, img, category });
    // Keep max 4 items
    if(recentlyViewed.length > 4) recentlyViewed.pop();
    
    localStorage.setItem('sale11_recent', JSON.stringify(recentlyViewed));
    renderRecentlyViewed();
}

function renderRecentlyViewed() {
    let container = document.getElementById('recentlyViewedGrid');
    let section = document.getElementById('recentlyViewedSection');
    if(!container) return;

    if(recentlyViewed.length === 0) {
        if(section) section.style.display = 'none';
        return;
    }

    if(section) section.style.display = 'block';
    container.innerHTML = '';
    
    recentlyViewed.forEach(prod => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${prod.img}" alt="Product" onclick="openImageZoom('${prod.img}', '${prod.name}')" style="cursor:pointer;">
                <h3>${prod.name}</h3>
                <p class="price">₹${prod.price}</p>
                <button class="btn-primary" onclick="addToCart('${prod.name}', ${prod.price})">Add to Cart</button>
            </div>
        `;
    });
}

// openImageZoom function ke andar yeh line jod dein taaki zoom karte hi recently viewed mein add ho jaye:
// addToRecentlyViewed(prodName, product.price, imgUrl, product.category);

renderRecentlyViewed();
