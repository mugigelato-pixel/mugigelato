/* ============================================
   MUGI GELATO — Customer Menu Application
   ============================================ */

(function() {
  'use strict';

  // ── State ──
  let activeCategory = 'all';
  let searchQuery = '';
  let allProducts = [];
  let allCategories = [];

  // ── DOM Elements ──
  const categoryScroll = document.getElementById('categoryScroll');
  const productsGrid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('searchInput');
  const productModal = document.getElementById('productModal');
  const modalClose = document.getElementById('modalClose');
  const heroTagline = document.getElementById('heroTagline');
  const langBtnTr = document.getElementById('langBtnTr');
  const langBtnEn = document.getElementById('langBtnEn');

  // ── Initialize ──
  async function init() {
    Store.init(); // local cache first for fast render
    if (typeof ImageStorage !== 'undefined') await ImageStorage.init();
    i18n.init();
    loadData();
    await loadMenuHero();
    renderCategories();
    renderProducts();
    updateLanguageUI();
    bindEvents();
    setupRevealAnimations();

    // Then sync from cloud and re-render if data changed
    if (typeof SupabaseDB !== 'undefined') {
      const cloudData = await Store.initAsync();
      if (cloudData) {
        loadData();
        await loadMenuHero();
        renderCategories();
        renderProducts();
        updateLanguageUI();
      }
    }
  }

  // ── Menu Hero Background ──
  async function loadMenuHero() {
    const w = Store.getWebsite();
    const hero = w.menuHero;
    if (!hero || hero.bgType === 'gradient') return;

    const mediaEl = document.getElementById('heroBgMedia');
    const overlayEl = document.getElementById('heroBgOverlay');
    if (!mediaEl) return;

    if (hero.bgType === 'image' && hero.bgImage) {
      let url = hero.bgImage;
      if (url.startsWith('local://') && typeof ImageStorage !== 'undefined') {
        url = await ImageStorage.getUrl(url);
      }
      if (url) {
        mediaEl.innerHTML = `<img src="${url}" alt="Background">`;
        overlayEl.style.background = `rgba(11, 11, 20, ${hero.overlayOpacity || 0.6})`;
      }
    } else if (hero.bgType === 'video' && hero.bgVideo) {
      let url = hero.bgVideo;
      if (url.startsWith('local://') && typeof ImageStorage !== 'undefined') {
        url = await ImageStorage.getUrl(url);
      }
      if (url) {
        mediaEl.innerHTML = `<video src="${url}" autoplay muted loop playsinline></video>`;
        overlayEl.style.background = `rgba(11, 11, 20, ${hero.overlayOpacity || 0.6})`;
      }
    }
  }

  function loadData() {
    allCategories = Store.getCategories(true);
    allProducts = Store.getProducts(null, true);
    const settings = Store.getSettings();

    // Update footer with settings
    const footerAddress = document.getElementById('footerAddress');
    const footerHours = document.getElementById('footerHours');
    const footerPhone = document.getElementById('footerPhone');
    const footerPhoneItem = document.getElementById('footerPhoneItem');
    const footerInstagram = document.getElementById('footerInstagram');

    if (footerAddress) footerAddress.textContent = settings.address || '';
    if (footerHours) footerHours.textContent = settings.hours || '';
    if (settings.phone) {
      if (footerPhone) footerPhone.textContent = settings.phone;
      if (footerPhoneItem) footerPhoneItem.style.display = '';
    }
    if (footerInstagram && settings.instagram) {
      footerInstagram.href = settings.instagram;
    }
  }

  // ── Render Categories ──
  function renderCategories() {
    const allChip = document.createElement('button');
    allChip.className = `category-chip ${activeCategory === 'all' ? 'active' : ''}`;
    allChip.dataset.category = 'all';
    allChip.innerHTML = `<span class="emoji">✨</span><span>${i18n.t('all_categories')}</span>`;
    allChip.addEventListener('click', () => selectCategory('all'));

    categoryScroll.innerHTML = '';
    categoryScroll.appendChild(allChip);

    allCategories.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = `category-chip ${activeCategory === cat.id ? 'active' : ''}`;
      chip.dataset.category = cat.id;
      chip.innerHTML = `<span class="emoji">${cat.emoji}</span><span>${i18n.localize(cat, 'name')}</span>`;
      chip.addEventListener('click', () => selectCategory(cat.id));
      categoryScroll.appendChild(chip);
    });
  }

  function selectCategory(catId) {
    activeCategory = catId;
    // Update chips
    document.querySelectorAll('.category-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.category === catId);
    });
    renderProducts();
    // Scroll active chip into view
    const activeChip = document.querySelector('.category-chip.active');
    if (activeChip) {
      activeChip.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  // ── Render Products ──
  function renderProducts() {
    let filtered = [...allProducts];

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category_id === activeCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.name_tr || '').toLowerCase().includes(q) ||
        (p.name_en || '').toLowerCase().includes(q) ||
        (p.description_tr || '').toLowerCase().includes(q) ||
        (p.description_en || '').toLowerCase().includes(q)
      );
    }

    productsGrid.innerHTML = '';

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-emoji">🍨</div>
          <p class="empty-state-text">${i18n.t('no_products')}</p>
        </div>
      `;
      return;
    }

    if (activeCategory === 'all' && !searchQuery.trim()) {
      // Group by category
      allCategories.forEach((cat, catIdx) => {
        const catProducts = filtered.filter(p => p.category_id === cat.id);
        if (catProducts.length === 0) return;

        const title = document.createElement('div');
        title.className = 'category-group-title reveal';
        title.innerHTML = `<span class="emoji">${cat.emoji}</span>${i18n.localize(cat, 'name')}`;
        productsGrid.appendChild(title);

        catProducts.forEach((product, idx) => {
          const card = createProductCard(product, catIdx * 4 + idx);
          productsGrid.appendChild(card);
        });
      });
    } else {
      filtered.forEach((product, idx) => {
        const card = createProductCard(product, idx);
        productsGrid.appendChild(card);
      });
    }

    setupRevealAnimations();
  }

  // ── Create Product Card ──
  function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = `product-card reveal ${product.is_sold_out ? 'sold-out' : ''}`;
    card.style.transitionDelay = `${Math.min(index * 60, 400)}ms`;

    const name = i18n.localize(product, 'name');
    const desc = i18n.localize(product, 'description');
    const settings = Store.getSettings();
    const currency = settings.currency || '₺';

    // Category emoji
    const cat = allCategories.find(c => c.id === product.category_id);
    const catEmoji = cat ? cat.emoji : '🍨';

    // Image
    let imageHTML = '';
    if (product.image_url) {
      imageHTML = `
        <img class="product-image" src="${product.image_url}" alt="${name}" loading="lazy">
      `;
    } else {
      imageHTML = `<div class="product-image-placeholder">${catEmoji}</div>`;
    }

    // Sold out overlay
    let soldOutHTML = '';
    if (product.is_sold_out) {
      soldOutHTML = `
        <div class="sold-out-overlay">
          <span class="sold-out-label">${i18n.t('sold_out')}</span>
        </div>
      `;
    }

    // Tags
    let tagsHTML = '';
    if (product.tags && product.tags.length > 0) {
      tagsHTML = '<div class="product-tags">';
      product.tags.forEach(tag => {
        const tagMap = {
          vegan: { class: 'badge-vegan', icon: '🌱', key: 'vegan_badge' },
          lactose_free: { class: 'badge-lactose-free', icon: '🥛', key: 'lactose_free_badge' },
          new: { class: 'badge-new', icon: '🔥', key: 'new_badge' },
          special: { class: 'badge-special', icon: '⭐', key: 'special_badge' }
        };
        const t = tagMap[tag];
        if (t) {
          tagsHTML += `<span class="badge ${t.class}">${t.icon} ${i18n.t(t.key)}</span>`;
        }
      });
      tagsHTML += '</div>';
    }

    // Prices
    let pricesHTML = '<div class="product-prices">';
    if (product.prices && product.prices.length > 0) {
      product.prices.forEach((p, i) => {
        const size = i18n.localize(p, 'size');
        pricesHTML += `
          <div class="price-tag">
            <span class="price-size">${size}</span>
            <span class="price-value">${p.price}</span>
            <span class="price-currency">${currency}</span>
          </div>
        `;
        if (i < product.prices.length - 1) {
          pricesHTML += '<span class="price-separator">·</span>';
        }
      });
    }
    pricesHTML += '</div>';

    card.innerHTML = `
      <div class="product-card-inner">
        <div class="product-image-wrapper">
          ${imageHTML}
          ${soldOutHTML}
        </div>
        <div class="product-info">
          <h3 class="product-name">${name}</h3>
          <p class="product-description">${desc}</p>
          ${tagsHTML}
          ${pricesHTML}
        </div>
      </div>
    `;

    card.addEventListener('click', () => openProductModal(product));
    return card;
  }

  // ── Product Detail Modal ──
  function openProductModal(product) {
    const name = i18n.localize(product, 'name');
    const desc = i18n.localize(product, 'description');
    const settings = Store.getSettings();
    const currency = settings.currency || '₺';
    const cat = allCategories.find(c => c.id === product.category_id);
    const catEmoji = cat ? cat.emoji : '🍨';

    // Image
    const imageContainer = document.getElementById('modalImageContainer');
    if (product.image_url) {
      imageContainer.innerHTML = `<img class="modal-image" src="${product.image_url}" alt="${name}">`;
    } else {
      imageContainer.innerHTML = `<div class="modal-image-placeholder">${catEmoji}</div>`;
    }

    // Name & Description
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalDescription').textContent = desc;

    // Tags
    const tagsContainer = document.getElementById('modalTags');
    tagsContainer.innerHTML = '';
    if (product.tags) {
      product.tags.forEach(tag => {
        const tagMap = {
          vegan: { class: 'badge-vegan', icon: '🌱', key: 'vegan_badge' },
          lactose_free: { class: 'badge-lactose-free', icon: '🥛', key: 'lactose_free_badge' },
          new: { class: 'badge-new', icon: '🔥', key: 'new_badge' },
          special: { class: 'badge-special', icon: '⭐', key: 'special_badge' }
        };
        const t = tagMap[tag];
        if (t) {
          const badge = document.createElement('span');
          badge.className = `badge ${t.class}`;
          badge.textContent = `${t.icon} ${i18n.t(t.key)}`;
          tagsContainer.appendChild(badge);
        }
      });
    }

    if (product.is_sold_out) {
      const soldBadge = document.createElement('span');
      soldBadge.className = 'badge badge-sold-out';
      soldBadge.textContent = `🚫 ${i18n.t('sold_out')}`;
      tagsContainer.appendChild(soldBadge);
    }

    // Prices
    const pricesContainer = document.getElementById('modalPrices');
    pricesContainer.innerHTML = '';
    if (product.prices) {
      product.prices.forEach(p => {
        const size = i18n.localize(p, 'size');
        const row = document.createElement('div');
        row.className = 'modal-price-row';
        row.innerHTML = `
          <span class="modal-price-size">${size}</span>
          <span class="modal-price-value">${p.price} ${currency}</span>
        `;
        pricesContainer.appendChild(row);
      });
    }

    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ── Language Toggle ──
  function updateLanguageUI() {
    const lang = i18n.getLang();
    langBtnTr.classList.toggle('active', lang === 'tr');
    langBtnEn.classList.toggle('active', lang === 'en');

    // Update tagline
    const settings = Store.getSettings();
    heroTagline.textContent = i18n.localize(settings, 'tagline') || (lang === 'tr' ? 'El Yapımı İtalyan Gelato' : 'Artisan Italian Gelato');

    // Update search placeholder
    searchInput.placeholder = i18n.t('search_placeholder');

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = i18n.t(el.dataset.i18n);
    });

    // Re-render content
    renderCategories();
    renderProducts();
  }

  function switchLanguage(lang) {
    i18n.setLang(lang);
    updateLanguageUI();
  }

  // ── Search ──
  let searchTimeout = null;
  function handleSearch(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value;
      renderProducts();
    }, 200);
  }

  // ── Reveal Animations (Intersection Observer) ──
  function setupRevealAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => {
      observer.observe(el);
    });
  }

  // ── Event Bindings ──
  function bindEvents() {
    searchInput.addEventListener('input', handleSearch);

    modalClose.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeProductModal();
    });

    langBtnTr.addEventListener('click', () => switchLanguage('tr'));
    langBtnEn.addEventListener('click', () => switchLanguage('en'));

    // Escape key closes modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeProductModal();
    });

    // Touch swipe down to close modal
    let touchStartY = 0;
    const modalContent = productModal.querySelector('.modal-content');
    modalContent.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    modalContent.addEventListener('touchmove', (e) => {
      const diff = e.touches[0].clientY - touchStartY;
      if (diff > 80 && modalContent.scrollTop === 0) {
        closeProductModal();
      }
    }, { passive: true });
  }

  // ── Start ──
  document.addEventListener('DOMContentLoaded', init);
})();
