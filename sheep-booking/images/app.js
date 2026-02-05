const OWNER_PHONE = "966530382226"; // رقم عميل (ابو محمد)

// بيانات المنتجات (8 أصناف رئيسية)
const products = [
    {
        id: 1,
        name: "حري لباني",
        category: "hari",
        price: 1350,
        weight: "10-12 كجم",
        age: "3-4 شهور",
        inStock: true,
        image: "images/1.jpg",
        backup: "https://images.unsplash.com/photo-1484557985045-6f5e98487c9d?q=80&w=400&fit=crop"
    },
    {
        id: 2,
        name: "حري جذع",
        category: "hari",
        price: 1650,
        weight: "18-20 كجم",
        age: "6 شهور",
        inStock: true,
        image: "images/2.jpg",
        backup: "https://images.unsplash.com/photo-1484557985045-6f5e98487c9d?q=80&w=400&fit=crop"
    },
    {
        id: 3,
        name: "تيس لباني",
        category: "tais",
        price: 1100,
        weight: "8-10 كجم",
        age: "3 شهور",
        inStock: true,
        image: "images/3.jpg",
        backup: "https://source.unsplash.com/400x300/?goat"
    },
    {
        id: 4,
        name: "تيس جذع",
        category: "tais",
        price: 1300,
        weight: "14-16 كجم",
        age: "5 شهور",
        inStock: true,
        image: "images/4.jpg",
        backup: "https://source.unsplash.com/400x300/?goat"
    },
    {
        id: 5,
        name: "نعيمي لباني",
        category: "naimi",
        price: 1450,
        weight: "11-13 كجم",
        age: "3-4 شهور",
        inStock: true,
        image: "images/5.jpg",
        backup: "https://source.unsplash.com/400x300/?sheep"
    },
    {
        id: 6,
        name: "نعيمي هرفي",
        category: "naimi",
        price: 1750,
        weight: "16-18 كجم",
        age: "5-6 شهور",
        inStock: true,
        image: "images/6.jpg",
        backup: "https://source.unsplash.com/400x300/?sheep"
    },
    {
        id: 7,
        name: "نجدي لباني",
        category: "najdi",
        price: 1550,
        weight: "12-14 كجم",
        age: "4 شهور",
        inStock: true,
        image: "images/7.jpg",
        backup: "https://source.unsplash.com/400x300/?black-sheep"
    },
    {
        id: 8,
        name: "نجدي هرفي",
        category: "najdi",
        price: 1950,
        weight: "18-22 كجم",
        age: "6 شهور",
        inStock: true,
        image: "images/8.jpg",
        backup: "https://source.unsplash.com/400x300/?black-sheep"
    }
];

// DOM Elements
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
    injectMTechAds();
    renderProducts(products);

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

// --- M-Tech Ads System (Google AdSense Space) ---
function injectMTechAds() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    const adContainer = document.createElement('div');
    adContainer.id = "mtech-ads-wrapper";
    adContainer.style.cssText = "margin: 20px auto; max-width: 1200px; padding: 0 20px; text-align: center;";

    const googleAdsHTML = `
        <div class="google-ads-slot" style="margin-bottom: 20px; background: #ffffff; border-radius: 12px; min-height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden;">
            <p style="font-size: 0.7rem; color: #94a3b8; margin: 10px 0;">إعلان Google AdSense</p>
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-2461384535125374" 
                 data-ad-slot="7614255654"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
        </div>
    `;

    // سبيس الإعلانات الخاصة (تحت أدسنس مباشرة)
    const privateAdHTML = `
        <div class="private-ad-slot" id="mtech-partner-space" style="margin-top: 15px;">
            <p style="font-size: 0.8rem; color: #9CA3AF; margin-bottom: 5px; text-align: right;">رعاية وإعلانات خاصة - تواصل معنا</p>
            <a href="https://wa.me/966530382226" target="_blank">
                <img src="https://via.placeholder.com/1200x120/2C5F2D/FFFFFF?text=مساحة+إعلانية+مخصصة+-+احجز+إعلانك+هنا" 
                     alt="Private Ad Space" 
                     style="width: 100%; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            </a>
        </div>
    `;

    adContainer.innerHTML = googleAdsHTML + privateAdHTML;
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

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-filter');
            if (category === 'all') {
                renderProducts(products);
            } else {
                const filtered = products.filter(p => p.category === category);
                renderProducts(filtered);
            }
        });
    });

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
    const product = products.find(p => p.id === productId);
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
}

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
    if (e.target.id === 'deliveryType' || e.target.id === 'platesOption') {
        updatePriceDisplay();
    }
});

function handleFormSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;

    // بيانات العميل
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const cuttingVal = document.getElementById('cutting').value;
    const cuttingText = cuttingTypes[cuttingVal];
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

    // حفظ الطلب محلياً
    const orderData = {
        id: Math.floor(10000 + Math.random() * 90000),
        timestamp: new Date().toLocaleString('en-GB'), // Use English format for Western digits
        customer: name,
        product: product,
        qty: qty,
        total: total,
        delivery: deliveryText,
        cutting: cuttingText,
        plates: platesText,
        head: headText,
        notes: notes,
        status: 'pending' // الحالة الافتراضية
    };
    saveOrderLocally(orderData);

    // تغيير حالة الزر
    submitBtn.textContent = 'جاري توجيهك للواتساب...';
    submitBtn.disabled = true;

    // بناء الرسالة بشكل منسق جداً
    let message = `*طلب حجز جديد 🐑*\n`;
    message += `---------------------------\n`;
    message += `*رقم الفاتورة:* #${orderData.id}\n`;
    message += `*المنتج:* ${product}\n`;
    message += `*العدد:* ${qty}\n`;
    message += `*الخدمة:* ${deliveryText}\n`;
    message += `*التغليف:* ${platesText}\n`;
    message += `*الرأس والكراعين:* ${headText}\n`;
    message += `*الإجمالي النهائي:* ${total}\n`;
    if (appliedCouponCode) message += `*كود الخصم:* ${appliedCouponCode} ✅\n`;
    message += `---------------------------\n`;
    message += `*اسم العميل:* ${name}\n`;
    message += `*الجوال:* ${phone}\n`;
    message += `*التاريخ المطلوب:* ${date}\n`;
    message += `*نوع التقطيع:* ${cuttingText}\n`;
    message += `---------------------------\n`;
    message += `*ملاحظات:* ${notes ? notes : 'لا يوجد'}`;

    // رابط الواتساب المباشر
    pendingWhatsappUrl = `https://api.whatsapp.com/send?phone=${OWNER_PHONE}&text=${encodeURIComponent(message)}`;

    // إظهار بطاقة النجاح (بدلاً من التحويل المباشر)
    closeModal();
    if (successOverlay) {
        successOverlay.classList.remove('hidden');
    } else {
        // إذا لم يتم العثور على الأوفرلاي، يتم التحويل مباشرة كخطة بديلة
        window.location.href = pendingWhatsappUrl;
    }

    // إعادة ضبط الزر والنموذج
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    bookingForm.reset();
}

// Logic for Orders/Invoices
function saveOrderLocally(order) {
    let orders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    orders.unshift(order); // Add to beginning
    localStorage.setItem('myOrders', JSON.stringify(orders));
}

function deleteOrder(orderId, event) {
    if (event) event.stopPropagation(); // Prevent opening invoice
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    let orders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem('myOrders', JSON.stringify(orders));
    renderOrdersList();
}

function markAsCompleted(orderId) {
    let orders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        orders[orderIndex].status = 'completed';
        localStorage.setItem('myOrders', JSON.stringify(orders));
        alert('تم تحديث حالة الطلب إلى مكتمل ✅');
        viewInvoice(orderId); // Refresh view
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

    ordersList.innerHTML = orders.map(order => `
        <div class="order-item" onclick="viewInvoice(${order.id})">
            <div class="order-main-info">
                <h4>طلب #${order.id}</h4>
                <span>${order.timestamp}</span>
                <span class="status-badge ${order.status}">${order.status === 'pending' ? 'جاري التنفيذ' : 'مكتمل'}</span>
            </div>
            <div class="order-right">
                <div class="order-amount">${order.total}</div>
                <button class="delete-btn" onclick="deleteOrder(${order.id}, event)" title="حذف الطلب">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
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
    document.getElementById('invCutting').textContent = order.cutting;
    document.getElementById('invTotal').textContent = order.total;

    // Show/Hide Completion Button
    const statusAction = document.getElementById('invoiceStatusAction');
    if (order.status === 'pending') {
        statusAction.innerHTML = `
            <button class="btn btn-primary full-width" onclick="markAsCompleted(${order.id})" style="margin-top: 20px;">
                <i class="fa-solid fa-check-circle"></i> تحديد كمكتمل
            </button>
        `;
    } else {
        statusAction.innerHTML = `
            <div class="completed-label" style="margin-top:20px; color: #10B981; font-weight: 800; text-align: center;">
                <i class="fa-solid fa-circle-check"></i> هذا الطلب مكتمل
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
