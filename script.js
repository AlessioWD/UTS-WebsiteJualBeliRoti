let keranjang = [];

const nomorWA = "6285755453950";

function beliRoti(namaRoti, harga) {
    keranjang.push({
        nama: namaRoti,
        harga: harga
    });

    updateTampilanKeranjang();

    document.getElementById('keranjang-count').innerText = keranjang.length + ' item';

    alert(namaRoti + " ditambahkan ke keranjang!");
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

const sections = document.querySelectorAll('section, header, footer');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', function() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});