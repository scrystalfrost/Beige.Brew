const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('all_orders')) || [];
    const list = document.getElementById('admin-order-list');
    
    if (orders.length === 0) {
        list.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 3rem; color: #8C7867;">Belum ada pesanan masuk.</td></tr>`;
        return;
    }

    list.innerHTML = orders.slice().reverse().map((order, index) => `
        <tr>
            <td style="font-weight:800; font-size:0.8rem; color:var(--accent-brown);">${order.id}</td>
            <td style="font-size:0.8rem; line-height:1.5;">
                ${order.items.map(i => `<div style="margin-bottom:5px;">• <strong>${i.name}</strong><br><small style="color:#8C7867;">${i.note} (x${i.qty})</small></div>`).join('')}
            </td>
            <td style="font-weight:700;">${formatRupiah(order.total)}</td>
            <td style="color:#8C7867; font-size:0.8rem;">${order.time}</td>
            <td><span class="status-badge">PREPARING</span></td>
            <td><button onclick="deleteOrder(${orders.length - 1 - index})" class="btn-delete">DELETE</button></td>
        </tr>
    `).join('');
}

window.deleteOrder = (actualIndex) => {
    let orders = JSON.parse(localStorage.getItem('all_orders')) || [];
    orders.splice(actualIndex, 1);
    localStorage.setItem('all_orders', JSON.stringify(orders));
    loadOrders();
};

window.clearAllOrders = () => {
    if(confirm("Hapus semua riwayat pesanan?")) {
        localStorage.removeItem('all_orders');
        loadOrders();
    }
};

setInterval(loadOrders, 3000); // Cek pesanan baru tiap 3 detik
loadOrders();