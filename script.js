const menuData = [
    { id: 1, name: "Caramel Macchiato", price: 35000, category: "Coffee", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?q=80&w=800&auto=format&fit=crop", desc: "Espresso dengan sirup caramel manis." },
    { id: 2, name: "Beige Latte", price: 32000, category: "Milk Based", image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?q=80&w=800&auto=format&fit=crop", desc: "Signature latte dengan susu pilihan." },
    { id: 3, name: "Butter Croissant", price: 28000, category: "Pastry", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop", desc: "Pastry renyah dengan butter premium." },
    { id: 4, name: "Oat Milk Cold Brew", price: 38000, category: "Coffee", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=800&auto=format&fit=crop", desc: "Kopi dingin dengan susu oat sehat." }
];

let cart = JSON.parse(localStorage.getItem('cafe_cart')) || [];
let currentCustomItem = null;
const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// ==========================================
// 1. FITUR RAHASIA (ADMIN & BOSS) - FIX SCROLL
// ==========================================
let secretBuffer = "";
let logoTapCount = 0;
let storyTapCount = 0;
let storyTimer = null; // Timer untuk membedakan klik biasa vs rahasia

// A. Akses Keyboard (Laptop/PC) -> Ketik "admin"
document.addEventListener('keydown', (e) => {
    secretBuffer += e.key.toLowerCase();
    if (secretBuffer.endsWith("admin")) {
        triggerAccess("admin.html", "Selamat Datang, Admin", "MENYIAPKAN DASHBOARD PESANAN...");
        secretBuffer = "";
    }
});

// B. Akses HP: Tap Logo 5x -> Ke ADMIN (Pesanan)
document.getElementById('logo-dev').onclick = () => {
    logoTapCount++;
    if (logoTapCount === 5) {
        triggerAccess("admin.html", "Selamat Datang, Admin", "MENYIAPKAN DASHBOARD PESANAN...");
        logoTapCount = 0;
    }
    setTimeout(() => { logoTapCount = 0; }, 2000);
};

// C. Akses HP: Tap Tulisan 'STORY' 5x -> Ke BOSS (Keluhan) [FIX AUTO SCROLL]
const storyLink = document.querySelector('a[href="#about"]');
if(storyLink) {
    storyLink.addEventListener('click', (e) => {
        // 1. STOP Browser melakukan scroll otomatis
        e.preventDefault();
        
        storyTapCount++;

        // 2. Jika sudah 5x klik, langsung masuk BOSS
        if (storyTapCount === 5) {
            clearTimeout(storyTimer); // Batalkan timer scroll
            triggerAccess("complaints.html", "Selamat Datang, Boss!", "MEMBUKA DATA KELUHAN PELANGGAN...");
            storyTapCount = 0;
            return;
        }

        // 3. Jika belum 5x, tunggu sebentar (400ms)
        // Kalau user berhenti klik, berarti dia cuma mau ke Story biasa (scroll manual)
        clearTimeout(storyTimer);
        storyTimer = setTimeout(() => {
            if (storyTapCount > 0 && storyTapCount < 5) {
                // Scroll manual via JS
                document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
            }
            storyTapCount = 0;
        }, 400);
    });
}

function triggerAccess(targetUrl, title, sub) {
    const greeting = document.getElementById('admin-greeting');
    const progress = document.getElementById('loading-progress');
    document.getElementById('greeting-title').innerText = title;
    document.getElementById('greeting-sub').innerText = sub;
    greeting.style.display = 'flex';
    setTimeout(() => { progress.style.width = '100%'; }, 100);
    setTimeout(() => { window.location.href = targetUrl; }, 2000);
}

// ==========================================
// 2. RENDER MENU & LOGIC
// ==========================================
function renderMenu(items = menuData) {
    const container = document.getElementById('menu-container');
    container.innerHTML = items.map((item, index) => `
        <article class="menu-card" style="animation: fadeInUp 0.5s ease forwards ${index * 0.05}s">
            <div class="image-container"><img src="${item.image}" alt="${item.name}"></div>
            <div class="card-info" style="flex-grow: 1;">
                <p><small style="color: #8C7867; font-weight:600;">${item.category.toUpperCase()}</small></p>
                <h3 style="margin-top:5px;">${item.name}</h3>
                <p style="font-size: 0.8rem; color: #8C7867; margin: 8px 0;">${item.desc}</p>
            </div>
            <div class="card-footer">
                <span style="font-weight:800; display:block; margin: 10px 0;">${formatRupiah(item.price)}</span>
                <button class="btn-add" onclick="handleAddToCart(event, ${item.id})">ADD TO ORDER</button>
            </div>
        </article>
    `).join('');
}

document.getElementById('menu-search').addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase();
    renderMenu(menuData.filter(m => m.name.toLowerCase().includes(val)));
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        const cat = btn.dataset.category;
        renderMenu(cat === 'all' ? menuData : menuData.filter(m => m.category === cat));
    };
});

// ==========================================
// 3. KERANJANG PREMIUM (THUMBNAIL & QTY)
// ==========================================
window.handleAddToCart = (event, id) => {
    const btn = event.currentTarget;
    btn.innerText = "ADDING...";
    setTimeout(() => {
        currentCustomItem = menuData.find(p => p.id === id);
        if(currentCustomItem.category === "Pastry") {
            addFinalToCart(currentCustomItem, 0, "Original");
        } else {
            document.getElementById('custom-item-name').innerText = currentCustomItem.name;
            document.getElementById('customize-modal').style.display = 'grid';
        }
        btn.innerText = "ADD TO ORDER";
    }, 400);
};

window.closeCustomize = () => document.getElementById('customize-modal').style.display = 'none';

document.getElementById('confirm-add-btn').onclick = () => {
    const extra = parseInt(document.getElementById('milk-select').value) + (document.getElementById('extra-shot').checked ? 5000 : 0);
    const milkName = document.getElementById('milk-select').options[document.getElementById('milk-select').selectedIndex].text.split(' (')[0];
    const note = `${milkName}${document.getElementById('extra-shot').checked ? " + Extra Shot" : ""}`;
    addFinalToCart(currentCustomItem, extra, note);
    closeCustomize();
};

function addFinalToCart(product, extra, note) {
    const existing = cart.find(i => i.id === product.id && i.note === note);
    if(existing) existing.qty += 1;
    else cart.push({ ...product, price: product.price + extra, qty: 1, note: note });
    updateUI();
    showToast("☕ Ditambahkan ke keranjang!");
}

function updateUI() {
    localStorage.setItem('cafe_cart', JSON.stringify(cart));
    document.getElementById('cart-count').innerText = cart.reduce((a, b) => a + b.qty, 0);
    
    const cartContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div style="text-align:center; margin-top:3rem; opacity:0.5;">
                <span style="font-size:3rem;">🛒</span>
                <p style="margin-top:1rem; font-weight:600;">Keranjang Anda kosong.</p>
                <p style="font-size:0.8rem;">Yuk, pesan kopi favoritmu!</p>
            </div>`;
    } else {
        cartContainer.innerHTML = cart.map((item, idx) => `
            <div class="cart-item">
                <div class="cart-thumb">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-details">
                    <h4>${item.name}</h4>
                    <span class="variant">${item.note}</span>
                    <div class="price">${formatRupiah(item.price * item.qty)}</div>
                </div>
                <div class="qty-control">
                    <button class="qty-btn" onclick="updateQty(${idx}, -1)">−</button>
                    <span class="qty-num">${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty(${idx}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('total-price').innerText = formatRupiah(cart.reduce((s, i) => s + (i.price * i.qty), 0));
}

window.updateQty = (idx, delta) => {
    cart[idx].qty += delta;
    if(cart[idx].qty <= 0) cart.splice(idx, 1);
    updateUI();
};

document.getElementById('checkout-btn').onclick = function() {
    if(cart.length === 0) return;
    const orderId = `#B-${Math.floor(100000 + Math.random()*900000)}`;
    const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
    const allOrders = JSON.parse(localStorage.getItem('all_orders')) || [];
    allOrders.push({ id: orderId, items: [...cart], total, time: new Date().toLocaleTimeString() });
    localStorage.setItem('all_orders', JSON.stringify(allOrders));
    
    document.getElementById('order-id').innerText = orderId;
    document.getElementById('modal-total').innerText = formatRupiah(total);
    document.getElementById('invoice-details').innerHTML = cart.map(i => `<div>• ${i.name} (${i.note}) x${i.qty}</div>`).join('');
    document.getElementById('success-modal').style.display = 'grid';
    document.getElementById('cart-sidebar').classList.remove('active');
};

// ==========================================
// 4. KELUHAN & TOAST
// ==========================================
document.getElementById('complaint-form').onsubmit = function(e) {
    e.preventDefault();
    const name = this.querySelector('input').value;
    const message = this.querySelector('textarea').value;
    const allComplaints = JSON.parse(localStorage.getItem('cafe_complaints')) || [];
    allComplaints.push({ name, message, time: new Date().toLocaleString() });
    localStorage.setItem('cafe_complaints', JSON.stringify(allComplaints));
    showToast("✅ Keluhan Anda telah tersimpan.");
    this.reset();
};

function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast'; t.innerText = msg;
    document.getElementById('toast-container').appendChild(t);
    setTimeout(() => t.remove(), 2500);
}

document.getElementById('cart-btn').onclick = () => document.getElementById('cart-sidebar').classList.add('active');
document.getElementById('close-cart').onclick = () => document.getElementById('cart-sidebar').classList.remove('active');
document.getElementById('close-modal').onclick = () => { cart = []; updateUI(); location.reload(); };

renderMenu();
updateUI();
