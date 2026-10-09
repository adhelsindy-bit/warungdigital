/* ==========================================================================
   WARUNG DIGITAL / KASIR WARUNG - DELSI SHOP
   Script - JavaScript Vanilla + Firebase Firestore + Product Images
   ========================================================================== */

// --- Global State ---
let products = [];
let transactions = [];
let cart = [];
let currentLastTransaction = null;
let firstRunSeeded = false;

// LocalStorage Keys
const STORAGE_PRODUCTS_KEY = 'warung_products_delsi';
const STORAGE_TRANSACTIONS_KEY = 'warung_transactions_delsi';

// Placeholder Gambar Default jika gambar produk tidak diisi / gagal dimuat
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=150&auto=format&fit=crop';

// Tampilkan error JavaScript yang tidak tertangani sebagai notifikasi,
// supaya masalah tidak "diam-diam" tidak berfungsi (mis. tombol Update tidak bereaksi).
window.addEventListener('error', function (event) {
    console.error('Runtime error:', event.error || event.message);
    if (typeof showToast === 'function') {
        showToast('Terjadi error: ' + (event.message || 'tidak diketahui'), 'danger');
    }
});
window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// Data Sampel Awal Lengkap dengan Foto Produk (sesuai nama produk)
const SAMPLE_PRODUCTS = [
    {
        kode: 'BRG001',
        nama: 'Beras Premium 5kg',
        harga: 65000, modal: 55000,
        stok: 20,
        gambar: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG002',
        nama: 'Minyak Goreng 1L',
        harga: 18000, modal: 15000,
        stok: 35,
        gambar: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG003',
        nama: 'Gula Pasir 1kg',
        harga: 15000, modal: 12000,
        stok: 25,
        gambar: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG004',
        nama: 'Mie Instan Goreng',
        harga: 3000, modal: 2200,
        stok: 120,
        gambar: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG005',
        nama: 'Kopi Kapal Api 165g',
        harga: 14000, modal: 11000,
        stok: 50,
        gambar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG006',
        nama: 'Telur Ayam 1kg',
        harga: 28000, modal: 24000,
        stok: 30,
        gambar: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG007',
        nama: 'Susu Kental Manis 370g',
        harga: 12000, modal: 9500,
        stok: 40,
        gambar: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG008',
        nama: 'Tepung Terigu 1kg',
        harga: 11000, modal: 9000,
        stok: 30,
        gambar: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG009',
        nama: 'Kecap Manis 520ml',
        harga: 19000, modal: 15000,
        stok: 20,
        gambar: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG010',
        nama: 'Saus Sambal 335ml',
        harga: 13000, modal: 10000,
        stok: 25,
        gambar: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG011',
        nama: 'Teh Celup Isi 25',
        harga: 8000, modal: 6000,
        stok: 45,
        gambar: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG012',
        nama: 'Air Mineral Botol 600ml',
        harga: 4000, modal: 2800,
        stok: 80,
        gambar: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG013',
        nama: 'Sabun Mandi Batang',
        harga: 4500, modal: 3200,
        stok: 60,
        gambar: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG014',
        nama: 'Deterjen Bubuk 800g',
        harga: 18000, modal: 14000,
        stok: 25,
        gambar: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG015',
        nama: 'Gas LPG 3kg (Isi Ulang)',
        harga: 21000, modal: 18500,
        stok: 15,
        gambar: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=300&auto=format&fit=crop'
    }
];

// --- Inisialisasi Aplikasi Saat DOM Loaded ---
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
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
   0. AUTENTIKASI (LOGIN / LOGOUT)
   ========================================================================== */
const STORAGE_SESSION_KEY = 'warung_session_delsi';
const STORAGE_USERS_KEY = 'warung_users_delsi';

// Hash sederhana (bukan kriptografi kuat) - cukup agar password tidak tersimpan plaintext
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0;
    }
    return 'h' + Math.abs(hash).toString(16);
}

function getUsers() {
    let users = [];
    try {
        users = JSON.parse(localStorage.getItem(STORAGE_USERS_KEY)) || [];
    } catch (e) {
        users = [];
    }
    // Buat akun default admin/admin123 bila belum ada user sama sekali
    if (users.length === 0) {
        users = [{ username: 'admin', password: simpleHash('admin123'), role: 'Administrator' }];
        try {
            localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
        } catch (e) {
            console.warn('Gagal menyimpan user default:', e);
        }
    }
    return users;
}

function getSession() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_SESSION_KEY));
    } catch (e) {
        return null;
    }
}

// Cek sesi saat halaman dibuka: tampilkan app bila sudah login
function initAuth() {
    const session = getSession();
    if (session && session.username) {
        document.body.classList.remove('logged-out');
        applySessionToHeader(session);
    } else {
        document.body.classList.add('logged-out');
    }
}

// Tampilkan nama user, role, dan tombol Kelola User (admin saja) di header
function applySessionToHeader(session) {
    const userEl = document.getElementById('logged-user');
    if (userEl) userEl.textContent = session.username;

    const roleEl = document.getElementById('logged-role');
    const role = session.role || 'Kasir';
    if (roleEl) roleEl.textContent = '(' + role + ')';

    const btnKelola = document.getElementById('btn-kelola-user');
    if (btnKelola) btnKelola.style.display = (role === 'Administrator') ? 'inline-flex' : 'none';
}

function showLoginError(msg) {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    }
    // Animasi goyang pada kartu login
    const card = document.querySelector('.login-card');
    if (card) {
        card.classList.remove('shake');
        void card.offsetWidth; // restart animasi
        card.classList.add('shake');
    }
}

function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    if (errorEl) errorEl.style.display = 'none';

    if (!username || !password) {
        showLoginError('Username dan password wajib diisi.');
        return;
    }

    const users = getUsers();
    const inputHash = simpleHash(password);
    const user = users.find(u =>
        u.username.toLowerCase() === username.toLowerCase() && u.password === inputHash
    );

    if (!user) {
        showLoginError('Username atau password salah. Silakan coba lagi.');
        return;
    }

    // Simpan sesi (tetap login sampai tombol Keluar ditekan)
    const session = {
        username: user.username,
        role: user.role || 'Kasir',
        loginAt: new Date().toISOString()
    };
    try {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } catch (err) {
        showLoginError('Gagal menyimpan sesi: ' + err.message);
        return;
    }

    // Bersihkan form & tampilkan aplikasi
    document.getElementById('login-form').reset();
    document.body.classList.remove('logged-out');
    applySessionToHeader(session);

    showToast(`Selamat datang, ${user.username}! (${session.role})`, 'success');
}

function handleLogout() {
    if (!confirm('Keluar dari akun ini?')) return;

    try {
        localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (e) {
        console.warn('Gagal menghapus sesi:', e);
    }

    document.body.classList.add('logged-out');

    // Reset form login
    const form = document.getElementById('login-form');
    if (form) form.reset();
    const errorEl = document.getElementById('login-error');
    if (errorEl) errorEl.style.display = 'none';
    const passInput = document.getElementById('login-password');
    if (passInput) passInput.type = 'password';
    const passIcon = document.getElementById('toggle-pass-icon');
    if (passIcon) passIcon.className = 'fa-solid fa-eye';

    // Pindah ke tab dashboard agar bersih saat login berikutnya
    switchTab('dashboard');
}

function togglePassword() {
    const input = document.getElementById('login-password');
    const icon = document.getElementById('toggle-pass-icon');
    if (!input || !icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
    }
}

/* ==========================================================================
   0b. KELOLA USER (TAMBAH / HAPUS / GANTI PASSWORD)
   ========================================================================== */

function isAdmin() {
    const session = getSession();
    return !!(session && (session.role || 'Kasir') === 'Administrator');
}

function openUserModal() {
    if (!isAdmin()) {
        showToast('Hanya Administrator yang bisa kelola user.', 'warning');
        return;
    }
    const overlay = document.getElementById('user-modal-overlay');
    if (!overlay) return;

    renderUserList();

    // Sembunyikan form tambah user bila bukan admin (pengaman ekstra)
    const addSection = document.getElementById('add-user-section');
    if (addSection) addSection.style.display = isAdmin() ? 'block' : 'none';

    // Class .active dibutuhkan CSS (.modal-overlay tanpa .active = opacity 0 + pointer-events none)
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('active'));
}

function closeUserModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const overlay = document.getElementById('user-modal-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        overlay.style.display = 'none';
    }

    // Reset form-form di dalam modal
    const addForm = document.getElementById('form-add-user');
    if (addForm) addForm.reset();
    const chgForm = document.getElementById('form-change-pass');
    if (chgForm) chgForm.reset();
}

function renderUserList() {
    const listEl = document.getElementById('user-list');
    if (!listEl) return;

    const users = getUsers();
    const session = getSession();
    const currentName = session ? session.username : '';

    if (users.length === 0) {
        listEl.innerHTML = '<p class="form-info">Belum ada akun.</p>';
        return;
    }

    listEl.innerHTML = users.map((u, idx) => {
        const role = u.role || 'Kasir';
        const roleClass = role === 'Administrator' ? 'admin' : 'kasir';
        const isMe = u.username === currentName;
        const isLastAdmin = role === 'Administrator' &&
            users.filter(x => (x.role || 'Kasir') === 'Administrator').length <= 1;
        const cannotDelete = isMe || isLastAdmin;

        let reason = '';
        if (isMe) reason = 'Tidak bisa menghapus akun sendiri';
        else if (isLastAdmin) reason = 'Harus ada minimal 1 Administrator';

        return `
            <div class="user-item">
                <div class="user-item-info">
                    <span class="user-avatar">${escapeHtml(u.username.charAt(0).toUpperCase())}</span>
                    <div>
                        <div class="user-item-name">${escapeHtml(u.username)}</div>
                        <div class="user-item-meta">${role}</div>
                    </div>
                </div>
                <div class="user-item-actions">
                    ${isMe ? '<span class="you-badge">Anda</span>' : ''}
                    <span class="role-badge ${roleClass}">${role === 'Administrator' ? 'Admin' : 'Kasir'}</span>
                    <button class="btn-user-delete" onclick="deleteUser(${idx})"
                            ${cannotDelete ? 'disabled' : ''}
                            title="${cannotDelete ? reason : 'Hapus akun ini'}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>`;
    }).join('');
}

function saveUsers(users) {
    try {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
        return true;
    } catch (err) {
        console.error('Gagal menyimpan user:', err);
        showToast('Gagal menyimpan: penyimpanan browser penuh!', 'danger');
        return false;
    }
}

function handleAddUser(e) {
    e.preventDefault();

    if (!isAdmin()) {
        showToast('Hanya Administrator yang bisa menambah user.', 'warning');
        return;
    }

    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;

    if (username.length < 3) {
        showToast('Username minimal 3 karakter.', 'warning');
        return;
    }
    if (password.length < 4) {
        showToast('Password minimal 4 karakter.', 'warning');
        return;
    }
    // Username tidak boleh mengandung koma (memicu error CSV import)
    if (/[\\,\n\r]/.test(username)) {
        showToast('Username tidak boleh mengandung koma atau baris baru.', 'warning');
        return;
    }

    const users = getUsers();
    const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
        showToast(`Username '${username}' sudah dipakai.`, 'danger');
        return;
    }

    users.push({
        username: username,
        password: simpleHash(password),
        role: role,
        createdAt: new Date().toISOString()
    });

    if (saveUsers(users)) {
        document.getElementById('form-add-user').reset();
        renderUserList();
        showToast(`Akun '${username}' (${role}) berhasil ditambahkan!`, 'success');
    }
}

function deleteUser(index) {
    if (!isAdmin()) {
        showToast('Hanya Administrator yang bisa menghapus user.', 'warning');
        return;
    }

    const users = getUsers();
    const target = users[index];
    if (!target) return;

    const session = getSession();
    if (session && target.username === session.username) {
        showToast('Tidak bisa menghapus akun sendiri.', 'warning');
        return;
    }

    const role = target.role || 'Kasir';
    const adminCount = users.filter(u => (u.role || 'Kasir') === 'Administrator').length;
    if (role === 'Administrator' && adminCount <= 1) {
        showToast('Harus ada minimal 1 Administrator.', 'warning');
        return;
    }

    if (!confirm(`Hapus akun '${target.username}' (${role})?`)) return;

    users.splice(index, 1);
    if (saveUsers(users)) {
        renderUserList();
        showToast(`Akun '${target.username}' berhasil dihapus.`, 'info');
    }
}

function handleChangePassword(e) {
    e.preventDefault();

    const session = getSession();
    if (!session) {
        showToast('Sesi tidak ditemukan. Silakan login ulang.', 'danger');
        return;
    }

    const oldPass = document.getElementById('old-password').value;
    const newPass = document.getElementById('chg-new-password').value;
    const repeatPass = document.getElementById('repeat-password').value;

    if (newPass.length < 4) {
        showToast('Password baru minimal 4 karakter.', 'warning');
        return;
    }
    if (newPass !== repeatPass) {
        showToast('Password baru dan ulangannya tidak cocok.', 'danger');
        return;
    }
    if (newPass === oldPass) {
        showToast('Password baru berbeda dari password lama.', 'warning');
        return;
    }

    const users = getUsers();
    const idx = users.findIndex(u => u.username === session.username);
    if (idx === -1) {
        showToast('Akun tidak ditemukan.', 'danger');
        return;
    }
    if (users[idx].password !== simpleHash(oldPass)) {
        showToast('Password lama salah.', 'danger');
        return;
    }

    users[idx].password = simpleHash(newPass);
    users[idx].passwordChangedAt = new Date().toISOString();

    if (saveUsers(users)) {
        document.getElementById('form-change-pass').reset();
        showToast('Password berhasil diganti!', 'success');
    }
}

/* ==========================================================================
   1. INISIALISASI DATA, LOCALSTORAGE & FIREBASE FIRESTORE
   ========================================================================== */
function initData() {
    const storedProducts = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (!storedProducts) {
        products = [...SAMPLE_PRODUCTS];
        firstRunSeeded = true;
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

    // Migrasi: buang foto base64 dari item transaksi lama (hemat kuota localStorage)
    let cleaned = false;
    transactions.forEach(t => {
        if (Array.isArray(t.items)) {
            t.items.forEach(item => {
                if (item && typeof item.gambar === 'string' && item.gambar.length > 500) {
                    delete item.gambar;
                    cleaned = true;
                }
            });
        }
    });
    if (cleaned) saveTransactionsToStorage();
}

function saveProductsToStorage() {
    try {
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
        return true;
    } catch (err) {
        console.error('Gagal menyimpan produk ke localStorage:', err);
        showToast('Penyimpanan browser PENUH! Data tidak tersimpan permanen. Hapus foto produk besar atau segera backup (JSON).', 'danger');
        return false;
    }
}

function saveTransactionsToStorage() {
    try {
        localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
        return true;
    } catch (err) {
        console.error('Gagal menyimpan transaksi ke localStorage:', err);
        showToast('Penyimpanan browser PENUH! Transaksi tidak tersimpan permanen. Segera backup data (JSON).', 'danger');
        return false;
    }
}

// Inisialisasi sinkronisasi Firebase secara REAL-TIME.
// Firebase = sumber data utama (dipakai bersama semua perangkat),
// localStorage hanya cadangan/offline.
function initFirebaseSync() {
    const badge = document.getElementById('firebase-status-badge');

    if (typeof db === 'undefined' || !db) {
        console.warn("Firestore belum siap. Menggunakan LocalStorage.");
        if (badge) {
            badge.className = 'firebase-badge offline';
            badge.innerHTML = `<i class="fa-solid fa-hard-drive"></i> Mode Offline (LocalStorage)`;
        }
        return;
    }

    if (badge) {
        badge.className = 'firebase-badge online';
        badge.innerHTML = `<i class="fa-solid fa-cloud"></i> Sinkron Real-time`;
    }

    let firstProductsSnap = true;

    // Dengarkan data produk dari Firestore secara real-time.
    // Semua perangkat akan menampilkan data yang sama (cloud menang).
    db.collection('products').onSnapshot(snapshot => {
        if (snapshot.empty) {
            // Cloud masih kosong (setup pertama) -> unggah data lokal sebagai data awal.
            if (firstProductsSnap) {
                firstProductsSnap = false;
                pushLocalToFirestore(false);
            }
            return;
        }

        const localByKode = new Map(
            products.filter(p => p && p.kode).map(p => [p.kode, p])
        );
        const remoteProducts = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.gambar) data.gambar = DEFAULT_IMAGE;

            // Perbaikan sekali saat pemuatan: kalau cloud tidak punya foto base64
            // padahal perangkat ini memilikinya, pakai & kirim kembali foto lokal itu.
            const local = localByKode.get(data.kode);
            if (firstProductsSnap && local &&
                typeof local.gambar === 'string' && local.gambar.startsWith('data:') &&
                !(typeof data.gambar === 'string' && data.gambar.startsWith('data:'))) {
                data.gambar = local.gambar;
                db.collection('products').doc(data.kode).set(data)
                    .catch(err => console.warn('Gagal perbaiki foto produk:', err));
            }

            remoteProducts.push(data);
        });

        firstProductsSnap = false;
        remoteProducts.sort((a, b) => (a.kode || '').localeCompare(b.kode || ''));

        products = remoteProducts;
        saveProductsToStorage();
        renderProducts();
        populateProductDropdown();
        renderDashboardStokMenipis();
    }, err => console.warn("Gagal mendengar data produk dari Firebase:", err));

    // Dengarkan data transaksi dari Firestore secara real-time.
    db.collection('transactions').onSnapshot(snapshot => {
        if (snapshot.empty) return;

        const remoteTransactions = [];
        snapshot.forEach(doc => remoteTransactions.push(doc.data()));
        remoteTransactions.sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0));

        transactions = remoteTransactions;
        saveTransactionsToStorage();
        renderReports();
        renderDashboardOmzet();
    }, err => console.warn("Gagal mendengar data transaksi dari Firebase:", err));
}

// Menarik data dari Cloud Firestore bila localStorage masih kosong
function pullFromFirestore() {
    const badge = document.getElementById('firebase-status-badge');

    return Promise.all([
        db.collection('products').get(),
        db.collection('transactions').get()
    ]).then(([productSnapshot, transactionSnapshot]) => {
        const hasRemoteData = !productSnapshot.empty || !transactionSnapshot.empty;

        if (hasRemoteData) {
            const remoteProducts = [];
            productSnapshot.forEach(doc => {
                const data = doc.data();
                if (!data.gambar) data.gambar = DEFAULT_IMAGE;
                remoteProducts.push(data);
            });
            remoteProducts.sort((a, b) => a.kode.localeCompare(b.kode));

            const remoteTransactions = [];
            transactionSnapshot.forEach(doc => {
                remoteTransactions.push(doc.data());
            });
            remoteTransactions.sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0));

            products = remoteProducts;
            transactions = remoteTransactions;
            migrateProductModal();
            saveProductsToStorage();
            saveTransactionsToStorage();
            renderProducts();
            populateProductDropdown();
            renderCart();
            renderReports();
            renderDashboardStokMenipis();
            renderDashboardOmzet();

            if (badge) {
                badge.className = 'firebase-badge online';
                badge.innerHTML = `<i class="fa-solid fa-cloud"></i> Data dimuat dari Firebase`;
            }
            console.log(`Memuat ${remoteProducts.length} produk & ${remoteTransactions.length} transaksi dari Firebase (data cloud dipakai).`);
        }

        return hasRemoteData;
    }).catch(err => {
        console.warn("Gagal memuat data dari Firebase:", err);
        return false;
    });
}

// Upload seluruh data localStorage ke Cloud Firestore (data lokal menimpa versi cloud)
// allowDeletes = true hanya untuk perangkat yang sudah punya data lokal (aman untuk sinkron penuh)
function pushLocalToFirestore(allowDeletes) {
    if (typeof db === 'undefined' || !db) return;

    const localProducts = products.filter(p => p && p.kode);
    const localTransactions = transactions.filter(t => t && t.id);

    const upserts = [];

    // Produk: dokumen dengan ID = kode produk
    localProducts.forEach(p => {
        upserts.push({
            ref: db.collection('products').doc(p.kode),
            data: p
        });
    });

    // Transaksi: dokumen dengan ID = nomor transaksi
    localTransactions.forEach(t => {
        upserts.push({
            ref: db.collection('transactions').doc(t.id),
            data: t
        });
    });

    let deleteCount = 0;

    // Hapus data remote yang tidak ada di lokal (hanya jika diizinkan)
    const buildDeletes = () => {
        const localProductCodes = new Set(localProducts.map(p => p.kode));
        const localTransactionIds = new Set(localTransactions.map(t => t.id));
        const getRemoteIds = (collectionName) =>
            db.collection(collectionName).get()
                .then(snapshot => snapshot.docs.map(doc => doc.id))
                .catch(() => []);

        return Promise.all([getRemoteIds('products'), getRemoteIds('transactions')])
            .then(([remoteProductIds, remoteTransactionIds]) => {
                const deletes = [];
                remoteProductIds.forEach(id => {
                    if (!localProductCodes.has(id)) {
                        deletes.push({ ref: db.collection('products').doc(id) });
                    }
                });
                // Hanya hapus transaksi remote bila lokal juga punya data transaksi.
                // Mencegah transaksi cloud terhapus semua saat localStorage kosong/rusak.
                if (localTransactions.length > 0) {
                    remoteTransactionIds.forEach(id => {
                        if (!localTransactionIds.has(id)) {
                            deletes.push({ ref: db.collection('transactions').doc(id) });
                        }
                    });
                }
                deleteCount = deletes.length;
                return deletes;
            });
    };

    const commitOps = (deletes) => {
        const ops = [...upserts, ...deletes];
        if (ops.length === 0) {
            console.log("Tidak ada data lokal untuk disinkronkan.");
            return Promise.resolve();
        }

        // Batch commit (Firestore membatasi 500 operasi per batch, jadi dipecah)
        const BATCH_LIMIT = 400;
        const batchPromises = [];

        for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
            const chunk = ops.slice(i, i + BATCH_LIMIT);
            const batch = db.batch();
            chunk.forEach(op => {
                if (op.data) {
                    batch.set(op.ref, op.data);
                } else {
                    batch.delete(op.ref);
                }
            });
            batchPromises.push(batch.commit());
        }
        return Promise.all(batchPromises);
    };

    const run = allowDeletes ? buildDeletes() : Promise.resolve([]);

    run
        .then(commitOps)
        .then(() => {
            console.log(`Sinkron Firebase selesai: ${upserts.length} diperbarui, ${deleteCount} dihapus.`);
            const badge = document.getElementById('firebase-status-badge');
            if (badge) {
                badge.className = 'firebase-badge online';
                badge.innerHTML = `<i class="fa-solid fa-cloud"></i> Sync OK (${upserts.length} item)`;
            }
            showToast(`Sinkron Firebase: ${upserts.length} diperbarui, ${deleteCount} dihapus.`, 'success');
        })
        .catch(err => {
            console.error("Gagal sinkronisasi ke Firestore:", err);
            showToast('Gagal sinkronisasi ke Firebase. Cek koneksi.', 'danger');
        });
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
                    <button class="btn btn-primary btn-sm" onclick="showProductBarcode(${realIndex})" title="Lihat Barcode">
                        <i class="fa-solid fa-barcode"></i> Barcode
                    </button>
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

    try {
        const editIndex = parseInt(document.getElementById('edit-index').value);
        const namaInput = document.getElementById('nama-barang').value.trim();
        const hargaInput = parseInt(document.getElementById('harga-barang').value);
        const stokInput = parseInt(document.getElementById('stok-barang').value);
        const gambarInput = document.getElementById('gambar-barang').value.trim();

        if (!namaInput || isNaN(hargaInput) || isNaN(stokInput)) {
            showToast('Mohon isi Nama Barang, Harga Jual, dan Stok dengan angka yang benar.', 'warning');
            return;
        }

        let kodeInput;
        if (editIndex === -1) {
            // Produk baru: auto-generate kode
            kodeInput = generateProductCode();
        } else {
            // Edit produk: pertahankan kode lama
            if (!products[editIndex]) {
                showToast('Data barang yang diedit tidak ditemukan. Silakan klik tombol Edit lagi.', 'danger');
                resetProductForm();
                return;
            }
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

        // Simpan/backup langsung ke Firestore (jangan tunggu refresh)
        // supaya perubahan tetap ada walau localStorage penuh atau halaman di-refresh.
        if (typeof db !== 'undefined' && db) {
            db.collection('products').doc(productData.kode).set(productData)
                .catch(err => console.warn('Gagal simpan produk ke Firestore:', err));
        }

        resetProductForm();
        renderProducts();
        populateProductDropdown();
        renderDashboardStokMenipis();
    } catch (err) {
        console.error('Gagal menyimpan barang:', err);
        showToast('Gagal menyimpan barang: ' + err.message, 'danger');
    }
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

        // Hapus juga di Firestore supaya tidak muncul kembali saat refresh
        if (typeof db !== 'undefined' && db) {
            db.collection('products').doc(deletedKode).delete()
                .catch(err => console.warn('Gagal hapus produk di Firestore:', err));
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
        // Simpan item tanpa foto (gambar bisa base64 ratusan KB - bikin localStorage penuh)
        items: cart.map(item => ({
            kode: item.kode,
            nama: item.nama,
            harga: item.harga,
            modal: item.modal || 0,
            jumlah: item.jumlah,
            subtotal: item.subtotal
        })),
        totalItem: cart.reduce((sum, i) => sum + i.jumlah, 0),
        total: grandTotal,
        bayar: inputBayar,
        kembalian: kembalian,
        metodePembayaran: metodePembayaran,
        kasir: kasirName
    };

    transactions.unshift(transactionData);
    const savedOk = saveTransactionsToStorage();

    // Backup langsung ke Firestore (jangan tunggu refresh) - data aman walau localStorage penuh
    if (typeof db !== 'undefined' && db) {
        db.collection('transactions').doc(transactionData.id).set(transactionData)
            .catch(err => console.warn('Gagal backup transaksi ke Firestore:', err));
        // Sync juga stok produk yang berubah
        cart.forEach(cartItem => {
            const product = products.find(p => p.kode === cartItem.kode);
            if (product) {
                db.collection('products').doc(product.kode).set(product)
                    .catch(err => console.warn('Gagal sync stok ke Firestore:', err));
            }
        });
    }

    if (!savedOk) {
        showToast('Transaksi TIDAK tersimpan di perangkat (penyimpanan penuh)! Data tetap aman di Firebase.', 'danger');
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
        transactions.splice(index, 1);
        saveTransactionsToStorage();

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
        transactions = [];
        saveTransactionsToStorage();

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
        gambar: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG017', nama: 'Mie Indomie Kuah Soto', harga: 3500, modal: 2500, stok: 80,
        gambar: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG018', nama: 'Mie Sedaap Goreng', harga: 3000, modal: 2200, stok: 90,
        gambar: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG019', nama: 'Kopi ABC Sachet', harga: 2000, modal: 1400, stok: 150,
        gambar: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG020', nama: 'Kopi White Koffie', harga: 3000, modal: 2000, stok: 60,
        gambar: 'https://images.unsplash.com/photo-1497515114583-f21e2f1f577a?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG021', nama: 'Teh Sariwangi Celup', harga: 6500, modal: 5000, stok: 40,
        gambar: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG022', nama: 'Teh Pucuk Harum 350ml', harga: 4000, modal: 2800, stok: 70,
        gambar: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG023', nama: 'Air Mineral Aqua 1500ml', harga: 6500, modal: 4500, stok: 50,
        gambar: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG024', nama: 'Susu UHT Ultra Milk 1L', harga: 16000, modal: 13000, stok: 30,
        gambar: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG025', nama: 'Susu Bendera Kental Manis', harga: 10000, modal: 8000, stok: 35,
        gambar: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&auto=format&fit=crop'
    },
    // ===== Snack & Cemilan =====
    {
        kode: 'BRG026', nama: 'Chitato Sapi Panggang 68g', harga: 10500, modal: 8500, stok: 25,
        gambar: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG027', nama: 'Qtela Singkong Balado 60g', harga: 8000, modal: 6000, stok: 30,
        gambar: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG028', nama: 'Taro Net Seaweed 40g', harga: 5500, modal: 4000, stok: 40,
        gambar: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG029', nama: 'Permen Kopiko 78', harga: 1500, modal: 1000, stok: 200,
        gambar: 'https://images.unsplash.com/photo-1582176604856-e8d411e9b95f?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG030', nama: 'Permen Relaxa', harga: 1500, modal: 1000, stok: 150,
        gambar: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&auto=format&fit=crop'
    },
    // ===== Bumbu Dapur =====
    {
        kode: 'BRG031', nama: 'Garam Dapur Refina 500g', harga: 5000, modal: 3500, stok: 50,
        gambar: 'https://images.unsplash.com/photo-1518110925495-5ae33f44aa2d?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG032', nama: 'Kaldu Masako Ayam 100g', harga: 6000, modal: 4500, stok: 45,
        gambar: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG033', nama: 'Lada Bubuk Koepoe 50g', harga: 8000, modal: 6000, stok: 30,
        gambar: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG034', nama: 'Saus Sambal ABC 275ml', harga: 10000, modal: 7500, stok: 35,
        gambar: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG035', nama: 'Kecap Manis ABC 275ml', harga: 12000, modal: 9000, stok: 40,
        gambar: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300&auto=format&fit=crop'
    },
    // ===== Kebutuhan Pokok =====
    {
        kode: 'BRG036', nama: 'Margarin Blue Band 200g', harga: 9500, modal: 7500, stok: 30,
        gambar: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG037', nama: 'Roti Tawar Sari Roti', harga: 11000, modal: 8500, stok: 20,
        gambar: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG038', nama: 'Telur Ayam Butir', harga: 2500, modal: 2100, stok: 100,
        gambar: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=300&auto=format&fit=crop'
    },
    {
        kode: 'BRG039', nama: 'Sarden ABC Tomat 155g', harga: 11000, modal: 8500, stok: 25,
        gambar: 'https://images.unsplash.com/photo-1534604973900-c43d4c4d8a46?w=300&auto=format&fit=crop'
    },
    // ===== Kebutuhan Rumah Tangga =====
    {
        kode: 'BRG040', nama: 'Shampo Pantene Sachet', harga: 1000, modal: 650, stok: 200,
        gambar: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=300&auto=format&fit=crop'
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
        // Perkecil & kompres foto sebelum disimpan, supaya localStorage tidak cepat penuh.
        compressImageDataUrl(e.target.result).then(function(base64) {
            document.getElementById('gambar-barang').value = base64;
            document.getElementById('gambar-url-input').value = '';

            // Tampilkan preview
            const dropContent = document.getElementById('drop-zone-content');
            const dropPreview = document.getElementById('drop-zone-preview');
            const dropImg = document.getElementById('drop-zone-img');

            dropContent.style.display = 'none';
            dropPreview.style.display = 'flex';
            dropImg.src = base64;

            const kb = Math.round(base64.length / 1024);
            showToast(`Foto produk berhasil dimuat (~${kb} KB).`, 'success');
        });
    };
    reader.readAsDataURL(file);
}

// Kompres & perkecil foto (resize + JPEG) agar hemat penyimpanan browser/Firestore.
// Mengembalikan Promise<string> berisi data URL hasil kompres (atau aslinya bila gagal).
function compressImageDataUrl(dataUrl, maxDim = 640, quality = 0.72) {
    return new Promise(function(resolve) {
        const img = new Image();
        img.onload = function() {
            try {
                let width = img.width;
                let height = img.height;
                if (width > height && width > maxDim) {
                    height = Math.round(height * maxDim / width);
                    width = maxDim;
                } else if (height >= width && height > maxDim) {
                    width = Math.round(width * maxDim / height);
                    height = maxDim;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const out = canvas.toDataURL('image/jpeg', quality);
                // Pakai hasil kompres hanya bila memang lebih kecil
                resolve(out && out.length < dataUrl.length ? out : dataUrl);
            } catch (err) {
                resolve(dataUrl);
            }
        };
        img.onerror = function() { resolve(dataUrl); };
        img.src = dataUrl;
    });
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
 * Callback saat scan berhasil - otomatis tambah ke keranjang
 */
function onScanSuccess(decodedText, decodedResult) {
    // Cari produk berdasarkan kode
    const code = decodedText;
    const found = products.find(p => p.kode === code);

    if (found) {
        // Cek stok
        if (found.stok <= 0) {
            showToast(found.nama + ' stok habis!', 'danger');
            return;
        }

        // Cek apakah sudah ada di keranjang
        const existingIndex = cart.findIndex(item => item.kode === found.kode);

        if (existingIndex >= 0) {
            if (cart[existingIndex].jumlah >= found.stok) {
                showToast(found.nama + ' sudah mencapai stok maksimum!', 'warning');
                return;
            }
            cart[existingIndex].jumlah += 1;
            cart[existingIndex].subtotal = cart[existingIndex].jumlah * found.harga;
        } else {
            cart.push({
                kode: found.kode,
                nama: found.nama,
                harga: found.harga,
                modal: found.modal || 0,
                gambar: found.gambar || DEFAULT_IMAGE,
                jumlah: 1,
                subtotal: found.harga
            });
        }

        // Update tampilan keranjang
        renderCart();
        updateTotalBelanja();

        // Tampilkan panel produk
        showScanProductPanel(found);
    } else {
        // Barang tidak ditemukan
        showScanNotFound(code);
    }

    // Jeda sebentar lalu lanjut scan
    setTimeout(() => {
        if (html5QrCode && html5QrCode.isScanning) {
            html5QrCode.resume();
        }
    }, 800);
}

/**
 * Callback saat scan gagal (normal, terus scanning)
 */
function onScanFailure(error) {
    // Tidak perlu ditampilkan, scanner terus mencari
}

/**
 * Menampilkan status bar di atas scanner
 */
function showScanStatus(text, type) {
    const statusBar = document.getElementById('scan-status-bar');
    const statusIcon = document.getElementById('scan-status-icon');
    const statusText = document.getElementById('scan-status-text');

    if (!statusBar) return;

    statusText.textContent = text;
    statusBar.style.display = 'block';

    // Reset class
    statusBar.className = 'scan-status-bar scan-status-' + type;

    // Sembunyikan setelah 1.5 detik
    clearTimeout(showScanStatus._timer);
    showScanStatus._timer = setTimeout(() => {
        statusBar.style.display = 'none';
    }, 1500);
}

/**
 * Menampilkan panel produk saat scan berhasil
 */
function showScanProductPanel(product) {
    const panel = document.getElementById('scan-product-panel');
    const img = document.getElementById('scan-panel-img');
    const name = document.getElementById('scan-panel-name');
    const price = document.getElementById('scan-panel-price');
    const stock = document.getElementById('scan-panel-stock');
    const qty = document.getElementById('scan-panel-qty');
    const notfound = document.getElementById('scan-notfound-panel');

    if (!panel) return;

    // Sembunyikan panel not found
    if (notfound) notfound.style.display = 'none';

    // Isi data produk
    img.src = product.gambar || DEFAULT_IMAGE;
    name.textContent = product.nama;
    price.textContent = 'Rp ' + Number(product.harga).toLocaleString('id-ID');
    stock.textContent = 'Stok: ' + product.stok;
    qty.textContent = '+1 ke keranjang';

    // Tampilkan panel
    panel.style.display = 'block';
    panel.style.animation = 'none';
    panel.offsetHeight; // reflow
    panel.style.animation = 'slideUpFade 0.35s ease';

    // Sembunyikan setelah 2 detik
    clearTimeout(showScanProductPanel._timer);
    showScanProductPanel._timer = setTimeout(() => {
        panel.style.display = 'none';
    }, 2000);
}

/**
 * Menampilkan panel "Barang tidak ditemukan" saat scan gagal
 */
function showScanNotFound(code) {
    const panel = document.getElementById('scan-notfound-panel');
    const productPanel = document.getElementById('scan-product-panel');

    if (!panel) return;

    // Sembunyikan panel produk
    if (productPanel) productPanel.style.display = 'none';

    // Tampilkan panel not found
    panel.style.display = 'block';
    panel.style.animation = 'none';
    panel.offsetHeight; // reflow
    panel.style.animation = 'slideUpFade 0.35s ease';

    // Tampilkan status bar warning juga
    showScanStatus('Kode "' + code + '" tidak dikenal!', 'warning');

    // Sembunyikan setelah 2 detik
    clearTimeout(showScanNotFound._timer);
    showScanNotFound._timer = setTimeout(() => {
        panel.style.display = 'none';
    }, 2000);
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
        // Tutup barcode modal juga
        const bcOverlay = document.getElementById('barcode-modal-overlay');
        if (bcOverlay && bcOverlay.style.display !== 'none') {
            closeBarcodeModal();
        }
        // Tutup modal kelola user juga
        const userOverlay = document.getElementById('user-modal-overlay');
        if (userOverlay && userOverlay.style.display !== 'none') {
            closeUserModal();
        }
    }
});

/**
 * Menampilkan barcode produk di modal
 */
function showProductBarcode(index) {
    const product = products[index];
    if (!product) return;

    const overlay = document.getElementById('barcode-modal-overlay');
    const nameEl = document.getElementById('barcode-product-name');
    const codeEl = document.getElementById('barcode-code-text');
    const priceEl = document.getElementById('barcode-price');
    const svgEl = document.getElementById('barcode-svg');

    if (!overlay) return;

    // Isi data
    nameEl.textContent = product.nama;
    codeEl.textContent = product.kode;
    priceEl.textContent = 'Rp ' + Number(product.harga).toLocaleString('id-ID');

    // Generate barcode SVG
    try {
        JsBarcode(svgEl, product.kode, {
            format: 'CODE128',
            width: 2,
            height: 60,
            displayValue: false,
            margin: 5,
            lineColor: '#000000',
            background: '#ffffff'
        });
    } catch (e) {
        console.warn('Gagal generate barcode:', e);
        svgEl.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#999" font-size="14">Gagal generate barcode</text>';
    }

    // Tampilkan modal
    overlay.style.display = 'flex';
    overlay.style.animation = 'fadeIn 0.2s ease';
}

/**
 * Menutup barcode modal
 */
function closeBarcodeModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const overlay = document.getElementById('barcode-modal-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 200);
    }
}

/**
 * Mencetak barcode produk
 */
function printProductBarcode() {
    const card = document.getElementById('barcode-card');
    if (!card) return;

    const printWindow = window.open('', '_blank', 'width=400,height=300');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cetak Barcode</title>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    text-align: center;
                }
                .barcode-card {
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    padding: 15px;
                    display: inline-block;
                }
                .shop-name {
                    font-size: 14px;
                    font-weight: bold;
                    margin-bottom: 2px;
                }
                .product-name {
                    font-size: 11px;
                    color: #555;
                    margin-bottom: 8px;
                }
                .price {
                    font-size: 13px;
                    font-weight: bold;
                    margin-top: 5px;
                }
                @media print {
                    body { padding: 5px; }
                    .barcode-card { border: 1px solid #ccc; }
                }
            </style>
        </head>
        <body>
            <div class="barcode-card">
                <p class="shop-name">Delsi Shop</p>
                <p class="product-name">${escapeHtml(document.getElementById('barcode-product-name').textContent)}</p>
                <svg id="print-barcode"></svg>
                <p class="price">${document.getElementById('barcode-price').textContent}</p>
            </div>
            <script>
                JsBarcode('#print-barcode', '${document.getElementById('barcode-code-text').textContent}', {
                    format: 'CODE128',
                    width: 2,
                    height: 50,
                    displayValue: true,
                    margin: 5
                });
                setTimeout(() => { window.print(); window.close(); }, 500);
            <\/script>
        </body>
        </html>
    `);
    printWindow.document.close();
}
