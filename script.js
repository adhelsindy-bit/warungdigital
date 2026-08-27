/* ==========================================================================
   WARUNG DIGITAL / KASIR WARUNG - DELSI SHOP
   Script - JavaScript Vanilla + Firebase Firestore + Product Images
   ========================================================================== */

// --- Global State ---
let products = [];
let transactions = [];
let cart = [];
let currentLastTransaction = null;

// LocalStorage Keys
const STORAGE_PRODUCTS_KEY = 'warung_products_delsi';
const STORAGE_TRANSACTIONS_KEY = 'warung_transactions_delsi';

// Placeholder Gambar Default jika gambar produk tidak diisi / gagal dimuat
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=150&auto=format&fit=crop';

// Data Sampel Awal Lengkap dengan Foto Produk
const SAMPLE_PRODUCTS = [
    { 
        kode: 'BRG001', 
        nama: 'Beras Premium 5kg', 
        harga: 65000, modal: 55000,
        stok: 20, 
        gambar: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG002', 
        nama: 'Minyak Goreng 1L', 
        harga: 18000, modal: 15000,
        stok: 35, 
        gambar: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG003', 
        nama: 'Gula Pasir 1kg', 
        harga: 15000, modal: 12000,
        stok: 25, 
        gambar: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG004', 
        nama: 'Mie Instan Goreng', 
        harga: 3000, modal: 2200,
        stok: 120, 
        gambar: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG005', 
        nama: 'Kopi Kapal Api 165g', 
        harga: 14000, modal: 11000,
        stok: 50, 
        gambar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG006', 
        nama: 'Telur Ayam 1kg', 
        harga: 28000, modal: 24000,
        stok: 30, 
        gambar: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG007', 
        nama: 'Susu Kental Manis 370g', 
        harga: 12000, modal: 9500,
        stok: 40, 
        gambar: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG008', 
        nama: 'Tepung Terigu 1kg', 
        harga: 11000, modal: 9000,
        stok: 30, 
        gambar: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG009', 
        nama: 'Kecap Manis 520ml', 
        harga: 19000, modal: 15000,
        stok: 20, 
        gambar: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG010', 
        nama: 'Saus Sambal 335ml', 
        harga: 13000, modal: 10000,
        stok: 25, 
        gambar: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG011', 
        nama: 'Teh Celup Isi 25', 
        harga: 8000, modal: 6000,
        stok: 45, 
        gambar: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG012', 
        nama: 'Air Mineral Botol 600ml', 
        harga: 4000, modal: 2800,
        stok: 80, 
        gambar: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG013', 
        nama: 'Sabun Mandi Batang', 
        harga: 4500, modal: 3200,
        stok: 60, 
        gambar: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG014', 
        nama: 'Deterjen Bubuk 800g', 
        harga: 18000, modal: 14000,
        stok: 25, 
        gambar: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG015', 
        nama: 'Gas LPG 3kg (Isi Ulang)', 
        harga: 21000, modal: 18500,
        stok: 15, 
        gambar: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=150&auto=format&fit=crop' 
    }
];

// --- Inisialisasi Aplikasi Saat DOM Loaded ---
document.addEventListener('DOMContentLoaded', () => {
    initData();
    migrateProductModal();
    renderProducts();
    populateProductDropdown();
    renderCart();
    renderReports();
    renderDashboardStokMenipis();
    renderDashboardOmzet();
    initFirebaseSync();
});

/* ==========================================================================
   1. INISIALISASI DATA, LOCALSTORAGE & FIREBASE FIRESTORE
   ========================================================================== */
function initData() {
    const storedProducts = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (!storedProducts) {
        products = [...SAMPLE_PRODUCTS];
        saveProductsToStorage();
    } else {
        try {
            products = JSON.parse(storedProducts);
            // Migrasi: isi gambar dari sampel bila kode cocok, selain itu pakai default
            products.forEach(p => {
                if (!p.gambar) {
                    const sample = SAMPLE_PRODUCTS.find(s => s.kode === p.kode);
                    p.gambar = sample ? sample.gambar : DEFAULT_IMAGE;
                }
            });
            if (products.length < 5) {
                products = [...SAMPLE_PRODUCTS];
                saveProductsToStorage();
            }
        } catch (e) {
            products = [...SAMPLE_PRODUCTS];
            saveProductsToStorage();
        }
    }

    const storedTransactions = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
    if (storedTransactions) {
        try {
            transactions = JSON.parse(storedTransactions);
        } catch (e) {
            transactions = [];
            saveTransactionsToStorage();
        }
    } else {
        transactions = [];
    }
}

function saveProductsToStorage() {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
}

function saveTransactionsToStorage() {
    localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
}

function initFirebaseSync() {
    const badge = document.getElementById('firebase-status-badge');

    if (typeof db === 'undefined' || !db) {
        console.warn("Firestore belum siap. Menggunakan LocalStorage.");
        if (badge) {
            badge.className = 'firebase-badge offline';
            badge.innerHTML = `<i class="fa-solid fa-hard-drive"></i> LocalStorage`;
        }
        return;
    }

    if (badge) {
        badge.className = 'firebase-badge online';
        badge.innerHTML = `<i class="fa-solid fa-cloud"></i> Firebase Sync`;
    }

    // Listener Realtime 'products'
    db.collection('products').onSnapshot(snapshot => {
        if (snapshot.empty) {
            console.log("Koleksi Firestore 'products' kosong. Mengunggah data sampel dengan foto...");
            SAMPLE_PRODUCTS.forEach(p => {
                db.collection('products').doc(p.kode).set(p);
            });
        } else {
            // Migrasi & perbaiki data lama yang belum memiliki gambar
            migrateFirestoreProducts(snapshot);

            const remoteProducts = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (!data.gambar) data.gambar = DEFAULT_IMAGE;
                remoteProducts.push(data);
            });
            remoteProducts.sort((a, b) => a.kode.localeCompare(b.kode));
            products = remoteProducts;
            migrateProductModal();
            saveProductsToStorage();
            renderProducts();
            populateProductDropdown();
            updateMaxQtyLabel();
            renderDashboardStokMenipis();
            renderDashboardOmzet();
        }
    }, error => {
        console.warn("Realtime listener products error:", error);
        if (badge) {
            badge.className = 'firebase-badge offline';
            badge.innerHTML = `<i class="fa-solid fa-hard-drive"></i> Offline Mode`;
        }
    });

    // Listener Realtime 'transactions'
    db.collection('transactions').onSnapshot(snapshot => {
        if (!snapshot.empty) {
            const remoteTransactions = [];
            snapshot.forEach(doc => {
                remoteTransactions.push(doc.data());
            });
            remoteTransactions.sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0));
            transactions = remoteTransactions;
            saveTransactionsToStorage();
            renderReports();
        }
    }, error => {
        console.warn("Realtime listener transactions error:", error);
    });
}

// Migrasi data Firestore: isi gambar & modal yang hilang, lengkapi produk sampel yang belum ada
function migrateFirestoreProducts(snapshot) {
    try {
        // 1. Tambahkan produk sampel yang belum ada di Firestore
        const existingKodes = new Set();
        snapshot.forEach(doc => existingKodes.add(doc.id));
        SAMPLE_PRODUCTS.forEach(sample => {
            if (!existingKodes.has(sample.kode)) {
                db.collection('products').doc(sample.kode).set(sample);
            }
        });
        BATCH_PRODUCTS.forEach(sample => {
            if (!existingKodes.has(sample.kode)) {
                db.collection('products').doc(sample.kode).set(sample);
            }
        });

        // 2. Perbaiki produk yang belum memiliki field gambar atau modal
        snapshot.forEach(doc => {
            const data = doc.data();
            const updates = {};
            if (!data.gambar) {
                const sample = SAMPLE_PRODUCTS.find(s => s.kode === doc.id) || BATCH_PRODUCTS.find(s => s.kode === doc.id);
                updates.gambar = sample ? sample.gambar : DEFAULT_IMAGE;
            }
            if (typeof data.modal === 'undefined') {
                const sample = SAMPLE_PRODUCTS.find(s => s.kode === doc.id) || BATCH_PRODUCTS.find(s => s.kode === doc.id);
                updates.modal = sample ? sample.modal : 0;
            }
            if (Object.keys(updates).length > 0) {
                db.collection('products').doc(doc.id).set(updates, { merge: true });
            }
        });
    } catch (err) {
        console.warn("Migrasi Firestore gagal:", err);
    }
}

/* ==========================================================================
   2. NAVIGASI TAB
   ========================================================================== */
function switchTab(tabName) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => btn.classList.remove('active'));

    const targetSection = document.getElementById(`section-${tabName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    const activeBtn = Array.from(navBtns).find(btn => 
        btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName)
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    if (tabName === 'transaksi') {
        populateProductDropdown();
        updateMaxQtyLabel();
    } else if (tabName === 'laporan') {
        renderReports();
    } else if (tabName === 'barang') {
        renderProducts();
    }
}

/* ==========================================================================
   3. MANAJEMEN BARANG (CRUD) WITH IMAGES
   ========================================================================== */

function renderProducts() {
    const tbody = document.getElementById('tbody-barang');
    const searchVal = document.getElementById('search-barang') ? document.getElementById('search-barang').value.toLowerCase().trim() : '';
    
    tbody.innerHTML = '';

    const filteredProducts = products.filter(p => 
        p.nama.toLowerCase().includes(searchVal) || p.kode.toLowerCase().includes(searchVal)
    );

    if (filteredProducts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-secondary); padding: 1.5rem;">Data barang tidak ditemukan.</td></tr>`;
        return;
    }

    filteredProducts.forEach((product) => {
        const realIndex = products.findIndex(p => p.kode === product.kode);

        let stockBadge = `<span class="badge badge-stock-ok">${product.stok}</span>`;
        if (product.stok <= 0) {
            stockBadge = `<span class="badge badge-stock-out">Habis (0)</span>`;
        } else if (product.stok <= 5) {
            stockBadge = `<span class="badge badge-stock-low">Sedikit (${product.stok})</span>`;
        }

        const imgUrl = product.gambar || DEFAULT_IMAGE;
        const modalVal = product.modal || 0;
        const labaVal = product.harga - modalVal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(product.nama)}" class="product-thumb" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'">
            </td>
            <td><strong>${escapeHtml(product.kode)}</strong></td>
            <td>${escapeHtml(product.nama)}</td>
            <td>${formatRupiah(product.harga)}</td>
            <td>${formatRupiah(modalVal)}</td>
            <td><span style="color: var(--success-color); font-weight:600;">${formatRupiah(labaVal)}</span></td>
            <td>${stockBadge}</td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-secondary btn-sm" onclick="editProduct(${realIndex})" title="Edit Barang">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${realIndex})" title="Hapus Barang">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function generateProductCode() {
    const existingCodes = products.map(p => {
        const match = p.kode.match(/^BRG(\d+)$/);
        return match ? parseInt(match[1]) : 0;
    });
    const maxNum = existingCodes.length > 0 ? Math.max(...existingCodes) : 0;
    const nextNum = maxNum + 1;
    return 'BRG' + String(nextNum).padStart(3, '0');
}

function handleSaveProduct(e) {
    e.preventDefault();

    const editIndex = parseInt(document.getElementById('edit-index').value);
    const namaInput = document.getElementById('nama-barang').value.trim();
    const hargaInput = parseInt(document.getElementById('harga-barang').value);
    const stokInput = parseInt(document.getElementById('stok-barang').value);
    const gambarInput = document.getElementById('gambar-barang').value.trim();

    if (!namaInput || isNaN(hargaInput) || isNaN(stokInput)) {
        showToast('Mohon isi semua field dengan benar.', 'warning');
        return;
    }

    let kodeInput;
    if (editIndex === -1) {
        // Produk baru: auto-generate kode
        kodeInput = generateProductCode();
    } else {
        // Edit produk: pertahankan kode lama
        kodeInput = products[editIndex].kode;
    }

    const modalInput = parseInt(document.getElementById('modal-barang').value) || 0;

    const productData = {
        kode: kodeInput,
        nama: namaInput,
        harga: hargaInput,
        modal: modalInput,
        stok: stokInput,
        gambar: gambarInput || DEFAULT_IMAGE
    };

    if (editIndex === -1) {
        products.push(productData);
        showToast('Barang berhasil ditambahkan!', 'success');
    } else {
        products[editIndex] = productData;
        showToast('Data barang berhasil diperbarui!', 'success');
    }

    saveProductsToStorage();
    if (typeof db !== 'undefined' && db) {
        db.collection('products').doc(productData.kode).set(productData).catch(err => {
            console.error("Gagal menyimpan ke Firestore:", err);
        });
    }

    resetProductForm();
    renderProducts();
    populateProductDropdown();
    renderDashboardStokMenipis();
}

function editProduct(index) {
    const product = products[index];
    if (!product) return;

    document.getElementById('edit-index').value = index;
    document.getElementById('kode-barang').value = product.kode;
    document.getElementById('nama-barang').value = product.nama;
    document.getElementById('harga-barang').value = product.harga;
    document.getElementById('modal-barang').value = product.modal || '';
    document.getElementById('stok-barang').value = product.stok;
    document.getElementById('gambar-barang').value = product.gambar || '';
    updateLabaPreview();

    // Tampilkan preview foto produk
    if (product.gambar) {
        const dropContent = document.getElementById('drop-zone-content');
        const dropPreview = document.getElementById('drop-zone-preview');
        const dropImg = document.getElementById('drop-zone-img');
        if (dropContent && dropPreview && dropImg) {
            dropContent.style.display = 'none';
            dropPreview.style.display = 'flex';
            dropImg.src = product.gambar;
            dropImg.onerror = function() { this.src = DEFAULT_IMAGE; };
        }
        // Isi URL input jika bukan base64
        const urlInput = document.getElementById('gambar-url-input');
        if (urlInput && !product.gambar.startsWith('data:')) {
            urlInput.value = product.gambar;
        }
    }

    document.getElementById('form-barang-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Barang`;
    document.getElementById('btn-simpan-barang').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Update Barang`;
    document.getElementById('btn-batal-edit').style.display = 'inline-flex';

    document.getElementById('form-barang').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetProductForm() {
    document.getElementById('form-barang').reset();
    document.getElementById('edit-index').value = -1;
    document.getElementById('gambar-barang').value = '';
    document.getElementById('modal-barang').value = '';
    document.getElementById('info-laba-item').textContent = 'Laba per item: Rp 0';
    removeUploadedPhoto();
    document.getElementById('form-barang-title').innerHTML = `<i class="fa-solid fa-plus-circle"></i> Tambah Barang`;
    document.getElementById('btn-simpan-barang').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Simpan Barang`;
    document.getElementById('btn-batal-edit').style.display = 'none';
}

function deleteProduct(index) {
    const product = products[index];
    if (!product) return;

    if (confirm(`Apakah Anda yakin ingin menghapus '${product.nama}'?`)) {
        const deletedKode = product.kode;
        products.splice(index, 1);
        saveProductsToStorage();

        if (typeof db !== 'undefined' && db) {
            db.collection('products').doc(deletedKode).delete().catch(err => {
                console.error("Gagal menghapus dari Firestore:", err);
            });
        }

        renderProducts();
        populateProductDropdown();
        renderDashboardStokMenipis();
        showToast('Barang telah dihapus.', 'danger');
    }
}

/* ==========================================================================
   4. TRANSAKSI KASIR & PREVIEW PRODUK
   ========================================================================== */

function populateProductDropdown() {
    const select = document.getElementById('select-barang');
    if (!select) return;

    const currentVal = select.value;
    select.innerHTML = `<option value="">-- Pilih Barang --</option>`;

    products.forEach(p => {
        const option = document.createElement('option');
        option.value = p.kode;
        option.textContent = `${p.kode} - ${p.nama} (${formatRupiah(p.harga)})`;
        if (p.stok <= 0) {
            option.disabled = true;
            option.textContent += ' [STOK HABIS]';
        }
        select.appendChild(option);
    });

    select.value = currentVal;
}

function updateMaxQtyLabel() {
    const select = document.getElementById('select-barang');
    const infoStok = document.getElementById('info-stok-pilihan');
    const inputJumlah = document.getElementById('input-jumlah');
    const previewContainer = document.getElementById('preview-produk-container');
    const previewImg = document.getElementById('preview-produk-img');
    const previewNama = document.getElementById('preview-nama');
    const previewHarga = document.getElementById('preview-harga');

    if (!select || !select.value) {
        infoStok.textContent = 'Pilih barang untuk melihat stok';
        infoStok.style.color = 'var(--text-secondary)';
        inputJumlah.removeAttribute('max');
        if (previewContainer) previewContainer.classList.remove('active');
        return;
    }

    const product = products.find(p => p.kode === select.value);
    if (product) {
        const inCartItem = cart.find(c => c.kode === product.kode);
        const alreadyInCartQty = inCartItem ? inCartItem.jumlah : 0;
        const availableStock = product.stok - alreadyInCartQty;

        infoStok.textContent = `Sisa Stok Tersedia: ${availableStock} (Stok Gudang: ${product.stok})`;
        if (availableStock <= 0) {
            infoStok.style.color = 'var(--danger-color)';
        } else if (availableStock <= 5) {
            infoStok.style.color = 'var(--warning-color)';
        } else {
            infoStok.style.color = 'var(--success-color)';
        }

        inputJumlah.max = availableStock;
        if (parseInt(inputJumlah.value) > availableStock && availableStock > 0) {
            inputJumlah.value = availableStock;
        }

        // Tampilkan Preview Foto Produk di POS Panel
        if (previewContainer && previewImg && previewNama && previewHarga) {
            previewImg.src = product.gambar || DEFAULT_IMAGE;
            previewNama.textContent = product.nama;
            previewHarga.textContent = formatRupiah(product.harga);
            previewContainer.classList.add('active');
        }
    }
}

function addToCart(e) {
    e.preventDefault();

    const selectBarang = document.getElementById('select-barang');
    const inputJumlah = document.getElementById('input-jumlah');

    const kode = selectBarang.value;
    const jumlah = parseInt(inputJumlah.value);

    if (!kode) {
        showToast('Silakan pilih barang terlebih dahulu.', 'warning');
        return;
    }

    if (isNaN(jumlah) || jumlah <= 0) {
        showToast('Masukkan jumlah beli yang valid.', 'warning');
        return;
    }

    const product = products.find(p => p.kode === kode);
    if (!product) return;

    const cartIndex = cart.findIndex(item => item.kode === kode);
    const currentQtyInCart = cartIndex !== -1 ? cart[cartIndex].jumlah : 0;
    const totalRequestQty = currentQtyInCart + jumlah;

    if (totalRequestQty > product.stok) {
        showToast(`Stok tidak mencukupi. Sisa stok: ${product.stok - currentQtyInCart}`, 'danger');
        return;
    }

    if (cartIndex !== -1) {
        cart[cartIndex].jumlah = totalRequestQty;
        cart[cartIndex].subtotal = cart[cartIndex].jumlah * cart[cartIndex].harga;
    } else {
        cart.push({
            kode: product.kode,
            nama: product.nama,
            harga: product.harga,
            jumlah: jumlah,
            subtotal: product.harga * jumlah,
            gambar: product.gambar || DEFAULT_IMAGE
        });
    }

    renderCart();
    updateMaxQtyLabel();
    inputJumlah.value = 1;
    showToast(`'${product.nama}' ditambahkan ke keranjang.`, 'success');
}

function renderCart() {
    const tbody = document.getElementById('tbody-keranjang');
    const itemCountBadge = document.getElementById('cart-item-count');
    tbody.innerHTML = '';

    let grandTotal = 0;
    let totalItemsCount = 0;

    if (cart.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-secondary); padding: 1.5rem;">Keranjang belanja masih kosong.</td></tr>`;
        itemCountBadge.textContent = '0 Item';
        document.getElementById('text-total-belanja').textContent = formatRupiah(0);
        onMetodeBayarChange();
        calculateChange();
        return;
    }

    cart.forEach((item, index) => {
        grandTotal += item.subtotal;
        totalItemsCount += item.jumlah;

        const imgUrl = item.gambar || DEFAULT_IMAGE;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(item.nama)}" class="product-thumb" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'">
            </td>
            <td><strong>${escapeHtml(item.nama)}</strong></td>
            <td>${formatRupiah(item.harga)}</td>
            <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <button class="btn btn-secondary btn-sm" onclick="adjustCartQty(${index}, -1)">-</button>
                    <span>${item.jumlah}</span>
                    <button class="btn btn-secondary btn-sm" onclick="adjustCartQty(${index}, 1)">+</button>
                </div>
            </td>
            <td><strong>${formatRupiah(item.subtotal)}</strong></td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="removeFromCart(${index})" title="Hapus dari keranjang">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    itemCountBadge.textContent = `${totalItemsCount} Item`;
    document.getElementById('text-total-belanja').textContent = formatRupiah(grandTotal);
    onMetodeBayarChange();
    calculateChange();
}

function adjustCartQty(index, delta) {
    const item = cart[index];
    if (!item) return;

    const product = products.find(p => p.kode === item.kode);
    const newQty = item.jumlah + delta;

    if (newQty <= 0) {
        removeFromCart(index);
        return;
    }

    if (product && newQty > product.stok) {
        showToast(`Stok '${product.nama}' hanya tersisa ${product.stok}`, 'warning');
        return;
    }

    item.jumlah = newQty;
    item.subtotal = item.jumlah * item.harga;
    renderCart();
    updateMaxQtyLabel();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
    updateMaxQtyLabel();
    showToast('Item dihapus dari keranjang.', 'info');
}

// Dapatkan metode pembayaran yang sedang dipilih
function getMetodeBayar() {
    const select = document.getElementById('select-metode-bayar');
    return select ? select.value : 'Tunai';
}

// Handler perubahan metode pembayaran
function onMetodeBayarChange() {
    const metode = getMetodeBayar();
    const inputBayar = document.getElementById('input-bayar');
    const labelBayar = document.getElementById('label-input-bayar');
    const labelKembalian = document.getElementById('label-kembalian');

    if (metode === 'Tunai') {
        // Tunai: user input uang, hitung kembalian
        inputBayar.disabled = false;
        inputBayar.placeholder = 'Masukkan jumlah uang';
        labelBayar.textContent = 'Uang Bayar (Rp)';
        labelKembalian.textContent = 'Kembalian:';
        if (inputBayar.value) {
            inputBayar.value = '';
        }
    } else {
        // Non-tunai (QRIS/Transfer/E-Wallet): bayar pas sesuai total, tidak ada kembalian
        const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
        inputBayar.disabled = true;
        inputBayar.value = grandTotal > 0 ? grandTotal : '';
        inputBayar.placeholder = 'Otomatis sesuai total';
        labelBayar.textContent = 'Jumlah Dibayar (Otomatis)';
        labelKembalian.textContent = 'Tidak ada kembalian:';
    }

    calculateChange();
}

function calculateChange() {
    const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const inputBayar = parseFloat(document.getElementById('input-bayar').value) || 0;
    const textKembalian = document.getElementById('text-kembalian');
    const metode = getMetodeBayar();

    const kembalian = inputBayar - grandTotal;

    if (metode !== 'Tunai') {
        textKembalian.textContent = formatRupiah(0);
        textKembalian.style.color = 'var(--text-primary)';
    } else if (inputBayar === 0 && grandTotal === 0) {
        textKembalian.textContent = formatRupiah(0);
        textKembalian.style.color = 'var(--text-primary)';
    } else if (kembalian < 0) {
        textKembalian.textContent = `Kurang ${formatRupiah(Math.abs(kembalian))}`;
        textKembalian.style.color = 'var(--danger-color)';
    } else {
        textKembalian.textContent = formatRupiah(kembalian);
        textKembalian.style.color = 'var(--success-color)';
    }

    return kembalian;
}

function resetCart() {
    if (cart.length > 0 && !confirm('Apakah Anda yakin ingin mereset keranjang belanja?')) {
        return;
    }
    cart = [];
    const inputBayar = document.getElementById('input-bayar');
    inputBayar.value = '';
    inputBayar.disabled = false;
    const selectMetode = document.getElementById('select-metode-bayar');
    if (selectMetode) selectMetode.value = 'Tunai';
    renderCart();
    updateMaxQtyLabel();
    onMetodeBayarChange();
    showToast('Transaksi telah di-reset.', 'info');
}

function processSaveTransaction() {
    if (cart.length === 0) {
        showToast('Keranjang belanja masih kosong!', 'warning');
        return;
    }

    const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const inputBayar = parseFloat(document.getElementById('input-bayar').value) || 0;
    const metodePembayaran = getMetodeBayar();

    if (inputBayar < grandTotal) {
        showToast('Uang pembayaran masih kurang!', 'warning');
        return;
    }

    const kembalian = metodePembayaran === 'Tunai' ? inputBayar - grandTotal : 0;

    cart.forEach(cartItem => {
        const product = products.find(p => p.kode === cartItem.kode);
        if (product) {
            product.stok -= cartItem.jumlah;
            if (product.stok < 0) product.stok = 0;

            if (typeof db !== 'undefined' && db) {
                db.collection('products').doc(product.kode).update({ stok: product.stok }).catch(err => {
                    console.error("Gagal update stok di Firestore:", err);
                });
            }
        }
    });
    saveProductsToStorage();

    const now = new Date();
    const formattedDate = formatDate(now);
    const transactionId = 'TRX-' + Date.now().toString().slice(-6);

    const kasirName = document.getElementById('input-kasir') ? document.getElementById('input-kasir').value.trim() || 'Kasir' : 'Kasir';
    const transactionData = {
        id: transactionId,
        timestamp: formattedDate,
        rawDate: now.toISOString(),
        items: [...cart],
        totalItem: cart.reduce((sum, i) => sum + i.jumlah, 0),
        total: grandTotal,
        bayar: inputBayar,
        kembalian: kembalian,
        metodePembayaran: metodePembayaran,
        kasir: kasirName
    };

    transactions.unshift(transactionData);
    saveTransactionsToStorage();

    if (typeof db !== 'undefined' && db) {
        db.collection('transactions').doc(transactionData.id).set(transactionData).catch(err => {
            console.error("Gagal menyimpan transaksi ke Firestore:", err);
        });
    }

    currentLastTransaction = transactionData;

    openReceiptModal(transactionData);

    cart = [];
    const inputBayarField = document.getElementById('input-bayar');
    inputBayarField.value = '';
    inputBayarField.disabled = false;
    const selectMetode = document.getElementById('select-metode-bayar');
    if (selectMetode) selectMetode.value = 'Tunai';
    renderCart();
    renderProducts();
    populateProductDropdown();
    renderReports();
    renderDashboardStokMenipis();
    renderDashboardOmzet();
    onMetodeBayarChange();

    showToast('Transaksi berhasil disimpan & diproses!', 'success');
}

/* ==========================================================================
   5. STRUK / NOTA PEMBAYARAN
   ========================================================================== */

function openReceiptModal(trx) {
    if (!trx) return;

    document.getElementById('receipt-date-time').textContent = trx.timestamp;
    document.getElementById('receipt-id').textContent = `No: ${trx.id}`;

    const itemsBody = document.getElementById('receipt-items-body');
    itemsBody.innerHTML = '';

    trx.items.forEach(item => {
        const trItem = document.createElement('tr');
        trItem.innerHTML = `
            <td colspan="2"><strong>${escapeHtml(item.nama)}</strong></td>
        `;
        const trDetail = document.createElement('tr');
        trDetail.innerHTML = `
            <td>${item.jumlah} x ${formatRupiah(item.harga)}</td>
            <td style="text-align: right;">${formatRupiah(item.subtotal)}</td>
        `;
        itemsBody.appendChild(trItem);
        itemsBody.appendChild(trDetail);
    });

    document.getElementById('receipt-total-val').textContent = formatRupiah(trx.total);
    document.getElementById('receipt-pay-val').textContent = formatRupiah(trx.bayar);
    document.getElementById('receipt-change-val').textContent = formatRupiah(trx.kembalian);
    document.getElementById('receipt-metode-val').textContent = trx.metodePembayaran || 'Tunai';
    const kasirEl = document.getElementById('receipt-kasir-val');
    if (kasirEl) kasirEl.textContent = `Kasir: ${trx.kasir || 'Kasir'}`;

    const modal = document.getElementById('receipt-modal-overlay');
    modal.classList.add('active');
}

function closeReceiptModal() {
    const modal = document.getElementById('receipt-modal-overlay');
    modal.classList.remove('active');
}

function printReceipt() {
    if (cart.length > 0) {
        if (confirm('Transaksi belum disimpan. Simpan transaksi sekarang dan cetak struk?')) {
            processSaveTransaction();
        }
    } else if (currentLastTransaction) {
        openReceiptModal(currentLastTransaction);
    } else if (transactions.length > 0) {
        openReceiptModal(transactions[0]);
    } else {
        showToast('Tidak ada transaksi untuk dicetak struknya.', 'warning');
    }
}

/* ==========================================================================
   6. LAPORAN TRANSAKSI
   ========================================================================== */

function renderReports() {
    const tbody = document.getElementById('tbody-laporan');
    const statOmzet = document.getElementById('stat-total-omzet');
    const statCount = document.getElementById('stat-jumlah-transaksi');
    const statModal = document.getElementById('stat-total-modal');
    const statLaba = document.getElementById('stat-total-laba');

    if (!tbody) return;
    tbody.innerHTML = '';

    // Filter transactions based on current filter
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let filtered = transactions;
    if (currentReportFilter === 'today') {
        filtered = transactions.filter(t => t.rawDate && new Date(t.rawDate) >= todayStart);
    } else if (currentReportFilter === 'week') {
        filtered = transactions.filter(t => t.rawDate && new Date(t.rawDate) >= weekStart);
    } else if (currentReportFilter === 'month') {
        filtered = transactions.filter(t => t.rawDate && new Date(t.rawDate) >= monthStart);
    } else if (currentReportFilter === 'date') {
        const dateVal = document.getElementById('filter-date') ? document.getElementById('filter-date').value : '';
        if (dateVal) {
            // dateVal format: YYYY-MM-DD, trx.timestamp format: DD/MM/YYYY HH:MM:SS
            const parts = dateVal.split('-');
            const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            filtered = transactions.filter(t => t.timestamp && t.timestamp.startsWith(formattedDate));
        }
    }

    // Apply search filter
    const searchVal = document.getElementById('search-laporan') ? document.getElementById('search-laporan').value.toLowerCase().trim() : '';
    if (searchVal) {
        filtered = filtered.filter(t => t.id && t.id.toLowerCase().includes(searchVal));
    }

    const totalOmzet = filtered.reduce((sum, t) => sum + t.total, 0);
    const totalTrxCount = filtered.length;
    const totalModal = filtered.reduce((sum, t) => {
        const tModal = (t.items || []).reduce((s, item) => {
            const p = products.find(pp => pp.kode === item.kode);
            return s + (p ? (p.modal || 0) * item.jumlah : 0);
        }, 0);
        return sum + tModal;
    }, 0);
    const totalLaba = totalOmzet - totalModal;

    statOmzet.textContent = formatRupiah(totalOmzet);
    statCount.textContent = `${totalTrxCount} Transaksi`;
    if (statModal) statModal.textContent = formatRupiah(totalModal);
    if (statLaba) statLaba.textContent = formatRupiah(totalLaba);

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: var(--text-secondary); padding: 1.5rem;">Belum ada riwayat transaksi.</td></tr>`;
        return;
    }

    filtered.forEach((trx) => {
        const realIndex = transactions.indexOf(trx);
        const metodeIcon = getMetodeIcon(trx.metodePembayaran || 'Tunai');
        const trxModal = (trx.items || []).reduce((s, item) => {
            const p = products.find(pp => pp.kode === item.kode);
            return s + (p ? (p.modal || 0) * item.jumlah : 0);
        }, 0);
        const kasir = trx.kasir || 'Kasir';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${trx.id}</strong></td>
            <td>${trx.timestamp}</td>
            <td><span class="metode-badge">${metodeIcon} ${escapeHtml(trx.metodePembayaran || 'Tunai')}</span></td>
            <td>${escapeHtml(kasir)}</td>
            <td>${trx.totalItem} Item</td>
            <td><strong>${formatRupiah(trx.total)}</strong></td>
            <td>${formatRupiah(trxModal)}</td>
            <td><span style="color: var(--success-color); font-weight:600;">${formatRupiah(trx.total - trxModal)}</span></td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-secondary btn-sm" onclick="showReceiptFromReport(${realIndex})" title="Lihat Struk">
                        <i class="fa-solid fa-receipt"></i> Struk
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSingleReport(${realIndex})" title="Hapus Transaksi">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Ikon untuk setiap metode pembayaran di laporan
function getMetodeIcon(metode) {
    switch (metode) {
        case 'QRIS': return '<i class="fa-solid fa-qrcode"></i>';
        case 'Transfer Bank': return '<i class="fa-solid fa-building-columns"></i>';
        case 'E-Wallet': return '<i class="fa-solid fa-mobile-screen-button"></i>';
        default: return '<i class="fa-solid fa-money-bill-wave"></i>';
    }
}

function showReceiptFromReport(index) {
    const trx = transactions[index];
    if (trx) {
        openReceiptModal(trx);
    }
}

function deleteSingleReport(index) {
    const trx = transactions[index];
    if (!trx) return;

    if (confirm(`Apakah Anda yakin ingin menghapus catatan transaksi ${trx.id}?`)) {
        const deletedId = trx.id;
        transactions.splice(index, 1);
        saveTransactionsToStorage();

        if (typeof db !== 'undefined' && db) {
            db.collection('transactions').doc(deletedId).delete().catch(err => {
                console.error("Gagal menghapus transaksi dari Firestore:", err);
            });
        }

        renderReports();
        showToast('Transaksi berhasil dihapus dari laporan.', 'info');
    }
}

function clearAllReports() {
    if (transactions.length === 0) {
        showToast('Tidak ada laporan untuk dihapus.', 'info');
        return;
    }

    if (confirm('APAKAH ANDA YAKIN? Seluruh riwayat laporan transaksi akan dihapus secara permanen!')) {
        const idsToDelete = transactions.map(t => t.id);
        transactions = [];
        saveTransactionsToStorage();

        if (typeof db !== 'undefined' && db) {
            idsToDelete.forEach(id => {
                db.collection('transactions').doc(id).delete();
            });
        }

        renderReports();
        showToast('Seluruh laporan transaksi telah dibersihkan.', 'danger');
    }
}

/* ==========================================================================
   7. LOAD BATCH PRODUK WARUNG (25 PRODUK TAMBAHAN)
   ========================================================================== */

const BATCH_PRODUCTS = [
    // ===== Makanan & Minuman =====
    {
        kode: 'BRG016', nama: 'Mie Indomie Goreng', harga: 3500, modal: 2500, stok: 100,
        gambar: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG017', nama: 'Mie Indomie Kuah Soto', harga: 3500, modal: 2500, stok: 80,
        gambar: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG018', nama: 'Mie Sedaap Goreng', harga: 3000, modal: 2200, stok: 90,
        gambar: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG019', nama: 'Kopi ABC Sachet', harga: 2000, modal: 1400, stok: 150,
        gambar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG020', nama: 'Kopi White Koffie', harga: 3000, modal: 2000, stok: 60,
        gambar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG021', nama: 'Teh Sariwangi Celup', harga: 6500, modal: 5000, stok: 40,
        gambar: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG022', nama: 'Teh Pucuk Harum 350ml', harga: 4000, modal: 2800, stok: 70,
        gambar: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG023', nama: 'Air Mineral Aqua 1500ml', harga: 6500, modal: 4500, stok: 50,
        gambar: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG024', nama: 'Susu UHT Ultra Milk 1L', harga: 16000, modal: 13000, stok: 30,
        gambar: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG025', nama: 'Susu Bendera Kental Manis', harga: 10000, modal: 8000, stok: 35,
        gambar: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&auto=format&fit=crop'
    },
    // ===== Snack & Cemilan =====
    {
        kode: 'BRG026', nama: 'Chitato Sapi Panggang 68g', harga: 10500, modal: 8500, stok: 25,
        gambar: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG027', nama: 'Qtela Singkong Balado 60g', harga: 8000, modal: 6000, stok: 30,
        gambar: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG028', nama: 'Taro Net Seaweed 40g', harga: 5500, modal: 4000, stok: 40,
        gambar: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG029', nama: 'Permen Kopiko 78', harga: 1500, modal: 1000, stok: 200,
        gambar: 'https://images.unsplash.com/photo-1582176604856-e8d411e9b95f?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG030', nama: 'Permen Relaxa', harga: 1500, modal: 1000, stok: 150,
        gambar: 'https://images.unsplash.com/photo-1582176604856-e8d411e9b95f?w=150&auto=format&fit=crop'
    },
    // ===== Bumbu Dapur =====
    {
        kode: 'BRG031', nama: 'Garam Dapur Refina 500g', harga: 5000, modal: 3500, stok: 50,
        gambar: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG032', nama: 'Kaldu Masako Ayam 100g', harga: 6000, modal: 4500, stok: 45,
        gambar: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG033', nama: 'Lada Bubuk Koepoe 50g', harga: 8000, modal: 6000, stok: 30,
        gambar: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG034', nama: 'Saus Sambal ABC 275ml', harga: 10000, modal: 7500, stok: 35,
        gambar: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG035', nama: 'Kecap Manis ABC 275ml', harga: 12000, modal: 9000, stok: 40,
        gambar: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=150&auto=format&fit=crop'
    },
    // ===== Kebutuhan Pokok =====
    {
        kode: 'BRG036', nama: 'Margarin Blue Band 200g', harga: 9500, modal: 7500, stok: 30,
        gambar: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG037', nama: 'Roti Tawar Sari Roti', harga: 11000, modal: 8500, stok: 20,
        gambar: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG038', nama: 'Telur Ayam Butir', harga: 2500, modal: 2100, stok: 100,
        gambar: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=150&auto=format&fit=crop'
    },
    {
        kode: 'BRG039', nama: 'Sarden ABC Tomat 155g', harga: 11000, modal: 8500, stok: 25,
        gambar: 'https://images.unsplash.com/photo-1534604973900-c43d4c4d8a46?w=150&auto=format&fit=crop'
    },
    // ===== Kebutuhan Rumah Tangga =====
    {
        kode: 'BRG040', nama: 'Shampo Pantene Sachet', harga: 1000, modal: 650, stok: 200,
        gambar: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150&auto=format&fit=crop'
    },
];

function loadBatchSampleProducts() {
    let addedCount = 0;
    let skippedCount = 0;

    BATCH_PRODUCTS.forEach(sample => {
        const exists = products.find(p => p.kode === sample.kode);
        if (!exists) {
            products.push({ ...sample });
            addedCount++;
            // Simpan ke Firestore juga
            if (typeof db !== 'undefined' && db) {
                db.collection('products').doc(sample.kode).set(sample).catch(() => {});
            }
        } else {
            skippedCount++;
        }
    });

    saveProductsToStorage();
    renderProducts();
    populateProductDropdown();

    if (addedCount > 0) {
        showToast(`${addedCount} produk berhasil ditambahkan!${skippedCount > 0 ? ` (${skippedCount} sudah ada)` : ''}`, 'success');
    } else {
        showToast('Semua produk sudah ada di database.', 'info');
    }
}

/* ==========================================================================
   8. LABA PREVIEW & MIGRATION DATA
   ========================================================================== */

function updateLabaPreview() {
    const harga = parseInt(document.getElementById('harga-barang').value) || 0;
    const modal = parseInt(document.getElementById('modal-barang').value) || 0;
    const laba = harga - modal;
    const infoEl = document.getElementById('info-laba-item');
    if (infoEl) {
        infoEl.textContent = `Laba per item: ${formatRupiah(laba)}`;
        infoEl.style.color = laba >= 0 ? 'var(--success-color)' : 'var(--danger-color)';
    }
}

/* --- Upload Foto Produk: Drag & Drop + File Select + URL Input --- */

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) processUploadedFile(file);
}

function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    const file = event.dataTransfer.files[0];
    if (file) processUploadedFile(file);
}

function processUploadedFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
        showToast('Format file tidak didukung! Gunakan JPG, PNG, atau WebP.', 'warning');
        return;
    }
    if (file.size > MAX_FILE_SIZE) {
        showToast('Ukuran file terlalu besar! Maks. 2MB.', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result;
        document.getElementById('gambar-barang').value = base64;
        document.getElementById('gambar-url-input').value = '';

        // Tampilkan preview
        const dropContent = document.getElementById('drop-zone-content');
        const dropPreview = document.getElementById('drop-zone-preview');
        const dropImg = document.getElementById('drop-zone-img');

        dropContent.style.display = 'none';
        dropPreview.style.display = 'flex';
        dropImg.src = base64;

        showToast('Foto produk berhasil dimuat!', 'success');
    };
    reader.readAsDataURL(file);
}

function removeUploadedPhoto() {
    document.getElementById('gambar-barang').value = '';
    document.getElementById('file-gambar').value = '';
    document.getElementById('gambar-url-input').value = '';
    document.getElementById('drop-zone-content').style.display = '';
    document.getElementById('drop-zone-preview').style.display = 'none';
    document.getElementById('drop-zone-img').src = '';
}

function handleUrlInput(url) {
    if (url.trim()) {
        document.getElementById('gambar-barang').value = url.trim();
        // Tampilkan preview dari URL
        const dropContent = document.getElementById('drop-zone-content');
        const dropPreview = document.getElementById('drop-zone-preview');
        const dropImg = document.getElementById('drop-zone-img');

        dropContent.style.display = 'none';
        dropPreview.style.display = 'flex';
        dropImg.src = url.trim();
        dropImg.onerror = function() {
            this.src = DEFAULT_IMAGE;
        };
    } else {
        removeUploadedPhoto();
    }
}

// Migrasi data lama: tambahkan field 'modal' jika belum ada
function migrateProductModal() {
    let changed = false;
    products.forEach(p => {
        if (typeof p.modal === 'undefined') {
            const sample = SAMPLE_PRODUCTS.find(s => s.kode === p.kode) || BATCH_PRODUCTS.find(s => s.kode === p.kode);
            p.modal = sample ? sample.modal : 0;
            changed = true;
        }
    });
    if (changed) saveProductsToStorage();
}

/* ==========================================================================
   9. BACKUP, RESTORE, IMPORT, EXPORT
   ========================================================================== */

function backupData() {
    const data = {
        products: products,
        transactions: transactions,
        backupDate: new Date().toISOString(),
        appName: 'Delsi Shop'
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delsi-shop-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup data berhasil diunduh!', 'success');
}

function restoreData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.products || !Array.isArray(data.products)) {
                showToast('Format file backup tidak valid!', 'danger');
                return;
            }

            if (!confirm(`Restore akan mengganti seluruh data.
Produk: ${data.products.length}, Transaksi: ${data.transactions ? data.transactions.length : 0}
Lanjutkan?`)) {
                return;
            }

            products = data.products;
            transactions = data.transactions || [];
            migrateProductModal();
            saveProductsToStorage();
            saveTransactionsToStorage();

            // Sync ke Firestore
            if (typeof db !== 'undefined' && db) {
                products.forEach(p => {
                    db.collection('products').doc(p.kode).set(p).catch(() => {});
                });
                transactions.forEach(t => {
                    db.collection('transactions').doc(t.id).set(t).catch(() => {});
                });
            }

            renderProducts();
            populateProductDropdown();
            renderCart();
            renderReports();
            showToast('Data berhasil direstore dari backup!', 'success');
        } catch (err) {
            showToast('Gagal membaca file backup: ' + err.message, 'danger');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function openImportModal() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const text = ev.target.result;
                let imported = [];

                if (file.name.endsWith('.json')) {
                    const data = JSON.parse(text);
                    imported = Array.isArray(data) ? data : (data.products || []);
                } else if (file.name.endsWith('.csv')) {
                    const lines = text.trim().split('\n');
                    if (lines.length < 2) throw new Error('CSV kosong atau header hilang');
                    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                    for (let i = 1; i < lines.length; i++) {
                        const vals = lines[i].split(',').map(v => v.trim());
                        const obj = {};
                        headers.forEach((h, idx) => {
                            obj[h] = vals[idx] || '';
                        });
                        imported.push({
                            kode: obj.kode || obj.code || ('IMP' + String(i).padStart(3, '0')),
                            nama: obj.nama || obj.name || 'Produk Import',
                            harga: parseInt(obj.harga || obj.price) || 0,
                            modal: parseInt(obj.modal || obj.cost) || 0,
                            stok: parseInt(obj.stok || obj.stock) || 0,
                            gambar: obj.gambar || obj.image || obj.photo || DEFAULT_IMAGE
                        });
                    }
                }

                if (imported.length === 0) {
                    showToast('Tidak ada data yang bisa diimport!', 'warning');
                    return;
                }

                let added = 0, skipped = 0;
                imported.forEach(item => {
                    if (!item.kode || !item.nama) { skipped++; return; }
                    const exists = products.find(p => p.kode === item.kode);
                    if (!exists) {
                        if (!item.gambar) item.gambar = DEFAULT_IMAGE;
                        products.push(item);
                        added++;
                    } else {
                        skipped++;
                    }
                });

                saveProductsToStorage();
                renderProducts();
                populateProductDropdown();
                showToast(`Import selesai: ${added} ditambahkan, ${skipped} dilewati.`, 'success');
            } catch (err) {
                showToast('Gagal import: ' + err.message, 'danger');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function exportCsv() {
    if (transactions.length === 0) {
        showToast('Tidak ada data transaksi untuk diexport.', 'warning');
        return;
    }

    const headers = ['No. Transaksi', 'Tanggal', 'Metode', 'Kasir', 'Jumlah Item', 'Total', 'Modal', 'Laba'];
    const rows = transactions.map(t => {
        const totalModal = (t.items || []).reduce((sum, item) => {
            const p = products.find(pp => pp.kode === item.kode);
            return sum + (p ? (p.modal || 0) * item.jumlah : 0);
        }, 0);
        const kasir = t.kasir || 'Kasir';
        return [
            t.id, t.timestamp, t.metodePembayaran || 'Tunai',
            kasir, t.totalItem, t.total, totalModal, t.total - totalModal
        ].join(',');
    });

    const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delsi-shop-laporan-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Laporan CSV berhasil diunduh!', 'success');
}

function printReport() {
    const printBody = document.getElementById('report-print-body');
    const printDate = document.getElementById('report-print-date');
    const printTotal = document.getElementById('report-print-total');
    const printModal = document.getElementById('report-print-modal');
    const printLaba = document.getElementById('report-print-laba');

    if (!printBody) return;

    printBody.innerHTML = '';
    let grandTotal = 0, grandModal = 0;

    transactions.forEach(t => {
        const totalModal = (t.items || []).reduce((sum, item) => {
            const p = products.find(pp => pp.kode === item.kode);
            return sum + (p ? (p.modal || 0) * item.jumlah : 0);
        }, 0);
        grandTotal += t.total;
        grandModal += totalModal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.id}</td>
            <td>${t.timestamp}</td>
            <td>${t.metodePembayaran || 'Tunai'}</td>
            <td>${t.kasir || 'Kasir'}</td>
            <td>${formatRupiah(t.total)}</td>
            <td>${formatRupiah(totalModal)}</td>
            <td>${formatRupiah(t.total - totalModal)}</td>
        `;
        printBody.appendChild(tr);
    });

    printDate.textContent = `Cetak: ${formatDate(new Date())}`;
    printTotal.textContent = formatRupiah(grandTotal);
    printModal.textContent = formatRupiah(grandModal);
    printLaba.textContent = formatRupiah(grandTotal - grandModal);

    window.print();
}

/* ==========================================================================
   10. FILTER LAPORAN
   ========================================================================== */

let currentReportFilter = 'all';

function setReportFilter(filterType) {
    currentReportFilter = filterType;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === filterType);
    });

    // If date picker, use its value
    if (filterType === 'date') {
        const dateInput = document.getElementById('filter-date');
        if (dateInput) dateInput.focus();
    }

    renderReports();
}

/* ==========================================================================
   11. DASHBOARD: RENDER STOK MENIPIS
   ========================================================================== */

function renderDashboardStokMenipis() {
    const tbody = document.getElementById('tbody-stok-menipis');
    const statMenipis = document.getElementById('dash-stok-menipis');
    if (!tbody) return;

    const menipis = products.filter(p => p.stok <= 5);
    statMenipis.textContent = `${menipis.length} Produk`;

    if (menipis.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-secondary); padding: 1.5rem;">Semua stok produk aman.</td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    menipis.forEach(product => {
        const imgUrl = product.gambar || DEFAULT_IMAGE;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(product.nama)}" class="product-thumb" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'"></td>
            <td><strong>${escapeHtml(product.kode)}</strong></td>
            <td>${escapeHtml(product.nama)}</td>
            <td><span class="badge badge-stock-low">${product.stok}</span></td>
            <td><button class="btn btn-primary btn-sm" onclick="switchTab('barang'); editProduct(${products.indexOf(product)});"><i class="fa-solid fa-pen-to-square"></i> Restock</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDashboardOmzet() {
    const statOmzet = document.getElementById('dash-omzet-7hari');
    if (!statOmzet) return;

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTransactions = transactions.filter(t => {
        if (!t.rawDate) return false;
        return new Date(t.rawDate) >= sevenDaysAgo;
    });

    const omzet = recentTransactions.reduce((sum, t) => sum + t.total, 0);
    statOmzet.textContent = formatRupiah(omzet);
}

/* ==========================================================================
   11. HELPER FUNCTIONS
   ========================================================================== */

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
}

function formatDate(dateObj) {
    const pad = (n) => n.toString().padStart(2, '0');
    const day = pad(dateObj.getDate());
    const month = pad(dateObj.getMonth() + 1);
    const year = dateObj.getFullYear();
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    const seconds = pad(dateObj.getSeconds());

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-circle-check';
    if (type === 'danger') iconClass = 'fa-circle-xmark';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${iconClass}"></i> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}


/* ==========================================================================
   SCANNER BARCODE & QR CODE
   ========================================================================== */

let html5QrCode = null;
let scanCurrentProduct = null;

/**
 * Membuka modal scanner dan menginisialisasi kamera
 */
function openScanner() {
    const overlay = document.getElementById('scanner-modal-overlay');
    const resultContainer = document.getElementById('scan-result-container');
    const cameraContainer = document.getElementById('scanner-camera-container');

    // Reset tampilan
    resultContainer.style.display = 'none';
    cameraContainer.style.display = 'block';
    scanCurrentProduct = null;

    // Tampilkan modal
    overlay.classList.add('active');

    // Mulai scanner
    startScanner();
}

/**
 * Memulai kamera dan scanner
 */
function startScanner() {
    const scannerEl = document.getElementById('scanner-reader');

    // Bersihkan scanner sebelumnya
    if (html5QrCode) {
        try {
            html5QrCode.clear();
        } catch (e) {
            console.warn('Gagal clear scanner:', e);
        }
    }

    html5QrCode = new Html5Qrcode('scanner-reader');

    const config = {
        fps: 10,
        qrbox: function(viewfinderWidth, viewfinderHeight) {
            let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            let size = Math.floor(minEdge * 0.7);
            if (size > 250) size = 250;
            if (size < 150) size = 150;
            return { width: size, height: Math.floor(size * 0.6) };
        },
        aspectRatio: 1.0,
        disableFlip: false
    };

    html5QrCode.start(
        { facingMode: 'environment' }, // Kamera belakang
        config,
        onScanSuccess,
        onScanFailure
    ).catch(function(err) {
        console.error('Gagal start scanner:', err);
        showToast('Gagal mengakses kamera: ' + err, 'danger');
        closeScanner();
    });
}

/**
 * Callback saat scan berhasil
 */
function onScanSuccess(decodedText, decodedResult) {
    // Hentikan scanner
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.pause(true);
    }

    // Tampilkan hasil
    displayScanResult(decodedText);
}

/**
 * Callback saat scan gagal (normal, terus scanning)
 */
function onScanFailure(error) {
    // Tidak perlu ditampilkan, scanner terus mencari
}

/**
 * Menampilkan hasil scan
 */
function displayScanResult(code) {
    const cameraContainer = document.getElementById('scanner-camera-container');
    const resultContainer = document.getElementById('scan-result-container');
    const codeValue = document.getElementById('scan-code-value');
    const productFound = document.getElementById('scan-product-found');
    const productNotFound = document.getElementById('scan-product-notfound');
    const scanProductImg = document.getElementById('scan-product-img');
    const scanProductName = document.getElementById('scan-product-name');
    const scanProductPrice = document.getElementById('scan-product-price');
    const scanProductStock = document.getElementById('scan-product-stock');
    const scanQtyInput = document.getElementById('scan-qty-input');

    // Sembunyikan kamera, tampilkan hasil
    cameraContainer.style.display = 'none';
    resultContainer.style.display = 'block';

    // Tampilkan kode
    codeValue.textContent = code;

    // Cari produk berdasarkan kode
    const found = products.find(p => p.kode === code);

    if (found) {
        scanCurrentProduct = found;
        productFound.style.display = 'block';
        productNotFound.style.display = 'none';

        // Isi data produk
        scanProductImg.src = found.gambar || DEFAULT_IMAGE;
        scanProductImg.onerror = function() { this.src = DEFAULT_IMAGE; };
        scanProductName.textContent = found.nama;
        scanProductPrice.textContent = formatRupiah(found.harga);
        scanProductStock.textContent = 'Stok: ' + found.stok;
        scanQtyInput.value = 1;
        scanQtyInput.max = found.stok;
    } else {
        scanCurrentProduct = null;
        productFound.style.display = 'none';
        productNotFound.style.display = 'block';
    }

    // Animasi sukses
    resultContainer.classList.add('scan-success-flash');
    setTimeout(() => resultContainer.classList.remove('scan-success-flash'), 600);
}

/**
 * Mengubah jumlah item saat scan
 */
function scanChangeQty(delta) {
    const input = document.getElementById('scan-qty-input');
    let val = parseInt(input.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    if (scanCurrentProduct && val > scanCurrentProduct.stok) {
        val = scanCurrentProduct.stok;
        showToast('Melebihi stok yang tersedia!', 'warning');
    }
    if (val > 99) val = 99;
    input.value = val;
}

/**
 * Menambahkan produk scan ke keranjang
 */
function scanAddToCart() {
    if (!scanCurrentProduct) return;

    const qtyInput = document.getElementById('scan-qty-input');
    const qty = parseInt(qtyInput.value) || 1;
    const product = scanCurrentProduct;

    // Cek stok
    if (product.stok < qty) {
        showToast('Stok tidak cukup! Stok tersisa: ' + product.stok, 'danger');
        return;
    }

    // Cek apakah produk sudah ada di keranjang
    const existingIndex = cart.findIndex(item => item.kode === product.kode);

    if (existingIndex >= 0) {
        const newQty = cart[existingIndex].jumlah + qty;
        if (newQty > product.stok) {
            showToast('Jumlah total di keranjang melebihi stok! Stok: ' + product.stok, 'danger');
            return;
        }
        cart[existingIndex].jumlah = newQty;
        cart[existingIndex].subtotal = newQty * product.harga;
    } else {
        cart.push({
            kode: product.kode,
            nama: product.nama,
            harga: product.harga,
            modal: product.modal || 0,
            gambar: product.gambar || DEFAULT_IMAGE,
            jumlah: qty,
            subtotal: qty * product.harga
        });
    }

    // Update tampilan
    renderCart();
    updateTotalBelanja();

    // Reset qty scan
    qtyInput.value = 1;

    showToast(product.nama + ' x' + qty + ' ditambahkan ke keranjang!', 'success');

    // Lanjut scan lagi
    resumeScan();
}

/**
 * Melanjutkan scanning setelah menambah ke keranjang
 */
function resumeScan() {
    const cameraContainer = document.getElementById('scanner-camera-container');
    const resultContainer = document.getElementById('scan-result-container');

    resultContainer.style.display = 'none';
    cameraContainer.style.display = 'block';
    scanCurrentProduct = null;

    // Resume scanner
    if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.resume();
    } else {
        startScanner();
    }
}

/**
 * Menutup scanner dan membersihkan resources
 */
function closeScanner() {
    const overlay = document.getElementById('scanner-modal-overlay');

    overlay.classList.remove('active');

    if (html5QrCode) {
        try {
            if (html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(() => {
                    html5QrCode.clear();
                });
            } else {
                html5QrCode.clear();
            }
        } catch (e) {
            console.warn('Gagal stop scanner:', e);
        }
        html5QrCode = null;
    }
}

// Tutup scanner dengan ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('scanner-modal-overlay');
        if (overlay && overlay.classList.contains('active')) {
            closeScanner();
        }
    }
});
