let keranjang = [];
const nomorWA = "6285755453950";

function beliRoti(namaRoti, harga) {
    keranjang.push({
        nama: namaRoti,
        harga: harga
    });
    
    updateTampilanKeranjang();
    document.getElementById('keranjang-count').innerText = keranjang.length + ' item';
}

function hapusKeranjang(index) {
    keranjang.splice(index, 1);
    updateTampilanKeranjang();
    document.getElementById('keranjang-count').innerText = keranjang.length + ' item';
}

function updateTampilanKeranjang() {
    const keranjangDiv = document.getElementById('keranjang-items');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (keranjang.length === 0) {
        keranjangDiv.innerHTML = '<p style="color: #666;">Keranjang kosong...</p>';
        if (checkoutBtn) checkoutBtn.style.display = 'none';
        return;
    }
    
    let total = 0;
    let html = '';
    
    keranjang.forEach((item, index) => {
        html += `
            <div class="keranjang-item">
                <div>
                    <strong>${item.nama}</strong>
                    <br><small>${item.harga}</small>
                </div>
                <button onclick="hapusKeranjang(${index})" class="btn-hapus">Hapus</button>
            </div>
        `;
        
        let hargaAngka = item.harga.replace(/[^0-9]/g, '');
        total += parseInt(hargaAngka);
    });
    
    html += `<div class="keranjang-total">Total: Rp ${total.toLocaleString()}</div>`;
    keranjangDiv.innerHTML = html;
    
    if (checkoutBtn) checkoutBtn.style.display = 'inline-block';
}

function checkout() {
    if (keranjang.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }
    
    let pesan = "Hallo Gachifa Bakery!%0A%0ASaya ingin memesan:%0A%0A";
    let total = 0;
    
    keranjang.forEach((item) => {
        pesan += "    •  " + item.nama + " - " + item.harga + "%0A";
        let hargaAngka = item.harga.replace(/[^0-9]/g, '');
        total += parseInt(hargaAngka);
    });
    
    pesan += "%0ATotal: Rp " + total.toLocaleString() + "%0A%0APlease confirm my order.";
    
    window.open("https://wa.me/" + nomorWA + "?text=" + pesan, '_blank');
}

// NAVBAR ACTIVE - PERBAIKAN
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section[id], header[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    // Fungsi untuk hapus semua active
    function removeAllActive() {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
    }

    // Fungsi untuk tambah active sesuai id
    function addActive(id) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
            }
        });
    }

    // Saat KLIK menu
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Langsung hapus semua active dulu
            removeAllActive();
            
            // Tambah active ke yang diklik saja
            this.classList.add('active');
            
            // Smooth scroll
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Saat SCROLL
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (pageYOffset >= (sectionTop - 300)) {
                current = sectionId;
            }
        });
        
        if (current) {
            addActive(current);
        }
    });
});