const OWNER_PHONE = "966530382226"; // رقم عميل (ابو محمد)

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyHzzmvY9J9lhoAq2kjfjVu8E73B6Y2Q6zs",
    authDomain: "abu-mohammed-store.firebaseapp.com",
    projectId: "abu-mohammed-store",
    databaseURL: "https://abu-mohammed-store-default-rtdb.firebaseio.com/",
    storageBucket: "abu-mohammed-store.firebasestorage.app",
    messagingSenderId: "136977820798",
    appId: "1:136977820798:web:288e479ad066bc85d4bc2f",
    measurementId: "G-ZN33MBT4RD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Test Connection & UI Indicator
const statusDot = document.createElement('div');
statusDot.id = 'firebase-status';
statusDot.style = "position:fixed; top:10px; left:10px; width:12px; height:12px; border-radius:50%; background:gray; z-index:9999; border:2px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);";
document.body.appendChild(statusDot);

db.ref(".info/connected").on("value", (snap) => {
    if (snap.val() === true) {
        console.log("Connected to Firebase Database! ✅");
        statusDot.style.background = "#22c55e"; // Green
        statusDot.title = "متصل بالسحاب ✅";
    } else {
        console.log("Disconnected from Firebase Database ❌");
        statusDot.style.background = "#ef4444"; // Red
        statusDot.title = "غير متصل ❌";
    }
});

const defaultProducts = [
    { id: 1, name: "حري لباني", category: "hari", price: 1350, weight: "10-12 كجم", age: "3-4 شهور", inStock: true, image: "images/1.jpg", backup: "https://images.unsplash.com/photo-1484557985045-6f5e98487c9d?q=80&w=400&fit=crop" },
    { id: 2, name: "حري جذع", category: "hari", price: 1650, weight: "18-20 كجم", age: "6 شهور", inStock: true, image: "images/2.jpg", backup: "https://images.unsplash.com/photo-1484557985045-6f5e98487c9d?q=80&w=400&fit=crop" },
    { id: 3, name: "تيس لباني", category: "tais", price: 1100, weight: "8-10 كجم", age: "3 شهور", inStock: true, image: "images/3.jpg", backup: "https://source.unsplash.com/400x300/?goat" },
    { id: 4, name: "تيس جذع", category: "tais", price: 1300, weight: "14-16 كجم", age: "5 شهور", inStock: true, image: "images/4.jpg", backup: "https://source.unsplash.com/400x300/?goat" },
    { id: 5, name: "نعيمي لباني", category: "naimi", price: 1450, weight: "11-13 كجم", age: "3-4 شهور", inStock: true, image: "images/5.jpg", backup: "https://source.unsplash.com/400x300/?sheep" },
    { id: 6, name: "نعيمي هرفي", category: "naimi", price: 1750, weight: "16-18 كجم", age: "5-6 شهور", inStock: true, image: "images/6.jpg", backup: "https://source.unsplash.com/400x300/?sheep" },
    { id: 7, name: "نجدي لباني", category: "najdi", price: 1550, weight: "12-14 كجم", age: "4 شهور", inStock: true, image: "images/4.jpg", backup: "https://source.unsplash.com/400x300/?black-sheep" },
    { id: 8, name: "نجدي هرفي", category: "najdi", price: 1950, weight: "18-22 كجم", age: "6 شهور", inStock: true, image: "images/8.jpg", backup: "https://source.unsplash.com/400x300/?black-sheep" }
];

let currentProducts = defaultProducts;

// --- Realtime Sync ---
function syncData() {
    // 1. Sync Products
    db.ref('products').on('value', (snapshot) => {
        console.log("Products Sync Received 📦");
        const data = snapshot.val();
        if (data) {
            currentProducts = Object.values(data);
            renderProducts(currentProducts);
            if (typeof updateDashboardStats === 'function') updateDashboardStats();
        } else {
            console.log("No products in DB, seeding defaults...");
            defaultProducts.forEach(p => db.ref('products/' + p.id).set(p));
        }
    }, (error) => {
        console.error("Firebase Sync Error (Products):", error);
    });

    // 2. Sync Reviews
    db.ref('reviews').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            currentReviews = Object.values(data);
            renderReviews();
        } else {
            defaultReviews.forEach(r => db.ref('reviews/' + r.id).set(r));
        }
    }, (error) => {
        console.error("Firebase Sync Error (Reviews):", error);
    });

    // 3. Sync Store Status
    db.ref('storeStatus').on('value', (snapshot) => {
        const status = snapshot.val();
        if (status !== null) {
            updateStoreUI(status);
        } else {
            db.ref('storeStatus').set('open');
        }
    });
}

function updateStoreUI(status) {
    const closedOverlay = document.getElementById('storeClosedOverlay');
    const toggle = document.getElementById('storeStatusToggle');
    const label = document.getElementById('storeStatusLabel');

    if (status === 'closed') {
        if (closedOverlay) closedOverlay.classList.remove('hidden');
        if (toggle) toggle.checked = false;
        if (label) {
            label.innerText = 'مغلق';
            label.style.color = '#ef4444';
        }
    } else {
        if (closedOverlay) closedOverlay.classList.add('hidden');
        if (toggle) toggle.checked = true;
        if (label) {
            label.innerText = 'مفتوح';
            label.style.color = '#059669';
        }
    }
}

function toggleStoreStatus() {
    const toggle = document.getElementById('storeStatusToggle');
    const newStatus = toggle.checked ? 'open' : 'closed';

    if (!confirm(`هل أنت متأكد من تغيير حالة المتجر إلى [${newStatus === 'open' ? 'مفتوح' : 'مغلق'}]؟`)) {
        toggle.checked = !toggle.checked;
        return;
    }

    db.ref('storeStatus').set(newStatus);
}
window.toggleStoreStatus = toggleStoreStatus;

function switchTab(tabId) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.color = '#64748b';
        btn.style.borderBottom = 'none';
    });

    // Show selected
    document.getElementById(tabId).style.display = 'block';

    // Set active button style
    const activeBtn = document.querySelector(`button[onclick="switchTab('${tabId}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.color = 'var(--primary)';
        activeBtn.style.borderBottom = '3px solid var(--primary)';
    }
}
window.switchTab = switchTab;

const defaultReviews = [
    { id: 1, name: "أبو فهد", text: "ما شاء الله تبارك الله، اللحم طري وطعم بلدي حقيقي. التوصيل كان في الموعد والتغليف جداً نظيف.", stars: 5, tag: "عميل دائم" },
    { id: 2, name: "خالد السبيعي", text: "أفضل مكان تطلب منه وأنت مرتاح. الأمانة في اختيار الذبيحة واضحة، والتقطيع كان حسب طلبي بالضبط.", stars: 5, tag: "عميل جديد" },
    { id: 3, name: "محمد القحطاني", text: "شكراً أبو محمد على المصداقية. الحري اللباني جداً بطل ويواجه في المناسبات. أنصح بالتعامل معه.", stars: 5, tag: "عميل VIP" }
];

let currentReviews = JSON.parse(localStorage.getItem('appReviews')) || defaultReviews;

// --- Map Picker Variables ---
let map, marker;
const RIYADH_COORDS = [24.7136, 46.6753];
const productsGrid = document.getElementById('productsGrid');
let pendingWhatsappUrl = ""; // لتخزين رابط الواتساب قبل التحويل
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('bookingModal');
const closeModalBtn = document.querySelector('.close-modal');
const bookingForm = document.getElementById('bookingForm');
const successOverlay = document.getElementById('successOverlay');
const closeSuccessBtn = document.getElementById('closeSuccess');
const selectedProductTitle = document.getElementById('selectedProductTitle');
const productNameInput = document.getElementById('productName');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    syncData(); // Start Firebase Sync
    injectMTechAds();
    renderProducts(currentProducts);
    renderReviews();

    // Smooth scroll reveal for elements
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // FAQ Accordion Logic
    document.querySelectorAll('.faq-question').forEach(q => {
        q.addEventListener('click', () => {
            const item = q.parentElement;
            item.classList.toggle('active');
        });
    });

    // تشغيل قسم التسويق بالعمولة بأمان
    if (typeof affiliateProducts !== 'undefined' && typeof renderAffiliateItems === 'function') {
        renderAffiliateItems(affiliateProducts);
    }

    setupEventListeners();
});

// بيانات التسويق بالعمولة (أمازون، نون، إلخ)
const affiliateProducts = [
    {
        name: "شواية فحم احترافية قابلة للطي",
        store: "Amazon",
        price: "189 ر.س",
        link: "https://www.amazon.sa/s?k=grill&tag=mttech2026-21",
        image: "https://m.media-amazon.com/images/I/61jdf29TFmL._AC_SL1280_.jpg",
        backup: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600"
    },
    {
        name: "طقم سكاكين ذبح وسلخ فاخر",
        store: "Amazon",
        price: "145 ر.س",
        link: "https://www.amazon.sa/s?k=meat+knives&tag=mttech2026-21",
        image: "https://m.media-amazon.com/images/I/81mPtg8skyL._AC_SX522_.jpg",
        backup: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=600"
    },
    {
        name: "صندوق تبريد (Ice Box) لحفظ اللحوم",
        store: "Amazon",
        price: "120 ر.س",
        link: "https://www.amazon.sa/s?k=ice+box&tag=mttech2026-21",
        image: "https://m.media-amazon.com/images/I/91h+Gi1GdvL._AC_SL1500_.jpg",
        backup: "https://m.media-amazon.com/images/I/91h+Gi1GdvL._AC_SL1500_.jpg"
    }
];

// --- M-Tech Ads System (Private Ad Space) ---
function injectMTechAds() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const adContainer = document.createElement('div');
    adContainer.id = "mtech-ads-wrapper";
    adContainer.style.cssText = "margin: 10px auto; max-width: 1200px; padding: 0 20px; text-align: center;";

    // سبيس الإعلانات الخاصة (الرعاة) - تصميم m-ttech الاحترافي
    const privateAdHTML = `
        <div class="private-ad-slot" id="mtech-partner-space">
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-bottom: 8px;">
                <p style="font-size: 0.75rem; color: #9CA3AF; margin: 0;">رعاية وإعلانات خاصة - تواصل معنا:</p>
                <a href="mailto:rpm70111@gmail.com" style="color: #2C5F2D; font-size: 1.1rem; display: flex; align-items: center; transition: all 0.3s ease;" title="تواصل عبر البريد الإلكتروني">
                    <i class="fa-solid fa-envelope-open-text"></i>
                </a>
            </div>
            
            <div class="mtech-promo-banner" style="
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border-radius: 16px;
                padding: 25px;
                position: relative;
                overflow: hidden;
                box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.1);
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                text-align: right;
                direction: rtl;
            ">
                <!-- Decorative Elements -->
                <div style="position: absolute; top: -20px; left: -20px; width: 100px; height: 100px; background: rgba(28, 77, 33, 0.2); filter: blur(40px); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: -20px; right: -20px; width: 80px; height: 80px; background: rgba(59, 130, 246, 0.1); filter: blur(30px); border-radius: 50%;"></div>

                <div class="mtech-content" style="position: relative; z-index: 2;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <span style="background: #FFC857; color: #000; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800;">DEVELOPER</span>
                        <h4 style="color: #fff; margin: 0; font-size: 1.3rem; letter-spacing: 0.5px;">m-ttech <span style="font-weight: 400; font-size: 0.9rem; color: #94a3b8;">للحلول الرقمية</span></h4>
                    </div>
                    <p style="color: #cbd5e1; margin: 0; font-size: 0.95rem; line-height: 1.5;">نصمم ونطور هويتك الرقمية بأحدث التقنيات العالمية 🚀</p>
                </div>

                <div class="mtech-actions" style="position: relative; z-index: 2; display: flex; gap: 12px;">
                    <a href="mailto:rpm70111@gmail.com" style="
                        background: #3b82f6;
                        color: white;
                        padding: 10px 24px;
                        border-radius: 12px;
                        text-decoration: none;
                        font-weight: 700;
                        font-size: 0.9rem;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 15px rgba(59,130,246,0.5)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(59,130,246,0.4)';">
                        <i class="fa-solid fa-envelope"></i> اطلب مشروعك الآن
                    </a>
                </div>
            </div>
        </div>
    `;

    adContainer.innerHTML = privateAdHTML;
    heroSection.insertAdjacentElement('afterend', adContainer);
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmit);
    }

    const floatWA = document.getElementById('floatingWhatsapp');
    if (floatWA) floatWA.href = `https://wa.me/${OWNER_PHONE}`;

    // Product filtering is handled by onclick in HTML

    window.addEventListener("scroll", reveal);
    reveal();

    // مستمعات أحداث شاشة النجاح (Success Overlay)
    const continueToWhatsapp = document.getElementById('continueToWhatsapp');
    if (continueToWhatsapp) {
        continueToWhatsapp.addEventListener('click', () => {
            if (pendingWhatsappUrl) {
                window.location.href = pendingWhatsappUrl;
            }
        });
    }

    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', () => {
            if (successOverlay) successOverlay.classList.add('hidden');
        });
    }

    // Dashboard modal click outside
    const dashModal = document.getElementById('dashboardModal');
    if (dashModal) {
        dashModal.addEventListener('click', (e) => {
            if (e.target === dashModal) closeDashboardModal();
        });
    }
}

// Render Affiliate Items Function
function renderAffiliateItems(items) {
    const affiliateGrid = document.getElementById('affiliateGrid');
    if (!affiliateGrid) return;

    affiliateGrid.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('a');
        card.href = item.link;
        card.target = "_blank";
        card.classList.add('affiliate-card');
        card.innerHTML = `
            <div class="store-badge">${item.store}</div>
            <div class="affiliate-image-wrap">
                <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='${item.backup}';">
            </div>
            <div class="affiliate-info">
                <h4>${item.name}</h4>
                <div class="affiliate-price">${item.price}</div>
                <span class="buy-btn">تحقق من السعر <i class="fa-solid fa-external-link"></i></span>
            </div>
        `;
        affiliateGrid.appendChild(card);
    });
}
function renderProducts(items) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    items.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        if (!product.inStock) card.classList.add('out-of-stock');

        card.innerHTML = `
            <div class="product-image-wrapper" style="position: relative;">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="product-image"
                     onerror="this.onerror=null; this.src='${product.backup}';"
                     style="${!product.inStock ? 'filter: grayscale(1); opacity: 0.7;' : ''}"
                >
                ${!product.inStock ? `
                    <div style="position: absolute; top: 10px; right: 10px; background: #EF4444; color: white; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 0.8rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                        غير متوفر حالياً
                    </div>
                ` : ''}
            </div>
            <div class="product-info">
                <div class="product-header">
                    <h3 class="product-title">${product.name}</h3>
                    <span class="product-price">${product.price} ر.س</span>
                </div>
                <div class="product-details">
                    <span class="badge">⚖️ ${product.weight}</span>
                    <span class="badge">⏳ ${product.age}</span>
                </div>
                <button class="btn btn-primary full-width" 
                        onclick="openBooking(${product.id})" 
                        ${!product.inStock ? 'disabled style="background: #9CA3AF; cursor: not-allowed;"' : ''}>
                    ${product.inStock ? 'احجز الآن' : 'نفذت الكمية'}
                </button>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

// Logic variables
let currentProductPrice = 0;
let appliedDiscount = 0;
let appliedCouponCode = "";
const COUPONS = { 'MTECH': 0.10, 'SAUDI': 0.15, 'VIP': 0.20 };
const cuttingTypes = {
    'fridge': 'ثلاجة',
    'halves': 'نصفين',
    'custom': 'تفصيل',
    'whole': 'كامل'
};

function openBooking(productId) {
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('quantity').value = 1;
    document.getElementById('couponCode').value = "";
    document.getElementById('couponMsg').textContent = "";
    document.getElementById('oldPrice').style.display = 'none';

    appliedDiscount = 0;
    appliedCouponCode = "";
    currentProductPrice = product.price;

    selectedProductTitle.textContent = `حجز: ${product.name}`;
    document.getElementById('modalWeight').textContent = product.weight;
    updatePriceDisplay();

    productNameInput.value = product.name;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Initialize Map after modal is visible
    setTimeout(() => initMapPicker(), 300);
}

function initMapPicker() {
    const deliveryGroup = document.getElementById('locationGroup');
    const isDelivery = document.getElementById('deliveryType').value === 'delivery';

    if (deliveryGroup) deliveryGroup.style.display = isDelivery ? 'block' : 'none';
    if (!isDelivery) return;

    if (!map) {
        map = L.map('mapPicker').setView(RIYADH_COORDS, 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        marker = L.marker(RIYADH_COORDS, { draggable: true }).addTo(map);

        // Update hidden input on drag
        marker.on('dragend', function (e) {
            updateLocationValue(e.target.getLatLng());
        });

        // Update on map click
        map.on('click', function (e) {
            marker.setLatLng(e.latlng);
            updateLocationValue(e.latlng);
        });

        // Initial value (silent)
        updateLocationValue(marker.getLatLng(), true);
    } else {
        map.invalidateSize();
    }
}

function updateLocationValue(latlng, silent = false) {
    const link = `https://www.google.com/maps?q=${latlng.lat},${latlng.lng}`;
    const linkInput = document.getElementById('locationLink');
    const statusEl = document.getElementById('locationStatus');

    if (linkInput) linkInput.value = link;

    if (statusEl) {
        if (silent) {
            statusEl.innerHTML = `<span style="color: #64748b;">📍 يرجى تحريك العلامة لتحديد موقعك بدقة</span>`;
        } else {
            statusEl.innerHTML = `✅ تم تحديد الموقع بنجاح`;
            statusEl.style.color = '#059669';
        }
    }
}

function getCurrentLocation() {
    const status = document.getElementById('locationStatus');
    status.innerHTML = "⏳ جاري تحديد موقعك...";

    if (!navigator.geolocation) {
        status.innerHTML = "❌ المتصفح لا يدعم تحديد الموقع";
        return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        map.setView(coords, 16);
        marker.setLatLng(coords);
        updateLocationValue(marker.getLatLng());
    }, () => {
        status.innerHTML = "❌ فشل تحديد الموقع، يرجى تفعيل الـ GPS";
    });
}
window.getCurrentLocation = getCurrentLocation;

function applyCoupon() {
    const codeInput = document.getElementById('couponCode');
    const msgEl = document.getElementById('couponMsg');
    const code = codeInput.value.trim().toUpperCase();

    if (COUPONS[code]) {
        appliedDiscount = COUPONS[code];
        appliedCouponCode = code;
        msgEl.textContent = `✅ تم تفعيل خصم ${(appliedDiscount * 100)}% بنجاح!`;
        msgEl.style.color = 'green';
        updatePriceDisplay();
    } else {
        appliedDiscount = 0;
        appliedCouponCode = "";
        msgEl.textContent = "❌ كود خاطئ أو منتهي الصلاحية";
        msgEl.style.color = 'red';
        updatePriceDisplay();
    }
}

function updateQty(change) {
    const qtyInput = document.getElementById('quantity');
    let newQty = parseInt(qtyInput.value) + change;
    if (newQty < 1) newQty = 1;
    qtyInput.value = newQty;
    updatePriceDisplay();
}

function updatePriceDisplay() {
    const qty = parseInt(document.getElementById('quantity').value);
    const deliveryType = document.getElementById('deliveryType').value;
    const platesOption = document.getElementById('platesOption').checked;
    const originalTotal = currentProductPrice * qty;

    const deliveryFee = (deliveryType === 'delivery') ? 50 : 0;
    const platesFee = platesOption ? 30 : 0;

    const discountAmount = originalTotal * appliedDiscount;
    const finalTotal = originalTotal - discountAmount + deliveryFee + platesFee;

    const totalPriceEl = document.getElementById('totalPrice');
    const oldPriceEl = document.getElementById('oldPrice');

    totalPriceEl.textContent = finalTotal.toLocaleString('en-US') + ' ر.س';

    if (appliedDiscount > 0) {
        oldPriceEl.style.display = 'inline';
        oldPriceEl.textContent = (originalTotal + deliveryFee + platesFee).toLocaleString('en-US');
    } else {
        oldPriceEl.style.display = 'none';
    }
}

document.addEventListener('change', (e) => {
    if (e.target.id === 'deliveryType') {
        updatePriceDisplay();
        initMapPicker();
    }
    if (e.target.id === 'platesOption') {
        updatePriceDisplay();
    }
});

function toggleGiftFields() {
    const isGift = document.getElementById('giftOption').checked;
    const giftFields = document.getElementById('giftFields');
    if (giftFields) {
        giftFields.style.display = isGift ? 'block' : 'none';
        if (isGift) {
            giftFields.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}
window.toggleGiftFields = toggleGiftFields;

async function handleFormSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;

    // بيانات العميل
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const cuttingVal = document.getElementById('cutting').value;
    const cuttingText = cuttingTypes[cuttingVal];
    const deliveryTimeVal = document.getElementById('deliveryTime').value;
    const deliveryTimeTypes = {
        'morning': 'الفترة الصباحية (9 - 12)',
        'noon': 'فترة الظهر (12 - 3)',
        'afternoon': 'فترة العصر (3 - 6)',
        'evening': 'فترة المساء (6 - 9)'
    };
    const deliveryTimeText = deliveryTimeTypes[deliveryTimeVal] || 'لم يتم التحديد';

    const locationLink = document.getElementById('locationLink')?.value || '';
    const receiptFile = document.getElementById('receiptUpload')?.files[0];
    const notes = document.getElementById('notes').value;
    const product = productNameInput.value;
    const qty = document.getElementById('quantity').value;
    const total = document.getElementById('totalPrice').textContent;

    const deliveryVal = document.getElementById('deliveryType').value;
    const deliveryText = deliveryVal === 'delivery' ? '🚗 توصيل للموقع' : '🏠 استلام من الفرع';
    const platesOption = document.getElementById('platesOption').checked;
    const platesText = platesOption ? '🍽️ تغليف في أطباق' : '📦 تغليف عادي';
    const headVal = document.getElementById('headHandling').value;
    const headTypes = { 'skinning': 'سلخ', 'noSkinning': 'بدون سلخ', 'meshlwat': 'مشلوطة (تشويط)' };
    const headText = headTypes[headVal];

    const getBase64 = (file) => {
        return new Promise((resolve) => {
            if (!file) { resolve(null); return; }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
        });
    };

    const receiptData = await getBase64(receiptFile);

    // Gifting Info
    const isGift = document.getElementById('giftOption').checked;
    const recipientName = document.getElementById('recipientName').value || '';
    const recipientPhone = document.getElementById('recipientPhone').value || '';
    const giftMessageText = document.getElementById('giftMessage').value || '';

    const orderData = {
        id: Math.floor(10000 + Math.random() * 90000),
        timestamp: new Date().toLocaleString('en-GB'),
        customer: name,
        phone: phone,
        product: product,
        qty: parseInt(qty),
        total: total,
        delivery: deliveryText,
        deliveryTime: deliveryTimeText,
        deliveryLocation: locationLink,
        bankReceipt: receiptData,
        cutting: cuttingText,
        plates: platesText,
        head: headText,
        notes: notes,
        date: date,
        status: 'pending',
        isGift: isGift,
        recipientName: recipientName,
        recipientPhone: recipientPhone,
        giftMessage: giftMessageText
    };
    saveOrderLocally(orderData);

    submitBtn.textContent = 'جاري توجيهك للواتساب...';
    submitBtn.disabled = true;

    // --- Invoice Creation ---
    const invoicePayload = { ...orderData };
    delete invoicePayload.bankReceipt; // Don't put heavy image in URL

    const jsonString = JSON.stringify(invoicePayload);
    const encodedData = btoa(unescape(encodeURIComponent(jsonString)));
    const currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    const invoiceUrl = `${window.location.protocol}//${window.location.host}${currentPath}/invoice.html?data=${encodeURIComponent(encodedData)}`;

    // Build WhatsApp Message
    let message = isGift ? `*🎁 طلب إهداء / صدقة جديد 🐑*\n` : `*طلب حجز جديد 🐑*\n`;
    message += `---------------------------\n`;
    if (isGift) {
        message += `*المرسل:* ${name}\n`;
        message += `*المستلم:* ${recipientName}\n`;
        message += `*جوال المستلم:* ${recipientPhone}\n`;
        message += `*الرسالة:* ${giftMessageText}\n`;
        message += `---------------------------\n`;
    }
    message += `*رقم الفاتورة:* #${orderData.id}\n`;
    message += `*المنتج:* ${product}\n`;
    message += `*العدد:* ${qty}\n`;
    message += `*الخدمة:* ${deliveryText}\n`;
    if (locationLink) message += `📍 *الموقع:* ${locationLink}\n`;
    message += `*توقيت التوصيل:* ${deliveryTimeText}\n`;
    message += `*التغليف:* ${platesText}\n`;
    message += `*الرأس والكراعين:* ${headText}\n`;
    if (!isGift) message += `*الإجمالي النهائي:* ${total}\n`;
    if (appliedCouponCode) message += `*كود الخصم:* ${appliedCouponCode} ✅\n`;
    message += `---------------------------\n`;
    message += `*اسم العميل:* ${name}\n`;
    message += `*الجوال:* ${phone}\n`;
    message += `*التاريخ المطلوب:* ${date}\n`;
    message += `*نوع التقطيع:* ${cuttingText}\n`;
    message += `---------------------------\n`;
    message += `*ملاحظات:* ${notes ? notes : 'لا يوجد'}\n`;
    message += `---------------------------\n`;
    if (receiptData) message += `⚠️ *مرفق صورة إيصال التحويل بالنظام*\n`;
    message += `📄 *طباعة الفاتورة (PDF):*\n${invoiceUrl}`;

    pendingWhatsappUrl = `https://api.whatsapp.com/send?phone=${OWNER_PHONE}&text=${encodeURIComponent(message)}`;

    setTimeout(() => {
        window.location.href = pendingWhatsappUrl;
    }, 1000);

    closeModal();
    if (successOverlay) successOverlay.classList.remove('hidden');

    setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        bookingForm.reset();
    }, 2000);
}


// Logic for Orders/Invoices
function saveOrderLocally(order) {
    // 1. Save to Firebase (for the owner)
    const orderRef = db.ref('orders').push();
    order.dbId = orderRef.key; // Store the unique FB key

    orderRef.set(order)
        .then(() => console.log("Order saved to Firebase successfully! ✅"))
        .catch((error) => {
            console.error("Error saving order to Firebase:", error);
            alert("خطأ: لم يتم إرسال الطلب للسحابة. يرجى التأكد من الإنترنت أو إعدادات القاعدة.");
        });

    // 2. Keep a local list for the customer's "My Orders" tab
    let orders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    orders.unshift(order);
    localStorage.setItem('myOrders', JSON.stringify(orders));
}

function deleteOrder(orderId, event) {
    if (event) event.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    // Delete locally
    let orders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    const localOrder = orders.find(o => o.id === orderId);
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem('myOrders', JSON.stringify(orders));

    // Delete from Firebase if we have the ID
    if (localOrder && localOrder.dbId) {
        db.ref('orders/' + localOrder.dbId).remove();
    }

    renderOrdersList();
}

function markAsCompleted(orderId) {
    // This is typically called from the dashboard
    db.ref('orders').orderByChild('id').equalTo(orderId).once('value', (snapshot) => {
        snapshot.forEach((child) => {
            child.ref.update({ status: 'completed' });
        });
    });
}

function updateOrderStatus(dbId, newStatus) {
    if (dbId) {
        db.ref('orders/' + dbId).update({ status: newStatus });
    }
}

function openOrdersModal() {
    const ordersModal = document.getElementById('ordersModal');
    ordersModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderOrdersList();
}

function closeOrdersModal() {
    const ordersModal = document.getElementById('ordersModal');
    ordersModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    showOrdersList(); // Reset view to list
}

function renderOrdersList() {
    const ordersList = document.getElementById('ordersList');
    const orders = JSON.parse(localStorage.getItem('myOrders') || '[]');

    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="no-orders">لا يوجد طلبات سابقة حتى الآن.</div>';
        return;
    }

    ordersList.innerHTML = orders.map(order => {
        const statusMap = {
            'pending': '⏳ جاري المعالجة',
            'preparing': '🔪 جاري التجهيز',
            'delivering': '🚚 التوصيل',
            'completed': '✅ مكتمل'
        };
        const statusText = statusMap[order.status] || 'جاري التنفيذ';

        return `
            <div class="order-item" onclick="viewInvoice(${order.id})">
                <div class="order-main-info">
                    <h4>طلب #${order.id}</h4>
                    <span>${order.timestamp}</span>
                    <span class="status-badge ${order.status}">${statusText}</span>
                </div>
                <div class="order-right">
                    <div class="order-amount">${order.total}</div>
                    <button class="delete-btn" onclick="deleteOrder(${order.id}, event)" title="حذف الطلب">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function viewInvoice(orderId) {
    const orders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    document.getElementById('ordersList').classList.add('hidden');
    const invView = document.getElementById('invoiceView');
    invView.classList.remove('hidden');

    // Fill Invoice Data
    document.getElementById('invNum').textContent = `فاتورة #${order.id}`;
    document.getElementById('invDate').textContent = `التاريخ: ${order.timestamp}`;
    document.getElementById('invCustomer').textContent = order.customer;
    document.getElementById('invProduct').textContent = order.product;
    document.getElementById('invQty').textContent = order.qty;
    document.getElementById('invDelivery').textContent = order.delivery;
    document.getElementById('invTime').textContent = order.deliveryTime || 'لم يتم التحديد';
    document.getElementById('invCutting').textContent = order.cutting;
    document.getElementById('invTotal').textContent = order.total;

    const statusMap = {
        'pending': '⏳ جاري المعالجة',
        'preparing': '🔪 جاري التجهيز والذبح',
        'delivering': '🚚 خرج للتوصيل الآن',
        'completed': '✅ تم التوصيل بنجاح'
    };
    document.getElementById('invStatusLabel').textContent = statusMap[order.status] || 'جاري التنفيذ';

    // Show/Hide Completion Button (Owner view only or Client self-confirm)
    const statusAction = document.getElementById('invoiceStatusAction');
    if (order.status !== 'completed') {
        statusAction.innerHTML = `
            <button class="btn btn-primary full-width" onclick="markAsCompleted(${order.id})" style="margin-top: 20px; background: #10B981;">
                <i class="fa-solid fa-check-circle"></i> تأكيد الاستلام
            </button>
        `;
    } else {
        statusAction.innerHTML = `
            <div class="completed-label" style="margin-top:20px; color: #10B981; font-weight: 800; text-align: center;">
                <i class="fa-solid fa-circle-check"></i> تم استلام هذا الطلب
            </div>
        `;
    }
}

function showOrdersList() {
    document.getElementById('ordersList').classList.remove('hidden');
    document.getElementById('invoiceView').classList.add('hidden');
}

function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function reveal() {
    var reveals = document.querySelectorAll(".reveal");
    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        if (elementTop < windowHeight - 150) {
            reveals[i].classList.add("active");
        }
    }
}

// --- Auth & Profile Logic ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuthState();
});

function checkAuthState() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const authBtnText = document.getElementById('authBtnText');

    if (user) {
        authBtnText.textContent = `مرحباً، ${user.name.split(' ')[0]}`;
        // Fill booking form if it exists
        const nameInput = document.getElementById('name');
        const phoneInput = document.getElementById('phone');
        if (nameInput) nameInput.value = user.name;
        if (phoneInput) phoneInput.value = user.phone;
    } else {
        authBtnText.textContent = "دخول العميل";
    }
}

function openAuthModal() {
    const modal = document.getElementById('authModal');
    const user = JSON.parse(localStorage.getItem('currentUser'));

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (user) {
        document.getElementById('loginFormSection').classList.add('hidden');
        document.getElementById('profileSection').classList.remove('hidden');
        document.getElementById('profileNameDisplay').textContent = user.name;
        document.getElementById('profilePhoneDisplay').textContent = user.phone;
    } else {
        document.getElementById('loginFormSection').classList.remove('hidden');
        document.getElementById('profileSection').classList.add('hidden');
    }
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('loginName').value;
        const phone = document.getElementById('loginPhone').value;

        const userData = { name, phone };
        localStorage.setItem('currentUser', JSON.stringify(userData));

        checkAuthState();
        closeAuthModal();
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    checkAuthState();
    closeAuthModal();
}

// Global exposure
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.logout = logout;

// Global exposure
window.openBooking = openBooking;
window.updateQty = updateQty;
window.applyCoupon = applyCoupon;
window.closeModal = closeModal;
window.openOrdersModal = openOrdersModal;
window.closeOrdersModal = closeOrdersModal;
window.viewInvoice = viewInvoice;
window.showOrdersList = showOrdersList;

// --- Dashboard Functions (Owner Only) ---
function openDashboardModal() {
    document.getElementById('dashboardModal').classList.add('active');
    document.body.style.overflow = 'hidden';

    // Listen for orders changes to keep dashboard live
    db.ref('orders').on('value', (snapshot) => {
        const data = snapshot.val();
        const allOrders = data ? Object.values(data).reverse() : [];
        renderDashboard(allOrders);
        updateDashboardStats(allOrders);
    });
}

function updateDashboardStats(orders) {
    if (!orders) orders = [];

    // Parse totals
    const totalSales = orders.reduce((sum, o) => {
        let price = 0;
        if (typeof o.total === 'string') {
            price = parseFloat(o.total.replace(/[^\d.]/g, '')) || 0;
        } else {
            price = o.total || 0;
        }
        return sum + price;
    }, 0);

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    // Determine Top Product & Category Stats
    const productCounts = {};
    const categoryCounts = {};

    orders.forEach(o => {
        productCounts[o.product] = (productCounts[o.product] || 0) + (o.qty || 1);
        // Find category from currentProducts if possible, otherwise assume o.product is key
        const prodData = currentProducts.find(p => p.name === o.product);
        const cat = prodData ? prodData.category : 'other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + (o.qty || 1);
    });

    let topProduct = "--";
    let max = 0;
    for (const prod in productCounts) {
        if (productCounts[prod] > max) {
            max = productCounts[prod];
            topProduct = prod;
        }
    }

    // Update Main Stats
    document.getElementById('statTotalSales').innerHTML = `<span style="font-size: 1.4rem; font-weight: 800;">${totalSales.toLocaleString()}</span> <small>ر.س</small>`;
    document.getElementById('statTotalOrders').textContent = totalOrders;
    document.getElementById('statTopProduct').textContent = topProduct;

    // Update Analytics Section
    const completedSales = orders.filter(o => o.status === 'completed').reduce((sum, o) => {
        let price = 0;
        if (typeof o.total === 'string') {
            price = parseFloat(o.total.replace(/[^\d.]/g, '')) || 0;
        } else {
            price = o.total || 0;
        }
        return sum + price;
    }, 0);

    if (document.getElementById('statCompletedOrders')) {
        document.getElementById('statCompletedOrders').textContent = completedOrders;
        document.getElementById('statEstProfit').textContent = (completedSales * 0.15).toLocaleString() + ' ر.س (تقديري)'; // Assume 15% profit margin
    }

    // Render Category Analytics (Progress Bars)
    const analyticsList = document.getElementById('analyticsCategoryList');
    if (analyticsList) {
        const categories = { 'hari': 'حري', 'naimi': 'نعيمي', 'najdi': 'نجدي', 'tous': 'تيوس', 'other': 'أخرى' };
        let html = '';
        const totalItems = orders.reduce((sum, o) => sum + (o.qty || 1), 0) || 1;

        for (const [key, label] of Object.entries(categories)) {
            const count = categoryCounts[key] || 0;
            const percent = (count / totalItems) * 100;
            html += `
                <div style="margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 4px;">
                        <span>${label}</span>
                        <span>${count} ذبيحة (${percent.toFixed(0)}%)</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden;">
                        <div style="width: ${percent}%; height: 100%; background: var(--primary);"></div>
                    </div>
                </div>
            `;
        }
        analyticsList.innerHTML = html;
    }
}

function toggleDashboardAnalytics() {
    const el = document.getElementById('analyticsSection');
    if (el) {
        el.style.display = (el.style.display === 'none') ? 'block' : 'none';
        if (el.style.display === 'block') el.scrollIntoView({ behavior: 'smooth' });
    }
}
window.toggleDashboardAnalytics = toggleDashboardAnalytics;

function closeDashboardModal() {
    document.getElementById('dashboardModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function renderDashboard(ordersData) {
    renderDashboardOrders(ordersData);
    renderDashboardProducts(); // Products already synced globally
    renderDashboardReviews();
}

function renderDashboardOrders(filteredOrders) {
    const tbody = document.getElementById('dashboardTableBody');
    // If filteredOrders not provided (e.g. from filter change), fetch from Firebase (cached in local logic)
    // But since the listener calls renderDashboard, we usually have it.

    if (!filteredOrders) {
        db.ref('orders').once('value', (snapshot) => {
            const data = snapshot.val();
            const orders = data ? Object.values(data).reverse() : [];
            renderDashboardOrders(orders);
        });
        return;
    }

    let orders = filteredOrders;

    // Read Filters
    const searchTerm = document.getElementById('dbSearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('dbStatus')?.value || 'all';
    const dateFilter = document.getElementById('dbDate')?.value || '';

    // Apply Filtering
    orders = orders.filter(order => {
        const matchesSearch = !searchTerm ||
            (order.customer && order.customer.toLowerCase().includes(searchTerm)) ||
            (order.product && order.product.toLowerCase().includes(searchTerm)) ||
            (order.id && order.id.toString().includes(searchTerm));

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        const matchesDate = !dateFilter || (order.date === dateFilter);

        return matchesSearch && matchesStatus && matchesDate;
    });

    // 1. تحديث جدول الطلبات
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center; padding:20px;">لا توجد طلبات تطابق معايير البحث.</td></tr>';
    } else {
        const statusOptions = {
            'pending': '⏳ جاري المعالجة',
            'preparing': '🔪 جاري التجهيز والذبح',
            'delivering': '🚚 خرج للتوصيل',
            'completed': '✅ تم التوصيل'
        };

        // Sort orders by ID descending (newest first)
        orders.sort((a, b) => b.id - a.id);

        // Loyalty Logic: Count orders per phone
        const ordersByPhone = {};
        orders.forEach(o => {
            ordersByPhone[o.phone] = (ordersByPhone[o.phone] || 0) + 1;
        });

        tbody.innerHTML = orders.map(order => {
            const isLoyal = ordersByPhone[order.phone] >= 3;
            const giftLabel = order.isGift ? `<br><span style="color:#dc2626; font-size:0.7rem; font-weight:700;">🎁 إهداء لـ: ${order.recipientName}<br>📱: ${order.recipientPhone}</span>` : '';

            // Suggestion 3: Row coloring and New badge
            const orderTime = new Date(order.timestamp || order.date);
            const now = new Date();
            const diffMin = (now - orderTime) / (1000 * 60);
            const isVeryNew = diffMin < 60; // New in the last hour

            let rowBg = '';
            let statusBadgeColor = '#94a3b8';
            if (order.status === 'pending') { rowBg = '#fff8e1'; statusBadgeColor = '#f59e0b'; }
            if (order.status === 'preparing') { rowBg = '#e3f2fd'; statusBadgeColor = '#2563eb'; }
            if (order.status === 'delivering') { rowBg = '#f0fdf4'; statusBadgeColor = '#059669'; }
            if (order.status === 'completed') { rowBg = '#f9fafb'; statusBadgeColor = '#64748b'; }

            return `
            <tr style="background: ${rowBg}; border-bottom: 2px solid #fff;">
                <td style="padding:10px; border:1px solid #ddd; font-weight:700;">
                    ${isVeryNew ? '<span style="background:#ef4444; color:white; font-size:0.6rem; padding:2px 4px; border-radius:4px; margin-left:5px; vertical-align:middle;">جديد</span>' : ''}
                    #${order.id}
                </td>
                <td style="padding:10px; border:1px solid #ddd;">
                    ${isLoyal ? '<span title="عميل مميز (3+ طلبات)" style="color:#d97706;">⭐</span>' : ''}
                    ${order.customer}<br><small>${order.phone}</small>
                    ${giftLabel}
                </td>
                <td style="padding:10px; border:1px solid #ddd;">${order.product}</td>
                <td style="padding:10px; border:1px solid #ddd;">${order.qty}</td>
                <td style="padding:10px; border:1px solid #ddd;">${order.date || '---'}<br>${order.deliveryTime || ''}</td>
                <td style="padding:10px; border:1px solid #ddd;">${order.cutting}</td>
                <td style="padding:10px; border:1px solid #ddd;">${order.plates}</td>
                <td style="padding:10px; border:1px solid #ddd;">
                    ${order.deliveryLocation ? `<a href="${order.deliveryLocation}" target="_blank" style="color:blue;">فتح الخريطة</a>` : 'لا يوجد'}
                </td>
                <td style="padding:10px; border:1px solid #ddd;">
                    ${order.bankReceipt ? `<button onclick="showReceipt('${order.dbId}')" style="background:#2C5F2D; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:0.8rem; cursor:pointer;">عرض</button>` : 'لا يوجد'}
                </td>
                <td style="padding:10px; border:1px solid #ddd;">
                    <select onchange="updateOrderStatus('${order.dbId}', this.value)" style="padding:4px; border-radius:4px; font-size:0.8rem; width:100%; border:1px solid #ccc;">
                        ${Object.entries(statusOptions).map(([val, text]) => `
                            <option value="${val}" ${order.status === val ? 'selected' : ''}>${text}</option>
                        `).join('')}
                    </select>
                </td>
                <td style="padding:10px; border:1px solid #ddd; white-space: nowrap;">
                    <button onclick="printOrderLabel('${order.dbId}')" style="background:#b45309; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:0.8rem; cursor:pointer; margin-left: 5px;">
                        <i class="fa-solid fa-print"></i> ملصق
                    </button>
                    <button onclick="deleteOrderFromAdmin('${order.dbId}')" style="background:#dc2626; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:0.8rem; cursor:pointer;">
                        <i class="fa-solid fa-trash"></i> حذف
                    </button>
                </td>
            </tr>
        `;
        }).join('');
    }
}

function deleteOrderFromAdmin(dbId) {
    if (!dbId) return;
    if (!confirm('هل أنت متأكد من حذف هذا الطلب نهائياً من قاعدة البيانات؟ ⚠️')) return;

    db.ref('orders/' + dbId).remove()
        .then(() => {
            alert("تم حذف الطلب بنجاح! 🗑️");
        })
        .catch((error) => {
            console.error("Delete Error:", error);
            alert("خطأ في حذف الطلب: " + error.message);
        });
}
window.deleteOrderFromAdmin = deleteOrderFromAdmin;

function resetDashboardFilters() {
    if (document.getElementById('dbSearch')) document.getElementById('dbSearch').value = '';
    if (document.getElementById('dbStatus')) document.getElementById('dbStatus').value = 'all';
    if (document.getElementById('dbDate')) document.getElementById('dbDate').value = '';
    renderDashboardOrders();
}

function renderDashboardProducts() {
    const productBody = document.getElementById('productManagementBody');
    if (productBody) {
        productBody.innerHTML = currentProducts.map(p => `
            <tr>
                <td style="padding:10px; border:1px solid #ddd; font-weight:700;">${p.name}</td>
                <td style="padding:10px; border:1px solid #ddd;">
                    <input type="number" value="${p.price}" onchange="updateProductPrice(${p.id}, this.value)" style="width:80px; padding:4px; border-radius:4px; border:1px solid #ccc; font-weight:700;">
                </td>
                <td style="padding:10px; border:1px solid #ddd;">
                    <div style="display:flex; flex-direction:row; gap:5px; justify-content:center; align-items:center;">
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            <span style="font-size:0.7rem; color:#666;">الوزن</span>
                            <input type="text" value="${p.weight}" onchange="updateProductWeight(${p.id}, this.value)" style="width:85px; padding:4px; border-radius:4px; border:1px solid #ccc; font-weight:700; text-align:center;">
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:center;">
                            <span style="font-size:0.7rem; color:#666;">العمر</span>
                            <input type="text" value="${p.age}" onchange="updateProductAge(${p.id}, this.value)" style="width:85px; padding:4px; border-radius:4px; border:1px solid #ccc; font-weight:700; text-align:center; background:#fdfdfd;">
                        </div>
                    </div>
                </td>
                <td style="padding:10px; border:1px solid #ddd;">
                    <span style="color: ${p.inStock ? 'green' : 'red'}; font-weight:700;">
                        ${p.inStock ? '✅ متوفر' : '❌ نافذ'}
                    </span>
                </td>
                <td style="padding:10px; border:1px solid #ddd;">
                    <button onclick="toggleStock(${p.id})" style="background: ${p.inStock ? '#EF4444' : '#10B981'}; color:white; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:0.8rem; width:100%;">
                        ${p.inStock ? 'تعطيل' : 'تفعيل'}
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function toggleStock(productId) {
    const index = currentProducts.findIndex(p => p.id === productId);
    if (index !== -1) {
        const newStatus = !currentProducts[index].inStock;
        db.ref('products/' + productId).update({ inStock: newStatus });
    }
}

function updateProductPrice(productId, newPrice) {
    const price = parseInt(newPrice);
    if (!isNaN(price)) {
        db.ref('products/' + productId).update({ price: price });
    }
}

function updateProductWeight(productId, newWeight) {
    db.ref('products/' + productId).update({ weight: newWeight });
}

function updateProductAge(productId, newAge) {
    db.ref('products/' + productId).update({ age: newAge });
}

function updateOrderStatus(dbId, newStatus) {
    if (dbId) {
        db.ref('orders/' + dbId).update({ status: newStatus })
            .then(() => alert("تم تحديث حالة الطلب بنجاح! ✅"));
    }
}

function printOrderLabel(dbId) {
    db.ref('orders/' + dbId).once('value', (snapshot) => {
        const order = snapshot.val();
        if (!order) return;

        const labelContainer = document.getElementById('printLabelContainer');
        if (!labelContainer) return;
        labelContainer.innerHTML = `
        <div class="order-label" style="width: 80mm; padding: 10px; border: 2px solid #000; text-align: center; direction: rtl; font-family: 'Arial', sans-serif;">
            <div style="font-size: 1.2rem; font-weight: 800; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
                اسم العميل: ${order.customer}
            </div>
            <div style="font-size: 1rem; margin-bottom: 5px;">
                رقم الطلب: #${order.id}
            </div>
            <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 5px;">
                المنتج: ${order.product} (${order.qty})
            </div>
            <div style="font-size: 1rem; margin-bottom: 5px;">
                التقطيع: ${order.cutting}
            </div>
            <div style="font-size: 1rem; margin-bottom: 15px;">
                الوقت: ${order.deliveryTime || '---'}
            </div>
            ${order.notes ? `<div style="font-size: 0.9rem; font-style: italic; border-top: 1px dashed #000; padding-top: 5px;">ملاحظات: ${order.notes}</div>` : ''}
            <div style="font-size: 0.7rem; margin-top: 10px; border-top: 1px solid #000; padding-top: 5px;">ابو محمد للذبائح</div>
        </div>
    `;

        const labelContent = labelContainer.innerHTML;
        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>ملصق طلب #' + order.id + '</title>');
        printWindow.document.write('<style>@page { size: auto; margin: 0; } body { margin: 0; padding: 10px; display: flex; justify-content: center; align-items: flex-start; } .order-label { page-break-inside: avoid; }</style>');
        printWindow.document.write('</head><body onload="window.print(); window.close();">');
        printWindow.document.write(labelContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
    });
}

function showReceipt(dbId) {
    db.ref('orders/' + dbId).once('value', (snapshot) => {
        const order = snapshot.val();
        if (order && order.bankReceipt) {
            const win = window.open();
            win.document.write('<img src="' + order.bankReceipt + '" style="max-width:100%;">');
        }
    });
}

function exportOrdersToCSV() {
    db.ref('orders').once('value', (snapshot) => {
        const data = snapshot.val();
        const orders = data ? Object.values(data) : [];
        if (orders.length === 0) return;

        let csv = "\uFEFF"; // BOM for Arabic
        csv += "رقم الطلب,العميل,المنتج,العدد,تاريخ التوصيل,الوقت,التقطيع,التغليف,الموقع,الإجمالي\n";

        orders.forEach(o => {
            csv += `${o.id},${o.customer},${o.product},${o.qty},${o.date},${o.deliveryTime || ''},${o.cutting},${o.plates},${o.deliveryLocation || ''},${o.total}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "orders_report_" + new Date().toLocaleDateString() + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function openReviewModal() {
    const rModal = document.getElementById('reviewModal');
    if (rModal) {
        rModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setRating(5); // Default rating
    }
}

function closeReviewModal() {
    const rModal = document.getElementById('reviewModal');
    if (rModal) {
        rModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function renderReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;

    reviewsGrid.innerHTML = currentReviews.map(r => `
        <div class="review-card reveal">
            <div class="stars">${"⭐".repeat(r.stars)}</div>
            <p>"${r.text}"</p>
            <div class="reviewer">
                <strong>${r.name}</strong>
                <span>${r.tag || 'عميل'}</span>
            </div>
        </div>
    `).join('');
}

function renderDashboardReviews() {
    const adminReviewsBody = document.getElementById('adminReviewsTableBody');
    if (!adminReviewsBody) return;

    adminReviewsBody.innerHTML = currentReviews.map(r => `
        <tr>
            <td style="padding:10px; border:1px solid #ddd; font-weight:700;">${r.name}</td>
            <td style="padding:10px; border:1px solid #ddd; color:#D4AF37;">${"⭐".repeat(r.stars)}</td>
            <td style="padding:10px; border:1px solid #ddd; font-size:0.8rem; max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.text}</td>
            <td style="padding:10px; border:1px solid #ddd;">
                <button onclick="deleteReview(${r.id})" style="background:#EF4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">حذف</button>
            </td>
        </tr>
    `).join('');
}

function addNewReviewFromAdmin() {
    const name = document.getElementById('adminReviewName').value;
    const stars = parseInt(document.getElementById('adminReviewStars').value);
    const text = document.getElementById('adminReviewText').value;

    if (!name || !text) {
        alert("يرجى ملء جميع الحقول");
        return;
    }

    const newReview = {
        id: Date.now(),
        name: name,
        stars: stars,
        text: text,
        tag: "عميل"
    };

    currentReviews.unshift(newReview);
    localStorage.setItem('appReviews', JSON.stringify(currentReviews));

    // Clear inputs
    document.getElementById('adminReviewName').value = '';
    document.getElementById('adminReviewText').value = '';

    renderReviews();
    renderDashboardReviews();
}

function deleteReview(reviewId) {
    if (confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
        currentReviews = currentReviews.filter(r => r.id !== reviewId);
        localStorage.setItem('appReviews', JSON.stringify(currentReviews));
        renderReviews();
        renderDashboardReviews();
    }
}


function setRating(val) {
    document.getElementById('reviewRating').value = val;
    const stars = document.querySelectorAll('.rate-stars i');
    stars.forEach(s => {
        const starVal = parseInt(s.getAttribute('data-value'));
        if (starVal <= val) {
            s.style.color = '#D4AF37'; // Golden
        } else {
            s.style.color = '#ddd';
        }
    });
}

function submitReview(event) {
    event.preventDefault();
    const name = document.getElementById('reviewName').value;
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value;

    let starText = "";
    for (let i = 0; i < rating; i++) starText += "⭐";

    const message = `*تقييم جديد من الموقع* 🌟\n\n*الاسم:* ${name}\n*التقييم:* ${starText} (${rating}/5)\n*الرأي:* ${comment}`;

    const whatsappUrl = `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    closeReviewModal();
    alert("شكراً لك! تم تجهيز التقييم للإرسال عبر واتساب.");
}

// --- Order Tracking System ---
function openTrackingModal() {
    const tModal = document.getElementById('trackingModal');
    if (tModal) {
        tModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.getElementById('trackResult').style.display = 'none';
        document.getElementById('trackInput').value = '';
    }
}

function closeTrackingModal() {
    const tModal = document.getElementById('trackingModal');
    if (tModal) {
        tModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function trackOrder() {
    const input = document.getElementById('trackInput').value.trim();
    const resultDiv = document.getElementById('trackResult');

    if (!input) {
        alert("يرجى إدخال رقم الطلب أو الجوال");
        return;
    }

    // Use loading state
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fa-solid fa-spinner fa-spin"></i> جاري البحث عن الطلب...</div>';

    // Search in Firebase by ID or Phone
    db.ref('orders').once('value', (snapshot) => {
        const data = snapshot.val();
        const orders = data ? Object.values(data) : [];
        const order = orders.find(o => o.id == input || o.phone == input);

        if (!order) {
            resultDiv.innerHTML = `
                <div style="text-align: center; color: #EF4444; padding: 20px;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem; margin-bottom: 10px;"></i>
                    <p>عذراً، لم يتم العثور على طلب بهذا الرقم. تأكد من الرقم وحاول مرة أخرى.</p>
                </div>
            `;
            return;
        }

        // Status definitions
        const statuses = {
            'pending': { label: 'جاري المعالجة', color: '#64748b', icon: 'fa-clock', step: 1 },
            'preparing': { label: 'جاري الذبح والتجهيز', color: '#b45309', icon: 'fa-knife-kitchen', step: 2 },
            'delivering': { label: 'جاري التوصيل الآن', color: '#1d4ed8', icon: 'fa-truck-ramp-box', step: 3 },
            'completed': { label: 'تم التسليم بنجاح', color: '#15803d', icon: 'fa-check-double', step: 4 },
            'cancelled': { label: 'تم إلغاء الطلب', color: '#b91c1c', icon: 'fa-circle-xmark', step: 0 }
        };

        const currentStatus = statuses[order.status] || statuses['pending'];

        resultDiv.innerHTML = `
            <div style="background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span style="font-weight: 800; color: var(--primary);">طلب رقم #${order.id}</span>
                    <span style="background: ${currentStatus.color}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 700;">
                        ${currentStatus.label}
                    </span>
                </div>
                
                <!-- Progress Bar -->
                ${order.status !== 'cancelled' ? `
                <div style="padding: 0 10px; margin-bottom: 40px;">
                    <div style="display: flex; justify-content: space-between; position: relative;">
                        <!-- Track Lines -->
                        <div style="position: absolute; top: 18px; right: 0; left: 0; height: 6px; background: #e2e8f0; z-index: 1; border-radius: 10px;"></div>
                        <div style="position: absolute; top: 18px; right: 0; width: ${((currentStatus.step - 1) / 3) * 100}%; height: 6px; background: #1B4D21; z-index: 2; transition: width 1s ease; border-radius: 10px;"></div>
                        
                        <!-- Step 1 -->
                        <div style="z-index: 3; text-align: center; width: 60px;">
                            <div style="width: 38px; height: 38px; border-radius: 50%; background: ${currentStatus.step >= 1 ? '#1B4D21' : '#e2e8f0'}; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; border: 3px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <i class="fa-solid fa-file-invoice" style="font-size: 0.9rem;"></i>
                            </div>
                            <span style="font-size: 0.75rem; color: ${currentStatus.step >= 1 ? '#1B4D21' : '#94a3b8'}; font-weight: 700; display: block;">طلب</span>
                        </div>

                        <!-- Step 2 -->
                        <div style="z-index: 3; text-align: center; width: 60px;">
                            <div style="width: 38px; height: 38px; border-radius: 50%; background: ${currentStatus.step >= 2 ? '#1B4D21' : '#e2e8f0'}; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; border: 3px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <i class="fa-solid fa-utensils" style="font-size: 0.9rem;"></i>
                            </div>
                            <span style="font-size: 0.75rem; color: ${currentStatus.step >= 2 ? '#1B4D21' : '#94a3b8'}; font-weight: 700; display: block;">تجهيز</span>
                        </div>

                        <!-- Step 3 -->
                        <div style="z-index: 3; text-align: center; width: 60px;">
                            <div style="width: 38px; height: 38px; border-radius: 50%; background: ${currentStatus.step >= 3 ? '#1B4D21' : '#e2e8f0'}; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; border: 3px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <i class="fa-solid fa-truck" style="font-size: 0.9rem;"></i>
                            </div>
                            <span style="font-size: 0.75rem; color: ${currentStatus.step >= 3 ? '#1B4D21' : '#94a3b8'}; font-weight: 700; display: block;">توصيل</span>
                        </div>

                        <!-- Step 4 -->
                        <div style="z-index: 3; text-align: center; width: 60px;">
                            <div style="width: 38px; height: 38px; border-radius: 50%; background: ${currentStatus.step >= 4 ? '#1B4D21' : '#e2e8f0'}; color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; border: 3px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                <i class="fa-solid fa-house-chimney-check" style="font-size: 0.9rem;"></i>
                            </div>
                            <span style="font-size: 0.75rem; color: ${currentStatus.step >= 4 ? '#1B4D21' : '#94a3b8'}; font-weight: 700; display: block;">استلام</span>
                        </div>
                    </div>
                </div>
                ` : ''}

                <div style="border-top: 1px dashed #cbd5e1; padding-top: 15px; font-size: 0.9rem;">
                    <p style="margin-bottom: 5px;"><strong>الذبيحة:</strong> ${order.product}</p>
                    <p style="margin-bottom: 5px;"><strong>العدد:</strong> ${order.qty}</p>
                    <p style="margin-bottom: 5px;"><strong>موعد التوصيل:</strong> ${order.date} | ${order.deliveryTime}</p>
                    <p style="margin-top: 10px; color: ${currentStatus.color}; font-weight: 800; font-size: 1rem;">
                        <i class="fa-solid ${currentStatus.icon}"></i> ${currentStatus.label}
                    </p>
                </div>
            </div>
        `;
    });
}

window.viewInvoice = viewInvoice;
window.showOrdersList = showOrdersList;
window.openDashboardModal = openDashboardModal;
window.closeDashboardModal = closeDashboardModal;
window.exportOrdersToCSV = exportOrdersToCSV;
window.showReceipt = showReceipt;
window.updateOrderStatus = updateOrderStatus;
window.toggleStock = toggleStock;
window.updateProductPrice = updateProductPrice;
window.updateProductWeight = updateProductWeight;
window.updateProductAge = updateProductAge;
window.printOrderLabel = printOrderLabel;
window.openBooking = openBooking;
window.openReviewModal = openReviewModal;
window.closeReviewModal = closeReviewModal;
window.setRating = setRating;
window.submitReview = submitReview;
window.addNewReviewFromAdmin = addNewReviewFromAdmin;
window.deleteReview = deleteReview;
window.openTrackingModal = openTrackingModal;
window.closeTrackingModal = closeTrackingModal;
window.trackOrder = trackOrder;

function filterProducts(category) {
    if (!category) return;

    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => {
        const btnCat = b.getAttribute('data-category') || b.getAttribute('data-filter');
        if (btnCat === category) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });

    if (category === 'all') {
        renderProducts(currentProducts);
    } else {
        const filtered = currentProducts.filter(p => p.category === category);
        renderProducts(filtered);
    }
}
window.filterProducts = filterProducts;
window.resetDashboardFilters = resetDashboardFilters;

// Update Mobile Bottom Nav Active State
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.addEventListener('click', function () {
            document.querySelectorAll('.mobile-nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Initialize seasonal content automatically
    initSeasonalPromo();
});

function initSeasonalPromo() {
    const now = new Date();
    const gMonth = now.getMonth(); // 0-11
    const gDate = now.getDate();
    const gYear = now.getFullYear();

    let season = 'general';
    let hijriSuccess = false;

    // 1. Try Hijri Detection (Umm al-Qura) with forced Western digits for parsing
    try {
        const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-uma-nu-latn', {
            day: 'numeric', month: 'numeric', year: 'numeric'
        });
        const parts = hijriFormatter.formatToParts(now);
        const hDay = parseInt(parts.find(p => p.type === 'day').value);
        const hMonth = parseInt(parts.find(p => p.type === 'month').value);

        if (hMonth === 9) {
            season = (hDay >= 25) ? 'eid-fitr' : 'ramadan';
            hijriSuccess = true;
        } else if (hMonth === 10 && hDay <= 4) {
            season = 'eid-fitr';
            hijriSuccess = true;
        } else if (hMonth === 8 && hDay >= 20) {
            season = 'ramadan';
            hijriSuccess = true;
        } else if (hMonth === 12 && hDay <= 13) {
            season = 'eid-adha';
            hijriSuccess = true;
        }
    } catch (e) { console.log("Hijri Detection Failed, using Gregorian Fallback"); }

    // 2. Gregorian Fallback for 2026 (Safety Net)
    if (!hijriSuccess && gYear === 2026) {
        // Feb 18 - Mar 15: Ramadan
        if ((gMonth === 1 && gDate >= 18) || (gMonth === 2 && gDate <= 15)) season = 'ramadan';
        // Mar 16 - Mar 25: Eid al-Fitr Prep & Days
        else if (gMonth === 2 && (gDate >= 16 && gDate <= 25)) season = 'eid-fitr';
        // June 2026: Eid al-Adha
        else if (gMonth === 5 && (gDate >= 1 && gDate <= 10)) season = 'eid-adha';
    }

    const tickerItems = {
        'ramadan': [
            { text: '🌙 مبارك عليكم شهر رمضان المبارك .. عروض خاصة على جميع الذبائح 🌙', color: '#FFC857' },
            { text: '✨ خصم خاص عند طلب ذبيحتين فأكثر .. جودة بلدية 100% ✨', color: '#fff' },
            { text: '🚚 خدمة المذبح والتوصيل المبرد متاحة طوال الشهر الفضيل 🚚', color: '#FFC857' }
        ],
        'eid-fitr': [
            { text: '🎉 عيدكم مبارك وكل عام وأنتم بخير .. تقبل الله منا ومنكم 🎉', color: '#FFC857' },
            { text: '🐏 عيدنا غير مع ذبائح "ابو محمد" - جودة تبيض الوجه 🐏', color: '#fff' },
            { text: '🚚 خدمة التوصيل مستمرة طوال أيام العيد السعيد 🚚', color: '#FFC857' }
        ],
        'eid-adha': [
            { text: '🐑 بدأ الحجز لأضاحي العيد .. حري ونعيمي ونجدي فاخر 🐑', color: '#FFC857' },
            { text: '✨ أضاحي مختارة بعناية ومطابقة للشروط الشرعية ✨', color: '#fff' },
            { text: '🚚 حجزك المبكر يضمن لك أفضل اختيار وأسرع توصيل 🚚', color: '#FFC857' }
        ],
        'general': [
            { text: '🐏 ذبائح بلدية طازجة (حري - نعيمي) من المراح لبيتك مباشرة 🐏', color: '#FFC857' },
            { text: '🚚 خدمة الذبح والتوصيل المبرد في الرياض طوال الأسبوع 🚚', color: '#fff' },
            { text: '✨ جودة وطعم يعيد لك ذكريات الماضي - جودة أبو محمد ✨', color: '#FFC857' }
        ]
    };

    const modalContent = {
        'ramadan': `
            <div style="position: absolute; top:-20px; right:-20px; opacity:0.2; font-size:5rem;">🌙</div>
            <span class="close-modal" onclick="closePromoModal()">&times;</span>
            <div style="margin-top:20px; margin-bottom:25px;">
                <i class="fa-solid fa-moon-stars" style="font-size:3rem; color:#D4AF37;"></i>
                <h2 style="font-weight:900; color:#D4AF37; margin-top:10px;">رمضان كريم مبارك 🌙</h2>
            </div>
            <div class="promo-body" style="font-size:1.1rem; line-height:1.8; margin-bottom:30px;">
                <p>عروض خاصة بمناسبة شهر رمضان المبارك على جميع الذبائح 🐏</p>
                <div style="background:rgba(212,175,55,0.15); padding:10px; border-radius:12px; margin-top:15px;">
                    <p style="margin:0;">🎁 خصم خاص عند طلب ذبيحتين فأكثر</p>
                </div>
            </div>
            <button onclick="closePromoModal()" class="btn btn-primary full-width" style="background:#D4AF37; color:#1b4d21; font-weight:900;">تصفح العروض الآن ✨</button>
        `,
        'eid-fitr': `
            <div style="position: absolute; top:-20px; right:-20px; opacity:0.15; font-size:5rem;">✨</div>
            <span class="close-modal" onclick="closePromoModal()">&times;</span>
            <div style="margin-top:20px; margin-bottom:25px;">
                <i class="fa-solid fa-gift" style="font-size:3rem; color:#D4AF37;"></i>
                <h2 style="font-weight:900; color:#D4AF37; margin-top:10px;">عيدكم مبارك 🎉</h2>
                <h3 style="font-size:1.1rem; opacity:0.9;">وكل عام وأنتم بخير</h3>
            </div>
            <div class="promo-body" style="font-size:1.1rem; line-height:1.8; margin-bottom:30px;">
                <p>بمناسبة عيد الفطر السعيد .. ذبائحنا جاهزة لضيوفكم 🐑</p>
                <div style="background:rgba(212,175,55,0.15); padding:10px; border-radius:12px; margin-top:15px;">
                    <p style="margin:0; font-weight:800;">🎁 عروض خاصة لولائم العيد</p>
                </div>
            </div>
            <button onclick="closePromoModal()" class="btn btn-primary full-width" style="background:#D4AF37; color:#1b4d21; font-weight:900;">اطلب ذبيحة العيد الآن 🐏</button>
        `,
        'eid-adha': `
            <div style="position: absolute; top:-20px; right:-20px; opacity:0.15; font-size:5rem;">🐑</div>
            <span class="close-modal" onclick="closePromoModal()">&times;</span>
            <div style="margin-top:20px; margin-bottom:25px;">
                <i class="fa-solid fa-kaaba" style="font-size:3rem; color:#D4AF37;"></i>
                <h2 style="font-weight:900; color:#D4AF37; margin-top:10px;">أضاحي العيد 🐑</h2>
            </div>
            <div class="promo-body" style="font-size:1.1rem; line-height:1.8; margin-bottom:30px;">
                <p>افضل الخيارات للأضاحي البلدية (حري ونعيمي) 🐏</p>
                <div style="background:rgba(212,175,55,0.15); padding:10px; border-radius:12px; margin-top:15px;">
                    <p style="margin:0; font-weight:800;">📦 متاح الحجز المبكر والذبح والتوصيل</p>
                </div>
            </div>
            <button onclick="closePromoModal()" class="btn btn-primary full-width" style="background:#2C5F2D; color:#fff; font-weight:900;">احجز أضحيتك الآن ✨</button>
        `,
        'general': `
            <div style="position: absolute; top:-20px; right:-20px; opacity:0.1; font-size:5rem;">🐏</div>
            <span class="close-modal" onclick="closePromoModal()">&times;</span>
            <div style="margin-top:20px; margin-bottom:25px;">
                <i class="fa-solid fa-star" style="font-size:3rem; color:#D4AF37;"></i>
                <h2 style="font-weight:900; color:#D4AF37; margin-top:10px;">نؤمن بيوتكم بأجود الذبائح 🐏</h2>
            </div>
            <div class="promo-body" style="font-size:1.1rem; line-height:1.8; margin-bottom:30px;">
                <p>كل أسبوع عروض جديدة على الحري والنعيمي والنجدي ✨</p>
                <p>ذبح يومي وتوصيل مبرد سريع لجميع أحياء الرياض 🚚</p>
            </div>
            <button onclick="closePromoModal()" class="btn btn-primary full-width" style="background:#D4AF37; color:#1b4d21; font-weight:900;">ابدأ اختيار ذبيحتك 🚀</button>
        `
    };

    // Update Ticker
    const tickerContainer = document.getElementById('dynamicTicker');
    if (tickerContainer) {
        const items = tickerItems[season] || tickerItems['general'];
        tickerContainer.innerHTML = items.map(item => `
            <div class="ticker__item" style="color: ${item.color}; font-weight: 800;">${item.text}</div>
        `).join('') + items.map(item => `
            <div class="ticker__item" style="color: ${item.color}; font-weight: 800;">${item.text}</div>
        `).join(''); // Double it for loop
    }

    // Update Modal
    const modalContainer = document.getElementById('dynamicPromoModalContent');
    if (modalContainer) {
        modalContainer.innerHTML = modalContent[season] || modalContent['general'];
    }

    // Show on load logic (refined per season)
    const sessionKey = `promoShown_${season}_${hYear}`;
    if (!sessionStorage.getItem(sessionKey)) {
        setTimeout(() => {
            const pModal = document.getElementById('promoModal');
            if (pModal) {
                pModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }, 1500);
    }
}

function closePromoModal() {
    const pModal = document.getElementById('promoModal');
    if (pModal) {
        pModal.classList.remove('active');
        document.body.style.overflow = 'auto';

        // Find which Hijri season we are in
        const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma-nu-latn', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
        const parts = hijriFormatter.formatToParts(new Date());
        const hDay = parseInt(parts.find(p => p.type === 'day').value);
        const hMonth = parseInt(parts.find(p => p.type === 'month').value);
        const hYear = parts.find(p => p.type === 'year').value;

        let season = 'general';
        if ((hMonth === 8 && hDay >= 20) || (hMonth === 9 && hDay <= 24)) season = 'ramadan';
        else if ((hMonth === 9 && hDay >= 25) || (hMonth === 10 && hDay <= 4)) season = 'eid-fitr';
        else if (hMonth === 12 && (hDay >= 1 && hDay <= 13)) season = 'eid-adha';

        sessionStorage.setItem(`promoShown_${season}_${hYear}`, 'true');
    }
}
window.closePromoModal = closePromoModal;
