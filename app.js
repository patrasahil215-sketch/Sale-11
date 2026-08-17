// Product Details Modal Logic
function openDetailsModal(name) {
    const product = products.find(p => p.name === name);
    document.getElementById('detailImg').src = product.img;
    document.getElementById('detailName').innerText = product.name;
    document.getElementById('detailPrice').innerText = product.price;
    document.getElementById('detailCategory').innerText = 'Category: ' + product.category;
    
    // Similar Products (Same Category)
    const similar = products.filter(p => p.category === product.category && p.name !== name);
    const simContainer = document.getElementById('similarProducts');
    simContainer.innerHTML = similar.length > 0 ? '' : '<p>No similar products.</p>';
    similar.forEach(p => {
        simContainer.innerHTML += `<div onclick="openDetailsModal('${p.name}')" style="cursor:pointer; text-align:center;">
            <img src="${p.img}" style="width:60px; height:60px; border-radius:4px;">
            <p style="font-size:10px;">${p.name}</p>
        </div>`;
    });

    document.getElementById('detailsModal').style.display = 'block';
}

function closeDetailsModal() { document.getElementById('detailsModal').style.display = 'none'; }

// Update renderProducts function mein button change karein:
// purane "Add to Cart" ke saath "View Details" button bhi dalen
/*
<button class="btn-primary" onclick="addToCart('${prod.name}', ${prod.price})">Add to Cart</button>
<button class="btn-secondary" onclick="openDetailsModal('${prod.name}')" style="margin-top:5px;">View Details</button>
*/
