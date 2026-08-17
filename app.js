// My Orders Modal mein Invoice button update karne ke liye openOrdersModal function ko ye update dein:
function openOrdersModal() {
    closeLoginModal();
    document.getElementById('ordersModal').style.display = 'block';
    const container = document.getElementById('ordersContainer');
    container.innerHTML = '';

    if(orders.length === 0) {
        container.innerHTML = '<p>No orders placed yet.</p>';
        return;
    }

    orders.forEach((ord, index) => {
        container.innerHTML += `
            <div style="background:#f9f9f9; padding: 10px; margin-bottom: 10px; border-radius: 5px; border-left: 4px solid #d81b60;">
                <p><strong>Order ID:</strong> ${ord.id}</p>
                <p><strong>Date:</strong> ${ord.date}</p>
                <p><strong>Status:</strong> <span style="color: green; font-weight:bold;">${ord.status}</span></p>
                <p style="font-size: 13px; color: #555; margin-top: 5px;">Items: ${ord.items.map(i => i.name).join(', ')}</p>
                <button onclick="openInvoice(${index})" class="btn-secondary" style="margin-top:8px; padding:4px 10px; font-size:12px;">View Invoice 📄</button>
            </div>
        `;
    });
}

function openInvoice(index) {
    const ord = orders[index];
    document.getElementById('invOrderNo').innerHTML = '<strong>Order ID:</strong> ' + ord.id;
    document.getElementById('invDate').innerHTML = '<strong>Date:</strong> ' + ord.date;
    document.getElementById('invCustomer').innerHTML = '<strong>Customer:</strong> ' + (localStorage.getItem('sale11_user_name') || 'Valued Customer');
    document.getElementById('invAddress').innerHTML = '<strong>Payment:</strong> Cash on Delivery (Verified)';
    
    let listDiv = document.getElementById('invItemsList');
    listDiv.innerHTML = '<h4>Ordered Items:</h4>';
    let total = 0;
    ord.items.forEach(item => {
        total += item.price;
        listDiv.innerHTML += `<div style="display:flex; justify-content:space-between; font-size:14px; margin:4px 0;">
            <span>${item.name}</span>
            <span>₹${item.price}</span>
        </div>`;
    });
    document.getElementById('invTotal').innerText = 'Total: ₹' + total;

    document.getElementById('ordersModal').style.display = 'none';
    document.getElementById('invoiceModal').style.display = 'block';
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').style.display = 'none';
    document.getElementById('ordersModal').style.display = 'block';
}
