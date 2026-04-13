// app.js - نسخة محسنة مع فحص وجود العناصر
(function(){
  "use strict";

  // ---------- دالة مساعدة لإضافة المستمعات بأمان ----------
  function safeAddEventListener(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
    else console.warn(`[SportBook] عنصر #${id} غير موجود`);
  }
  function safeQuerySelector(selector, event, handler) {
    const el = document.querySelector(selector);
    if (el) el.addEventListener(event, handler);
  }

  // ---------- الإعدادات والمفاتيح ----------
  const STORAGE_KEYS = { 
    VENUES: 'sport_venues', BOOKINGS: 'sport_bookings', USERS: 'sport_users',
    SESSION: 'sport_session', NOTIFICATIONS: 'sport_notifications', CUSTOM_SPORTS: 'custom_sports',
    CURRENCY: 'preferred_currency', REVIEWS: 'sport_reviews', CART: 'sport_cart',
    BLACKOUTS: 'sport_blackouts', COURTS: 'sport_courts', COACHES: 'sport_coaches',
    COACH_BOOKINGS: 'coach_bookings', COACH_AVAILABILITY: 'coach_availability',
    COACH_REVIEWS: 'coach_reviews', PROMO_CODES: 'promo_codes', FAVORITES: 'user_favorites',
    RECURRING_GROUPS: 'recurring_groups', PENDING_PAYMENTS: 'pending_payments'
  };
  
  const ADMIN_CODE = 'admin123';
  const SESSION_EXPIRY_HOURS = 24;
  const DEFAULT_SPORTS = ['football', 'basketball', 'tennis', 'padel'];
  const PAYMENT_TIMEOUT_MINUTES = 15;
  
  const PERIODS = [
    { name: 'الليل', start: 0, end: 7, color: '#6366f1' },
    { name: 'الصباح', start: 7, end: 11, color: '#f59e0b' },
    { name: 'الظهيرة', start: 11, end: 16, color: '#10b981' },
    { name: 'المساء', start: 16, end: 24, color: '#ef4444' }
  ];

  const WEEKDAYS = [
    { key: 'sun', label: 'الأحد' }, { key: 'mon', label: 'الإثنين' }, { key: 'tue', label: 'الثلاثاء' },
    { key: 'wed', label: 'الأربعاء' }, { key: 'thu', label: 'الخميس' }, { key: 'fri', label: 'الجمعة' },
    { key: 'sat', label: 'السبت' }
  ];

  const CURRENCIES = {
    SAR: { symbol: 'ريال', name: 'ريال سعودي' }, AED: { symbol: 'درهم', name: 'درهم إماراتي' },
    EGP: { symbol: 'جنيه', name: 'جنيه مصري' }, USD: { symbol: '$', name: 'دولار أمريكي' },
    EUR: { symbol: '€', name: 'يورو' }
  };

  // ---------- دوال i18n ----------
  let currentLanguage = 'ar';
  const i18n = {
    ar: { home:'الرئيسية', profile:'الملف الشخصي', favorites:'المفضلة', logout:'تسجيل الخروج',
          login:'تسجيل الدخول', register:'إنشاء حساب', courts:'الملاعب', coaches:'المدربين',
          bookNow:'احجز الآن', bookSession:'احجز جلسة', filter:'بحث', allSports:'جميع الرياضات',
          add:'إضافة', newSport:'رياضة جديدة', myLocation:'موقعي', cart:'سلة الحجوزات',
          total:'الإجمالي', checkout:'إتمام الحجز', myBookings:'حجوزاتي', registerVenue:'تسجيل منشأة',
          registerCoach:'تسجيل مدرب', dashboard:'لوحة التحكم', adminDashboard:'لوحة الأدمن',
          analytics:'التحليلات', currency:'العملة', explore:'استكشف الملاعب والمدربين' },
    en: { home:'Home', profile:'Profile', favorites:'Favorites', logout:'Logout',
          login:'Login', register:'Sign Up', courts:'Courts', coaches:'Coaches',
          bookNow:'Book Now', bookSession:'Book Session', filter:'Filter', allSports:'All Sports',
          add:'Add', newSport:'New Sport', myLocation:'My Location', cart:'Cart',
          total:'Total', checkout:'Checkout', myBookings:'My Bookings', registerVenue:'Register Venue',
          registerCoach:'Register Coach', dashboard:'Dashboard', adminDashboard:'Admin Dashboard',
          analytics:'Analytics', currency:'Currency', explore:'Explore Venues & Coaches' }
  };
  function t(key) { return i18n[currentLanguage]?.[key] || key; }
  function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    updateUITranslations();
    updateNavigation();
    updateUserArea();
    if (document.getElementById('home')?.classList.contains('active')) {
      if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
    }
  }
  function updateUITranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (el.tagName === 'INPUT' && el.placeholder) el.placeholder = t(key);
      else el.textContent = t(key);
    });
    const langBtn = document.getElementById('toggleLangBtn');
    if (langBtn) langBtn.innerHTML = currentLanguage === 'ar' ? '<i class="fas fa-language"></i> English' : '<i class="fas fa-language"></i> العربية';
  }

  // ---------- دوال مساعدة ----------
  function sanitizeInput(str) { if(!str) return ''; const div=document.createElement('div'); div.textContent=str; return div.innerHTML; }
  function sanitizeImageUrl(url) {
    if(!url) return '';
    if(url.startsWith('http://')||url.startsWith('https://')||url.startsWith('data:image/')) return encodeURI(url);
    return 'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=600';
  }
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
  function showToast(msg, isSuccess=true) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = isSuccess ? '#10b981' : '#ef4444';
    toast.style.opacity = '1';
    setTimeout(() => toast.style.opacity = '0', 3000);
  }
  function showLoader() { const l = document.getElementById('globalLoader'); if(l) l.style.display = 'flex'; }
  function hideLoader() { const l = document.getElementById('globalLoader'); if(l) l.style.display = 'none'; }
  function encodePassword(pass) { return btoa(pass); }
  function decodePassword(encoded) { return atob(encoded); }

  // دوال الوقت
  function timeToMinutes(t) { if(!t) return 0; const [h,m]=t.split(':').map(Number); return h*60+m; }
  function minutesToTime(m) { const h=Math.floor(m/60)%24; const mm=m%60; return `${h.toString().padStart(2,'0')}:${mm.toString().padStart(2,'0')}`; }
  function addMinutesToTime(t, add) { return minutesToTime(timeToMinutes(t)+add); }
  function isTimeOverlap(start1, dur1, start2, dur2) {
    const end1 = start1 + dur1*60;
    const end2 = start2 + dur2*60;
    return (start1 < end2 && start2 < end1);
  }

  // ---------- API ----------
  const api = {
    async getVenues() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.VENUES)) || []; },
    async saveVenues(data) { localStorage.setItem(STORAGE_KEYS.VENUES, JSON.stringify(data)); },
    async getBookings() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || []; },
    async saveBookings(data) { localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(data)); },
    async getUsers() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || []; },
    async saveUsers(data) { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data)); },
    async getNotifications() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || []; },
    async saveNotifications(data) { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data)); },
    async getCustomSports() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOM_SPORTS)) || []; },
    async saveCustomSports(data) { localStorage.setItem(STORAGE_KEYS.CUSTOM_SPORTS, JSON.stringify(data)); },
    async getPreferredCurrency() { return localStorage.getItem(STORAGE_KEYS.CURRENCY); },
    async savePreferredCurrency(code) { localStorage.setItem(STORAGE_KEYS.CURRENCY, code); },
    async getReviews() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS)) || {}; },
    async saveReviews(data) { localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(data)); },
    async getCart() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || []; },
    async saveCart(data) { localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(data)); },
    async getBlackouts() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.BLACKOUTS)) || {}; },
    async saveBlackouts(data) { localStorage.setItem(STORAGE_KEYS.BLACKOUTS, JSON.stringify(data)); },
    async getCourts() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COURTS)) || []; },
    async saveCourts(data) { localStorage.setItem(STORAGE_KEYS.COURTS, JSON.stringify(data)); },
    async getCoaches() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COACHES)) || []; },
    async saveCoaches(data) { localStorage.setItem(STORAGE_KEYS.COACHES, JSON.stringify(data)); },
    async getCoachBookings() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COACH_BOOKINGS)) || []; },
    async saveCoachBookings(data) { localStorage.setItem(STORAGE_KEYS.COACH_BOOKINGS, JSON.stringify(data)); },
    async getCoachAvailability() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COACH_AVAILABILITY)) || {}; },
    async saveCoachAvailability(data) { localStorage.setItem(STORAGE_KEYS.COACH_AVAILABILITY, JSON.stringify(data)); },
    async getCoachReviews() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.COACH_REVIEWS)) || {}; },
    async saveCoachReviews(data) { localStorage.setItem(STORAGE_KEYS.COACH_REVIEWS, JSON.stringify(data)); },
    async getPromoCodes() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMO_CODES)) || []; },
    async savePromoCodes(data) { localStorage.setItem(STORAGE_KEYS.PROMO_CODES, JSON.stringify(data)); },
    async getFavorites() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || []; },
    async saveFavorites(data) { localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(data)); },
    async getRecurringGroups() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECURRING_GROUPS)) || []; },
    async saveRecurringGroups(data) { localStorage.setItem(STORAGE_KEYS.RECURRING_GROUPS, JSON.stringify(data)); },
    async getPendingPayments() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_PAYMENTS)) || []; },
    async savePendingPayments(data) { localStorage.setItem(STORAGE_KEYS.PENDING_PAYMENTS, JSON.stringify(data)); },
    async getSession() { 
      const sess = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
      if (sess && sess.expiresAt && new Date(sess.expiresAt) > new Date()) return sess.user;
      localStorage.removeItem(STORAGE_KEYS.SESSION); return null;
    },
    async setSession(user) { 
      const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS*60*60*1000).toISOString();
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify({ user, expiresAt }));
    },
    async clearSession() { localStorage.removeItem(STORAGE_KEYS.SESSION); }
  };

  // ---------- الحالة العامة ----------
  let currentUser = null;
  let venues=[], bookings=[], users=[], notifications=[], customSports=[], cart=[], reviews={}, blackouts={}, courts=[];
  let coaches=[], coachBookings=[], coachAvailability={}, coachReviews={};
  let promoCodes=[], favorites=[], recurringGroups=[], pendingPayments=[];
  let currentCurrency='SAR';
  let map, miniMap, editMiniMap, coachMap;
  let customerLocation=null;
  let pendingConfirmCallback=null;
  let venueMarker=null, editMarker=null, coachMarker=null;
  let pendingBooking=null;
  let selectedRating=0;
  let currentViewMode='courts';

  const sections = document.querySelectorAll('.section');
  const mainNav = document.getElementById('mainNav');
  const userArea = document.getElementById('userArea');
  
    // ---------- التسعير ----------
  function getPeriodIndex(hour) {
    if (hour >= 0 && hour < 7) return 0;
    if (hour >= 7 && hour < 11) return 1;
    if (hour >= 11 && hour < 16) return 2;
    return 3;
  }
  function getHourlyPrice(court, hour) {
    const venue = venues.find(v => v.id === court.venueId);
    if (court.pricing) return court.pricing[getPeriodIndex(hour)] || 50;
    if (venue?.pricing) return venue.pricing[getPeriodIndex(hour)] || 50;
    return 50;
  }
  function calculateBookingPrice(court, dateStr, timeStr, durationHours) {
    const startHour = parseInt(timeStr.split(':')[0]);
    let total = 0;
    for (let i = 0; i < Math.floor(durationHours); i++) total += getHourlyPrice(court, (startHour + i) % 24);
    return total;
  }

  // ---------- ساعات العمل ----------
  function isWithinWorkingHours(venue, dateStr, timeStr, durationHours = 1) {
    if (!venue?.workingHours) return true;
    const dayOfWeek = new Date(dateStr).getDay();
    const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][dayOfWeek];
    const dayHours = venue.workingHours[dayKey];
    if (!dayHours?.start || !dayHours?.end) return true;
    const startMin = timeToMinutes(dayHours.start);
    const endMin = timeToMinutes(dayHours.end);
    const bookingStart = timeToMinutes(timeStr);
    const bookingEnd = bookingStart + durationHours * 60;
    if (endMin < startMin) return bookingStart >= startMin || bookingEnd <= endMin;
    return bookingStart >= startMin && bookingEnd <= endMin;
  }
  function isWithinCoachWorkingHours(coachId, dateStr, timeStr, durationHours = 1) {
    const availability = coachAvailability[coachId];
    if (!availability) return true;
    const dayOfWeek = new Date(dateStr).getDay();
    const dayKey = ['sun','mon','tue','wed','thu','fri','sat'][dayOfWeek];
    const dayHours = availability[dayKey];
    if (!dayHours?.start || !dayHours?.end) return true;
    const startMin = timeToMinutes(dayHours.start);
    const endMin = timeToMinutes(dayHours.end);
    const bookingStart = timeToMinutes(timeStr);
    const bookingEnd = bookingStart + durationHours * 60;
    if (endMin < startMin) return bookingStart >= startMin || bookingEnd <= endMin;
    return bookingStart >= startMin && bookingEnd <= endMin;
  }
  function isBlackedOut(itemType, itemId, dateStr, timeStr, durationHours = 1) {
    const blackoutList = blackouts[itemId] || [];
    const bookingStart = timeToMinutes(timeStr);
    const bookingEnd = bookingStart + durationHours * 60;
    return blackoutList.some(b => {
      if (b.type === 'day' && b.date === dateStr) return true;
      if (b.type === 'hour' && b.date === dateStr) {
        const bhStart = timeToMinutes(b.startHour);
        const bhEnd = bhStart + (b.duration || 1) * 60;
        return isTimeOverlap(bookingStart, durationHours, bhStart, b.duration || 1);
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
      if (isWithinWorkingHours(venue, dateStr, h+':00', 1) && !isBlackedOut('court', court.id, dateStr, h+':00', 1))
        workingHoursForDay.push(h);
    }
    const bookedSlots = new Array(24).fill(false);
    dayBookings.forEach(b => { for (let i=0; i<b.duration; i++) bookedSlots[(parseInt(b.time)+i)%24] = true; });
    let available = workingHoursForDay.filter(h => !bookedSlots[h]).length;
    return { available, total: workingHoursForDay.length };
  }
  function getCoachAvailableHours(coachId, dateStr) {
    const coach = coaches.find(c => c.id === coachId);
    if (!coach) return { available: 0, total: 0 };
    const dayBookings = coachBookings.filter(b => b.coachId === coachId && b.date === dateStr && b.status !== 'cancelled');
    let workingHoursForDay = [];
    for (let h = 0; h < 24; h++) {
      if (isWithinCoachWorkingHours(coachId, dateStr, h+':00', 1) && !isBlackedOut('coach', coachId, dateStr, h+':00', 1))
        workingHoursForDay.push(h);
    }
    const bookedSlots = new Array(24).fill(false);
    dayBookings.forEach(b => { for (let i=0; i<b.duration; i++) bookedSlots[(parseInt(b.time)+i)%24] = true; });
    let available = workingHoursForDay.filter(h => !bookedSlots[h]).length;
    return { available, total: workingHoursForDay.length };
  }

  // ---------- العملات ----------
  function getCurrencySymbol(code) { return CURRENCIES[code]?.symbol || code; }
  function getCurrencyName(code) { return CURRENCIES[code]?.name || code; }
  async function detectUserCurrency() {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        const map = { 'SA':'SAR', 'AE':'AED', 'EG':'EGP', 'US':'USD' };
        return map[data.country_code] || 'SAR';
      }
    } catch(e) {}
    return 'SAR';
  }
  async function initializeCurrency() {
    let saved = await api.getPreferredCurrency();
    if (!saved) { saved = await detectUserCurrency(); await api.savePreferredCurrency(saved); }
    currentCurrency = saved;
    const select = document.getElementById('manualCurrencySelect');
    if (select) select.value = saved;
    updateCurrencyUI();
  }
  function updateCurrencyUI() {
    const symbol = getCurrencySymbol(currentCurrency);
    document.querySelectorAll('[id^="currencySymbol"]').forEach(el => el.textContent = symbol);
    const bc = document.getElementById('bookingCurrency'); if (bc) bc.textContent = symbol;
    const mc = document.getElementById('manageBookingCurrency'); if (mc) mc.textContent = symbol;
    const cc = document.getElementById('cartCurrency'); if (cc) cc.textContent = symbol;
    const cn = document.getElementById('currencyNotice');
    if (cn) cn.innerHTML = `<i class="fas fa-globe"></i> ${t('currency')}: ${getCurrencyName(currentCurrency)} (${symbol})`;
    if (document.getElementById('home')?.classList.contains('active')) {
      if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
    }
    updateCartUI();
  }
  async function changeCurrency(code) {
    currentCurrency = code;
    await api.savePreferredCurrency(code);
    updateCurrencyUI();
    showToast(`${t('currency')}: ${getCurrencyName(code)}`);
  }

  // ---------- الرياضات ----------
  function getAllSports() { return [...DEFAULT_SPORTS, ...customSports]; }
  function getSportDisplayName(sport) {
    const map = { 'football':'⚽ كرة قدم', 'basketball':'🏀 سلة', 'tennis':'🎾 تنس', 'padel':'🏓 بادل' };
    return map[sport] || `🏅 ${sport}`;
  }
  function getSportOptions(selected='') {
    return getAllSports().map(s => `<option value="${s}" ${s===selected?'selected':''}>${getSportDisplayName(s)}</option>`).join('');
  }
  function populateSportSelects() {
    const sportFilter = document.getElementById('sportFilter');
    if (sportFilter) sportFilter.innerHTML = `<option value="all">${t('allSports')}</option>` + getSportOptions();
    const courtSport = document.getElementById('courtSport');
    if (courtSport) courtSport.innerHTML = getSportOptions();
    const coachSport = document.getElementById('coachSport');
    if (coachSport) coachSport.innerHTML = getSportOptions();
    const multi = document.getElementById('multiSportCheckboxes');
    if (multi) multi.innerHTML = getAllSports().map(s => `<label><input type="checkbox" value="${s}"> ${getSportDisplayName(s)}</label>`).join('');
  }
  async function addCustomSport(sportName) {
    if (!sportName?.trim()) return false;
    const trimmed = sanitizeInput(sportName.trim().toLowerCase());
    if (getAllSports().includes(trimmed)) { showToast('موجودة مسبقاً', false); return false; }
    customSports.push(trimmed);
    await api.saveCustomSports(customSports);
    populateSportSelects();
    showToast(`تمت إضافة "${trimmed}"`);
    return true;
  }

  // ---------- الإشعارات ----------
  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }
  function addNotification(userId, message, type='info') {
    const notif = { id: Date.now()+''+Math.random(), userId, message: sanitizeInput(message), type, read: false, timestamp: new Date().toISOString() };
    notifications.push(notif);
    api.saveNotifications(notifications);
    updateNotificationBadge();
    if ('Notification' in window && Notification.permission === 'granted') new Notification('SportBook', { body: message });
  }
  function getUnreadCount(userId) { return notifications.filter(n => n.userId === userId && !n.read).length; }
  function updateNotificationBadge() {
    if (!currentUser) return;
    const badge = document.getElementById('notificationBadge');
    if (badge) { const count = getUnreadCount(currentUser.id); badge.textContent = count || ''; }
  }

  // ---------- المفضلة ----------
  function isFavorite(type, id) {
    if (!currentUser) return false;
    return favorites.some(f => f.userId === currentUser.id && f.itemType === type && f.itemId === id);
  }
  async function toggleFavorite(type, id) {
    if (!currentUser) { showToast('يجب تسجيل الدخول', false); return; }
    const idx = favorites.findIndex(f => f.userId === currentUser.id && f.itemType === type && f.itemId === id);
    if (idx > -1) { favorites.splice(idx, 1); showToast('تمت الإزالة من المفضلة'); }
    else { favorites.push({ userId: currentUser.id, itemType: type, itemId: id }); showToast('تمت الإضافة إلى المفضلة'); }
    await api.saveFavorites(favorites);
    if (currentViewMode === 'courts') renderCourts(document.getElementById('sportFilter')?.value || 'all');
    else renderCoaches(document.getElementById('sportFilter')?.value || 'all');
  }
  window.toggleFavorite = toggleFavorite;

  // ---------- السلة ----------
  async function loadCart() { cart = await api.getCart(); updateCartUI(); }
  function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItemsList');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutCartBtn');
    if (!cartCount || !cartItems || !cartTotal || !checkoutBtn) return;
    cartCount.textContent = cart.length;
    const symbol = getCurrencySymbol(currentCurrency);
    if (!cart.length) {
      cartItems.innerHTML = '<p>السلة فارغة</p>';
      cartTotal.textContent = '0';
      checkoutBtn.disabled = true;
      return;
    }
    let total = 0, html = '';
    cart.forEach((item, idx) => {
      let itemTotal = 0, display = '';
      if (item.type === 'court') {
        const court = courts.find(c => c.id === item.courtId);
        if (court) itemTotal = calculateBookingPrice(court, item.date, item.time, item.duration);
        display = `🏟️ ${court?.name || item.courtName}`;
      } else {
        const coach = coaches.find(c => c.id === item.coachId);
        if (coach) itemTotal = coach.hourlyRate * item.duration;
        display = `👤 ${coach?.name || item.coachName}`;
      }
      total += itemTotal;
      html += `<div class="cart-item"><div><strong>${display}</strong><br>${item.date} ${item.time} (${item.duration} س) - ${itemTotal} ${symbol}</div>
        <button onclick="window.removeFromCart(${idx})"><i class="fas fa-trash"></i></button></div>`;
    });
    cartItems.innerHTML = html;
    cartTotal.textContent = total.toFixed(2);
    checkoutBtn.disabled = false;
  }
  window.removeFromCart = async function(idx) {
    cart.splice(idx, 1);
    await api.saveCart(cart);
    updateCartUI();
    showToast('تمت الإزالة');
  };

  // ---------- تحديث الواجهة ----------
  async function refreshData() {
    showLoader();
    venues = await api.getVenues(); bookings = await api.getBookings(); users = await api.getUsers();
    notifications = await api.getNotifications(); customSports = await api.getCustomSports();
    reviews = await api.getReviews(); blackouts = await api.getBlackouts(); courts = await api.getCourts();
    coaches = await api.getCoaches(); coachBookings = await api.getCoachBookings();
    coachAvailability = await api.getCoachAvailability(); coachReviews = await api.getCoachReviews();
    promoCodes = await api.getPromoCodes(); favorites = await api.getFavorites();
    recurringGroups = await api.getRecurringGroups(); pendingPayments = await api.getPendingPayments();
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
    const section = document.getElementById('customerBookingsSection');
    if (section) section.style.display = currentUser?.role === 'customer' ? 'block' : 'none';
    if (currentUser?.role === 'customer') renderCustomerBookings();
  }
  function updateUserArea() {
    if (!userArea) return;
    if (currentUser) {
      let roleText = { admin:'أدمن', venue:'منشأة', coach:'مدرب', customer:'عميل' }[currentUser.role] || '';
      userArea.innerHTML = `
        <button class="btn-sm" id="notificationsBtn"><i class="fas fa-bell"></i> ${getUnreadCount(currentUser.id) ? `<span id="notificationBadge" class="notification-badge">${getUnreadCount(currentUser.id)}</span>`:''}</button>
        <div class="user-info"><i class="fas fa-user"></i> ${sanitizeInput(currentUser.name)} (${roleText})</div>
        <button class="btn-sm" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> ${t('logout')}</button>`;
      document.getElementById('logoutBtn')?.addEventListener('click', logout);
      document.getElementById('notificationsBtn')?.addEventListener('click', openNotifications);
    } else {
      userArea.innerHTML = `<div class="auth-buttons"><button class="btn-sm" id="showLoginBtn"><i class="fas fa-sign-in-alt"></i> ${t('login')}</button><button class="btn-sm" id="showRegisterBtn"><i class="fas fa-user-plus"></i> ${t('register')}</button></div>`;
      document.getElementById('showLoginBtn')?.addEventListener('click', () => openAuthModal('login'));
      document.getElementById('showRegisterBtn')?.addEventListener('click', () => openAuthModal('register'));
    }
  }
  function updateNavigation() {
    if (!mainNav) return;
    let html = `<button class="nav-btn active" data-section="home"><i class="fas fa-home"></i> ${t('home')}</button>`;
    if (!currentUser) {}
    else if (currentUser.role === 'customer')
      html += `<button class="nav-btn" data-section="profile"><i class="fas fa-user"></i> ${t('profile')}</button><button class="nav-btn" data-section="favorites"><i class="fas fa-heart"></i> ${t('favorites')}</button>`;
    else if (currentUser.role === 'venue')
      html += `<button class="nav-btn" data-section="registerVenue"><i class="fas fa-plus-circle"></i> ${t('registerVenue')}</button><button class="nav-btn" data-section="venueDashboard"><i class="fas fa-calendar-alt"></i> ${t('dashboard')}</button><button class="nav-btn" data-section="profile"><i class="fas fa-user"></i> ${t('profile')}</button>`;
    else if (currentUser.role === 'coach')
      html += `<button class="nav-btn" data-section="registerCoach"><i class="fas fa-plus-circle"></i> ${t('registerCoach')}</button><button class="nav-btn" data-section="coachDashboard"><i class="fas fa-chalkboard-user"></i> ${t('dashboard')}</button><button class="nav-btn" data-section="profile"><i class="fas fa-user"></i> ${t('profile')}</button>`;
    else if (currentUser.role === 'admin')
      html += `<button class="nav-btn" data-section="registerVenue"><i class="fas fa-plus-circle"></i> ${t('registerVenue')}</button><button class="nav-btn" data-section="registerCoach"><i class="fas fa-plus-circle"></i> ${t('registerCoach')}</button><button class="nav-btn" data-section="venueDashboard"><i class="fas fa-calendar-alt"></i> ${t('dashboard')}</button><button class="nav-btn" data-section="coachDashboard"><i class="fas fa-chalkboard-user"></i> ${t('dashboard')}</button><button class="nav-btn" data-section="adminDashboard"><i class="fas fa-user-shield"></i> ${t('adminDashboard')}</button><button class="nav-btn" data-section="profile"><i class="fas fa-user"></i> ${t('profile')}</button><button class="nav-btn" data-section="analytics"><i class="fas fa-chart-bar"></i> ${t('analytics')}</button>`;
    mainNav.innerHTML = html;
    document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', () => switchSection(b.dataset.section)));
  }
  async function logout() {
    await api.clearSession();
    currentUser = null; customerLocation = null; cart = []; pendingBooking = null;
    await api.saveCart(cart);
    updateUIBasedOnRole();
    switchSection('home');
    showToast('تم تسجيل الخروج');
  }
  function switchSection(sectionId) {
    sections.forEach(s => s.classList.remove('active'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');
    if (sectionId === 'home') {
      if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
      if (map) setTimeout(() => map.invalidateSize(), 100);
    } else if (sectionId === 'venueDashboard') loadVenueDashboard();
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
    const modal = document.getElementById('confirmModal');
    const msgEl = document.getElementById('confirmMessage');
    if (!modal || !msgEl) return;
    msgEl.textContent = msg;
    pendingConfirmCallback = cb;
    modal.style.visibility = 'visible';
  }
  safeAddEventListener('confirmOkBtn', 'click', () => {
    if (pendingConfirmCallback) pendingConfirmCallback();
    document.getElementById('confirmModal').style.visibility = 'hidden';
    pendingConfirmCallback = null;
  });
  safeAddEventListener('confirmCancelBtn', 'click', () => {
    document.getElementById('confirmModal').style.visibility = 'hidden';
    pendingConfirmCallback = null;
  });

  // ---------- مصادقة ----------
  function openAuthModal(mode) {
    const modal = document.getElementById('authModal');
    const title = document.getElementById('authModalTitle');
    const nameGroup = document.getElementById('authNameGroup');
    const phoneGroup = document.getElementById('authPhoneGroup');
    const modeInput = document.getElementById('authMode');
    if (!modal) return;
    if (title) title.textContent = mode === 'login' ? t('login') : t('register');
    if (nameGroup) nameGroup.style.display = mode === 'register' ? 'block' : 'none';
    if (phoneGroup) phoneGroup.style.display = mode === 'register' ? 'block' : 'none';
    if (modeInput) modeInput.value = mode;
    modal.style.visibility = 'visible';
  }
  safeAddEventListener('authRole', 'change', e => {
    const adminGroup = document.getElementById('adminCodeGroup');
    if (adminGroup) adminGroup.style.display = e.target.value === 'admin' ? 'block' : 'none';
  });
  safeAddEventListener('authForm', 'submit', async e => {
    e.preventDefault();
    const mode = document.getElementById('authMode')?.value;
    const email = sanitizeInput(document.getElementById('authEmail')?.value.trim() || '');
    const password = document.getElementById('authPassword')?.value;
    const role = document.getElementById('authRole')?.value;
    const name = sanitizeInput(document.getElementById('authName')?.value.trim() || email.split('@')[0]);
    const phone = document.getElementById('authPhone')?.value.trim() || '';
    if (role === 'admin' && document.getElementById('adminCode')?.value !== ADMIN_CODE) return showToast('رمز الأدمن غير صحيح', false);
    showLoader();
    let usersList = await api.getUsers();
    if (mode === 'register') {
      if (usersList.find(u => u.email === email)) { hideLoader(); return showToast('البريد مسجل مسبقاً', false); }
      const newUser = { id: Date.now()+'', email, password: encodePassword(password), role, name, phone, blocked: false, profileImage: '', createdAt: new Date().toISOString() };
      usersList.push(newUser);
      await api.saveUsers(usersList);
      await api.setSession(newUser);
      currentUser = newUser;
      showToast('تم إنشاء الحساب');
    } else {
      const user = usersList.find(u => u.email === email && decodePassword(u.password) === password);
      if (!user) { hideLoader(); return showToast('بيانات خاطئة', false); }
      if (user.blocked) { hideLoader(); return showToast('الحساب محظور', false); }
      await api.setSession(user);
      currentUser = user;
      showToast(`أهلاً ${user.name}`);
    }
    document.getElementById('authModal').style.visibility = 'hidden';
    await refreshData();
    if (currentUser.role === 'admin') switchSection('adminDashboard');
    else if (currentUser.role === 'venue') switchSection('venueDashboard');
    else if (currentUser.role === 'coach') switchSection('coachDashboard');
    else switchSection('home');
    hideLoader();
  });
  safeAddEventListener('switchAuthModeBtn', 'click', () => {
    const mode = document.getElementById('authMode')?.value;
    openAuthModal(mode === 'login' ? 'register' : 'login');
  });
  safeAddEventListener('closeAuthModal', 'click', () => {
    document.getElementById('authModal').style.visibility = 'hidden';
  });

  // ---------- GPS والمسافات ----------
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  function calculateTravelTime(dist) { return Math.round(dist / 80 * 60); }

  // ---------- عرض الملاعب (مع Event Delegation) ----------
  async function renderCourts(filterSport = 'all') {
    const container = document.getElementById('venuesList');
    if (!container) return;
    const filtered = courts.filter(c => filterSport === 'all' ? true : (c.multiSport ? c.allowedSports?.includes(filterSport) : c.sport === filterSport));
    if (!filtered.length) { container.innerHTML = '<div class="card">لا توجد ملاعب</div>'; return; }
    const symbol = getCurrencySymbol(currentCurrency);
    const today = new Date().toISOString().split('T')[0];
    let sorted = [...filtered];
    if (customerLocation) {
      sorted.sort((a,b) => {
        const va = venues.find(v=>v.id===a.venueId), vb = venues.find(v=>v.id===b.venueId);
        if (!va?.lat || !vb?.lat) return 0;
        return getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, va.lat, va.lng) - getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, vb.lat, vb.lng);
      });
    }
    let html = '';
    for (let court of sorted) {
      const venue = venues.find(v => v.id === court.venueId);
      if (!venue) continue;
      let distInfo = '';
      if (customerLocation && venue.lat) {
        const dist = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, venue.lat, venue.lng).toFixed(1);
        distInfo = `<div class="venue-distance"><i class="fas fa-route"></i> ${dist} كم (${calculateTravelTime(parseFloat(dist))} دقيقة)</div>`;
      }
      const minPrice = court.pricing ? Math.min(...court.pricing) : (venue.pricing ? Math.min(...venue.pricing) : 50);
      const sportDisplay = court.multiSport ? court.allowedSports.map(s => getSportDisplayName(s)).join(' / ') : getSportDisplayName(court.sport);
      const venueReviews = reviews[venue.id] || [];
      const avg = venueReviews.length ? (venueReviews.reduce((s,r)=>s+r.rating,0)/venueReviews.length).toFixed(1) : '0.0';
      const stars = '★'.repeat(Math.round(avg)) + '☆'.repeat(5-Math.round(avg));
      const avail = getAvailableHoursForCourt(court, today);
      const favClass = isFavorite('venue', venue.id) ? 'fas' : 'far';
      html += `<div class="venue-card" data-court-id="${court.id}" data-venue-id="${venue.id}">
        <div class="venue-img" style="background-image:url('${sanitizeImageUrl(venue.image)}');">
          <span class="venue-type">${sportDisplay}</span>
          <button class="favorite-btn"><i class="${favClass} fa-heart" style="color:#ef4444;"></i></button>
        </div>
        <div class="venue-info">
          <div class="venue-name">${sanitizeInput(court.name)}</div>
          <div style="color:#64748b;">${sanitizeInput(venue.name)}</div>
          <div class="venue-rating"><span style="color:#fbbf24;">${stars}</span> ${avg}</div>
          <div class="venue-pricing"><i class="fas fa-tag"></i> ${minPrice} ${symbol}/ساعة</div>
          ${distInfo}
          <button class="btn btn-primary book-btn">${t('bookNow')}</button>
        </div>
      </div>`;
    }
    container.innerHTML = html;
    updateMapMarkers();
    container.addEventListener('click', e => {
      const card = e.target.closest('.venue-card');
      if (!card) return;
      const courtId = card.dataset.courtId, venueId = card.dataset.venueId;
      if (e.target.closest('.favorite-btn')) toggleFavorite('venue', venueId);
      else if (e.target.closest('.book-btn')) openBookingModal(courtId, 'court');
    });
  }

  async function renderCoaches(filterSport = 'all') {
    const container = document.getElementById('venuesList');
    if (!container) return;
    let filtered = filterSport === 'all' ? coaches : coaches.filter(c => c.sport === filterSport);
    if (!filtered.length) { container.innerHTML = '<div class="card">لا يوجد مدربين</div>'; return; }
    const symbol = getCurrencySymbol(currentCurrency);
    const today = new Date().toISOString().split('T')[0];
    if (customerLocation) {
      filtered.sort((a,b) => {
        if (!a.lat || !b.lat) return 0;
        return getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, a.lat, a.lng) - getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, b.lat, b.lng);
      });
    }
    let html = '';
    for (let coach of filtered) {
      let distInfo = '';
      if (customerLocation && coach.lat) {
        const dist = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, coach.lat, coach.lng).toFixed(1);
        distInfo = `<div class="coach-distance"><i class="fas fa-route"></i> ${dist} كم (${calculateTravelTime(parseFloat(dist))} دقيقة)</div>`;
      }
      const coachRating = coachReviews[coach.id] || [];
      const avg = coachRating.length ? (coachRating.reduce((s,r)=>s+r.rating,0)/coachRating.length).toFixed(1) : '0.0';
      const stars = '★'.repeat(Math.round(avg)) + '☆'.repeat(5-Math.round(avg));
      const avail = getCoachAvailableHours(coach.id, today);
      const favClass = isFavorite('coach', coach.id) ? 'fas' : 'far';
      html += `<div class="coach-card" data-coach-id="${coach.id}">
        <div class="coach-img" style="background-image:url('${sanitizeImageUrl(coach.image)}');">
          <span class="coach-type">${getSportDisplayName(coach.sport)}</span>
          <button class="favorite-btn"><i class="${favClass} fa-heart" style="color:#ef4444;"></i></button>
        </div>
        <div class="coach-info">
          <div class="coach-name">${sanitizeInput(coach.name)}</div>
          <div class="coach-rating"><span style="color:#fbbf24;">${stars}</span> ${avg}</div>
          <div class="coach-pricing"><i class="fas fa-tag"></i> ${coach.hourlyRate} ${symbol}/ساعة</div>
          ${distInfo}
          <button class="btn btn-primary book-coach-btn">${t('bookSession')}</button>
        </div>
      </div>`;
    }
    container.innerHTML = html;
    updateMapMarkers();
    container.addEventListener('click', e => {
      const card = e.target.closest('.coach-card');
      if (!card) return;
      const coachId = card.dataset.coachId;
      if (e.target.closest('.favorite-btn')) toggleFavorite('coach', coachId);
      else if (e.target.closest('.book-coach-btn')) openBookingModal(coachId, 'coach');
    });
  }

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
  
    // ---------- دوال الحجز ----------
  function openBookingModal(targetId, type) {
    if (!currentUser) { showToast('الرجاء تسجيل الدخول', false); openAuthModal('login'); return; }
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('bookingDate');
    const timeInput = document.getElementById('bookingTime');
    const durationInput = document.getElementById('bookingDuration');
    const typeInput = document.getElementById('bookingType');
    if (dateInput) dateInput.value = today;
    if (timeInput) timeInput.value = '10:00';
    if (durationInput) durationInput.value = 1;
    if (typeInput) typeInput.value = type;

    if (type === 'court') {
      const court = courts.find(c => c.id === targetId);
      if (!court) return;
      const venue = venues.find(v => v.id === court.venueId);
      document.getElementById('bookingVenueId').value = court.venueId;
      document.getElementById('bookingCourtId').value = targetId;
      document.getElementById('bookingCoachId').value = '';
      const infoDiv = document.getElementById('distanceTimeInfo');
      if (infoDiv && customerLocation && venue?.lat) {
        const dist = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, venue.lat, venue.lng).toFixed(1);
        infoDiv.innerHTML = `<i class="fas fa-car"></i> المسافة: ${dist} كم، الزمن: ${calculateTravelTime(parseFloat(dist))} دقيقة`;
      } else if (infoDiv) infoDiv.innerHTML = '';
      updateTimelineForCourt(court, today);
      const dateChange = () => updateTimelineForCourt(court, document.getElementById('bookingDate').value);
      const dateEl = document.getElementById('bookingDate');
      if (dateEl) dateEl.onchange = dateChange;
    } else {
      const coach = coaches.find(c => c.id === targetId);
      if (!coach) return;
      document.getElementById('bookingCoachId').value = targetId;
      const infoDiv = document.getElementById('distanceTimeInfo');
      if (infoDiv && customerLocation && coach?.lat) {
        const dist = getDistanceFromLatLonInKm(customerLocation.lat, customerLocation.lng, coach.lat, coach.lng).toFixed(1);
        infoDiv.innerHTML = `<i class="fas fa-car"></i> المسافة: ${dist} كم، الزمن: ${calculateTravelTime(parseFloat(dist))} دقيقة`;
      } else if (infoDiv) infoDiv.innerHTML = '';
      updateTimelineForCoach(targetId, today);
      const dateChange = () => updateTimelineForCoach(targetId, document.getElementById('bookingDate').value);
      const dateEl = document.getElementById('bookingDate');
      if (dateEl) dateEl.onchange = dateChange;
    }
    const recurring = document.getElementById('bookingRecurring');
    if (recurring) recurring.value = 'none';
    const endGroup = document.getElementById('recurringEndGroup');
    if (endGroup) endGroup.style.display = 'none';
    document.getElementById('bookingModal').style.visibility = 'visible';
  }

  function updateTimelineForCourt(court, dateStr) {
    const timeline = document.getElementById('timelineDisplay');
    if (!timeline) return;
    const venue = venues.find(v => v.id === court.venueId);
    const dayBookings = bookings.filter(b => b.courtId === court.id && b.date === dateStr && b.status !== 'cancelled');
    const bookedSlots = new Array(24).fill(false);
    dayBookings.forEach(b => { for (let i=0; i<b.duration; i++) bookedSlots[(parseInt(b.time)+i)%24] = true; });
    const availableSlots = new Array(24).fill(true);
    for (let h=0; h<24; h++) {
      if (!isWithinWorkingHours(venue, dateStr, h+':00', 1)) availableSlots[h] = false;
      if (isBlackedOut('court', court.id, dateStr, h+':00', 1)) availableSlots[h] = false;
    }
    let html = '';
    const symbol = getCurrencySymbol(currentCurrency);
    for (let h=0; h<24; h++) {
      const periodIdx = getPeriodIndex(h);
      let statusColor = '#cbd5e1';
      if (availableSlots[h] && !bookedSlots[h]) statusColor = '#10b981';
      else if (bookedSlots[h]) statusColor = '#ef4444';
      const price = getHourlyPrice(court, h);
      html += `<div class="hour-slot" title="${h}:00 | ${PERIODS[periodIdx].name} | ${price} ${symbol}"><div class="period-part" style="background:${PERIODS[periodIdx].color};">${h}</div><div class="status-part" style="background:${statusColor};"></div></div>`;
    }
    timeline.innerHTML = html;
    const summary = document.getElementById('pricingSummary');
    if (summary) {
      if (court.pricing) summary.innerHTML = PERIODS.map((p,i) => `<span class="price-tag" style="background:${p.color}">${p.name}: ${court.pricing[i]} ${symbol}</span>`).join('');
      else if (venue?.pricing) summary.innerHTML = PERIODS.map((p,i) => `<span class="price-tag" style="background:${p.color}">${p.name}: ${venue.pricing[i]} ${symbol}</span>`).join('');
    }
    updatePrice();
  }

  function updateTimelineForCoach(coachId, dateStr) {
    const timeline = document.getElementById('timelineDisplay');
    if (!timeline) return;
    const coach = coaches.find(c => c.id === coachId);
    const daySessions = coachBookings.filter(b => b.coachId === coachId && b.date === dateStr && b.status !== 'cancelled');
    const bookedSlots = new Array(24).fill(false);
    daySessions.forEach(b => { for (let i=0; i<b.duration; i++) bookedSlots[(parseInt(b.time)+i)%24] = true; });
    const availableSlots = new Array(24).fill(true);
    for (let h=0; h<24; h++) {
      if (!isWithinCoachWorkingHours(coachId, dateStr, h+':00', 1)) availableSlots[h] = false;
      if (isBlackedOut('coach', coachId, dateStr, h+':00', 1)) availableSlots[h] = false;
    }
    let html = '';
    const symbol = getCurrencySymbol(currentCurrency);
    for (let h=0; h<24; h++) {
      const periodIdx = getPeriodIndex(h);
      let statusColor = '#cbd5e1';
      if (availableSlots[h] && !bookedSlots[h]) statusColor = '#10b981';
      else if (bookedSlots[h]) statusColor = '#ef4444';
      html += `<div class="hour-slot" title="${h}:00 | ${PERIODS[periodIdx].name} | ${coach.hourlyRate} ${symbol}"><div class="period-part" style="background:${PERIODS[periodIdx].color};">${h}</div><div class="status-part" style="background:${statusColor};"></div></div>`;
    }
    timeline.innerHTML = html;
    const summary = document.getElementById('pricingSummary');
    if (summary) summary.innerHTML = `<span class="price-tag">سعر الساعة: ${coach.hourlyRate} ${symbol}</span>`;
    updatePrice();
  }

  function updatePrice() {
    const type = document.getElementById('bookingType')?.value;
    const date = document.getElementById('bookingDate')?.value;
    const time = document.getElementById('bookingTime')?.value;
    const dur = +(document.getElementById('bookingDuration')?.value || 1);
    const priceSpan = document.getElementById('bookingPrice');
    if (!priceSpan) return;
    let price = 0;
    if (type === 'court') {
      const court = courts.find(c => c.id === document.getElementById('bookingCourtId')?.value);
      if (court) price = calculateBookingPrice(court, date, time, dur);
    } else {
      const coach = coaches.find(c => c.id === document.getElementById('bookingCoachId')?.value);
      if (coach) price = coach.hourlyRate * dur;
    }
    priceSpan.textContent = price.toFixed(2);
  }

  safeAddEventListener('bookingDuration', 'input', updatePrice);
  safeAddEventListener('bookingTime', 'change', updatePrice);
  safeAddEventListener('bookingRecurring', 'change', e => {
    const endGroup = document.getElementById('recurringEndGroup');
    if (endGroup) endGroup.style.display = e.target.value !== 'none' ? 'block' : 'none';
  });

  // إنشاء حجوزات متكررة
  function generateRecurringDates(start, end, pattern) {
    const dates = [];
    const s = new Date(start), e = new Date(end);
    let cur = new Date(s);
    while (cur <= e) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + (pattern === 'weekly' ? 7 : 14));
    }
    return dates;
  }

  async function createRecurringBookings(baseData, pattern, endDate) {
    const dates = generateRecurringDates(baseData.date, endDate, pattern);
    if (!dates.length) return [];
    const groupId = Date.now() + '-' + Math.random().toString(36);
    const items = [];
    for (const d of dates) {
      const item = { ...baseData, date: d, recurringGroupId: groupId };
      if (baseData.type === 'court') {
        const court = courts.find(c => c.id === baseData.courtId);
        const venue = venues.find(v => v.id === court.venueId);
        const conflict = bookings.some(b => b.courtId === baseData.courtId && b.date === d && b.status !== 'cancelled' && isTimeOverlap(timeToMinutes(baseData.time), baseData.duration, timeToMinutes(b.time), b.duration));
        if (conflict) continue;
        if (!isWithinWorkingHours(venue, d, baseData.time, baseData.duration) || isBlackedOut('court', court.id, d, baseData.time, baseData.duration)) continue;
      } else {
        const conflict = coachBookings.some(b => b.coachId === baseData.coachId && b.date === d && b.status !== 'cancelled' && isTimeOverlap(timeToMinutes(baseData.time), baseData.duration, timeToMinutes(b.time), b.duration));
        if (conflict) continue;
        if (!isWithinCoachWorkingHours(baseData.coachId, d, baseData.time, baseData.duration) || isBlackedOut('coach', baseData.coachId, d, baseData.time, baseData.duration)) continue;
      }
      items.push(item);
    }
    if (items.length) {
      recurringGroups.push({ id: groupId, type: baseData.type, startDate: baseData.date, endDate, pattern, count: items.length, createdAt: new Date().toISOString() });
      await api.saveRecurringGroups(recurringGroups);
    }
    return items;
  }

  async function addToCart(bookingData) {
    const start = timeToMinutes(bookingData.time);
    if (bookingData.type === 'court') {
      const court = courts.find(c => c.id === bookingData.courtId);
      const venue = venues.find(v => v.id === court.venueId);
      const conflict = bookings.some(b => b.courtId === bookingData.courtId && b.date === bookingData.date && b.status !== 'cancelled' && isTimeOverlap(start, bookingData.duration, timeToMinutes(b.time), b.duration));
      if (conflict) { showToast('تعارض مع حجز آخر', false); return false; }
      if (!isWithinWorkingHours(venue, bookingData.date, bookingData.time, bookingData.duration)) { showToast('خارج ساعات العمل', false); return false; }
      if (isBlackedOut('court', court.id, bookingData.date, bookingData.time, bookingData.duration)) { showToast('الملعب مغلق', false); return false; }
    } else {
      const conflict = coachBookings.some(b => b.coachId === bookingData.coachId && b.date === bookingData.date && b.status !== 'cancelled' && isTimeOverlap(start, bookingData.duration, timeToMinutes(b.time), b.duration));
      if (conflict) { showToast('تعارض مع جلسة أخرى', false); return false; }
      if (!isWithinCoachWorkingHours(bookingData.coachId, bookingData.date, bookingData.time, bookingData.duration)) { showToast('خارج ساعات المدرب', false); return false; }
      if (isBlackedOut('coach', bookingData.coachId, bookingData.date, bookingData.time, bookingData.duration)) { showToast('المدرب غير متاح', false); return false; }
    }
    cart.push({ ...bookingData, id: Date.now() + '' + Math.random() });
    await api.saveCart(cart);
    updateCartUI();
    showToast('تمت الإضافة إلى السلة');
    return true;
  }

  safeAddEventListener('bookingForm', 'submit', async e => {
    e.preventDefault();
    const type = document.getElementById('bookingType')?.value;
    const date = document.getElementById('bookingDate')?.value;
    const time = document.getElementById('bookingTime')?.value;
    const duration = +(document.getElementById('bookingDuration')?.value || 1);
    const recurring = document.getElementById('bookingRecurring')?.value;
    const endDate = document.getElementById('recurringEndDate')?.value;
    let baseData;
    if (type === 'court') {
      const court = courts.find(c => c.id === document.getElementById('bookingCourtId')?.value);
      baseData = { type: 'court', courtId: court.id, venueId: court.venueId, venueName: venues.find(v=>v.id===court.venueId)?.name, courtName: court.name, date, time, duration, customerId: currentUser.id, customerName: currentUser.name };
    } else {
      const coach = coaches.find(c => c.id === document.getElementById('bookingCoachId')?.value);
      baseData = { type: 'coach', coachId: coach.id, coachName: coach.name, date, time, duration, customerId: currentUser.id, customerName: currentUser.name };
    }
    if (recurring !== 'none') {
      if (!endDate) { showToast('حدد تاريخ الانتهاء', false); return; }
      const items = await createRecurringBookings(baseData, recurring, endDate);
      if (!items.length) { showToast('لا توجد تواريخ متاحة', false); return; }
      for (const item of items) await addToCart(item);
      showToast(`تمت إضافة ${items.length} حجوزات`);
    } else {
      await addToCart(baseData);
    }
    document.getElementById('bookingModal').style.visibility = 'hidden';
  });

  safeAddEventListener('bookNowDirectBtn', 'click', async () => {
    const type = document.getElementById('bookingType')?.value;
    const date = document.getElementById('bookingDate')?.value;
    const time = document.getElementById('bookingTime')?.value;
    const duration = +(document.getElementById('bookingDuration')?.value || 1);
    const recurring = document.getElementById('bookingRecurring')?.value;
    const endDate = document.getElementById('recurringEndDate')?.value;
    let baseData, totalPrice = 0;
    if (type === 'court') {
      const court = courts.find(c => c.id === document.getElementById('bookingCourtId')?.value);
      baseData = { type: 'court', courtId: court.id, venueId: court.venueId, venueName: venues.find(v=>v.id===court.venueId)?.name, courtName: court.name, date, time, duration, customerId: currentUser.id, customerName: currentUser.name };
      totalPrice = calculateBookingPrice(court, date, time, duration);
    } else {
      const coach = coaches.find(c => c.id === document.getElementById('bookingCoachId')?.value);
      baseData = { type: 'coach', coachId: coach.id, coachName: coach.name, date, time, duration, customerId: currentUser.id, customerName: currentUser.name };
      totalPrice = coach.hourlyRate * duration;
    }
    let items = [baseData], total = totalPrice;
    if (recurring !== 'none' && endDate) {
      const recItems = await createRecurringBookings(baseData, recurring, endDate);
      if (!recItems.length) { showToast('لا توجد تواريخ متاحة', false); return; }
      items = recItems;
      total = items.reduce((sum, i) => sum + (type==='court' ? calculateBookingPrice(courts.find(c=>c.id===i.courtId), i.date, i.time, i.duration) : coaches.find(c=>c.id===i.coachId).hourlyRate * i.duration), 0);
    }
    pendingBooking = { items, total, appFee: total * 0.15, customerId: currentUser.id, customerName: currentUser.name };
    document.getElementById('bookingModal').style.visibility = 'hidden';
    showPaymentModal(pendingBooking);
  });

  safeAddEventListener('checkoutCartBtn', 'click', checkoutCart);
  async function checkoutCart() {
    if (!cart.length) return;
    if (!currentUser) { openAuthModal('login'); return; }
    for (const item of cart) {
      if (item.type === 'court') {
        const court = courts.find(c => c.id === item.courtId);
        if (!court) { showToast('الملعب غير متاح', false); return; }
        const conflict = bookings.some(b => b.courtId === item.courtId && b.date === item.date && b.status !== 'cancelled' && isTimeOverlap(timeToMinutes(item.time), item.duration, timeToMinutes(b.time), b.duration));
        if (conflict) { showToast(`تعارض في ${item.courtName}`, false); return; }
      } else {
        const coach = coaches.find(c => c.id === item.coachId);
        if (!coach) { showToast('المدرب غير متاح', false); return; }
        const conflict = coachBookings.some(b => b.coachId === item.coachId && b.date === item.date && b.status !== 'cancelled' && isTimeOverlap(timeToMinutes(item.time), item.duration, timeToMinutes(b.time), b.duration));
        if (conflict) { showToast(`تعارض مع ${item.coachName}`, false); return; }
      }
    }
    const total = cart.reduce((sum, item) => {
      if (item.type === 'court') {
        const court = courts.find(c => c.id === item.courtId);
        return sum + calculateBookingPrice(court, item.date, item.time, item.duration);
      } else {
        const coach = coaches.find(c => c.id === item.coachId);
        return sum + coach.hourlyRate * item.duration;
      }
    }, 0);
    pendingBooking = { items: cart, total, appFee: total * 0.15, customerId: currentUser.id, customerName: currentUser.name };
    showPaymentModal(pendingBooking);
  }

  function showPaymentModal(b) {
    const modal = document.getElementById('paymentModal');
    const details = document.getElementById('paymentDetails');
    if (!modal || !details) return;
    const symbol = getCurrencySymbol(currentCurrency);
    let itemsHtml = b.items.map(i => `<p><strong>${i.type==='court'?`🏟️ ${i.courtName}`:`👤 ${i.coachName}`}</strong><br>${i.date} ${i.time} (${i.duration} ساعة)</p>`).join('');
    details.innerHTML = itemsHtml + `<p>الإجمالي: <span id="displayTotal">${b.total.toFixed(2)}</span> ${symbol} (رسوم: ${b.appFee.toFixed(2)} ${symbol})</p>`;
    modal.style.visibility = 'visible';
    let appliedPromo = null, discountedTotal = b.total;
    const promoMsg = document.getElementById('promoMessage');
    const displayTotal = document.getElementById('displayTotal');
    const applyBtn = document.getElementById('applyPromoBtn');
    if (applyBtn) applyBtn.onclick = () => {
      const code = document.getElementById('promoCodeInput')?.value.trim().toUpperCase();
      const promo = promoCodes.find(p => p.code === code);
      if (!promo) { if(promoMsg) promoMsg.innerHTML = '<span style="color:#ef4444;">كود غير صالح</span>'; return; }
      if (promo.validUntil && new Date(promo.validUntil) < new Date()) { if(promoMsg) promoMsg.innerHTML = '<span style="color:#ef4444;">منتهي الصلاحية</span>'; return; }
      if (promo.maxUses && promo.usedCount >= promo.maxUses) { if(promoMsg) promoMsg.innerHTML = '<span style="color:#ef4444;">تم استنفاذ الكود</span>'; return; }
      appliedPromo = promo;
      discountedTotal = promo.discountType === 'percentage' ? b.total * (1 - promo.discountValue/100) : Math.max(0, b.total - promo.discountValue);
      if(displayTotal) displayTotal.textContent = discountedTotal.toFixed(2);
      if(promoMsg) promoMsg.innerHTML = `<span style="color:#10b981;">تم تطبيق ${promo.code}</span>`;
      pendingBooking.discountAmount = b.total - discountedTotal;
      pendingBooking.promoCode = promo.code;
      pendingBooking.finalTotal = discountedTotal;
    };
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    if (confirmBtn) confirmBtn.onclick = async () => {
      const newBookings = [], newSessions = [];
      for (const item of b.items) {
        const requiresApproval = item.type === 'court' ? (venues.find(v => v.id === item.venueId)?.requiresApproval || false) : false;
        const status = requiresApproval ? 'pending' : 'confirmed';
        if (item.type === 'court') {
          const court = courts.find(c => c.id === item.courtId);
          const price = calculateBookingPrice(court, item.date, item.time, item.duration);
          newBookings.push({ id: Date.now()+'-'+Math.random(), ...item, price, appFee: price*0.15, status, rated: false, promoCode: appliedPromo?.code });
        } else {
          const coach = coaches.find(c => c.id === item.coachId);
          const price = coach.hourlyRate * item.duration;
          newSessions.push({ id: Date.now()+'-'+Math.random(), ...item, price, appFee: price*0.15, status, rated: false, promoCode: appliedPromo?.code });
        }
      }
      if (newBookings.length) { bookings.push(...newBookings); await api.saveBookings(bookings); }
      if (newSessions.length) { coachBookings.push(...newSessions); await api.saveCoachBookings(coachBookings); }
      if (appliedPromo) { appliedPromo.usedCount++; await api.savePromoCodes(promoCodes); }
      cart = []; await api.saveCart(cart); updateCartUI();
      showToast('تم الدفع بنجاح');
      modal.style.visibility = 'hidden';
      if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
      renderCustomerBookings();
    };
  }

  safeAddEventListener('cancelPaymentBtn', 'click', () => {
    document.getElementById('paymentModal').style.visibility = 'hidden';
  });
  safeAddEventListener('closeBookingModal', 'click', () => {
    document.getElementById('bookingModal').style.visibility = 'hidden';
  });
  
    // ---------- إدارة الحجز (تعديل/إلغاء) ----------
  function openManageBookingModal(bookingId, type) {
    const booking = type === 'court' ? bookings.find(b => b.id === bookingId) : coachBookings.find(b => b.id === bookingId);
    if (!booking) return;
    const idInput = document.getElementById('manageBookingId');
    const typeInput = document.getElementById('manageBookingType');
    const dateInput = document.getElementById('manageBookingDate');
    const timeInput = document.getElementById('manageBookingTime');
    const durInput = document.getElementById('manageBookingDuration');
    const title = document.getElementById('manageBookingTitle');
    if (idInput) idInput.value = bookingId;
    if (typeInput) typeInput.value = type;
    if (dateInput) dateInput.value = booking.date;
    if (timeInput) timeInput.value = booking.time;
    if (durInput) durInput.value = booking.duration;
    if (title) title.textContent = type === 'court' ? 'تعديل حجز الملعب' : 'تعديل جلسة التدريب';
    updateManagePrice();
    document.getElementById('manageBookingModal').style.visibility = 'visible';

    function updateManagePrice() {
      const type = document.getElementById('manageBookingType')?.value;
      const date = document.getElementById('manageBookingDate')?.value;
      const time = document.getElementById('manageBookingTime')?.value;
      const dur = +(document.getElementById('manageBookingDuration')?.value || 1);
      const priceSpan = document.getElementById('manageBookingPrice');
      if (!priceSpan) return;
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
      priceSpan.textContent = price.toFixed(2);
    }
    safeAddEventListener('manageBookingDuration', 'input', updateManagePrice);
    safeAddEventListener('manageBookingTime', 'change', updateManagePrice);
    safeAddEventListener('manageBookingDate', 'change', updateManagePrice);
  }

  safeAddEventListener('manageBookingForm', 'submit', async e => {
    e.preventDefault();
    const id = document.getElementById('manageBookingId')?.value;
    const type = document.getElementById('manageBookingType')?.value;
    const newDate = document.getElementById('manageBookingDate')?.value;
    const newTime = document.getElementById('manageBookingTime')?.value;
    const newDuration = +(document.getElementById('manageBookingDuration')?.value || 1);
    if (type === 'court') {
      const booking = bookings.find(b => b.id === id);
      const court = courts.find(c => c.id === booking.courtId);
      const venue = venues.find(v => v.id === booking.venueId);
      const conflict = bookings.some(b => b.id !== id && b.courtId === booking.courtId && b.date === newDate && b.status !== 'cancelled' && isTimeOverlap(timeToMinutes(newTime), newDuration, timeToMinutes(b.time), b.duration));
      if (conflict) { showToast('يوجد تعارض', false); return; }
      if (!isWithinWorkingHours(venue, newDate, newTime, newDuration)) { showToast('خارج ساعات العمل', false); return; }
      if (isBlackedOut('court', court.id, newDate, newTime, newDuration)) { showToast('الملعب مغلق', false); return; }
      booking.date = newDate; booking.time = newTime; booking.duration = newDuration;
      booking.price = calculateBookingPrice(court, newDate, newTime, newDuration);
      booking.appFee = booking.price * 0.15;
      await api.saveBookings(bookings);
      addNotification(booking.customerId, `تم تعديل حجزك في ${venue.name} إلى ${newDate} ${newTime}`);
    } else {
      const session = coachBookings.find(s => s.id === id);
      const coach = coaches.find(c => c.id === session.coachId);
      const conflict = coachBookings.some(s => s.id !== id && s.coachId === session.coachId && s.date === newDate && s.status !== 'cancelled' && isTimeOverlap(timeToMinutes(newTime), newDuration, timeToMinutes(s.time), s.duration));
      if (conflict) { showToast('يوجد تعارض', false); return; }
      if (!isWithinCoachWorkingHours(coach.id, newDate, newTime, newDuration)) { showToast('خارج ساعات المدرب', false); return; }
      if (isBlackedOut('coach', coach.id, newDate, newTime, newDuration)) { showToast('المدرب غير متاح', false); return; }
      session.date = newDate; session.time = newTime; session.duration = newDuration;
      session.price = coach.hourlyRate * newDuration;
      session.appFee = session.price * 0.15;
      await api.saveCoachBookings(coachBookings);
      addNotification(session.customerId, `تم تعديل جلستك مع ${coach.name} إلى ${newDate} ${newTime}`);
    }
    showToast('تم التعديل');
    document.getElementById('manageBookingModal').style.visibility = 'hidden';
    if (document.getElementById('venueDashboard')?.classList.contains('active')) loadVenueDashboard();
    if (document.getElementById('coachDashboard')?.classList.contains('active')) loadCoachDashboard();
    renderCustomerBookings();
  });

  async function cancelBooking(bookingId, type) {
    showConfirm('هل أنت متأكد من الإلغاء؟', async () => {
      if (type === 'court') {
        const booking = bookings.find(b => b.id === bookingId);
        if (!booking) return;
        booking.status = 'cancelled';
        await api.saveBookings(bookings);
        addNotification(booking.customerId, `تم إلغاء حجزك في ${booking.venueName} بتاريخ ${booking.date}`);
      } else {
        const session = coachBookings.find(s => s.id === bookingId);
        if (!session) return;
        session.status = 'cancelled';
        await api.saveCoachBookings(coachBookings);
        addNotification(session.customerId, `تم إلغاء جلستك مع ${session.coachName} بتاريخ ${session.date}`);
      }
      showToast('تم الإلغاء');
      renderCustomerBookings();
      if (document.getElementById('venueDashboard')?.classList.contains('active')) loadVenueDashboard();
      if (document.getElementById('coachDashboard')?.classList.contains('active')) loadCoachDashboard();
    });
  }

  safeAddEventListener('cancelBookingBtn', 'click', () => {
    const id = document.getElementById('manageBookingId')?.value;
    const type = document.getElementById('manageBookingType')?.value;
    if (id && type) cancelBooking(id, type);
    document.getElementById('manageBookingModal').style.visibility = 'hidden';
  });
  safeAddEventListener('closeManageModalBtn', 'click', () => {
    document.getElementById('manageBookingModal').style.visibility = 'hidden';
  });

  async function cancelRecurringGroup(groupId) {
    showConfirm('إلغاء جميع الحجوزات في هذه المجموعة؟', async () => {
      const group = recurringGroups.find(g => g.id === groupId);
      if (!group) return;
      if (group.type === 'court') {
        bookings.forEach(b => { if (b.recurringGroupId === groupId) b.status = 'cancelled'; });
        await api.saveBookings(bookings);
      } else {
        coachBookings.forEach(s => { if (s.recurringGroupId === groupId) s.status = 'cancelled'; });
        await api.saveCoachBookings(coachBookings);
      }
      showToast('تم الإلغاء');
      renderCustomerBookings();
    });
  }

  function openManageRecurringModal(groupId) {
    const group = recurringGroups.find(g => g.id === groupId);
    if (!group) return;
    const newEnd = prompt('تاريخ انتهاء جديد (YYYY-MM-DD):', group.endDate);
    if (newEnd) {
      group.endDate = newEnd;
      api.saveRecurringGroups(recurringGroups);
      showToast('تم التحديث');
      renderCustomerBookings();
    }
  }

  // ---------- التقييم ----------
  function openRatingModal(targetId, bookingId, type) {
    const targetInput = document.getElementById('ratingTargetId');
    const bookingInput = document.getElementById('ratingBookingId');
    const typeInput = document.getElementById('ratingType');
    if (targetInput) targetInput.value = targetId;
    if (bookingInput) bookingInput.value = bookingId;
    if (typeInput) typeInput.value = type;
    selectedRating = 0;
    document.querySelectorAll('#ratingStars i').forEach(s => { s.className = 'far fa-star'; s.style.color = ''; });
    const comment = document.getElementById('ratingComment');
    if (comment) comment.value = '';
    document.getElementById('ratingModal').style.visibility = 'visible';
  }

  document.querySelectorAll('#ratingStars i').forEach(star => {
    star.addEventListener('click', function() {
      selectedRating = parseInt(this.dataset.value);
      document.querySelectorAll('#ratingStars i').forEach((s, i) => {
        s.className = i < selectedRating ? 'fas fa-star' : 'far fa-star';
        s.style.color = i < selectedRating ? '#fbbf24' : '';
      });
    });
  });

  safeAddEventListener('submitRatingBtn', 'click', async () => {
    const targetId = document.getElementById('ratingTargetId')?.value;
    const bookingId = document.getElementById('ratingBookingId')?.value;
    const type = document.getElementById('ratingType')?.value;
    const comment = sanitizeInput(document.getElementById('ratingComment')?.value || '');
    if (selectedRating === 0) { showToast('اختر تقييماً', false); return; }
    if (type === 'venue') {
      if (!reviews[targetId]) reviews[targetId] = [];
      reviews[targetId].push({ userId: currentUser.id, userName: currentUser.name, rating: selectedRating, comment, date: new Date().toISOString(), bookingId });
      await api.saveReviews(reviews);
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) { booking.rated = true; await api.saveBookings(bookings); }
    } else {
      if (!coachReviews[targetId]) coachReviews[targetId] = [];
      coachReviews[targetId].push({ userId: currentUser.id, userName: currentUser.name, rating: selectedRating, comment, date: new Date().toISOString(), bookingId });
      await api.saveCoachReviews(coachReviews);
      const session = coachBookings.find(s => s.id === bookingId);
      if (session) { session.rated = true; await api.saveCoachBookings(coachBookings); }
    }
    showToast('شكراً لتقييمك!');
    document.getElementById('ratingModal').style.visibility = 'hidden';
    renderCustomerBookings();
    if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
  });

  safeAddEventListener('closeRatingModal', 'click', () => {
    document.getElementById('ratingModal').style.visibility = 'hidden';
  });

  // ---------- حجوزات العميل (Event Delegation) ----------
  function renderCustomerBookings() {
    if (!currentUser) return;
    const myCourt = bookings.filter(b => b.customerId === currentUser.id);
    const myCoach = coachBookings.filter(b => b.customerId === currentUser.id);
    const container = document.getElementById('customerBookingsList');
    if (!container) return;
    const symbol = getCurrencySymbol(currentCurrency);
    if (!myCourt.length && !myCoach.length) { container.innerHTML = '<p>لا توجد حجوزات</p>'; return; }
    let html = '';
    myCourt.forEach(b => {
      const court = courts.find(c => c.id === b.courtId);
      const venue = venues.find(v => v.id === b.venueId);
      const canRate = (b.status === 'confirmed' || b.status === 'مدفوع') && !b.rated;
      const statusText = { pending:'بانتظار الموافقة', cancelled:'ملغي', confirmed:'مؤكد', مدفوع:'مؤكد' }[b.status] || '';
      const recurringBadge = b.recurringGroupId ? '<span style="background:#6366f1; color:white; padding:2px 8px; border-radius:20px;">🔄 متكرر</span>' : '';
      html += `<div class="booking-item" data-booking-id="${b.id}" data-type="court" data-recurring="${b.recurringGroupId||''}">
        <div><strong>🏟️ ${sanitizeInput(court?.name || b.venueName)}</strong> (${venue?.name || ''}) ${recurringBadge}</div>
        <div>${b.date} | ${b.time} (${b.duration} س) | ${b.price} ${symbol} | ${statusText}</div>
        <div class="booking-actions">
          ${b.recurringGroupId ? `<button class="edit-recurring-btn" data-group="${b.recurringGroupId}">تعديل المجموعة</button><button class="cancel-recurring-btn" data-group="${b.recurringGroupId}">إلغاء الكل</button>` : `<button class="edit-booking-btn" data-id="${b.id}" data-type="court">تعديل</button><button class="cancel-booking-btn" data-id="${b.id}" data-type="court">إلغاء</button>`}
          ${canRate ? `<button class="rate-btn" data-target="${b.venueId}" data-booking="${b.id}" data-type="venue">تقييم</button>` : ''}
        </div>
      </div>`;
    });
    myCoach.forEach(s => {
      const coach = coaches.find(c => c.id === s.coachId);
      const canRate = (s.status === 'confirmed' || s.status === 'مدفوع') && !s.rated;
      const recurringBadge = s.recurringGroupId ? '<span style="background:#6366f1; color:white; padding:2px 8px; border-radius:20px;">🔄 متكرر</span>' : '';
      html += `<div class="booking-item" data-booking-id="${s.id}" data-type="coach" data-recurring="${s.recurringGroupId||''}">
        <div><strong>👤 ${sanitizeInput(coach?.name || s.coachName)}</strong> (${getSportDisplayName(coach?.sport||'')}) ${recurringBadge}</div>
        <div>${s.date} | ${s.time} (${s.duration} س) | ${s.price} ${symbol}</div>
        <div class="booking-actions">
          ${s.recurringGroupId ? `<button class="edit-recurring-btn" data-group="${s.recurringGroupId}">تعديل المجموعة</button><button class="cancel-recurring-btn" data-group="${s.recurringGroupId}">إلغاء الكل</button>` : `<button class="edit-booking-btn" data-id="${s.id}" data-type="coach">تعديل</button><button class="cancel-booking-btn" data-id="${s.id}" data-type="coach">إلغاء</button>`}
          ${canRate ? `<button class="rate-btn" data-target="${s.coachId}" data-booking="${s.id}" data-type="coach">تقييم</button>` : ''}
        </div>
      </div>`;
    });
    container.innerHTML = html;
    container.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('edit-booking-btn')) openManageBookingModal(btn.dataset.id, btn.dataset.type);
      else if (btn.classList.contains('cancel-booking-btn')) cancelBooking(btn.dataset.id, btn.dataset.type);
      else if (btn.classList.contains('edit-recurring-btn')) openManageRecurringModal(btn.dataset.group);
      else if (btn.classList.contains('cancel-recurring-btn')) cancelRecurringGroup(btn.dataset.group);
      else if (btn.classList.contains('rate-btn')) openRatingModal(btn.dataset.target, btn.dataset.booking, btn.dataset.type);
    });
  }
  
    // ---------- لوحة تحكم المنشأة ----------
  async function loadVenueDashboard() {
    const container = document.getElementById('venueDashboardContent');
    if (!container || !currentUser) return;
    let myVenues = currentUser.role === 'admin' ? venues : venues.filter(v => v.ownerId === currentUser.id);
    if (!myVenues.length) { container.innerHTML = '<p>لا توجد منشآت</p>'; return; }
    let html = '<select id="venueSelectDashboard" class="filter-select"><option>اختر منشأة</option>';
    myVenues.forEach(v => html += `<option value="${v.id}">${sanitizeInput(v.name)}</option>`);
    html += '</select><div id="selectedVenueDetail"></div>';
    container.innerHTML = html;
    const select = document.getElementById('venueSelectDashboard');
    if (select) select.addEventListener('change', e => {
      const venue = myVenues.find(v => v.id === e.target.value);
      if (venue) renderVenueDetailForOwner(venue);
    });
  }

  function renderVenueDetailForOwner(venue) {
    const detail = document.getElementById('selectedVenueDetail');
    if (!detail) return;
    const venueBookings = bookings.filter(b => b.venueId === venue.id);
    const venueCourts = courts.filter(c => c.venueId === venue.id);
    const symbol = getCurrencySymbol(currentCurrency);
    const totalRevenue = venueBookings.filter(b => b.status === 'confirmed' || b.status === 'مدفوع').reduce((s,b)=>s+(b.price||0),0);
    let courtsHtml = venueCourts.map(c => `
      <div class="court-item-dashboard" data-court-id="${c.id}">
        <div><strong>${sanitizeInput(c.name)}</strong> - ${c.multiSport?c.allowedSports.map(s=>getSportDisplayName(s)).join('/'):getSportDisplayName(c.sport)}</div>
        <div><button class="edit-court-btn" data-id="${c.id}">تعديل</button><button class="delete-court-btn" data-id="${c.id}">حذف</button><button class="blackout-court-btn" data-id="${c.id}">إغلاق</button></div>
      </div>`).join('');
    let bookingsHtml = '';
    const pending = venueBookings.filter(b => b.status === 'pending');
    const active = venueBookings.filter(b => b.status === 'confirmed' || b.status === 'مدفوع');
    if (venue.requiresApproval) {
      bookingsHtml += `<h4>بانتظار الموافقة (${pending.length})</h4>`;
      bookingsHtml += pending.map(b => `<div data-booking-id="${b.id}"><strong>${b.customerName}</strong> ${b.date} ${b.time} <button class="approve-booking-btn" data-id="${b.id}">قبول</button><button class="reject-booking-btn" data-id="${b.id}">رفض</button></div>`).join('');
    }
    bookingsHtml += `<h4>الحجوزات النشطة (${active.length})</h4>`;
    bookingsHtml += active.map(b => `<div data-booking-id="${b.id}"><strong>${b.customerName}</strong> ${b.date} ${b.time} <button class="edit-booking-btn" data-id="${b.id}" data-type="court">تعديل</button><button class="cancel-booking-btn" data-id="${b.id}" data-type="court">إلغاء</button></div>`).join('');
    detail.innerHTML = `
      <h3>${sanitizeInput(venue.name)} <button class="edit-venue-btn" data-id="${venue.id}">تعديل</button></h3>
      <div>الإيرادات: ${totalRevenue} ${symbol}</div>
      <div><label><input type="checkbox" id="requiresApprovalCheck" ${venue.requiresApproval?'checked':''}> تتطلب موافقة</label></div>
      <div><h4>الملاعب <button id="addNewCourtBtn" data-venue="${venue.id}">+ إضافة</button></h4><div id="courtsList">${courtsHtml}</div></div>
      <div>${bookingsHtml}</div>
    `;
    detail.addEventListener('click', async e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('edit-venue-btn')) openEditVenueModal(btn.dataset.id);
      else if (btn.id === 'addNewCourtBtn') openCourtModal(null, btn.dataset.venue);
      else if (btn.classList.contains('edit-court-btn')) openCourtModal(btn.dataset.id);
      else if (btn.classList.contains('delete-court-btn')) {
        showConfirm('حذف الملعب؟', async () => {
          courts = courts.filter(c => c.id !== btn.dataset.id);
          bookings = bookings.filter(b => b.courtId !== btn.dataset.id);
          await api.saveCourts(courts); await api.saveBookings(bookings);
          renderVenueDetailForOwner(venue);
        });
      } else if (btn.classList.contains('blackout-court-btn')) openBlackoutModal('court', btn.dataset.id);
      else if (btn.classList.contains('approve-booking-btn')) {
        const b = bookings.find(bk => bk.id === btn.dataset.id);
        if (b) { b.status = 'confirmed'; await api.saveBookings(bookings); renderVenueDetailForOwner(venue); }
      } else if (btn.classList.contains('reject-booking-btn')) {
        const b = bookings.find(bk => bk.id === btn.dataset.id);
        if (b) { b.status = 'cancelled'; await api.saveBookings(bookings); renderVenueDetailForOwner(venue); }
      } else if (btn.classList.contains('edit-booking-btn')) openManageBookingModal(btn.dataset.id, btn.dataset.type);
      else if (btn.classList.contains('cancel-booking-btn')) cancelBooking(btn.dataset.id, btn.dataset.type);
    });
    const check = document.getElementById('requiresApprovalCheck');
    if (check) check.addEventListener('change', async e => {
      venue.requiresApproval = e.target.checked;
      await api.saveVenues(venues);
    });
  }

  // ---------- دوال الملاعب والإغلاقات (موجودة مسبقاً مع safeAddEventListener) ----------
  // ... (يمكن استكمالها من الإصدارات السابقة مع التأكد من فحص وجود العناصر)

  // ---------- الإلغاء التلقائي للدفع ----------
  function startPendingPaymentChecker() {
    setInterval(async () => {
      const now = new Date();
      const expired = pendingPayments.filter(p => new Date(p.expiresAt) < now);
      for (let p of expired) {
        if (p.type === 'court') {
          const b = bookings.find(bk => bk.id === p.bookingId);
          if (b && b.status === 'pending_payment') b.status = 'cancelled';
        }
      }
      pendingPayments = pendingPayments.filter(p => new Date(p.expiresAt) >= now);
      await api.savePendingPayments(pendingPayments);
    }, 60000);
  }

  // ---------- إغلاق النوافذ العامة ----------
  safeAddEventListener('closeEditModalBtn', 'click', () => {
    document.getElementById('editVenueModal').style.visibility = 'hidden';
  });
  safeAddEventListener('closeNotificationsModal', 'click', () => {
    document.getElementById('notificationsModal').style.visibility = 'hidden';
  });
  safeAddEventListener('clearNotificationsBtn', 'click', async () => {
    notifications = notifications.filter(n => n.userId !== currentUser?.id);
    await api.saveNotifications(notifications);
    openNotifications();
  });

  // ---------- التهيئة النهائية (داخل DOMContentLoaded) ----------
  document.addEventListener('DOMContentLoaded', async () => {
    showLoader();
    await initializeCurrency();
    setLanguage(navigator.language.startsWith('ar') ? 'ar' : 'en');
    safeAddEventListener('toggleLangBtn', 'click', () => setLanguage(currentLanguage === 'ar' ? 'en' : 'ar'));

    let v = await api.getVenues();
    if (!v.length) {
      v = [{ id: 'v1', name: 'ملعب النخبة', phone: '966501234567', lat: 24.7136, lng: 46.6753, image: '', desc: 'مركز رياضي متكامل', ownerId: 'admin', pricing: [40,50,60,70], workingHours: null, requiresApproval: false }];
      await api.saveVenues(v);
    }
    let c = await api.getCourts();
    if (!c.length) {
      c = [{ id: 'c1', venueId: 'v1', name: 'الملعب الرئيسي', multiSport: false, sport: 'football', allowedSports: [], pricing: null }];
      await api.saveCourts(c);
    }
    let coachesList = await api.getCoaches();
    if (!coachesList.length) {
      coachesList = [{ id: 'coach1', name: 'أحمد المدرب', phone: '966512345678', lat: 24.7136, lng: 46.6753, image: '', desc: 'مدرب كرة قدم', sport: 'football', hourlyRate: 150, ownerId: 'admin' }];
      await api.saveCoaches(coachesList);
      coachAvailability['coach1'] = {};
      await api.saveCoachAvailability(coachAvailability);
    }
    let u = await api.getUsers();
    if (!u.length) {
      u = [{ id: 'admin', email: 'admin@sport.com', password: encodePassword('admin'), role: 'admin', name: 'المدير', blocked: false, profileImage: '' }];
      await api.saveUsers(u);
    }

    await refreshData();

    const mapEl = document.getElementById('map');
    if (mapEl) {
      map = L.map('map').setView([24.7136, 46.6753], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
      map.on('moveend', () => {
        const center = map.getCenter();
        customerLocation = { lat: center.lat, lng: center.lng };
        if (currentViewMode === 'courts') renderCourts(document.getElementById('sportFilter')?.value);
        else renderCoaches(document.getElementById('sportFilter')?.value);
      });
    }

    safeAddEventListener('floatingLocationBtn', 'click', () => {
      navigator.geolocation.getCurrentPosition(pos => {
        if (map) map.setView([pos.coords.latitude, pos.coords.longitude], 15);
        customerLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (currentViewMode === 'courts') renderCourts(); else renderCoaches();
      });
    });

    safeAddEventListener('filterBtn', 'click', () => {
      const sport = document.getElementById('sportFilter')?.value;
      if (currentViewMode === 'courts') renderCourts(sport); else renderCoaches(sport);
    });
    safeAddEventListener('showCourtsBtn', 'click', () => {
      currentViewMode = 'courts';
      document.getElementById('showCourtsBtn')?.classList.add('active');
      document.getElementById('showCoachesBtn')?.classList.remove('active');
      renderCourts(document.getElementById('sportFilter')?.value);
    });
    safeAddEventListener('showCoachesBtn', 'click', () => {
      currentViewMode = 'coaches';
      document.getElementById('showCoachesBtn')?.classList.add('active');
      document.getElementById('showCourtsBtn')?.classList.remove('active');
      renderCoaches(document.getElementById('sportFilter')?.value);
    });
    safeAddEventListener('addSportBtn', 'click', async () => {
      const inp = document.getElementById('newSportInput');
      if (inp && await addCustomSport(inp.value)) inp.value = '';
    });
    safeAddEventListener('manualCurrencySelect', 'change', e => changeCurrency(e.target.value));

    renderCourts();
    if (document.getElementById('courtsListContainer')) createCourtField();
    startPendingPaymentChecker();
    hideLoader();
  });

})(); // نهاية IIFE