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
        harga: 65000, 
        stok: 20, 
        gambar: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG002', 
        nama: 'Minyak Goreng 1L', 
        harga: 18000, 
        stok: 35, 
        gambar: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG003', 
        nama: 'Gula Pasir 1kg', 
        harga: 15000, 
        stok: 25, 
        gambar: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG004', 
        nama: 'Mie Instan Goreng', 
        harga: 3000, 
        stok: 120, 
        gambar: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG005', 
        nama: 'Kopi Kapal Api 165g', 
        harga: 14000, 
        stok: 50, 
        gambar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG006', 
        nama: 'Telur Ayam 1kg', 
        harga: 28000, 
        stok: 30, 
        gambar: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG007', 
        nama: 'Susu Kental Manis 370g', 
        harga: 12000, 
        stok: 40, 
        gambar: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG008', 
        nama: 'Tepung Terigu 1kg', 
        harga: 11000, 
        stok: 30, 
        gambar: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG009', 
        nama: 'Kecap Manis 520ml', 
        harga: 19000, 
        stok: 20, 
        gambar: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG010', 
        nama: 'Saus Sambal 335ml', 
        harga: 13000, 
        stok: 25, 
        gambar: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG011', 
        nama: 'Teh Celup Isi 25', 
        harga: 8000, 
        stok: 45, 
        gambar: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG012', 
        nama: 'Air Mineral Botol 600ml', 
        harga: 4000, 
        stok: 80, 
        gambar: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG013', 
        nama: 'Sabun Mandi Batang', 
        harga: 4500, 
        stok: 60, 
        gambar: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG014', 
        nama: 'Deterjen Bubuk 800g', 
        harga: 18000, 
        stok: 25, 
        gambar: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=150&auto=format&fit=crop' 
    },
    { 
        kode: 'BRG015', 
        nama: 'Gas LPG 3kg (Isi Ulang)', 
        harga: 21000, 
        stok: 15, 
        gambar: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=150&auto=format&fit=crop' 
    }
];

// --- Inisialisasi Aplikasi Saat DOM Loaded ---
document.addEventListener('DOMContentLoaded', () => {
    initData();
    renderProducts();
    populateProductDropdown();
    renderCart();
    renderReports();
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
            saveProductsToStorage();
            renderProducts();
            populateProductDropdown();
            updateMaxQtyLabel();
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

// Migrasi data Firestore: isi gambar yang hilang & lengkapi produk sampel yang belum ada
function migrateFirestoreProducts(snapshot) {
    try {
        // 1. Tambahkan produk sampel yang belum ada di Firestore (khusus data lama)
        const existingKodes = new Set();
        snapshot.forEach(doc => existingKodes.add(doc.id));
        SAMPLE_PRODUCTS.forEach(sample => {
            if (!existingKodes.has(sample.kode)) {
                db.collection('products').doc(sample.kode).set(sample);
            }
        });

        // 2. Perbaiki produk yang belum memiliki field gambar
        snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.gambar) {
                const sample = SAMPLE_PRODUCTS.find(s => s.kode === doc.id);
                const gambar = sample ? sample.gambar : DEFAULT_IMAGE;
                db.collection('products').doc(doc.id).set({ gambar: gambar }, { merge: true });
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
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-secondary); padding: 1.5rem;">Data barang tidak ditemukan.</td></tr>`;
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

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(product.nama)}" class="product-thumb" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'">
            </td>
            <td><strong>${escapeHtml(product.kode)}</strong></td>
            <td>${escapeHtml(product.nama)}</td>
            <td>${formatRupiah(product.harga)}</td>
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

function handleSaveProduct(e) {
    e.preventDefault();

    const editIndex = parseInt(document.getElementById('edit-index').value);
    const kodeInput = document.getElementById('kode-barang').value.trim().toUpperCase();
    const namaInput = document.getElementById('nama-barang').value.trim();
    const hargaInput = parseInt(document.getElementById('harga-barang').value);
    const stokInput = parseInt(document.getElementById('stok-barang').value);
    const gambarInput = document.getElementById('gambar-barang').value.trim();

    if (!kodeInput || !namaInput || isNaN(hargaInput) || isNaN(stokInput)) {
        showToast('Mohon isi semua field dengan benar.', 'warning');
        return;
    }

    const duplicateIndex = products.findIndex(p => p.kode === kodeInput);
    if (editIndex === -1 && duplicateIndex !== -1) {
        showToast(`Kode barang '${kodeInput}' sudah digunakan!`, 'warning');
        return;
    }
    if (editIndex !== -1 && duplicateIndex !== -1 && duplicateIndex !== editIndex) {
        showToast(`Kode barang '${kodeInput}' sudah digunakan oleh produk lain!`, 'warning');
        return;
    }

    const productData = {
        kode: kodeInput,
        nama: namaInput,
        harga: hargaInput,
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
}

function editProduct(index) {
    const product = products[index];
    if (!product) return;

    document.getElementById('edit-index').value = index;
    document.getElementById('kode-barang').value = product.kode;
    document.getElementById('nama-barang').value = product.nama;
    document.getElementById('harga-barang').value = product.harga;
    document.getElementById('stok-barang').value = product.stok;
    document.getElementById('gambar-barang').value = product.gambar || '';

    document.getElementById('form-barang-title').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Barang`;
    document.getElementById('btn-simpan-barang').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Update Barang`;
    document.getElementById('btn-batal-edit').style.display = 'inline-flex';

    document.getElementById('form-barang').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function resetProductForm() {
    document.getElementById('form-barang').reset();
    document.getElementById('edit-index').value = -1;
    document.getElementById('gambar-barang').value = '';
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

    const transactionData = {
        id: transactionId,
        timestamp: formattedDate,
        rawDate: now.toISOString(),
        items: [...cart],
        totalItem: cart.reduce((sum, i) => sum + i.jumlah, 0),
        total: grandTotal,
        bayar: inputBayar,
        kembalian: kembalian,
        metodePembayaran: metodePembayaran
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

    if (!tbody) return;

    tbody.innerHTML = '';

    const totalOmzet = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTrxCount = transactions.length;

    statOmzet.textContent = formatRupiah(totalOmzet);
    statCount.textContent = `${totalTrxCount} Transaksi`;

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--text-secondary); padding: 1.5rem;">Belum ada riwayat transaksi.</td></tr>`;
        return;
    }

    transactions.forEach((trx, index) => {
        const metodeIcon = getMetodeIcon(trx.metodePembayaran || 'Tunai');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${trx.id}</strong></td>
            <td>${trx.timestamp}</td>
            <td><span class="metode-badge">${metodeIcon} ${escapeHtml(trx.metodePembayaran || 'Tunai')}</span></td>
            <td>${trx.totalItem} Item</td>
            <td><strong>${formatRupiah(trx.total)}</strong></td>
            <td>
                <div class="action-btns">
                    <button class="btn btn-secondary btn-sm" onclick="showReceiptFromReport(${index})" title="Lihat Struk">
                        <i class="fa-solid fa-receipt"></i> Struk
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSingleReport(${index})" title="Hapus Transaksi">
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
   7. HELPER FUNCTIONS
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
