// openAdminModal function ko yeh update dein:
function openAdminModal() {
    document.getElementById('adminModal').style.display = 'block';
    renderAdminProductList();
    updateAdminStats();
}

function updateAdminStats() {
    let totalOrders = orders.length;
    let totalRevenue = 0;
    orders.forEach(ord => {
        ord.items.forEach(item => {
            totalRevenue += item.price;
        });
    });
    let totalProducts = products.length;

    document.getElementById('adminTotalOrders').innerText = totalOrders;
    document.getElementById('adminTotalRevenue').innerText = '₹' + totalRevenue;
    document.getElementById('adminTotalProds').innerText = totalProducts;
}
