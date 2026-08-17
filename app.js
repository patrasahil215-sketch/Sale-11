// Default products list mein multi-image aur video support ke sath
let products = JSON.parse(localStorage.getItem('sale11_products')) || [
    { name: 'Classic Kurti', price: 499, mrp: 999, category: 'Fashion', img: 'https://via.placeholder.com/150', images: [], video: '' },
    { name: 'Smart Watch', price: 1299, mrp: 2999, category: 'Electronics', img: 'https://via.placeholder.com/150', images: [], video: '' }
];

function renderProducts(filteredList = products) {
    const grid = document.getElementById('productsGrid');
    if(!grid) return;
    grid.innerHTML = '';
    
    if(filteredList.length === 0) {
        grid.innerHTML = '<p>No products found in this category.</p>';
        return;
    }

    filteredList.forEach((prod, index) => {
        // Extra images buttons ya thumbnails agar available ho
        let mediaBadge = prod.video ? `<span style="background:#d81b60; color:#fff; font-size:10px; padding:2px 6px; border-radius:4px; position:absolute; top:8px; left:8px;">🎥 Video</span>` : '';
        
        grid.innerHTML += `
            <div class="product-card" style="position:relative;">
                ${mediaBadge}
                <button class="wishlist-btn" onclick="toggleWishlist('${prod.name}', ${prod.price}, this)"><i class="fas fa-heart"></i></button>
                <img src="${prod.img}" alt="Product" onclick="openImageZoom('${prod.img}', '${prod.name}')" style="cursor:pointer;" title="Click to Zoom">
                <h3>${prod.name}</h3>
                <p class="price">₹${prod.price} <span class="mrp">₹${prod.mrp}</span></p>
                <button class="btn-primary" onclick="addToCart('${prod.name}', ${prod.price})">Add to Cart</button>
                <button class="share-btn" onclick="shareProduct('${prod.name}', ${prod.price})"><i class="fas fa-share-alt"></i> Share</button>
            </div>
        `;
    });
}

function addNewProduct() {
    const name = document.getElementById('adminProdName').value;
    const price = Number(document.getElementById('adminProdPrice').value);
    const mrp = Number(document.getElementById('adminProdMrp').value);
    const category = document.getElementById('adminProdCat').value;
    const img = document.getElementById('adminProdImg').value || 'https://via.placeholder.com/150';
    const imagesInput = document.getElementById('adminProdImages').value;
    const video = document.getElementById('adminProdVideo').value;

    // Extra images ko comma se split karke array banana
    let images = imagesInput ? imagesInput.split(',').map(item => item.trim()) : [];

    if(name && price && mrp) {
        products.push({ name, price, mrp, category, img, images, video });
        localStorage.setItem('sale11_products', JSON.stringify(products));
        filterCategory(currentCategory);
        renderAdminProductList();
        updateAdminStats();
        alert('Product added with media successfully!');
        
        // Clear inputs
        document.getElementById('adminProdName').value = '';
        document.getElementById('adminProdPrice').value = '';
        document.getElementById('adminProdMrp').value = '';
        document.getElementById('adminProdImg').value = '';
        document.getElementById('adminProdImages').value = '';
        document.getElementById('adminProdVideo').value = '';
    } else { 
        alert('Please fill product name, price, and MRP.'); 
    }
}
