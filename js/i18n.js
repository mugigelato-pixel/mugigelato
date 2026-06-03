/* ============================================
   MUGI GELATO — Internationalization (i18n)
   ============================================ */

const translations = {
  tr: {
    // Menu
    menu_title: 'Menü',
    all_categories: 'Tümü',
    search_placeholder: 'Lezzet ara...',
    sold_out: 'Tükendi',
    new_badge: 'Yeni',
    special_badge: 'Özel',
    vegan_badge: 'Vegan',
    lactose_free_badge: 'Laktozsuz',
    no_products: 'Bu kategoride henüz ürün yok.',
    loading: 'Yükleniyor...',
    
    // Footer
    address_label: 'Adres',
    hours_label: 'Çalışma Saatleri',
    follow_us: 'Bizi Takip Edin',
    made_with: 'sevgiyle yapıldı',
    
    // Admin
    admin_title: 'Yönetim Paneli',
    login_title: 'Giriş',
    password_placeholder: 'Şifrenizi girin',
    login_button: 'Giriş Yap',
    login_error: 'Yanlış şifre!',
    logout: 'Çıkış',
    
    // Admin Nav
    nav_dashboard: 'Panel',
    nav_products: 'Ürünler',
    nav_categories: 'Kategoriler',
    nav_recipes: 'Tarifler',
    nav_settings: 'Ayarlar',
    nav_qr: 'QR Kod',
    
    // Dashboard
    total_products: 'Toplam Ürün',
    active_products: 'Aktif Ürün',
    total_categories: 'Kategori',
    total_recipes: 'Tarif',
    quick_actions: 'Hızlı İşlemler',
    add_new_product: 'Yeni Ürün Ekle',
    add_new_category: 'Yeni Kategori',
    view_menu: 'Menüyü Görüntüle',
    
    // Product Form
    product_name_tr: 'Ürün Adı (Türkçe)',
    product_name_en: 'Ürün Adı (İngilizce)',
    description_tr: 'Açıklama (Türkçe)',
    description_en: 'Açıklama (İngilizce)',
    category: 'Kategori',
    select_category: 'Kategori seçin',
    product_image: 'Ürün Görseli',
    upload_image: 'Görsel Yükle',
    drag_drop_image: 'Sürükle & bırak veya tıkla',
    image_formats: 'JPG, PNG, WebP — Max 5MB',
    change_image: 'Görseli Değiştir',
    remove_image: 'Görseli Kaldır',
    prices: 'Fiyatlar',
    size_tr: 'Boyut (TR)',
    size_en: 'Boyut (EN)',
    price: 'Fiyat',
    add_price: 'Fiyat Ekle',
    tags: 'Etiketler',
    is_active: 'Aktif',
    is_sold_out: 'Tükendi',
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    confirm_delete: 'Bu öğeyi silmek istediğinize emin misiniz?',
    confirm_delete_title: 'Silme Onayı',
    yes_delete: 'Evet, Sil',
    
    // Categories
    category_name_tr: 'Kategori Adı (Türkçe)',
    category_name_en: 'Kategori Adı (İngilizce)',
    category_emoji: 'Emoji',
    sort_order: 'Sıralama',
    
    // Recipes
    recipe_title: 'Tarif Yönetimi',
    select_product: 'Ürün Seçin',
    recipe_notes: 'Tarif Notları',
    yield_amount: 'Toplam Üretim Miktarı',
    yield_placeholder: 'ör: 2000 ml, 3 kg',
    ingredients: 'Malzeme Listesi',
    ingredient_name: 'Malzeme',
    quantity: 'Miktar',
    unit: 'Birim',
    percentage: 'Oran (%)',
    notes: 'Not',
    add_ingredient: 'Malzeme Ekle',
    total_percentage: 'Toplam Oran',
    save_recipe: 'Tarifi Kaydet',
    no_recipe: 'Bu ürün için henüz tarif eklenmemiş.',
    create_recipe: 'Tarif Oluştur',
    print_recipe: 'Yazdır',
    
    // Settings
    shop_name: 'Dükkan Adı',
    address: 'Adres',
    phone: 'Telefon',
    working_hours: 'Çalışma Saatleri',
    instagram_url: 'Instagram URL',
    default_language: 'Varsayılan Dil',
    change_password: 'Şifre Değiştir',
    current_password: 'Mevcut Şifre',
    new_password: 'Yeni Şifre',
    save_settings: 'Ayarları Kaydet',
    settings_saved: 'Ayarlar kaydedildi!',
    export_data: 'Veriyi Dışa Aktar',
    import_data: 'Veriyi İçe Aktar',
    reset_data: 'Verileri Sıfırla',
    reset_warning: 'Tüm veriler silinecek! Emin misiniz?',
    
    // QR
    qr_title: 'QR Kod Oluşturucu',
    menu_url: 'Menü URL',
    generate_qr: 'QR Kod Oluştur',
    download_qr: 'QR Kodu İndir',
    qr_color: 'QR Rengi',
    qr_bg_color: 'Arka Plan Rengi',
    
    // Toast
    product_added: 'Ürün eklendi!',
    product_updated: 'Ürün güncellendi!',
    product_deleted: 'Ürün silindi!',
    category_added: 'Kategori eklendi!',
    category_updated: 'Kategori güncellendi!',
    category_deleted: 'Kategori silindi!',
    recipe_saved: 'Tarif kaydedildi!',
    recipe_deleted: 'Tarif silindi!',
    error_occurred: 'Bir hata oluştu!',
    fill_required: 'Lütfen zorunlu alanları doldurun.',

    // Units
    unit_gr: 'gr',
    unit_kg: 'kg',
    unit_ml: 'ml',
    unit_lt: 'lt',
    unit_adet: 'adet',
    unit_tbsp: 'yemek k.',
    unit_tsp: 'tatlı k.',
  },

  en: {
    // Menu
    menu_title: 'Menu',
    all_categories: 'All',
    search_placeholder: 'Search flavors...',
    sold_out: 'Sold Out',
    new_badge: 'New',
    special_badge: 'Special',
    vegan_badge: 'Vegan',
    lactose_free_badge: 'Dairy Free',
    no_products: 'No products in this category yet.',
    loading: 'Loading...',
    
    // Footer
    address_label: 'Address',
    hours_label: 'Opening Hours',
    follow_us: 'Follow Us',
    made_with: 'made with love',
    
    // Admin
    admin_title: 'Admin Panel',
    login_title: 'Login',
    password_placeholder: 'Enter your password',
    login_button: 'Log In',
    login_error: 'Wrong password!',
    logout: 'Logout',
    
    // Admin Nav
    nav_dashboard: 'Dashboard',
    nav_products: 'Products',
    nav_categories: 'Categories',
    nav_recipes: 'Recipes',
    nav_settings: 'Settings',
    nav_qr: 'QR Code',
    
    // Dashboard
    total_products: 'Total Products',
    active_products: 'Active Products',
    total_categories: 'Categories',
    total_recipes: 'Recipes',
    quick_actions: 'Quick Actions',
    add_new_product: 'Add New Product',
    add_new_category: 'New Category',
    view_menu: 'View Menu',
    
    // Product Form
    product_name_tr: 'Product Name (Turkish)',
    product_name_en: 'Product Name (English)',
    description_tr: 'Description (Turkish)',
    description_en: 'Description (English)',
    category: 'Category',
    select_category: 'Select category',
    product_image: 'Product Image',
    upload_image: 'Upload Image',
    drag_drop_image: 'Drag & drop or click',
    image_formats: 'JPG, PNG, WebP — Max 5MB',
    change_image: 'Change Image',
    remove_image: 'Remove Image',
    prices: 'Prices',
    size_tr: 'Size (TR)',
    size_en: 'Size (EN)',
    price: 'Price',
    add_price: 'Add Price',
    tags: 'Tags',
    is_active: 'Active',
    is_sold_out: 'Sold Out',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm_delete: 'Are you sure you want to delete this item?',
    confirm_delete_title: 'Confirm Delete',
    yes_delete: 'Yes, Delete',
    
    // Categories
    category_name_tr: 'Category Name (Turkish)',
    category_name_en: 'Category Name (English)',
    category_emoji: 'Emoji',
    sort_order: 'Sort Order',
    
    // Recipes
    recipe_title: 'Recipe Management',
    select_product: 'Select Product',
    recipe_notes: 'Recipe Notes',
    yield_amount: 'Total Yield',
    yield_placeholder: 'e.g., 2000 ml, 3 kg',
    ingredients: 'Ingredients',
    ingredient_name: 'Ingredient',
    quantity: 'Quantity',
    unit: 'Unit',
    percentage: 'Ratio (%)',
    notes: 'Notes',
    add_ingredient: 'Add Ingredient',
    total_percentage: 'Total Ratio',
    save_recipe: 'Save Recipe',
    no_recipe: 'No recipe added for this product yet.',
    create_recipe: 'Create Recipe',
    print_recipe: 'Print',
    
    // Settings
    shop_name: 'Shop Name',
    address: 'Address',
    phone: 'Phone',
    working_hours: 'Working Hours',
    instagram_url: 'Instagram URL',
    default_language: 'Default Language',
    change_password: 'Change Password',
    current_password: 'Current Password',
    new_password: 'New Password',
    save_settings: 'Save Settings',
    settings_saved: 'Settings saved!',
    export_data: 'Export Data',
    import_data: 'Import Data',
    reset_data: 'Reset Data',
    reset_warning: 'All data will be deleted! Are you sure?',
    
    // QR
    qr_title: 'QR Code Generator',
    menu_url: 'Menu URL',
    generate_qr: 'Generate QR Code',
    download_qr: 'Download QR Code',
    qr_color: 'QR Color',
    qr_bg_color: 'Background Color',
    
    // Toast
    product_added: 'Product added!',
    product_updated: 'Product updated!',
    product_deleted: 'Product deleted!',
    category_added: 'Category added!',
    category_updated: 'Category updated!',
    category_deleted: 'Category deleted!',
    recipe_saved: 'Recipe saved!',
    recipe_deleted: 'Recipe deleted!',
    error_occurred: 'An error occurred!',
    fill_required: 'Please fill in the required fields.',

    // Units
    unit_gr: 'g',
    unit_kg: 'kg',
    unit_ml: 'ml',
    unit_lt: 'lt',
    unit_adet: 'pcs',
    unit_tbsp: 'tbsp',
    unit_tsp: 'tsp',
  }
};

let currentLang = 'tr';

const i18n = {
  setLang(lang) {
    currentLang = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('mugi_lang', lang);
  },

  getLang() {
    return currentLang;
  },

  init() {
    const saved = localStorage.getItem('mugi_lang');
    if (saved && translations[saved]) {
      currentLang = saved;
    } else {
      const settings = Store.getSettings();
      currentLang = settings.defaultLang || 'tr';
    }
    document.documentElement.lang = currentLang;
  },

  t(key) {
    return translations[currentLang]?.[key] || translations['tr']?.[key] || key;
  },

  // Get localized field from an object (e.g., product name)
  localize(obj, field) {
    if (!obj) return '';
    const localizedKey = `${field}_${currentLang}`;
    const fallbackKey = `${field}_tr`;
    return obj[localizedKey] || obj[fallbackKey] || '';
  },

  // Toggle language
  toggle() {
    this.setLang(currentLang === 'tr' ? 'en' : 'tr');
    return currentLang;
  },

  // Get available languages
  getLanguages() {
    return [
      { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
      { code: 'en', name: 'English', flag: '🇬🇧' }
    ];
  }
};
