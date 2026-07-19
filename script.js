const nomorWA = "6285741865864";
const CART_KEY = "gachifaKeranjang";
const RIWAYAT_KEY = "gachifaRiwayat";
const RIWAYAT_MAX = 20;

function getKeranjang() {
    try {
        const data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveKeranjang(keranjang) {
    localStorage.setItem(CART_KEY, JSON.stringify(keranjang));
}

function beliRoti(namaRoti, hargaSatuan, qty = 1, satuan = '') {
    const keranjang = getKeranjang();
    keranjang.push({ nama: namaRoti, hargaSatuan, qty, satuan });
    saveKeranjang(keranjang);

    updateTampilanKeranjang();
    updateNavBadge();
    updateRiwayatBadge();

    const infoJumlah = satuan ? ` (${qty} ${satuan})` : '';
    showToast(namaRoti + infoJumlah + ' ditambahkan ke keranjang');
}

function hapusKeranjang(index) {
    const keranjang = getKeranjang();
    keranjang.splice(index, 1);
    saveKeranjang(keranjang);

    updateTampilanKeranjang();
    updateNavBadge();
    updateRiwayatBadge();
}

function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

function subtotalItem(item) {
    return item.hargaSatuan * item.qty;
}

function updateNavBadge() {
    const badge = document.getElementById('nav-cart-count');
    if (!badge) return;

    const keranjang = getKeranjang();
    if (keranjang.length > 0) {
        badge.innerText = keranjang.length;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function updateTampilanKeranjang() {
    const keranjangDiv = document.getElementById('keranjang-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    const countEl = document.getElementById('keranjang-count');
    if (!keranjangDiv) return;

    const keranjang = getKeranjang();

    if (countEl) countEl.innerText = keranjang.length + ' item';

    if (keranjang.length === 0) {
        keranjangDiv.innerHTML = '<p style="color: #666;">Keranjang kosong...</p>';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }

    let total = 0;
    let html = '';

    keranjang.forEach((item, index) => {
        const sub = subtotalItem(item);
        total += sub;

        const detailHarga = item.qty > 1
            ? `${formatRupiah(item.hargaSatuan)} x ${item.qty} ${item.satuan} = ${formatRupiah(sub)}`
            : formatRupiah(sub);

        html += `
            <div class="keranjang-item">
                <div>
                    <strong>${item.nama}</strong>
                    <br><small>${detailHarga}</small>
                </div>
                <button onclick="hapusKeranjang(${index})" class="btn-hapus">Hapus</button>
            </div>
        `;
    });

    html += `<div class="keranjang-total">Total: ${formatRupiah(total)}</div>`;
    keranjangDiv.innerHTML = html;

    if (checkoutBtn) checkoutBtn.style.display = 'inline-block';
}

function getRiwayat() {
    try {
        const data = localStorage.getItem(RIWAYAT_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function simpanRiwayat(items, total) {
    const riwayat = getRiwayat();

    riwayat.unshift({
        tanggal: new Date().toLocaleString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }),
        items: items.map(i => ({ nama: i.nama, qty: i.qty, satuan: i.satuan, hargaSatuan: i.hargaSatuan })),
        total: total
    });

    localStorage.setItem(RIWAYAT_KEY, JSON.stringify(riwayat.slice(0, RIWAYAT_MAX)));
}

function updateRiwayatBadge() {
    const badge = document.getElementById('riwayat-badge-count');
    if (!badge) return;

    const keranjang = getKeranjang();
    if (keranjang.length > 0) {
        badge.innerText = keranjang.length;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function renderRiwayat() {
    const riwayat = getRiwayat();

    const container = document.getElementById('riwayat-items');
    if (!container) return;

    const clearBtn = document.getElementById('riwayat-clear-btn');

    if (riwayat.length === 0) {
        container.innerHTML = '<p class="riwayat-empty">Belum ada riwayat pembelian.</p>';
        if (clearBtn) clearBtn.style.display = 'none';
        return;
    }

    let html = '';
    riwayat.forEach(order => {
        const daftarItem = order.items.map(it => `${it.nama} x${it.qty}`).join(', ');
        html += `
            <div class="riwayat-item">
                <div class="riwayat-tanggal">${order.tanggal}</div>
                <div class="riwayat-produk">${daftarItem}</div>
                <div class="riwayat-total">${formatRupiah(order.total)}</div>
            </div>
        `;
    });

    container.innerHTML = html;
    if (clearBtn) clearBtn.style.display = 'inline-block';
}

function hapusRiwayat() {
    if (!confirm('Hapus semua riwayat pembelian?')) return;
    localStorage.removeItem(RIWAYAT_KEY);
    renderRiwayat();
}

function openRiwayatModal() {
    renderRiwayat();
    const modal = document.getElementById('riwayat-modal');
    if (modal) modal.classList.add('riwayat-modal-show');
    document.body.style.overflow = 'hidden';
}

function closeRiwayatModal() {
    const modal = document.getElementById('riwayat-modal');
    if (modal) modal.classList.remove('riwayat-modal-show');
    document.body.style.overflow = '';
}

function closeRiwayatModalOutside(event) {
    if (event.target.id === 'riwayat-modal') {
        closeRiwayatModal();
    }
}

function checkout() {
    const keranjang = getKeranjang();

    if (keranjang.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    let pesan = "Hallo Gachifa Bakery!%0A%0ASaya ingin memesan:%0A%0A";
    let total = 0;

    keranjang.forEach((item) => {
        const sub = subtotalItem(item);
        total += sub;

        const detail = item.qty > 1
            ? `${item.nama} (${item.qty} ${item.satuan} x ${formatRupiah(item.hargaSatuan)}) - ${formatRupiah(sub)}`
            : `${item.nama} - ${formatRupiah(sub)}`;

        pesan += "    •  " + detail + "%0A";
    });

    pesan += "%0ATotal: " + formatRupiah(total) + "%0A%0APlease confirm my order.";

    simpanRiwayat(keranjang, total);
    renderRiwayat();

    window.open("https://wa.me/" + nomorWA + "?text=" + pesan, '_blank');
}

function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const overlay = document.getElementById('navOverlay');
    if (!navLinks) return;

    const isOpen = navLinks.classList.toggle('nav-open');
    if (overlay) overlay.classList.toggle('nav-overlay-show', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const overlay = document.getElementById('navOverlay');
    if (navLinks) navLinks.classList.remove('nav-open');
    if (overlay) overlay.classList.remove('nav-overlay-show');
    document.body.style.overflow = '';
}

function setActiveNavByPage() {
    const navLinks = document.querySelectorAll('.nav-links a');
    let currentPage = window.location.pathname.split('/').pop();
    if (currentPage === '' || currentPage === '/') currentPage = 'index.html';
    const currentKey = currentPage.replace('.html', '');

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === currentKey) {
            link.classList.add('active');
        }
    });
}

let activeCategory = 'all';

function setCategory(cat, btnEl) {
    activeCategory = cat;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    filterMenu();
}

function filterMenu() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClearBtn');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (clearBtn) clearBtn.style.display = searchTerm !== '' ? 'flex' : 'none';

    const cards = document.querySelectorAll('.product-grid .card');
    let visibleCount = 0;

    cards.forEach(card => {
        const cat = card.dataset.category || '';
        const name = card.dataset.name || '';
        const matchCategory = activeCategory === 'all' || cat === activeCategory;
        const matchSearch = searchTerm === '' || name.includes(searchTerm);

        if (matchCategory && matchSearch) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    const noResults = document.getElementById('no-results');
    if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    filterMenu();
}

let toastTimeout;

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('toast-show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('toast-show');
    }, 2500);
}

document.addEventListener('DOMContentLoaded', function() {
    setActiveNavByPage();
    updateNavBadge();
    updateRiwayatBadge();
    updateTampilanKeranjang();
    renderRiwayat();
});