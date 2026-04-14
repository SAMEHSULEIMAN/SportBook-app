// app.js - الإصدار النهائي المتكامل مع جميع الميزات المتقدمة ونظام i18n الكامل
(function(){
  "use strict";

  // ---------- الإعدادات والمفاتيح ----------
  const STORAGE_KEYS = { 
    VENUES: 'sport_venues',
    BOOKINGS: 'sport_bookings',
    USERS: 'sport_users',
    SESSION: 'sport_session',
    NOTIFICATIONS: 'sport_notifications',
    CUSTOM_SPORTS: 'custom_sports',
    CURRENCY: 'preferred_currency',
    REVIEWS: 'sport_reviews',
    CART: 'sport_cart',
    BLACKOUTS: 'sport_blackouts',
    COURTS: 'sport_courts',
    COACHES: 'sport_coaches',
    COACH_BOOKINGS: 'coach_bookings',
    COACH_AVAILABILITY: 'coach_availability',
    COACH_REVIEWS: 'coach_reviews',
    // --- الميزات الجديدة ---
    PROMO_CODES: 'promo_codes',
    FAVORITES: 'user_favorites',
    RECURRING_GROUPS: 'recurring_groups',
    PENDING_PAYMENTS: 'pending_payments'
  };
  
  const ADMIN_CODE = 'admin123';
  const SESSION_EXPIRY_HOURS = 24;
  const DEFAULT_SPORTS = ['football', 'basketball', 'tennis', 'padel'];
  const PAYMENT_TIMEOUT_MINUTES = 15; // للإلغاء التلقائي
  
  const PERIODS = [
    { name: 'الليل', start: 0, end: 7, color: '#6366f1' },
    { name: 'الصباح', start: 7, end: 11, color: '#f59e0b' },
    { name: 'الظهيرة', start: 11, end: 16, color: '#10b981' },
    { name: 'المساء', start: 16, end: 24, color: '#ef4444' }
  ];

  const WEEKDAYS = [
    { key: 'sun', label: 'الأحد' },
    { key: 'mon', label: 'الإثنين' },
    { key: 'tue', label: 'الثلاثاء' },
    { key: 'wed', label: 'الأربعاء' },
    { key: 'thu', label: 'الخميس' },
    { key: 'fri', label: 'الجمعة' },
    { key: 'sat', label: 'السبت' }
  ];

  const CURRENCIES = {
    SAR: { symbol: 'ريال', name: 'ريال سعودي' },
    AED: { symbol: 'درهم', name: 'درهم إماراتي' },
    EGP: { symbol: 'جنيه', name: 'جنيه مصري' },
    USD: { symbol: '$', name: 'دولار أمريكي' },
    EUR: { symbol: '€', name: 'يورو' }
  };

  // ---------- دوال مساعدة ----------
  function sanitizeInput(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
  
  function showToast(msg, isSuccess = true) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.background = isSuccess ? '#10b981' : '#ef4444';
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 3000);
  }
  
  function showLoader() { document.getElementById('globalLoader').style.display = 'block'; }
  function hideLoader() { document.getElementById('globalLoader').style.display = 'none'; }

  // ---------- دوال i18n (الترجمة المتكاملة) ----------
  let currentLanguage = 'ar';
  const i18n = {
    ar: {
      // عام
      home: 'الرئيسية',
      profile: 'الملف الشخصي',
      favorites: 'المفضلة',
      logout: 'تسجيل الخروج',
      login: 'دخول',
      register: 'حساب جديد',
      venue: 'منشأة',
      coach: 'مدرب',
      customer: 'عميل',
      admin: 'أدمن',
      bookNow: 'احجز الآن',
      addToCart: 'أضف إلى السلة',
      checkout: 'إتمام حجز الكل',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      close: 'إغلاق',
      confirm: 'تأكيد',
      search: 'بحث',
      filter: 'تصفية',
      all: 'الكل',
      loading: 'جاري التحميل...',
      // التنقل
      registerVenue: 'تسجيل منشأة',
      registerVenueTitle: 'تسجيل منشأة رياضية',
      registerCoach: 'تسجيل كمدرب',
      registerCoachTitle: 'تسجيل مدرب خصوصي',
      venueDashboard: 'لوحة المنشأة',
      coachDashboard: 'لوحة المدرب',
      adminDashboard: 'لوحة الأدمن',
      analytics: 'التحليلات',
      courts: 'الملاعب',
      coaches: 'المدربين',
      cart: 'سلة الحجوزات',
      myBookings: 'حجوزاتي',
      // إجراءات
      approve: 'قبول',
      reject: 'رفض',
      pending: 'بانتظار الموافقة',
      confirmed: 'مؤكد',
      cancelled: 'ملغي',
      recurring: 'متكرر',
      // إشعارات
      welcome: 'أهلاً',
      bookingConfirmed: 'تم تأكيد حجزك',
      bookingCancelled: 'تم إلغاء حجزك',
      locateMe: 'حدد موقعي وانتقل إليه',
      explore: 'استكشف الملاعب والمدربين',
      changeCurrency: 'تغيير العملة:',
      total: 'الإجمالي:',
      venues: 'المنشآت',
      users: 'المستخدمين',
      bookings: 'الحجوزات',
      promos: 'الكوبونات',
      finance: 'الماليات',
      data: 'البيانات',
      advanced: 'متقدم',
    },
    en: {
      home: 'Home',
      profile: 'Profile',
      favorites: 'Favorites',
      logout: 'Logout',
      login: 'Login',
      register: 'Register',
      venue: 'Venue',
      coach: 'Coach',
      customer: 'Customer',
      admin: 'Admin',
      bookNow: 'Book Now',
      addToCart: 'Add to Cart',
      checkout: 'Checkout All',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      confirm: 'Confirm',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      loading: 'Loading...',
      registerVenue: 'Register Venue',
      registerVenueTitle: 'Register Sports Venue',
      registerCoach: 'Register as Coach',
      registerCoachTitle: 'Register Private Coach',
      venueDashboard: 'Venue Dashboard',
      coachDashboard: 'Coach Dashboard',
      adminDashboard: 'Admin Dashboard',
      analytics: 'Analytics',
      courts: 'Courts',
      coaches: 'Coaches',
      cart: 'Cart',
      myBookings: 'My Bookings',
      approve: 'Approve',
      reject: 'Reject',
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      recurring: 'Recurring',
      welcome: 'Welcome',
      bookingConfirmed: 'Your booking has been confirmed',
      bookingCancelled: 'Your booking has been cancelled',
      locateMe: 'Locate Me',
      explore: 'Explore Courts and Coaches',
      changeCurrency: 'Change Currency:',
      total: 'Total:',
      venues: 'Venues',
      users: 'Users',
      bookings: 'Bookings',
      promos: 'Promos',
      finance: 'Finance',
      data: 'Data',
      advanced: 'Advanced',
    }
  };

  function t(key) {
    return i18n[currentLanguage]?.[key] || key;
  }

  function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('app_language', lang);
    
    const langText = document.getElementById('langText');
    if (langText) langText.textContent = lang === 'ar' ? 'English' : 'العربية';
    
    updateUITranslations();
  }

  function updateUITranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.placeholder = t(key);
    });
    
    if (!currentUser) {
      const loginBtn = document.getElementById('showLoginBtn');
      const registerBtn = document.getElementById('showRegisterBtn');
      if (loginBtn) loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> ${t('login')}`;
      if (registerBtn) registerBtn.innerHTML = `<i class="fas fa-user-plus"></i> ${t('register')}`;
    }
    
    updateUserArea();
    updateNavigation();
  }

  function initI18n() {
    const savedLang = localStorage.getItem('app_language') || 'ar';
    setLanguage(savedLang);
    
    const langBtn = document.getElementById('toggleLangBtn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        setLanguage(currentLanguage === 'ar' ? 'en' : 'ar');
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initI18n);

  // ---------- API (محاكاة localStorage مع الجداول الجديدة) ----------
  const api = {
    async getVenues() { await delay(50); return JSON.parse(localStorage.getItem(STORAGE_KEYS.VENUES)) || []; },
    async saveVenues(venues) { await delay(50); localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(venues)); },
    async getBookings() { await delay(50); return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || []; },
    async saveBookings(bookings) { await delay(50); localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings)); },
    async getUsers() { await delay(50); return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || []; },
    async saveUsers(users) { await delay(50); localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); },
    async getNotifications() { await delay(50); return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || []; },
    async saveNotifications(notifs) { await delay(50); localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs)); },
    async getCustomSports() { await delay(10); return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_SPORTS)) || []; },
    async saveCustomSports(sports) { await delay(10); localStorage.setItem(STORAGE_KEYS.CUSTOM_SPORTS, JSON.stringify(sports)); },
    async getPreferredCurrency() { return localStorage.getItem(STORAGE_KEYS.CURRENCY) || null; },
    async savePreferredCurrency(code) { localStorage.setItem(STORAGE_KEYS.CURRENCY, code); },
    async getReviews() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS)) || {}; },
    async saveReviews(reviews) { localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews)); },
    async getCart() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || []; },
    async saveCart(cart) { localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart)); },
    async getBlackouts() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.BLACKOUTS)) || {}; },
    async saveBlackouts(blackouts) { localStorage.setItem(STORAGE_KEYS.BLACKOUTS, JSON.stringify(blackouts)); },
    async getCourts() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COURTS)) || []; },
    async saveCourts(courts) { localStorage.setItem(STORAGE_KEYS.COURTS, JSON.stringify(courts)); },
    async getCoaches() { await delay(50); return JSON.parse(localStorage.getItem(STORAGE_KEYS.COACHES)) || []; },
    async saveCoaches(coaches) { await delay(50); localStorage.setItem(STORAGE_KEYS.COACHES, JSON.stringify(coaches)); },
    async getCoachBookings() { await delay(50); return JSON.parse(localStorage.getItem(STORAGE_KEYS.COACH_BOOKINGS)) || []; },
    async saveCoachBookings(bookings) { await delay(50); localStorage.setItem(STORAGE_KEYS.COACH_BOOKINGS, JSON.stringify(bookings)); },
    async getCoachAvailability() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COACH_AVAILABILITY)) || {}; },
    async saveCoachAvailability(availability) { localStorage.setItem(STORAGE_KEYS.COACH_AVAILABILITY, JSON.stringify(availability)); },
    async getCoachReviews() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COACH_REVIEWS)) || {}; },
    async saveCoachReviews(reviews) { localStorage.setItem(STORAGE_KEYS.COACH_REVIEWS, JSON.stringify(reviews)); },
    // --- جداول جديدة ---
    async getPromoCodes() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMO_CODES)) || []; },
    async savePromoCodes(codes) { localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(codes)); },
    async getFavorites() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || []; },
    async saveFavorites(favs) { localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs)); },
    async getRecurringGroups() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECURRING_GROUPS)) || []; },
    async saveRecurringGroups(groups) { localStorage.setItem(STORAGE_KEYS.RECURRING_GROUPS, JSON.stringify(groups)); },
    async getPendingPayments() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_PAYMENTS)) || []; },
    async savePendingPayments(payments) { localStorage.setItem(STORAGE_KEYS.PENDING_PAYMENTS, JSON.stringify(payments)); },
    // --- الجلسة ---
    async getSession() { 
      const sess = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
      if (sess && sess.expiresAt && new Date(sess.expiresAt) > new Date()) return sess.user;
      localStorage.removeItem(STORAGE_KEYS.SESSION);
      return null;
    },
    async setSession(user) { 
      const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ user, expiresAt }));
    },
    async clearSession() { localStorage.removeItem(STORAGE_KEYS.SESSION); }
  };

  // ---------- دوال التسعير ----------
  function getPeriodIndex(hour) { 
    if (hour >= 0 && hour < 7) return 0;
    if (hour >= 7 && hour < 11) return 1;
    if (hour >= 11 && hour < 16) return 2;
    return 3;
  }
  
  function getHourlyPrice(court, hour) {
    const venue = venues.find(v => v.id === court.venueId);
    if (court.pricing) return court.pricing[getPeriodIndex(hour)] || 50;
    if (venue && venue.pricing) return venue.pricing[getPeriodIndex(hour)] || 50;
    return 50;
  }
  
  function calculateBookingPrice(court, dateStr, timeStr, duration) {
    const startHour = parseInt(timeStr.split(':')[0]);
    let total = 0;
    for (let i = 0; i < duration; i++) {
      total += getHourlyPrice(court, (startHour + i) % 24);
    }
    return total;
  }

  // ---------- دوال ساعات العمل ----------
  function isWithinWorkingHours(venue, dateStr, hour) {
    if (!venue.workingHours) return true;
    const dayOfWeek = new Date(dateStr).getDay();
    const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][dayOfWeek];
    const dayHours = venue.workingHours[dayKey];
    if (!dayHours || !dayHours.start || !dayHours.end) return true;
    const start = parseInt(dayHours.start.split(':')[0]);
    const end = parseInt(dayHours.end.split(':')[0]);
    if (end < start) {
      return hour >= start || hour < end;
    }
    return hour >= start && hour < end;
  }

  function isWithinCoachWorkingHours(coachId, dateStr, hour) {
    const availability = coachAvailability[coachId];
    if (!availability) return true;
    const dayOfWeek = new Date(dateStr).getDay();
    const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][dayOfWeek];
    const dayHours = availability[dayKey];
    if (!dayHours || !dayHours.start || !dayHours.end) return true;
    const start = parseInt(dayHours.start.split(':')[0]);
    const end = parseInt(dayHours.end.split(':')[0]);
    if (end < start) {
      return hour >= start || hour < end;
    }
    return hour >= start && hour < end;
  }

  // دالة محسنة للتحقق من الإغلاقات (ملاعب ومدربين)
  function isBlackedOut(itemType, itemId, dateStr, hour) {
    const blackoutList = blackouts[itemId] || [];
    return blackoutList.some(b => {
      if (b.type === 'day' && b.date === dateStr) return true;
      if (b.type === 'hour' && b.date === dateStr) {
        const bh = parseInt(b.startHour);
        return hour >= bh && hour < bh + (b.duration || 1);
      }
      return false;
    });
  }

  function getAvailableHoursForCourt(court, dateStr) {
    const venue = venues.find(v => v.id === court.venueId);
    if (!venue) return { available: 0, total: 0 };
    const dayBookings = bookings.filter(b => b.courtId === court.id && b.date === dateStr && b.status !== 'cancelled');
    
    let workingHoursForDay = [];
    for (let h = 0; h < 24; h++) {
      if (isWithinWorkingHours(venue, dateStr, h) && !isBlackedOut('court', court.id, dateStr, h)) {
        workingHoursForDay.push(h);
      }
    }
    
    const bookedSlots = new Array(24).fill(false);
    dayBookings.forEach(b => {
      const start = parseInt(b.time.split(':')[0]);
      for (let i = 0; i < (b.duration || 1); i++) {
        if (start + i < 24) bookedSlots[start + i] = true;
      }
    });
    
    let available = 0;
    workingHoursForDay.forEach(h => {
      if (!bookedSlots[h]) available++;
    });
    
    return { available, total: workingHoursForDay.length };
  }

  function getCoachAvailableHours(coachId, dateStr) {
    const coach = coaches.find(c => c.id === coachId);
    if (!coach) return { available: 0, total: 0 };
    const dayBookings = coachBookings.filter(b => b.coachId === coachId && b.date === dateStr && b.status !== 'cancelled');
    
    let workingHoursForDay = [];
    for (let h = 0; h < 24; h++) {
      if (isWithinCoachWorkingHours(coachId, dateStr, h) && !isBlackedOut('coach', coachId, dateStr, h)) {
        workingHoursForDay.push(h);
      }
    }
    
    const bookedSlots = new Array(24).fill(false);
    dayBookings.forEach(b => {
      const start = parseInt(b.time.split(':')[0]);
      for (let i = 0; i < (b.duration || 1); i++) {
        if (start + i < 24) bookedSlots[start + i] = true;
      }
    });
    
    let available = 0;
    workingHoursForDay.forEach(h => {
      if (!bookedSlots[h]) available++;
    });
    
    return { available, total: workingHoursForDay.length };
  }

  // ---------- الحالة العامة ----------
  let currentUser = null;
  let venues = [], bookings = [], users = [], notifications = [], customSports = [], cart = [], reviews = {}, blackouts = {}, courts = [];
  let coaches = [], coachBookings = [], coachAvailability = {}, coachReviews = {};
  // متغيرات جديدة
  let promoCodes = [], favorites = [], recurringGroups = [], pendingPayments = [];
  
  let currentCurrency = 'SAR';
  let map, miniMap, editMiniMap, coachMap;
  let customerLocation = null;
  let pendingConfirmCallback = null;
  let venueMarker = null, editMarker = null, coachMarker = null;
  let pendingBooking = null;
  let selectedRating = 0;
  let currentViewMode = 'courts';

  const sections = document.querySelectorAll('.section');
  const mainNav = document.getElementById('mainNav');
  const userArea = document.getElementById('userArea');
  
    // ---------- العملات ----------
  function getCurrencySymbol(code) { return CURRENCIES[code]?.symbol || code; }
  function getCurrencyName(code) { return CURRENCIES[code]?.name || code; }

  async function detectUserCurrency() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        const currencyMap = { 'SA': 'SAR', 'AE': 'AED', 'EG': 'EGP', 'US': 'USD', 'EU': 'EUR' };
        return currencyMap[data.country_code] || 'SAR';
      }
    } catch (e) { console.warn('فشل اكتشاف الموقع'); }
    return 'SAR';
  }

  async function initializeCurrency() {
    let saved = await api.getPreferredCurrency();
    if (!saved) {
      saved = await detectUserCurrency();
      await api.savePreferredCurrency(saved);
    }
    currentCurrency = saved;
    document.getElementById('manualCurrencySelect').value = saved;
    updateCurrencyUI();
  }

  function updateCurrencyUI() {
    const symbol = getCurrencySymbol(currentCurrency);
    const name = getCurrencyName(currentCurrency);
    document.querySelectorAll('[id^="currencySymbol"]').forEach(el => el.textContent = symbol);
    document.getElementById('bookingCurrency').textContent = symbol;
    document.getElementById('manageBookingCurrency').textContent = symbol;
    document.getElementById('cartCurrency').textContent = symbol;
    document.getElementById('currencyNotice').innerHTML = `<i class="fas fa-globe"></i> العملة المستخدمة: ${name} (${symbol}) - تم اكتشافها تلقائياً`;
    if (document.getElementById('home').classList.contains('active')) {
      if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
    }
    if (document.getElementById('bookingModal').style.visibility === 'visible') updatePrice();
    updateCartUI();
  }

  async function changeCurrency(code) {
    currentCurrency = code;
    await api.savePreferredCurrency(code);
    updateCurrencyUI();
    showToast(`تم تغيير العملة إلى ${getCurrencyName(code)}`);
  }

  // ---------- الرياضات المخصصة ----------
  function getAllSports() { return [...DEFAULT_SPORTS, ...customSports]; }
  
  function getSportOptions(selected = '') {
    return getAllSports().map(sport => {
      let display = sport;
      if (sport === 'football') display = '⚽ كرة قدم';
      else if (sport === 'basketball') display = '🏀 سلة';
      else if (sport === 'tennis') display = '🎾 تنس';
      else if (sport === 'padel') display = '🏓 بادل';
      else display = `🏅 ${sport}`;
      return `<option value="${sport}" ${sport === selected ? 'selected' : ''}>${display}</option>`;
    }).join('');
  }
  
  function populateSportSelects() {
    const sportFilter = document.getElementById('sportFilter');
    const courtSportSelect = document.getElementById('courtSport');
    const coachSportSelect = document.getElementById('coachSport');
    
    if (sportFilter) sportFilter.innerHTML = `<option value="all">جميع الرياضات</option>` + getSportOptions();
    if (courtSportSelect) courtSportSelect.innerHTML = getSportOptions();
    if (coachSportSelect) coachSportSelect.innerHTML = getSportOptions();
    
    const multiContainer = document.getElementById('multiSportCheckboxes');
    if (multiContainer) {
      multiContainer.innerHTML = getAllSports().map(sport => `
        <label style="display:block;"><input type="checkbox" value="${sport}"> ${getSportDisplayName(sport)}</label>
      `).join('');
    }
  }
  
  async function addCustomSport(sportName) {
    if (!sportName || sportName.trim() === '') return false;
    const trimmed = sanitizeInput(sportName.trim().toLowerCase());
    if (getAllSports().includes(trimmed)) { showToast('هذه الرياضة موجودة بالفعل', false); return false; }
    customSports.push(trimmed);
    await api.saveCustomSports(customSports);
    populateSportSelects();
    showToast(`تمت إضافة رياضة "${trimmed}"`);
    return true;
  }

  function getSportDisplayName(sport) {
    const map = { 'football':'⚽ كرة قدم', 'basketball':'🏀 سلة', 'tennis':'🎾 تنس', 'padel':'🏓 بادل' };
    return map[sport] || `🏅 ${sport}`;
  }

  // ---------- الإشعارات ----------
  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }
  
  function addNotification(userId, message, type = 'info', relatedId = null) {
    const notif = { 
      id: Date.now() + '' + Math.random(), 
      userId, 
      message: sanitizeInput(message), 
      type, 
      relatedId, 
      read: false, 
      timestamp: new Date().toISOString() 
    };
    notifications.push(notif);
    api.saveNotifications(notifications);
    updateNotificationBadge();
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SportBook', { body: message, icon: 'https://cdn-icons-png.flaticon.com/512/889/889455.png' });
    }
  }
  
  function getUnreadCount(userId) { return notifications.filter(n => n.userId === userId && !n.read).length; }
  
  function updateNotificationBadge() {
    if (!currentUser) return;
    const badge = document.getElementById('notificationBadge');
    if (badge) { 
      const count = getUnreadCount(currentUser.id); 
      badge.textContent = count > 0 ? count : ''; 
    }
  }
  
  function openNotifications() {
    if (!currentUser) return;
    const list = document.getElementById('notificationsList');
    const userNotifs = notifications.filter(n => n.userId === currentUser.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    if (!userNotifs.length) { 
      list.innerHTML = '<p>لا توجد إشعارات</p>'; 
    } else {
      list.innerHTML = userNotifs.map(n => `
        <div style="padding:8px; border-bottom:1px solid #eee; ${n.read ? '' : 'background:#f0f9ff;'}">
          ${n.message}<br><small>${new Date(n.timestamp).toLocaleString()}</small>
        </div>
      `).join('');
      userNotifs.forEach(n => { if (!n.read) n.read = true; });
      api.saveNotifications(notifications);
    }
    document.getElementById('notificationsModal').style.visibility = 'visible';
    updateNotificationBadge();
  }

  function sendWhatsAppMessage(phone, message) {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  }

  // ---------- نظام الكوبونات ----------
  function validatePromoCode(code, applicableTo = null, targetId = null) {
    const promo = promoCodes.find(p => p.code === code.toUpperCase());
    if (!promo) return { valid: false, reason: 'الكود غير صالح' };
    
    const now = new Date();
    if (promo.validFrom && new Date(promo.validFrom) > now) return { valid: false, reason: 'الكود لم يعد صالحاً' };
    if (promo.validUntil && new Date(promo.validUntil) < now) return { valid: false, reason: 'انتهت صلاحية الكود' };
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return { valid: false, reason: 'تم استنفاذ الكود' };
    
    if (promo.applicableTo && promo.applicableTo !== 'all') {
      if (applicableTo && applicableTo !== promo.applicableTo) return { valid: false, reason: 'الكود غير صالح لهذا النوع' };
      if (targetId && promo.targetIds && !promo.targetIds.includes(targetId)) return { valid: false, reason: 'الكود غير صالح لهذا العنصر' };
    }
    
    return { valid: true, promo };
  }

  function applyPromoToTotal(total, promo) {
    if (promo.discountType === 'percentage') {
      return total * (1 - promo.discountValue / 100);
    } else {
      return Math.max(0, total - promo.discountValue);
    }
  }

  // ---------- سلة الحجوزات (محسنة مع دعم الكوبونات والحجوزات المتكررة) ----------
  async function loadCart() {
    cart = await api.getCart();
    updateCartUI();
  }
  
  function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItemsList');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutCartBtn');
    
    cartCount.textContent = cart.length;
    const symbol = getCurrencySymbol(currentCurrency);
    
    if (cart.length === 0) {
      cartItems.innerHTML = '<p>السلة فارغة</p>';
      cartTotal.textContent = '0';
      checkoutBtn.disabled = true;
      return;
    }
    
    let total = 0;
    let html = '';
    cart.forEach((item, index) => {
      let itemTotal = 0;
      let displayText = '';
      if (item.type === 'court') {
        const court = courts.find(c => c.id === item.courtId);
        const venue = venues.find(v => v.id === item.venueId);
        if (court) {
          itemTotal = calculateBookingPrice(court, item.date, item.time, item.duration);
        }
        displayText = `🏟️ ${court?.name || item.courtName} (${venue?.name || item.venueName})`;
      } else {
        const coach = coaches.find(c => c.id === item.coachId);
        if (coach) {
          itemTotal = coach.hourlyRate * item.duration;
        }
        displayText = `👤 ${coach?.name || item.coachName}`;
      }
      total += itemTotal;
      html += `<div class="cart-item">
        <div><strong>${displayText}</strong><br>${item.date} ${item.time} (${item.duration} ساعة) - ${itemTotal} ${symbol}</div>
        <button onclick="window.removeFromCart(${index})"><i class="fas fa-trash"></i></button>
      </div>`;
    });
    
    cartItems.innerHTML = html;
    cartTotal.textContent = total.toFixed(2);
    checkoutBtn.disabled = false;
  }
  
  window.removeFromCart = async function(index) {
    cart.splice(index, 1);
    await api.saveCart(cart);
    updateCartUI();
    showToast('تمت إزالة العنصر من السلة');
  };
  
  async function addToCart(bookingData) {
    // التحقق من التعارض
    if (bookingData.type === 'court') {
      const conflict = bookings.some(b => 
        b.courtId === bookingData.courtId && b.date === bookingData.date && b.status !== 'cancelled' &&
        ((bookingData.time >= b.time && bookingData.time < addMinutes(b.time, b.duration)) || 
         (addMinutes(bookingData.time, bookingData.duration) > b.time && bookingData.time < addMinutes(b.time, b.duration)))
      );
      if (conflict) { showToast('يوجد تعارض مع حجز آخر في هذا الملعب', false); return false; }
      
      const court = courts.find(c => c.id === bookingData.courtId);
      const venue = venues.find(v => v.id === court.venueId);
      const hour = parseInt(bookingData.time.split(':')[0]);
      if (!isWithinWorkingHours(venue, bookingData.date, hour)) {
        showToast('الوقت المحدد خارج ساعات عمل المنشأة', false);
        return false;
      }
      if (isBlackedOut('court', court.id, bookingData.date, hour)) {
        showToast('الملعب مغلق للصيانة في هذا الوقت', false);
        return false;
      }
    } else {
      const conflict = coachBookings.some(b => 
        b.coachId === bookingData.coachId && b.date === bookingData.date && b.status !== 'cancelled' &&
        ((bookingData.time >= b.time && bookingData.time < addMinutes(b.time, b.duration)) || 
         (addMinutes(bookingData.time, bookingData.duration) > b.time && bookingData.time < addMinutes(b.time, b.duration)))
      );
      if (conflict) { showToast('يوجد تعارض مع جلسة أخرى للمدرب', false); return false; }
      
      const hour = parseInt(bookingData.time.split(':')[0]);
      if (!isWithinCoachWorkingHours(bookingData.coachId, bookingData.date, hour)) {
        showToast('الوقت المحدد خارج ساعات عمل المدرب', false);
        return false;
      }
      if (isBlackedOut('coach', bookingData.coachId, bookingData.date, hour)) {
        showToast('المدرب غير متاح في هذا الوقت', false);
        return false;
      }
    }
    
    const cartItem = {
      ...bookingData,
      id: Date.now() + '' + Math.random().toString(36)
    };
    cart.push(cartItem);
    await api.saveCart(cart);
    updateCartUI();
    showToast('تمت إضافة الحجز إلى السلة');
    return true;
  }
  
  async function checkoutCart() {
    if (cart.length === 0) return;
    if (!currentUser) {
      showToast('يجب تسجيل الدخول أولاً', false);
      openAuthModal('login');
      return;
    }

    // التحقق من توفر جميع العناصر وعدم وجود تعارض
    for (const item of cart) {
      if (item.type === 'court') {
        const court = courts.find(c => c.id === item.courtId);
        if (!court) {
          showToast(`الملعب ${item.courtName} لم يعد متاحاً`, false);
          return;
        }
        const conflict = bookings.some(b => 
          b.courtId === item.courtId && b.date === item.date && b.status !== 'cancelled' &&
          ((item.time >= b.time && item.time < addMinutes(b.time, b.duration)) || 
           (addMinutes(item.time, item.duration) > b.time && item.time < addMinutes(b.time, b.duration)))
        );
        if (conflict) {
          showToast(`يوجد تعارض في حجز ${item.courtName}`, false);
          return;
        }
      } else {
        const coach = coaches.find(c => c.id === item.coachId);
        if (!coach) {
          showToast(`المدرب ${item.coachName} لم يعد متاحاً`, false);
          return;
        }
        const conflict = coachBookings.some(b => 
          b.coachId === item.coachId && b.date === item.date && b.status !== 'cancelled' &&
          ((item.time >= b.time && item.time < addMinutes(b.time, b.duration)) || 
           (addMinutes(item.time, item.duration) > b.time && item.time < addMinutes(b.time, b.duration)))
        );
        if (conflict) {
          showToast(`يوجد تعارض في جلسة ${item.coachName}`, false);
          return;
        }
      }
    }

    const total = cart.reduce((sum, item) => {
      if (item.type === 'court') {
        const court = courts.find(c => c.id === item.courtId);
        return sum + (court ? calculateBookingPrice(court, item.date, item.time, item.duration) : 0);
      } else {
        const coach = coaches.find(c => c.id === item.coachId);
        return sum + (coach ? coach.hourlyRate * item.duration : 0);
      }
    }, 0);

    pendingBooking = { 
      items: cart, 
      total: total, 
      appFee: total * 0.15, 
      customerId: currentUser.id, 
      customerName: currentUser.name 
    };

    document.getElementById('bookingModal').style.visibility = 'hidden';
    showPaymentModal(pendingBooking);
  }

  // ---------- تحديث الواجهة ----------
  async function refreshData() {
    showLoader();
    venues = await api.getVenues();
    bookings = await api.getBookings();
    users = await api.getUsers();
    notifications = await api.getNotifications();
    customSports = await api.getCustomSports();
    reviews = await api.getReviews();
    blackouts = await api.getBlackouts();
    courts = await api.getCourts();
    coaches = await api.getCoaches();
    coachBookings = await api.getCoachBookings();
    coachAvailability = await api.getCoachAvailability();
    coachReviews = await api.getCoachReviews();
    promoCodes = await api.getPromoCodes();
    favorites = await api.getFavorites();
    recurringGroups = await api.getRecurringGroups();
    pendingPayments = await api.getPendingPayments();
    currentUser = await api.getSession();
    await loadCart();
    populateSportSelects();
    updateUIBasedOnRole();
    hideLoader();
    requestNotificationPermission();
    startPendingPaymentChecker();
  }

  function updateUIBasedOnRole() {
    updateUserArea();
    updateNavigation();
    updateNotificationBadge();
    document.getElementById('customerBookingsSection').style.display = currentUser?.role === 'customer' ? 'block' : 'none';
    if (currentUser?.role === 'customer') renderCustomerBookings();
  }

  function updateUserArea() {
    if (currentUser) {
      let roleText = currentUser.role === 'admin' ? t('admin') : (currentUser.role === 'venue' ? t('venue') : (currentUser.role === 'coach' ? t('coach') : t('customer')));
      const unread = getUnreadCount(currentUser.id);
      userArea.innerHTML = `
        <button class="btn-sm" id="notificationsBtn"><i class="fas fa-bell"></i> ${unread > 0 ? `<span id="notificationBadge" class="notification-badge">${unread}</span>` : ''}</button>
        <div class="user-info"><i class="fas fa-user"></i> ${sanitizeInput(currentUser.name)} (${roleText})</div>
        <button class="btn-sm" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> ${t('logout')}</button>
      `;
      document.getElementById('logoutBtn').addEventListener('click', logout);
      document.getElementById('notificationsBtn').addEventListener('click', openNotifications);
    } else {
      userArea.innerHTML = `<div class="auth-buttons"><button class="btn-sm" id="showLoginBtn"><i class="fas fa-sign-in-alt"></i> ${t('login')}</button><button class="btn-sm" id="showRegisterBtn"><i class="fas fa-user-plus"></i> ${t('register')}</button></div>`;
      document.getElementById('showLoginBtn')?.addEventListener('click', () => openAuthModal('login'));
      document.getElementById('showRegisterBtn')?.addEventListener('click', () => openAuthModal('register'));
    }
  }

  function updateNavigation() {
    let navHtml = '';
    if (!currentUser) navHtml = `<button class="nav-btn active" data-section="home"><i class="fas fa-home"></i> ${t('home')}</button>`;
    else if (currentUser.role === 'customer') navHtml = `<button class="nav-btn active" data-section="home"><i class="fas fa-home"></i> ${t('home')}</button><button class="nav-btn" data-section="profile"><i class="fas fa-user"></i> ${t('profile')}</button><button class="nav-btn" data-section="favorites"><i class="fas fa-heart"></i> ${t('favorites')}</button>`;
    else if (currentUser.role === 'venue') navHtml = `<button class="nav-btn" data-section="home"><i class="fas fa-home"></i> ${t('home')}</button><button class="nav-btn" data-section="registerVenue"><i class="fas fa-plus-circle"></i> ${t('registerVenue')}</button><button class="nav-btn active" data-section="venueDashboard"><i class="fas fa-calendar-alt"></i> ${t('venueDashboard')}</button><button class="nav-btn" data-section="profile"><i class="fas fa-user"></i> ${t('profile')}</button>`;
    else if (currentUser.role === 'coach') navHtml = `<button class="nav-btn" data-section="home"><i class="fas fa-home"></i> ${t('home')}</button><button class="nav-btn" data-section="registerCoach"><i class="fas fa-plus-circle"></i> ${t('registerCoach')}</button><button class="nav-btn active" data-section="coachDashboard"><i class="fas fa-chalkboard-user"></i> ${t('coachDashboard')}</button><button class="nav-btn" data-section="profile"><i class="fas fa-user"></i> ${t('profile')}</button>`;
    else if (currentUser.role === 'admin') navHtml = `<button class="nav-btn" data-section="home"><i class="fas fa-home"></i> ${t('home')}</button><button class="nav-btn" data-section="registerVenue"><i class="fas fa-plus-circle"></i> ${t('registerVenue')}</button><button class="nav-btn" data-section="registerCoach"><i class="fas fa-plus-circle"></i> ${t('registerCoach')}</button><button class="nav-btn" data-section="venueDashboard"><i class="fas fa-calendar-alt"></i> ${t('venueDashboard')}</button><button class="nav-btn" data-section="coachDashboard"><i class="fas fa-chalkboard-user"></i> ${t('coachDashboard')}</button><button class="nav-btn active" data-section="adminDashboard"><i class="fas fa-user-shield"></i> ${t('adminDashboard')}</button><button class="nav-btn" data-section="profile"><i class="fas fa-user"></i> ${t('profile')}</button><button class="nav-btn" data-section="analytics"><i class="fas fa-chart-bar"></i> ${t('analytics')}</button>`;
    mainNav.innerHTML = navHtml;
    document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => switchSection(btn.dataset.section)));
  }

  async function logout() {
    await api.clearSession();
    currentUser = null;
    customerLocation = null;
    cart = [];
    await api.saveCart(cart);
    updateUIBasedOnRole();
    switchSection('home');
    showToast('تم تسجيل الخروج');
  }

  function switchSection(sectionId) {
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');
    if (sectionId === 'home') { 
      if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
      if (map) setTimeout(() => map.invalidateSize(), 100); 
    }
    else if (sectionId === 'venueDashboard') loadVenueDashboard();
    else if (sectionId === 'coachDashboard') loadCoachDashboard();
    else if (sectionId === 'adminDashboard') loadAdminDashboard('venues');
    else if (sectionId === 'registerVenue') initRegisterMiniMap();
    else if (sectionId === 'registerCoach') initCoachRegisterMap();
    else if (sectionId === 'profile') loadProfilePage();
    else if (sectionId === 'favorites') loadFavoritesPage();
    else if (sectionId === 'analytics') loadAnalyticsDashboard();
  }

  // ---------- تأكيد عام ----------
  function showConfirm(msg, cb) { 
    document.getElementById('confirmMessage').textContent = msg; 
    pendingConfirmCallback = cb; 
    document.getElementById('confirmModal').style.visibility = 'visible'; 
  }
  
  document.getElementById('confirmOkBtn').addEventListener('click', () => { 
    if (pendingConfirmCallback) pendingConfirmCallback(); 
    document.getElementById('confirmModal').style.visibility = 'hidden'; 
    pendingConfirmCallback = null; 
  });
  
  document.getElementById('confirmCancelBtn').addEventListener('click', () => { 
    document.getElementById('confirmModal').style.visibility = 'hidden'; 
    pendingConfirmCallback = null; 
  });

  // ---------- مصادقة ----------
  function openAuthModal(mode) {
    document.getElementById('authMode').value = mode;
    document.getElementById('authModalTitle').textContent = mode === 'login' ? t('login') : t('register');
    document.getElementById('authNameGroup').style.display = mode === 'register' ? 'block' : 'none';
    const phoneGroup = document.getElementById('authPhoneGroup');
    if (phoneGroup) phoneGroup.style.display = mode === 'register' ? 'block' : 'none';
    document.getElementById('authModal').style.visibility = 'visible';
  }
  
  document.getElementById('authRole').addEventListener('change', e => {
    document.getElementById('adminCodeGroup').style.display = e.target.value === 'admin' ? 'block' : 'none';
  });
  
  document.getElementById('authForm').addEventListener('submit', async e => {
    e.preventDefault();
    const mode = document.getElementById('authMode').value;
    const email = sanitizeInput(document.getElementById('authEmail').value.trim());
    const password = document.getElementById('authPassword').value;
    const role = document.getElementById('authRole').value;
    const name = sanitizeInput(document.getElementById('authName')?.value.trim() || email.split('@')[0]);
    const phone = document.getElementById('authPhone')?.value.trim() || '';
    if (role === 'admin' && document.getElementById('adminCode')?.value !== ADMIN_CODE) {
      return showToast('رمز الأدمن غير صحيح', false);
    }
    showLoader();
    let usersList = await api.getUsers();
    if (mode === 'register') {
      if (usersList.find(u => u.email === email)) { hideLoader(); return showToast('البريد مسجل مسبقاً', false); }
      const newUser = { 
        id: Date.now() + '', 
        email, 
        password, 
        role, 
        name, 
        phone, 
        blocked: false,
        profileImage: '',
        createdAt: new Date().toISOString()
      };
      usersList.push(newUser);
      await api.saveUsers(usersList);
      await api.setSession(newUser);
      currentUser = newUser;
      showToast('تم إنشاء الحساب');
    } else {
      const user = usersList.find(u => u.email === email && u.password === password);
      if (!user) { hideLoader(); return showToast('بيانات خاطئة', false); }
      if (user.blocked) { hideLoader(); return showToast('هذا الحساب محظور', false); }
      await api.setSession(user);
      currentUser = user;
      showToast(`${t('welcome')} ${user.name}`);
    }
    document.getElementById('authModal').style.visibility = 'hidden';
    await refreshData();
    if (currentUser.role === 'admin') switchSection('adminDashboard');
    else if (currentUser.role === 'venue') switchSection('venueDashboard');
    else if (currentUser.role === 'coach') switchSection('coachDashboard');
    else switchSection('home');
    hideLoader();
  });
  
  document.getElementById('switchAuthModeBtn').addEventListener('click', () => { 
    openAuthModal(document.getElementById('authMode').value === 'login' ? 'register' : 'login'); 
  });
  
  document.getElementById('closeAuthModal').addEventListener('click', () => {
    document.getElementById('authModal').style.visibility = 'hidden';
  });
  
    // ---------- GPS ----------
  document.getElementById('getCustomerLocationBtn')?.addEventListener('click', () => {
    if (!navigator.geolocation) return showToast('متصفحك لا يدعم GPS', false);
    navigator.geolocation.getCurrentPosition(pos => {
      customerLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      showToast('تم تحديد موقعك');
      if (map) { map.setView([customerLocation.lat, customerLocation.lng], 15); updateMapMarkers(); }
      if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
    }, () => showToast('فشل تحديد الموقع', false));
  });

  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  
  function calculateTravelTime(dist) { return Math.round(dist / 80 * 60); }

  // ---------- عرض الملاعب والمدربين (مع أيقونات المفضلة) ----------
  function isFavorite(type, id) {
    if (!currentUser) return false;
    return favorites.some(f => f.userId === currentUser.id && f.itemType === type && f.itemId === id);
  }

  async function toggleFavorite(type, id) {
    if (!currentUser) {
      showToast('يجب تسجيل الدخول للإضافة إلى المفضلة', false);
      return;
    }
    const existing = favorites.findIndex(f => f.userId === currentUser.id && f.itemType === type && f.itemId === id);
    if (existing > -1) {
      favorites.splice(existing, 1);
      showToast('تمت الإزالة من المفضلة');
    } else {
      favorites.push({ userId: currentUser.id, itemType: type, itemId: id });
      showToast('تمت الإضافة إلى المفضلة');
    }
    await api.saveFavorites(favorites);
    if (currentViewMode === 'courts') renderCourts(document.getElementById('sportFilter').value);
    else renderCoaches(document.getElementById('sportFilter').value);
  }

  async function renderCourts(filterSport = 'all') {
    const container = document.getElementById('venuesList');
    const filteredCourts = courts.filter(c => {
      if (filterSport === 'all') return true;
      if (c.multiSport) return c.allowedSports.includes(filterSport);
      return c.sport === filterSport;
    });
    
    if (!filteredCourts.length) { container.innerHTML = '<div class="card">لا توجد ملاعب متاحة</div>'; return; }
    
    let html = '';
    const currencySymbol = getCurrencySymbol(currentCurrency);
    const today = new Date().toISOString().split('T')[0];
    
    let sortedCourts = [...filteredCourts];
    if (customerLocation) {
      sortedCourts.sort((a, b) => {
        const venueA = venues.find(v => v.id === a.venueId);
        const venueB = venues.find(v => v.id === b.venueId);
        if (!venueA?.lat || !venueB?.lat) return 0;
        const distA = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, venueA.lat, venueA.lng);
        const distB = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, venueB.lat, venueB.lng);
        return distA - distB;
      });
    }
    
    for (let court of sortedCourts) {
      const venue = venues.find(v => v.id === court.venueId);
      if (!venue) continue;
      
      let distInfo = '';
      if (customerLocation && venue.lat) {
        const dist = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, venue.lat, venue.lng).toFixed(1);
        distInfo = `<div class="venue-distance"><i class="fas fa-route"></i> يبعد ${dist} كم (${calculateTravelTime(parseFloat(dist))} دقيقة)</div>`;
      }
      
      const minPrice = court.pricing ? Math.min(...court.pricing) : (venue.pricing ? Math.min(...venue.pricing) : 50);
      let sportDisplay = court.multiSport ? court.allowedSports.map(s => getSportDisplayName(s)).join(' / ') : getSportDisplayName(court.sport);
      
      const venueReviews = reviews[venue.id] || [];
      const avgRating = venueReviews.length > 0 ? (venueReviews.reduce((s, r) => s + r.rating, 0) / venueReviews.length).toFixed(1) : '0.0';
      const starsHtml = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
      
      const avail = getAvailableHoursForCourt(court, today);
      const availText = avail.total > 0 ? `🟢 ${avail.available} ساعة متاحة` : '⚪ لا توجد فترات';
      
      const favClass = isFavorite('venue', venue.id) ? 'fas' : 'far';
      
      html += `<div class="venue-card">
        <div class="venue-img" style="background-image:url('${venue.image || 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=600'}');">
          <span class="venue-type">${sportDisplay}</span>
          <button class="favorite-btn" onclick="window.toggleFavorite('venue', '${venue.id}')" style="position:absolute; top:12px; left:12px; background:white; border:none; border-radius:50%; width:32px; height:32px; cursor:pointer;">
            <i class="${favClass} fa-heart" style="color:#ef4444;"></i>
          </button>
        </div>
        <div class="venue-info">
          <div class="venue-header"><div class="venue-name">${sanitizeInput(court.name)}</div><div class="venue-availability-badge">${availText}</div></div>
          <div style="color:#64748b; margin-bottom:8px;">${sanitizeInput(venue.name)}</div>
          <div class="venue-rating"><span style="color:#fbbf24;">${starsHtml}</span> ${avgRating} (${venueReviews.length} تقييم)</div>
          <div class="venue-desc">${sanitizeInput(venue.desc || '')}</div>
          <div><i class="fas fa-phone"></i> ${venue.phone}</div>
          <div class="venue-pricing"><i class="fas fa-tag"></i> من ${minPrice} ${currencySymbol}/ساعة</div>
          ${distInfo}
          <button class="btn btn-primary book-btn" data-court-id="${court.id}" style="margin-top:12px;">احجز الآن</button>
        </div>
      </div>`;
    }
    container.innerHTML = html;
    document.querySelectorAll('.book-btn').forEach(b => b.addEventListener('click', e => openBookingModal(b.dataset.courtId, 'court')));
    updateMapMarkers();
  }

  async function renderCoaches(filterSport = 'all') {
    const container = document.getElementById('venuesList');
    let filteredCoaches = coaches;
    if (filterSport !== 'all') {
      filteredCoaches = coaches.filter(c => c.sport === filterSport);
    }
    
    if (!filteredCoaches.length) { container.innerHTML = '<div class="card">لا يوجد مدربين متاحين</div>'; return; }
    
    let html = '';
    const currencySymbol = getCurrencySymbol(currentCurrency);
    const today = new Date().toISOString().split('T')[0];
    
    let sortedCoaches = [...filteredCoaches];
    if (customerLocation) {
      sortedCoaches.sort((a, b) => {
        if (!a.lat || !b.lat) return 0;
        const distA = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, a.lat, a.lng);
        const distB = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, b.lat, b.lng);
        return distA - distB;
      });
    }
    
    for (let coach of sortedCoaches) {
      let distInfo = '';
      if (customerLocation && coach.lat) {
        const dist = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, coach.lat, coach.lng).toFixed(1);
        distInfo = `<div class="coach-distance"><i class="fas fa-route"></i> يبعد ${dist} كم (${calculateTravelTime(parseFloat(dist))} دقيقة)</div>`;
      }
      
      const coachRatingList = coachReviews[coach.id] || [];
      const avgRating = coachRatingList.length > 0 ? (coachRatingList.reduce((s, r) => s + r.rating, 0) / coachRatingList.length).toFixed(1) : '0.0';
      const starsHtml = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
      
      const avail = getCoachAvailableHours(coach.id, today);
      const availText = avail.total > 0 ? `🟢 ${avail.available} ساعة متاحة` : '⚪ لا توجد فترات';
      
      const favClass = isFavorite('coach', coach.id) ? 'fas' : 'far';
      
      html += `<div class="coach-card">
        <div class="coach-img" style="background-image:url('${coach.image || 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg?auto=compress&cs=tinysrgb&w=600'}');">
          <span class="coach-type">${getSportDisplayName(coach.sport)}</span>
          <button class="favorite-btn" onclick="window.toggleFavorite('coach', '${coach.id}')" style="position:absolute; top:12px; left:12px; background:white; border:none; border-radius:50%; width:32px; height:32px; cursor:pointer;">
            <i class="${favClass} fa-heart" style="color:#ef4444;"></i>
          </button>
        </div>
        <div class="coach-info">
          <div class="coach-header"><div class="coach-name">${sanitizeInput(coach.name)}</div><div class="venue-availability-badge">${availText}</div></div>
          <div class="coach-rating"><span style="color:#fbbf24;">${starsHtml}</span> ${avgRating} (${coachRatingList.length} تقييم)</div>
          <div class="coach-desc">${sanitizeInput(coach.desc || '')}</div>
          <div><i class="fas fa-phone"></i> ${coach.phone}</div>
          <div class="coach-pricing"><i class="fas fa-tag"></i> ${coach.hourlyRate} ${currencySymbol}/ساعة</div>
          ${distInfo}
          <button class="btn btn-primary book-coach-btn" data-coach-id="${coach.id}" style="margin-top:12px;">احجز جلسة</button>
        </div>
      </div>`;
    }
    container.innerHTML = html;
    document.querySelectorAll('.book-coach-btn').forEach(b => b.addEventListener('click', e => openBookingModal(b.dataset.coachId, 'coach')));
    updateMapMarkers();
  }

  window.toggleFavorite = toggleFavorite;

  function updateMapMarkers() {
    if (!map) return;
    map.eachLayer(l => { if (l instanceof L.Marker) map.removeLayer(l); });
    if (currentViewMode === 'courts') {
      venues.forEach(v => { if (v.lat) L.marker([v.lat, v.lng]).addTo(map).bindPopup(sanitizeInput(v.name)); });
    } else {
      coaches.forEach(c => { if (c.lat) L.marker([c.lat, c.lng]).addTo(map).bindPopup(sanitizeInput(c.name)); });
    }
    if (customerLocation) L.marker([customerLocation.lat, customerLocation.lng], { icon: L.divIcon({ html: '📍', iconSize: [20,20] }) }).addTo(map).bindPopup('موقعك');
  }

  // ---------- خريطة التسجيل (منشأة) ----------
  function initRegisterMiniMap() {
    if (miniMap) return;
    miniMap = L.map('registerMiniMap').setView([24.7136, 46.6753], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(miniMap);
    venueMarker = L.marker([24.7136, 46.6753], { draggable: true }).addTo(miniMap);
    function update() { 
      const ll = venueMarker.getLatLng(); 
      document.getElementById('venueLat').value = ll.lat.toFixed(6); 
      document.getElementById('venueLng').value = ll.lng.toFixed(6); 
    }
    venueMarker.on('dragend', update); 
    miniMap.on('click', e => { venueMarker.setLatLng(e.latlng); update(); }); 
    update();
  }
  
  document.getElementById('getVenueLocationBtn')?.addEventListener('click', () => {
    if (!navigator.geolocation) return showToast('GPS غير مدعوم', false);
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      if (miniMap) { miniMap.setView([lat, lng], 15); venueMarker.setLatLng([lat, lng]); }
      document.getElementById('venueLat').value = lat; 
      document.getElementById('venueLng').value = lng; 
      showToast('تم تحديد الموقع');
    }, () => showToast('فشل', false));
  });

  // خريطة تسجيل المدرب
  function initCoachRegisterMap() {
    if (coachMap) return;
    coachMap = L.map('coachRegisterMap').setView([24.7136, 46.6753], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(coachMap);
    coachMarker = L.marker([24.7136, 46.6753], { draggable: true }).addTo(coachMap);
    function update() { 
      const ll = coachMarker.getLatLng(); 
      document.getElementById('coachLat').value = ll.lat.toFixed(6); 
      document.getElementById('coachLng').value = ll.lng.toFixed(6); 
    }
    coachMarker.on('dragend', update); 
    coachMap.on('click', e => { coachMarker.setLatLng(e.latlng); update(); }); 
    update();
  }

  document.getElementById('getCoachLocationBtn')?.addEventListener('click', () => {
    if (!navigator.geolocation) return showToast('GPS غير مدعوم', false);
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      if (coachMap) { coachMap.setView([lat, lng], 15); coachMarker.setLatLng([lat, lng]); }
      document.getElementById('coachLat').value = lat; 
      document.getElementById('coachLng').value = lng; 
      showToast('تم تحديد الموقع');
    }, () => showToast('فشل', false));
  });

  // ---------- دوال الملاعب في التسجيل ----------
  function createCourtField(courtData = null) {
    const container = document.getElementById('courtsListContainer');
    const index = container.children.length;
    const div = document.createElement('div');
    div.className = 'court-item';
    
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <h4>ملعب ${index + 1}</h4>
        <button type="button" class="btn-outline btn-sm remove-court-btn"><i class="fas fa-times"></i></button>
      </div>
      <div class="form-group">
        <label>اسم الملعب</label>
        <input type="text" name="courtName${index}" placeholder="مثال: الملعب الرئيسي" value="${courtData?.name || ''}" required>
      </div>
      <div class="form-group">
        <label>نوع الاستخدام</label>
        <select name="courtType${index}" class="court-type-select">
          <option value="single" ${!courtData?.multiSport ? 'selected' : ''}>رياضة واحدة</option>
          <option value="multi" ${courtData?.multiSport ? 'selected' : ''}>متعدد الرياضات</option>
        </select>
      </div>
      <div class="single-sport-group" style="${courtData?.multiSport ? 'display:none;' : ''}">
        <label>نوع الرياضة</label>
        <select name="courtSport${index}">${getSportOptions(courtData?.sport)}</select>
      </div>
      <div class="multi-sport-group" style="${courtData?.multiSport ? '' : 'display:none;'}">
        <label>الرياضات المسموحة</label>
        <div class="checkbox-group">
          ${getAllSports().map(sport => `
            <label style="display:block;"><input type="checkbox" name="allowedSport${index}" value="${sport}" ${courtData?.allowedSports?.includes(sport) ? 'checked' : ''}> ${getSportDisplayName(sport)}</label>
          `).join('')}
        </div>
      </div>
      <div class="form-group">
        <label><input type="checkbox" name="useCustomPricing${index}" ${courtData?.pricing ? 'checked' : ''}> تسعير خاص بهذا الملعب</label>
      </div>
      <div class="custom-pricing-group" style="${courtData?.pricing ? '' : 'display:none;'}">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div><label>ف1</label><input type="number" name="price1_${index}" min="0" value="${courtData?.pricing?.[0] || 40}" step="5"></div>
          <div><label>ف2</label><input type="number" name="price2_${index}" min="0" value="${courtData?.pricing?.[1] || 50}" step="5"></div>
          <div><label>ف3</label><input type="number" name="price3_${index}" min="0" value="${courtData?.pricing?.[2] || 60}" step="5"></div>
          <div><label>ف4</label><input type="number" name="price4_${index}" min="0" value="${courtData?.pricing?.[3] || 70}" step="5"></div>
        </div>
      </div>
    `;
    
    container.appendChild(div);
    
    const typeSelect = div.querySelector('.court-type-select');
    const pricingCheck = div.querySelector(`[name="useCustomPricing${index}"]`);
    const pricingGroup = div.querySelector('.custom-pricing-group');
    
    typeSelect.addEventListener('change', (e) => {
      const isMulti = e.target.value === 'multi';
      div.querySelector('.single-sport-group').style.display = isMulti ? 'none' : 'block';
      div.querySelector('.multi-sport-group').style.display = isMulti ? 'block' : 'none';
    });
    
    pricingCheck.addEventListener('change', (e) => {
      pricingGroup.style.display = e.target.checked ? 'block' : 'none';
    });
    
    div.querySelector('.remove-court-btn').addEventListener('click', () => {
      div.remove();
      updateCourtIndices();
    });
  }
  
  function updateCourtIndices() {
    const items = document.querySelectorAll('.court-item');
    items.forEach((item, idx) => {
      item.querySelector('h4').textContent = `ملعب ${idx + 1}`;
    });
  }

  // ---------- تسجيل منشأة ----------
  document.getElementById('registerVenueForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!currentUser || (currentUser.role !== 'venue' && currentUser.role !== 'admin')) return showToast('يجب تسجيل الدخول', false);
    const name = sanitizeInput(document.getElementById('venueName').value.trim());
    const lat = parseFloat(document.getElementById('venueLat').value), lng = parseFloat(document.getElementById('venueLng').value);
    if (!lat || !lng) return showToast('حدد الموقع', false);
    if (venues.some(v => v.name === name)) return showToast('اسم المنشأة موجود مسبقاً', false);
    
    const imageFile = document.getElementById('venueImage').files[0];
    let imageData = '';
    if (imageFile) imageData = await new Promise(r => { 
      const reader = new FileReader(); 
      reader.onload = e => r(e.target.result); 
      reader.readAsDataURL(imageFile); 
    });
    
    const venueId = Date.now() + '';
    const newVenue = {
      id: venueId,
      name,
      phone: document.getElementById('venuePhone').value,
      lat, lng,
      image: imageData,
      desc: sanitizeInput(document.getElementById('venueDesc').value),
      ownerId: currentUser.id,
      pricing: [
        +document.getElementById('pricePeriod1').value,
        +document.getElementById('pricePeriod2').value,
        +document.getElementById('pricePeriod3').value,
        +document.getElementById('pricePeriod4').value
      ],
      workingHours: null,
      requiresApproval: false
    };
    venues.push(newVenue);
    await api.saveVenues(venues);
    
    const newCourts = [];
    const courtItems = document.querySelectorAll('.court-item');
    courtItems.forEach((item, idx) => {
      const type = item.querySelector(`[name="courtType${idx}"]`).value;
      const courtName = item.querySelector(`[name="courtName${idx}"]`).value || `ملعب ${idx+1}`;
      const court = {
        id: `${venueId}-court${idx}-${Date.now()}`,
        venueId: venueId,
        name: sanitizeInput(courtName),
        multiSport: type === 'multi',
        sport: type === 'single' ? item.querySelector(`[name="courtSport${idx}"]`).value : null,
        allowedSports: type === 'multi' ? 
          Array.from(item.querySelectorAll(`[name="allowedSport${idx}"]:checked`)).map(cb => cb.value) : [],
        pricing: null
      };
      
      const useCustom = item.querySelector(`[name="useCustomPricing${idx}"]`).checked;
      if (useCustom) {
        court.pricing = [
          +item.querySelector(`[name="price1_${idx}"]`).value,
          +item.querySelector(`[name="price2_${idx}"]`).value,
          +item.querySelector(`[name="price3_${idx}"]`).value,
          +item.querySelector(`[name="price4_${idx}"]`).value
        ];
      }
      newCourts.push(court);
    });
    
    courts.push(...newCourts);
    await api.saveCourts(courts);
    
    showToast('تم تسجيل المنشأة والملاعب بنجاح');
    document.getElementById('registerVenueForm').reset();
    document.getElementById('courtsListContainer').innerHTML = '';
    createCourtField();
    if (miniMap) { miniMap.setView([24.7136, 46.6753], 13); venueMarker.setLatLng([24.7136, 46.6753]); }
    switchSection(currentUser.role === 'admin' ? 'adminDashboard' : 'venueDashboard');
  });

  document.addEventListener('click', (e) => {
    if (e.target.id === 'addCourtBtn' || e.target.closest('#addCourtBtn')) {
      e.preventDefault();
      createCourtField();
    }
  });

  // تسجيل مدرب خصوصي
  document.getElementById('registerCoachForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!currentUser || (currentUser.role !== 'coach' && currentUser.role !== 'admin')) return showToast('يجب تسجيل الدخول كمدرب', false);
    const name = sanitizeInput(document.getElementById('coachName').value.trim());
    const lat = parseFloat(document.getElementById('coachLat').value), lng = parseFloat(document.getElementById('coachLng').value);
    if (!lat || !lng) return showToast('حدد الموقع', false);
    if (coaches.some(c => c.name === name)) return showToast('اسم المدرب موجود مسبقاً', false);
    
    const imageFile = document.getElementById('coachImage').files[0];
    let imageData = '';
    if (imageFile) imageData = await new Promise(r => { 
      const reader = new FileReader(); 
      reader.onload = e => r(e.target.result); 
      reader.readAsDataURL(imageFile); 
    });
    
    const coachId = Date.now() + '';
    const newCoach = {
      id: coachId,
      name,
      phone: document.getElementById('coachPhone').value,
      lat, lng,
      image: imageData,
      desc: sanitizeInput(document.getElementById('coachDesc').value),
      sport: document.getElementById('coachSport').value,
      hourlyRate: +document.getElementById('coachHourlyRate').value,
      ownerId: currentUser.id
    };
    coaches.push(newCoach);
    await api.saveCoaches(coaches);
    
    coachAvailability[coachId] = {};
    await api.saveCoachAvailability(coachAvailability);
    
    showToast('تم تسجيل المدرب بنجاح');
    document.getElementById('registerCoachForm').reset();
    if (coachMap) { coachMap.setView([24.7136, 46.6753], 13); coachMarker.setLatLng([24.7136, 46.6753]); }
    switchSection(currentUser.role === 'admin' ? 'adminDashboard' : 'coachDashboard');
  });
  
    // ---------- دوال ساعات العمل (للتعديل) ----------
  function renderWorkingHoursEditor(workingHours) {
    const container = document.getElementById('workingHoursContainer');
    if (!container) return;
    let html = '';
    WEEKDAYS.forEach(day => {
      const dayData = workingHours && workingHours[day.key] ? workingHours[day.key] : { start: '', end: '' };
      html += `
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="width:80px;">${day.label}</span>
          <input type="time" id="wh_${day.key}_start" value="${dayData.start || ''}" placeholder="بداية" style="width:120px;">
          <span>-</span>
          <input type="time" id="wh_${day.key}_end" value="${dayData.end || ''}" placeholder="نهاية" style="width:120px;">
          <small style="color:#64748b;">(24 ساعة إذا تُرك فارغاً)</small>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  function collectWorkingHoursFromEditor() {
    const workingHours = {};
    WEEKDAYS.forEach(day => {
      const start = document.getElementById(`wh_${day.key}_start`)?.value || '';
      const end = document.getElementById(`wh_${day.key}_end`)?.value || '';
      if (start && end) {
        workingHours[day.key] = { start, end };
      } else {
        workingHours[day.key] = null;
      }
    });
    return workingHours;
  }

  // محرر ساعات عمل المدرب
  function renderCoachWorkingHoursEditor(coachId) {
    const container = document.getElementById('coachWorkingHoursContainer');
    if (!container) return;
    const availability = coachAvailability[coachId] || {};
    let html = '';
    WEEKDAYS.forEach(day => {
      const dayData = availability[day.key] || { start: '', end: '' };
      html += `
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="width:80px;">${day.label}</span>
          <input type="time" id="coach_wh_${day.key}_start" value="${dayData.start || ''}" placeholder="بداية" style="width:120px;">
          <span>-</span>
          <input type="time" id="coach_wh_${day.key}_end" value="${dayData.end || ''}" placeholder="نهاية" style="width:120px;">
          <small style="color:#64748b;">(24 ساعة إذا تُرك فارغاً)</small>
        </div>
      `;
    });
    container.innerHTML = html;
  }

  function collectCoachWorkingHoursFromEditor() {
    const workingHours = {};
    WEEKDAYS.forEach(day => {
      const start = document.getElementById(`coach_wh_${day.key}_start`)?.value || '';
      const end = document.getElementById(`coach_wh_${day.key}_end`)?.value || '';
      if (start && end) {
        workingHours[day.key] = { start, end };
      } else {
        workingHours[day.key] = null;
      }
    });
    return workingHours;
  }

  // ---------- لوحة تحكم المنشأة (مع دعم قبول/رفض الحجوزات) ----------
  async function loadVenueDashboard() {
    const container = document.getElementById('venueDashboardContent');
    if (!currentUser) return;
    let myVenues = currentUser.role === 'admin' ? venues : venues.filter(v => v.ownerId === currentUser.id);
    if (!myVenues.length) { container.innerHTML = '<p>لا توجد منشآت. <a href="#" onclick="document.querySelector(\'[data-section=registerVenue]\').click()">سجل منشأة</a></p>'; return; }
    let html = '<select id="venueSelectDashboard" class="filter-select"><option>اختر منشأة</option>';
    myVenues.forEach(v => html += `<option value="${v.id}">${sanitizeInput(v.name)}</option>`);
    html += '</select><div id="selectedVenueDetail" style="margin-top:20px;"></div>';
    container.innerHTML = html;
    document.getElementById('venueSelectDashboard').addEventListener('change', e => {
      const venue = myVenues.find(v => v.id === e.target.value);
      if (venue) renderVenueDetailForOwner(venue);
    });
  }

  function renderVenueDetailForOwner(venue) {
    const detail = document.getElementById('selectedVenueDetail');
    const venueBookings = bookings.filter(b => b.venueId === venue.id);
    const venueCourts = courts.filter(c => c.venueId === venue.id);
    const currencySymbol = getCurrencySymbol(currentCurrency);
    
    const totalRevenue = venueBookings.filter(b => b.status === 'confirmed' || b.status === 'مدفوع').reduce((sum, b) => sum + (b.price || 0), 0);
    
    let courtsHtml = venueCourts.map(court => {
      const sportInfo = court.multiSport ? `متعدد: ${court.allowedSports.map(s => getSportDisplayName(s)).join(', ')}` : getSportDisplayName(court.sport);
      return `<div style="border:1px solid #e2e8f0; border-radius:12px; padding:12px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between;">
          <strong>${sanitizeInput(court.name)}</strong>
          <span>${sportInfo}</span>
        </div>
        <div style="margin-top:8px;">
          <button class="btn-outline btn-sm edit-court-btn" data-court-id="${court.id}">تعديل</button>
          <button class="btn-outline btn-sm delete-court-btn" data-court-id="${court.id}">حذف</button>
          <button class="btn-outline btn-sm blackout-court-btn" data-court-id="${court.id}"><i class="fas fa-ban"></i> إغلاق</button>
        </div>
      </div>`;
    }).join('');
    
    let bookingsHtml = '';
    const pendingBookings = venueBookings.filter(b => b.status === 'pending');
    const activeBookings = venueBookings.filter(b => b.status === 'confirmed' || b.status === 'مدفوع');
    
    if (venue.requiresApproval) {
      bookingsHtml += `<h4>حجوزات بانتظار الموافقة (${pendingBookings.length})</h4>`;
      bookingsHtml += pendingBookings.map(b => {
        const court = courts.find(c => c.id === b.courtId);
        const customer = users.find(u => u.id === b.customerId);
        return `<div style="border:1px solid #fbbf24; border-radius:12px; padding:12px; margin-bottom:8px; background:#fef3c7;">
          <div><strong>${sanitizeInput(b.customerName)}</strong> (${customer?.email || ''})</div>
          <div>ملعب: ${court?.name || 'غير محدد'} | ${b.date} | ${b.time} (${b.duration} ساعة) | ${b.price} ${currencySymbol}</div>
          <div class="booking-actions">
            <button class="btn-outline btn-sm approve-booking-btn" data-id="${b.id}" style="background:#10b981; color:white;">قبول</button>
            <button class="btn-outline btn-sm reject-booking-btn" data-id="${b.id}" style="background:#ef4444; color:white;">رفض</button>
          </div>
        </div>`;
      }).join('');
    }
    
    bookingsHtml += `<h4>الحجوزات النشطة (${activeBookings.length})</h4>`;
    bookingsHtml += activeBookings.map(b => {
      const court = courts.find(c => c.id === b.courtId);
      const customer = users.find(u => u.id === b.customerId);
      return `<div style="border:1px solid #e2e8f0; border-radius:12px; padding:12px; margin-bottom:8px;">
        <div><strong>${sanitizeInput(b.customerName)}</strong> (${customer?.email || ''})</div>
        <div>ملعب: ${court?.name || 'غير محدد'} | ${b.date} | ${b.time} (${b.duration} ساعة) | ${b.price} ${currencySymbol}</div>
        <div class="booking-actions">
          <button class="btn-outline btn-sm edit-booking-btn" data-id="${b.id}"><i class="fas fa-edit"></i> تعديل</button>
          <button class="btn-outline btn-sm cancel-booking-btn" data-id="${b.id}"><i class="fas fa-times"></i> إلغاء</button>
          ${customer?.phone ? `<a class="whatsapp-link btn-outline btn-sm" href="#" data-phone="${customer.phone}" data-name="${b.customerName}" data-action="تعديل"><i class="fab fa-whatsapp"></i> واتساب</a>` : ''}
        </div>
      </div>`;
    }).join('');
    
    let workingHoursHtml = '';
    if (venue.workingHours) {
      workingHoursHtml = '<div class="card" style="padding:12px; margin:16px 0;"><strong>ساعات العمل الأسبوعية:</strong><br>';
      WEEKDAYS.forEach(day => {
        const wh = venue.workingHours[day.key];
        if (wh && wh.start && wh.end) {
          workingHoursHtml += `${day.label}: ${wh.start} - ${wh.end}<br>`;
        } else {
          workingHoursHtml += `${day.label}: 24 ساعة<br>`;
        }
      });
      workingHoursHtml += '</div>';
    } else {
      workingHoursHtml = '<div class="card" style="padding:12px; margin:16px 0;"><strong>ساعات العمل:</strong> 24 ساعة طوال الأسبوع</div>';
    }
    
    detail.innerHTML = `
      <div style="display:flex;justify-content:space-between;"><h3>${sanitizeInput(venue.name)}</h3><button class="btn-outline btn-sm edit-venue-btn" data-id="${venue.id}"><i class="fas fa-edit"></i> تعديل</button></div>
      <div class="stats-panel" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:16px 0;">
        <div class="card" style="padding:12px;"><strong>إجمالي الإيرادات:</strong> ${totalRevenue} ${currencySymbol}</div>
        <div class="card" style="padding:12px;"><strong>عدد الملاعب:</strong> ${venueCourts.length}</div>
      </div>
      <div class="card" style="padding:12px; margin-bottom:16px;">
        <label><input type="checkbox" id="requiresApprovalCheck" ${venue.requiresApproval ? 'checked' : ''}> تتطلب الحجوزات موافقة مسبقة</label>
      </div>
      ${workingHoursHtml}
      <div class="courts-panel">
        <h4>الملاعب <button class="btn-outline btn-sm" id="addNewCourtBtn" data-venue-id="${venue.id}"><i class="fas fa-plus"></i> إضافة ملعب</button></h4>
        <div id="courtsList">${courtsHtml}</div>
      </div>
      <div>${bookingsHtml}</div>
    `;
    
    document.getElementById('requiresApprovalCheck').addEventListener('change', async (e) => {
      venue.requiresApproval = e.target.checked;
      await api.saveVenues(venues);
      showToast('تم تحديث إعدادات الموافقة');
    });
    
    document.getElementById('addNewCourtBtn').addEventListener('click', () => openCourtModal(null, venue.id));
    detail.querySelectorAll('.edit-court-btn').forEach(btn => btn.addEventListener('click', (e) => openCourtModal(btn.dataset.courtId)));
    detail.querySelectorAll('.delete-court-btn').forEach(btn => btn.addEventListener('click', (e) => {
      const courtId = btn.dataset.courtId;
      showConfirm('حذف الملعب؟ (سيتم إلغاء الحجوزات المرتبطة به)', async () => {
        courts = courts.filter(c => c.id !== courtId);
        bookings = bookings.filter(b => b.courtId !== courtId);
        await api.saveCourts(courts);
        await api.saveBookings(bookings);
        renderVenueDetailForOwner(venue);
      });
    }));
    detail.querySelectorAll('.blackout-court-btn').forEach(btn => btn.addEventListener('click', () => openBlackoutModal('court', btn.dataset.courtId)));
    detail.querySelector('.edit-venue-btn').addEventListener('click', () => openEditVenueModal(venue.id));
    detail.querySelectorAll('.approve-booking-btn').forEach(btn => btn.addEventListener('click', () => approveBooking(btn.dataset.id)));
    detail.querySelectorAll('.reject-booking-btn').forEach(btn => btn.addEventListener('click', () => rejectBooking(btn.dataset.id)));
    detail.querySelectorAll('.edit-booking-btn').forEach(btn => btn.addEventListener('click', () => openManageBookingModal(btn.dataset.id, 'court')));
    detail.querySelectorAll('.cancel-booking-btn').forEach(btn => btn.addEventListener('click', () => cancelBooking(btn.dataset.id, 'court')));
    detail.querySelectorAll('.whatsapp-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const phone = link.dataset.phone;
        const name = link.dataset.name;
        if (phone) sendWhatsAppMessage(phone, `مرحباً ${name}،\nنود إعلامك بأنه تم ${link.dataset.action} حجزك في ${venue.name}. يرجى مراجعة التطبيق للتفاصيل.`);
        else showToast('رقم العميل غير مسجل', false);
      });
    });
  }

  async function approveBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;
    booking.status = 'confirmed';
    await api.saveBookings(bookings);
    addNotification(booking.customerId, `تم تأكيد حجزك في ${booking.venueName} بتاريخ ${booking.date}`);
    const customer = users.find(u => u.id === booking.customerId);
    if (customer?.phone) sendWhatsAppMessage(customer.phone, `عزيزي ${customer.name}،\nتم تأكيد حجزك في ${booking.venueName} بتاريخ ${booking.date} ${booking.time}.`);
    showToast('تم قبول الحجز');
    loadVenueDashboard();
  }

  async function rejectBooking(bookingId) {
    showConfirm('رفض الحجز؟', async () => {
      const bookingIndex = bookings.findIndex(b => b.id === bookingId);
      if (bookingIndex === -1) return;
      const booking = bookings[bookingIndex];
      bookings.splice(bookingIndex, 1);
      await api.saveBookings(bookings);
      addNotification(booking.customerId, `تم رفض حجزك في ${booking.venueName} بتاريخ ${booking.date}`);
      const customer = users.find(u => u.id === booking.customerId);
      if (customer?.phone) sendWhatsAppMessage(customer.phone, `عزيزي ${customer.name}،\nنعتذر، تم رفض حجزك في ${booking.venueName} بتاريخ ${booking.date}.`);
      showToast('تم رفض الحجز');
      loadVenueDashboard();
    });
  }

  // ---------- لوحة تحكم المدرب ----------
  async function loadCoachDashboard() {
    const container = document.getElementById('coachDashboardContent');
    if (!currentUser) return;
    
    const myCoach = coaches.find(c => c.ownerId === currentUser.id);
    if (!myCoach) {
      container.innerHTML = '<p>لم يتم تسجيلك كمدرب بعد. <a href="#" onclick="document.querySelector(\'[data-section=registerCoach]\').click()">سجل الآن</a></p>';
      return;
    }
    
    const mySessions = coachBookings.filter(b => b.coachId === myCoach.id);
    const currencySymbol = getCurrencySymbol(currentCurrency);
    const totalRevenue = mySessions.filter(s => s.status === 'confirmed' || s.status === 'مدفوع').reduce((sum, s) => sum + (s.price || 0), 0);
    
    let workingHoursHtml = '';
    const availability = coachAvailability[myCoach.id] || {};
    WEEKDAYS.forEach(day => {
      const wh = availability[day.key];
      if (wh && wh.start && wh.end) {
        workingHoursHtml += `${day.label}: ${wh.start} - ${wh.end}<br>`;
      } else {
        workingHoursHtml += `${day.label}: 24 ساعة<br>`;
      }
    });
    
    let sessionsHtml = mySessions.map(s => {
      const customer = users.find(u => u.id === s.customerId);
      const statusBadge = s.status === 'pending' ? '<span style="background:#fbbf24; padding:2px 8px; border-radius:20px;">بانتظار التأكيد</span>' : '';
      return `<div style="border:1px solid #e2e8f0; border-radius:12px; padding:12px; margin-bottom:8px;">
        <div><strong>${sanitizeInput(s.customerName)}</strong> (${customer?.email || ''}) ${statusBadge}</div>
        <div>${s.date} | ${s.time} (${s.duration} ساعة) | ${s.price} ${currencySymbol}</div>
        <div class="booking-actions">
          <button class="btn-outline btn-sm edit-coach-booking-btn" data-id="${s.id}"><i class="fas fa-edit"></i> تعديل</button>
          <button class="btn-outline btn-sm cancel-coach-booking-btn" data-id="${s.id}"><i class="fas fa-times"></i> إلغاء</button>
          ${customer?.phone ? `<a class="whatsapp-link btn-outline btn-sm" href="#" data-phone="${customer.phone}" data-name="${s.customerName}" data-action="تعديل"><i class="fab fa-whatsapp"></i> واتساب</a>` : ''}
        </div>
      </div>`;
    }).join('');
    
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3>${sanitizeInput(myCoach.name)}</h3>
        <button class="btn-outline btn-sm" id="editCoachProfileBtn"><i class="fas fa-edit"></i> تعديل الملف</button>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:16px 0;">
        <div class="card" style="padding:16px;"><strong>الرياضة:</strong> ${getSportDisplayName(myCoach.sport)}</div>
        <div class="card" style="padding:16px;"><strong>سعر الساعة:</strong> ${myCoach.hourlyRate} ${currencySymbol}</div>
        <div class="card" style="padding:16px;"><strong>رقم الهاتف:</strong> ${myCoach.phone}</div>
        <div class="card" style="padding:16px;"><strong>إجمالي الإيرادات:</strong> ${totalRevenue} ${currencySymbol}</div>
      </div>
      <div class="card" style="padding:16px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between;">
          <strong>ساعات العمل الأسبوعية:</strong>
          <div>
            <button class="btn-outline btn-sm" id="editCoachAvailabilityBtn"><i class="fas fa-clock"></i> تعديل</button>
            <button class="btn-outline btn-sm" id="blackoutCoachBtn"><i class="fas fa-ban"></i> إغلاق أيام</button>
          </div>
        </div>
        <div style="margin-top:8px;">${workingHoursHtml}</div>
      </div>
      <div><h4>الجلسات (${mySessions.length})</h4>${sessionsHtml || '<p>لا توجد جلسات محجوزة حالياً</p>'}</div>
    `;
    
    document.getElementById('editCoachAvailabilityBtn').addEventListener('click', () => openCoachAvailabilityModal(myCoach.id));
    document.getElementById('blackoutCoachBtn').addEventListener('click', () => openBlackoutModal('coach', myCoach.id));
    document.getElementById('editCoachProfileBtn').addEventListener('click', () => openEditCoachModal(myCoach.id));
    
    container.querySelectorAll('.edit-coach-booking-btn').forEach(btn => btn.addEventListener('click', () => openManageBookingModal(btn.dataset.id, 'coach')));
    container.querySelectorAll('.cancel-coach-booking-btn').forEach(btn => btn.addEventListener('click', () => cancelCoachBooking(btn.dataset.id)));
    container.querySelectorAll('.whatsapp-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const phone = link.dataset.phone;
        const name = link.dataset.name;
        if (phone) sendWhatsAppMessage(phone, `مرحباً ${name}،\nنود إعلامك بأنه تم ${link.dataset.action} جلسة التدريب مع ${myCoach.name}. يرجى مراجعة التطبيق للتفاصيل.`);
        else showToast('رقم العميل غير مسجل', false);
      });
    });
  }

  function openCoachAvailabilityModal(coachId) {
    renderCoachWorkingHoursEditor(coachId);
    document.getElementById('coachAvailabilityModal').style.visibility = 'visible';
    
    document.getElementById('saveCoachAvailabilityBtn').onclick = async () => {
      const newHours = collectCoachWorkingHoursFromEditor();
      coachAvailability[coachId] = newHours;
      await api.saveCoachAvailability(coachAvailability);
      showToast('تم حفظ ساعات العمل');
      document.getElementById('coachAvailabilityModal').style.visibility = 'hidden';
      loadCoachDashboard();
    };
  }

  document.getElementById('closeCoachAvailabilityModal').addEventListener('click', () => {
    document.getElementById('coachAvailabilityModal').style.visibility = 'hidden';
  });

  function openEditCoachModal(coachId) {
    const coach = coaches.find(c => c.id === coachId);
    if (!coach) return;
    
    const newName = prompt('أدخل الاسم الجديد:', coach.name);
    if (newName) coach.name = sanitizeInput(newName);
    const newPhone = prompt('أدخل رقم الهاتف الجديد:', coach.phone);
    if (newPhone) coach.phone = newPhone;
    const newRate = prompt('أدخل سعر الساعة الجديد:', coach.hourlyRate);
    if (newRate) coach.hourlyRate = +newRate;
    const newDesc = prompt('أدخل وصفاً جديداً:', coach.desc);
    if (newDesc) coach.desc = sanitizeInput(newDesc);
    
    api.saveCoaches(coaches).then(() => {
      showToast('تم تحديث البيانات');
      loadCoachDashboard();
    });
  }

  async function cancelCoachBooking(bookingId) {
    showConfirm('هل أنت متأكد من إلغاء الجلسة؟', async () => {
      const index = coachBookings.findIndex(b => b.id === bookingId);
      if (index === -1) return;
      const booking = coachBookings[index];
      const customer = users.find(u => u.id === booking.customerId);
      
      coachBookings.splice(index, 1);
      await api.saveCoachBookings(coachBookings);
      
      addNotification(booking.customerId, `تم إلغاء جلسة التدريب مع ${currentUser.name} بتاريخ ${booking.date}`);
      if (customer?.phone) sendWhatsAppMessage(customer.phone, `عزيزي ${customer.name}،\nنعتذر لإعلامك بأنه تم إلغاء جلسة التدريب مع ${currentUser.name} بتاريخ ${booking.date}.`);
      
      showToast('تم إلغاء الجلسة');
      loadCoachDashboard();
      updateNotificationBadge();
    });
  }

  // ---------- مودال الإغلاقات (Blackouts) للملاعب والمدربين ----------
  function openBlackoutModal(type, id) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.visibility = 'visible';
    modal.style.zIndex = '2000';
    
    const item = type === 'court' ? courts.find(c => c.id === id) : coaches.find(c => c.id === id);
    const itemName = type === 'court' ? item?.name : item?.name;
    
    modal.innerHTML = `
      <div class="modal-card" style="max-width:500px;">
        <h3><i class="fas fa-ban"></i> إغلاق ${type === 'court' ? 'الملعب' : 'المدرب'}: ${sanitizeInput(itemName)}</h3>
        <div class="form-group">
          <label>نوع الإغلاق</label>
          <select id="blackoutTypeSelect">
            <option value="day">يوم كامل</option>
            <option value="hour">ساعات محددة</option>
          </select>
        </div>
        <div class="form-group">
          <label>التاريخ</label>
          <input type="date" id="blackoutDate" required>
        </div>
        <div id="hourSelectionGroup" style="display:none;">
          <div class="form-group">
            <label>ساعة البداية</label>
            <input type="time" id="blackoutStartHour">
          </div>
          <div class="form-group">
            <label>المدة (ساعات)</label>
            <input type="number" id="blackoutDuration" min="1" max="24" value="1">
          </div>
        </div>
        <div class="form-group">
          <label>سبب الإغلاق (اختياري)</label>
          <input type="text" id="blackoutReason" placeholder="مثال: صيانة / إجازة">
        </div>
        <button id="saveBlackoutBtn" class="btn btn-primary">حفظ</button>
        <button id="closeBlackoutModalBtn" class="btn-outline">إلغاء</button>
        <hr style="margin:16px 0;">
        <h4>الإغلاقات الحالية</h4>
        <div id="existingBlackoutsList"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const typeSelect = modal.querySelector('#blackoutTypeSelect');
    const hourGroup = modal.querySelector('#hourSelectionGroup');
    
    typeSelect.addEventListener('change', (e) => {
      hourGroup.style.display = e.target.value === 'hour' ? 'block' : 'none';
    });
    
    const renderExistingBlackouts = () => {
      const list = modal.querySelector('#existingBlackoutsList');
      const itemBlackouts = blackouts[id] || [];
      if (itemBlackouts.length === 0) {
        list.innerHTML = '<p>لا توجد إغلاقات حالية</p>';
        return;
      }
      list.innerHTML = itemBlackouts.map((b, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #eee;">
          <div>
            ${b.date} - ${b.type === 'day' ? 'يوم كامل' : `${b.startHour}:00 (${b.duration} ساعة)`}
            ${b.reason ? `<br><small>${b.reason}</small>` : ''}
          </div>
          <button class="btn-outline btn-sm delete-blackout-btn" data-index="${idx}"><i class="fas fa-trash"></i></button>
        </div>
      `).join('');
      
      list.querySelectorAll('.delete-blackout-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const index = parseInt(btn.dataset.index);
          if (!blackouts[id]) blackouts[id] = [];
          blackouts[id].splice(index, 1);
          await api.saveBlackouts(blackouts);
          renderExistingBlackouts();
        });
      });
    };
    
    renderExistingBlackouts();
    
    modal.querySelector('#saveBlackoutBtn').addEventListener('click', async () => {
      const date = modal.querySelector('#blackoutDate').value;
      const bType = typeSelect.value;
      const reason = modal.querySelector('#blackoutReason').value;
      
      if (!date) {
        showToast('الرجاء اختيار التاريخ', false);
        return;
      }
      
      const blackout = { type: bType, date, reason };
      if (bType === 'hour') {
        blackout.startHour = modal.querySelector('#blackoutStartHour').value;
        blackout.duration = parseInt(modal.querySelector('#blackoutDuration').value);
      }
      
      if (!blackouts[id]) blackouts[id] = [];
      blackouts[id].push(blackout);
      await api.saveBlackouts(blackouts);
      
      showToast('تم حفظ الإغلاق');
      renderExistingBlackouts();
      
      modal.querySelector('#blackoutDate').value = '';
      modal.querySelector('#blackoutReason').value = '';
    });
    
    modal.querySelector('#closeBlackoutModalBtn').addEventListener('click', () => {
      modal.remove();
    });
  }

  // ---------- مودال إضافة/تعديل ملعب ----------
  function openCourtModal(courtId = null, venueId = null) {
    const modal = document.getElementById('courtModal');
    const form = document.getElementById('courtForm');
    const title = document.getElementById('courtModalTitle');
    
    form.reset();
    document.getElementById('singleSportGroup').style.display = 'block';
    document.getElementById('multiSportGroup').style.display = 'none';
    document.getElementById('customPricingGroup').style.display = 'none';
    document.querySelectorAll('#multiSportCheckboxes input[type=checkbox]').forEach(cb => cb.checked = false);
    
    if (courtId) {
      const court = courts.find(c => c.id === courtId);
      if (!court) return;
      title.textContent = 'تعديل ملعب';
      document.getElementById('courtId').value = court.id;
      document.getElementById('courtVenueId').value = court.venueId;
      document.getElementById('courtName').value = court.name;
      document.getElementById('courtType').value = court.multiSport ? 'multi' : 'single';
      if (court.multiSport) {
        document.getElementById('singleSportGroup').style.display = 'none';
        document.getElementById('multiSportGroup').style.display = 'block';
        court.allowedSports.forEach(sport => {
          const cb = document.querySelector(`#multiSportCheckboxes input[value="${sport}"]`);
          if (cb) cb.checked = true;
        });
      } else {
        document.getElementById('courtSport').value = court.sport;
      }
      if (court.pricing) {
        document.getElementById('useCustomPricing').checked = true;
        document.getElementById('customPricingGroup').style.display = 'block';
        document.getElementById('courtPrice1').value = court.pricing[0];
        document.getElementById('courtPrice2').value = court.pricing[1];
        document.getElementById('courtPrice3').value = court.pricing[2];
        document.getElementById('courtPrice4').value = court.pricing[3];
      }
    } else {
      title.textContent = 'إضافة ملعب جديد';
      document.getElementById('courtId').value = '';
      document.getElementById('courtVenueId').value = venueId;
    }
    
    modal.style.visibility = 'visible';
  }
  
  document.getElementById('courtType').addEventListener('change', (e) => {
    const isMulti = e.target.value === 'multi';
    document.getElementById('singleSportGroup').style.display = isMulti ? 'none' : 'block';
    document.getElementById('multiSportGroup').style.display = isMulti ? 'block' : 'none';
  });
  
  document.getElementById('useCustomPricing').addEventListener('change', (e) => {
    document.getElementById('customPricingGroup').style.display = e.target.checked ? 'block' : 'none';
  });
  
  document.getElementById('courtForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const courtId = document.getElementById('courtId').value;
    const venueId = document.getElementById('courtVenueId').value;
    const name = sanitizeInput(document.getElementById('courtName').value.trim());
    const type = document.getElementById('courtType').value;
    const sport = type === 'single' ? document.getElementById('courtSport').value : null;
    const allowedSports = type === 'multi' ? 
      Array.from(document.querySelectorAll('#multiSportCheckboxes input:checked')).map(cb => cb.value) : [];
    
    let pricing = null;
    if (document.getElementById('useCustomPricing').checked) {
      pricing = [
        +document.getElementById('courtPrice1').value,
        +document.getElementById('courtPrice2').value,
        +document.getElementById('courtPrice3').value,
        +document.getElementById('courtPrice4').value
      ];
    }
    
    if (courtId) {
      const court = courts.find(c => c.id === courtId);
      if (court) {
        court.name = name;
        court.multiSport = type === 'multi';
        court.sport = sport;
        court.allowedSports = allowedSports;
        court.pricing = pricing;
        await api.saveCourts(courts);
        showToast('تم تحديث الملعب');
      }
    } else {
      const newCourt = {
        id: `${venueId}-court-${Date.now()}`,
        venueId,
        name,
        multiSport: type === 'multi',
        sport,
        allowedSports,
        pricing
      };
      courts.push(newCourt);
      await api.saveCourts(courts);
      showToast('تم إضافة الملعب');
    }
    
    document.getElementById('courtModal').style.visibility = 'hidden';
    if (document.getElementById('venueDashboard').classList.contains('active')) {
      const venue = venues.find(v => v.id === venueId);
      if (venue) renderVenueDetailForOwner(venue);
    }
  });
  
  document.getElementById('closeCourtModalBtn').addEventListener('click', () => {
    document.getElementById('courtModal').style.visibility = 'hidden';
  });
  
    // ---------- حجوزات العميل والتقييم (مع دعم الحجوزات المتكررة) ----------
  function renderCustomerBookings() {
    if (!currentUser) return;
    const myCourtBookings = bookings.filter(b => b.customerId === currentUser.id);
    const myCoachSessions = coachBookings.filter(b => b.customerId === currentUser.id);
    const container = document.getElementById('customerBookingsList');
    const currencySymbol = getCurrencySymbol(currentCurrency);
    
    if (!myCourtBookings.length && !myCoachSessions.length) { 
      container.innerHTML = '<p>لا توجد حجوزات أو جلسات حالية</p>'; 
      return; 
    }
    
    let html = '';
    
    // تجميع الحجوزات حسب المجموعة المتكررة
    const recurringMap = {};
    recurringGroups.forEach(g => { recurringMap[g.id] = g; });
    
    myCourtBookings.forEach(b => {
      const court = courts.find(c => c.id === b.courtId);
      const venue = venues.find(v => v.id === b.venueId);
      const canRate = (b.status === 'confirmed' || b.status === 'مدفوع') && !b.rated;
      const statusText = b.status === 'pending' ? 'بانتظار الموافقة' : (b.status === 'cancelled' ? 'ملغي' : 'مؤكد');
      const recurringBadge = b.recurringGroupId ? '<span style="background:#6366f1; color:white; padding:2px 8px; border-radius:20px; font-size:0.8rem;">🔄 متكرر</span>' : '';
      
      html += `<div style="border:1px solid #e2e8f0; border-radius:12px; padding:12px; margin-bottom:8px;">
        <div><strong>🏟️ ${sanitizeInput(court?.name || b.venueName)}</strong> (${venue?.name || ''}) ${recurringBadge}</div>
        <div>${b.date} | ${b.time} (${b.duration} ساعة) | ${b.price} ${currencySymbol} | ${statusText}</div>
        <div class="booking-actions">
          ${b.recurringGroupId ? `<button class="btn-outline btn-sm edit-recurring-btn" data-group-id="${b.recurringGroupId}"><i class="fas fa-calendar-alt"></i> تعديل المجموعة</button>` : `<button class="btn-outline btn-sm edit-booking-btn" data-id="${b.id}" data-type="court"><i class="fas fa-edit"></i> تعديل</button>`}
          ${b.recurringGroupId ? `<button class="btn-outline btn-sm cancel-recurring-btn" data-group-id="${b.recurringGroupId}"><i class="fas fa-times"></i> إلغاء الكل</button>` : `<button class="btn-outline btn-sm cancel-booking-btn" data-id="${b.id}" data-type="court"><i class="fas fa-times"></i> إلغاء</button>`}
          ${venue?.phone ? `<a class="whatsapp-link btn-outline btn-sm" href="#" data-phone="${venue.phone}" data-name="${venue.name}" data-action="استفسار"><i class="fab fa-whatsapp"></i> واتساب</a>` : ''}
          ${canRate ? `<button class="btn-outline btn-sm rate-btn" data-target="${b.venueId}" data-booking="${b.id}" data-type="venue"><i class="fas fa-star"></i> تقييم</button>` : ''}
        </div>
      </div>`;
    });
    
    myCoachSessions.forEach(s => {
      const coach = coaches.find(c => c.id === s.coachId);
      const canRate = (s.status === 'confirmed' || s.status === 'مدفوع') && !s.rated;
      const recurringBadge = s.recurringGroupId ? '<span style="background:#6366f1; color:white; padding:2px 8px; border-radius:20px; font-size:0.8rem;">🔄 متكرر</span>' : '';
      
      html += `<div style="border:1px solid #e2e8f0; border-radius:12px; padding:12px; margin-bottom:8px;">
        <div><strong>👤 ${sanitizeInput(coach?.name || s.coachName)}</strong> (${getSportDisplayName(coach?.sport || '')}) ${recurringBadge}</div>
        <div>${s.date} | ${s.time} (${s.duration} ساعة) | ${s.price} ${currencySymbol}</div>
        <div class="booking-actions">
          ${s.recurringGroupId ? `<button class="btn-outline btn-sm edit-recurring-btn" data-group-id="${s.recurringGroupId}"><i class="fas fa-calendar-alt"></i> تعديل المجموعة</button>` : `<button class="btn-outline btn-sm edit-booking-btn" data-id="${s.id}" data-type="coach"><i class="fas fa-edit"></i> تعديل</button>`}
          ${s.recurringGroupId ? `<button class="btn-outline btn-sm cancel-recurring-btn" data-group-id="${s.recurringGroupId}"><i class="fas fa-times"></i> إلغاء الكل</button>` : `<button class="btn-outline btn-sm cancel-booking-btn" data-id="${s.id}" data-type="coach"><i class="fas fa-times"></i> إلغاء</button>`}
          ${coach?.phone ? `<a class="whatsapp-link btn-outline btn-sm" href="#" data-phone="${coach.phone}" data-name="${coach.name}" data-action="استفسار"><i class="fab fa-whatsapp"></i> واتساب</a>` : ''}
          ${canRate ? `<button class="btn-outline btn-sm rate-btn" data-target="${s.coachId}" data-booking="${s.id}" data-type="coach"><i class="fas fa-star"></i> تقييم</button>` : ''}
        </div>
      </div>`;
    });
    
    container.innerHTML = html;
    container.querySelectorAll('.edit-booking-btn').forEach(btn => btn.addEventListener('click', () => openManageBookingModal(btn.dataset.id, btn.dataset.type)));
    container.querySelectorAll('.cancel-booking-btn').forEach(btn => btn.addEventListener('click', () => cancelBooking(btn.dataset.id, btn.dataset.type)));
    container.querySelectorAll('.edit-recurring-btn').forEach(btn => btn.addEventListener('click', () => openManageRecurringModal(btn.dataset.groupId)));
    container.querySelectorAll('.cancel-recurring-btn').forEach(btn => btn.addEventListener('click', () => cancelRecurringGroup(btn.dataset.groupId)));
    container.querySelectorAll('.rate-btn').forEach(btn => btn.addEventListener('click', () => openRatingModal(btn.dataset.target, btn.dataset.booking, btn.dataset.type)));
    container.querySelectorAll('.whatsapp-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const phone = link.dataset.phone;
        const name = link.dataset.name;
        if (phone) sendWhatsAppMessage(phone, `مرحباً ${name}،\nالعميل ${currentUser.name} يرغب في ${link.dataset.action} بخصوص الحجز. يرجى التواصل معه.`);
        else showToast('رقم الهاتف غير مسجل', false);
      });
    });
  }

  function openRatingModal(targetId, bookingId, type) {
    document.getElementById('ratingTargetId').value = targetId;
    document.getElementById('ratingBookingId').value = bookingId;
    document.getElementById('ratingType').value = type;
    selectedRating = 0;
    document.querySelectorAll('#ratingStars i').forEach(star => {
      star.className = 'far fa-star';
      star.style.color = '';
    });
    document.getElementById('ratingComment').value = '';
    document.getElementById('ratingModal').style.visibility = 'visible';
  }

  document.querySelectorAll('#ratingStars i').forEach(star => {
    star.addEventListener('click', function() {
      selectedRating = parseInt(this.dataset.value);
      document.querySelectorAll('#ratingStars i').forEach((s, idx) => {
        if (idx < selectedRating) {
          s.className = 'fas fa-star';
          s.style.color = '#fbbf24';
        } else {
          s.className = 'far fa-star';
          s.style.color = '';
        }
      });
    });
  });

  document.getElementById('submitRatingBtn').addEventListener('click', async () => {
    const targetId = document.getElementById('ratingTargetId').value;
    const bookingId = document.getElementById('ratingBookingId').value;
    const type = document.getElementById('ratingType').value;
    const comment = sanitizeInput(document.getElementById('ratingComment').value);
    
    if (selectedRating === 0) {
      showToast('الرجاء اختيار تقييم', false);
      return;
    }
    
    if (type === 'venue') {
      if (!reviews[targetId]) reviews[targetId] = [];
      reviews[targetId].push({
        userId: currentUser.id,
        userName: currentUser.name,
        rating: selectedRating,
        comment: comment,
        date: new Date().toISOString(),
        bookingId: bookingId
      });
      await api.saveReviews(reviews);
      
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.rated = true;
        await api.saveBookings(bookings);
      }
    } else if (type === 'coach') {
      if (!coachReviews[targetId]) coachReviews[targetId] = [];
      coachReviews[targetId].push({
        userId: currentUser.id,
        userName: currentUser.name,
        rating: selectedRating,
        comment: comment,
        date: new Date().toISOString(),
        bookingId: bookingId
      });
      await api.saveCoachReviews(coachReviews);
      
      const session = coachBookings.find(s => s.id === bookingId);
      if (session) {
        session.rated = true;
        await api.saveCoachBookings(coachBookings);
      }
    }
    
    showToast('شكراً لتقييمك! 🌟');
    document.getElementById('ratingModal').style.visibility = 'hidden';
    renderCustomerBookings();
    if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
  });

  document.getElementById('closeRatingModal').addEventListener('click', () => {
    document.getElementById('ratingModal').style.visibility = 'hidden';
  });

  // ---------- إدارة حجز (ملاعب ومدربين) مع دعم الحجوزات المتكررة ----------
  function openManageBookingModal(bookingId, type) {
    const booking = type === 'court' ? bookings.find(b => b.id === bookingId) : coachBookings.find(b => b.id === bookingId);
    if (!booking) return;
    document.getElementById('manageBookingId').value = bookingId;
    document.getElementById('manageBookingType').value = type;
    document.getElementById('manageBookingDate').value = booking.date;
    document.getElementById('manageBookingTime').value = booking.time;
    document.getElementById('manageBookingDuration').value = booking.duration;
    document.getElementById('manageBookingTitle').textContent = type === 'court' ? 'تعديل حجز الملعب' : 'تعديل جلسة التدريب';
    updateManagePrice();
    document.getElementById('manageBookingModal').style.visibility = 'visible';
    
    document.getElementById('manageBookingDuration').oninput = updateManagePrice;
    document.getElementById('manageBookingTime').onchange = updateManagePrice;
    document.getElementById('manageBookingDate').onchange = updateManagePrice;
    
    function updateManagePrice() {
      const type = document.getElementById('manageBookingType').value;
      const date = document.getElementById('manageBookingDate').value;
      const time = document.getElementById('manageBookingTime').value;
      const dur = +document.getElementById('manageBookingDuration').value;
      let price = 0;
      
      if (type === 'court') {
        const booking = bookings.find(b => b.id === bookingId);
        const court = courts.find(c => c.id === booking?.courtId);
        if (court) price = calculateBookingPrice(court, date, time, dur);
      } else {
        const booking = coachBookings.find(b => b.id === bookingId);
        const coach = coaches.find(c => c.id === booking?.coachId);
        if (coach) price = coach.hourlyRate * dur;
      }
      document.getElementById('manageBookingPrice').textContent = price;
    }
  }

  document.getElementById('manageBookingForm').addEventListener('submit', async e => {
    e.preventDefault();
    const bookingId = document.getElementById('manageBookingId').value;
    const type = document.getElementById('manageBookingType').value;
    const newDate = document.getElementById('manageBookingDate').value;
    const newTime = document.getElementById('manageBookingTime').value;
    const newDuration = +document.getElementById('manageBookingDuration').value;
    
    if (type === 'court') {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;
      const court = courts.find(c => c.id === booking.courtId);
      const venue = venues.find(v => v.id === booking.venueId);
      const hour = parseInt(newTime.split(':')[0]);
      
      if (!isWithinWorkingHours(venue, newDate, hour)) {
        return showToast('الوقت الجديد خارج ساعات العمل', false);
      }
      if (isBlackedOut('court', court.id, newDate, hour)) {
        return showToast('الملعب مغلق في هذا الوقت', false);
      }
      
      const conflict = bookings.some(b => b.id !== bookingId && b.courtId === booking.courtId && b.date === newDate && b.status !== 'cancelled' &&
        ((newTime >= b.time && newTime < addMinutes(b.time, b.duration)) || 
         (addMinutes(newTime, newDuration) > b.time && newTime < addMinutes(b.time, b.duration))));
      if (conflict) return showToast('يوجد تعارض مع حجز آخر', false);
      
      booking.date = newDate; booking.time = newTime; booking.duration = newDuration;
      booking.price = calculateBookingPrice(court, newDate, newTime, newDuration);
      booking.appFee = booking.price * 0.15;
      await api.saveBookings(bookings);
      
      const customer = users.find(u => u.id === booking.customerId);
      const venueOwner = users.find(u => u.id === venue.ownerId);
      const symbol = getCurrencySymbol(currentCurrency);
      
      if (currentUser.role === 'venue' || currentUser.role === 'admin') {
        addNotification(booking.customerId, `تم تعديل حجزك في ${venue.name} إلى ${newDate} ${newTime}`);
        if (customer?.phone) sendWhatsAppMessage(customer.phone, `عزيزي ${customer.name}،\nتم تعديل حجزك في ${venue.name} إلى ${newDate} الساعة ${newTime} لمدة ${newDuration} ساعة.\nالسعر الجديد: ${booking.price} ${symbol}.`);
      } else {
        addNotification(venue.ownerId, `قام ${currentUser.name} بتعديل حجزه في ${venue.name} إلى ${newDate} ${newTime}`);
        if (venueOwner?.phone) sendWhatsAppMessage(venueOwner.phone, `مرحباً ${venueOwner.name}،\nقام العميل ${currentUser.name} بتعديل حجزه في ${venue.name} إلى ${newDate} ${newTime} لمدة ${newDuration} ساعة.`);
      }
    } else {
      const session = coachBookings.find(s => s.id === bookingId);
      if (!session) return;
      const coach = coaches.find(c => c.id === session.coachId);
      const hour = parseInt(newTime.split(':')[0]);
      
      if (!isWithinCoachWorkingHours(coach.id, newDate, hour)) {
        return showToast('الوقت الجديد خارج ساعات عمل المدرب', false);
      }
      if (isBlackedOut('coach', coach.id, newDate, hour)) {
        return showToast('المدرب غير متاح في هذا الوقت', false);
      }
      
      const conflict = coachBookings.some(s => s.id !== bookingId && s.coachId === session.coachId && s.date === newDate && s.status !== 'cancelled' &&
        ((newTime >= s.time && newTime < addMinutes(s.time, s.duration)) || 
         (addMinutes(newTime, newDuration) > s.time && newTime < addMinutes(s.time, s.duration))));
      if (conflict) return showToast('يوجد تعارض مع جلسة أخرى', false);
      
      session.date = newDate; session.time = newTime; session.duration = newDuration;
      session.price = coach.hourlyRate * newDuration;
      session.appFee = session.price * 0.15;
      await api.saveCoachBookings(coachBookings);
      
      const customer = users.find(u => u.id === session.customerId);
      const symbol = getCurrencySymbol(currentCurrency);
      
      if (currentUser.role === 'coach' || currentUser.role === 'admin') {
        addNotification(session.customerId, `تم تعديل جلستك مع ${coach.name} إلى ${newDate} ${newTime}`);
        if (customer?.phone) sendWhatsAppMessage(customer.phone, `عزيزي ${customer.name}،\nتم تعديل جلستك مع المدرب ${coach.name} إلى ${newDate} الساعة ${newTime} لمدة ${newDuration} ساعة.\nالسعر الجديد: ${session.price} ${symbol}.`);
      } else {
        addNotification(coach.ownerId, `قام ${currentUser.name} بتعديل جلسته معك إلى ${newDate} ${newTime}`);
        const coachUser = users.find(u => u.id === coach.ownerId);
        if (coachUser?.phone) sendWhatsAppMessage(coachUser.phone, `مرحباً ${coach.name}،\nقام العميل ${currentUser.name} بتعديل جلسته معك إلى ${newDate} ${newTime} لمدة ${newDuration} ساعة.`);
      }
    }
    
    showToast('تم تعديل الحجز بنجاح');
    document.getElementById('manageBookingModal').style.visibility = 'hidden';
    if (document.getElementById('venueDashboard').classList.contains('active')) loadVenueDashboard();
    if (document.getElementById('coachDashboard').classList.contains('active')) loadCoachDashboard();
    renderCustomerBookings(); 
    updateNotificationBadge();
  });

  async function cancelBooking(bookingId, type) {
    showConfirm('هل أنت متأكد من إلغاء الحجز؟', async () => {
      if (type === 'court') {
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex === -1) return;
        const booking = bookings[bookingIndex];
        const venue = venues.find(v => v.id === booking.venueId);
        const customer = users.find(u => u.id === booking.customerId);
        const venueOwner = users.find(u => u.id === venue?.ownerId);
        
        booking.status = 'cancelled';
        await api.saveBookings(bookings);
        
        if (currentUser.role === 'venue' || currentUser.role === 'admin') {
          addNotification(booking.customerId, `تم إلغاء حجزك في ${venue.name} بتاريخ ${booking.date}`);
          if (customer?.phone) sendWhatsAppMessage(customer.phone, `عزيزي ${customer.name}،\nنعتذر لإعلامك بأنه تم إلغاء حجزك في ${venue.name} بتاريخ ${booking.date}.`);
        } else {
          addNotification(venue.ownerId, `قام ${currentUser.name} بإلغاء حجزه في ${venue.name} بتاريخ ${booking.date}`);
          if (venueOwner?.phone) sendWhatsAppMessage(venueOwner.phone, `مرحباً ${venueOwner.name}،\nقام العميل ${currentUser.name} بإلغاء حجزه في ${venue.name} بتاريخ ${booking.date}.`);
        }
      } else {
        const sessionIndex = coachBookings.findIndex(s => s.id === bookingId);
        if (sessionIndex === -1) return;
        const session = coachBookings[sessionIndex];
        const coach = coaches.find(c => c.id === session.coachId);
        const customer = users.find(u => u.id === session.customerId);
        const coachUser = users.find(u => u.id === coach?.ownerId);
        
        session.status = 'cancelled';
        await api.saveCoachBookings(coachBookings);
        
        if (currentUser.role === 'coach' || currentUser.role === 'admin') {
          addNotification(session.customerId, `تم إلغاء جلستك مع ${coach.name} بتاريخ ${session.date}`);
          if (customer?.phone) sendWhatsAppMessage(customer.phone, `عزيزي ${customer.name}،\nنعتذر لإعلامك بأنه تم إلغاء جلستك مع المدرب ${coach.name} بتاريخ ${session.date}.`);
        } else {
          addNotification(coach.ownerId, `قام ${currentUser.name} بإلغاء جلسته معك بتاريخ ${session.date}`);
          if (coachUser?.phone) sendWhatsAppMessage(coachUser.phone, `مرحباً ${coach.name}،\nقام العميل ${currentUser.name} بإلغاء جلسته معك بتاريخ ${session.date}.`);
        }
      }
      
      showToast('تم إلغاء الحجز');
      if (document.getElementById('venueDashboard').classList.contains('active')) loadVenueDashboard();
      if (document.getElementById('coachDashboard').classList.contains('active')) loadCoachDashboard();
      renderCustomerBookings(); 
      updateNotificationBadge();
    });
  }

  // إلغاء مجموعة متكررة
  async function cancelRecurringGroup(groupId) {
    showConfirm('إلغاء جميع الحجوزات في هذه المجموعة؟', async () => {
      const group = recurringGroups.find(g => g.id === groupId);
      if (!group) return;
      
      if (group.type === 'court') {
        bookings.forEach(b => {
          if (b.recurringGroupId === groupId) b.status = 'cancelled';
        });
        await api.saveBookings(bookings);
      } else {
        coachBookings.forEach(s => {
          if (s.recurringGroupId === groupId) s.status = 'cancelled';
        });
        await api.saveCoachBookings(coachBookings);
      }
      
      showToast('تم إلغاء المجموعة');
      renderCustomerBookings();
    });
  }

  function openManageRecurringModal(groupId) {
    const group = recurringGroups.find(g => g.id === groupId);
    if (!group) return;
    
    // نافذة بسيطة لتعديل المجموعة (يمكن توسيعها لاحقاً)
    const newEndDate = prompt('أدخل تاريخ انتهاء جديد (YYYY-MM-DD):', group.endDate);
    if (newEndDate) {
      group.endDate = newEndDate;
      api.saveRecurringGroups(recurringGroups);
      showToast('تم تحديث المجموعة');
      renderCustomerBookings();
    }
  }

  function addMinutes(t, m) { 
    const [h, mm] = t.split(':').map(Number); 
    const d = new Date(); 
    d.setHours(h, mm + m); 
    return d.toTimeString().slice(0, 5); 
  }

  // ---------- الإلغاء التلقائي للدفع المعلق ----------
  function startPendingPaymentChecker() {
    setInterval(async () => {
      const now = new Date();
      const expired = pendingPayments.filter(p => new Date(p.expiresAt) < now);
      
      for (let p of expired) {
        // إلغاء الحجوزات المعلقة
        if (p.type === 'court') {
          const booking = bookings.find(b => b.id === p.bookingId);
          if (booking && booking.status === 'pending_payment') {
            booking.status = 'cancelled';
          }
        } else {
          const session = coachBookings.find(s => s.id === p.bookingId);
          if (session && session.status === 'pending_payment') {
            session.status = 'cancelled';
          }
        }
        
        addNotification(p.customerId, `تم إلغاء حجزك لعدم إتمام الدفع خلال ${PAYMENT_TIMEOUT_MINUTES} دقيقة`);
      }
      
      pendingPayments = pendingPayments.filter(p => new Date(p.expiresAt) >= now);
      await api.savePendingPayments(pendingPayments);
      if (expired.length > 0) {
        await api.saveBookings(bookings);
        await api.saveCoachBookings(coachBookings);
      }
    }, 60000);
  }

  // ---------- تحديث الشريط الزمني (للملاعب والمدربين) مع مراعاة الإغلاقات ----------
  function updateTimelineForCourt(court, dateStr) {
    const timelineDiv = document.getElementById('timelineDisplay');
    const venue = venues.find(v => v.id === court.venueId);
    const dayBookings = bookings.filter(b => b.courtId === court.id && b.date === dateStr && b.status !== 'cancelled');
    
    const bookedSlots = new Array(24).fill(false);
    dayBookings.forEach(b => { 
      const start = parseInt(b.time.split(':')[0]); 
      for (let i = 0; i < (b.duration || 1); i++) if (start + i < 24) bookedSlots[start + i] = true; 
    });
    
    const availableSlots = new Array(24).fill(true);
    for (let h = 0; h < 24; h++) {
      if (!isWithinWorkingHours(venue, dateStr, h)) {
        availableSlots[h] = false;
        continue;
      }
      if (isBlackedOut('court', court.id, dateStr, h)) {
        availableSlots[h] = false;
      }
    }
    
    let html = '';
    const currencySymbol = getCurrencySymbol(currentCurrency);
    for (let h = 0; h < 24; h++) {
      const periodIdx = getPeriodIndex(h);
      const periodColor = PERIODS[periodIdx].color;
      let statusColor = '#cbd5e1', statusText = 'غير متاح';
      if (availableSlots[h] && !bookedSlots[h]) { statusColor = '#10b981'; statusText = 'متاح'; }
      else if (bookedSlots[h]) { statusColor = '#ef4444'; statusText = 'محجوز'; }
      const price = getHourlyPrice(court, h);
      html += `<div class="hour-slot" title="${h}:00 - ${h+1}:00 | ${PERIODS[periodIdx].name} | ${statusText} | ${price} ${currencySymbol}">
                <div class="period-part" style="background:${periodColor};">${h}</div>
                <div class="status-part" style="background:${statusColor};"></div>
              </div>`;
    }
    timelineDiv.innerHTML = html;
    const summary = document.getElementById('pricingSummary');
    if (court.pricing) {
      summary.innerHTML = PERIODS.map((p, i) => `<span class="price-tag" style="background:${p.color}">${p.name}: ${court.pricing[i]} ${currencySymbol}/س</span>`).join(' ');
    } else {
      if (venue?.pricing) summary.innerHTML = PERIODS.map((p, i) => `<span class="price-tag" style="background:${p.color}">${p.name}: ${venue.pricing[i]} ${currencySymbol}/س</span>`).join(' ');
      else summary.innerHTML = '<span>لم يتم تحديد أسعار خاصة</span>';
    }
    updatePrice();
  }

  function updateTimelineForCoach(coachId, dateStr) {
    const timelineDiv = document.getElementById('timelineDisplay');
    const coach = coaches.find(c => c.id === coachId);
    const daySessions = coachBookings.filter(b => b.coachId === coachId && b.date === dateStr && b.status !== 'cancelled');
    
    const bookedSlots = new Array(24).fill(false);
    daySessions.forEach(b => { 
      const start = parseInt(b.time.split(':')[0]); 
      for (let i = 0; i < (b.duration || 1); i++) if (start + i < 24) bookedSlots[start + i] = true; 
    });
    
    const availableSlots = new Array(24).fill(true);
    for (let h = 0; h < 24; h++) {
      if (!isWithinCoachWorkingHours(coachId, dateStr, h)) {
        availableSlots[h] = false;
      }
      if (isBlackedOut('coach', coachId, dateStr, h)) {
        availableSlots[h] = false;
      }
    }
    
    let html = '';
    const currencySymbol = getCurrencySymbol(currentCurrency);
    for (let h = 0; h < 24; h++) {
      const periodIdx = getPeriodIndex(h);
      const periodColor = PERIODS[periodIdx].color;
      let statusColor = '#cbd5e1', statusText = 'غير متاح';
      if (availableSlots[h] && !bookedSlots[h]) { statusColor = '#10b981'; statusText = 'متاح'; }
      else if (bookedSlots[h]) { statusColor = '#ef4444'; statusText = 'محجوز'; }
      html += `<div class="hour-slot" title="${h}:00 - ${h+1}:00 | ${PERIODS[periodIdx].name} | ${statusText} | ${coach.hourlyRate} ${currencySymbol}">
                <div class="period-part" style="background:${periodColor};">${h}</div>
                <div class="status-part" style="background:${statusColor};"></div>
              </div>`;
    }
    timelineDiv.innerHTML = html;
    document.getElementById('pricingSummary').innerHTML = `<span class="price-tag">سعر الساعة: ${coach.hourlyRate} ${currencySymbol}</span>`;
    updatePrice();
  }

  // ---------- فتح مودال الحجز (ملعب أو مدرب) مع خيار التكرار ----------
  function openBookingModal(targetId, type) {
    if (!currentUser) return showToast('الرجاء تسجيل الدخول', false);
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').value = today;
    document.getElementById('bookingTime').value = '10:00';
    document.getElementById('bookingDuration').value = 1;
    document.getElementById('bookingType').value = type;
    
    // إظهار خيار التكرار
    const recurringHtml = `
      <div class="form-group">
        <label>التكرار</label>
        <select id="bookingRecurring">
          <option value="none">مرة واحدة</option>
          <option value="weekly">أسبوعي</option>
          <option value="biweekly">كل أسبوعين</option>
        </select>
      </div>
      <div class="form-group" id="recurringEndGroup" style="display:none;">
        <label>تاريخ الانتهاء</label>
        <input type="date" id="recurringEndDate">
      </div>
    `;
    
    const existingRecurring = document.getElementById('bookingRecurringGroup');
    if (!existingRecurring) {
      const durationGroup = document.getElementById('bookingDuration').closest('.form-group');
      durationGroup.insertAdjacentHTML('afterend', recurringHtml);
      
      document.getElementById('bookingRecurring').addEventListener('change', (e) => {
        const endGroup = document.getElementById('recurringEndGroup');
        endGroup.style.display = e.target.value !== 'none' ? 'block' : 'none';
      });
    }
    
    if (type === 'court') {
      const court = courts.find(c => c.id === targetId);
      if (!court) return;
      document.getElementById('bookingVenueId').value = court.venueId;
      document.getElementById('bookingCourtId').value = targetId;
      document.getElementById('bookingCoachId').value = '';
      
      const venue = venues.find(v => v.id === court.venueId);
      const infoDiv = document.getElementById('distanceTimeInfo');
      if (customerLocation && venue?.lat) {
        const dist = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, venue.lat, venue.lng).toFixed(1);
        infoDiv.innerHTML = `<i class="fas fa-car"></i> المسافة: ${dist} كم، الزمن: ${calculateTravelTime(parseFloat(dist))} دقيقة`;
      } else infoDiv.innerHTML = `<i class="fas fa-info-circle"></i> حدد موقعك لمعرفة المسافة`;
      
      updateTimelineForCourt(court, today);
      document.getElementById('bookingDate').onchange = e => updateTimelineForCourt(court, e.target.value);
    } else {
      const coach = coaches.find(c => c.id === targetId);
      if (!coach) return;
      document.getElementById('bookingVenueId').value = '';
      document.getElementById('bookingCourtId').value = '';
      document.getElementById('bookingCoachId').value = targetId;
      
      const infoDiv = document.getElementById('distanceTimeInfo');
      if (customerLocation && coach?.lat) {
        const dist = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, coach.lat, coach.lng).toFixed(1);
        infoDiv.innerHTML = `<i class="fas fa-car"></i> المسافة: ${dist} كم، الزمن: ${calculateTravelTime(parseFloat(dist))} دقيقة`;
      } else infoDiv.innerHTML = `<i class="fas fa-info-circle"></i> حدد موقعك لمعرفة المسافة`;
      
      updateTimelineForCoach(targetId, today);
      document.getElementById('bookingDate').onchange = e => updateTimelineForCoach(targetId, e.target.value);
    }
    
    document.getElementById('bookingModal').style.visibility = 'visible';
  }

  function updatePrice() {
    const type = document.getElementById('bookingType').value;
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const duration = +document.getElementById('bookingDuration').value;
    let price = 0;
    
    if (type === 'court') {
      const courtId = document.getElementById('bookingCourtId').value;
      const court = courts.find(c => c.id === courtId);
      if (court) price = calculateBookingPrice(court, date, time, duration);
    } else {
      const coachId = document.getElementById('bookingCoachId').value;
      const coach = coaches.find(c => c.id === coachId);
      if (coach) price = coach.hourlyRate * duration;
    }
    document.getElementById('bookingPrice').textContent = price;
  }
  
  document.getElementById('bookingDuration').addEventListener('input', updatePrice);
  document.getElementById('bookingTime').addEventListener('change', updatePrice);
  
    // ---------- إنشاء حجوزات متكررة ----------
  function generateRecurringDates(startDate, endDate, pattern) {
    const dates = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    let current = new Date(start);
    
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      if (pattern === 'weekly') {
        current.setDate(current.getDate() + 7);
      } else if (pattern === 'biweekly') {
        current.setDate(current.getDate() + 14);
      }
    }
    return dates;
  }

  async function createRecurringBookings(baseData, recurringPattern, endDate) {
    const dates = generateRecurringDates(baseData.date, endDate, recurringPattern);
    if (dates.length === 0) return [];
    
    const groupId = Date.now() + '-' + Math.random().toString(36);
    const newItems = [];
    
    for (const date of dates) {
      const item = { ...baseData, date, recurringGroupId: groupId };
      
      // التحقق من التعارض
      if (baseData.type === 'court') {
        const conflict = bookings.some(b => 
          b.courtId === baseData.courtId && b.date === date && b.status !== 'cancelled' &&
          ((baseData.time >= b.time && baseData.time < addMinutes(b.time, b.duration)) || 
           (addMinutes(baseData.time, baseData.duration) > b.time && baseData.time < addMinutes(b.time, b.duration)))
        );
        if (conflict) continue;
        
        const court = courts.find(c => c.id === baseData.courtId);
        const venue = venues.find(v => v.id === court.venueId);
        const hour = parseInt(baseData.time.split(':')[0]);
        if (!isWithinWorkingHours(venue, date, hour) || isBlackedOut('court', court.id, date, hour)) continue;
      } else {
        const conflict = coachBookings.some(b => 
          b.coachId === baseData.coachId && b.date === date && b.status !== 'cancelled' &&
          ((baseData.time >= b.time && baseData.time < addMinutes(b.time, b.duration)) || 
           (addMinutes(baseData.time, baseData.duration) > b.time && baseData.time < addMinutes(b.time, b.duration)))
        );
        if (conflict) continue;
        
        const hour = parseInt(baseData.time.split(':')[0]);
        if (!isWithinCoachWorkingHours(baseData.coachId, date, hour) || isBlackedOut('coach', baseData.coachId, date, hour)) continue;
      }
      
      newItems.push(item);
    }
    
    if (newItems.length > 0) {
      recurringGroups.push({
        id: groupId,
        type: baseData.type,
        startDate: baseData.date,
        endDate: endDate,
        pattern: recurringPattern,
        count: newItems.length,
        createdAt: new Date().toISOString()
      });
      await api.saveRecurringGroups(recurringGroups);
    }
    
    return newItems;
  }

  document.getElementById('bookingForm').addEventListener('submit', async e => {
    e.preventDefault();
    const type = document.getElementById('bookingType').value;
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const duration = +document.getElementById('bookingDuration').value;
    const recurringSelect = document.getElementById('bookingRecurring');
    const recurring = recurringSelect ? recurringSelect.value : 'none';
    const endDate = recurring !== 'none' ? document.getElementById('recurringEndDate').value : null;
    
    if (recurring !== 'none' && !endDate) {
      showToast('الرجاء تحديد تاريخ انتهاء التكرار', false);
      return;
    }
    
    let baseData;
    if (type === 'court') {
      const courtId = document.getElementById('bookingCourtId').value;
      const court = courts.find(c => c.id === courtId);
      if (!court) return;
      const totalPrice = calculateBookingPrice(court, date, time, duration);
      baseData = { 
        type: 'court',
        courtId, 
        venueId: court.venueId, 
        venueName: venues.find(v => v.id === court.venueId)?.name, 
        courtName: court.name, 
        date, time, duration, 
        customerId: currentUser.id, 
        customerName: currentUser.name,
        price: totalPrice
      };
    } else {
      const coachId = document.getElementById('bookingCoachId').value;
      const coach = coaches.find(c => c.id === coachId);
      if (!coach) return;
      const totalPrice = coach.hourlyRate * duration;
      baseData = { 
        type: 'coach',
        coachId, 
        coachName: coach.name, 
        date, time, duration, 
        customerId: currentUser.id, 
        customerName: currentUser.name,
        price: totalPrice
      };
    }
    
    if (recurring !== 'none') {
      const recurringItems = await createRecurringBookings(baseData, recurring, endDate);
      if (recurringItems.length === 0) {
        showToast('لا توجد تواريخ متاحة للحجز المتكرر', false);
        return;
      }
      for (const item of recurringItems) {
        await addToCart(item);
      }
      showToast(`تمت إضافة ${recurringItems.length} حجوزات متكررة إلى السلة`);
    } else {
      const added = await addToCart(baseData);
      if (!added) return;
    }
    
    document.getElementById('bookingModal').style.visibility = 'hidden';
  });
  
  document.getElementById('bookNowDirectBtn').addEventListener('click', async () => {
    const type = document.getElementById('bookingType').value;
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const duration = +document.getElementById('bookingDuration').value;
    const recurringSelect = document.getElementById('bookingRecurring');
    const recurring = recurringSelect ? recurringSelect.value : 'none';
    const endDate = recurring !== 'none' ? document.getElementById('recurringEndDate').value : null;
    
    let baseData;
    let totalPrice = 0;
    
    if (type === 'court') {
      const courtId = document.getElementById('bookingCourtId').value;
      const court = courts.find(c => c.id === courtId);
      if (!court) return;
      totalPrice = calculateBookingPrice(court, date, time, duration);
      baseData = { 
        type: 'court',
        courtId, 
        venueId: court.venueId, 
        venueName: venues.find(v => v.id === court.venueId)?.name, 
        courtName: court.name, 
        date, time, duration, 
        customerId: currentUser.id, 
        customerName: currentUser.name, 
        price: totalPrice 
      };
    } else {
      const coachId = document.getElementById('bookingCoachId').value;
      const coach = coaches.find(c => c.id === coachId);
      if (!coach) return;
      totalPrice = coach.hourlyRate * duration;
      baseData = { 
        type: 'coach',
        coachId, 
        coachName: coach.name, 
        date, time, duration, 
        customerId: currentUser.id, 
        customerName: currentUser.name, 
        price: totalPrice 
      };
    }
    
    let items = [baseData];
    let totalAmount = totalPrice;
    
    if (recurring !== 'none' && endDate) {
      const recurringItems = await createRecurringBookings(baseData, recurring, endDate);
      if (recurringItems.length === 0) {
        showToast('لا توجد تواريخ متاحة للحجز المتكرر', false);
        return;
      }
      items = recurringItems;
      totalAmount = items.reduce((sum, item) => sum + item.price, 0);
    }
    
    pendingBooking = { 
      items: items,
      total: totalAmount,
      appFee: totalAmount * 0.15,
      customerId: currentUser.id,
      customerName: currentUser.name
    };
    document.getElementById('bookingModal').style.visibility = 'hidden';
    showPaymentModal(pendingBooking);
  });

  document.getElementById('checkoutCartBtn').addEventListener('click', checkoutCart);

  // ---------- الدفع (مع دعم الكوبونات) ----------
  function showPaymentModal(b) {
    const currencySymbol = getCurrencySymbol(currentCurrency);
    let itemsHtml = '';
    if (b.items) {
      itemsHtml = b.items.map(item => {
        if (item.type === 'court') {
          return `<p><strong>🏟️ ${item.courtName} (${item.venueName})</strong><br>${item.date} ${item.time} (${item.duration} ساعة)</p>`;
        } else {
          return `<p><strong>👤 ${item.coachName}</strong><br>${item.date} ${item.time} (${item.duration} ساعة)</p>`;
        }
      }).join('');
    } else {
      itemsHtml = `<p><strong>${b.venueName || b.coachName}</strong><br>${b.date} ${b.time} (${b.duration} ساعة)</p>`;
    }
    
    const promoSection = `
      <div class="form-group">
        <label>كود الخصم (اختياري)</label>
        <div style="display:flex; gap:8px;">
          <input type="text" id="promoCodeInput" placeholder="أدخل الكود" style="flex:1;">
          <button type="button" id="applyPromoBtn" class="btn-outline btn-sm">تطبيق</button>
        </div>
        <div id="promoMessage"></div>
      </div>
    `;
    
    document.getElementById('paymentDetails').innerHTML = itemsHtml + promoSection + `<p>الإجمالي: <span id="displayTotal">${b.total}</span> ${currencySymbol} (رسوم: ${b.appFee.toFixed(2)} ${currencySymbol})</p>`;
    document.getElementById('paymentModal').style.visibility = 'visible';
    
    let appliedPromo = null;
    let discountedTotal = b.total;
    
    document.getElementById('applyPromoBtn').addEventListener('click', () => {
      const code = document.getElementById('promoCodeInput').value.trim();
      if (!code) return;
      
      const validation = validatePromoCode(code);
      if (!validation.valid) {
        document.getElementById('promoMessage').innerHTML = `<span style="color:#ef4444;">${validation.reason}</span>`;
        return;
      }
      
      appliedPromo = validation.promo;
      discountedTotal = applyPromoToTotal(b.total, appliedPromo);
      document.getElementById('displayTotal').textContent = discountedTotal.toFixed(2);
      document.getElementById('promoMessage').innerHTML = `<span style="color:#10b981;">تم تطبيق الخصم: ${appliedPromo.code}</span>`;
      pendingBooking.discountAmount = b.total - discountedTotal;
      pendingBooking.promoCode = appliedPromo.code;
      pendingBooking.finalTotal = discountedTotal;
    });
    
    document.getElementById('confirmPaymentBtn').onclick = async () => {
      const cardNumber = document.getElementById('cardNumber').value;
      if (!cardNumber || cardNumber.length < 16) {
        showToast('رقم البطاقة غير صالح', false);
        return;
      }
      
      const finalTotal = discountedTotal;
      const newBookings = [];
      const newSessions = [];
      
      if (pendingBooking.items) {
        for (const item of pendingBooking.items) {
          const requiresApproval = item.type === 'court' ? 
            (venues.find(v => v.id === item.venueId)?.requiresApproval || false) : false;
          
          const status = requiresApproval ? 'pending' : 'confirmed';
          
          if (item.type === 'court') {
            const court = courts.find(c => c.id === item.courtId);
            const price = calculateBookingPrice(court, item.date, item.time, item.duration);
            const booking = {
              id: Date.now() + '-' + Math.random().toString(36),
              ...item,
              price: price,
              appFee: price * 0.15,
              status: status,
              rated: false,
              promoCode: appliedPromo?.code || null
            };
            newBookings.push(booking);
            const venue = venues.find(v => v.id === item.venueId);
            if (venue) {
              if (requiresApproval) {
                addNotification(venue.ownerId, `حجز جديد بانتظار الموافقة في ${item.courtName} من ${item.customerName}`);
              } else {
                addNotification(venue.ownerId, `حجز جديد في ${item.courtName} (${venue.name}) من ${item.customerName} بتاريخ ${item.date} ${item.time}`);
              }
              addNotification(item.customerId, `تم ${requiresApproval ? 'إرسال طلب حجزك للموافقة' : 'تأكيد حجزك'} في ${venue.name}`);
            }
          } else {
            const coach = coaches.find(c => c.id === item.coachId);
            const price = coach.hourlyRate * item.duration;
            const session = {
              id: Date.now() + '-' + Math.random().toString(36),
              ...item,
              price: price,
              appFee: price * 0.15,
              status: 'confirmed',
              rated: false,
              promoCode: appliedPromo?.code || null
            };
            newSessions.push(session);
            addNotification(coach.ownerId, `جلسة تدريبية جديدة مع ${item.customerName} بتاريخ ${item.date} ${item.time}`);
            addNotification(item.customerId, `تم تأكيد جلستك مع ${coach.name}`);
          }
        }
      }
      
      if (newBookings.length) {
        bookings.push(...newBookings);
        await api.saveBookings(bookings);
      }
      if (newSessions.length) {
        coachBookings.push(...newSessions);
        await api.saveCoachBookings(coachBookings);
      }
      
      if (appliedPromo) {
        appliedPromo.usedCount = (appliedPromo.usedCount || 0) + 1;
        await api.savePromoCodes(promoCodes);
      }
      
      cart = [];
      await api.saveCart(cart);
      updateCartUI();
      
      showToast('تم تأكيد الحجز والدفع بنجاح');
      document.getElementById('paymentModal').style.visibility = 'hidden';
      pendingBooking = null;
      
      if (currentViewMode === 'courts') renderCourts(document.getElementById('sportFilter').value);
      else renderCoaches(document.getElementById('sportFilter').value);
      
      if (document.getElementById('venueDashboard').classList.contains('active')) loadVenueDashboard();
      if (document.getElementById('coachDashboard').classList.contains('active')) loadCoachDashboard();
      if (document.getElementById('adminDashboard').classList.contains('active')) loadAdminDashboard('bookings');
      renderCustomerBookings();
      updateNotificationBadge();
    };
  }

  // ---------- تعديل منشأة ----------
  function openEditVenueModal(venueId) {
    const venue = venues.find(v => v.id === venueId);
    if (!venue) return;
    if (currentUser.role !== 'admin' && venue.ownerId !== currentUser.id) return showToast('غير مصرح', false);
    document.getElementById('editVenueId').value = venue.id;
    document.getElementById('editVenueName').value = venue.name;
    document.getElementById('editVenueDesc').value = venue.desc || '';
    document.getElementById('editVenuePhone').value = venue.phone;
    document.getElementById('editVenueImage').value = '';
    if (venue.pricing) {
      document.getElementById('editPricePeriod1').value = venue.pricing[0];
      document.getElementById('editPricePeriod2').value = venue.pricing[1];
      document.getElementById('editPricePeriod3').value = venue.pricing[2];
      document.getElementById('editPricePeriod4').value = venue.pricing[3];
    }
    if (editMiniMap) { editMiniMap.remove(); editMiniMap = null; }
    const lat = venue.lat || 24.7136, lng = venue.lng || 46.6753;
    editMiniMap = L.map('editMiniMap').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(editMiniMap);
    editMarker = L.marker([lat, lng], { draggable: true }).addTo(editMiniMap);
    function update() { 
      const ll = editMarker.getLatLng(); 
      document.getElementById('editVenueLat').value = ll.lat.toFixed(6); 
      document.getElementById('editVenueLng').value = ll.lng.toFixed(6); 
    }
    editMarker.on('dragend', update); 
    editMiniMap.on('click', e => { editMarker.setLatLng(e.latlng); update(); }); 
    update();
    renderWorkingHoursEditor(venue.workingHours || {});
    document.getElementById('editVenueModal').style.visibility = 'visible';
  }
  
  document.getElementById('editGetLocationBtn').addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      if (editMiniMap) { editMiniMap.setView([lat, lng], 15); editMarker.setLatLng([lat, lng]); }
      document.getElementById('editVenueLat').value = lat; 
      document.getElementById('editVenueLng').value = lng;
    });
  });
  
  document.getElementById('editVenueForm').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('editVenueId').value;
    const venue = venues.find(v => v.id === id);
    if (!venue) return;
    venue.name = sanitizeInput(document.getElementById('editVenueName').value.trim());
    venue.desc = sanitizeInput(document.getElementById('editVenueDesc').value);
    venue.phone = document.getElementById('editVenuePhone').value;
    venue.lat = parseFloat(document.getElementById('editVenueLat').value);
    venue.lng = parseFloat(document.getElementById('editVenueLng').value);
    venue.pricing = [
      +document.getElementById('editPricePeriod1').value,
      +document.getElementById('editPricePeriod2').value,
      +document.getElementById('editPricePeriod3').value,
      +document.getElementById('editPricePeriod4').value
    ];
    venue.workingHours = collectWorkingHoursFromEditor();
    const imgFile = document.getElementById('editVenueImage').files[0];
    if (imgFile) venue.image = await new Promise(r => { 
      const reader = new FileReader(); 
      reader.onload = e => r(e.target.result); 
      reader.readAsDataURL(imgFile); 
    });
    await api.saveVenues(venues);
    showToast('تم التحديث');
    document.getElementById('editVenueModal').style.visibility = 'hidden';
    if (document.getElementById('adminDashboard').classList.contains('active')) loadAdminDashboard('venues');
    if (document.getElementById('venueDashboard').classList.contains('active')) loadVenueDashboard();
    if (currentViewMode === 'courts') renderCourts();
  });
  
    // ---------- الملف الشخصي للمستخدم ----------
  function loadProfilePage() {
    if (!currentUser) {
      switchSection('home');
      showToast('يجب تسجيل الدخول', false);
      return;
    }
    
    const profileSection = document.getElementById('profile');
    if (!profileSection) {
      // إنشاء صفحة الملف الشخصي إذا لم تكن موجودة
      const main = document.querySelector('main');
      const section = document.createElement('section');
      section.id = 'profile';
      section.className = 'section';
      section.innerHTML = `
        <div class="card">
          <h2><i class="fas fa-user-circle"></i> ${t('profile')}</h2>
          <div id="profileContent"></div>
        </div>
      `;
      main.appendChild(section);
      sections.push(section);
    }
    
    renderProfileContent();
  }
  
  function renderProfileContent() {
    const container = document.getElementById('profileContent');
    const user = currentUser;
    
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:24px;">
        <div style="position:relative;">
          <img src="${user.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&size=100&background=38bdf8&color=fff'}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:3px solid #38bdf8;">
          <label for="profileImageUpload" style="position:absolute; bottom:0; right:0; background:#0f172a; color:white; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer;">
            <i class="fas fa-camera"></i>
          </label>
          <input type="file" id="profileImageUpload" accept="image/*" style="display:none;">
        </div>
        <h3 style="margin-top:12px;">${sanitizeInput(user.name)}</h3>
        <p>${user.email} (${t(user.role)})</p>
      </div>
      
      <form id="profileForm">
        <div class="form-group">
          <label>${t('name')}</label>
          <input type="text" id="profileName" value="${sanitizeInput(user.name)}" required>
        </div>
        <div class="form-group">
          <label>${t('email')}</label>
          <input type="email" id="profileEmail" value="${user.email}" required>
        </div>
        <div class="form-group">
          <label>${t('phone')}</label>
          <input type="tel" id="profilePhone" value="${user.phone || ''}">
        </div>
        <button type="submit" class="btn btn-primary">${t('saveChanges')}</button>
      </form>
      
      <hr style="margin:24px 0;">
      
      <h4>${t('changePassword')}</h4>
      <form id="passwordForm">
        <div class="form-group">
          <label>${t('currentPassword')}</label>
          <input type="password" id="currentPassword" required>
        </div>
        <div class="form-group">
          <label>${t('newPassword')}</label>
          <input type="password" id="newPassword" required>
        </div>
        <div class="form-group">
          <label>${t('confirmPassword')}</label>
          <input type="password" id="confirmPassword" required>
        </div>
        <button type="submit" class="btn btn-primary">${t('changePassword')}</button>
      </form>
    `;
    
    document.getElementById('profileImageUpload').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (ev) => {
          currentUser.profileImage = ev.target.result;
          await api.saveUsers(users);
          renderProfileContent();
          updateUserArea();
          showToast(t('profileImageUpdated'));
        };
        reader.readAsDataURL(file);
      }
    });
    
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = sanitizeInput(document.getElementById('profileName').value.trim());
      const email = document.getElementById('profileEmail').value.trim();
      const phone = document.getElementById('profilePhone').value.trim();
      
      if (email !== currentUser.email && users.some(u => u.email === email)) {
        showToast(t('emailAlreadyUsed'), false);
        return;
      }
      
      currentUser.name = name;
      currentUser.email = email;
      currentUser.phone = phone;
      
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex > -1) {
        users[userIndex] = { ...users[userIndex], name, email, phone };
        await api.saveUsers(users);
        await api.setSession(currentUser);
      }
      
      updateUserArea();
      showToast(t('profileUpdated'));
    });
    
    document.getElementById('passwordForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPass = document.getElementById('currentPassword').value;
      const newPass = document.getElementById('newPassword').value;
      const confirmPass = document.getElementById('confirmPassword').value;
      
      if (currentUser.password !== currentPass) {
        showToast(t('incorrectPassword'), false);
        return;
      }
      
      if (newPass !== confirmPass) {
        showToast(t('passwordsMismatch'), false);
        return;
      }
      
      if (newPass.length < 4) {
        showToast(t('passwordTooShort'), false);
        return;
      }
      
      currentUser.password = newPass;
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex > -1) {
        users[userIndex].password = newPass;
        await api.saveUsers(users);
        await api.setSession(currentUser);
      }
      
      document.getElementById('passwordForm').reset();
      showToast(t('passwordChanged'));
    });
  }

  // ---------- صفحة المفضلة ----------
  function loadFavoritesPage() {
    if (!currentUser) {
      switchSection('home');
      showToast(t('loginRequired'), false);
      return;
    }
    
    const favoritesSection = document.getElementById('favorites');
    if (!favoritesSection) {
      const main = document.querySelector('main');
      const section = document.createElement('section');
      section.id = 'favorites';
      section.className = 'section';
      section.innerHTML = `
        <div class="card">
          <h2><i class="fas fa-heart"></i> ${t('favorites')}</h2>
          <div id="favoritesContent"></div>
        </div>
      `;
      main.appendChild(section);
      sections.push(section);
    }
    
    renderFavoritesContent();
  }
  
  function renderFavoritesContent() {
    const container = document.getElementById('favoritesContent');
    const userFavorites = favorites.filter(f => f.userId === currentUser.id);
    
    if (userFavorites.length === 0) {
      container.innerHTML = `<p>${t('noFavorites')}</p>`;
      return;
    }
    
    const currencySymbol = getCurrencySymbol(currentCurrency);
    let html = '<div class="venues-grid">';
    
    userFavorites.forEach(fav => {
      if (fav.itemType === 'venue') {
        const venue = venues.find(v => v.id === fav.itemId);
        if (!venue) return;
        const venueCourts = courts.filter(c => c.venueId === venue.id);
        const minPrice = Math.min(...venueCourts.map(c => c.pricing ? Math.min(...c.pricing) : (venue.pricing ? Math.min(...venue.pricing) : 50)));
        const venueReviews = reviews[venue.id] || [];
        const avgRating = venueReviews.length > 0 ? (venueReviews.reduce((s, r) => s + r.rating, 0) / venueReviews.length).toFixed(1) : '0.0';
        const starsHtml = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
        
        html += `<div class="venue-card">
          <div class="venue-img" style="background-image:url('${venue.image || 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg'}');">
            <button class="favorite-btn" onclick="window.toggleFavorite('venue', '${venue.id}')" style="position:absolute; top:12px; left:12px; background:white; border:none; border-radius:50%; width:32px; height:32px; cursor:pointer;">
              <i class="fas fa-heart" style="color:#ef4444;"></i>
            </button>
          </div>
          <div class="venue-info">
            <div class="venue-name">${sanitizeInput(venue.name)}</div>
            <div class="venue-rating"><span style="color:#fbbf24;">${starsHtml}</span> ${avgRating}</div>
            <div class="venue-desc">${sanitizeInput(venue.desc || '')}</div>
            <div class="venue-pricing">${t('from')} ${minPrice} ${currencySymbol}/${t('hour')}</div>
            <button class="btn btn-primary view-venue-btn" data-venue-id="${venue.id}">${t('viewCourts')}</button>
          </div>
        </div>`;
      } else if (fav.itemType === 'coach') {
        const coach = coaches.find(c => c.id === fav.itemId);
        if (!coach) return;
        const coachRatingList = coachReviews[coach.id] || [];
        const avgRating = coachRatingList.length > 0 ? (coachRatingList.reduce((s, r) => s + r.rating, 0) / coachRatingList.length).toFixed(1) : '0.0';
        const starsHtml = '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating));
        
        html += `<div class="coach-card">
          <div class="coach-img" style="background-image:url('${coach.image || 'https://images.pexels.com/photos/3775566/pexels-photo-3775566.jpeg'}');">
            <button class="favorite-btn" onclick="window.toggleFavorite('coach', '${coach.id}')" style="position:absolute; top:12px; left:12px; background:white; border:none; border-radius:50%; width:32px; height:32px; cursor:pointer;">
              <i class="fas fa-heart" style="color:#ef4444;"></i>
            </button>
          </div>
          <div class="coach-info">
            <div class="coach-name">${sanitizeInput(coach.name)}</div>
            <div class="coach-sport">${getSportDisplayName(coach.sport)}</div>
            <div class="coach-rating"><span style="color:#fbbf24;">${starsHtml}</span> ${avgRating}</div>
            <div class="coach-pricing">${coach.hourlyRate} ${currencySymbol}/${t('hour')}</div>
            <button class="btn btn-primary book-coach-btn" data-coach-id="${coach.id}">${t('bookSession')}</button>
          </div>
        </div>`;
      }
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    container.querySelectorAll('.view-venue-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentViewMode = 'courts';
        document.getElementById('showCourtsBtn').classList.add('active');
        document.getElementById('showCoachesBtn').classList.remove('active');
        switchSection('home');
        renderCourts();
      });
    });
    
    container.querySelectorAll('.book-coach-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        currentViewMode = 'coaches';
        document.getElementById('showCoachesBtn').classList.add('active');
        document.getElementById('showCourtsBtn').classList.remove('active');
        switchSection('home');
        renderCoaches();
        setTimeout(() => openBookingModal(btn.dataset.coachId, 'coach'), 100);
      });
    });
  }

  // ---------- لوحة التحليلات (Analytics) ----------
  function loadAnalyticsDashboard() {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'venue' && currentUser.role !== 'coach')) {
      showToast(t('unauthorized'), false);
      return;
    }
    
    const analyticsSection = document.getElementById('analytics');
    if (!analyticsSection) {
      const main = document.querySelector('main');
      const section = document.createElement('section');
      section.id = 'analytics';
      section.className = 'section';
      section.innerHTML = `
        <div class="card">
          <h2><i class="fas fa-chart-bar"></i> ${t('analytics')}</h2>
          <div id="analyticsContent"></div>
        </div>
      `;
      main.appendChild(section);
      sections.push(section);
    }
    
    renderAnalyticsContent();
  }
  
  function renderAnalyticsContent() {
    const container = document.getElementById('analyticsContent');
    const currencySymbol = getCurrencySymbol(currentCurrency);
    
    let dataSource = [];
    let title = '';
    
    if (currentUser.role === 'admin') {
      dataSource = [...bookings, ...coachBookings];
      title = t('allVenuesAndCoaches');
    } else if (currentUser.role === 'venue') {
      const myVenues = venues.filter(v => v.ownerId === currentUser.id);
      dataSource = bookings.filter(b => myVenues.some(v => v.id === b.venueId));
      title = myVenues.map(v => v.name).join('، ');
    } else if (currentUser.role === 'coach') {
      const myCoach = coaches.find(c => c.ownerId === currentUser.id);
      dataSource = coachBookings.filter(b => b.coachId === myCoach?.id);
      title = myCoach?.name || '';
    }
    
    const confirmedBookings = dataSource.filter(b => b.status === 'confirmed' || b.status === 'مدفوع');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const bookingCount = confirmedBookings.length;
    
    // تجميع البيانات الشهرية
    const monthlyData = {};
    confirmedBookings.forEach(b => {
      const month = b.date.substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, count: 0 };
      monthlyData[month].revenue += b.price || 0;
      monthlyData[month].count += 1;
    });
    
    const months = Object.keys(monthlyData).sort();
    const revenues = months.map(m => monthlyData[m].revenue);
    const counts = months.map(m => monthlyData[m].count);
    
    // أكثر الرياضات طلباً
    const sportCounts = {};
    confirmedBookings.forEach(b => {
      let sport = 'أخرى';
      if (b.type === 'court') {
        const court = courts.find(c => c.id === b.courtId);
        sport = court?.sport || 'أخرى';
      } else {
        const coach = coaches.find(c => c.id === b.coachId);
        sport = coach?.sport || 'أخرى';
      }
      sportCounts[sport] = (sportCounts[sport] || 0) + 1;
    });
    
    const sportLabels = Object.keys(sportCounts);
    const sportValues = Object.values(sportCounts);
    
    // الأوقات الأكثر ازدحاماً
    const hourCounts = new Array(24).fill(0);
    confirmedBookings.forEach(b => {
      const hour = parseInt(b.time.split(':')[0]);
      hourCounts[hour] += 1;
    });
    
    let html = `
      <div style="display:flex; justify-content:space-between; margin-bottom:24px;">
        <button class="btn-outline btn-sm" id="exportExcelBtn"><i class="fas fa-file-excel"></i> ${t('exportExcel')}</button>
        <button class="btn-outline btn-sm" id="exportPDFBtn"><i class="fas fa-file-pdf"></i> ${t('exportPDF')}</button>
      </div>
      
      <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px;">
        <div class="card" style="padding:16px; text-align:center;">
          <h3>${totalRevenue.toFixed(2)} ${currencySymbol}</h3>
          <p>${t('totalRevenue')}</p>
        </div>
        <div class="card" style="padding:16px; text-align:center;">
          <h3>${bookingCount}</h3>
          <p>${t('bookingCount')}</p>
        </div>
        <div class="card" style="padding:16px; text-align:center;">
          <h3>${(totalRevenue / (bookingCount || 1)).toFixed(2)} ${currencySymbol}</h3>
          <p>${t('averageBookingValue')}</p>
        </div>
      </div>
      
      <div class="card" style="padding:16px; margin-bottom:24px;">
        <h4>${t('monthlyRevenue')}</h4>
        <canvas id="revenueChart" style="max-height:300px;"></canvas>
      </div>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
        <div class="card" style="padding:16px;">
          <h4>${t('popularSports')}</h4>
          <canvas id="sportChart" style="max-height:250px;"></canvas>
        </div>
        <div class="card" style="padding:16px;">
          <h4>${t('peakHours')}</h4>
          <canvas id="hourChart" style="max-height:250px;"></canvas>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // رسم Chart.js
    setTimeout(() => {
      if (typeof Chart === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => drawCharts();
        document.head.appendChild(script);
      } else {
        drawCharts();
      }
      
      function drawCharts() {
        // رسم الإيرادات الشهرية
        new Chart(document.getElementById('revenueChart'), {
          type: 'line',
          data: {
            labels: months,
            datasets: [{
              label: t('revenue'),
              data: revenues,
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              fill: true
            }]
          },
          options: { responsive: true, maintainAspectRatio: true }
        });
        
        // رسم الرياضات
        new Chart(document.getElementById('sportChart'), {
          type: 'doughnut',
          data: {
            labels: sportLabels.map(s => getSportDisplayName(s)),
            datasets: [{
              data: sportValues,
              backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#38bdf8']
            }]
          }
        });
        
        // رسم الأوقات
        new Chart(document.getElementById('hourChart'), {
          type: 'bar',
          data: {
            labels: Array.from({length: 24}, (_, i) => i + ':00'),
            datasets: [{
              label: t('bookings'),
              data: hourCounts,
              backgroundColor: '#38bdf8'
            }]
          }
        });
      }
    }, 100);
    
    // تصدير Excel
    document.getElementById('exportExcelBtn').addEventListener('click', () => {
      const data = [
        [t('date'), t('time'), t('type'), t('name'), t('customer'), t('price'), t('status')],
        ...confirmedBookings.map(b => [
          b.date, b.time, b.type === 'court' ? t('court') : t('coach'),
          b.type === 'court' ? b.courtName : b.coachName,
          b.customerName, b.price, b.status
        ])
      ];
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, t('bookings'));
      XLSX.writeFile(wb, `${t('bookingsReport')}_${new Date().toISOString().slice(0,10)}.xlsx`);
    });
    
    // تصدير PDF
    document.getElementById('exportPDFBtn').addEventListener('click', () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      doc.setFont('Amiri');
      doc.text(`${t('analyticsReport')} - ${title}`, 20, 20);
      doc.text(`${t('totalRevenue')}: ${totalRevenue.toFixed(2)} ${currencySymbol}`, 20, 30);
      doc.text(`${t('bookingCount')}: ${bookingCount}`, 20, 40);
      
      let y = 60;
      confirmedBookings.slice(0, 20).forEach(b => {
        doc.text(`${b.date} ${b.time} - ${b.type === 'court' ? b.courtName : b.coachName} - ${b.price} ${currencySymbol}`, 20, y);
        y += 10;
      });
      
      doc.save(`${t('report')}_${new Date().toISOString().slice(0,10)}.pdf`);
    });
  }
  
    // ---------- لوحة الأدمن الموسعة (تشمل جميع التبويبات) ----------
  async function loadAdminDashboard(tab = 'venues') {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    // إزالة الفئة النشطة من جميع الأزرار
    document.querySelectorAll('#adminDashboard .btn-outline').forEach(b => b.classList.remove('active'));
    // تفعيل الزر المناسب
    const activeBtn = document.getElementById(`adminTab${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    const currencySymbol = getCurrencySymbol(currentCurrency);
    let html = '';
    
    // --- التبويب: المنشآت ---
    if (tab === 'venues') {
      html = `<button class="btn btn-primary" onclick="document.querySelector('[data-section=registerVenue]').click()">${t('addVenue')}</button>
        <table class="admin-table"><tr><th>${t('name')}</th><th>${t('owner')}</th><th>${t('rating')}</th><th>${t('actions')}</th></tr>`;
      venues.forEach(v => {
        const owner = users.find(u => u.id === v.ownerId)?.name || t('unknown');
        const venueReviews = reviews[v.id] || [];
        const avg = venueReviews.length > 0 ? (venueReviews.reduce((s, r) => s + r.rating, 0) / venueReviews.length).toFixed(1) : '-';
        html += `<tr><td>${sanitizeInput(v.name)}</td><td>${owner}</td><td>${avg} (${venueReviews.length})</td>
          <td><button class="btn-outline btn-sm edit-venue-btn" data-id="${v.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-outline btn-sm delete-venue-btn" data-id="${v.id}"><i class="fas fa-trash"></i></button></td></tr>`;
      });
      html += '</table>';
      content.innerHTML = html;
      
      content.querySelectorAll('.delete-venue-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          const id = btn.dataset.id;
          showConfirm(t('confirmDeleteVenue'), async () => {
            venues = venues.filter(v => v.id !== id);
            bookings = bookings.filter(b => b.venueId !== id);
            courts = courts.filter(c => c.venueId !== id);
            await api.saveVenues(venues);
            await api.saveBookings(bookings);
            await api.saveCourts(courts);
            loadAdminDashboard('venues');
          });
        });
      });
      content.querySelectorAll('.edit-venue-btn').forEach(btn => {
        btn.addEventListener('click', e => openEditVenueModal(btn.dataset.id));
      });
    }
    
    // --- التبويب: المستخدمين ---
    else if (tab === 'users') {
      html = `<table class="admin-table"><tr><th>${t('name')}</th><th>${t('email')}</th><th>${t('role')}</th><th>${t('phone')}</th><th>${t('status')}</th><th>${t('actions')}</th></tr>`;
      users.forEach(u => {
        html += `<tr><td>${sanitizeInput(u.name)}</td><td>${u.email}</td><td>${t(u.role)}</td><td>${u.phone || '-'}</td>
          <td>${u.blocked ? t('blocked') : t('active')}</td>
          <td>${u.role !== 'admin' ? `<button class="btn-outline btn-sm toggle-block-btn" data-id="${u.id}">${u.blocked ? t('unblock') : t('block')}</button>
          <button class="btn-outline btn-sm delete-user-btn" data-id="${u.id}"><i class="fas fa-trash"></i></button>` : ''}</td></tr>`;
      });
      html += '</table>';
      content.innerHTML = html;
      
      content.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          const id = btn.dataset.id;
          showConfirm(t('confirmDeleteUser'), async () => {
            users = users.filter(u => u.id !== id);
            await api.saveUsers(users);
            loadAdminDashboard('users');
          });
        });
      });
      content.querySelectorAll('.toggle-block-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          const id = btn.dataset.id;
          const user = users.find(u => u.id === id);
          if (user) {
            user.blocked = !user.blocked;
            await api.saveUsers(users);
            loadAdminDashboard('users');
            showToast(user.blocked ? t('userBlocked') : t('userUnblocked'));
          }
        });
      });
    }
    
    // --- التبويب: الحجوزات (ملاعب + مدربين) ---
    else if (tab === 'bookings') {
      html = `<h3>${t('courtBookings')}</h3><table class="admin-table"><tr><th>${t('venue')}</th><th>${t('customer')}</th><th>${t('date')}</th><th>${t('amount')}</th><th>${t('status')}</th></tr>`;
      bookings.forEach(b => {
        html += `<tr><td>${sanitizeInput(b.venueName)}</td><td>${sanitizeInput(b.customerName)}</td><td>${b.date} ${b.time}</td><td>${b.price} ${currencySymbol}</td><td>${b.status || t('confirmed')}</td></tr>`;
      });
      html += `</table><h3 style="margin-top:24px;">${t('coachSessions')}</h3><table class="admin-table"><tr><th>${t('coach')}</th><th>${t('customer')}</th><th>${t('date')}</th><th>${t('amount')}</th><th>${t('status')}</th></tr>`;
      coachBookings.forEach(s => {
        html += `<tr><td>${sanitizeInput(s.coachName)}</td><td>${sanitizeInput(s.customerName)}</td><td>${s.date} ${s.time}</td><td>${s.price} ${currencySymbol}</td><td>${s.status || t('confirmed')}</td></tr>`;
      });
      html += '</table>';
      content.innerHTML = html;
    }
    
    // --- التبويب: المدربين ---
    else if (tab === 'coaches') {
      html = `<button class="btn btn-primary" onclick="document.querySelector('[data-section=registerCoach]').click()">${t('addCoach')}</button>
        <table class="admin-table"><tr><th>${t('name')}</th><th>${t('sport')}</th><th>${t('hourlyRate')}</th><th>${t('rating')}</th><th>${t('actions')}</th></tr>`;
      coaches.forEach(c => {
        const coachRatingList = coachReviews[c.id] || [];
        const avg = coachRatingList.length > 0 ? (coachRatingList.reduce((s, r) => s + r.rating, 0) / coachRatingList.length).toFixed(1) : '-';
        html += `<tr><td>${sanitizeInput(c.name)}</td><td>${getSportDisplayName(c.sport)}</td><td>${c.hourlyRate} ${currencySymbol}</td><td>${avg} (${coachRatingList.length})</td>
          <td><button class="btn-outline btn-sm edit-coach-btn" data-id="${c.id}"><i class="fas fa-edit"></i></button>
          <button class="btn-outline btn-sm delete-coach-btn" data-id="${c.id}"><i class="fas fa-trash"></i></button></td></tr>`;
      });
      html += '</table>';
      content.innerHTML = html;
      
      content.querySelectorAll('.delete-coach-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          const id = btn.dataset.id;
          showConfirm(t('confirmDeleteCoach'), async () => {
            coaches = coaches.filter(c => c.id !== id);
            coachBookings = coachBookings.filter(s => s.coachId !== id);
            await api.saveCoaches(coaches);
            await api.saveCoachBookings(coachBookings);
            loadAdminDashboard('coaches');
          });
        });
      });
      content.querySelectorAll('.edit-coach-btn').forEach(btn => {
        btn.addEventListener('click', e => openEditCoachModal(btn.dataset.id));
      });
    }
    
    // --- التبويب: الكوبونات ---
    else if (tab === 'promos') {
      html = `<button class="btn btn-primary" id="addPromoBtn"><i class="fas fa-plus"></i> ${t('addPromo')}</button>
        <table class="admin-table"><tr><th>${t('code')}</th><th>${t('discount')}</th><th>${t('usage')}</th><th>${t('validity')}</th><th>${t('actions')}</th></tr>`;
      promoCodes.forEach(p => {
        const discountText = p.discountType === 'percentage' ? `${p.discountValue}%` : `${p.discountValue} ${currencySymbol}`;
        const validity = `${p.validFrom || t('now')} - ${p.validUntil || t('forever')}`;
        html += `<tr><td>${p.code}</td><td>${discountText}</td><td>${p.usedCount || 0} / ${p.maxUses || '∞'}</td>
          <td>${validity}</td>
          <td><button class="btn-outline btn-sm delete-promo-btn" data-code="${p.code}"><i class="fas fa-trash"></i></button></td></tr>`;
      });
      html += '</table>';
      content.innerHTML = html;
      
      document.getElementById('addPromoBtn').addEventListener('click', () => {
        const code = prompt(t('enterPromoCode'));
        if (!code) return;
        const type = prompt(t('enterDiscountType'), 'percentage');
        if (!type) return;
        const value = parseFloat(prompt(t('enterDiscountValue'), '10'));
        if (isNaN(value)) return;
        const maxUses = parseInt(prompt(t('enterMaxUses'), '')) || null;
        const validFrom = prompt(t('enterValidFrom'), '');
        const validUntil = prompt(t('enterValidUntil'), '');
        
        promoCodes.push({
          code: code.toUpperCase(),
          discountType: type,
          discountValue: value,
          maxUses,
          usedCount: 0,
          validFrom: validFrom || null,
          validUntil: validUntil || null,
          applicableTo: 'all',
          targetIds: []
        });
        api.savePromoCodes(promoCodes);
        loadAdminDashboard('promos');
        showToast(t('promoAdded'));
      });
      
      content.querySelectorAll('.delete-promo-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const code = btn.dataset.code;
          promoCodes = promoCodes.filter(p => p.code !== code);
          await api.savePromoCodes(promoCodes);
          loadAdminDashboard('promos');
          showToast(t('promoDeleted'));
        });
      });
    }
    
    // --- التبويب: الماليات ---
    else if (tab === 'finance') {
      const venueRev = bookings.filter(b => b.status === 'confirmed' || b.status === 'مدفوع').reduce((s, b) => s + (b.price || 0), 0);
      const coachRev = coachBookings.filter(s => s.status === 'confirmed' || s.status === 'مدفوع').reduce((s, b) => s + (b.price || 0), 0);
      const totalRev = venueRev + coachRev;
      const totalFee = bookings.reduce((s, b) => s + (b.appFee || 0), 0) + coachBookings.reduce((s, b) => s + (b.appFee || 0), 0);
      
      html = `<h3>${t('totalRevenue')}: ${totalRev.toFixed(2)} ${currencySymbol}</h3>
        <h4>${t('courtRevenue')}: ${venueRev.toFixed(2)} ${currencySymbol}</h4>
        <h4>${t('coachRevenue')}: ${coachRev.toFixed(2)} ${currencySymbol}</h4>
        <h4>${t('totalFees')}: ${totalFee.toFixed(2)} ${currencySymbol}</h4>`;
      content.innerHTML = html;
    }
    
    // --- التبويب: البيانات (استيراد/تصدير) ---
    else if (tab === 'data') {
      html = `<div style="display:flex;flex-direction:column;gap:16px;">
        <button id="exportDataBtn" class="btn btn-primary"><i class="fas fa-download"></i> ${t('exportJSON')}</button>
        <label class="btn btn-outline" style="width:auto;"><i class="fas fa-upload"></i> ${t('importJSON')}<input type="file" id="importFileInput" accept=".json" style="display:none;"></label>
        <button id="clearDataBtn" class="btn btn-danger">${t('clearData')}</button>
      </div>`;
      content.innerHTML = html;
      
      document.getElementById('exportDataBtn').addEventListener('click', () => {
        const data = { venues, bookings, users, customSports, reviews, blackouts, courts, coaches, coachBookings, coachAvailability, coachReviews, promoCodes, favorites, recurringGroups };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
      });
      
      document.getElementById('importFileInput').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          const text = await file.text();
          const imported = JSON.parse(text);
          if (!imported.venues || !imported.bookings || !imported.users) throw new Error(t('invalidStructure'));
          showConfirm(t('confirmReplaceData'), async () => {
            venues = imported.venues; bookings = imported.bookings; users = imported.users;
            customSports = imported.customSports || [];
            reviews = imported.reviews || {}; blackouts = imported.blackouts || {}; courts = imported.courts || [];
            coaches = imported.coaches || []; coachBookings = imported.coachBookings || [];
            coachAvailability = imported.coachAvailability || {}; coachReviews = imported.coachReviews || {};
            promoCodes = imported.promoCodes || []; favorites = imported.favorites || [];
            recurringGroups = imported.recurringGroups || [];
            
            if (!users.some(u => u.role === 'admin')) {
              users.push({ id: 'admin', email: 'admin@sport.com', password: 'admin', role: 'admin', name: t('admin'), blocked: false });
            }
            
            await api.saveVenues(venues); await api.saveBookings(bookings); await api.saveUsers(users);
            await api.saveCustomSports(customSports); await api.saveReviews(reviews); await api.saveBlackouts(blackouts);
            await api.saveCourts(courts); await api.saveCoaches(coaches); await api.saveCoachBookings(coachBookings);
            await api.saveCoachAvailability(coachAvailability); await api.saveCoachReviews(coachReviews);
            await api.savePromoCodes(promoCodes); await api.saveFavorites(favorites); await api.saveRecurringGroups(recurringGroups);
            
            populateSportSelects();
            showToast(t('importSuccess'));
            loadAdminDashboard('data');
            if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
          });
        } catch (err) {
          showToast(t('error') + ': ' + err.message, false);
        }
        e.target.value = '';
      });
      
      document.getElementById('clearDataBtn').addEventListener('click', () => {
        showConfirm(t('confirmClearData'), async () => {
          const admin = users.find(u => u.id === currentUser.id && u.role === 'admin') || { id: 'admin', email: 'admin@sport.com', password: 'admin', role: 'admin', name: t('admin') };
          venues = []; bookings = []; users = [admin]; customSports = []; reviews = {}; blackouts = {}; courts = [];
          coaches = []; coachBookings = []; coachAvailability = {}; coachReviews = {};
          promoCodes = []; favorites = []; recurringGroups = [];
          
          await api.saveVenues(venues); await api.saveBookings(bookings); await api.saveUsers(users);
          await api.saveCustomSports(customSports); await api.saveReviews(reviews); await api.saveBlackouts(blackouts);
          await api.saveCourts(courts); await api.saveCoaches(coaches); await api.saveCoachBookings(coachBookings);
          await api.saveCoachAvailability(coachAvailability); await api.saveCoachReviews(coachReviews);
          await api.savePromoCodes(promoCodes); await api.saveFavorites(favorites); await api.saveRecurringGroups(recurringGroups);
          
          populateSportSelects();
          showToast(t('dataCleared'));
          loadAdminDashboard('data');
          if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
        });
      });
    }
    
    // --- التبويب: متقدم (إحصائيات) ---
    else if (tab === 'advanced') {
      const totalUsers = users.length;
      const totalVenues = venues.length;
      const totalCourts = courts.length;
      const totalCoaches = coaches.length;
      const totalCourtBookings = bookings.length;
      const totalCoachSessions = coachBookings.length;
      
      const venueRatings = Object.values(reviews).flat();
      const avgVenueRating = venueRatings.length > 0 ? (venueRatings.reduce((s, r) => s + r.rating, 0) / venueRatings.length).toFixed(1) : '-';
      
      const coachRatings = Object.values(coachReviews).flat();
      const avgCoachRating = coachRatings.length > 0 ? (coachRatings.reduce((s, r) => s + r.rating, 0) / coachRatings.length).toFixed(1) : '-';
      
      html = `<h4>${t('advancedStats')}</h4>
        <p>${t('totalUsers')}: ${totalUsers}</p>
        <p>${t('totalVenues')}: ${totalVenues}</p>
        <p>${t('totalCourts')}: ${totalCourts}</p>
        <p>${t('totalCoaches')}: ${totalCoaches}</p>
        <p>${t('totalCourtBookings')}: ${totalCourtBookings}</p>
        <p>${t('totalCoachSessions')}: ${totalCoachSessions}</p>
        <p>${t('avgVenueRating')}: ${avgVenueRating}</p>
        <p>${t('avgCoachRating')}: ${avgCoachRating}</p>
        <p>${t('totalPromos')}: ${promoCodes.length}</p>
        <p>${t('totalFavorites')}: ${favorites.length}</p>`;
      content.innerHTML = html;
    }
  }
  
  // ربط أحداث التبويبات
  document.getElementById('adminTabVenues')?.addEventListener('click', () => loadAdminDashboard('venues'));
  document.getElementById('adminTabUsers')?.addEventListener('click', () => loadAdminDashboard('users'));
  document.getElementById('adminTabBookings')?.addEventListener('click', () => loadAdminDashboard('bookings'));
  document.getElementById('adminTabCoaches')?.addEventListener('click', () => loadAdminDashboard('coaches'));
  document.getElementById('adminTabPromos')?.addEventListener('click', () => loadAdminDashboard('promos'));
  document.getElementById('adminTabFinance')?.addEventListener('click', () => loadAdminDashboard('finance'));
  document.getElementById('adminTabData')?.addEventListener('click', () => loadAdminDashboard('data'));
  document.getElementById('adminTabAdvanced')?.addEventListener('click', () => loadAdminDashboard('advanced'));

  // ---------- إضافة رياضة مخصصة ----------
  document.getElementById('addSportBtn')?.addEventListener('click', async () => {
    const input = document.getElementById('newSportInput');
    if (await addCustomSport(input.value)) input.value = '';
  });

  // ---------- تغيير العملة يدوياً ----------
  document.getElementById('manualCurrencySelect').addEventListener('change', e => {
    changeCurrency(e.target.value);
  });

  // ---------- التبديل بين عرض الملاعب والمدربين ----------
  document.getElementById('showCourtsBtn').addEventListener('click', () => {
    currentViewMode = 'courts';
    document.getElementById('showCourtsBtn').classList.add('active');
    document.getElementById('showCoachesBtn').classList.remove('active');
    renderCourts(document.getElementById('sportFilter').value);
    updateMapMarkers();
  });
  
  document.getElementById('showCoachesBtn').addEventListener('click', () => {
    currentViewMode = 'coaches';
    document.getElementById('showCoachesBtn').classList.add('active');
    document.getElementById('showCourtsBtn').classList.remove('active');
    renderCoaches(document.getElementById('sportFilter').value);
    updateMapMarkers();
  });

  // ---------- إغلاق النوافذ ----------
  document.getElementById('closeBookingModal').addEventListener('click', () => document.getElementById('bookingModal').style.visibility = 'hidden');
  document.getElementById('cancelPaymentBtn').addEventListener('click', () => document.getElementById('paymentModal').style.visibility = 'hidden');
  document.getElementById('closeManageModalBtn').addEventListener('click', () => document.getElementById('manageBookingModal').style.visibility = 'hidden');
  document.getElementById('cancelBookingBtn').addEventListener('click', () => {
    const id = document.getElementById('manageBookingId').value;
    const type = document.getElementById('manageBookingType').value;
    cancelBooking(id, type);
    document.getElementById('manageBookingModal').style.visibility = 'hidden';
  });
  document.getElementById('closeEditModalBtn').addEventListener('click', () => document.getElementById('editVenueModal').style.visibility = 'hidden');
  document.getElementById('closeNotificationsModal').addEventListener('click', () => document.getElementById('notificationsModal').style.visibility = 'hidden');
  document.getElementById('clearNotificationsBtn').addEventListener('click', async () => {
    if (!currentUser) return;
    notifications = notifications.filter(n => n.userId !== currentUser.id);
    await api.saveNotifications(notifications);
    openNotifications();
    updateNotificationBadge();
  });
  
    // ---------- دوال i18n إضافية للقاموس (توسيع القاموس) ----------
  // تحديث قاموس i18n بالمفاتيح المفقودة
  Object.assign(i18n.ar, {
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    role: 'الدور',
    status: 'الحالة',
    actions: 'إجراءات',
    owner: 'المالك',
    rating: 'التقييم',
    addVenue: 'إضافة منشأة',
    addCoach: 'إضافة مدرب',
    addPromo: 'إضافة كوبون',
    code: 'الكود',
    discount: 'الخصم',
    usage: 'الاستخدام',
    validity: 'الصالحية',
    now: 'الآن',
    forever: 'دائم',
    enterPromoCode: 'أدخل كود الخصم (أحرف كبيرة):',
    enterDiscountType: 'نوع الخصم (percentage/value):',
    enterDiscountValue: 'قيمة الخصم:',
    enterMaxUses: 'الحد الأقصى للاستخدام (اتركه فارغاً لغير محدود):',
    enterValidFrom: 'تاريخ البداية (YYYY-MM-DD) أو اتركه فارغاً:',
    enterValidUntil: 'تاريخ النهاية (YYYY-MM-DD) أو اتركه فارغاً:',
    promoAdded: 'تم إضافة الكوبون',
    promoDeleted: 'تم حذف الكوبون',
    courtBookings: 'حجوزات الملاعب',
    coachSessions: 'جلسات التدريب',
    amount: 'المبلغ',
    courtRevenue: 'إيرادات الملاعب',
    coachRevenue: 'إيرادات المدربين',
    totalFees: 'إجمالي رسوم التطبيق',
    exportJSON: 'تصدير JSON',
    importJSON: 'استيراد JSON',
    clearData: 'مسح البيانات (عدا الأدمن)',
    invalidStructure: 'بنية غير صالحة',
    confirmReplaceData: 'استبدال جميع البيانات؟',
    importSuccess: 'تم الاستيراد بنجاح',
    error: 'خطأ',
    confirmClearData: 'مسح جميع البيانات (ما عدا الأدمن)؟',
    dataCleared: 'تم مسح البيانات',
    advancedStats: 'إحصائيات متقدمة',
    totalUsers: 'عدد المستخدمين',
    totalVenues: 'عدد المنشآت',
    totalCourts: 'عدد الملاعب',
    totalCoaches: 'عدد المدربين',
    totalCourtBookings: 'عدد حجوزات الملاعب',
    totalCoachSessions: 'عدد جلسات التدريب',
    avgVenueRating: 'متوسط تقييم المنشآت',
    avgCoachRating: 'متوسط تقييم المدربين',
    totalPromos: 'عدد الكوبونات',
    totalFavorites: 'عدد عناصر المفضلة',
    blocked: 'محظور',
    active: 'نشط',
    unblock: 'إلغاء الحظر',
    block: 'حظر',
    unknown: 'غير معروف',
    confirmDeleteVenue: 'حذف المنشأة وحجوزاتها؟',
    confirmDeleteUser: 'حذف المستخدم؟',
    confirmDeleteCoach: 'حذف المدرب وجلساته؟',
    userBlocked: 'تم حظر المستخدم',
    userUnblocked: 'تم إلغاء الحظر',
    saveChanges: 'حفظ التغييرات',
    changePassword: 'تغيير كلمة المرور',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور الجديدة',
    profileImageUpdated: 'تم تحديث الصورة الشخصية',
    profileUpdated: 'تم تحديث الملف الشخصي',
    emailAlreadyUsed: 'البريد الإلكتروني مستخدم مسبقاً',
    incorrectPassword: 'كلمة المرور الحالية غير صحيحة',
    passwordsMismatch: 'كلمة المرور الجديدة غير متطابقة',
    passwordTooShort: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل',
    passwordChanged: 'تم تغيير كلمة المرور بنجاح',
    loginRequired: 'يجب تسجيل الدخول',
    noFavorites: 'لا توجد عناصر في المفضلة',
    from: 'من',
    hour: 'ساعة',
    viewCourts: 'عرض الملاعب',
    bookSession: 'احجز جلسة',
    unauthorized: 'غير مصرح',
    allVenuesAndCoaches: 'جميع المنشآت والمدربين',
    totalRevenue: 'إجمالي الإيرادات',
    bookingCount: 'عدد الحجوزات',
    averageBookingValue: 'متوسط قيمة الحجز',
    monthlyRevenue: 'الإيرادات الشهرية',
    popularSports: 'الرياضات الأكثر طلباً',
    peakHours: 'الأوقات الأكثر ازدحاماً',
    exportExcel: 'تصدير Excel',
    exportPDF: 'تصدير PDF',
    revenue: 'الإيرادات',
    bookings: 'الحجوزات',
    type: 'النوع',
    customer: 'العميل',
    price: 'السعر',
    court: 'ملعب',
    coach: 'مدرب',
    bookingsReport: 'تقرير_الحجوزات',
    analyticsReport: 'تقرير التحليلات',
    report: 'تقرير'
  });

  Object.assign(i18n.en, {
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    role: 'Role',
    status: 'Status',
    actions: 'Actions',
    owner: 'Owner',
    rating: 'Rating',
    addVenue: 'Add Venue',
    addCoach: 'Add Coach',
    addPromo: 'Add Promo',
    code: 'Code',
    discount: 'Discount',
    usage: 'Usage',
    validity: 'Validity',
    now: 'Now',
    forever: 'Forever',
    enterPromoCode: 'Enter promo code (uppercase):',
    enterDiscountType: 'Discount type (percentage/value):',
    enterDiscountValue: 'Discount value:',
    enterMaxUses: 'Max uses (leave empty for unlimited):',
    enterValidFrom: 'Valid from (YYYY-MM-DD) or leave empty:',
    enterValidUntil: 'Valid until (YYYY-MM-DD) or leave empty:',
    promoAdded: 'Promo code added',
    promoDeleted: 'Promo code deleted',
    courtBookings: 'Court Bookings',
    coachSessions: 'Coach Sessions',
    amount: 'Amount',
    courtRevenue: 'Court Revenue',
    coachRevenue: 'Coach Revenue',
    totalFees: 'Total App Fees',
    exportJSON: 'Export JSON',
    importJSON: 'Import JSON',
    clearData: 'Clear Data (except admin)',
    invalidStructure: 'Invalid structure',
    confirmReplaceData: 'Replace all data?',
    importSuccess: 'Import successful',
    error: 'Error',
    confirmClearData: 'Clear all data (except admin)?',
    dataCleared: 'Data cleared',
    advancedStats: 'Advanced Statistics',
    totalUsers: 'Total Users',
    totalVenues: 'Total Venues',
    totalCourts: 'Total Courts',
    totalCoaches: 'Total Coaches',
    totalCourtBookings: 'Total Court Bookings',
    totalCoachSessions: 'Total Coach Sessions',
    avgVenueRating: 'Avg Venue Rating',
    avgCoachRating: 'Avg Coach Rating',
    totalPromos: 'Total Promos',
    totalFavorites: 'Total Favorites',
    blocked: 'Blocked',
    active: 'Active',
    unblock: 'Unblock',
    block: 'Block',
    unknown: 'Unknown',
    confirmDeleteVenue: 'Delete venue and its bookings?',
    confirmDeleteUser: 'Delete user?',
    confirmDeleteCoach: 'Delete coach and sessions?',
    userBlocked: 'User blocked',
    userUnblocked: 'User unblocked',
    saveChanges: 'Save Changes',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    profileImageUpdated: 'Profile image updated',
    profileUpdated: 'Profile updated',
    emailAlreadyUsed: 'Email already in use',
    incorrectPassword: 'Incorrect current password',
    passwordsMismatch: 'New passwords do not match',
    passwordTooShort: 'Password must be at least 4 characters',
    passwordChanged: 'Password changed successfully',
    loginRequired: 'Login required',
    noFavorites: 'No favorites yet',
    from: 'From',
    hour: 'hour',
    viewCourts: 'View Courts',
    bookSession: 'Book Session',
    unauthorized: 'Unauthorized',
    allVenuesAndCoaches: 'All Venues and Coaches',
    totalRevenue: 'Total Revenue',
    bookingCount: 'Booking Count',
    averageBookingValue: 'Average Booking Value',
    monthlyRevenue: 'Monthly Revenue',
    popularSports: 'Popular Sports',
    peakHours: 'Peak Hours',
    exportExcel: 'Export Excel',
    exportPDF: 'Export PDF',
    revenue: 'Revenue',
    bookings: 'Bookings',
    type: 'Type',
    customer: 'Customer',
    price: 'Price',
    court: 'Court',
    coach: 'Coach',
    bookingsReport: 'bookings_report',
    analyticsReport: 'Analytics Report',
    report: 'report'
  });

  // تحديث واجهة المستخدم بعد إضافة المفاتيح الجديدة
  if (currentLanguage) {
    updateUITranslations();
  }

  // ---------- التهيئة النهائية ----------
  (async function init() {
    showLoader();
    
    // تحميل المكتبات الخارجية
    if (typeof XLSX === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
      document.head.appendChild(script);
    }
    if (typeof jspdf === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      document.head.appendChild(script);
    }
    
    await initializeCurrency();
    
    // تحميل البيانات الافتراضية إذا لم تكن موجودة
    let v = await api.getVenues();
    if (!v.length) {
      v = [{ id: 'v1', name: 'ملعب النخبة', phone: '966501234567', lat: 24.7136, lng: 46.6753, image: '', desc: 'مركز رياضي متكامل', ownerId: 'admin', pricing: [40, 50, 60, 70], workingHours: null, requiresApproval: false }];
      await api.saveVenues(v);
    }
    
    let c = await api.getCourts();
    if (!c.length) {
      c = [
        { id: 'c1', venueId: 'v1', name: 'الملعب الرئيسي', multiSport: false, sport: 'football', allowedSports: [], pricing: null },
        { id: 'c2', venueId: 'v1', name: 'ملعب متعدد', multiSport: true, sport: null, allowedSports: ['basketball', 'tennis'], pricing: [50, 60, 70, 80] }
      ];
      await api.saveCourts(c);
    }
    
    let coachesList = await api.getCoaches();
    if (!coachesList.length) {
      coachesList = [{ id: 'coach1', name: 'أحمد المدرب', phone: '966512345678', lat: 24.7136, lng: 46.6753, image: '', desc: 'مدرب كرة قدم محترف', sport: 'football', hourlyRate: 150, ownerId: 'admin' }];
      await api.saveCoaches(coachesList);
      coachAvailability['coach1'] = {};
      await api.saveCoachAvailability(coachAvailability);
    }
    
    let promos = await api.getPromoCodes();
    if (!promos.length) {
      promos = [{ code: 'WELCOME10', discountType: 'percentage', discountValue: 10, maxUses: 100, usedCount: 0, applicableTo: 'all' }];
      await api.savePromoCodes(promos);
    }
    
    let u = await api.getUsers();
    if (!u.length) {
      u = [{ id: 'admin', email: 'admin@sport.com', password: 'admin', role: 'admin', name: 'المدير', phone: '966501234567', blocked: false, profileImage: '' }];
      await api.saveUsers(u);
    }
    
    await refreshData();
    
    map = L.map('map').setView([24.7136, 46.6753], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    
    renderCourts();
    document.getElementById('filterBtn').addEventListener('click', () => {
      const sport = document.getElementById('sportFilter').value;
      if (currentViewMode === 'courts') renderCourts(sport);
      else renderCoaches(sport);
    });
    
    if (document.getElementById('courtsListContainer')) {
      createCourtField();
    }
    
    // بدء فحص المدفوعات المعلقة
    startPendingPaymentChecker();
    
    hideLoader();
  })();
})();
