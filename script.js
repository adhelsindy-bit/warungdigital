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

// Katalog Foto Produk Warung Digital Terverifikasi (HTTP 200 OK & Sesuai Barang Asli)
const PRODUCT_IMAGE_CATALOG = {
    'BRG001': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop', // Beras Premium 5kg
    'BRG002': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop', // Minyak Goreng 1L
    'BRG003': 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=400&auto=format&fit=crop', // Gula Pasir 1kg
    'BRG004': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop', // Mie Instan Goreng
    'BRG005': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop', // Kopi Kapal Api 165g
    'BRG006': 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400&auto=format&fit=crop', // Telur Ayam 1kg
    'BRG007': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop', // Susu Kental Manis 370g
    'BRG008': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop', // Tepung Terigu 1kg
    'BRG009': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop', // Kecap Manis 520ml
    'BRG010': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop', // Saus Sambal 335ml
    'BRG011': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop', // Teh Celup Isi 25
    'BRG012': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&auto=format&fit=crop', // Air Mineral Botol 600ml
    'BRG013': 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&auto=format&fit=crop', // Sabun Mandi Batang
    'BRG014': 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=400&auto=format&fit=crop', // Deterjen Bubuk 800g
    'BRG015': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&auto=format&fit=crop', // Gas LPG 3kg
    'BRG016': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=400&auto=format&fit=crop', // Mie Indomie Goreng
    'BRG017': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop', // Mie Indomie Kuah Soto
    'BRG018': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&auto=format&fit=crop', // Mie Sedaap Goreng
    'BRG019': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop', // Kopi ABC Sachet
    'BRG020': 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=400&auto=format&fit=crop', // Kopi White Koffie
    'BRG021': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop', // Teh Sariwangi Celup
    'BRG022': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop', // Teh Pucuk Harum 350ml
    'BRG023': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&auto=format&fit=crop', // Air Mineral Aqua 1500ml
    'BRG024': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop', // Susu UHT Ultra Milk 1L
    'BRG025': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&auto=format&fit=crop', // Susu Bendera Kental Manis
    'BRG026': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&auto=format&fit=crop', // Chitato Sapi Panggang
    'BRG027': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&auto=format&fit=crop', // Qtela Singkong Balado
    'BRG028': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&auto=format&fit=crop', // Taro Net Seaweed
    'BRG029': 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=400&auto=format&fit=crop', // Permen Kopiko 78
    'BRG030': 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=400&auto=format&fit=crop', // Permen Relaxa
    'BRG031': 'https://images.unsplash.com/photo-1508736793122-f516e3ba5569?w=400&auto=format&fit=crop', // Garam Dapur Refina
    'BRG032': 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=400&auto=format&fit=crop', // Kaldu Masako Ayam
    'BRG033': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop', // Lada Bubuk Koepoe
    'BRG034': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop', // Saus Sambal ABC
    'BRG035': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop', // Kecap Manis ABC
    'BRG036': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&auto=format&fit=crop', // Margarin Blue Band
    'BRG037': 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&auto=format&fit=crop', // Roti Tawar Sari Roti
    'BRG038': 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?w=400&auto=format&fit=crop', // Telur Ayam Butir
    'BRG039': 'https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=400&auto=format&fit=crop', // Sarden ABC Tomat
    'BRG040': 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&auto=format&fit=crop'  // Shampo Pantene
};

// Dapatkan foto produk otomatis berdasarkan kode atau nama barang
function getProductAutoImage(p) {
    if (!p) return DEFAULT_IMAGE;

    // 1. Cek kode barang resmi
    if (p.kode && PRODUCT_IMAGE_CATALOG[p.kode]) {
        return PRODUCT_IMAGE_CATALOG[p.kode];
    }

    // 2. Cek keyword pada nama barang
    const name = (p.nama || '').toLowerCase();

    if (name.includes('beras')) return PRODUCT_IMAGE_CATALOG['BRG001'];
    if (name.includes('minyak')) return PRODUCT_IMAGE_CATALOG['BRG002'];
    if (name.includes('gula')) return PRODUCT_IMAGE_CATALOG['BRG003'];
    if (name.includes('indomie') && name.includes('soto')) return PRODUCT_IMAGE_CATALOG['BRG017'];
    if (name.includes('mie') || name.includes('indomie') || name.includes('sedaap') || name.includes('noodle')) return PRODUCT_IMAGE_CATALOG['BRG004'];
    if (name.includes('white koffie')) return PRODUCT_IMAGE_CATALOG['BRG020'];
    if (name.includes('kopi') || name.includes('coffee') || name.includes('kapal api') || name.includes('koffie')) return PRODUCT_IMAGE_CATALOG['BRG005'];
    if (name.includes('telur')) return PRODUCT_IMAGE_CATALOG['BRG006'];
    if (name.includes('ultra milk')) return PRODUCT_IMAGE_CATALOG['BRG024'];
    if (name.includes('susu') || name.includes('milk') || name.includes('dancow') || name.includes('bendera')) return PRODUCT_IMAGE_CATALOG['BRG007'];
    if (name.includes('terigu') || name.includes('tepung') || name.includes('flour')) return PRODUCT_IMAGE_CATALOG['BRG008'];
    if (name.includes('kecap') || name.includes('bango')) return PRODUCT_IMAGE_CATALOG['BRG009'];
    if (name.includes('saus') || name.includes('sambal') || name.includes('chili')) return PRODUCT_IMAGE_CATALOG['BRG010'];
    if (name.includes('pucuk')) return PRODUCT_IMAGE_CATALOG['BRG022'];
    if (name.includes('teh') || name.includes('tea') || name.includes('sariwangi')) return PRODUCT_IMAGE_CATALOG['BRG011'];
    if (name.includes('aqua') || name.includes('air mineral') || name.includes('le minerale') || name.includes('mineral')) return PRODUCT_IMAGE_CATALOG['BRG012'];
    if (name.includes('sabun') || name.includes('soap') || name.includes('lifebuoy') || name.includes('lux') || name.includes('giv')) return PRODUCT_IMAGE_CATALOG['BRG013'];
    if (name.includes('deterjen') || name.includes('rinso') || name.includes('daia') || name.includes('so klin') || name.includes('boom')) return PRODUCT_IMAGE_CATALOG['BRG014'];
    if (name.includes('gas') || name.includes('lpg') || name.includes('elpiji')) return PRODUCT_IMAGE_CATALOG['BRG015'];
    if (name.includes('chitato') || name.includes('keripik') || name.includes('chips')) return PRODUCT_IMAGE_CATALOG['BRG026'];
    if (name.includes('qtela') || name.includes('singkong')) return PRODUCT_IMAGE_CATALOG['BRG027'];
    if (name.includes('taro')) return PRODUCT_IMAGE_CATALOG['BRG028'];
    if (name.includes('relaxa')) return PRODUCT_IMAGE_CATALOG['BRG030'];
    if (name.includes('permen') || name.includes('kopiko') || name.includes('candy')) return PRODUCT_IMAGE_CATALOG['BRG029'];
    if (name.includes('garam') || name.includes('salt') || name.includes('refina')) return PRODUCT_IMAGE_CATALOG['BRG031'];
    if (name.includes('masako') || name.includes('royco') || name.includes('kaldu') || name.includes('ajinomoto') || name.includes('micin')) return PRODUCT_IMAGE_CATALOG['BRG032'];
    if (name.includes('lada') || name.includes('merica') || name.includes('pepper')) return PRODUCT_IMAGE_CATALOG['BRG033'];
    if (name.includes('margarin') || name.includes('mentega') || name.includes('butter') || name.includes('blue band')) return PRODUCT_IMAGE_CATALOG['BRG036'];
    if (name.includes('roti') || name.includes('bread') || name.includes('sari roti')) return PRODUCT_IMAGE_CATALOG['BRG037'];
    if (name.includes('sarden') || name.includes('sardines') || name.includes('ikan kaleng')) return PRODUCT_IMAGE_CATALOG['BRG039'];
    if (name.includes('shampo') || name.includes('pantene') || name.includes('shampoo') || name.includes('sunsilk') || name.includes('clear')) return PRODUCT_IMAGE_CATALOG['BRG040'];

    return DEFAULT_IMAGE;
}

// Data Sampel Awal Lengkap dengan Foto Produk (sesuai nama produk)
const SAMPLE_PRODUCTS = [
    {
        kode: 'BRG001',
        nama: 'Beras Premium 5kg',
        harga: 65000, modal: 55000,
        stok: 20,
        gambar: PRODUCT_IMAGE_CATALOG['BRG001']
    },
    {
        kode: 'BRG002',
        nama: 'Minyak Goreng 1L',
        harga: 18000, modal: 15000,
        stok: 35,
        gambar: PRODUCT_IMAGE_CATALOG['BRG002']
    },
    {
        kode: 'BRG003',
        nama: 'Gula Pasir 1kg',
        harga: 15000, modal: 12000,
        stok: 25,
        gambar: PRODUCT_IMAGE_CATALOG['BRG003']
    },
    {
        kode: 'BRG004',
        nama: 'Mie Instan Goreng',
        harga: 3000, modal: 2200,
        stok: 120,
        gambar: PRODUCT_IMAGE_CATALOG['BRG004']
    },
    {
        kode: 'BRG005',
        nama: 'Kopi Kapal Api 165g',
        harga: 14000, modal: 11000,
        stok: 50,
        gambar: PRODUCT_IMAGE_CATALOG['BRG005']
    },
    {
        kode: 'BRG006',
        nama: 'Telur Ayam 1kg',
        harga: 28000, modal: 24000,
        stok: 30,
        gambar: PRODUCT_IMAGE_CATALOG['BRG006']
    },
    {
        kode: 'BRG007',
        nama: 'Susu Kental Manis 370g',
        harga: 12000, modal: 9500,
        stok: 40,
        gambar: PRODUCT_IMAGE_CATALOG['BRG007']
    },
    {
        kode: 'BRG008',
        nama: 'Tepung Terigu 1kg',
        harga: 11000, modal: 9000,
        stok: 30,
        gambar: PRODUCT_IMAGE_CATALOG['BRG008']
    },
    {
        kode: 'BRG009',
        nama: 'Kecap Manis 520ml',
        harga: 19000, modal: 15000,
        stok: 20,
        gambar: PRODUCT_IMAGE_CATALOG['BRG009']
    },
    {
        kode: 'BRG010',
        nama: 'Saus Sambal 335ml',
        harga: 13000, modal: 10000,
        stok: 25,
        gambar: PRODUCT_IMAGE_CATALOG['BRG010']
    },
    {
        kode: 'BRG011',
        nama: 'Teh Celup Isi 25',
        harga: 8000, modal: 6000,
        stok: 45,
        gambar: PRODUCT_IMAGE_CATALOG['BRG011']
    },
    {
        kode: 'BRG012',
        nama: 'Air Mineral Botol 600ml',
        harga: 4000, modal: 2800,
        stok: 80,
        gambar: PRODUCT_IMAGE_CATALOG['BRG012']
    },
    {
        kode: 'BRG013',
        nama: 'Sabun Mandi Batang',
        harga: 4500, modal: 3200,
        stok: 60,
        gambar: PRODUCT_IMAGE_CATALOG['BRG013']
    },
    {
        kode: 'BRG014',
        nama: 'Deterjen Bubuk 800g',
        harga: 18000, modal: 14000,
        stok: 25,
        gambar: PRODUCT_IMAGE_CATALOG['BRG014']
    },
    {
        kode: 'BRG015',
        nama: 'Gas LPG 3kg (Isi Ulang)',
        harga: 21000, modal: 18500,
        stok: 15,
        gambar: PRODUCT_IMAGE_CATALOG['BRG015']
    }
];

// --- Inisialisasi Aplikasi Saat DOM Loaded ---
document.addEventListener('DOMContentLoaded', () => {
    initData();
    initCategories();
    initActivityLogs();
    initOrders();
    initCustomerCart();
    initDisplaySettings();
    initPaymentSettings();
    migrateProductModal();
    renderProducts();
    populateProductDropdown();
    renderCart();
    renderReports();
    renderDashboardStats();
    renderDashboardStokMenipis();
    renderDashboardOmzet();
    initAuth();
    initFirebaseSync();
});

/* ==========================================================================
   0. AUTENTIKASI MULTI-ROLE & SESI (ADMIN, KASIR, PELANGGAN)
   ========================================================================== */
const STORAGE_SESSION_KEY = 'warung_session_delsi';
const STORAGE_USERS_KEY = 'warung_users_delsi';
const STORAGE_CATEGORIES_KEY = 'warung_categories_delsi';
const STORAGE_ORDERS_KEY = 'warung_orders_delsi';
const STORAGE_ACTIVITY_LOGS_KEY = 'warung_activity_logs_delsi';
const STORAGE_CUSTOMER_CART_KEY = 'warung_customer_cart_delsi';

// Hash sederhana agar password tidak disimpan dalam format plaintext
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

    // Default Seed Accounts: Admin, Kasir, dan Pelanggan
    const defaultAccounts = [
        {
            username: 'admin',
            password: simpleHash('admin123'),
            role: 'Administrator',
            fullName: 'Admin Utama / Pemilik',
            phone: '081234567890',
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            username: 'kasir',
            password: simpleHash('kasir123'),
            role: 'Kasir',
            fullName: 'Kasir Shift 1',
            phone: '081234567891',
            createdAt: '2026-01-01T00:00:00.000Z'
        },
        {
            username: 'pelanggan',
            password: simpleHash('pelanggan123'),
            role: 'Pelanggan',
            fullName: 'Budi Santoso',
            phone: '081234567892',
            address: 'Jl. Melati No. 45, RT 02/03',
            createdAt: '2026-01-01T00:00:00.000Z'
        }
    ];

    let modified = false;
    defaultAccounts.forEach(def => {
        if (!users.some(u => u.username.toLowerCase() === def.username.toLowerCase())) {
            users.push(def);
            modified = true;
        }
    });

    if (modified) {
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

function getSessionRole() {
    const s = getSession();
    return s && s.role ? s.role : 'Guest';
}

function isAdmin() {
    return getSessionRole() === 'Administrator';
}

function isKasir() {
    return getSessionRole() === 'Kasir';
}

function isPelanggan() {
    return getSessionRole() === 'Pelanggan';
}

// RBAC Guard: memverifikasi role sebelum tindakan tertentu dijalankan
function requireRole(allowedRoles, actionDesc) {
    const currentRole = getSessionRole();
    if (!allowedRoles.includes(currentRole)) {
        const msg = `Akses Ditolak: Fitur '${actionDesc || 'ini'}' hanya dapat diakses oleh ${allowedRoles.join(' / ')}.`;
        showToast(msg, 'danger');
        console.warn(msg, { currentRole, allowedRoles });
        return false;
    }
    return true;
}

// Cek sesi saat halaman dibuka
function initAuth() {
    const session = getSession();
    if (session && session.username) {
        document.body.classList.remove('logged-out');
        applySessionToHeader(session);
        // Navigasikan otomatis ke tab yang sesuai
        const role = session.role || 'Kasir';
        if (role === 'Administrator') {
            switchTab('dashboard');
        } else if (role === 'Kasir') {
            switchTab('transaksi');
        } else if (role === 'Pelanggan') {
            switchTab('pelanggan-store');
        }
    } else {
        document.body.classList.add('logged-out');
    }
}

// Tab switcher di layar auth: Login vs Registrasi Pelanggan
function switchAuthTab(tab) {
    const btnLogin = document.getElementById('auth-tab-login') || document.getElementById('auth-tab-btn-login');
    const btnReg = document.getElementById('auth-tab-register') || document.getElementById('auth-tab-btn-register');
    const formLogin = document.getElementById('login-form');
    const formReg = document.getElementById('register-form');
    const errEl = document.getElementById('login-error');
    const regErrEl = document.getElementById('register-error');
    const hintEl = document.getElementById('login-hint');

    if (errEl) errEl.style.display = 'none';
    if (regErrEl) regErrEl.style.display = 'none';

    if (tab === 'register') {
        if (btnLogin) btnLogin.classList.remove('active');
        if (btnReg) btnReg.classList.add('active');
        if (formLogin) formLogin.style.display = 'none';
        if (formReg) formReg.style.display = 'block';
        if (hintEl) hintEl.style.display = 'none';
    } else {
        if (btnReg) btnReg.classList.remove('active');
        if (btnLogin) btnLogin.classList.add('active');
        if (formReg) formReg.style.display = 'none';
        if (formLogin) formLogin.style.display = 'block';
        if (hintEl) hintEl.style.display = 'block';
    }
}

// Autofill demo akun untuk pengujian cepat
function fillDemoAuth(username, password) {
    switchAuthTab('login');
    const uInput = document.getElementById('login-username');
    const pInput = document.getElementById('login-password');
    if (uInput) uInput.value = username;
    if (pInput) pInput.value = password;
    showToast(`Akun demo diisi: ${username}`, 'info');
}

function fillDemoLogin(username, password) {
    fillDemoAuth(username, password);
}
window.fillDemoLogin = fillDemoLogin;
window.fillDemoAuth = fillDemoAuth;

// Registrasi Pelanggan Baru
async function handleRegister(e) {
    e.preventDefault();

    const uEl = document.getElementById('reg-username');
    const nEl = document.getElementById('reg-nama') || document.getElementById('reg-fullname');
    const tEl = document.getElementById('reg-telepon') || document.getElementById('reg-phone');
    const aEl = document.getElementById('reg-alamat') || document.getElementById('reg-address');
    const pEl = document.getElementById('reg-password');
    const cEl = document.getElementById('reg-password-confirm');
    const regErrEl = document.getElementById('register-error');

    const username = uEl ? uEl.value.trim() : '';
    const fullname = nEl ? nEl.value.trim() : '';
    const phone = tEl ? tEl.value.trim() : '';
    const address = aEl ? aEl.value.trim() : '';
    const password = pEl ? pEl.value : '';
    const confirmPass = cEl ? cEl.value : '';

    if (regErrEl) regErrEl.style.display = 'none';

    const showRegError = (msg) => {
        if (regErrEl) {
            regErrEl.textContent = msg;
            regErrEl.style.display = 'block';
        }
        showToast(msg, 'danger');
    };

    if (username.length < 3) {
        showRegError('Username minimal 3 karakter.');
        return;
    }
    if (/[\\,\n\r\s]/.test(username)) {
        showRegError('Username tidak boleh mengandung spasi atau karakter khusus.');
        return;
    }
    if (password.length < 4) {
        showRegError('Password minimal 4 karakter.');
        return;
    }
    if (password !== confirmPass) {
        showRegError('Konfirmasi password tidak cocok!');
        return;
    }

    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        showRegError(`Username '${username}' sudah terdaftar! Silakan gunakan username lain.`);
        return;
    }

    const newUser = {
        username: username,
        password: simpleHash(password),
        role: 'Pelanggan',
        fullName: fullname || username,
        phone: phone || '',
        address: address || '',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    if (saveUsers(users)) {
        const session = {
            username: newUser.username,
            role: newUser.role,
            fullName: newUser.fullName,
            phone: newUser.phone,
            address: newUser.address,
            loginAt: new Date().toISOString()
        };
        try {
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
        } catch (err) {
            console.warn('Gagal menyimpan sesi register:', err);
        }

        const regForm = document.getElementById('register-form');
        if (regForm) regForm.reset();
        document.body.classList.remove('logged-out');
        applySessionToHeader(session);
        switchTab('pelanggan-store');

        showToast(`Selamat datang, ${newUser.fullName}! Akun Pelanggan Anda aktif.`, 'success');
        logActivity('registrasi', `Pengguna baru '${newUser.username}' mendaftar sebagai Pelanggan.`, newUser.username);

        // Backup langsung ke Firestore agar akun bisa login di seluruh perangkat
        if (typeof db !== 'undefined' && db) {
            try {
                await db.collection('users').doc(newUser.username).set(newUser);
            } catch (err) {
                console.warn('Gagal simpan akun ke Firestore:', err);
            }
        }
    }
}

// Tampilkan nama user, role, navigasi dinamis, dan tombol role di header
function applySessionToHeader(session) {
    const userEl = document.getElementById('logged-user');
    if (userEl) userEl.textContent = session.fullName || session.username;

    const roleEl = document.getElementById('logged-role');
    const role = session.role || 'Kasir';
    if (roleEl) roleEl.textContent = '(' + role + ')';

    // Update class pada body untuk selektor styling role
    document.body.classList.remove('role-admin', 'role-kasir', 'role-pelanggan');
    if (role === 'Administrator') {
        document.body.classList.add('role-admin');
    } else if (role === 'Kasir') {
        document.body.classList.add('role-kasir');
    } else if (role === 'Pelanggan') {
        document.body.classList.add('role-pelanggan');
    }

    // Toggle tombol header sesuai role
    document.querySelectorAll('.btn-admin-only').forEach(el => {
        el.style.display = (role === 'Administrator') ? 'inline-flex' : 'none';
    });
    document.querySelectorAll('.btn-kasir-only').forEach(el => {
        el.style.display = (role === 'Kasir') ? 'inline-flex' : 'none';
    });
    document.querySelectorAll('.btn-pelanggan-only').forEach(el => {
        el.style.display = (role === 'Pelanggan') ? 'inline-flex' : 'none';
    });

    // Render navigasi dinamis sesuai hak akses role
    renderDynamicNavigation(role);

    // Update counter keranjang belanja jika role Pelanggan
    if (role === 'Pelanggan') {
        updateCustomerCartBadge();
    }
}

// Render dynamic tabs di #nav-container sesuai role
function renderDynamicNavigation(role) {
    const navContainer = document.getElementById('nav-container');
    if (!navContainer) return;

    let html = '';
    if (role === 'Administrator') {
        html = `
            <button class="nav-btn active" onclick="switchTab('dashboard')">
                <i class="fa-solid fa-chart-pie"></i> Dashboard
            </button>
            <button class="nav-btn" onclick="switchTab('barang')">
                <i class="fa-solid fa-box-archive"></i> Manajemen Barang
            </button>
            <button class="nav-btn" onclick="switchTab('transaksi')">
                <i class="fa-solid fa-cash-register"></i> Transaksi Kasir
            </button>
            <button class="nav-btn" onclick="switchTab('pesanan-admin')">
                <i class="fa-solid fa-bell"></i> Pesanan Online 
                <span class="nav-badge" id="nav-orders-count" style="display:none;">0</span>
            </button>
            <button class="nav-btn" onclick="switchTab('laporan')">
                <i class="fa-solid fa-file-invoice-dollar"></i> Laporan Transaksi
            </button>
            <button class="nav-btn" onclick="switchTab('aktivitas')">
                <i class="fa-solid fa-list-check"></i> Log Aktivitas
            </button>
        `;
    } else if (role === 'Kasir') {
        html = `
            <button class="nav-btn active" onclick="switchTab('transaksi')">
                <i class="fa-solid fa-cash-register"></i> Transaksi Kasir (POS)
            </button>
            <button class="nav-btn" onclick="switchTab('barang-kasir')">
                <i class="fa-solid fa-boxes-stacked"></i> Stok & Produk
            </button>
            <button class="nav-btn" onclick="switchTab('pesanan-admin')">
                <i class="fa-solid fa-bell"></i> Pesanan Masuk 
                <span class="nav-badge" id="nav-orders-count-kasir" style="display:none;">0</span>
            </button>
            <button class="nav-btn" onclick="switchTab('riwayat-kasir')">
                <i class="fa-solid fa-clock-rotate-left"></i> Riwayat Saya
            </button>
        `;
    } else if (role === 'Pelanggan') {
        html = `
            <button class="nav-btn active" onclick="switchTab('pelanggan-store')">
                <i class="fa-solid fa-store"></i> Belanja Produk
            </button>
            <button class="nav-btn" onclick="switchTab('pelanggan-orders')">
                <i class="fa-solid fa-receipt"></i> Pesanan Saya 
                <span class="nav-badge" id="nav-cust-orders-count" style="display:none;">0</span>
            </button>
            <button class="nav-btn" onclick="switchTab('pelanggan-profile')">
                <i class="fa-solid fa-user-gear"></i> Profil Saya
            </button>
        `;
    }

    navContainer.innerHTML = html;
}

function showLoginError(msg) {
    const errorEl = document.getElementById('login-error');
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    }
    const card = document.querySelector('.login-card');
    if (card) {
        card.classList.remove('shake');
        void card.offsetWidth;
        card.classList.add('shake');
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    if (errorEl) errorEl.style.display = 'none';

    if (!username || !password) {
        showLoginError('Username dan password wajib diisi.');
        return;
    }

    let users = getUsers();
    const inputHash = simpleHash(password);
    let user = users.find(u =>
        u.username.toLowerCase() === username.toLowerCase() && (u.password === inputHash || u.password === password)
    );

    // Jika pengguna belum ada di localStorage (misal baru dibuat di perangkat lain / cloud),
    // cek langsung ke Cloud Firestore jika online
    if (!user && typeof db !== 'undefined' && db) {
        try {
            const doc = await db.collection('users').doc(username).get();
            if (doc.exists) {
                const cloudUser = doc.data();
                if (cloudUser && (cloudUser.password === inputHash || cloudUser.password === password)) {
                    user = cloudUser;
                    user.password = inputHash; // Simpan hash yang standar
                    const idx = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
                    if (idx === -1) {
                        users.push(user);
                    } else {
                        users[idx] = user;
                    }
                    saveUsers(users);
                }
            } else {
                // Alternatif: query bila username disimpan dengan huruf kapital berbeda di Firestore
                const snap = await db.collection('users').get();
                if (!snap.empty) {
                    snap.forEach(d => {
                        const cu = d.data();
                        if (cu && cu.username && cu.username.toLowerCase() === username.toLowerCase()) {
                            if (cu.password === inputHash || cu.password === password) {
                                user = cu;
                                user.password = inputHash;
                                const idx = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
                                if (idx === -1) users.push(user);
                                else users[idx] = user;
                                saveUsers(users);
                            }
                        }
                    });
                }
            }
        } catch (err) {
            console.warn('Gagal cek user ke Firestore:', err);
        }
    }

    if (!user) {
        showLoginError('Username atau password salah. Silakan coba lagi.');
        return;
    }

    const session = {
        username: user.username,
        role: user.role || 'Kasir',
        fullName: user.fullName || user.username,
        phone: user.phone || '',
        address: user.address || '',
        loginAt: new Date().toISOString()
    };
    try {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    } catch (err) {
        showLoginError('Gagal menyimpan sesi: ' + err.message);
        return;
    }

    document.getElementById('login-form').reset();
    document.body.classList.remove('logged-out');
    applySessionToHeader(session);

    // Otomatis arahkan ke dashboard masing-masing role
    if (session.role === 'Administrator') {
        switchTab('dashboard');
    } else if (session.role === 'Kasir') {
        switchTab('transaksi');
    } else if (session.role === 'Pelanggan') {
        switchTab('pelanggan-store');
    }

    showToast(`Selamat datang, ${user.fullName || user.username}! (${session.role})`, 'success');
    logActivity('login', `Pengguna '${user.username}' (${session.role}) berhasil login.`, user.username);
}

function handleLogout() {
    if (!confirm('Keluar dari akun ini?')) return;

    const session = getSession();
    if (session) {
        logActivity('logout', `Pengguna '${session.username}' logout.`, session.username);
    }

    try {
        localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch (e) {
        console.warn('Gagal menghapus sesi:', e);
    }

    document.body.classList.add('logged-out');
    document.body.classList.remove('role-admin', 'role-kasir', 'role-pelanggan');

    const form = document.getElementById('login-form');
    if (form) form.reset();
    const regForm = document.getElementById('register-form');
    if (regForm) regForm.reset();
    switchAuthTab('login');
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
   0b. KELOLA USER (TAMBAH / HAPUS / GANTI PASSWORD) - RBAC ADMIN
   ========================================================================== */

let currentUserRoleFilter = 'all';

function filterUserList(roleFilter, btn) {
    currentUserRoleFilter = roleFilter;
    if (btn) {
        const parent = btn.parentElement;
        if (parent) {
            parent.querySelectorAll('.btn-subtab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    }
    renderUserList();
}

function openUserModal() {
    if (!requireRole(['Administrator'], 'mengelola akun pengguna')) {
        return;
    }
    const overlay = document.getElementById('user-modal-overlay');
    if (!overlay) return;

    renderUserList();

    const addSection = document.getElementById('add-user-section');
    if (addSection) addSection.style.display = isAdmin() ? 'block' : 'none';

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

    // Update filter counts
    const countAll = document.getElementById('user-count-all');
    const countAdmin = document.getElementById('user-count-admin');
    const countKasir = document.getElementById('user-count-kasir');
    const countPelanggan = document.getElementById('user-count-pelanggan');

    if (countAll) countAll.textContent = users.length;
    if (countAdmin) countAdmin.textContent = users.filter(u => (u.role || 'Kasir') === 'Administrator').length;
    if (countKasir) countKasir.textContent = users.filter(u => (u.role || 'Kasir') === 'Kasir').length;
    if (countPelanggan) countPelanggan.textContent = users.filter(u => (u.role || 'Kasir') === 'Pelanggan').length;

    let filtered = users;
    if (currentUserRoleFilter !== 'all') {
        filtered = users.filter(u => (u.role || 'Kasir') === currentUserRoleFilter);
    }

    if (filtered.length === 0) {
        listEl.innerHTML = '<p class="form-info" style="text-align:center; padding:1rem;">Tidak ada akun dalam kategori ini.</p>';
        return;
    }

    listEl.innerHTML = filtered.map((u) => {
        const realIdx = users.indexOf(u);
        const role = u.role || 'Kasir';
        let roleClass = 'kasir';
        if (role === 'Administrator') roleClass = 'admin';
        else if (role === 'Pelanggan') roleClass = 'pelanggan';

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
                    <span class="user-avatar">${escapeHtml((u.fullName || u.username).charAt(0).toUpperCase())}</span>
                    <div>
                        <div class="user-item-name">${escapeHtml(u.fullName || u.username)} <span style="font-size:0.85rem; color:#888;">(@${escapeHtml(u.username)})</span></div>
                        <div class="user-item-meta">${escapeHtml(u.phone ? '📱 ' + u.phone : role)}</div>
                    </div>
                </div>
                <div class="user-item-actions">
                    ${isMe ? '<span class="you-badge">Anda</span>' : ''}
                    <span class="role-badge ${roleClass}">${role}</span>
                    <button class="btn-user-delete" onclick="deleteUser(${realIdx})"
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

    if (!requireRole(['Administrator'], 'menambah akun pengguna')) {
        return;
    }

    const username = document.getElementById('new-username').value.trim();
    const fullname = document.getElementById('new-fullname') ? document.getElementById('new-fullname').value.trim() : '';
    const phone = document.getElementById('new-phone') ? document.getElementById('new-phone').value.trim() : '';
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
    if (/[\\,\n\r\s]/.test(username)) {
        showToast('Username tidak boleh mengandung spasi atau koma.', 'warning');
        return;
    }

    const users = getUsers();
    const exists = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
        showToast(`Username '${username}' sudah dipakai.`, 'danger');
        return;
    }

    const newUserObj = {
        username: username,
        password: simpleHash(password),
        role: role,
        fullName: fullname || username,
        phone: phone || '',
        createdAt: new Date().toISOString()
    };
    users.push(newUserObj);

    if (saveUsers(users)) {
        document.getElementById('form-add-user').reset();
        renderUserList();
        showToast(`Akun '${username}' (${role}) berhasil ditambahkan!`, 'success');
        logActivity('tambah_user', `Admin menambahkan akun baru '${username}' dengan role ${role}.`, username);

        if (typeof db !== 'undefined' && db) {
            db.collection('users').doc(username).set(newUserObj).catch(() => {});
        }
    }
}

function deleteUser(index) {
    if (!requireRole(['Administrator'], 'menghapus akun pengguna')) {
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

    const deletedUsername = target.username;
    users.splice(index, 1);
    if (saveUsers(users)) {
        renderUserList();
        showToast(`Akun '${deletedUsername}' berhasil dihapus.`, 'info');
        logActivity('hapus_user', `Admin menghapus akun '${deletedUsername}' (${role}).`, deletedUsername);

        if (typeof db !== 'undefined' && db) {
            db.collection('users').doc(deletedUsername).delete().catch(() => {});
        }
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
        showToast('Password baru harus berbeda dari password lama.', 'warning');
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
        logActivity('ubah_password', `Pengguna '${session.username}' memperbarui password.`);
    }
}

/* ==========================================================================
   INDEXEDDB HELPER (Penyimpanan Offline Berkapasitas Besar > 50MB+)
   ========================================================================== */
const IDB_NAME = 'DelsiShopDB';
const IDB_VERSION = 1;
const IDB_STORE_NAME = 'warung_store';

function openAppDB() {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            return reject(new Error('IndexedDB tidak didukung'));
        }
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
                db.createObjectStore(IDB_STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function setIDB(key, val) {
    return openAppDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
            const store = tx.objectStore(IDB_STORE_NAME);
            const req = store.put(val, key);
            req.onsuccess = () => resolve(true);
            req.onerror = () => reject(req.error);
        });
    }).catch(err => {
        console.warn('IDB write failed:', err);
        return false;
    });
}

function getIDB(key) {
    return openAppDB().then(db => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE_NAME, 'readonly');
            const store = tx.objectStore(IDB_STORE_NAME);
            const req = store.get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }).catch(err => {
        console.warn('IDB read failed:', err);
        return null;
    });
}

// Bersihkan base64 besar dari produk khusus saat dicadangkan di localStorage
// agar kuota localStorage 5MB tidak pernah terlampaui (QuotaExceededError).
function sanitizeProductsForLocalStorage(items) {
    if (!Array.isArray(items)) return [];
    return items.map(p => {
        if (!p) return p;
        if (typeof p.gambar === 'string' && p.gambar.startsWith('data:')) {
            const copy = { ...p };
            copy.gambar = DEFAULT_IMAGE;
            return copy;
        }
        return p;
    });
}

// Menghitung estimasi penggunaan LocalStorage browser dalam satuan Kilobyte (KB)
function getLocalStorageUsageKb() {
    try {
        let total = 0;
        for (let key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                total += ((localStorage[key] || '').length + (key || '').length) * 2;
            }
        }
        return Math.round(total / 1024);
    } catch (e) {
        return 0;
    }
}

// Membersihkan cache browser dan merampingkan LocalStorage agar kapasitas selalu lega
function cleanBrowserStorage(silent = false) {
    if (!silent) {
        if (!confirm('Bersihkan cache penyimpanan browser sekarang?\n\nData barang & riwayat transaksi Anda TETAP AMAN di Cloud Firebase & IndexedDB.')) {
            return;
        }
    }

    try {
        const initialSize = getLocalStorageUsageKb();

        // 1. Bersihkan foto base64 berlebih dari LocalStorage produk
        const storedProducts = localStorage.getItem(STORAGE_PRODUCTS_KEY);
        if (storedProducts) {
            try {
                const parsed = JSON.parse(storedProducts);
                if (Array.isArray(parsed)) {
                    const sanitized = sanitizeProductsForLocalStorage(parsed);
                    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(sanitized));
                }
            } catch (e) {
                console.warn('Gagal parsing produk saat bersih cache:', e);
            }
        }

        // 2. Rampingkan riwayat transaksi di LocalStorage (ambil max 100 terbaru tanpa gambar)
        const storedTx = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
        if (storedTx) {
            try {
                let parsedTx = JSON.parse(storedTx);
                if (Array.isArray(parsedTx)) {
                    parsedTx.forEach(t => {
                        if (Array.isArray(t.items)) {
                            t.items.forEach(item => {
                                if (item && typeof item.gambar === 'string' && item.gambar.length > 500) {
                                    delete item.gambar;
                                }
                            });
                        }
                    });
                    if (parsedTx.length > 100) {
                        parsedTx = parsedTx.slice(0, 100);
                    }
                    localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(parsedTx));
                }
            } catch (e) {
                console.warn('Gagal merampingkan transaksi:', e);
            }
        }

        // 3. Bersihkan Cache Storage API jika ada
        if (typeof window !== 'undefined' && 'caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            }).catch(e => console.warn('Gagal bersihkan CacheStorage:', e));
        }

        const finalSize = getLocalStorageUsageKb();
        const freedKb = Math.max(0, initialSize - finalSize);

        if (!silent) {
            showToast(`Cache browser berhasil dibersihkan! Penyimpanan kini lega (${finalSize} KB terpakai, hemat ~${freedKb} KB).`, 'success');
        } else if (freedKb > 100) {
            console.log(`Auto-clean: Membersihkan ~${freedKb} KB cache penyimpanan LocalStorage.`);
        }
    } catch (err) {
        console.error('Gagal membersihkan cache penyimpanan:', err);
        if (!silent) {
            showToast('Gagal membersihkan cache: ' + err.message, 'danger');
        }
    }
}

/* ==========================================================================
   1. INISIALISASI DATA, LOCALSTORAGE & FIREBASE FIRESTORE
   ========================================================================== */
function initData() {
    // Bersihkan otomatis sampah cache base64 lama yang menumpuk di LocalStorage saat web dibuka
    cleanBrowserStorage(true);

    const storedProducts = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (!storedProducts) {
        products = [...SAMPLE_PRODUCTS];
        firstRunSeeded = true;
        saveProductsToStorage();
    } else {
        try {
            products = JSON.parse(storedProducts);
            // Migrasi: deteksi foto kosong atau placeholder generic bag, otomatis ganti dengan foto asli dari katalog
            let updatedImages = false;
            products.forEach(p => {
                const isGeneric = !p.gambar || 
                    typeof p.gambar !== 'string' || 
                    p.gambar.trim() === '' || 
                    p.gambar === DEFAULT_IMAGE || 
                    p.gambar.includes('1588964895597');
                if (isGeneric) {
                    p.gambar = getProductAutoImage(p);
                    updatedImages = true;
                }
            });
            if (products.length < 5) {
                products = [...SAMPLE_PRODUCTS];
                updatedImages = true;
            }
            if (updatedImages) {
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

    // Pulihkan foto produk beresolusi tinggi dari IndexedDB jika localStorage memakai versi hemat
    getIDB(STORAGE_PRODUCTS_KEY).then(idbProducts => {
        if (Array.isArray(idbProducts) && idbProducts.length > 0) {
            const idbMap = new Map(idbProducts.map(p => [p.kode, p.gambar]));
            let updated = false;
            products.forEach(p => {
                if ((!p.gambar || p.gambar === DEFAULT_IMAGE || p.gambar.includes('1588964895597')) && idbMap.has(p.kode)) {
                    const fullImg = idbMap.get(p.kode);
                    if (fullImg && fullImg !== DEFAULT_IMAGE && !fullImg.includes('1588964895597')) {
                        p.gambar = fullImg;
                        updated = true;
                    }
                }
            });
            if (updated) {
                renderProducts();
                populateProductDropdown();
            }
        }
    }).catch(err => console.warn('Pengecekan IndexedDB awal:', err));
}

function saveProductsToStorage() {
    // 1. Simpan salinan lengkap termasuk foto base64 ke IndexedDB (kapasitas ratusan MB)
    setIDB(STORAGE_PRODUCTS_KEY, products);

    // 2. Simpan cadangan ke localStorage
    try {
        const json = JSON.stringify(products);
        // Bila ukuran data di atas 1MB, otomatis sanitasi foto base64 agar aman dari kuota 5MB browser
        if (json.length > 1000000) {
            const light = sanitizeProductsForLocalStorage(products);
            localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(light));
            return true;
        }
        localStorage.setItem(STORAGE_PRODUCTS_KEY, json);
        return true;
    } catch (err) {
        // Fallback jika kuota localStorage penuh
        try {
            const light = sanitizeProductsForLocalStorage(products);
            localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(light));
            console.info('Produk dicadangkan ke localStorage dengan mode hemat kuota (foto utuh di IndexedDB & Cloud).');
            return true;
        } catch (innerErr) {
            console.warn('LocalStorage penuh, data tetap aman di IndexedDB & Cloud:', innerErr);
            return false;
        }
    }
}

function saveTransactionsToStorage() {
    // 1. Simpan salinan lengkap transaksi ke IndexedDB
    setIDB(STORAGE_TRANSACTIONS_KEY, transactions);

    // 2. Simpan cadangan ke localStorage
    try {
        const json = JSON.stringify(transactions);
        if (json.length > 1500000) {
            const recent = transactions.slice(0, 150);
            localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(recent));
            return true;
        }
        localStorage.setItem(STORAGE_TRANSACTIONS_KEY, json);
        return true;
    } catch (err) {
        try {
            const recent = transactions.slice(0, 100);
            localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(recent));
            return true;
        } catch (innerErr) {
            console.warn('LocalStorage penuh untuk transaksi, data tetap tersimpan di IndexedDB & Cloud:', innerErr);
            return false;
        }
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
            const isGeneric = !data.gambar || 
                data.gambar === DEFAULT_IMAGE || 
                data.gambar.includes('1588964895597') || 
                (typeof data.gambar === 'string' && data.gambar.trim() === '');

            if (isGeneric) {
                data.gambar = getProductAutoImage(data);
                // Sinkronkan perbaikan foto ke Firestore bila diizinkan
                if (typeof db !== 'undefined' && db && data.kode) {
                    db.collection('products').doc(data.kode).set({ gambar: data.gambar }, { merge: true }).catch(() => {});
                }
            }

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
        if (typeof renderProductsKasir === 'function') renderProductsKasir();
        if (typeof renderCustomerStorefront === 'function') renderCustomerStorefront();
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

    // Dengarkan data pengguna dari Firestore secara real-time (sinkron lintas perangkat/browser)
    db.collection('users').onSnapshot(snapshot => {
        if (snapshot.empty) return;

        const remoteUsers = [];
        snapshot.forEach(doc => remoteUsers.push(doc.data()));
        let localUsers = getUsers();
        let changed = false;

        remoteUsers.forEach(ru => {
            if (!ru || !ru.username) return;
            const idx = localUsers.findIndex(lu => lu.username.toLowerCase() === ru.username.toLowerCase());
            if (idx === -1) {
                localUsers.push(ru);
                changed = true;
            } else if (localUsers[idx].password !== ru.password || localUsers[idx].role !== ru.role) {
                localUsers[idx] = { ...localUsers[idx], ...ru };
                changed = true;
            }
        });

        if (changed) {
            saveUsers(localUsers);
            if (typeof renderUserList === 'function') renderUserList();
        }
    }, err => console.warn("Gagal mendengar data pengguna dari Firebase:", err));
}

// Menarik data dari Cloud Firestore bila localStorage masih kosong
function pullFromFirestore() {
    const badge = document.getElementById('firebase-status-badge');

    return Promise.all([
        db.collection('products').get(),
        db.collection('transactions').get(),
        db.collection('users').get()
    ]).then(([productSnapshot, transactionSnapshot, userSnapshot]) => {
        const hasRemoteData = !productSnapshot.empty || !transactionSnapshot.empty || !userSnapshot.empty;

        if (hasRemoteData) {
            const remoteProducts = [];
            productSnapshot.forEach(doc => {
                const data = doc.data();
                const isGeneric = !data.gambar || 
                    data.gambar === DEFAULT_IMAGE || 
                    data.gambar.includes('1588964895597') || 
                    (typeof data.gambar === 'string' && data.gambar.trim() === '');
                if (isGeneric) {
                    data.gambar = getProductAutoImage(data);
                }
                remoteProducts.push(data);
            });
            remoteProducts.sort((a, b) => a.kode.localeCompare(b.kode));

            const remoteTransactions = [];
            transactionSnapshot.forEach(doc => {
                remoteTransactions.push(doc.data());
            });
            remoteTransactions.sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0));

            // Muat dan merge pengguna dari Firestore
            if (userSnapshot && !userSnapshot.empty) {
                let localUsers = getUsers();
                let modifiedUsers = false;
                userSnapshot.forEach(doc => {
                    const u = doc.data();
                    if (!u || !u.username) return;
                    const idx = localUsers.findIndex(lu => lu.username.toLowerCase() === u.username.toLowerCase());
                    if (idx === -1) {
                        localUsers.push(u);
                        modifiedUsers = true;
                    } else if (localUsers[idx].password !== u.password || localUsers[idx].role !== u.role) {
                        localUsers[idx] = { ...localUsers[idx], ...u };
                        modifiedUsers = true;
                    }
                });
                if (modifiedUsers) {
                    saveUsers(localUsers);
                }
            }

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

    // Pengguna: dokumen dengan ID = username
    const localUsers = getUsers();
    localUsers.forEach(u => {
        if (u && u.username) {
            upserts.push({
                ref: db.collection('users').doc(u.username),
                data: u
            });
        }
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
   2. NAVIGASI TAB & RBAC PERMISSION GUARD
   ========================================================================== */
const ROLE_TABS = {
    'Administrator': ['dashboard', 'barang', 'transaksi', 'pesanan-admin', 'laporan', 'aktivitas'],
    'Kasir': ['transaksi', 'barang-kasir', 'pesanan-admin', 'riwayat-kasir'],
    'Pelanggan': ['pelanggan-store', 'pelanggan-orders', 'pelanggan-profile']
};

function switchTab(tabName) {
    const role = getSessionRole();
    const allowed = ROLE_TABS[role] || ['dashboard'];

    if (!allowed.includes(tabName)) {
        const defaultTab = allowed[0] || (role === 'Pelanggan' ? 'pelanggan-store' : (role === 'Kasir' ? 'transaksi' : 'dashboard'));
        showToast(`Akses Dibatasi: Anda tidak memiliki izin untuk halaman '${tabName}'.`, 'warning');
        tabName = defaultTab;
    }

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

    // Panggil fungsi render sesuai tab yang aktif
    if (tabName === 'transaksi') {
        populateProductDropdown();
        updateMaxQtyLabel();
    } else if (tabName === 'laporan') {
        renderReports();
    } else if (tabName === 'barang') {
        renderProducts();
        renderCategories();
        populateCategoryDropdowns();
    } else if (tabName === 'dashboard') {
        renderDashboardStats();
        renderDashboardStokMenipis();
        renderDashboardOmzet();
        updateAdminOrdersBadge();
    } else if (tabName === 'barang-kasir') {
        renderProductsKasir();
    } else if (tabName === 'pesanan-admin') {
        renderAdminOrders();
    } else if (tabName === 'riwayat-kasir') {
        renderRiwayatKasir();
    } else if (tabName === 'aktivitas') {
        renderActivityLogs();
    } else if (tabName === 'pelanggan-store') {
        renderCustomerStorefront();
    } else if (tabName === 'pelanggan-orders') {
        renderCustomerOrders();
    } else if (tabName === 'pelanggan-profile') {
        renderCustomerProfile();
    }
}

/* ==========================================================================
   2b. MANAJEMEN KATEGORI PRODUK
   ========================================================================== */
let categories = [];

const DEFAULT_CATEGORIES = [
    { id: 'cat-1', name: 'Umum', desc: 'Kategori barang umum toko' },
    { id: 'cat-2', name: 'Makanan & Minuman', desc: 'Makanan ringan, mie instan, minuman kemasan, susu' },
    { id: 'cat-3', name: 'Sembako', desc: 'Beras, minyak goreng, gula, tepung, telur' },
    { id: 'cat-4', name: 'Bumbu Dapur', desc: 'Kecap, saus, garam, micin, bumbu instan' },
    { id: 'cat-5', name: 'Kebutuhan Rumah', desc: 'Sabun cuci, deterjen, sampo, pasta gigi, pembersih' },
    { id: 'cat-6', name: 'Snack & Camilan', desc: 'Keripik, biskuit, wafer, permen, cokelat' }
];

function initCategories() {
    try {
        const stored = localStorage.getItem(STORAGE_CATEGORIES_KEY);
        if (stored) {
            categories = JSON.parse(stored);
        } else {
            categories = [...DEFAULT_CATEGORIES];
            saveCategoriesToStorage();
        }
    } catch (e) {
        categories = [...DEFAULT_CATEGORIES];
    }
    populateCategoryDropdowns();
}

function saveCategoriesToStorage() {
    try {
        localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
        console.warn('Gagal menyimpan kategori:', e);
    }
    if (typeof db !== 'undefined' && db) {
        categories.forEach(c => {
            db.collection('categories').doc(c.id).set(c).catch(() => {});
        });
    }
}

function switchProductSubtab(subtab) {
    const btnProd = document.getElementById('subtab-btn-produk');
    const btnCat = document.getElementById('subtab-btn-kategori');
    const contProd = document.getElementById('subtab-content-produk');
    const contCat = document.getElementById('subtab-content-kategori');

    if (subtab === 'kategori') {
        if (btnProd) btnProd.classList.remove('active');
        if (btnCat) btnCat.classList.add('active');
        if (contProd) contProd.style.display = 'none';
        if (contCat) contCat.style.display = 'block';
        renderCategories();
    } else {
        if (btnCat) btnCat.classList.remove('active');
        if (btnProd) btnProd.classList.add('active');
        if (contCat) contCat.style.display = 'none';
        if (contProd) contProd.style.display = 'block';
        renderProducts();
    }
}

function renderCategories() {
    const tbody = document.getElementById('tbody-kategori');
    if (!tbody) return;

    if (categories.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:#888;">Belum ada kategori.</td></tr>`;
        return;
    }

    tbody.innerHTML = categories.map((cat, idx) => {
        const count = products.filter(p => (p.kategori || 'Umum') === cat.name).length;
        const isUmum = cat.name.toLowerCase() === 'umum';

        return `
            <tr>
                <td><strong>${escapeHtml(cat.name)}</strong></td>
                <td>${escapeHtml(cat.desc || '-')}</td>
                <td><span class="badge badge-stock-ok">${count} Produk</span></td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm" onclick="deleteCategory(${idx})"
                            ${isUmum ? 'disabled title="Kategori Umum tidak boleh dihapus"' : 'title="Hapus Kategori"'}>
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function handleSaveCategory(e) {
    e.preventDefault();
    if (!requireRole(['Administrator'], 'menambah kategori')) return;

    const nameInput = document.getElementById('kategori-nama').value.trim();
    const descInput = document.getElementById('kategori-deskripsi').value.trim();

    if (!nameInput) {
        showToast('Nama kategori wajib diisi.', 'warning');
        return;
    }

    if (categories.some(c => c.name.toLowerCase() === nameInput.toLowerCase())) {
        showToast(`Kategori '${nameInput}' sudah ada!`, 'warning');
        return;
    }

    const newCat = {
        id: 'cat-' + Date.now().toString().slice(-6),
        name: nameInput,
        desc: descInput
    };

    categories.push(newCat);
    saveCategoriesToStorage();
    document.getElementById('form-kategori').reset();
    renderCategories();
    populateCategoryDropdowns();
    showToast(`Kategori '${nameInput}' berhasil ditambahkan!`, 'success');
    logActivity('kategori', `Admin menambahkan kategori '${nameInput}'.`, newCat.id);
}

function deleteCategory(idx) {
    if (!requireRole(['Administrator'], 'menghapus kategori')) return;
    const cat = categories[idx];
    if (!cat) return;

    if (cat.name.toLowerCase() === 'umum') {
        showToast('Kategori default "Umum" tidak dapat dihapus.', 'warning');
        return;
    }

    if (!confirm(`Hapus kategori '${cat.name}'? Produk berkategori ini akan dipindahkan ke kategori 'Umum'.`)) return;

    // Pindahkan produk yang memakai kategori ini ke 'Umum'
    products.forEach(p => {
        if ((p.kategori || 'Umum') === cat.name) {
            p.kategori = 'Umum';
        }
    });
    saveProductsToStorage();

    const catId = cat.id;
    categories.splice(idx, 1);
    saveCategoriesToStorage();

    if (typeof db !== 'undefined' && db) {
        db.collection('categories').doc(catId).delete().catch(() => {});
    }

    renderCategories();
    populateCategoryDropdowns();
    renderProducts();
    showToast(`Kategori '${cat.name}' berhasil dihapus.`, 'info');
    logActivity('kategori', `Admin menghapus kategori '${cat.name}'.`, catId);
}

function populateCategoryDropdowns() {
    const adminCatSelect = document.getElementById('kategori-barang');
    const kasirCatSelect = document.getElementById('kasir-kategori-barang');

    const optionsHtml = categories.map(c => `<option value="${escapeHtml(c.name)}">${escapeHtml(c.name)}</option>`).join('');

    if (adminCatSelect) {
        const cur = adminCatSelect.value;
        adminCatSelect.innerHTML = optionsHtml;
        if (cur) adminCatSelect.value = cur;
    }
    if (kasirCatSelect) {
        const curKasir = kasirCatSelect.value;
        kasirCatSelect.innerHTML = optionsHtml;
        if (curKasir) kasirCatSelect.value = curKasir;
    }
}

/* ==========================================================================
   2c. AUDIT LOG AKTIVITAS TOKO (RBAC ADMIN)
   ========================================================================== */
let activityLogs = [];

function initActivityLogs() {
    try {
        const stored = localStorage.getItem(STORAGE_ACTIVITY_LOGS_KEY);
        activityLogs = stored ? JSON.parse(stored) : [];
    } catch (e) {
        activityLogs = [];
    }
}

function logActivity(action, details, targetId) {
    const session = getSession();
    const entry = {
        id: 'ACT-' + Date.now().toString().slice(-6),
        timestamp: formatDate(new Date()),
        rawDate: new Date().toISOString(),
        user: session ? (session.fullName || session.username) : 'Sistem',
        username: session ? session.username : 'sistem',
        role: session ? (session.role || 'Kasir') : 'Sistem',
        action: action,
        details: details,
        targetId: targetId || '-'
    };

    activityLogs.unshift(entry);
    if (activityLogs.length > 500) {
        activityLogs = activityLogs.slice(0, 500);
    }

    try {
        localStorage.setItem(STORAGE_ACTIVITY_LOGS_KEY, JSON.stringify(activityLogs));
    } catch (e) {
        console.warn('Gagal menyimpan activity log:', e);
    }

    if (typeof db !== 'undefined' && db) {
        db.collection('activity_logs').doc(entry.id).set(entry).catch(() => {});
    }

    const sectionAktivitas = document.getElementById('section-aktivitas');
    if (sectionAktivitas && sectionAktivitas.classList.contains('active')) {
        renderActivityLogs();
    }
}

function renderActivityLogs() {
    const tbody = document.getElementById('tbody-aktivitas');
    if (!tbody) return;

    const userFilter = document.getElementById('filter-aktivitas-user') ? document.getElementById('filter-aktivitas-user').value : 'all';
    const searchVal = document.getElementById('search-aktivitas') ? document.getElementById('search-aktivitas').value.toLowerCase().trim() : '';

    let filtered = activityLogs;
    if (userFilter !== 'all') {
        filtered = filtered.filter(l => (l.role || '').toLowerCase() === userFilter.toLowerCase());
    }
    if (searchVal) {
        filtered = filtered.filter(l =>
            (l.details || '').toLowerCase().includes(searchVal) ||
            (l.user || '').toLowerCase().includes(searchVal) ||
            (l.action || '').toLowerCase().includes(searchVal)
        );
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:#888;">Belum ada riwayat aktivitas yang tercatat.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(log => {
        let roleBadge = '<span class="role-badge kasir">Kasir</span>';
        if (log.role === 'Administrator') roleBadge = '<span class="role-badge admin">Admin</span>';
        else if (log.role === 'Pelanggan') roleBadge = '<span class="role-badge pelanggan">Pelanggan</span>';

        return `
            <tr>
                <td><strong>${escapeHtml(log.id)}</strong></td>
                <td>${escapeHtml(log.timestamp)}</td>
                <td><strong>${escapeHtml(log.user)}</strong></td>
                <td>${roleBadge}</td>
                <td><span class="badge" style="background:#eef2ff; color:#3b82f6;">${escapeHtml(log.action)}</span></td>
                <td>${escapeHtml(log.details)}</td>
            </tr>
        `;
    }).join('');
}

function clearActivityLogs() {
    if (!requireRole(['Administrator'], 'menghapus log aktivitas')) return;
    if (!confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat log aktivitas?')) return;

    activityLogs = [];
    try {
        localStorage.removeItem(STORAGE_ACTIVITY_LOGS_KEY);
    } catch (e) {}

    renderActivityLogs();
    showToast('Seluruh log aktivitas berhasil dibersihkan.', 'info');
}

function exportActivityLogsCsv() {
    if (!requireRole(['Administrator'], 'mengunduh log aktivitas')) return;
    if (activityLogs.length === 0) {
        showToast('Belum ada log aktivitas untuk diekspor.', 'warning');
        return;
    }

    const headers = ['ID', 'Waktu', 'Pengguna', 'Role', 'Aksi', 'Keterangan'];
    const rows = activityLogs.map(l => [
        `"${l.id}"`,
        `"${l.timestamp}"`,
        `"${l.user}"`,
        `"${l.role}"`,
        `"${l.action}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Log_Aktivitas_Warung_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Log aktivitas berhasil diunduh (CSV).', 'success');
}

/* ==========================================================================
   3. MANAJEMEN BARANG (CRUD) WITH IMAGES - KHUSUS ADMIN
   ========================================================================== */

function renderProducts() {
    const tbody = document.getElementById('tbody-barang');
    if (!tbody) return;
    const searchVal = document.getElementById('search-barang') ? document.getElementById('search-barang').value.toLowerCase().trim() : '';
    
    tbody.innerHTML = '';

    const filteredProducts = products.filter(p => 
        p.nama.toLowerCase().includes(searchVal) || 
        p.kode.toLowerCase().includes(searchVal) ||
        (p.kategori && p.kategori.toLowerCase().includes(searchVal))
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

        const imgUrl = (product.gambar && product.gambar !== DEFAULT_IMAGE && !product.gambar.includes('1588964895597')) 
            ? product.gambar 
            : getProductAutoImage(product);
        const modalVal = product.modal || 0;
        const labaVal = product.harga - modalVal;
        const kategoriTag = product.kategori ? `<span style="display:inline-block; font-size:0.75rem; background:#f1f5f9; padding:2px 6px; border-radius:4px; margin-top:3px; color:#475569;">${escapeHtml(product.kategori)}</span>` : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(product.nama)}" class="product-thumb" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'">
            </td>
            <td><strong>${escapeHtml(product.kode)}</strong></td>
            <td>
                <div>${escapeHtml(product.nama)}</div>
                ${kategoriTag}
            </td>
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

    if (!requireRole(['Administrator'], 'mengubah atau menambah barang')) {
        return;
    }

    try {
        const editIndex = parseInt(document.getElementById('edit-index').value);
        const namaInput = document.getElementById('nama-barang').value.trim();
        const hargaInput = parseInt(document.getElementById('harga-barang').value);
        const stokInput = parseInt(document.getElementById('stok-barang').value);
        const gambarInput = document.getElementById('gambar-barang').value.trim();
        const kategoriInput = document.getElementById('kategori-barang') ? document.getElementById('kategori-barang').value : 'Umum';
        const deskripsiInput = document.getElementById('deskripsi-barang') ? document.getElementById('deskripsi-barang').value.trim() : '';

        if (!namaInput || isNaN(hargaInput) || isNaN(stokInput)) {
            showToast('Mohon isi Nama Barang, Harga Jual, dan Stok dengan benar.', 'warning');
            return;
        }

        let kodeInput;
        if (editIndex === -1) {
            kodeInput = generateProductCode();
        } else {
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
            kategori: kategoriInput,
            deskripsi: deskripsiInput,
            harga: hargaInput,
            modal: modalInput,
            stok: stokInput,
            gambar: gambarInput || getProductAutoImage({ kode: kodeInput, nama: namaInput })
        };

        if (editIndex === -1) {
            products.push(productData);
            showToast('Barang berhasil ditambahkan!', 'success');
            logActivity('tambah_produk', `Admin menambahkan produk '${productData.nama}' (${productData.kode})`, productData.kode);
        } else {
            products[editIndex] = productData;
            showToast('Data barang berhasil diperbarui!', 'success');
            logActivity('edit_produk', `Admin memperbarui produk '${productData.nama}' (${productData.kode})`, productData.kode);
        }

        saveProductsToStorage();

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
    if (!requireRole(['Administrator'], 'mengedit barang langsung')) {
        return;
    }

    const product = products[index];
    if (!product) return;

    document.getElementById('edit-index').value = index;
    document.getElementById('kode-barang').value = product.kode;
    document.getElementById('nama-barang').value = product.nama;
    if (document.getElementById('kategori-barang')) document.getElementById('kategori-barang').value = product.kategori || 'Umum';
    if (document.getElementById('deskripsi-barang')) document.getElementById('deskripsi-barang').value = product.deskripsi || '';
    document.getElementById('harga-barang').value = product.harga;
    document.getElementById('modal-barang').value = product.modal || '';
    document.getElementById('stok-barang').value = product.stok;
    document.getElementById('gambar-barang').value = product.gambar || '';
    updateLabaPreview();

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
    const form = document.getElementById('form-barang');
    if (form) form.reset();
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
    if (!requireRole(['Administrator'], 'menghapus barang')) {
        return;
    }

    const product = products[index];
    if (!product) return;

    if (confirm(`Apakah Anda yakin ingin menghapus '${product.nama}'?`)) {
        const deletedKode = product.kode;
        const deletedNama = product.nama;
        products.splice(index, 1);
        saveProductsToStorage();

        if (typeof db !== 'undefined' && db) {
            db.collection('products').doc(deletedKode).delete()
                .catch(err => console.warn('Gagal hapus produk di Firestore:', err));
        }

        renderProducts();
        populateProductDropdown();
        renderDashboardStokMenipis();
        showToast('Barang telah dihapus.', 'danger');
        logActivity('hapus_produk', `Admin menghapus produk '${deletedNama}' (${deletedKode})`, deletedKode);
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
    updateProductPickerButton();

    // Segarkan daftar pemilih barang bila sedang terbuka
    const pickerOverlay = document.getElementById('product-picker-modal-overlay');
    if (pickerOverlay && pickerOverlay.classList.contains('active')) {
        const search = document.getElementById('product-picker-search');
        renderProductPicker(search ? search.value : '');
    }
}

function updateMaxQtyLabel() {
    const select = document.getElementById('select-barang');
    const infoStok = document.getElementById('info-stok-pilihan');
    const inputJumlah = document.getElementById('input-jumlah');
    const previewContainer = document.getElementById('preview-produk-container');
    const previewImg = document.getElementById('preview-produk-img');
    const previewNama = document.getElementById('preview-nama');
    const previewHarga = document.getElementById('preview-harga');

    if (!select) return;

    updateProductPickerButton();

    if (!select.value) {
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

/* ==========================================================================
   PEMILIH BARANG BERGANBAR (POS)
   ========================================================================== */
function updateProductPickerButton() {
    const select = document.getElementById('select-barang');
    const btn = document.getElementById('product-picker-btn');
    const img = document.getElementById('picker-selected-img');
    const text = document.getElementById('picker-selected-text');
    const price = document.getElementById('picker-selected-price');
    if (!select || !btn || !img || !text || !price) return;

    const product = products.find(p => p.kode === select.value);
    if (!product) {
        img.style.display = 'none';
        img.removeAttribute('src');
        img.alt = '';
        text.textContent = '-- Pilih Barang --';
        price.textContent = '';
        btn.classList.remove('has-value');
        return;
    }

    img.onerror = function() {
        this.onerror = null;
        this.src = DEFAULT_IMAGE;
    };
    img.src = product.gambar || DEFAULT_IMAGE;
    img.alt = product.nama;
    img.style.display = 'block';
    text.textContent = `${product.kode} - ${product.nama}`;
    price.textContent = formatRupiah(product.harga);
    btn.classList.add('has-value');
}

function renderProductPicker(filterText) {
    const grid = document.getElementById('product-picker-grid');
    const empty = document.getElementById('product-picker-empty');
    if (!grid) return;

    const q = String(filterText || '').trim().toLowerCase();
    const select = document.getElementById('select-barang');
    const selectedKode = select ? select.value : '';

    const list = products.filter(p => {
        if (!q) return true;
        const nama = (p.nama || '').toLowerCase();
        const kode = (p.kode || '').toLowerCase();
        return nama.includes(q) || kode.includes(q);
    });

    grid.innerHTML = '';

    if (list.length === 0) {
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    list.forEach(p => {
        const habis = p.stok <= 0;
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'product-picker-item' + (p.kode === selectedKode ? ' selected' : '');
        item.disabled = habis;
        item.innerHTML = `
            <img src="${escapeHtml(p.gambar || DEFAULT_IMAGE)}" alt="${escapeHtml(p.nama)}" loading="lazy">
            <span class="pp-info">
                <span class="pp-name">${escapeHtml(p.nama)}</span>
                <span class="pp-price">${formatRupiah(p.harga)}</span>
                <span class="pp-stock${habis ? ' habis' : ''}">${habis ? 'Stok habis' : 'Stok: ' + p.stok}</span>
            </span>
        `;

        const imgEl = item.querySelector('img');
        if (imgEl) {
            imgEl.addEventListener('error', function() {
                this.onerror = null;
                this.src = DEFAULT_IMAGE;
            }, { once: true });
        }

        item.addEventListener('click', () => selectProductFromPicker(p.kode));
        grid.appendChild(item);
    });
}

function openProductPicker() {
    const overlay = document.getElementById('product-picker-modal-overlay');
    const search = document.getElementById('product-picker-search');
    if (search) search.value = '';
    renderProductPicker('');
    if (overlay) overlay.classList.add('active');
    // Fokus ke kolom pencarian hanya di layar besar agar keyboard HP tidak menutupi daftar
    if (search && window.matchMedia('(min-width: 768px)').matches) {
        setTimeout(() => search.focus(), 80);
    }
}

function closeProductPicker() {
    const overlay = document.getElementById('product-picker-modal-overlay');
    if (overlay) overlay.classList.remove('active');
}

function closeProductPickerOnOverlay(event) {
    if (event.target === event.currentTarget) closeProductPicker();
}

function filterProductPicker() {
    const search = document.getElementById('product-picker-search');
    renderProductPicker(search ? search.value : '');
}

function selectProductFromPicker(kode) {
    const product = products.find(p => p.kode === kode);
    if (!product) return;
    if (product.stok <= 0) {
        showToast('Stok barang ini habis.', 'warning');
        return;
    }

    const select = document.getElementById('select-barang');
    if (select) {
        select.value = kode;
        if (select.value !== kode) {
            const opt = document.createElement('option');
            opt.value = kode;
            opt.textContent = `${product.kode} - ${product.nama}`;
            select.appendChild(opt);
            select.value = kode;
        }
    }

    updateMaxQtyLabel();
    closeProductPicker();

    const inputJumlah = document.getElementById('input-jumlah');
    if (inputJumlah) {
        inputJumlah.focus();
        inputJumlah.select();
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

/* ==========================================================================
   4. PENGATURAN & METODE PEMBAYARAN (TUNAI, QRIS, TRANSFER BANK, E-WALLET)
   ========================================================================== */
const STORAGE_PAYMENT_SETTINGS_KEY = 'warung_payment_settings_delsi';
const DEFAULT_PAYMENT_SETTINGS = {
    qrisMerchant: 'Delsi Shop',
    qrisImage: '',
    bankName: 'BCA',
    bankRekening: '8830-1234-5678',
    bankOwner: 'Delsi Shop',
    ewalletName: 'DANA / GoPay / ShopeePay',
    ewalletNumber: '0812-3456-7890',
    ewalletOwner: 'Delsi Shop'
};

let paymentSettings = { ...DEFAULT_PAYMENT_SETTINGS };

function initPaymentSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_PAYMENT_SETTINGS_KEY);
        if (stored) {
            paymentSettings = Object.assign({}, DEFAULT_PAYMENT_SETTINGS, JSON.parse(stored));
        }
    } catch (e) {
        console.warn('Gagal memuat pengaturan pembayaran dari localStorage:', e);
    }
    updatePaymentUIFromSettings();

    // Sinkronisasi data pembayaran dari Firestore jika online
    if (typeof db !== 'undefined' && db) {
        db.collection('settings').doc('payment').get().then(doc => {
            if (doc.exists) {
                paymentSettings = Object.assign({}, DEFAULT_PAYMENT_SETTINGS, doc.data());
                try {
                    localStorage.setItem(STORAGE_PAYMENT_SETTINGS_KEY, JSON.stringify(paymentSettings));
                } catch (e) {}
                updatePaymentUIFromSettings();
            }
        }).catch(err => console.warn('Gagal sync settings payment dari Firebase:', err));
    }
}

function getPaymentSettings() {
    return paymentSettings;
}

function updatePaymentUIFromSettings() {
    const s = paymentSettings;
    const qrisMerchantEl = document.getElementById('qris-card-merchant');
    if (qrisMerchantEl) qrisMerchantEl.textContent = s.qrisMerchant || 'Delsi Shop';

    const bankNameEl = document.getElementById('card-bank-name');
    if (bankNameEl) bankNameEl.textContent = s.bankName || 'BCA';

    const bankRekEl = document.getElementById('card-bank-rekening');
    if (bankRekEl) bankRekEl.textContent = s.bankRekening || '-';

    const bankOwnerEl = document.getElementById('card-bank-owner');
    if (bankOwnerEl) bankOwnerEl.textContent = s.bankOwner || 'Delsi Shop';

    const ewalletNameEl = document.getElementById('card-ewallet-name');
    if (ewalletNameEl) ewalletNameEl.textContent = s.ewalletName || 'DANA / GoPay';

    const ewalletNumEl = document.getElementById('card-ewallet-number');
    if (ewalletNumEl) ewalletNumEl.textContent = s.ewalletNumber || '-';

    const ewalletOwnerEl = document.getElementById('card-ewallet-owner');
    if (ewalletOwnerEl) ewalletOwnerEl.textContent = s.ewalletOwner || 'Delsi Shop';
}

// Memilih metode pembayaran lewat tombol tab
function choosePaymentMethod(metode) {
    const select = document.getElementById('select-metode-bayar');
    if (select) {
        select.value = metode;
    }
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.metode === metode);
    });
    onMetodeBayarChange();
}

// Dapatkan metode pembayaran yang sedang dipilih
function getMetodeBayar() {
    const select = document.getElementById('select-metode-bayar');
    return select ? select.value : 'Tunai';
}

// Handler perubahan metode pembayaran
function onMetodeBayarChange() {
    const metode = getMetodeBayar();
    const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

    // Sinkronkan status active tab tombol
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.metode === metode);
    });

    const panelTunai = document.getElementById('panel-bayar-tunai');
    const panelQris = document.getElementById('panel-bayar-qris');
    const panelTransfer = document.getElementById('panel-bayar-transfer');
    const panelEwallet = document.getElementById('panel-bayar-ewallet');

    if (panelTunai) panelTunai.style.display = (metode === 'Tunai') ? 'block' : 'none';
    if (panelQris) panelQris.style.display = (metode === 'QRIS') ? 'block' : 'none';
    if (panelTransfer) panelTransfer.style.display = (metode === 'Transfer Bank') ? 'block' : 'none';
    if (panelEwallet) panelEwallet.style.display = (metode === 'E-Wallet') ? 'block' : 'none';

    // Update nominal pada kartu detail
    const qrisTotalEl = document.getElementById('qris-card-total');
    if (qrisTotalEl) qrisTotalEl.textContent = formatRupiah(grandTotal);

    const bankTotalEl = document.getElementById('card-bank-total');
    if (bankTotalEl) bankTotalEl.textContent = formatRupiah(grandTotal);

    const ewalletTotalEl = document.getElementById('card-ewallet-total');
    if (ewalletTotalEl) ewalletTotalEl.textContent = formatRupiah(grandTotal);

    const inputBayar = document.getElementById('input-bayar');
    const labelBayar = document.getElementById('label-input-bayar');
    const labelKembalian = document.getElementById('label-kembalian');

    if (inputBayar) {
        if (metode === 'Tunai') {
            inputBayar.disabled = false;
            inputBayar.placeholder = 'Masukkan jumlah uang';
            if (labelBayar) labelBayar.textContent = 'Uang Bayar (Rp)';
            if (labelKembalian) labelKembalian.textContent = 'Kembalian:';
        } else {
            // Non-tunai: bayar pas sesuai total
            inputBayar.disabled = true;
            inputBayar.value = grandTotal > 0 ? grandTotal : '';
            inputBayar.placeholder = 'Otomatis sesuai total';
            if (labelBayar) labelBayar.textContent = 'Jumlah Dibayar (Otomatis)';
            if (labelKembalian) labelKembalian.textContent = 'Tidak ada kembalian:';
        }
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

// Tombol cepat uang pecahan (Quick Cash)
function setExactCash() {
    const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const input = document.getElementById('input-bayar');
    if (input) {
        input.value = grandTotal > 0 ? grandTotal : 0;
        calculateChange();
    }
}

function setCashAmount(val) {
    const input = document.getElementById('input-bayar');
    if (input) {
        input.value = val;
        calculateChange();
    }
}

function clearCashInput() {
    const input = document.getElementById('input-bayar');
    if (input) {
        input.value = '';
        calculateChange();
    }
}

// Salin teks nomor rekening / nomor telepon ke clipboard
function copyText(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const text = el.textContent.trim();
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Berhasil disalin: ${text}`, 'success');
        }).catch(() => fallbackCopyText(text));
    } else {
        fallbackCopyText(text);
    }
}

function fallbackCopyText(text) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
        document.execCommand('copy');
        showToast(`Berhasil disalin: ${text}`, 'success');
    } catch (e) {
        showToast('Gagal menyalin otomatis.', 'warning');
    }
    document.body.removeChild(tempInput);
}

// Modal Pop-Up QRIS untuk Pembeli
function openQrisModal() {
    const grandTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    if (grandTotal <= 0) {
        showToast('Keranjang belanja masih kosong!', 'warning');
        return;
    }

    const s = getPaymentSettings();
    const merchantEl = document.getElementById('qris-modal-merchant');
    if (merchantEl) merchantEl.textContent = s.qrisMerchant || 'Delsi Shop';

    const amountEl = document.getElementById('qris-modal-amount');
    if (amountEl) amountEl.textContent = formatRupiah(grandTotal);

    const customImg = document.getElementById('qris-modal-custom-img');
    const qrDiv = document.getElementById('qris-modal-qrcode');

    if (s.qrisImage) {
        customImg.src = s.qrisImage;
        customImg.style.display = 'block';
        qrDiv.style.display = 'none';
        qrDiv.innerHTML = '';
    } else {
        customImg.style.display = 'none';
        qrDiv.style.display = 'flex';
        qrDiv.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            try {
                new QRCode(qrDiv, {
                    text: `DELSI-QRIS|MERCHANT:${s.qrisMerchant || 'Delsi Shop'}|NOMINAL:${grandTotal}|TAG:${Date.now()}`,
                    width: 220,
                    height: 220,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.M
                });
            } catch (e) {
                console.warn('Gagal generate QR Code:', e);
            }
        }
    }

    const modal = document.getElementById('qris-modal-overlay');
    if (modal) modal.classList.add('active');
}

function closeQrisModal() {
    const modal = document.getElementById('qris-modal-overlay');
    if (modal) modal.classList.remove('active');
}

function confirmQrisPayment() {
    closeQrisModal();
    processSaveTransaction();
}

// Modal Pengaturan Pembayaran Toko
function openPaymentSettingsModal() {
    const s = paymentSettings;
    const qrisMerchantInput = document.getElementById('setting-qris-merchant');
    if (qrisMerchantInput) qrisMerchantInput.value = s.qrisMerchant || '';

    const bankNameInput = document.getElementById('setting-bank-name');
    if (bankNameInput) bankNameInput.value = s.bankName || '';

    const bankRekInput = document.getElementById('setting-bank-rekening');
    if (bankRekInput) bankRekInput.value = s.bankRekening || '';

    const bankOwnerInput = document.getElementById('setting-bank-owner');
    if (bankOwnerInput) bankOwnerInput.value = s.bankOwner || '';

    const ewalletNameInput = document.getElementById('setting-ewallet-name');
    if (ewalletNameInput) ewalletNameInput.value = s.ewalletName || '';

    const ewalletNumInput = document.getElementById('setting-ewallet-number');
    if (ewalletNumInput) ewalletNumInput.value = s.ewalletNumber || '';

    const ewalletOwnerInput = document.getElementById('setting-ewallet-owner');
    if (ewalletOwnerInput) ewalletOwnerInput.value = s.ewalletOwner || '';

    const preview = document.getElementById('preview-qris-img');
    const placeholder = document.getElementById('placeholder-qris-upload');
    const btnRemove = document.getElementById('btn-remove-qris-img');
    const inputHidden = document.getElementById('setting-qris-image-data');

    if (s.qrisImage) {
        if (preview) { preview.src = s.qrisImage; preview.style.display = 'block'; }
        if (placeholder) placeholder.style.display = 'none';
        if (btnRemove) btnRemove.style.display = 'inline-block';
        if (inputHidden) inputHidden.value = s.qrisImage;
    } else {
        if (preview) { preview.src = ''; preview.style.display = 'none'; }
        if (placeholder) placeholder.style.display = 'block';
        if (btnRemove) btnRemove.style.display = 'none';
        if (inputHidden) inputHidden.value = '';
    }

    const modal = document.getElementById('payment-settings-modal-overlay');
    if (modal) modal.classList.add('active');
}

function closePaymentSettingsModal() {
    const modal = document.getElementById('payment-settings-modal-overlay');
    if (modal) modal.classList.remove('active');
}

function handleQrisImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast('Foto QRIS terlalu besar! Maksimal 2MB.', 'warning');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        compressImageDataUrl(e.target.result, 480, 0.70).then(base64 => {
            const inputHidden = document.getElementById('setting-qris-image-data');
            if (inputHidden) inputHidden.value = base64;
            const preview = document.getElementById('preview-qris-img');
            if (preview) {
                preview.src = base64;
                preview.style.display = 'block';
            }
            const placeholder = document.getElementById('placeholder-qris-upload');
            if (placeholder) placeholder.style.display = 'none';
            const btnRemove = document.getElementById('btn-remove-qris-img');
            if (btnRemove) btnRemove.style.display = 'inline-block';
            showToast('Foto QRIS berhasil dimuat.', 'info');
        });
    };
    reader.readAsDataURL(file);
}

function removeQrisImage() {
    const inputHidden = document.getElementById('setting-qris-image-data');
    if (inputHidden) inputHidden.value = '';
    const preview = document.getElementById('preview-qris-img');
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    const placeholder = document.getElementById('placeholder-qris-upload');
    if (placeholder) placeholder.style.display = 'block';
    const btnRemove = document.getElementById('btn-remove-qris-img');
    if (btnRemove) btnRemove.style.display = 'none';
    const inputFile = document.getElementById('input-qris-file');
    if (inputFile) inputFile.value = '';
}

function handleSavePaymentSettings(e) {
    e.preventDefault();
    paymentSettings.qrisMerchant = (document.getElementById('setting-qris-merchant').value || '').trim() || 'Delsi Shop';
    paymentSettings.qrisImage = document.getElementById('setting-qris-image-data').value || '';
    paymentSettings.bankName = (document.getElementById('setting-bank-name').value || '').trim() || 'BCA';
    paymentSettings.bankRekening = (document.getElementById('setting-bank-rekening').value || '').trim() || '';
    paymentSettings.bankOwner = (document.getElementById('setting-bank-owner').value || '').trim() || '';
    paymentSettings.ewalletName = (document.getElementById('setting-ewallet-name').value || '').trim() || '';
    paymentSettings.ewalletNumber = (document.getElementById('setting-ewallet-number').value || '').trim() || '';
    paymentSettings.ewalletOwner = (document.getElementById('setting-ewallet-owner').value || '').trim() || '';

    try {
        localStorage.setItem(STORAGE_PAYMENT_SETTINGS_KEY, JSON.stringify(paymentSettings));
    } catch (err) {
        console.warn('Gagal simpan payment settings ke localStorage:', err);
    }

    if (typeof db !== 'undefined' && db) {
        db.collection('settings').doc('payment').set(paymentSettings)
            .catch(err => console.warn('Gagal simpan payment settings ke Firestore:', err));
    }

    updatePaymentUIFromSettings();
    closePaymentSettingsModal();
    showToast('Pengaturan pembayaran berhasil disimpan!', 'success');
}

/* ==============================================
   PENGATURAN TAMPILAN & BRANDING TOKO
   ============================================== */
const STORAGE_DISPLAY_SETTINGS_KEY = 'warung_display_settings_delsi';
const DEFAULT_DISPLAY_SETTINGS = {
    theme: 'light',
    color: 'red',
    fontSize: 'normal',
    shopName: 'Delsi Shop',
    shopTagline: 'Sistem Kasir & Manajemen Warung Digital',
    shopLogo: ''
};

let displaySettings = { ...DEFAULT_DISPLAY_SETTINGS };
let tempDisplayTheme = 'light';
let tempDisplayColor = 'red';
let tempDisplayFont = 'normal';
let tempDisplayLogo = '';

function initDisplaySettings() {
    try {
        const stored = localStorage.getItem(STORAGE_DISPLAY_SETTINGS_KEY);
        if (stored) {
            displaySettings = Object.assign({}, DEFAULT_DISPLAY_SETTINGS, JSON.parse(stored));
        }
    } catch (e) {
        console.warn('Gagal memuat pengaturan tampilan dari localStorage:', e);
    }

    applyDisplaySettings(displaySettings);

    // Sinkronisasi real-time antar perangkat (HP & komputer)
    if (typeof db !== 'undefined' && db) {
        db.collection('settings').doc('display').onSnapshot(doc => {
            if (!doc.exists) return;
            displaySettings = Object.assign({}, DEFAULT_DISPLAY_SETTINGS, doc.data());
            try {
                localStorage.setItem(STORAGE_DISPLAY_SETTINGS_KEY, JSON.stringify(displaySettings));
            } catch (e) {}
            // Jangan ganggu pratinjau saat modal sedang dibuka
            if (!isDisplaySettingsModalOpen()) {
                applyDisplaySettings(displaySettings);
            }
        }, err => console.warn('Gagal sync display settings dari Firestore:', err));
    }
}

function isDisplaySettingsModalOpen() {
    const overlay = document.getElementById('display-settings-modal-overlay');
    return !!(overlay && overlay.classList.contains('active'));
}

function applyDisplaySettings(settings) {
    if (!settings) settings = displaySettings;
    const s = settings;
    const root = document.documentElement;

    // 1. Tema mode gelap/terang
    if (s.theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
    } else {
        root.removeAttribute('data-theme');
    }

    // 2. Aksen warna
    if (s.color && s.color !== 'red') {
        root.setAttribute('data-color', s.color);
    } else {
        root.removeAttribute('data-color');
    }

    // 3. Ukuran font
    if (s.fontSize === 'large') {
        root.classList.add('font-large');
    } else {
        root.classList.remove('font-large');
    }

    // 4. Branding toko: nama & tagline
    const shopName = s.shopName || 'Delsi Shop';
    const shopTagline = s.shopTagline || 'Sistem Kasir & Manajemen Warung Digital';

    const headerName = document.getElementById('header-shop-name');
    if (headerName) headerName.textContent = shopName;

    const headerTagline = document.getElementById('header-shop-tagline');
    if (headerTagline) headerTagline.textContent = shopTagline;

    const loginName = document.getElementById('login-shop-name');
    if (loginName) loginName.textContent = shopName;

    const loginTagline = document.getElementById('login-shop-tagline');
    if (loginTagline) loginTagline.textContent = shopTagline;

    const receiptName = document.getElementById('receipt-shop-name');
    if (receiptName) receiptName.textContent = shopName;

    const receiptTagline = document.getElementById('receipt-shop-tagline');
    if (receiptTagline) receiptTagline.textContent = shopTagline;

    const receiptFooter = document.getElementById('receipt-shop-footer');
    if (receiptFooter) receiptFooter.textContent = shopName;

    const reportName = document.getElementById('report-shop-name');
    if (reportName) reportName.textContent = `${shopName} - Laporan Transaksi`;

    const reportTagline = document.getElementById('report-shop-tagline');
    if (reportTagline) reportTagline.textContent = shopTagline;

    const barcodeName = document.getElementById('barcode-shop-name');
    if (barcodeName) barcodeName.textContent = shopName;

    document.title = `${shopName} - Kasir Warung Digital`;

    // 5. Logo toko
    const defaultLogoSrc = 'favicon-192.png?v=3';
    const logoSrc = s.shopLogo || defaultLogoSrc;

    const headerLogo = document.getElementById('header-shop-logo');
    if (headerLogo) headerLogo.src = logoSrc;

    const loginLogo = document.getElementById('login-shop-logo');
    if (loginLogo) loginLogo.src = logoSrc;

    const receiptLogo = document.getElementById('receipt-shop-logo');
    if (receiptLogo) receiptLogo.src = logoSrc;

    const reportLogo = document.getElementById('report-print-logo');
    if (reportLogo) reportLogo.src = logoSrc;

    const barcodeLogo = document.getElementById('barcode-shop-logo');
    if (barcodeLogo) barcodeLogo.src = logoSrc;

    // Segarkan grafik omzet jika warna/tema tampilan berubah
    if (typeof omzetChart !== 'undefined' && omzetChart) {
        renderDashboardOmzet();
    }
}

function openDisplaySettingsModal() {
    tempDisplayTheme = displaySettings.theme || 'light';
    tempDisplayColor = displaySettings.color || 'red';
    tempDisplayFont = displaySettings.fontSize || 'normal';
    tempDisplayLogo = displaySettings.shopLogo || '';

    const nameInput = document.getElementById('setting-shop-name');
    if (nameInput) nameInput.value = displaySettings.shopName || 'Delsi Shop';

    const taglineInput = document.getElementById('setting-shop-tagline');
    if (taglineInput) taglineInput.value = displaySettings.shopTagline || 'Sistem Kasir & Manajemen Warung Digital';

    const logoHidden = document.getElementById('setting-shop-logo');
    if (logoHidden) logoHidden.value = tempDisplayLogo;

    const previewImg = document.getElementById('display-logo-preview-img');
    if (previewImg) previewImg.src = tempDisplayLogo || 'favicon-192.png?v=3';

    const btnRemove = document.getElementById('btn-remove-display-logo');
    if (btnRemove) btnRemove.style.display = tempDisplayLogo ? 'inline-block' : 'none';

    updateDisplaySettingsModalUI();

    const overlay = document.getElementById('display-settings-modal-overlay');
    if (overlay) overlay.classList.add('active');
}

function updateDisplaySettingsModalUI() {
    document.querySelectorAll('.theme-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-theme-value') === tempDisplayTheme);
    });

    document.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-color-value') === tempDisplayColor);
    });

    document.querySelectorAll('.font-option').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-font-value') === tempDisplayFont);
    });
}

function selectDisplayTheme(theme) {
    tempDisplayTheme = theme;
    updateDisplaySettingsModalUI();
    previewTempDisplaySettings();
}

function selectDisplayColor(color) {
    tempDisplayColor = color;
    updateDisplaySettingsModalUI();
    previewTempDisplaySettings();
}

function selectDisplayFont(font) {
    tempDisplayFont = font;
    updateDisplaySettingsModalUI();
    previewTempDisplaySettings();
}

function previewTempDisplaySettings() {
    const nameInput = document.getElementById('setting-shop-name');
    const taglineInput = document.getElementById('setting-shop-tagline');
    applyDisplaySettings({
        theme: tempDisplayTheme,
        color: tempDisplayColor,
        fontSize: tempDisplayFont,
        shopName: (nameInput && nameInput.value.trim()) || 'Delsi Shop',
        shopTagline: (taglineInput && taglineInput.value.trim()) || 'Sistem Kasir & Manajemen Warung Digital',
        shopLogo: tempDisplayLogo
    });
}

// Resize logo sambil mempertahankan transparansi (khusus PNG/WebP)
function resizeLogoDataUrl(dataUrl, maxSize = 320) {
    return new Promise(function(resolve) {
        const img = new Image();
        img.onload = function() {
            try {
                let width = img.width;
                let height = img.height;
                if (width > maxSize || height > maxSize) {
                    const scale = Math.min(maxSize / width, maxSize / height);
                    width = Math.max(1, Math.round(width * scale));
                    height = Math.max(1, Math.round(height * scale));
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                resolve(dataUrl);
            }
        };
        img.onerror = function() { resolve(dataUrl); };
        img.src = dataUrl;
    });
}

function handleDisplayLogoUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran logo maksimal 2MB!', 'warning');
        event.target.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        resizeLogoDataUrl(e.target.result, 320)
            .then(base64 => base64.length > 700000 ? resizeLogoDataUrl(e.target.result, 160) : base64)
            .then(base64 => {
                if (base64.length > 900000) {
                    showToast('Logo terlalu besar. Gunakan gambar yang lebih sederhana.', 'warning');
                    return;
                }
                tempDisplayLogo = base64;
                const logoHidden = document.getElementById('setting-shop-logo');
                if (logoHidden) logoHidden.value = base64;
                const previewImg = document.getElementById('display-logo-preview-img');
                if (previewImg) previewImg.src = base64;
                const btnRemove = document.getElementById('btn-remove-display-logo');
                if (btnRemove) btnRemove.style.display = 'inline-block';
                previewTempDisplaySettings();
                showToast('Logo berhasil dipilih!', 'info');
            })
            .catch(() => showToast('Gagal memproses logo.', 'warning'));
    };
    reader.readAsDataURL(file);
    // Reset agar file yang sama bisa dipilih ulang setelah diproses
    event.target.value = '';
}

function removeDisplayLogo() {
    tempDisplayLogo = '';
    const logoHidden = document.getElementById('setting-shop-logo');
    if (logoHidden) logoHidden.value = '';
    const previewImg = document.getElementById('display-logo-preview-img');
    if (previewImg) previewImg.src = 'favicon-192.png?v=3';
    const fileInput = document.getElementById('display-logo-file');
    if (fileInput) fileInput.value = '';
    const btnRemove = document.getElementById('btn-remove-display-logo');
    if (btnRemove) btnRemove.style.display = 'none';
    previewTempDisplaySettings();
}

function closeDisplaySettingsModal() {
    const overlay = document.getElementById('display-settings-modal-overlay');
    if (overlay) overlay.classList.remove('active');
    // Batalkan pratinjau yang belum disimpan
    applyDisplaySettings(displaySettings);
}

function closeDisplaySettingsOnOverlay(event) {
    if (event.target === event.currentTarget) {
        closeDisplaySettingsModal();
    }
}

function handleSaveDisplaySettings(event) {
    event.preventDefault();
    const nameInput = document.getElementById('setting-shop-name');
    const taglineInput = document.getElementById('setting-shop-tagline');

    displaySettings.theme = tempDisplayTheme;
    displaySettings.color = tempDisplayColor;
    displaySettings.fontSize = tempDisplayFont;
    displaySettings.shopName = (nameInput && nameInput.value.trim()) || 'Delsi Shop';
    displaySettings.shopTagline = (taglineInput && taglineInput.value.trim()) || 'Sistem Kasir & Manajemen Warung Digital';
    displaySettings.shopLogo = tempDisplayLogo || '';

    try {
        localStorage.setItem(STORAGE_DISPLAY_SETTINGS_KEY, JSON.stringify(displaySettings));
    } catch (e) {
        console.warn('Gagal menyimpan display settings ke localStorage:', e);
    }

    if (typeof db !== 'undefined' && db) {
        db.collection('settings').doc('display').set(displaySettings)
            .catch(err => console.warn('Gagal menyimpan settings display ke Firestore:', err));
    }

    applyDisplaySettings(displaySettings);
    closeDisplaySettingsModal();
    showToast('Pengaturan tampilan berhasil disimpan!', 'success');
}

function resetCart() {
    if (cart.length > 0 && !confirm('Apakah Anda yakin ingin mereset keranjang belanja?')) {
        return;
    }
    cart = [];
    const inputBayar = document.getElementById('input-bayar');
    if (inputBayar) {
        inputBayar.value = '';
        inputBayar.disabled = false;
    }
    const selectMetode = document.getElementById('select-metode-bayar');
    if (selectMetode) selectMetode.value = 'Tunai';
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.metode === 'Tunai');
    });
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

    const session = getSession();
    const kasirName = session ? (session.fullName || session.username) : (document.getElementById('input-kasir') ? document.getElementById('input-kasir').value.trim() || 'Kasir' : 'Kasir');
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
    logActivity('transaksi', `Transaksi POS #${transactionId} diproses oleh '${kasirName}' (Total: ${formatRupiah(grandTotal)})`, transactionId);

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

    // Render QR Code struk
    const qrContainer = document.getElementById('receipt-qr-code');
    if (qrContainer) {
        qrContainer.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            try {
                new QRCode(qrContainer, {
                    text: `DELSI-SHOP|${trx.id}|TOTAL:${trx.total}|METODE:${trx.metodePembayaran || 'Tunai'}`,
                    width: 90,
                    height: 90,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.M
                });
            } catch (e) {
                console.warn('Gagal render QR Code struk:', e);
            }
        }
    }

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

let currentReportMetodeFilter = 'all';

function setReportMetodeFilter(metode) {
    currentReportMetodeFilter = metode;
    document.querySelectorAll('.payment-filter-bar .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-metode') === metode);
    });
    renderReports();
}

function renderReports() {
    const tbody = document.getElementById('tbody-laporan');
    const statOmzet = document.getElementById('stat-total-omzet');
    const statCount = document.getElementById('stat-jumlah-transaksi');
    const statModal = document.getElementById('stat-total-modal');
    const statLaba = document.getElementById('stat-total-laba');
    const statTunai = document.getElementById('stat-omzet-tunai');
    const statNonTunai = document.getElementById('stat-omzet-nontunai');

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
            const parts = dateVal.split('-');
            const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
            filtered = transactions.filter(t => t.timestamp && t.timestamp.startsWith(formattedDate));
        }
    }

    // Filter berdasarkan metode pembayaran
    if (currentReportMetodeFilter && currentReportMetodeFilter !== 'all') {
        filtered = filtered.filter(t => (t.metodePembayaran || 'Tunai') === currentReportMetodeFilter);
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

    const totalOmzetTunai = filtered.filter(t => (t.metodePembayaran || 'Tunai') === 'Tunai').reduce((sum, t) => sum + t.total, 0);
    const totalOmzetNonTunai = filtered.filter(t => (t.metodePembayaran || 'Tunai') !== 'Tunai').reduce((sum, t) => sum + t.total, 0);

    statOmzet.textContent = formatRupiah(totalOmzet);
    statCount.textContent = `${totalTrxCount} Transaksi`;
    if (statModal) statModal.textContent = formatRupiah(totalModal);
    if (statLaba) statLaba.textContent = formatRupiah(totalLaba);
    if (statTunai) statTunai.textContent = formatRupiah(totalOmzetTunai);
    if (statNonTunai) statNonTunai.textContent = formatRupiah(totalOmzetNonTunai);

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: var(--text-secondary); padding: 1.5rem;">Belum ada riwayat transaksi.</td></tr>`;
        return;
    }

    filtered.forEach((trx) => {
        const realIndex = transactions.indexOf(trx);
        const trxModal = (trx.items || []).reduce((s, item) => {
            const p = products.find(pp => pp.kode === item.kode);
            return s + (p ? (p.modal || 0) * item.jumlah : 0);
        }, 0);
        const kasir = trx.kasir || 'Kasir';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${trx.id}</strong></td>
            <td>${trx.timestamp}</td>
            <td>${getMetodeBadge(trx.metodePembayaran)}</td>
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

function getMetodeBadge(metode) {
    metode = metode || 'Tunai';
    let cls = 'tunai';
    let icon = '<i class="fa-solid fa-money-bill-wave"></i>';
    if (metode === 'QRIS') {
        cls = 'qris';
        icon = '<i class="fa-solid fa-qrcode"></i>';
    } else if (metode === 'Transfer Bank') {
        cls = 'transfer';
        icon = '<i class="fa-solid fa-building-columns"></i>';
    } else if (metode === 'E-Wallet') {
        cls = 'ewallet';
        icon = '<i class="fa-solid fa-mobile-screen-button"></i>';
    }
    return `<span class="metode-badge ${cls}">${icon} ${escapeHtml(metode)}</span>`;
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
    if (!requireRole(['Administrator'], 'menghapus transaksi')) return;
    const trx = transactions[index];
    if (!trx) return;

    if (confirm(`Apakah Anda yakin ingin menghapus catatan transaksi ${trx.id}?`)) {
        const deletedId = trx.id;
        transactions.splice(index, 1);
        saveTransactionsToStorage();

        if (typeof db !== 'undefined' && db) {
            db.collection('transactions').doc(deletedId).delete().catch(() => {});
        }

        renderReports();
        showToast('Transaksi berhasil dihapus dari laporan.', 'info');
        logActivity('hapus_transaksi', `Admin menghapus transaksi #${deletedId}`, deletedId);
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
        gambar: PRODUCT_IMAGE_CATALOG['BRG016']
    },
    {
        kode: 'BRG017', nama: 'Mie Indomie Kuah Soto', harga: 3500, modal: 2500, stok: 80,
        gambar: PRODUCT_IMAGE_CATALOG['BRG017']
    },
    {
        kode: 'BRG018', nama: 'Mie Sedaap Goreng', harga: 3000, modal: 2200, stok: 90,
        gambar: PRODUCT_IMAGE_CATALOG['BRG018']
    },
    {
        kode: 'BRG019', nama: 'Kopi ABC Sachet', harga: 2000, modal: 1400, stok: 150,
        gambar: PRODUCT_IMAGE_CATALOG['BRG019']
    },
    {
        kode: 'BRG020', nama: 'Kopi White Koffie', harga: 3000, modal: 2000, stok: 60,
        gambar: PRODUCT_IMAGE_CATALOG['BRG020']
    },
    {
        kode: 'BRG021', nama: 'Teh Sariwangi Celup', harga: 6500, modal: 5000, stok: 40,
        gambar: PRODUCT_IMAGE_CATALOG['BRG021']
    },
    {
        kode: 'BRG022', nama: 'Teh Pucuk Harum 350ml', harga: 4000, modal: 2800, stok: 70,
        gambar: PRODUCT_IMAGE_CATALOG['BRG022']
    },
    {
        kode: 'BRG023', nama: 'Air Mineral Aqua 1500ml', harga: 6500, modal: 4500, stok: 50,
        gambar: PRODUCT_IMAGE_CATALOG['BRG023']
    },
    {
        kode: 'BRG024', nama: 'Susu UHT Ultra Milk 1L', harga: 16000, modal: 13000, stok: 30,
        gambar: PRODUCT_IMAGE_CATALOG['BRG024']
    },
    {
        kode: 'BRG025', nama: 'Susu Bendera Kental Manis', harga: 10000, modal: 8000, stok: 35,
        gambar: PRODUCT_IMAGE_CATALOG['BRG025']
    },
    // ===== Snack & Cemilan =====
    {
        kode: 'BRG026', nama: 'Chitato Sapi Panggang 68g', harga: 10500, modal: 8500, stok: 25,
        gambar: PRODUCT_IMAGE_CATALOG['BRG026']
    },
    {
        kode: 'BRG027', nama: 'Qtela Singkong Balado 60g', harga: 8000, modal: 6000, stok: 30,
        gambar: PRODUCT_IMAGE_CATALOG['BRG027']
    },
    {
        kode: 'BRG028', nama: 'Taro Net Seaweed 40g', harga: 5500, modal: 4000, stok: 40,
        gambar: PRODUCT_IMAGE_CATALOG['BRG028']
    },
    {
        kode: 'BRG029', nama: 'Permen Kopiko 78', harga: 1500, modal: 1000, stok: 200,
        gambar: PRODUCT_IMAGE_CATALOG['BRG029']
    },
    {
        kode: 'BRG030', nama: 'Permen Relaxa', harga: 1500, modal: 1000, stok: 150,
        gambar: PRODUCT_IMAGE_CATALOG['BRG030']
    },
    // ===== Bumbu Dapur =====
    {
        kode: 'BRG031', nama: 'Garam Dapur Refina 500g', harga: 5000, modal: 3500, stok: 50,
        gambar: PRODUCT_IMAGE_CATALOG['BRG031']
    },
    {
        kode: 'BRG032', nama: 'Kaldu Masako Ayam 100g', harga: 6000, modal: 4500, stok: 45,
        gambar: PRODUCT_IMAGE_CATALOG['BRG032']
    },
    {
        kode: 'BRG033', nama: 'Lada Bubuk Koepoe 50g', harga: 8000, modal: 6000, stok: 30,
        gambar: PRODUCT_IMAGE_CATALOG['BRG033']
    },
    {
        kode: 'BRG034', nama: 'Saus Sambal ABC 275ml', harga: 10000, modal: 7500, stok: 35,
        gambar: PRODUCT_IMAGE_CATALOG['BRG034']
    },
    {
        kode: 'BRG035', nama: 'Kecap Manis ABC 275ml', harga: 12000, modal: 9000, stok: 40,
        gambar: PRODUCT_IMAGE_CATALOG['BRG035']
    },
    // ===== Kebutuhan Pokok =====
    {
        kode: 'BRG036', nama: 'Margarin Blue Band 200g', harga: 9500, modal: 7500, stok: 30,
        gambar: PRODUCT_IMAGE_CATALOG['BRG036']
    },
    {
        kode: 'BRG037', nama: 'Roti Tawar Sari Roti', harga: 11000, modal: 8500, stok: 20,
        gambar: PRODUCT_IMAGE_CATALOG['BRG037']
    },
    {
        kode: 'BRG038', nama: 'Telur Ayam Butir', harga: 2500, modal: 2100, stok: 100,
        gambar: PRODUCT_IMAGE_CATALOG['BRG038']
    },
    {
        kode: 'BRG039', nama: 'Sarden ABC Tomat 155g', harga: 11000, modal: 8500, stok: 25,
        gambar: PRODUCT_IMAGE_CATALOG['BRG039']
    },
    // ===== Kebutuhan Rumah Tangga =====
    {
        kode: 'BRG040', nama: 'Shampo Pantene Sachet', harga: 1000, modal: 650, stok: 200,
        gambar: PRODUCT_IMAGE_CATALOG['BRG040']
    },
];

function loadBatchSampleProducts() {
    let addedCount = 0;
    let skippedCount = 0;

    BATCH_PRODUCTS.forEach(sample => {
        const exists = products.find(p => p.kode === sample.kode);
        if (!exists) {
            products.push({ ...sample, gambar: PRODUCT_IMAGE_CATALOG[sample.kode] || sample.gambar });
            addedCount++;
        } else {
            if (!exists.gambar || exists.gambar === DEFAULT_IMAGE || exists.gambar.includes('1588964895597')) {
                exists.gambar = PRODUCT_IMAGE_CATALOG[sample.kode] || sample.gambar;
            }
            skippedCount++;
        }
    });

    saveProductsToStorage();
    renderProducts();
    if (typeof renderProductsKasir === 'function') renderProductsKasir();
    if (typeof renderCustomerStorefront === 'function') renderCustomerStorefront();
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
function compressImageDataUrl(dataUrl, maxDim = 480, quality = 0.68) {
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
        const imgUrl = (product.gambar && product.gambar !== DEFAULT_IMAGE && !product.gambar.includes('1588964895597')) 
            ? product.gambar 
            : getProductAutoImage(product);
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

let omzetChart = null;
let currentChartPeriod = '7days';

function setChartPeriod(period) {
    currentChartPeriod = period;
    document.querySelectorAll('.chart-period-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-period') === period);
    });
    renderDashboardOmzet();
}

function hexToRgba(hex, alpha) {
    if (!hex) return `rgba(21, 101, 192, ${alpha})`;
    hex = hex.replace('#', '').trim();
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) || 21;
    const g = parseInt(hex.substring(2, 4), 16) || 101;
    const b = parseInt(hex.substring(4, 6), 16) || 192;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function renderDashboardOmzet() {
    const statOmzet = document.getElementById('dash-omzet-7hari');
    const now = new Date();

    // 1. Hitung omzet 7 hari terakhir untuk kartu statistik atas
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const txLast7Days = transactions.filter(t => {
        if (!t.rawDate) return false;
        return new Date(t.rawDate) >= sevenDaysAgo;
    });
    const omzet7Hari = txLast7Days.reduce((sum, t) => sum + (t.total || 0), 0);
    if (statOmzet) {
        statOmzet.textContent = formatRupiah(omzet7Hari);
    }

    // 2. Siapkan data titik untuk grafik berdasarkan periode
    const daysKeys = [];
    const labels = [];
    const dataOmzet = [];
    const dataTxCount = [];
    const titleEl = document.getElementById('chart-omzet-title');

    let totalDays = 7;
    if (currentChartPeriod === '30days') {
        totalDays = 30;
        if (titleEl) titleEl.textContent = 'Grafik Omzet 30 Hari Terakhir';
    } else if (currentChartPeriod === 'thisMonth') {
        totalDays = now.getDate();
        if (titleEl) titleEl.textContent = 'Grafik Omzet Bulan Ini';
    } else {
        totalDays = 7;
        if (titleEl) titleEl.textContent = 'Grafik Omzet 7 Hari Terakhir';
    }

    for (let i = totalDays - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dt = String(d.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${dt}`;

        let labelText = '';
        if (totalDays <= 7) {
            labelText = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
        } else {
            labelText = `${d.getDate()}/${d.getMonth() + 1}`;
        }

        daysKeys.push(key);
        labels.push(labelText);
        dataOmzet.push(0);
        dataTxCount.push(0);
    }

    const keyIndexMap = new Map();
    daysKeys.forEach((k, idx) => keyIndexMap.set(k, idx));

    transactions.forEach(t => {
        if (!t.rawDate) return;
        const d = new Date(t.rawDate);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dt = String(d.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${dt}`;

        if (keyIndexMap.has(key)) {
            const idx = keyIndexMap.get(key);
            dataOmzet[idx] += (t.total || 0);
            dataTxCount[idx] += 1;
        }
    });

    // 3. Render Chart.js
    const canvas = document.getElementById('chart-omzet');
    if (!canvas || typeof Chart === 'undefined') return;

    if (omzetChart) {
        try {
            omzetChart.destroy();
        } catch (e) {}
        omzetChart = null;
    }

    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const rootStyle = getComputedStyle(document.documentElement);
    const primaryColor = rootStyle.getPropertyValue('--primary-color').trim() || '#1565c0';
    const textColor = isDark ? '#b0b0b0' : '#616161';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, hexToRgba(primaryColor, 0.35));
    gradient.addColorStop(1, hexToRgba(primaryColor, 0.02));

    try {
        omzetChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Omzet',
                    data: dataOmzet,
                    borderColor: primaryColor,
                    backgroundColor: gradient,
                    borderWidth: 3,
                    tension: 0.35,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: primaryColor,
                    pointBorderWidth: 2,
                    pointRadius: totalDays <= 7 ? 5 : 3,
                    pointHoverRadius: totalDays <= 7 ? 7 : 5,
                    pointHoverBackgroundColor: primaryColor,
                    pointHoverBorderColor: '#ffffff',
                    pointHoverBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 400
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#262626' : '#1e293b',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        padding: 10,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            title: items => items[0].label,
                            label: context => {
                                const val = context.parsed.y || 0;
                                const count = dataTxCount[context.dataIndex] || 0;
                                return [
                                    `Omzet: ${formatRupiah(val)}`,
                                    `Jumlah: ${count} transaksi`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                family: "'Segoe UI', sans-serif",
                                size: 11
                            },
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: totalDays <= 7 ? 7 : 12
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor,
                            font: {
                                family: "'Segoe UI', sans-serif",
                                size: 11
                            },
                            callback: function(value) {
                                if (value >= 1000000) return 'Rp ' + (value / 1000000).toFixed(1) + ' jt';
                                if (value >= 1000) return 'Rp ' + (value / 1000).toLocaleString('id-ID') + ' rb';
                                return 'Rp ' + value;
                            }
                        }
                    }
                }
            }
        });
    } catch (err) {
        console.warn('Gagal menginisialisasi Chart.js:', err);
    }
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
        // Tutup modal pilih barang bergambar
        const pickerOverlay = document.getElementById('product-picker-modal-overlay');
        if (pickerOverlay && pickerOverlay.classList.contains('active')) {
            closeProductPicker();
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
                .shop-logo {
                    width: 40px;
                    height: 40px;
                    object-fit: contain;
                    margin: 0 auto 4px;
                    display: block;
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
                <img class="shop-logo" src="${escapeHtml((displaySettings && displaySettings.shopLogo) || 'favicon-192.png?v=3')}" alt="">
                <p class="shop-name">${escapeHtml((displaySettings && displaySettings.shopName) || 'Delsi Shop')}</p>
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

/* ==========================================================================
   12. FITUR KHUSUS KASIR (KATALOG & STOK, RESTOCK, EDIT DIIZINKAN)
   ========================================================================== */

function renderProductsKasir() {
    const tbody = document.getElementById('tbody-barang-kasir');
    if (!tbody) return;

    const searchVal = document.getElementById('search-barang-kasir') ? document.getElementById('search-barang-kasir').value.toLowerCase().trim() : '';
    tbody.innerHTML = '';

    const filtered = products.filter(p =>
        p.nama.toLowerCase().includes(searchVal) ||
        p.kode.toLowerCase().includes(searchVal) ||
        (p.kategori && p.kategori.toLowerCase().includes(searchVal))
    );

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:#888;">Tidak ada produk yang cocok.</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(p => {
        const realIdx = products.findIndex(item => item.kode === p.kode);
        const imgUrl = (p.gambar && p.gambar !== DEFAULT_IMAGE && !p.gambar.includes('1588964895597')) 
            ? p.gambar 
            : getProductAutoImage(p);

        let stockBadge = `<span class="badge badge-stock-ok">${p.stok}</span>`;
        if (p.stok <= 0) {
            stockBadge = `<span class="badge badge-stock-out">Habis (0)</span>`;
        } else if (p.stok <= 5) {
            stockBadge = `<span class="badge badge-stock-low">Menipis (${p.stok})</span>`;
        }

        return `
            <tr>
                <td>
                    <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.nama)}" class="product-thumb" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'">
                </td>
                <td><strong>${escapeHtml(p.kode)}</strong></td>
                <td>
                    <div><strong>${escapeHtml(p.nama)}</strong></div>
                    <small style="color:#666;">${escapeHtml(p.deskripsi || '-')}</small>
                </td>
                <td><span class="product-category-tag">${escapeHtml(p.kategori || 'Umum')}</span></td>
                <td><strong>${formatRupiah(p.harga)}</strong></td>
                <td>${stockBadge}</td>
                <td>
                    <div class="action-btns">
                        <button type="button" class="btn btn-outline-secondary btn-sm" onclick="quickRestockProduct(${realIdx})" title="Tambah / Restock Stok">
                            <i class="fa-solid fa-plus"></i> Restock
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" onclick="openKasirProductModal(${realIdx})" title="Edit Info Produk">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function quickRestockProduct(realIdx) {
    if (!requireRole(['Kasir', 'Administrator'], 'menambah stok')) return;
    const p = products[realIdx];
    if (!p) return;

    const tambahan = prompt(`Tambah stok untuk '${p.nama}' (Stok sekarang: ${p.stok}):\nMasukkan jumlah barang masuk:`, "10");
    if (tambahan === null) return;

    const qty = parseInt(tambahan);
    if (isNaN(qty) || qty <= 0) {
        showToast('Jumlah stok harus berupa angka lebih dari 0!', 'warning');
        return;
    }

    p.stok += qty;
    saveProductsToStorage();
    renderProductsKasir();
    renderProducts();
    populateProductDropdown();
    renderDashboardStokMenipis();

    showToast(`Stok '${p.nama}' ditambah ${qty}. Total sekarang: ${p.stok}.`, 'success');
    logActivity('restock_kasir', `Kasir menambah stok '${p.nama}' sebanyak +${qty} unit. Total: ${p.stok}`, p.kode);

    if (typeof db !== 'undefined' && db) {
        db.collection('products').doc(p.kode).set(p).catch(() => {});
    }
}

function openKasirProductModal(index) {
    if (!requireRole(['Kasir', 'Administrator'], 'mengelola produk')) return;
    const modal = document.getElementById('kasir-product-modal');
    if (!modal) return;

    populateCategoryDropdowns();

    const titleEl = document.getElementById('kasir-modal-title');
    const idxInput = document.getElementById('kasir-edit-index');
    const namaInput = document.getElementById('kasir-nama-barang');
    const katSelect = document.getElementById('kasir-kategori-barang');
    const hargaInput = document.getElementById('kasir-harga-barang');
    const stokInput = document.getElementById('kasir-stok-barang');
    const descInput = document.getElementById('kasir-deskripsi-barang');
    const imgUrlInput = document.getElementById('kasir-gambar-url');

    if (index === -1) {
        // Tambah produk baru
        titleEl.innerHTML = `<i class="fa-solid fa-plus-circle"></i> Tambah Produk Baru (Kasir)`;
        idxInput.value = -1;
        document.getElementById('form-barang-kasir').reset();
    } else {
        // Edit produk yang ada
        const p = products[index];
        if (!p) return;
        titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Info Produk: ${escapeHtml(p.nama)}`;
        idxInput.value = index;
        namaInput.value = p.nama;
        if (katSelect) katSelect.value = p.kategori || 'Umum';
        hargaInput.value = p.harga;
        stokInput.value = p.stok;
        descInput.value = p.deskripsi || '';
        imgUrlInput.value = p.gambar || '';
    }

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeKasirProductModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('kasir-product-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function handleKasirImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        showToast('Ukuran foto terlalu besar (maksimal 2MB)!', 'warning');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(ev) {
        const urlInput = document.getElementById('kasir-gambar-url');
        if (urlInput) urlInput.value = ev.target.result;
        showToast('Foto produk berhasil dipilih!', 'success');
    };
    reader.readAsDataURL(file);
}

function handleSaveProductKasir(e) {
    e.preventDefault();
    if (!requireRole(['Kasir', 'Administrator'], 'menyimpan produk')) return;

    const editIndex = parseInt(document.getElementById('kasir-edit-index').value);
    const nama = document.getElementById('kasir-nama-barang').value.trim();
    const kategori = document.getElementById('kasir-kategori-barang').value;
    const harga = parseInt(document.getElementById('kasir-harga-barang').value);
    const stok = parseInt(document.getElementById('kasir-stok-barang').value);
    const deskripsi = document.getElementById('kasir-deskripsi-barang').value.trim();
    const existingProd = editIndex !== -1 ? products[editIndex] : null;
    const fallbackImg = getProductAutoImage({ kode: existingProd ? existingProd.kode : '', nama: nama });
    const gambar = document.getElementById('kasir-gambar-url').value.trim() || fallbackImg;

    if (!nama || isNaN(harga) || isNaN(stok)) {
        showToast('Mohon isi nama barang, harga, dan stok dengan benar!', 'warning');
        return;
    }

    let kodeInput;
    let modalVal = 0;

    if (editIndex === -1) {
        // Produk baru
        kodeInput = generateProductCode();
        modalVal = 0; // Kasir tidak mengisi harga modal
        const newProduct = {
            kode: kodeInput,
            nama: nama,
            kategori: kategori,
            deskripsi: deskripsi,
            harga: harga,
            modal: modalVal,
            stok: stok,
            gambar: gambar
        };
        products.push(newProduct);
        showToast(`Produk '${nama}' berhasil ditambahkan!`, 'success');
        logActivity('produk_kasir', `Kasir menambahkan produk baru '${nama}' (${kodeInput})`, kodeInput);

        if (typeof db !== 'undefined' && db) {
            db.collection('products').doc(kodeInput).set(newProduct).catch(() => {});
        }
    } else {
        // Edit produk lama
        const existing = products[editIndex];
        if (!existing) return;
        kodeInput = existing.kode;
        modalVal = existing.modal || 0; // Pertahankan harga modal asli dari admin!

        existing.nama = nama;
        existing.kategori = kategori;
        existing.deskripsi = deskripsi;
        existing.harga = harga;
        existing.stok = stok;
        existing.gambar = gambar;

        showToast(`Info produk '${nama}' berhasil diperbarui!`, 'success');
        logActivity('produk_kasir', `Kasir memperbarui data produk '${nama}' (${kodeInput})`, kodeInput);

        if (typeof db !== 'undefined' && db) {
            db.collection('products').doc(kodeInput).set(existing).catch(() => {});
        }
    }

    saveProductsToStorage();
    closeKasirProductModal();
    renderProductsKasir();
    renderProducts();
    populateProductDropdown();
    renderDashboardStokMenipis();
}

function openKasirPasswordModal() {
    const modal = document.getElementById('kasir-password-modal');
    if (!modal) return;
    const form = document.getElementById('form-kasir-change-pass');
    if (form) form.reset();
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeKasirPasswordModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('kasir-password-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function handleKasirChangePassword(e) {
    e.preventDefault();
    const session = getSession();
    if (!session) {
        showToast('Sesi tidak ditemukan. Silakan login ulang.', 'danger');
        return;
    }

    const oldPass = document.getElementById('kasir-old-password').value;
    const newPass = document.getElementById('kasir-new-password').value;
    const confirmPass = document.getElementById('kasir-confirm-password').value;

    if (newPass.length < 4) {
        showToast('Password baru minimal 4 karakter!', 'warning');
        return;
    }
    if (newPass !== confirmPass) {
        showToast('Ulangi password baru tidak cocok!', 'danger');
        return;
    }

    const users = getUsers();
    const u = users.find(item => item.username === session.username);
    if (!u) {
        showToast('Akun tidak ditemukan.', 'danger');
        return;
    }

    if (u.password !== simpleHash(oldPass)) {
        showToast('Password saat ini salah!', 'danger');
        return;
    }

    u.password = simpleHash(newPass);
    if (saveUsers(users)) {
        closeKasirPasswordModal();
        showToast('Password kasir berhasil diperbarui!', 'success');
        logActivity('ubah_password', `Kasir '${session.username}' mengubah password.`, session.username);
    }
}

/* ==========================================================================
   13. RIWAYAT PENJUALAN KHUSUS KASIR PRIBADI
   ========================================================================== */

function renderRiwayatKasir() {
    const tbody = document.getElementById('tbody-riwayat-kasir');
    const statTrx = document.getElementById('stat-kasir-trx');
    const statOmzet = document.getElementById('stat-kasir-omzet');
    if (!tbody) return;

    const session = getSession();
    const kasirName = session ? session.username : '';

    // Filter transaksi yang diproses kasir ini
    const myTrx = transactions.filter(t =>
        (t.kasir && t.kasir.toLowerCase() === kasirName.toLowerCase()) ||
        (t.kasir && session.fullName && t.kasir.toLowerCase() === session.fullName.toLowerCase())
    );

    const totalTrx = myTrx.length;
    const totalOmzet = myTrx.reduce((sum, t) => sum + (t.total || 0), 0);

    if (statTrx) statTrx.textContent = `${totalTrx} Transaksi`;
    if (statOmzet) statOmzet.textContent = formatRupiah(totalOmzet);

    if (myTrx.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:1.5rem; color:#888;">Belum ada riwayat transaksi yang Anda lakukan.</td></tr>`;
        return;
    }

    tbody.innerHTML = myTrx.map((t, idx) => {
        const realIdx = transactions.indexOf(t);
        return `
            <tr>
                <td>${idx + 1}</td>
                <td><strong>${escapeHtml(t.id)}</strong></td>
                <td>${escapeHtml(t.timestamp)}</td>
                <td>${t.totalItem || (t.items ? t.items.length : 0)} Item</td>
                <td><strong>${formatRupiah(t.total)}</strong></td>
                <td>${getMetodeBadge(t.metodePembayaran)}</td>
                <td>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="showReceiptFromReport(${realIdx})">
                        <i class="fa-solid fa-receipt"></i> Struk
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/* ==========================================================================
   14. ONLINE STOREFRONT PELANGGAN & KERANJANG BELANJA
   ========================================================================== */

let customerCart = [];
let currentCustomerCategoryFilter = 'all';
let currentCustomerDetailProduct = null;

function initCustomerCart() {
    try {
        const session = getSession();
        const cartKey = STORAGE_CUSTOMER_CART_KEY + (session ? '_' + session.username : '');
        const stored = localStorage.getItem(cartKey);
        customerCart = stored ? JSON.parse(stored) : [];
    } catch (e) {
        customerCart = [];
    }
    updateCustomerCartBadge();
}

function saveCustomerCart() {
    try {
        const session = getSession();
        const cartKey = STORAGE_CUSTOMER_CART_KEY + (session ? '_' + session.username : '');
        localStorage.setItem(cartKey, JSON.stringify(customerCart));
    } catch (e) {
        console.warn('Gagal menyimpan cart pelanggan:', e);
    }
    updateCustomerCartBadge();
}

function updateCustomerCartBadge() {
    const totalQty = customerCart.reduce((sum, i) => sum + i.qty, 0);
    const countPills = document.querySelectorAll('#customer-cart-count, #customer-cart-btn-qty');
    countPills.forEach(p => {
        p.textContent = totalQty;
    });
}

function renderCustomerStorefront() {
    // 0. Update Store Banner Branding jika ada
    const bannerName = document.getElementById('store-banner-name');
    const bannerTagline = document.getElementById('store-banner-tagline');
    if (bannerName && displaySettings && displaySettings.shopName) {
        bannerName.textContent = displaySettings.shopName;
    }
    if (bannerTagline && displaySettings && displaySettings.shopTagline) {
        bannerTagline.textContent = displaySettings.shopTagline;
    }

    // 1. Render Category Filter Pills
    const pillsContainer = document.getElementById('customer-category-pills');
    if (pillsContainer) {
        let pillsHtml = `<button type="button" class="cat-pill ${currentCustomerCategoryFilter === 'all' ? 'active' : ''}" onclick="setCustomerCategoryFilter('all', this)"><i class="fa-solid fa-border-all"></i> Semua</button>`;
        categories.forEach(cat => {
            const isActive = currentCustomerCategoryFilter.toLowerCase() === cat.name.toLowerCase();
            pillsHtml += `<button type="button" class="cat-pill ${isActive ? 'active' : ''}" onclick="setCustomerCategoryFilter('${escapeHtml(cat.name)}', this)">${escapeHtml(cat.name)}</button>`;
        });
        pillsContainer.innerHTML = pillsHtml;
    }

    // 2. Filter & Sort Products
    const searchInput = document.getElementById('search-pelanggan-store') || document.getElementById('customer-search-input');
    const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';

    const sortSelect = document.getElementById('sort-pelanggan-store') || document.getElementById('customer-sort-select');
    const sortVal = sortSelect ? sortSelect.value : 'default';

    let list = [...products];

    // Filter Kategori
    if (currentCustomerCategoryFilter !== 'all') {
        list = list.filter(p => (p.kategori || 'Umum').toLowerCase() === currentCustomerCategoryFilter.toLowerCase());
    }

    // Filter Pencarian
    if (searchVal) {
        list = list.filter(p =>
            p.nama.toLowerCase().includes(searchVal) ||
            p.kode.toLowerCase().includes(searchVal) ||
            (p.kategori && p.kategori.toLowerCase().includes(searchVal)) ||
            (p.deskripsi && p.deskripsi.toLowerCase().includes(searchVal))
        );
    }

    // Sorting
    if (sortVal === 'price-low' || sortVal === 'price-asc') {
        list.sort((a, b) => a.harga - b.harga);
    } else if (sortVal === 'price-high' || sortVal === 'price-desc') {
        list.sort((a, b) => b.harga - a.harga);
    } else if (sortVal === 'name-az' || sortVal === 'name-asc') {
        list.sort((a, b) => a.nama.localeCompare(b.nama));
    } else if (sortVal === 'stock-desc') {
        list.sort((a, b) => b.stok - a.stok);
    }

    // Update Counter
    const countEl = document.getElementById('pelanggan-products-count');
    if (countEl) {
        countEl.textContent = `Menampilkan ${list.length} produk`;
    }

    // 3. Render Cards
    const grid = document.getElementById('pelanggan-products-grid') || document.getElementById('customer-products-grid');
    if (!grid) return;

    if (list.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; padding:3rem 1rem; color:#888;">
                <i class="fa-solid fa-box-open" style="font-size:3rem; margin-bottom:1rem; opacity:0.4;"></i>
                <p>Tidak ada produk yang cocok dengan pencarian atau kategori ini.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = list.map(p => {
        const isOutOfStock = p.stok <= 0;
        const imgUrl = (p.gambar && p.gambar !== DEFAULT_IMAGE && !p.gambar.includes('1588964895597')) 
            ? p.gambar 
            : getProductAutoImage(p);

        return `
            <div class="pelanggan-product-card">
                <div class="product-card-img" onclick="openCustomerProductDetail('${p.kode}')">
                    <img src="${escapeHtml(imgUrl)}" alt="${escapeHtml(p.nama)}" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'">
                    <span class="product-card-category">${escapeHtml(p.kategori || 'Umum')}</span>
                    ${isOutOfStock ? '<div class="product-out-overlay">Stok Habis</div>' : ''}
                </div>
                <div class="product-card-body">
                    <h4 class="product-card-title" onclick="openCustomerProductDetail('${p.kode}')" title="${escapeHtml(p.nama)}">${escapeHtml(p.nama)}</h4>
                    <p class="product-card-desc">${escapeHtml(p.deskripsi || 'Produk berkualitas pilihan warung digital.')}</p>
                    <div class="product-card-price-row">
                        <span class="product-card-price">${formatRupiah(p.harga)}</span>
                        <span class="product-card-stock">${isOutOfStock ? 'Habis' : 'Stok: ' + p.stok}</span>
                    </div>
                    <div class="product-card-actions">
                        <button type="button" class="btn btn-outline-secondary btn-sm" onclick="openCustomerProductDetail('${p.kode}')">
                            <i class="fa-solid fa-eye"></i> Detail
                        </button>
                        <button type="button" class="btn btn-primary btn-sm" onclick="quickCustomerAddToCart('${p.kode}')" ${isOutOfStock ? 'disabled' : ''}>
                            <i class="fa-solid fa-cart-plus"></i> Beli
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function setCustomerCategoryFilter(catName, btn) {
    currentCustomerCategoryFilter = catName;
    if (btn) {
        const parent = btn.parentElement;
        if (parent) {
            parent.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    }
    renderCustomerStorefront();
}

function filterCustomerStore() {
    renderCustomerStorefront();
}

function openCustomerProductDetail(kode) {
    const product = products.find(p => p.kode === kode);
    if (!product) return;

    currentCustomerDetailProduct = product;

    const modal = document.getElementById('customer-product-detail-modal');
    if (!modal) return;

    const modalImg = (product.gambar && product.gambar !== DEFAULT_IMAGE && !product.gambar.includes('1588964895597')) 
        ? product.gambar 
        : getProductAutoImage(product);
    document.getElementById('cust-modal-img').src = modalImg;
    document.getElementById('cust-modal-name').textContent = product.nama;
    document.getElementById('cust-modal-category').textContent = product.kategori || 'Umum';
    document.getElementById('cust-modal-price').textContent = formatRupiah(product.harga);
    document.getElementById('cust-modal-desc').textContent = product.deskripsi || 'Tidak ada keterangan khusus.';

    const stockBadge = document.getElementById('cust-modal-stock');
    if (stockBadge) {
        if (product.stok <= 0) {
            stockBadge.textContent = 'Stok Habis';
            stockBadge.className = 'badge badge-stock-out';
        } else {
            stockBadge.textContent = `Tersedia: ${product.stok} unit`;
            stockBadge.className = 'badge badge-stock-ok';
        }
    }

    const qtyInput = document.getElementById('cust-modal-qty');
    if (qtyInput) qtyInput.value = 1;

    const btnAdd = document.getElementById('btn-cust-add-to-cart');
    if (btnAdd) {
        btnAdd.disabled = product.stok <= 0;
    }

    updateCustDetailSubtotal();

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeCustomerProductDetail(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('customer-product-detail-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function adjustCustDetailQty(delta) {
    const input = document.getElementById('cust-modal-qty');
    if (!input || !currentCustomerDetailProduct) return;

    let qty = parseInt(input.value) + delta;
    if (qty < 1) qty = 1;
    if (qty > currentCustomerDetailProduct.stok) {
        qty = currentCustomerDetailProduct.stok;
        showToast(`Stok maksimal tersedia hanya ${currentCustomerDetailProduct.stok} unit.`, 'warning');
    }
    input.value = qty;
    updateCustDetailSubtotal();
}

function updateCustDetailSubtotal() {
    if (!currentCustomerDetailProduct) return;
    const input = document.getElementById('cust-modal-qty');
    const qty = parseInt(input ? input.value : 1) || 1;
    const subtotalEl = document.getElementById('cust-modal-subtotal');
    if (subtotalEl) {
        subtotalEl.textContent = formatRupiah(currentCustomerDetailProduct.harga * qty);
    }
}

function submitCustDetailAddToCart() {
    if (!currentCustomerDetailProduct) return;
    const input = document.getElementById('cust-modal-qty');
    const qty = parseInt(input ? input.value : 1) || 1;

    addCustomerItemToCart(currentCustomerDetailProduct, qty);
    closeCustomerProductDetail();
}

function quickCustomerAddToCart(kode) {
    const product = products.find(p => p.kode === kode);
    if (!product) return;
    addCustomerItemToCart(product, 1);
}

function addCustomerItemToCart(product, qty) {
    if (product.stok <= 0) {
        showToast(`Produk '${product.nama}' sedang habis.`, 'warning');
        return;
    }

    const existing = customerCart.find(i => i.kode === product.kode);
    const currentQtyInCart = existing ? existing.qty : 0;

    if (currentQtyInCart + qty > product.stok) {
        showToast(`Jumlah di keranjang melebihi stok yang tersedia (${product.stok}).`, 'warning');
        return;
    }

    if (existing) {
        existing.qty += qty;
        existing.subtotal = existing.qty * existing.harga;
    } else {
        const itemImg = (product.gambar && product.gambar !== DEFAULT_IMAGE && !product.gambar.includes('1588964895597')) 
            ? product.gambar 
            : getProductAutoImage(product);
        customerCart.push({
            kode: product.kode,
            nama: product.nama,
            harga: product.harga,
            gambar: itemImg,
            qty: qty,
            subtotal: product.harga * qty
        });
    }

    saveCustomerCart();
    showToast(`✓ '${product.nama}' (${qty} item) ditambahkan ke keranjang!`, 'success');
}

function openCustomerCartModal() {
    const modal = document.getElementById('customer-cart-modal');
    if (!modal) return;
    renderCustomerCart();
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeCustomerCartModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('customer-cart-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function renderCustomerCart() {
    const container = document.getElementById('customer-cart-items-container');
    const totalEl = document.getElementById('customer-cart-total-price');
    const btnCheckout = document.getElementById('btn-proceed-checkout');
    if (!container) return;

    const grandTotal = customerCart.reduce((sum, i) => sum + i.subtotal, 0);
    if (totalEl) totalEl.textContent = formatRupiah(grandTotal);

    if (btnCheckout) {
        btnCheckout.disabled = customerCart.length === 0;
    }

    if (customerCart.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem 1rem; color:#888;">
                <i class="fa-solid fa-cart-shopping" style="font-size:3rem; margin-bottom:1rem; opacity:0.3;"></i>
                <p>Keranjang belanja Anda masih kosong.</p>
                <button type="button" class="btn btn-outline-secondary btn-sm" onclick="closeCustomerCartModal()">Mulai Belanja</button>
            </div>
        `;
        return;
    }

    container.innerHTML = customerCart.map(item => {
        const cartImg = (item.gambar && item.gambar !== DEFAULT_IMAGE && !item.gambar.includes('1588964895597'))
            ? item.gambar
            : getProductAutoImage(item);
        return `
            <div class="customer-cart-item-row">
                <img src="${escapeHtml(cartImg)}" alt="${escapeHtml(item.nama)}" class="cart-item-thumb" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}'">
                <div class="cart-item-info">
                    <strong>${escapeHtml(item.nama)}</strong>
                    <div style="color:var(--primary-color); font-size:0.9rem;">${formatRupiah(item.harga)}</div>
                </div>
                <div class="qty-stepper">
                    <button type="button" onclick="changeCustomerCartQty('${item.kode}', -1)"><i class="fa-solid fa-minus"></i></button>
                    <input type="text" value="${item.qty}" readonly>
                    <button type="button" onclick="changeCustomerCartQty('${item.kode}', 1)"><i class="fa-solid fa-plus"></i></button>
                </div>
                <div class="cart-item-subtotal">
                    <strong>${formatRupiah(item.subtotal)}</strong>
                </div>
                <button type="button" class="btn-remove-item" onclick="removeCustomerCartItem('${item.kode}')" title="Hapus Barang">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
    }).join('');
}

function changeCustomerCartQty(kode, delta) {
    const item = customerCart.find(i => i.kode === kode);
    if (!item) return;

    const product = products.find(p => p.kode === kode);
    const newQty = item.qty + delta;

    if (newQty <= 0) {
        removeCustomerCartItem(kode);
        return;
    }

    if (product && newQty > product.stok) {
        showToast(`Stok maksimal barang '${item.nama}' hanya ${product.stok}.`, 'warning');
        return;
    }

    item.qty = newQty;
    item.subtotal = item.qty * item.harga;
    saveCustomerCart();
    renderCustomerCart();
}

function removeCustomerCartItem(kode) {
    customerCart = customerCart.filter(i => i.kode !== kode);
    saveCustomerCart();
    renderCustomerCart();
    showToast('Barang dihapus dari keranjang.', 'info');
}

function clearCustomerCart() {
    if (customerCart.length === 0) return;
    if (!confirm('Kosongkan semua barang dari keranjang belanja?')) return;
    customerCart = [];
    saveCustomerCart();
    renderCustomerCart();
    showToast('Keranjang belanja dikosongkan.', 'info');
}

/* ==========================================================================
   15. CHECKOUT PESANAN PELANGGAN
   ========================================================================== */

function openCustomerCheckoutModal() {
    if (customerCart.length === 0) {
        showToast('Keranjang belanja masih kosong!', 'warning');
        return;
    }

    closeCustomerCartModal();

    const modal = document.getElementById('customer-checkout-modal');
    if (!modal) return;

    // Isi preview barang
    const previewContainer = document.getElementById('checkout-items-preview');
    if (previewContainer) {
        previewContainer.innerHTML = customerCart.map(item => `
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.9rem;">
                <span>${escapeHtml(item.nama)} &times; ${item.qty}</span>
                <strong>${formatRupiah(item.subtotal)}</strong>
            </div>
        `).join('');
    }

    const grandTotal = customerCart.reduce((sum, i) => sum + i.subtotal, 0);
    const totalEl = document.getElementById('checkout-total-amount');
    if (totalEl) totalEl.textContent = formatRupiah(grandTotal);

    // Auto-fill profil pemesan
    const session = getSession();
    const nameInput = document.getElementById('checkout-name');
    const phoneInput = document.getElementById('checkout-phone');
    const addressInput = document.getElementById('checkout-address');

    if (session) {
        if (nameInput) nameInput.value = session.fullName || session.username;
        if (phoneInput && session.phone) phoneInput.value = session.phone;
        if (addressInput && session.address) addressInput.value = session.address;
    }

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeCustomerCheckoutModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('customer-checkout-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function toggleDeliveryAddress(isDelivery) {
    const addrGroup = document.getElementById('checkout-address-group');
    const addrInput = document.getElementById('checkout-address');
    if (addrGroup) {
        addrGroup.style.display = isDelivery ? 'block' : 'none';
    }
    if (addrInput) {
        addrInput.required = isDelivery;
    }
}

function handleCustomerCheckoutSubmit(e) {
    e.preventDefault();

    if (customerCart.length === 0) {
        showToast('Keranjang belanja kosong!', 'warning');
        return;
    }

    const name = document.getElementById('checkout-name').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const deliveryRadio = document.querySelector('input[name="checkout-delivery-type"]:checked');
    const deliveryType = deliveryRadio ? deliveryRadio.value : 'pickup';
    const address = document.getElementById('checkout-address') ? document.getElementById('checkout-address').value.trim() : '';
    const notes = document.getElementById('checkout-notes') ? document.getElementById('checkout-notes').value.trim() : '';
    const paymentRadio = document.querySelector('input[name="checkout-payment-method"]:checked');
    const paymentMethod = paymentRadio ? paymentRadio.value : 'tunai';

    if (!name || !phone) {
        showToast('Nama dan nomor WhatsApp wajib diisi.', 'warning');
        return;
    }
    if (deliveryType === 'delivery' && !address) {
        showToast('Alamat pengantaran wajib diisi untuk opsi antar!', 'warning');
        return;
    }

    // Cek ketersediaan stok produk
    for (const item of customerCart) {
        const p = products.find(prod => prod.kode === item.kode);
        if (!p || p.stok < item.qty) {
            showToast(`Maaf, stok produk '${item.nama}' tidak mencukupi (sisa: ${p ? p.stok : 0}).`, 'danger');
            return;
        }
    }

    // Kurangi stok produk secara nyata
    customerCart.forEach(item => {
        const p = products.find(prod => prod.kode === item.kode);
        if (p) {
            p.stok -= item.qty;
            if (p.stok < 0) p.stok = 0;
        }
    });
    saveProductsToStorage();

    const session = getSession();
    const now = new Date();
    const orderId = 'ORD-' + Date.now().toString().slice(-6);
    const grandTotal = customerCart.reduce((sum, i) => sum + i.subtotal, 0);

    let paymentMethodLabel = 'Tunai';
    if (paymentMethod === 'qris') paymentMethodLabel = 'QRIS';
    else if (paymentMethod === 'transfer') paymentMethodLabel = 'Transfer Bank';
    else if (paymentMethod === 'ewallet') paymentMethodLabel = 'E-Wallet';

    const newOrder = {
        id: orderId,
        customerUsername: session ? session.username : 'tamu',
        customerName: name,
        customerPhone: phone,
        deliveryType: deliveryType, // 'pickup' | 'delivery'
        address: address,
        notes: notes,
        paymentMethod: paymentMethodLabel,
        paymentStatus: 'Belum Dibayar',
        status: 'Menunggu Konfirmasi',
        items: [...customerCart],
        total: grandTotal,
        createdAt: now.toISOString(),
        timestamp: formatDate(now),
        storeNote: ''
    };

    orders.unshift(newOrder);
    saveOrdersToStorage();

    // Reset keranjang belanja
    customerCart = [];
    saveCustomerCart();

    closeCustomerCheckoutModal();
    logActivity('pesanan_baru', `Pesanan online #${orderId} dibuat oleh pelanggan '${name}' (Total: ${formatRupiah(grandTotal)})`, orderId);

    showToast(`Pesanan #${orderId} berhasil dibuat! Kami sedang menyiapkan pesanan Anda.`, 'success');

    // Arahkan ke tab riwayat pesanan pelanggan
    switchTab('pelanggan-orders');
}

/* ==========================================================================
   16. MANAJEMEN PESANAN ONLINE (PELANGGAN, KASIR & ADMIN)
   ========================================================================== */

let orders = [];
let currentAdminOrderFilter = 'all';
let currentActiveOrder = null;

function initOrders() {
    try {
        const stored = localStorage.getItem(STORAGE_ORDERS_KEY);
        if (stored) {
            orders = JSON.parse(stored);
        } else {
            // Seed sampel pesanan online untuk demo
            orders = [
                {
                    id: 'ORD-101001',
                    customerUsername: 'pelanggan',
                    customerName: 'Budi Santoso',
                    customerPhone: '081234567892',
                    deliveryType: 'pickup',
                    address: '',
                    notes: 'Tolong siapkan rapi ya',
                    paymentMethod: 'Tunai',
                    paymentStatus: 'Belum Dibayar',
                    status: 'Menunggu Konfirmasi',
                    items: [
                        { kode: 'BRG001', nama: 'Beras Premium 5kg', harga: 65000, qty: 1, subtotal: 65000 },
                        { kode: 'BRG004', nama: 'Mie Instan Goreng', harga: 3000, qty: 5, subtotal: 15000 }
                    ],
                    total: 80000,
                    createdAt: new Date().toISOString(),
                    timestamp: formatDate(new Date()),
                    storeNote: ''
                }
            ];
            saveOrdersToStorage();
        }
    } catch (e) {
        orders = [];
    }
    updateAdminOrdersBadge();
}

function saveOrdersToStorage() {
    try {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
        console.warn('Gagal menyimpan pesanan:', e);
    }
    if (typeof db !== 'undefined' && db) {
        orders.slice(0, 50).forEach(o => {
            db.collection('orders').doc(o.id).set(o).catch(() => {});
        });
    }
    updateAdminOrdersBadge();
}

function updateAdminOrdersBadge() {
    const pendingCount = orders.filter(o => o.status === 'Menunggu Konfirmasi').length;
    const badgeAdmin = document.getElementById('nav-orders-count');
    const badgeKasir = document.getElementById('nav-orders-count-kasir');
    const alertBanner = document.getElementById('alert-pesanan-baru');
    const alertCount = document.getElementById('alert-pesanan-count');

    [badgeAdmin, badgeKasir].forEach(badge => {
        if (badge) {
            badge.textContent = pendingCount;
            badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
        }
    });

    if (alertBanner && alertCount) {
        alertCount.textContent = pendingCount;
        alertBanner.style.display = pendingCount > 0 ? 'flex' : 'none';
    }

    // Badge untuk pesanan pelanggan
    const session = getSession();
    if (session && session.role === 'Pelanggan') {
        const myActiveOrders = orders.filter(o => o.customerUsername === session.username && o.status !== 'Selesai' && o.status !== 'Dibatalkan').length;
        const custBadge = document.getElementById('nav-cust-orders-count');
        if (custBadge) {
            custBadge.textContent = myActiveOrders;
            custBadge.style.display = myActiveOrders > 0 ? 'inline-block' : 'none';
        }
    }
}

// 16a. Render Pesanan Pelanggan (Riwayat Saya)
function renderCustomerOrders() {
    const container = document.getElementById('customer-orders-container') || document.getElementById('customer-orders-list');
    if (!container) return;

    const session = getSession();
    const username = session ? session.username : '';

    const myOrders = orders.filter(o => o.customerUsername === username);

    if (myOrders.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem 1rem; color:#888;">
                <i class="fa-solid fa-receipt" style="font-size:3rem; margin-bottom:1rem; opacity:0.3;"></i>
                <p>Anda belum memiliki riwayat pesanan.</p>
                <button type="button" class="btn btn-primary btn-sm" onclick="switchTab('pelanggan-store')">Mulai Belanja Sekarang</button>
            </div>
        `;
        return;
    }

    container.innerHTML = myOrders.map(o => {
        const statusBadge = getOrderStatusBadge(o.status);
        const deliveryText = o.deliveryType === 'delivery' ? '🛵 Antar ke Alamat' : '🏬 Ambil di Toko';

        return `
            <div class="order-card">
                <div class="order-card-header">
                    <div>
                        <strong>#${escapeHtml(o.id)}</strong>
                        <div style="font-size:0.85rem; color:#666;">${escapeHtml(o.timestamp)}</div>
                    </div>
                    <div>${statusBadge}</div>
                </div>
                <div class="order-card-body">
                    <div style="margin-bottom:0.5rem; color:#555;">
                        <span><i class="fa-solid fa-truck"></i> ${deliveryText}</span> | 
                        <span><i class="fa-solid fa-wallet"></i> ${escapeHtml(o.paymentMethod)}</span>
                    </div>
                    <div class="order-items-summary" style="font-size:0.9rem; margin-bottom:0.75rem;">
                        ${o.items.map(i => `<div>&bull; ${escapeHtml(i.nama)} &times; ${i.qty}</div>`).join('')}
                    </div>
                    ${o.storeNote ? `<div style="background:#fef3c7; color:#92400e; padding:6px 10px; border-radius:6px; font-size:0.85rem; margin-bottom:0.5rem;"><strong>Catatan Toko:</strong> ${escapeHtml(o.storeNote)}</div>` : ''}
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #e0e0e0; padding-top:0.75rem;">
                        <div>Total: <strong style="color:var(--primary-color); font-size:1.1rem;">${formatRupiah(o.total)}</strong></div>
                        <button type="button" class="btn btn-outline-secondary btn-sm" onclick="openCustomerOrderDetail('${o.id}')">
                            <i class="fa-solid fa-eye"></i> Detail Pesanan
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function getOrderStatusBadge(status) {
    if (status === 'Menunggu Konfirmasi') {
        return `<span class="badge" style="background:#fef3c7; color:#b45309;"><i class="fa-solid fa-clock"></i> Menunggu Konfirmasi</span>`;
    } else if (status === 'Diproses') {
        return `<span class="badge" style="background:#dbeafe; color:#1d4ed8;"><i class="fa-solid fa-spinner fa-spin"></i> Diproses</span>`;
    } else if (status === 'Siap Diambil') {
        return `<span class="badge" style="background:#f3e8ff; color:#7e22ce;"><i class="fa-solid fa-box"></i> Siap Diambil / Diantar</span>`;
    } else if (status === 'Selesai') {
        return `<span class="badge" style="background:#dcfce7; color:#15803d;"><i class="fa-solid fa-circle-check"></i> Selesai</span>`;
    } else if (status === 'Dibatalkan') {
        return `<span class="badge" style="background:#fee2e2; color:#b91c1c;"><i class="fa-solid fa-circle-xmark"></i> Dibatalkan</span>`;
    }
    return `<span class="badge badge-stock-ok">${escapeHtml(status)}</span>`;
}

function openCustomerOrderDetail(orderId) {
    const o = orders.find(item => item.id === orderId);
    if (!o) return;

    const modal = document.getElementById('customer-order-detail-modal');
    const body = document.getElementById('customer-order-detail-body');
    if (!modal || !body) return;

    body.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding-bottom:0.75rem; border-bottom:1px solid #e0e0e0;">
            <div>
                <h4 style="margin:0;">No. Pesanan: #${escapeHtml(o.id)}</h4>
                <small style="color:#666;">Waktu Pesan: ${escapeHtml(o.timestamp)}</small>
            </div>
            <div>${getOrderStatusBadge(o.status)}</div>
        </div>

        <div style="margin-bottom:1rem;">
            <h5><i class="fa-solid fa-user"></i> Data Pemesan</h5>
            <div style="font-size:0.9rem; line-height:1.6;">
                <div><strong>Nama:</strong> ${escapeHtml(o.customerName)}</div>
                <div><strong>WhatsApp:</strong> ${escapeHtml(o.customerPhone)}</div>
                <div><strong>Opsi:</strong> ${o.deliveryType === 'delivery' ? 'Antar ke Alamat' : 'Ambil di Toko'}</div>
                ${o.address ? `<div><strong>Alamat:</strong> ${escapeHtml(o.address)}</div>` : ''}
                ${o.notes ? `<div><strong>Catatan:</strong> ${escapeHtml(o.notes)}</div>` : ''}
            </div>
        </div>

        <div style="margin-bottom:1rem;">
            <h5><i class="fa-solid fa-box"></i> Rincian Barang</h5>
            <div style="border:1px solid #e0e0e0; border-radius:8px; overflow:hidden;">
                <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
                    <thead>
                        <tr style="background:#f8fafc; border-bottom:1px solid #e0e0e0;">
                            <th style="padding:8px 12px; text-align:left;">Barang</th>
                            <th style="padding:8px 12px; text-align:center;">Jumlah</th>
                            <th style="padding:8px 12px; text-align:right;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${o.items.map(item => `
                            <tr style="border-bottom:1px solid #f1f5f9;">
                                <td style="padding:8px 12px;">${escapeHtml(item.nama)}</td>
                                <td style="padding:8px 12px; text-align:center;">${item.qty}</td>
                                <td style="padding:8px 12px; text-align:right;">${formatRupiah(item.subtotal)}</td>
                            </tr>
                        `).join('')}
                        <tr style="background:#f8fafc; font-weight:bold;">
                            <td colspan="2" style="padding:10px 12px; text-align:right;">Total Pembayaran:</td>
                            <td style="padding:10px 12px; text-align:right; color:var(--primary-color);">${formatRupiah(o.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div style="background:#f1f5f9; padding:12px; border-radius:8px; font-size:0.9rem;">
            <div><strong>Metode Pembayaran:</strong> ${escapeHtml(o.paymentMethod)} (${escapeHtml(o.paymentStatus || 'Belum Dibayar')})</div>
            ${o.storeNote ? `<div style="margin-top:6px; color:#b45309;"><strong>Pesan Toko:</strong> ${escapeHtml(o.storeNote)}</div>` : ''}
        </div>
    `;

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeCustomerOrderDetail(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('customer-order-detail-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// 16b. Render Pesanan Online untuk Admin & Kasir
function renderAdminOrders() {
    const container = document.getElementById('admin-orders-container') || document.getElementById('admin-orders-list');
    if (!container) return;

    let filtered = orders;
    if (currentAdminOrderFilter !== 'all') {
        filtered = orders.filter(o => o.status === currentAdminOrderFilter);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:3rem 1rem; color:#888;">
                <i class="fa-solid fa-bell-slash" style="font-size:3rem; margin-bottom:1rem; opacity:0.3;"></i>
                <p>Tidak ada pesanan online dalam status ini.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(o => {
        const statusBadge = getOrderStatusBadge(o.status);
        const deliveryText = o.deliveryType === 'delivery' ? '🛵 Antar' : '🏬 Ambil';

        return `
            <div class="order-card">
                <div class="order-card-header">
                    <div>
                        <strong>#${escapeHtml(o.id)}</strong> - <span style="font-weight:600;">${escapeHtml(o.customerName)}</span>
                        <div style="font-size:0.85rem; color:#666;">
                            <span>📱 ${escapeHtml(o.customerPhone)}</span> | 
                            <span>${escapeHtml(o.timestamp)}</span>
                        </div>
                    </div>
                    <div>${statusBadge}</div>
                </div>
                <div class="order-card-body">
                    <div style="display:flex; gap:1rem; margin-bottom:0.5rem; font-size:0.9rem; color:#555;">
                        <span><strong>Pengiriman:</strong> ${deliveryText}</span>
                        <span><strong>Bayar:</strong> ${escapeHtml(o.paymentMethod)}</span>
                    </div>
                    ${o.address ? `<div style="font-size:0.85rem; color:#555; margin-bottom:0.5rem;"><strong>Alamat:</strong> ${escapeHtml(o.address)}</div>` : ''}
                    <div style="background:#f8fafc; padding:8px 12px; border-radius:6px; font-size:0.85rem; margin-bottom:0.75rem;">
                        <strong>Pesanan (${o.items.length} jenis item):</strong>
                        ${o.items.map(i => `<div style="margin-top:2px;">&bull; ${escapeHtml(i.nama)} &times; ${i.qty} (${formatRupiah(i.subtotal)})</div>`).join('')}
                    </div>
                    ${o.notes ? `<div style="font-size:0.85rem; color:#666; margin-bottom:0.5rem;"><em>Catatan Pembeli: "${escapeHtml(o.notes)}"</em></div>` : ''}
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #e0e0e0; padding-top:0.75rem;">
                        <div>Total: <strong style="color:var(--primary-color); font-size:1.15rem;">${formatRupiah(o.total)}</strong></div>
                        <button type="button" class="btn btn-primary btn-sm" onclick="openOrderStatusModal('${o.id}')">
                            <i class="fa-solid fa-clipboard-check"></i> Kelola Status
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterAdminOrders(status, btn) {
    currentAdminOrderFilter = status;
    if (btn) {
        const parent = btn.parentElement;
        if (parent) {
            parent.querySelectorAll('.btn-subtab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    }
    renderAdminOrders();
}

function openOrderStatusModal(orderId) {
    if (!requireRole(['Administrator', 'Kasir'], 'mengubah status pesanan')) return;
    const o = orders.find(item => item.id === orderId);
    if (!o) return;

    currentActiveOrder = o;

    const modal = document.getElementById('order-status-modal');
    const content = document.getElementById('order-status-modal-content');
    const select = document.getElementById('update-order-status-select');
    const noteInput = document.getElementById('update-order-note');

    if (!modal || !content) return;

    if (select) select.value = o.status;
    if (noteInput) noteInput.value = o.storeNote || '';

    content.innerHTML = `
        <div style="background:#f8fafc; padding:12px; border-radius:8px; margin-bottom:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4>Pesanan #${escapeHtml(o.id)}</h4>
                <div>${getOrderStatusBadge(o.status)}</div>
            </div>
            <div style="font-size:0.9rem; line-height:1.6; margin-top:0.5rem;">
                <div><strong>Pelanggan:</strong> ${escapeHtml(o.customerName)} (${escapeHtml(o.customerPhone)})</div>
                <div><strong>Opsi:</strong> ${o.deliveryType === 'delivery' ? '🛵 Antar ke Alamat' : '🏬 Ambil di Toko'}</div>
                ${o.address ? `<div><strong>Alamat:</strong> ${escapeHtml(o.address)}</div>` : ''}
                <div><strong>Total:</strong> <strong style="color:var(--primary-color);">${formatRupiah(o.total)}</strong> (${escapeHtml(o.paymentMethod)})</div>
            </div>
        </div>
        <div>
            <strong>Daftar Barang:</strong>
            <ul style="padding-left:1.25rem; font-size:0.9rem; margin-top:4px;">
                ${o.items.map(i => `<li>${escapeHtml(i.nama)} &times; ${i.qty} = ${formatRupiah(i.subtotal)}</li>`).join('')}
            </ul>
        </div>
    `;

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('active'));
}

function closeOrderStatusModal(e) {
    if (e && e.target !== e.currentTarget) return;
    const modal = document.getElementById('order-status-modal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

function submitUpdateOrderStatus() {
    if (!currentActiveOrder) return;
    const select = document.getElementById('update-order-status-select');
    const noteInput = document.getElementById('update-order-note');
    if (!select) return;

    const oldStatus = currentActiveOrder.status;
    const newStatus = select.value;
    const note = noteInput ? noteInput.value.trim() : '';

    currentActiveOrder.status = newStatus;
    currentActiveOrder.storeNote = note;

    // Jika dibatalkan, kembalikan stok barang ke sistem
    if (newStatus === 'Dibatalkan' && oldStatus !== 'Dibatalkan') {
        currentActiveOrder.items.forEach(item => {
            const p = products.find(prod => prod.kode === item.kode);
            if (p) p.stok += item.qty;
        });
        saveProductsToStorage();
        renderProducts();
        renderProductsKasir();
        populateProductDropdown();
        renderDashboardStokMenipis();
    }

    saveOrdersToStorage();
    closeOrderStatusModal();
    renderAdminOrders();
    updateAdminOrdersBadge();

    const session = getSession();
    showToast(`Status pesanan #${currentActiveOrder.id} diubah ke '${newStatus}'.`, 'success');
    logActivity('update_pesanan', `Status pesanan #${currentActiveOrder.id} diubah menjadi '${newStatus}' oleh ${session ? session.username : 'Petugas'}.`, currentActiveOrder.id);
}

function printOrderSlip() {
    if (!currentActiveOrder) return;
    const o = currentActiveOrder;

    const printWin = window.open('', '_blank', 'width=400,height=600');
    if (!printWin) {
        showToast('Popup cetak diblokir browser. Izinkan popup untuk mencetak.', 'warning');
        return;
    }

    printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Struk Pesanan #${o.id}</title>
            <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 280px; }
                .text-center { text-align: center; }
                .divider { border-top: 1px dashed #000; margin: 8px 0; }
                table { width: 100%; border-collapse: collapse; }
                td { vertical-align: top; }
                @media print { body { width: 100%; } }
            </style>
        </head>
        <body>
            <div class="text-center">
                <h3 style="margin:0;">DELSI SHOP</h3>
                <small>Pesanan Online Warung Digital</small>
            </div>
            <div class="divider"></div>
            <div>No. Order : #${o.id}</div>
            <div>Waktu     : ${o.timestamp}</div>
            <div>Pemesan   : ${escapeHtml(o.customerName)}</div>
            <div>No. WA    : ${escapeHtml(o.customerPhone)}</div>
            <div>Opsi      : ${o.deliveryType === 'delivery' ? 'Antar ke Alamat' : 'Ambil Sendiri'}</div>
            ${o.address ? `<div>Alamat    : ${escapeHtml(o.address)}</div>` : ''}
            <div>Status    : ${o.status}</div>
            <div class="divider"></div>
            <table>
                ${o.items.map(i => `
                    <tr>
                        <td colspan="2">${escapeHtml(i.nama)}</td>
                    </tr>
                    <tr>
                        <td style="color:#555;">${i.qty} &times; ${formatRupiah(i.harga)}</td>
                        <td style="text-align:right;">${formatRupiah(i.subtotal)}</td>
                    </tr>
                `).join('')}
            </table>
            <div class="divider"></div>
            <table>
                <tr style="font-weight:bold;">
                    <td>TOTAL:</td>
                    <td style="text-align:right;">${formatRupiah(o.total)}</td>
                </tr>
                <tr>
                    <td>Pembayaran:</td>
                    <td style="text-align:right;">${o.paymentMethod}</td>
                </tr>
            </table>
            ${o.notes ? `<div class="divider"></div><div>Catatan: ${escapeHtml(o.notes)}</div>` : ''}
            <div class="divider"></div>
            <div class="text-center">
                <p>Terima Kasih Atas Pesanan Anda!</p>
            </div>
            <script>
                setTimeout(() => { window.print(); window.close(); }, 500);
            <\/script>
        </body>
        </html>
    `);
    printWin.document.close();
}

/* ==========================================================================
   17. PROFIL PELANGGAN (VIEW & UPDATE PROFIL / PASSWORD)
   ========================================================================== */

function renderCustomerProfile() {
    const session = getSession();
    if (!session) return;

    const users = getUsers();
    const user = users.find(u => u.username === session.username) || session;

    const nameDisplay = document.getElementById('cust-profile-name');
    const userDisplay = document.getElementById('cust-profile-username');
    const roleDisplay = document.getElementById('cust-profile-role');
    const totalOrdersEl = document.getElementById('cust-profile-total-orders');
    const completedOrdersEl = document.getElementById('cust-profile-completed-orders');

    if (nameDisplay) nameDisplay.textContent = user.fullName || user.username;
    if (userDisplay) userDisplay.textContent = '@' + user.username;
    if (roleDisplay) roleDisplay.textContent = user.role || 'Pelanggan';

    const myOrders = orders.filter(o => o.customerUsername === user.username);
    const completed = myOrders.filter(o => o.status === 'Selesai');

    if (totalOrdersEl) totalOrdersEl.textContent = `${myOrders.length} Pesanan`;
    if (completedOrdersEl) completedOrdersEl.textContent = `${completed.length} Selesai`;

    const fullnameInput = document.getElementById('cust-fullname-input');
    const phoneInput = document.getElementById('cust-phone-input');
    const addressInput = document.getElementById('cust-address-input');

    if (fullnameInput) fullnameInput.value = user.fullName || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (addressInput) addressInput.value = user.address || '';
}

function handleSaveCustomerProfile(e) {
    e.preventDefault();
    const session = getSession();
    if (!session) return;

    const fullname = document.getElementById('cust-fullname-input').value.trim();
    const phone = document.getElementById('cust-phone-input').value.trim();
    const address = document.getElementById('cust-address-input').value.trim();

    const users = getUsers();
    const u = users.find(item => item.username === session.username);
    if (!u) return;

    u.fullName = fullname || u.username;
    u.phone = phone;
    u.address = address;

    if (saveUsers(users)) {
        session.fullName = u.fullName;
        session.phone = u.phone;
        session.address = u.address;
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));

        applySessionToHeader(session);
        renderCustomerProfile();
        showToast('Profil Anda berhasil diperbarui!', 'success');
        logActivity('update_profil', `Pelanggan '${session.username}' memperbarui data profil.`, session.username);

        if (typeof db !== 'undefined' && db) {
            db.collection('users').doc(session.username).set(u).catch(() => {});
        }
    }
}

function handleCustomerChangePassword(e) {
    e.preventDefault();
    const session = getSession();
    if (!session) return;

    const oldPass = document.getElementById('cust-old-password').value;
    const newPass = document.getElementById('cust-new-password').value;
    const confirmPass = document.getElementById('cust-confirm-password').value;

    if (newPass.length < 4) {
        showToast('Password baru minimal 4 karakter!', 'warning');
        return;
    }
    if (newPass !== confirmPass) {
        showToast('Konfirmasi password baru tidak cocok!', 'danger');
        return;
    }

    const users = getUsers();
    const u = users.find(item => item.username === session.username);
    if (!u) return;

    if (u.password !== simpleHash(oldPass)) {
        showToast('Password lama tidak benar!', 'danger');
        return;
    }

    u.password = simpleHash(newPass);
    if (saveUsers(users)) {
        document.getElementById('form-customer-password').reset();
        showToast('Password akun Anda berhasil diganti!', 'success');
        logActivity('ubah_password', `Pelanggan '${session.username}' mengubah password.`, session.username);
    }
}

/* ==========================================================================
   18. DASHBOARD STATISTIK UTAMA (ADMIN DASHBOARD)
   ========================================================================== */

function renderDashboardStats() {
    const statOmzet = document.getElementById('dash-omzet-total');
    const statLaba = document.getElementById('dash-laba-total');
    const statTrx = document.getElementById('dash-transaksi-total');
    const statProduk = document.getElementById('dash-produk-total');
    const statPelanggan = document.getElementById('dash-pelanggan-total');

    // 1. Total Omzet
    const totalOmzet = transactions.reduce((sum, t) => sum + (t.total || 0), 0);
    if (statOmzet) statOmzet.textContent = formatRupiah(totalOmzet);

    // 2. Total Laba
    const totalModal = transactions.reduce((sum, t) => {
        const m = (t.items || []).reduce((s, item) => {
            const p = products.find(prod => prod.kode === item.kode);
            return s + (p ? (p.modal || 0) * item.jumlah : 0);
        }, 0);
        return sum + m;
    }, 0);
    const totalLaba = totalOmzet - totalModal;
    if (statLaba) statLaba.textContent = formatRupiah(totalLaba);

    // 3. Total Transaksi
    if (statTrx) statTrx.textContent = `${transactions.length} Transaksi`;

    // 4. Total Produk
    if (statProduk) statProduk.textContent = `${products.length} Produk`;

    // 5. Total Pelanggan
    const users = getUsers();
    const totalCust = users.filter(u => (u.role || 'Kasir') === 'Pelanggan').length;
    if (statPelanggan) statPelanggan.textContent = `${totalCust} Pengguna`;
}

