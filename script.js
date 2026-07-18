const nomorWA = "62881036505315"; // Nomor WA resmi (samakan dengan yang di footer/kontak)
const CART_KEY = "gachifaKeranjang";
const RIWAYAT_KEY = "gachifaRiwayat";
const RIWAYAT_MAX = 20; // batasi jumlah riwayat yang disimpan biar tidak kebesaran

// ===== Ambil & simpan keranjang dari localStorage =====
// Keranjang perlu tetap ada walau user pindah halaman (index -> menu -> dst)
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

/**
 * Tambah item ke keranjang.
 * @param {string} namaRoti - Nama produk (untuk ditampilkan)
 * @param {number} hargaSatuan - Harga per satuan (angka murni)
 * @param {number} qty - Jumlah minimal / yang dibeli (default 1)
 * @param {string} satuan - Label satuan, mis. "pcs"
 */
function beliRoti(namaRoti, hargaSatuan, qty = 1, satuan = '') {
    const keranjang = getKeranjang();
    keranjang.push({ nama: namaRoti, hargaSatuan, qty, satuan });
    saveKeranjang(keranjang);

    updateTampilanKeranjang();
    updateNavBadge();
}

function hapusKeranjang(index) {
    const keranjang = getKeranjang();
    keranjang.splice(index, 1);
    saveKeranjang(keranjang);

    updateTampilanKeranjang();
    updateNavBadge();
}

function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

function subtotalItem(item) {
    return item.hargaSatuan * item.qty;
}

// Badge kecil di navbar (link "Menu") yang menunjukkan jumlah item di keranjang,
// muncul di semua halaman supaya user tetap sadar keranjangnya berisi sesuatu.
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

// Hanya dipanggil di halaman yang punya elemen keranjang (menu.html)
function updateTampilanKeranjang() {
    const keranjangDiv = document.getElementById('keranjang-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    const countEl = document.getElementById('keranjang-count');
    if (!keranjangDiv) return; // halaman ini tidak punya section keranjang

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

// ===== Riwayat Pembelian (tersimpan di localStorage, terpisah dari keranjang) =====
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

// Badge jumlah riwayat di tombol jam (ikon Riwayat Pembelian)
function updateRiwayatBadge(riwayat) {
    const badge = document.getElementById('riwayat-badge-count');
    if (!badge) return;

    if (riwayat.length > 0) {
        badge.innerText = riwayat.length;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

function renderRiwayat() {
    const riwayat = getRiwayat();

    // Badge di tombol jam ada di semua halaman yang punya panel riwayat (menu.html)
    updateRiwayatBadge(riwayat);

    const container = document.getElementById('riwayat-items');
    if (!container) return; // halaman ini tidak punya panel riwayat

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

// ===== Modal popup Riwayat Pembelian =====
function openRiwayatModal() {
    renderRiwayat();
    const modal = document.getElementById('riwayat-modal');
    if (modal) modal.classList.add('riwayat-modal-show');
    document.body.style.overflow = 'hidden'; // kunci scroll halaman di belakang popup
}

function closeRiwayatModal() {
    const modal = document.getElementById('riwayat-modal');
    if (modal) modal.classList.remove('riwayat-modal-show');
    document.body.style.overflow = ''; // buka kunci scroll lagi
}

// Tutup modal kalau area gelap di luar box diklik
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

// ===== Hamburger menu mobile =====
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.toggle('nav-open');
}

// ===== Highlight menu navbar sesuai halaman yang sedang dibuka =====
function setActiveNavByPage() {
    const navLinks = document.querySelectorAll('.nav-links a');
    // Ambil nama file halaman saat ini, mis. "menu.html". Kosong / "/" dianggap index.html
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

document.addEventListener('DOMContentLoaded', function() {
    setActiveNavByPage();
    updateNavBadge();
    updateTampilanKeranjang(); // no-op kalau halaman tidak punya section keranjang
    renderRiwayat(); // no-op kalau halaman tidak punya panel riwayat
});