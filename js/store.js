/* ============================================
   MUGI GELATO — Data Store
   localStorage (cache) + Supabase (cloud sync)
   ============================================ */

const STORE_KEY = 'mugi_gelato_data';

const DEFAULT_DATA = {
  settings: {
    shopName: 'Mugi Gelato',
    tagline: { tr: 'El Yapımı İtalyan Gelato', en: 'Artisan Italian Gelato' },
    address: 'Türkali Mahallesi, Ihlamurdere Caddesi No:121, Beşiktaş, Istanbul, Turkey 34357',
    phone: '0542 130 68 44',
    email: 'info@mugigelato.com',
    hours: '11:00 – 23:00',
    instagram: 'https://www.instagram.com/mugigelato/',
    defaultLang: 'tr',
    adminPassword: 'mugi2024',
    currency: '₺',
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.913627728508!2d28.99950307681983!3d41.04901787134476!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab70b006b12d3%3A0x393bb7ec69d6e7ad!2sMugi%20Gelato!5e0!3m2!1str!2str!4v1758386156396!5m2!1str!2str'
  },

  // ── Website Content ──
  website: {
    heroTitle: "Mugi Gelato'ya Hoş geldin!",
    menuHero: {
      bgType: 'gradient',
      bgImage: '',
      bgVideo: '',
      overlayOpacity: 0.6
    },
    sections: [
      {
        id: 'sec_1',
        title: 'Dondurmalarımız',
        text: 'Günlük çiftlik sütü, mevsim meyveleri ve kendimize özgü yorumladığımız tariflerimizle; İtalyan dondurmasını Türk damak tadıyla baştan yaratıyoruz.',
        image: 'https://mugigelato.com/public/img/main/dondurma.png',
        sort_order: 1
      },
      {
        id: 'sec_2',
        title: 'Biz Kimiz?',
        text: "Mugi Gelato, pastacılıkta 9 yıllık eğitmenlik deneyimin ardından 2023'te lezzet yolculuğuna başladı. Şef Gizem'in doğal ve mevsiminde hazırladığı reçeteleriyle özgün dondurma ve tatlılar sunuyor.",
        image: 'https://mugigelato.com/public/img/main/kulahli-dondurma.png',
        sort_order: 2
      }
    ],
    services: [
      { id: 'srv_1', title: 'Catering', image: 'https://mugigelato.com/public/img/main/catering.png', sort_order: 1 },
      { id: 'srv_2', title: 'Restoran & Cafeler için çözüm ortaklığı', image: 'https://mugigelato.com/public/img/main/restoran-ve-cafeler-icin-cozum-ortakligi.png', sort_order: 2 },
      { id: 'srv_3', title: 'Kişiye Özel Tasarım Pastalar', image: 'https://mugigelato.com/public/img/main/kisiye-ozel-tasarim-pastalar.png', sort_order: 3 }
    ],
    testimonials: [
      { id: 'test_1', text: "İstanbul'un en lezzetli dondurmasını burada yedim. Çalışanları ve ortamı çok samimi ve temiz. İnsana mutluluk veriyor, çeşitleri de oldukça fazla porsiyonları da yine aynı şekilde büyük." },
      { id: 'test_2', text: "Genç bir kadın pasta şefinin, girişimcilik örneği sergileyip açtığı dondurma dükkanı. Ürünleri lezzetli ve eminimki içerisinde bulunan malzemeleri de özel getirtiyordur." },
      { id: 'test_3', text: "Dondurmaların hepsi el yapımı ve doğal katkı maddesi kullanılmadığı çok belli bölgenin en iyisi ve fiyatını hakediyor." },
      { id: 'test_4', text: "Türkiye'de yediğim en iyi dondurmalardan biriydi. Sahibi çok tatlı bir hanımefendi hiçbir ricamızı kırmadı. Keşke her gün gidebilseydim dedirtiyor insana 🥰" }
    ],
    testimonialImage: 'https://mugigelato.com/public/img/main/sizden_gelen_yorumlar.png',
    collaboration: {
      title: 'İş Birliği İçin Bize Ulaşın!',
      image: 'https://mugigelato.com/public/img/main/is_birligi.png'
    },
    mapImage: 'https://mugigelato.com/public/img/main/map.png',
    about: {
      text: "Pastacılık alanındaki 9 yıllık eğitmenlik ve mutfak tecrübesinden ilhamla doğan Mugi Gelato, 2023 yılında lezzet yolculuğuna başladı. İlk adımını dondurma üretimiyle atan Mugi, zamanla vitrinlerini özgün tatlılarla da zenginleştirdi. Şef Gizem'in mevsiminde ve doğal içeriklerle hazırladığı yaratıcı reçeteler, her kaşıkta farklı bir tat deneyimi sunuyor. Beşiktaş'ta konumlanan bu rafine zevklere hitap eden butik dükkân, aynı zamanda catering alanında büyümeyi hedefliyor ve birçok marka ile iş birlikleri yaparak lezzetlerini daha geniş kitlelerle buluşturuyor.",
      image1: 'https://mugigelato.com/public/img/about/mugi-gelato-hakkimizda.png',
      image2: 'https://mugigelato.com/public/img/about/mugi-dondurma-hakkimizda.png',
      chefTitle: 'Gizem Şef Kimdir?',
      chefText: "Pastacılık alanındaki 9 yıllık eğitmenlik ve mutfak tecrübesinden ilhamla doğan Mugi Gelato, 2023 yılında lezzet yolculuğuna başladı. İlk adımını dondurma üretimiyle atan Mugi, zamanla vitrinlerini özgün tatlılarla da zenginleştirdi. Şef Gizem'in mevsiminde ve doğal içeriklerle hazırladığı yaratıcı reçeteler, her kaşıkta farklı bir tat deneyimi sunuyor. Beşiktaş'ta konumlanan bu rafine zevklere hitap eden butik dükkân, aynı zamanda catering alanında büyümeyi hedefliyor ve birçok marka ile iş birlikleri yaparak lezzetlerini daha geniş kitlelerle buluşturuyor."
    },
    catering: {
      title: 'Mugi Pasta & Catering',
      subtitle: 'Eventinizi seçin!',
      formSubtitle: 'Detayları Doldurun & Bizimle İletişime Geçin!',
      options: [
        { id: 'opt_1', icon: 'celebration', title: 'Özel Günler', desc: 'Etkinlikleriniz için özel catering hizmeti.' },
        { id: 'opt_2', icon: 'diversity_3', title: 'Bireysel', desc: 'Siparişine özel pastalar.' }
      ],
      galleryImages: [
        'https://mugigelato.com/public/img/catering/gelato1.png',
        'https://mugigelato.com/public/img/catering/gelato2.png',
        'https://mugigelato.com/public/img/catering/gelato3.png',
        'https://mugigelato.com/public/img/catering/gelato4.png',
        'https://mugigelato.com/public/img/catering/catering.png',
        'https://mugigelato.com/public/img/catering/ozel-pasta.png',
        'https://mugigelato.com/public/img/catering/dondurma-servisi.png',
        'https://mugigelato.com/public/img/catering/gelato.png'
      ]
    }
  },

  // ── Menu Data ──
  categories: [
    { id: 'cat_1', name_tr: 'Gelato', name_en: 'Gelato', emoji: '🍨', sort_order: 1, is_active: true },
    { id: 'cat_2', name_tr: 'Tatlılar', name_en: 'Desserts', emoji: '🍰', sort_order: 2, is_active: true },
    { id: 'cat_3', name_tr: 'İçecekler', name_en: 'Drinks', emoji: '☕', sort_order: 3, is_active: true },
    { id: 'cat_4', name_tr: 'Özel', name_en: 'Specials', emoji: '⭐', sort_order: 4, is_active: true }
  ],
  products: [
    {
      id: 'prod_1', category_id: 'cat_1', name_tr: 'Antep Fıstığı', name_en: 'Pistachio',
      description_tr: 'Gerçek Antep fıstığı ile hazırlanan imza lezzetimiz',
      description_en: 'Our signature flavor made with real Antep pistachios',
      image_url: '', tags: ['special'], is_active: true, is_sold_out: false, sort_order: 1,
      prices: [
        { id: 'pr_1', size_tr: 'Tek Top', size_en: 'Single Scoop', price: 80 },
        { id: 'pr_2', size_tr: 'İki Top', size_en: 'Double Scoop', price: 140 },
        { id: 'pr_3', size_tr: 'Üç Top', size_en: 'Triple Scoop', price: 190 }
      ]
    },
    {
      id: 'prod_2', category_id: 'cat_1', name_tr: 'Çikolata', name_en: 'Dark Chocolate',
      description_tr: '%70 kakao, yoğun ve kadifemsi',
      description_en: '70% cacao, rich and velvety smooth',
      image_url: '', tags: [], is_active: true, is_sold_out: false, sort_order: 2,
      prices: [
        { id: 'pr_4', size_tr: 'Tek Top', size_en: 'Single Scoop', price: 80 },
        { id: 'pr_5', size_tr: 'İki Top', size_en: 'Double Scoop', price: 140 }
      ]
    },
    {
      id: 'prod_3', category_id: 'cat_1', name_tr: 'Mango Sorbe', name_en: 'Mango Sorbet',
      description_tr: 'Taze mangolardan, hafif ve ferahlatıcı',
      description_en: 'Fresh mangoes, light and refreshing',
      image_url: '', tags: ['vegan', 'lactose_free'], is_active: true, is_sold_out: false, sort_order: 3,
      prices: [
        { id: 'pr_7', size_tr: 'Tek Top', size_en: 'Single Scoop', price: 80 },
        { id: 'pr_8', size_tr: 'İki Top', size_en: 'Double Scoop', price: 140 }
      ]
    },
    {
      id: 'prod_4', category_id: 'cat_1', name_tr: 'Çilekli Cheesecake', name_en: 'Strawberry Cheesecake',
      description_tr: 'Taze çilek ve cheesecake parçacıklarıyla',
      description_en: 'With fresh strawberries and cheesecake pieces',
      image_url: '', tags: ['new'], is_active: true, is_sold_out: false, sort_order: 4,
      prices: [
        { id: 'pr_9', size_tr: 'Tek Top', size_en: 'Single Scoop', price: 90 },
        { id: 'pr_10', size_tr: 'İki Top', size_en: 'Double Scoop', price: 155 }
      ]
    },
    {
      id: 'prod_5', category_id: 'cat_1', name_tr: 'Vanilya', name_en: 'Vanilla Bean',
      description_tr: 'Madagaskar vanilyası ile klasik lezzet',
      description_en: 'Classic flavor with Madagascar vanilla',
      image_url: '', tags: [], is_active: true, is_sold_out: false, sort_order: 5,
      prices: [
        { id: 'pr_11', size_tr: 'Tek Top', size_en: 'Single Scoop', price: 80 },
        { id: 'pr_12', size_tr: 'İki Top', size_en: 'Double Scoop', price: 140 }
      ]
    },
    {
      id: 'prod_6', category_id: 'cat_1', name_tr: 'Elmalı Crumble', name_en: 'Apple Crumble',
      description_tr: 'Tarçınlı elma ve çıtır crumble parçaları',
      description_en: 'Cinnamon apple with crispy crumble pieces',
      image_url: '', tags: ['special'], is_active: true, is_sold_out: false, sort_order: 6,
      prices: [
        { id: 'pr_13', size_tr: 'Tek Top', size_en: 'Single Scoop', price: 90 },
        { id: 'pr_14', size_tr: 'İki Top', size_en: 'Double Scoop', price: 155 }
      ]
    },
    {
      id: 'prod_7', category_id: 'cat_2', name_tr: 'Tiramisu', name_en: 'Tiramisu',
      description_tr: 'İtalyan klasiği, mascarpone ve espresso',
      description_en: 'Italian classic with mascarpone and espresso',
      image_url: '', tags: [], is_active: true, is_sold_out: false, sort_order: 1,
      prices: [{ id: 'pr_15', size_tr: 'Porsiyon', size_en: 'Portion', price: 180 }]
    },
    {
      id: 'prod_8', category_id: 'cat_2', name_tr: 'Brownie', name_en: 'Chocolate Brownie',
      description_tr: 'Fudgy brownie, dondurma ile servis',
      description_en: 'Fudgy brownie, served with gelato',
      image_url: '', tags: [], is_active: true, is_sold_out: false, sort_order: 2,
      prices: [{ id: 'pr_16', size_tr: 'Porsiyon', size_en: 'Portion', price: 160 }]
    },
    {
      id: 'prod_9', category_id: 'cat_3', name_tr: 'Espresso', name_en: 'Espresso',
      description_tr: 'İtalyan usulü çift shot espresso',
      description_en: 'Italian style double shot espresso',
      image_url: '', tags: ['vegan'], is_active: true, is_sold_out: false, sort_order: 1,
      prices: [{ id: 'pr_17', size_tr: 'Standart', size_en: 'Standard', price: 60 }]
    },
    {
      id: 'prod_10', category_id: 'cat_3', name_tr: 'Affogato', name_en: 'Affogato',
      description_tr: 'Sıcak espresso üzerine vanilya gelato',
      description_en: 'Hot espresso poured over vanilla gelato',
      image_url: '', tags: ['special'], is_active: true, is_sold_out: false, sort_order: 2,
      prices: [{ id: 'pr_18', size_tr: 'Standart', size_en: 'Standard', price: 120 }]
    }
  ],
  recipes: []
};

function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

// ── Local Storage (cache) ──
function getData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveData(data) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  // Fire-and-forget cloud sync
  syncToCloud(data);
}

// ── Supabase Cloud Sync ──
let _syncTimer = null;
function syncToCloud(data) {
  if (typeof SupabaseDB === 'undefined') return;
  // Debounce: wait 500ms to batch rapid saves
  clearTimeout(_syncTimer);
  _syncTimer = setTimeout(async () => {
    try {
      await Promise.all([
        SupabaseDB.save('settings', data.settings),
        SupabaseDB.save('website', data.website),
        SupabaseDB.save('categories', data.categories),
        SupabaseDB.save('products', data.products),
        SupabaseDB.save('recipes', data.recipes || [])
      ]);
      console.log('☁️ Cloud sync complete');
    } catch (e) {
      console.warn('☁️ Cloud sync error:', e);
    }
  }, 500);
}

async function loadFromCloud() {
  if (typeof SupabaseDB === 'undefined') return null;
  try {
    const cloudData = await SupabaseDB.loadAll();
    if (!cloudData || Object.keys(cloudData).length === 0) return null;
    return {
      settings: cloudData.settings || DEFAULT_DATA.settings,
      website: cloudData.website || DEFAULT_DATA.website,
      categories: cloudData.categories || DEFAULT_DATA.categories,
      products: cloudData.products || DEFAULT_DATA.products,
      recipes: cloudData.recipes || []
    };
  } catch (e) {
    console.warn('Cloud load error:', e);
    return null;
  }
}

function initStore(forceReset = false) {
  const existing = getData();
  if (!existing || forceReset) {
    saveData(DEFAULT_DATA);
    return DEFAULT_DATA;
  }
  const merged = { ...DEFAULT_DATA, ...existing };
  merged.settings = { ...DEFAULT_DATA.settings, ...existing.settings };
  if (!merged.recipes) merged.recipes = [];
  if (!merged.website) merged.website = DEFAULT_DATA.website;
  // Ensure menuHero exists
  if (!merged.website.menuHero) merged.website.menuHero = DEFAULT_DATA.website.menuHero;
  saveData(merged);
  return merged;
}

// Async init: tries to load from Supabase first
async function initStoreAsync() {
  const cloudData = await loadFromCloud();
  if (cloudData) {
    // Cloud data exists — use it as source of truth
    const merged = { ...DEFAULT_DATA };
    merged.settings = { ...DEFAULT_DATA.settings, ...cloudData.settings };
    merged.website = cloudData.website || DEFAULT_DATA.website;
    if (!merged.website.menuHero) merged.website.menuHero = DEFAULT_DATA.website.menuHero;
    merged.categories = cloudData.categories || DEFAULT_DATA.categories;
    merged.products = cloudData.products || DEFAULT_DATA.products;
    merged.recipes = cloudData.recipes || [];
    // Update local cache without re-syncing
    localStorage.setItem(STORE_KEY, JSON.stringify(merged));
    console.log('☁️ Loaded data from Supabase');
    return merged;
  }
  // Fallback to local
  return initStore();
}

const Store = {
  init: initStore,
  initAsync: initStoreAsync,

  // Settings
  getSettings() { return getData()?.settings || DEFAULT_DATA.settings; },
  updateSettings(u) { const d = getData(); d.settings = { ...d.settings, ...u }; saveData(d); return d.settings; },

  // Website
  getWebsite() { return getData()?.website || DEFAULT_DATA.website; },
  updateWebsite(u) { const d = getData(); d.website = { ...d.website, ...u }; saveData(d); return d.website; },
  updateWebsiteSection(id, u) {
    const d = getData();
    const idx = d.website.sections.findIndex(s => s.id === id);
    if (idx !== -1) d.website.sections[idx] = { ...d.website.sections[idx], ...u };
    saveData(d);
  },
  addWebsiteSection(sec) {
    const d = getData();
    sec.id = generateId('sec');
    sec.sort_order = d.website.sections.length + 1;
    d.website.sections.push(sec);
    saveData(d);
    return sec;
  },
  deleteWebsiteSection(id) {
    const d = getData();
    d.website.sections = d.website.sections.filter(s => s.id !== id);
    saveData(d);
  },
  updateService(id, u) {
    const d = getData();
    const idx = d.website.services.findIndex(s => s.id === id);
    if (idx !== -1) d.website.services[idx] = { ...d.website.services[idx], ...u };
    saveData(d);
  },
  addService(srv) {
    const d = getData();
    srv.id = generateId('srv');
    srv.sort_order = d.website.services.length + 1;
    d.website.services.push(srv);
    saveData(d);
    return srv;
  },
  deleteService(id) {
    const d = getData();
    d.website.services = d.website.services.filter(s => s.id !== id);
    saveData(d);
  },
  updateTestimonial(id, u) {
    const d = getData();
    const idx = d.website.testimonials.findIndex(t => t.id === id);
    if (idx !== -1) d.website.testimonials[idx] = { ...d.website.testimonials[idx], ...u };
    saveData(d);
  },
  addTestimonial(t) {
    const d = getData();
    t.id = generateId('test');
    d.website.testimonials.push(t);
    saveData(d);
    return t;
  },
  deleteTestimonial(id) {
    const d = getData();
    d.website.testimonials = d.website.testimonials.filter(t => t.id !== id);
    saveData(d);
  },
  updateAbout(u) {
    const d = getData();
    d.website.about = { ...d.website.about, ...u };
    saveData(d);
  },
  updateCatering(u) {
    const d = getData();
    d.website.catering = { ...d.website.catering, ...u };
    saveData(d);
  },
  updateCollaboration(u) {
    const d = getData();
    d.website.collaboration = { ...d.website.collaboration, ...u };
    saveData(d);
  },

  // Categories
  getCategories(activeOnly = false) {
    const d = getData();
    let cats = d?.categories || [];
    if (activeOnly) cats = cats.filter(c => c.is_active);
    return cats.sort((a, b) => a.sort_order - b.sort_order);
  },
  getCategory(id) { return this.getCategories().find(c => c.id === id) || null; },
  addCategory(cat) {
    const d = getData();
    const nc = { id: generateId('cat'), name_tr: '', name_en: '', emoji: '📦', sort_order: d.categories.length + 1, is_active: true, ...cat };
    nc.id = generateId('cat');
    d.categories.push(nc);
    saveData(d);
    return nc;
  },
  updateCategory(id, u) {
    const d = getData();
    const i = d.categories.findIndex(c => c.id === id);
    if (i === -1) return null;
    d.categories[i] = { ...d.categories[i], ...u };
    saveData(d);
    return d.categories[i];
  },
  deleteCategory(id) {
    const d = getData();
    d.categories = d.categories.filter(c => c.id !== id);
    d.products = d.products.filter(p => p.category_id !== id);
    saveData(d);
  },

  // Products
  getProducts(catId = null, activeOnly = false) {
    const d = getData();
    let p = d?.products || [];
    if (catId) p = p.filter(x => x.category_id === catId);
    if (activeOnly) p = p.filter(x => x.is_active);
    return p.sort((a, b) => a.sort_order - b.sort_order);
  },
  getProduct(id) { return this.getProducts().find(p => p.id === id) || null; },
  addProduct(prod) {
    const d = getData();
    const np = { id: generateId('prod'), category_id: '', name_tr: '', name_en: '', description_tr: '', description_en: '', image_url: '', tags: [], is_active: true, is_sold_out: false, sort_order: d.products.filter(p => p.category_id === prod.category_id).length + 1, prices: [], ...prod };
    np.id = generateId('prod');
    np.prices = (np.prices || []).map(p => ({ ...p, id: p.id || generateId('pr') }));
    d.products.push(np);
    saveData(d);
    return np;
  },
  updateProduct(id, u) {
    const d = getData();
    const i = d.products.findIndex(p => p.id === id);
    if (i === -1) return null;
    if (u.prices) u.prices = u.prices.map(p => ({ ...p, id: p.id || generateId('pr') }));
    d.products[i] = { ...d.products[i], ...u };
    saveData(d);
    return d.products[i];
  },
  deleteProduct(id) {
    const d = getData();
    d.recipes = (d.recipes || []).filter(r => r.product_id !== id);
    d.products = d.products.filter(p => p.id !== id);
    saveData(d);
  },

  // Recipes
  getRecipes() { return getData()?.recipes || []; },
  getRecipe(id) { return this.getRecipes().find(r => r.id === id) || null; },
  getRecipeByProduct(pid) { return this.getRecipes().find(r => r.product_id === pid) || null; },
  addRecipe(r) {
    const d = getData();
    if (!d.recipes) d.recipes = [];
    const nr = { id: generateId('rec'), product_id: r.product_id || '', notes: r.notes || '', yield_amount: r.yield_amount || '', ingredients: (r.ingredients || []).map(i => ({ id: generateId('ing'), ingredient_name: i.ingredient_name || '', quantity: i.quantity || 0, unit: i.unit || 'gr', percentage: i.percentage || 0, sort_order: i.sort_order || 0, notes: i.notes || '' })), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    d.recipes.push(nr);
    saveData(d);
    return nr;
  },
  updateRecipe(id, u) {
    const d = getData();
    if (!d.recipes) d.recipes = [];
    const i = d.recipes.findIndex(r => r.id === id);
    if (i === -1) return null;
    if (u.ingredients) u.ingredients = u.ingredients.map(ing => ({ ...ing, id: ing.id || generateId('ing') }));
    d.recipes[i] = { ...d.recipes[i], ...u, updated_at: new Date().toISOString() };
    saveData(d);
    return d.recipes[i];
  },
  deleteRecipe(id) {
    const d = getData();
    d.recipes = (d.recipes || []).filter(r => r.id !== id);
    saveData(d);
  },

  // Export / Import
  exportData() { return JSON.stringify(getData(), null, 2); },
  importData(json) {
    try {
      const d = JSON.parse(json);
      if (!d.settings || !d.categories || !d.products) throw new Error('Invalid');
      saveData(d);
      return true;
    } catch { return false; }
  },
  resetData() { return initStore(true); }
};

Store.init();
