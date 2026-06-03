/* ============================================
   MUGI GELATO — Admin Panel Application
   With ImageStorage integration
   ============================================ */

(function () {
  'use strict';

  let isLoggedIn = false;
  let editingProductId = null;
  let editingCategoryId = null;
  let confirmCallback = null;

  // Field image map: tracks uploaded images for website fields
  const fieldImages = {};

  const loginScreen = document.getElementById('loginScreen');
  const adminLayout = document.getElementById('adminLayout');
  const loginForm = document.getElementById('loginForm');
  const loginPassword = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const adminSidebar = document.getElementById('adminSidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const formModal = document.getElementById('formModal');
  const formModalTitle = document.getElementById('formModalTitle');
  const formModalContent = document.getElementById('formModalContent');
  const formModalClose = document.getElementById('formModalClose');
  const confirmOverlay = document.getElementById('confirmOverlay');
  const toastContainer = document.getElementById('toastContainer');

  async function init() {
    Store.init();
    await ImageStorage.init();
    // Load latest from cloud
    if (typeof SupabaseDB !== 'undefined') {
      await Store.initAsync();
    }
    checkAuth();
    bindGlobalEvents();
  }

  // ── Auth ──
  function checkAuth() {
    if (sessionStorage.getItem('mugi_admin') === 'true') showAdmin();
  }

  function handleLogin(e) {
    e.preventDefault();
    const s = Store.getSettings();
    if (loginPassword.value === s.adminPassword) {
      sessionStorage.setItem('mugi_admin', 'true');
      showAdmin();
    } else {
      loginError.classList.add('show');
      loginPassword.value = '';
      setTimeout(() => loginError.classList.remove('show'), 3000);
    }
  }

  function showAdmin() {
    isLoggedIn = true;
    loginScreen.style.display = 'none';
    adminLayout.classList.add('active');
    renderDashboard();
    renderProductList();
    renderCategoryList();
    loadRecipeProductSelect();
    loadSettings();
    loadWebsiteContent();
    loadMenuHeroSettings();
  }

  function handleLogout() {
    sessionStorage.removeItem('mugi_admin');
    location.reload();
  }

  // ── Navigation ──
  function switchSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item[data-section]').forEach(n => n.classList.remove('active'));
    const section = document.getElementById(`section-${sectionId}`);
    const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
    if (section) section.classList.add('active');
    if (navItem) navItem.classList.add('active');
    adminSidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  }

  // ── Toast ──
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ── Confirm ──
  function showConfirm(title, text, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmText').textContent = text;
    confirmCallback = callback;
    confirmOverlay.classList.add('active');
  }

  // ── Form Modal ──
  function openFormModal(title, contentHTML) {
    formModalTitle.textContent = title;
    formModalContent.innerHTML = contentHTML;
    formModal.classList.add('active');
  }

  function closeFormModal() {
    formModal.classList.remove('active');
    editingProductId = null;
    editingCategoryId = null;
  }

  // ══════════════════════════════════════
  //  IMAGE HELPERS
  // ══════════════════════════════════════

  /**
   * Resolve an image URL (handles local:// refs)
   */
  async function resolveImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('local://')) {
      return await ImageStorage.getUrl(url);
    }
    return url;
  }

  /**
   * Show image preview in an element
   */
  async function showImagePreview(containerId, url, removeBtnId) {
    const container = document.getElementById(containerId);
    const removeBtn = document.getElementById(removeBtnId);
    if (!container) return;

    if (url) {
      const displayUrl = await resolveImageUrl(url);
      container.innerHTML = displayUrl ? `<img src="${displayUrl}" alt="Önizleme">` : '';
      if (removeBtn) removeBtn.style.display = displayUrl ? 'inline-flex' : 'none';
    } else {
      container.innerHTML = '';
      if (removeBtn) removeBtn.style.display = 'none';
    }
  }

  /**
   * Handle inline upload change for a field
   */
  async function handleFieldUpload(file, field, folder) {
    if (!file) return;
    try {
      showToast('Yükleniyor...', 'info');
      const url = await ImageStorage.upload(file, folder);
      fieldImages[field] = url;

      // Update preview
      const displayUrl = await resolveImageUrl(url);
      const preview = document.getElementById(`prev${capitalize(field)}`);
      if (preview) preview.innerHTML = `<img src="${displayUrl}" alt="Önizleme">`;
      const rmBtn = document.getElementById(`rm${capitalize(field)}`);
      if (rmBtn) rmBtn.style.display = 'inline-flex';

      showToast('Görsel yüklendi!');
    } catch (err) {
      showToast(err.message || 'Yükleme hatası!', 'error');
    }
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async function removeFieldImage(field) {
    const w = Store.getWebsite();
    let currentUrl = '';

    // Determine current URL based on field
    switch (field) {
      case 'testimonialImage': currentUrl = w.testimonialImage; break;
      case 'collabImage': currentUrl = w.collaboration?.image; break;
      case 'aboutImage1': currentUrl = w.about?.image1; break;
      case 'aboutImage2': currentUrl = w.about?.image2; break;
      case 'mapImage': currentUrl = w.mapImage; break;
    }

    // Delete from storage
    if (currentUrl) await ImageStorage.delete(currentUrl);
    if (fieldImages[field]) await ImageStorage.delete(fieldImages[field]);

    fieldImages[field] = '';

    // Update store
    switch (field) {
      case 'testimonialImage': Store.updateWebsite({ testimonialImage: '' }); break;
      case 'collabImage': Store.updateCollaboration({ image: '' }); break;
      case 'aboutImage1': Store.updateAbout({ image1: '' }); break;
      case 'aboutImage2': Store.updateAbout({ image2: '' }); break;
      case 'mapImage': Store.updateWebsite({ mapImage: '' }); break;
    }

    // Clear preview
    const preview = document.getElementById(`prev${capitalize(field)}`);
    if (preview) preview.innerHTML = '';
    const rmBtn = document.getElementById(`rm${capitalize(field)}`);
    if (rmBtn) rmBtn.style.display = 'none';

    showToast('Görsel kaldırıldı!');
  }

  // ══════════════════════════════════════
  //  DASHBOARD
  // ══════════════════════════════════════
  function renderDashboard() {
    const products = Store.getProducts();
    const activeProducts = products.filter(p => p.is_active);
    const categories = Store.getCategories();
    const w = Store.getWebsite();
    const storageMode = ImageStorage.mode === 'supabase' ? '☁️ Supabase' : '💾 Lokal';

    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card glass-card-strong">
        <div class="stat-icon">📦</div>
        <div class="stat-value">${products.length}</div>
        <div class="stat-label">Menü Ürünleri</div>
      </div>
      <div class="stat-card glass-card-strong">
        <div class="stat-icon">✅</div>
        <div class="stat-value">${activeProducts.length}</div>
        <div class="stat-label">Aktif Ürün</div>
      </div>
      <div class="stat-card glass-card-strong">
        <div class="stat-icon">📁</div>
        <div class="stat-value">${categories.length}</div>
        <div class="stat-label">Kategori</div>
      </div>
      <div class="stat-card glass-card-strong">
        <div class="stat-icon">${ImageStorage.mode === 'supabase' ? '☁️' : '💾'}</div>
        <div class="stat-value">${storageMode}</div>
        <div class="stat-label">Görsel Depolama</div>
      </div>
    `;
  }

  // ══════════════════════════════════════
  //  WEBSITE CONTENT
  // ══════════════════════════════════════
  async function loadWebsiteContent() {
    const w = Store.getWebsite();
    const s = Store.getSettings();

    // Hero
    document.getElementById('wsHeroTitle').value = w.heroTitle || '';

    // Sections
    await renderWebsiteSections(w);

    // Services
    await renderWebsiteServices(w);

    // Testimonials
    await showImagePreview('prevTestimonialImage', w.testimonialImage, 'rmTestimonialImage');
    renderTestimonials(w);

    // Collaboration
    document.getElementById('wsCollabTitle').value = w.collaboration?.title || '';
    await showImagePreview('prevCollabImage', w.collaboration?.image, 'rmCollabImage');

    // About
    document.getElementById('wsAboutText').value = w.about?.text || '';
    await showImagePreview('prevAboutImage1', w.about?.image1, 'rmAboutImage1');
    await showImagePreview('prevAboutImage2', w.about?.image2, 'rmAboutImage2');
    document.getElementById('wsChefTitle').value = w.about?.chefTitle || '';
    document.getElementById('wsChefText').value = w.about?.chefText || '';

    // Catering
    document.getElementById('wsCateringTitle').value = w.catering?.title || '';
    document.getElementById('wsCateringSubtitle').value = w.catering?.subtitle || '';
    await renderCateringGallery(w.catering?.galleryImages || []);

    // Map
    await showImagePreview('prevMapImage', w.mapImage, 'rmMapImage');
    document.getElementById('wsMapEmbed').value = s.mapEmbed || '';

    // Bind inline upload events
    bindInlineUploads();
    bindGalleryUpload();
  }

  function bindInlineUploads() {
    document.querySelectorAll('.inline-upload-input').forEach(input => {
      // Remove old listeners by cloning
      const newInput = input.cloneNode(true);
      input.parentNode.replaceChild(newInput, input);

      newInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const field = newInput.dataset.field;
        const folder = newInput.dataset.folder || 'website';
        await handleFieldUpload(file, field, folder);
        e.target.value = '';
      });
    });
  }

  function bindGalleryUpload() {
    const input = document.getElementById('cateringGalleryInput');
    if (!input) return;
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);

    newInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      showToast(`${files.length} görsel yükleniyor...`, 'info');
      const w = Store.getWebsite();
      const gallery = [...(w.catering?.galleryImages || [])];

      for (const file of files) {
        try {
          const url = await ImageStorage.upload(file, 'website/catering');
          gallery.push(url);
        } catch (err) {
          showToast(`Yükleme hatası: ${err.message}`, 'error');
        }
      }

      Store.updateCatering({ galleryImages: gallery });
      await renderCateringGallery(gallery);
      showToast('Görseller yüklendi!');
      e.target.value = '';
    });
  }

  async function renderCateringGallery(images) {
    const grid = document.getElementById('cateringGalleryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 0; i < images.length; i++) {
      const url = images[i];
      const displayUrl = await resolveImageUrl(url);
      const item = document.createElement('div');
      item.className = 'gallery-upload-item';
      item.innerHTML = `
        <img src="${displayUrl}" alt="Galeri ${i + 1}" onerror="this.style.display='none'">
        <button class="gallery-remove" data-index="${i}" title="Kaldır">✕</button>
      `;
      item.querySelector('.gallery-remove').addEventListener('click', async () => {
        await removeCateringGalleryImage(i);
      });
      grid.appendChild(item);
    }
  }

  async function removeCateringGalleryImage(index) {
    const w = Store.getWebsite();
    const gallery = [...(w.catering?.galleryImages || [])];
    const removed = gallery.splice(index, 1)[0];

    if (removed) await ImageStorage.delete(removed);
    Store.updateCatering({ galleryImages: gallery });
    await renderCateringGallery(gallery);
    showToast('Görsel kaldırıldı!');
  }

  async function renderWebsiteSections(w) {
    const container = document.getElementById('wsSections');
    const sections = (w.sections || []).sort((a, b) => a.sort_order - b.sort_order);
    let html = '';

    for (const sec of sections) {
      const imgUrl = await resolveImageUrl(sec.image);
      const imgPreview = imgUrl ? `<img src="${imgUrl}" alt="${sec.title}">` : '';

      html += `
        <div class="category-card glass-card mb-3" data-id="${sec.id}">
          <div style="flex:1">
            <div class="form-group mb-2">
              <label class="form-label">Başlık</label>
              <input type="text" class="ws-sec-title" value="${sec.title || ''}" data-id="${sec.id}">
            </div>
            <div class="form-group mb-2">
              <label class="form-label">Metin</label>
              <textarea class="ws-sec-text" rows="2" data-id="${sec.id}">${sec.text || ''}</textarea>
            </div>
            <div class="form-group mb-2">
              <label class="form-label">Görsel</label>
              <div class="ws-img-upload">
                <div class="ws-img-preview" id="secImg_${sec.id}">${imgPreview}</div>
                <label class="btn btn-sm btn-secondary" style="cursor:pointer">
                  <span>📸</span>
                  <input type="file" accept="image/*" class="ws-sec-img-input" data-id="${sec.id}" hidden>
                </label>
                <button class="btn btn-sm btn-danger" onclick="AdminApp.removeSectionImage('${sec.id}')" ${imgUrl ? '' : 'style="display:none"'} id="rmSecImg_${sec.id}">🗑️</button>
              </div>
            </div>
          </div>
          <div class="category-actions" style="flex-direction:column;gap:var(--space-2)">
            <button class="btn btn-icon btn-primary" onclick="AdminApp.saveWebsiteSection('${sec.id}')" title="Kaydet">💾</button>
            <button class="btn btn-icon btn-danger" onclick="AdminApp.deleteWebsiteSection('${sec.id}')" title="Sil">🗑️</button>
          </div>
        </div>`;
    }

    container.innerHTML = html;

    // Bind section image uploads
    container.querySelectorAll('.ws-sec-img-input').forEach(input => {
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const id = input.dataset.id;
        try {
          showToast('Yükleniyor...', 'info');
          const url = await ImageStorage.upload(file, 'website/sections');
          // Delete old image
          const sec = (Store.getWebsite().sections || []).find(s => s.id === id);
          if (sec?.image) await ImageStorage.delete(sec.image);
          Store.updateWebsiteSection(id, { image: url });
          const displayUrl = await resolveImageUrl(url);
          const preview = document.getElementById(`secImg_${id}`);
          if (preview) preview.innerHTML = `<img src="${displayUrl}" alt="">`;
          const rmBtn = document.getElementById(`rmSecImg_${id}`);
          if (rmBtn) rmBtn.style.display = 'inline-flex';
          showToast('Görsel yüklendi!');
        } catch (err) { showToast(err.message, 'error'); }
        e.target.value = '';
      });
    });
  }

  async function removeSectionImage(secId) {
    const sec = (Store.getWebsite().sections || []).find(s => s.id === secId);
    if (sec?.image) await ImageStorage.delete(sec.image);
    Store.updateWebsiteSection(secId, { image: '' });
    const preview = document.getElementById(`secImg_${secId}`);
    if (preview) preview.innerHTML = '';
    const rmBtn = document.getElementById(`rmSecImg_${secId}`);
    if (rmBtn) rmBtn.style.display = 'none';
    showToast('Görsel kaldırıldı!');
  }

  async function renderWebsiteServices(w) {
    const container = document.getElementById('wsServices');
    const services = (w.services || []).sort((a, b) => a.sort_order - b.sort_order);
    let html = '';

    for (const srv of services) {
      const imgUrl = await resolveImageUrl(srv.image);
      const imgPreview = imgUrl ? `<img src="${imgUrl}" alt="${srv.title}">` : '';

      html += `
        <div class="category-card glass-card mb-3" data-id="${srv.id}">
          <div style="flex:1">
            <div class="form-group mb-2">
              <label class="form-label">Başlık</label>
              <input type="text" class="ws-srv-title" value="${srv.title || ''}" data-id="${srv.id}">
            </div>
            <div class="form-group mb-2">
              <label class="form-label">Görsel</label>
              <div class="ws-img-upload">
                <div class="ws-img-preview" id="srvImg_${srv.id}">${imgPreview}</div>
                <label class="btn btn-sm btn-secondary" style="cursor:pointer">
                  <span>📸</span>
                  <input type="file" accept="image/*" class="ws-srv-img-input" data-id="${srv.id}" hidden>
                </label>
                <button class="btn btn-sm btn-danger" onclick="AdminApp.removeServiceImage('${srv.id}')" ${imgUrl ? '' : 'style="display:none"'} id="rmSrvImg_${srv.id}">🗑️</button>
              </div>
            </div>
          </div>
          <div class="category-actions" style="flex-direction:column;gap:var(--space-2)">
            <button class="btn btn-icon btn-primary" onclick="AdminApp.saveWebsiteService('${srv.id}')" title="Kaydet">💾</button>
            <button class="btn btn-icon btn-danger" onclick="AdminApp.deleteWebsiteService('${srv.id}')" title="Sil">🗑️</button>
          </div>
        </div>`;
    }

    container.innerHTML = html;

    // Bind service image uploads
    container.querySelectorAll('.ws-srv-img-input').forEach(input => {
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const id = input.dataset.id;
        try {
          showToast('Yükleniyor...', 'info');
          const url = await ImageStorage.upload(file, 'website/services');
          const srv = (Store.getWebsite().services || []).find(s => s.id === id);
          if (srv?.image) await ImageStorage.delete(srv.image);
          Store.updateService(id, { image: url });
          const displayUrl = await resolveImageUrl(url);
          const preview = document.getElementById(`srvImg_${id}`);
          if (preview) preview.innerHTML = `<img src="${displayUrl}" alt="">`;
          const rmBtn = document.getElementById(`rmSrvImg_${id}`);
          if (rmBtn) rmBtn.style.display = 'inline-flex';
          showToast('Görsel yüklendi!');
        } catch (err) { showToast(err.message, 'error'); }
        e.target.value = '';
      });
    });
  }

  async function removeServiceImage(srvId) {
    const srv = (Store.getWebsite().services || []).find(s => s.id === srvId);
    if (srv?.image) await ImageStorage.delete(srv.image);
    Store.updateService(srvId, { image: '' });
    const preview = document.getElementById(`srvImg_${srvId}`);
    if (preview) preview.innerHTML = '';
    const rmBtn = document.getElementById(`rmSrvImg_${srvId}`);
    if (rmBtn) rmBtn.style.display = 'none';
    showToast('Görsel kaldırıldı!');
  }

  function renderTestimonials(w) {
    const container = document.getElementById('wsTestimonials');
    const testimonials = w.testimonials || [];
    container.innerHTML = testimonials.map(t => `
      <div class="category-card glass-card mb-3" data-id="${t.id}">
        <div style="flex:1">
          <div class="form-group mb-2">
            <label class="form-label">Yorum</label>
            <textarea class="ws-test-text" rows="2" data-id="${t.id}">${t.text || ''}</textarea>
          </div>
        </div>
        <div class="category-actions" style="flex-direction:column;gap:var(--space-2)">
          <button class="btn btn-icon btn-primary" onclick="AdminApp.saveTestimonial('${t.id}')" title="Kaydet">💾</button>
          <button class="btn btn-icon btn-danger" onclick="AdminApp.deleteTestimonial('${t.id}')" title="Sil">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  // Website save functions
  function saveWebsiteHero() {
    Store.updateWebsite({ heroTitle: document.getElementById('wsHeroTitle').value.trim() });
    showToast('Hero başlık kaydedildi!');
  }

  async function saveWebsiteSection(id) {
    const card = document.querySelector(`.ws-sec-title[data-id="${id}"]`).closest('.category-card');
    Store.updateWebsiteSection(id, {
      title: card.querySelector('.ws-sec-title').value.trim(),
      text: card.querySelector('.ws-sec-text').value.trim()
    });
    showToast('Bölüm kaydedildi!');
  }

  function addWebsiteSection() {
    Store.addWebsiteSection({ title: 'Yeni Bölüm', text: '', image: '' });
    loadWebsiteContent();
    showToast('Yeni bölüm eklendi!');
  }

  function deleteWebsiteSection(id) {
    showConfirm('Bölüm Silme', 'Bu bölümü silmek istediğinize emin misiniz?', async () => {
      const sec = (Store.getWebsite().sections || []).find(s => s.id === id);
      if (sec?.image) await ImageStorage.delete(sec.image);
      Store.deleteWebsiteSection(id);
      loadWebsiteContent();
      showToast('Bölüm silindi!');
    });
  }

  async function saveWebsiteService(id) {
    const card = document.querySelector(`.ws-srv-title[data-id="${id}"]`).closest('.category-card');
    Store.updateService(id, {
      title: card.querySelector('.ws-srv-title').value.trim()
    });
    showToast('Hizmet kaydedildi!');
  }

  function addWebsiteService() {
    Store.addService({ title: 'Yeni Hizmet', image: '' });
    loadWebsiteContent();
    showToast('Yeni hizmet eklendi!');
  }

  function deleteWebsiteService(id) {
    showConfirm('Hizmet Silme', 'Bu hizmeti silmek istediğinize emin misiniz?', async () => {
      const srv = (Store.getWebsite().services || []).find(s => s.id === id);
      if (srv?.image) await ImageStorage.delete(srv.image);
      Store.deleteService(id);
      loadWebsiteContent();
      showToast('Hizmet silindi!');
    });
  }

  function saveTestimonialFn(id) {
    const textarea = document.querySelector(`.ws-test-text[data-id="${id}"]`);
    Store.updateTestimonial(id, { text: textarea.value.trim() });
    showToast('Yorum kaydedildi!');
  }

  function addTestimonialFn() {
    Store.addTestimonial({ text: 'Yeni müşteri yorumu...' });
    loadWebsiteContent();
    showToast('Yeni yorum eklendi!');
  }

  function deleteTestimonialFn(id) {
    showConfirm('Yorum Silme', 'Bu yorumu silmek istediğinize emin misiniz?', () => {
      Store.deleteTestimonial(id);
      loadWebsiteContent();
      showToast('Yorum silindi!');
    });
  }

  async function saveCollaboration() {
    const updates = { title: document.getElementById('wsCollabTitle').value.trim() };
    if (fieldImages.collabImage !== undefined) {
      updates.image = fieldImages.collabImage;
    }
    Store.updateCollaboration(updates);

    // Save testimonial image
    if (fieldImages.testimonialImage !== undefined) {
      Store.updateWebsite({ testimonialImage: fieldImages.testimonialImage });
    }
    showToast('İş birliği bölümü kaydedildi!');
  }

  async function saveAbout() {
    const aboutUpdates = {
      text: document.getElementById('wsAboutText').value.trim(),
      chefTitle: document.getElementById('wsChefTitle').value.trim(),
      chefText: document.getElementById('wsChefText').value.trim()
    };
    if (fieldImages.aboutImage1 !== undefined) aboutUpdates.image1 = fieldImages.aboutImage1;
    if (fieldImages.aboutImage2 !== undefined) aboutUpdates.image2 = fieldImages.aboutImage2;
    Store.updateAbout(aboutUpdates);
    showToast('Hakkımızda sayfası kaydedildi!');
  }

  function saveCatering() {
    Store.updateCatering({
      title: document.getElementById('wsCateringTitle').value.trim(),
      subtitle: document.getElementById('wsCateringSubtitle').value.trim()
    });
    showToast('Catering sayfası kaydedildi!');
  }

  async function saveMap() {
    if (fieldImages.mapImage !== undefined) {
      Store.updateWebsite({ mapImage: fieldImages.mapImage });
    }
    Store.updateSettings({ mapEmbed: document.getElementById('wsMapEmbed').value.trim() });
    showToast('Harita ayarları kaydedildi!');
  }

  // ══════════════════════════════════════
  //  MENU HERO BACKGROUND
  // ══════════════════════════════════════
  async function loadMenuHeroSettings() {
    const w = Store.getWebsite();
    const hero = w.menuHero || { bgType: 'gradient', bgImage: '', bgVideo: '', overlayOpacity: 0.6 };

    // Set type
    const typeSelect = document.getElementById('menuHeroBgType');
    typeSelect.value = hero.bgType || 'gradient';
    toggleMenuHeroFields(hero.bgType);

    // Overlay
    const overlaySlider = document.getElementById('menuHeroOverlay');
    const overlayVal = document.getElementById('menuHeroOverlayVal');
    overlaySlider.value = Math.round((hero.overlayOpacity || 0.6) * 100);
    overlayVal.textContent = overlaySlider.value + '%';

    // Preview image
    if (hero.bgImage) {
      await showImagePreview('prevMenuHeroBg', hero.bgImage, 'rmMenuHeroBg');
    }

    // Preview video
    if (hero.bgVideo) {
      const videoUrl = await resolveImageUrl(hero.bgVideo);
      const prevVideo = document.getElementById('prevMenuHeroVideo');
      if (prevVideo && videoUrl) {
        prevVideo.innerHTML = `<video src="${videoUrl}" style="max-width:100%;max-height:150px;border-radius:8px" muted autoplay loop playsinline></video>`;
        document.getElementById('rmMenuHeroVideo').style.display = 'inline-flex';
      }
    }

    // Bind events
    typeSelect.addEventListener('change', () => toggleMenuHeroFields(typeSelect.value));
    overlaySlider.addEventListener('input', () => {
      overlayVal.textContent = overlaySlider.value + '%';
    });

    // Image upload
    const imgInput = document.getElementById('menuHeroBgInput');
    if (imgInput) {
      const newInput = imgInput.cloneNode(true);
      imgInput.parentNode.replaceChild(newInput, imgInput);
      newInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          showToast('Yükleniyor...', 'info');
          const url = await ImageStorage.upload(file, 'menu/hero');
          fieldImages.menuHeroBg = url;
          const displayUrl = await resolveImageUrl(url);
          document.getElementById('prevMenuHeroBg').innerHTML = `<img src="${displayUrl}" alt="Arka plan">`;
          document.getElementById('rmMenuHeroBg').style.display = 'inline-flex';
          showToast('Görsel yüklendi!');
        } catch (err) { showToast(err.message, 'error'); }
        e.target.value = '';
      });
    }

    // Video upload
    const vidInput = document.getElementById('menuHeroVideoInput');
    if (vidInput) {
      const newVidInput = vidInput.cloneNode(true);
      vidInput.parentNode.replaceChild(newVidInput, vidInput);
      newVidInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) { showToast('Video 50MB\'dan küçük olmalı!', 'error'); return; }
        try {
          showToast('Video yükleniyor...', 'info');
          const url = await ImageStorage.upload(file, 'menu/hero');
          fieldImages.menuHeroVideo = url;
          const displayUrl = await resolveImageUrl(url);
          document.getElementById('prevMenuHeroVideo').innerHTML = `<video src="${displayUrl}" style="max-width:100%;max-height:150px;border-radius:8px" muted autoplay loop playsinline></video>`;
          document.getElementById('rmMenuHeroVideo').style.display = 'inline-flex';
          showToast('Video yüklendi!');
        } catch (err) { showToast(err.message, 'error'); }
        e.target.value = '';
      });
    }
  }

  function toggleMenuHeroFields(type) {
    const imgGroup = document.getElementById('menuHeroImageGroup');
    const vidGroup = document.getElementById('menuHeroVideoGroup');
    imgGroup.style.display = type === 'image' ? '' : 'none';
    vidGroup.style.display = type === 'video' ? '' : 'none';
  }

  async function saveMenuHero() {
    const bgType = document.getElementById('menuHeroBgType').value;
    const overlayOpacity = parseInt(document.getElementById('menuHeroOverlay').value) / 100;
    const w = Store.getWebsite();
    const current = w.menuHero || {};

    const updates = {
      bgType,
      overlayOpacity,
      bgImage: fieldImages.menuHeroBg !== undefined ? fieldImages.menuHeroBg : (current.bgImage || ''),
      bgVideo: fieldImages.menuHeroVideo !== undefined ? fieldImages.menuHeroVideo : (current.bgVideo || '')
    };

    Store.updateWebsite({ menuHero: updates });
    showToast('Menü arka planı kaydedildi!');
  }

  async function removeMenuHeroBg() {
    const w = Store.getWebsite();
    if (w.menuHero?.bgImage) await ImageStorage.delete(w.menuHero.bgImage);
    if (fieldImages.menuHeroBg) await ImageStorage.delete(fieldImages.menuHeroBg);
    fieldImages.menuHeroBg = '';
    document.getElementById('prevMenuHeroBg').innerHTML = '';
    document.getElementById('rmMenuHeroBg').style.display = 'none';
    Store.updateWebsite({ menuHero: { ...w.menuHero, bgImage: '' } });
    showToast('Arka plan görseli kaldırıldı!');
  }

  async function removeMenuHeroVideo() {
    const w = Store.getWebsite();
    if (w.menuHero?.bgVideo) await ImageStorage.delete(w.menuHero.bgVideo);
    if (fieldImages.menuHeroVideo) await ImageStorage.delete(fieldImages.menuHeroVideo);
    fieldImages.menuHeroVideo = '';
    document.getElementById('prevMenuHeroVideo').innerHTML = '';
    document.getElementById('rmMenuHeroVideo').style.display = 'none';
    Store.updateWebsite({ menuHero: { ...w.menuHero, bgVideo: '' } });
    showToast('Arka plan videosu kaldırıldı!');
  }

  // ══════════════════════════════════════
  //  PRODUCTS
  // ══════════════════════════════════════
  function renderProductList() {
    const products = Store.getProducts();
    const categories = Store.getCategories();
    const grid = document.getElementById('adminProductGrid');

    if (products.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state-emoji">📦</div><p class="empty-state-text">Henüz ürün eklenmemiş</p></div>`;
      return;
    }

    // Render product cards (resolve images async)
    grid.innerHTML = '';
    products.forEach(async (p) => {
      const cat = categories.find(c => c.id === p.category_id);
      const catName = cat ? `${cat.emoji} ${cat.name_tr}` : 'Kategorisiz';
      const firstPrice = p.prices && p.prices.length > 0 ? `${p.prices[0].price}₺` : '-';

      let imgHTML;
      if (p.image_url) {
        const displayUrl = await resolveImageUrl(p.image_url);
        imgHTML = `<img src="${displayUrl}" alt="${p.name_tr}" class="admin-product-img">`;
      } else {
        imgHTML = `<div class="admin-product-img-placeholder">${cat ? cat.emoji : '🍨'}</div>`;
      }

      const statusBadges = [];
      if (!p.is_active) statusBadges.push('<span class="badge badge-sold-out">Pasif</span>');
      if (p.is_sold_out) statusBadges.push('<span class="badge badge-sold-out">Tükendi</span>');
      if (p.tags?.includes('new')) statusBadges.push('<span class="badge badge-new">🔥 Yeni</span>');
      if (p.tags?.includes('vegan')) statusBadges.push('<span class="badge badge-vegan">🌱 Vegan</span>');

      const card = document.createElement('div');
      card.className = 'admin-product-card glass-card';
      card.innerHTML = `
        ${imgHTML}
        <div class="admin-product-info">
          <div class="admin-product-name">${p.name_tr}</div>
          <div class="admin-product-category">${catName}</div>
          <div class="admin-product-price">${firstPrice}${p.prices?.length > 1 ? ` (+${p.prices.length - 1})` : ''}</div>
          <div class="admin-product-status">${statusBadges.join('')}</div>
        </div>
        <div class="admin-product-actions">
          <button class="btn btn-icon btn-secondary" onclick="AdminApp.editProduct('${p.id}')" title="Düzenle">✏️</button>
          <button class="btn btn-icon btn-danger" onclick="AdminApp.deleteProduct('${p.id}')" title="Sil">🗑️</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  async function openProductForm(productId) {
    editingProductId = productId;
    const product = productId ? Store.getProduct(productId) : null;
    const categories = Store.getCategories();
    const title = product ? 'Ürün Düzenle' : 'Yeni Ürün Ekle';

    const catOptions = categories.map(c =>
      `<option value="${c.id}" ${product && product.category_id === c.id ? 'selected' : ''}>${c.emoji} ${c.name_tr}</option>`
    ).join('');

    const pricesHTML = (product?.prices || [{ size_tr: '', size_en: '', price: '' }]).map((p, i) => `
      <div class="price-row" data-index="${i}">
        <input type="text" placeholder="Boyut (TR)" value="${p.size_tr || ''}" class="price-size-tr">
        <input type="text" placeholder="Boyut (EN)" value="${p.size_en || ''}" class="price-size-en">
        <input type="number" placeholder="₺" value="${p.price || ''}" class="price-value" min="0" step="1">
        <button type="button" class="remove-price-btn" onclick="AdminApp.removePriceRow(this)">✕</button>
      </div>
    `).join('');

    const tags = product?.tags || [];

    let imagePreview;
    if (product?.image_url) {
      const displayUrl = await resolveImageUrl(product.image_url);
      imagePreview = `<img src="${displayUrl}" class="upload-preview" id="imagePreview"><div class="upload-actions"><button type="button" class="btn btn-sm btn-danger" onclick="AdminApp.removeImage()">🗑️</button></div>`;
    } else {
      imagePreview = `<div class="upload-placeholder" id="uploadPlaceholder"><div class="upload-icon">📸</div><div class="upload-text">Sürükle & bırak veya tıkla</div><div class="upload-hint">JPG, PNG, WebP — Max 10MB</div></div>`;
    }

    const html = `
      <form id="productForm" onsubmit="AdminApp.saveProduct(event)">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Ürün Adı (TR) *</label><input type="text" id="pNameTr" value="${product?.name_tr || ''}" required></div>
          <div class="form-group"><label class="form-label">Ürün Adı (EN)</label><input type="text" id="pNameEn" value="${product?.name_en || ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Açıklama (TR)</label><textarea id="pDescTr" rows="2">${product?.description_tr || ''}</textarea></div>
          <div class="form-group"><label class="form-label">Açıklama (EN)</label><textarea id="pDescEn" rows="2">${product?.description_en || ''}</textarea></div>
        </div>
        <div class="form-group"><label class="form-label">Kategori *</label><select id="pCategory" required><option value="">Kategori seçin</option>${catOptions}</select></div>
        <div class="form-group">
          <label class="form-label">Ürün Görseli</label>
          <div class="image-upload-area ${product?.image_url ? 'has-image' : ''}" id="imageUploadArea">${imagePreview}<input type="file" accept="image/jpeg,image/png,image/webp" id="imageInput"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Fiyatlar *</label>
          <div class="price-rows" id="priceRows">${pricesHTML}</div>
          <button type="button" class="btn btn-sm btn-secondary mt-2" onclick="AdminApp.addPriceRow()">➕ Fiyat Ekle</button>
        </div>
        <div class="form-group">
          <label class="form-label">Etiketler</label>
          <div class="tags-grid">
            <label class="tag-checkbox ${tags.includes('vegan') ? 'checked' : ''}"><input type="checkbox" value="vegan" ${tags.includes('vegan') ? 'checked' : ''}> 🌱 Vegan</label>
            <label class="tag-checkbox ${tags.includes('lactose_free') ? 'checked' : ''}"><input type="checkbox" value="lactose_free" ${tags.includes('lactose_free') ? 'checked' : ''}> 🥛 Laktozsuz</label>
            <label class="tag-checkbox ${tags.includes('new') ? 'checked' : ''}"><input type="checkbox" value="new" ${tags.includes('new') ? 'checked' : ''}> 🔥 Yeni</label>
            <label class="tag-checkbox ${tags.includes('special') ? 'checked' : ''}"><input type="checkbox" value="special" ${tags.includes('special') ? 'checked' : ''}> ⭐ Özel</label>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><div class="toggle-row"><span class="toggle-label">Aktif</span><label class="toggle"><input type="checkbox" id="pActive" ${product ? (product.is_active ? 'checked' : '') : 'checked'}><span class="toggle-slider"></span></label></div></div>
          <div class="form-group"><div class="toggle-row"><span class="toggle-label">Tükendi</span><label class="toggle"><input type="checkbox" id="pSoldOut" ${product?.is_sold_out ? 'checked' : ''}><span class="toggle-slider"></span></label></div></div>
        </div>
        <div class="form-group"><label class="form-label">Sıralama</label><input type="number" id="pSortOrder" value="${product?.sort_order || 1}" min="1"></div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="AdminApp.closeForm()">İptal</button>
          <button type="submit" class="btn btn-primary">💾 Kaydet</button>
        </div>
      </form>
    `;

    openFormModal(title, html);
    setupImageUpload();
    setupTagCheckboxes();
  }

  function setupImageUpload() {
    const area = document.getElementById('imageUploadArea');
    const input = document.getElementById('imageInput');
    if (!area || !input) return;
    area.addEventListener('click', (e) => { if (!e.target.closest('.btn')) input.click(); });
    area.addEventListener('dragover', (e) => { e.preventDefault(); area.style.borderColor = 'var(--accent-green)'; });
    area.addEventListener('dragleave', () => { area.style.borderColor = ''; });
    area.addEventListener('drop', (e) => { e.preventDefault(); area.style.borderColor = ''; if (e.dataTransfer.files[0]) handleProductImage(e.dataTransfer.files[0]); });
    input.addEventListener('change', (e) => { if (e.target.files[0]) handleProductImage(e.target.files[0]); });
  }

  async function handleProductImage(file) {
    try {
      showToast('Yükleniyor...', 'info');
      const url = await ImageStorage.upload(file, 'products');
      const displayUrl = await resolveImageUrl(url);

      const area = document.getElementById('imageUploadArea');
      area.classList.add('has-image');
      area.dataset.imageUrl = url; // Store the reference
      area.innerHTML = `<img src="${displayUrl}" class="upload-preview" id="imagePreview"><div class="upload-actions"><button type="button" class="btn btn-sm btn-danger" onclick="AdminApp.removeImage()">🗑️</button></div><input type="file" accept="image/jpeg,image/png,image/webp" id="imageInput">`;
      setupImageUpload();
      showToast('Görsel yüklendi!');
    } catch (err) {
      showToast(err.message || 'Yükleme hatası!', 'error');
    }
  }

  function removeImage() {
    const area = document.getElementById('imageUploadArea');
    area.classList.remove('has-image');
    area.dataset.imageUrl = '';
    area.innerHTML = `<div class="upload-placeholder"><div class="upload-icon">📸</div><div class="upload-text">Sürükle & bırak veya tıkla</div><div class="upload-hint">JPG, PNG, WebP — Max 10MB</div></div><input type="file" accept="image/jpeg,image/png,image/webp" id="imageInput">`;
    setupImageUpload();
  }

  function setupTagCheckboxes() {
    document.querySelectorAll('.tag-checkbox input').forEach(cb => {
      cb.addEventListener('change', function () { this.closest('.tag-checkbox').classList.toggle('checked', this.checked); });
    });
  }

  function addPriceRow() {
    const rows = document.getElementById('priceRows');
    const div = document.createElement('div');
    div.className = 'price-row';
    div.innerHTML = `<input type="text" placeholder="Boyut (TR)" class="price-size-tr"><input type="text" placeholder="Boyut (EN)" class="price-size-en"><input type="number" placeholder="₺" class="price-value" min="0" step="1"><button type="button" class="remove-price-btn" onclick="AdminApp.removePriceRow(this)">✕</button>`;
    rows.appendChild(div);
  }

  function removePriceRow(btn) {
    const rows = document.getElementById('priceRows');
    if (rows.children.length > 1) btn.closest('.price-row').remove();
    else showToast('En az bir fiyat olmalıdır.', 'error');
  }

  async function saveProduct(e) {
    e.preventDefault();
    const nameTr = document.getElementById('pNameTr').value.trim();
    const categoryId = document.getElementById('pCategory').value;
    if (!nameTr || !categoryId) { showToast('Zorunlu alanları doldurun.', 'error'); return; }

    const prices = [];
    document.querySelectorAll('#priceRows .price-row').forEach(row => {
      const sizeTr = row.querySelector('.price-size-tr').value.trim();
      const price = parseFloat(row.querySelector('.price-value').value) || 0;
      if (sizeTr && price > 0) prices.push({ size_tr: sizeTr, size_en: row.querySelector('.price-size-en').value.trim(), price });
    });
    if (prices.length === 0) { showToast('En az bir fiyat girin.', 'error'); return; }

    const tags = [];
    document.querySelectorAll('.tag-checkbox input:checked').forEach(cb => tags.push(cb.value));

    // Get image URL from upload area
    const area = document.getElementById('imageUploadArea');
    let imageUrl = area.dataset.imageUrl || '';

    // If no new upload but editing, keep old image
    if (!imageUrl && editingProductId) {
      const existingProduct = Store.getProduct(editingProductId);
      imageUrl = existingProduct?.image_url || '';
    }

    const productData = {
      name_tr: nameTr, name_en: document.getElementById('pNameEn').value.trim() || nameTr,
      description_tr: document.getElementById('pDescTr').value.trim(), description_en: document.getElementById('pDescEn').value.trim(),
      category_id: categoryId, image_url: imageUrl, prices, tags,
      is_active: document.getElementById('pActive').checked, is_sold_out: document.getElementById('pSoldOut').checked,
      sort_order: parseInt(document.getElementById('pSortOrder').value) || 1
    };

    if (editingProductId) { Store.updateProduct(editingProductId, productData); showToast('Ürün güncellendi!'); }
    else { Store.addProduct(productData); showToast('Ürün eklendi!'); }

    closeFormModal();
    renderProductList();
    renderDashboard();
    loadRecipeProductSelect();
  }

  function deleteProduct(id) {
    const p = Store.getProduct(id);
    showConfirm('Ürün Silme', `"${p?.name_tr}" ürününü silmek istediğinize emin misiniz?`, async () => {
      if (p?.image_url) await ImageStorage.delete(p.image_url);
      Store.deleteProduct(id); showToast('Ürün silindi!'); renderProductList(); renderDashboard(); loadRecipeProductSelect();
    });
  }

  // ══════════════════════════════════════
  //  CATEGORIES
  // ══════════════════════════════════════
  function renderCategoryList() {
    const categories = Store.getCategories();
    const products = Store.getProducts();
    const list = document.getElementById('categoryList');
    if (categories.length === 0) { list.innerHTML = `<div class="empty-state"><div class="empty-state-emoji">📁</div><p class="empty-state-text">Henüz kategori eklenmemiş</p></div>`; return; }

    list.innerHTML = categories.map(cat => {
      const count = products.filter(p => p.category_id === cat.id).length;
      return `<div class="category-card glass-card"><div class="category-emoji">${cat.emoji}</div><div class="category-info"><div class="category-name">${cat.name_tr}</div><div class="category-name-en">${cat.name_en} · ${count} ürün</div></div><span class="badge ${cat.is_active ? 'badge-vegan' : 'badge-sold-out'}">${cat.is_active ? 'Aktif' : 'Pasif'}</span><div class="category-actions"><button class="btn btn-icon btn-secondary" onclick="AdminApp.editCategory('${cat.id}')">✏️</button><button class="btn btn-icon btn-danger" onclick="AdminApp.deleteCategory('${cat.id}')">🗑️</button></div></div>`;
    }).join('');
  }

  function openCategoryForm(categoryId) {
    editingCategoryId = categoryId;
    const cat = categoryId ? Store.getCategory(categoryId) : null;
    const html = `
      <form id="categoryForm" onsubmit="AdminApp.saveCategory(event)">
        <div class="form-row"><div class="form-group"><label class="form-label">Kategori Adı (TR) *</label><input type="text" id="cNameTr" value="${cat?.name_tr || ''}" required></div><div class="form-group"><label class="form-label">Kategori Adı (EN)</label><input type="text" id="cNameEn" value="${cat?.name_en || ''}"></div></div>
        <div class="form-row"><div class="form-group"><label class="form-label">Emoji</label><input type="text" id="cEmoji" value="${cat?.emoji || '🍨'}" maxlength="4"><div class="form-hint">Örnek: 🍨 🍰 ☕ ⭐</div></div><div class="form-group"><label class="form-label">Sıralama</label><input type="number" id="cSortOrder" value="${cat?.sort_order || Store.getCategories().length + 1}" min="1"></div></div>
        <div class="form-group"><div class="toggle-row"><span class="toggle-label">Aktif</span><label class="toggle"><input type="checkbox" id="cActive" ${cat ? (cat.is_active ? 'checked' : '') : 'checked'}><span class="toggle-slider"></span></label></div></div>
        <div class="form-actions"><button type="button" class="btn btn-secondary" onclick="AdminApp.closeForm()">İptal</button><button type="submit" class="btn btn-primary">💾 Kaydet</button></div>
      </form>`;
    openFormModal(cat ? 'Kategori Düzenle' : 'Yeni Kategori', html);
  }

  function saveCategory(e) {
    e.preventDefault();
    const nameTr = document.getElementById('cNameTr').value.trim();
    if (!nameTr) { showToast('Kategori adı gerekli.', 'error'); return; }
    const data = { name_tr: nameTr, name_en: document.getElementById('cNameEn').value.trim() || nameTr, emoji: document.getElementById('cEmoji').value || '📦', sort_order: parseInt(document.getElementById('cSortOrder').value) || 1, is_active: document.getElementById('cActive').checked };
    if (editingCategoryId) { Store.updateCategory(editingCategoryId, data); showToast('Kategori güncellendi!'); }
    else { Store.addCategory(data); showToast('Kategori eklendi!'); }
    closeFormModal(); renderCategoryList(); renderProductList(); renderDashboard();
  }

  function deleteCategory(id) {
    const cat = Store.getCategory(id);
    showConfirm('Kategori Silme', `"${cat?.name_tr}" kategorisini silmek istediğinize emin misiniz?`, () => {
      Store.deleteCategory(id); showToast('Kategori silindi!'); renderCategoryList(); renderProductList(); renderDashboard();
    });
  }

  // ══════════════════════════════════════
  //  RECIPES
  // ══════════════════════════════════════
  function loadRecipeProductSelect() {
    const select = document.getElementById('recipeProductSelect');
    const products = Store.getProducts();
    select.innerHTML = '<option value="">— Ürün seçin —</option>';
    products.forEach(p => { const opt = document.createElement('option'); opt.value = p.id; opt.textContent = p.name_tr; select.appendChild(opt); });
  }

  function renderRecipe(productId) {
    const content = document.getElementById('recipeContent');
    if (!productId) { content.innerHTML = `<div class="empty-state"><div class="empty-state-emoji">🧪</div><p class="empty-state-text">Tarif görmek için bir ürün seçin</p></div>`; return; }
    const product = Store.getProduct(productId);
    const recipe = Store.getRecipeByProduct(productId);

    if (!recipe) {
      content.innerHTML = `<div class="recipe-card glass-card-strong" style="text-align:center;padding:var(--space-10)"><p style="font-size:var(--text-3xl);margin-bottom:var(--space-4)">🧪</p><p class="text-secondary mb-4">"${product.name_tr}" için henüz tarif eklenmemiş.</p><button class="btn btn-primary" onclick="AdminApp.createRecipe('${productId}')">➕ Tarif Oluştur</button></div>`;
      return;
    }

    const ingredientRows = (recipe.ingredients || []).map((ing, i) => `
      <tr data-index="${i}">
        <td><input type="text" value="${ing.ingredient_name}" class="ing-name" placeholder="Malzeme"></td>
        <td><input type="number" value="${ing.quantity}" class="ing-qty" step="0.1" min="0" style="width:80px"></td>
        <td><select class="ing-unit unit-select">${['gr', 'kg', 'ml', 'lt', 'adet', 'yemek k.', 'tatlı k.'].map(u => `<option value="${u}" ${ing.unit === u ? 'selected' : ''}>${u}</option>`).join('')}</select></td>
        <td><input type="number" value="${ing.percentage || ''}" class="ing-pct" step="0.1" min="0" max="100" style="width:70px"></td>
        <td><input type="text" value="${ing.notes || ''}" class="ing-notes" placeholder="Not"></td>
        <td><button type="button" class="ingredient-remove" onclick="AdminApp.removeIngredientRow(this)">✕</button></td>
      </tr>
    `).join('');

    content.innerHTML = `
      <div class="recipe-card glass-card-strong">
        <div class="recipe-header"><h3 class="recipe-product-name">📋 ${product.name_tr}</h3><div style="display:flex;gap:var(--space-2)"><button class="btn btn-sm btn-secondary" onclick="AdminApp.printRecipe('${recipe.id}')">🖨️</button><button class="btn btn-sm btn-danger" onclick="AdminApp.deleteRecipe('${recipe.id}')">🗑️</button></div></div>
        <div class="form-group"><label class="form-label">Toplam Üretim Miktarı</label><input type="text" id="recipeYield" value="${recipe.yield_amount || ''}" placeholder="ör: 2000 ml"></div>
        <div class="form-group"><label class="form-label">Malzeme Listesi</label><div style="overflow-x:auto"><table class="ingredients-table"><thead><tr><th>Malzeme</th><th>Miktar</th><th>Birim</th><th>%</th><th>Not</th><th></th></tr></thead><tbody id="ingredientsTbody">${ingredientRows}</tbody></table></div><button type="button" class="btn btn-sm btn-secondary mt-2" onclick="AdminApp.addIngredientRow()">➕ Malzeme Ekle</button></div>
        <div class="total-percentage" id="totalPercentage"><span class="text-sm text-secondary">Toplam:</span><span class="total-percentage-value" id="totalPctValue">0%</span></div>
        <div class="form-group"><label class="form-label">Notlar</label><textarea id="recipeNotes" class="recipe-notes-area" placeholder="Hazırlanış notları...">${recipe.notes || ''}</textarea></div>
        <div class="form-actions"><button class="btn btn-primary" onclick="AdminApp.saveRecipe('${recipe.id}', '${productId}')">💾 Kaydet</button></div>
      </div>`;

    calcTotalPercentage();
    document.getElementById('ingredientsTbody').addEventListener('input', calcTotalPercentage);
  }

  function createRecipe(productId) { Store.addRecipe({ product_id: productId, ingredients: [{ ingredient_name: '', quantity: 0, unit: 'gr', percentage: 0 }] }); renderRecipe(productId); showToast('Tarif oluşturuldu!'); renderDashboard(); }

  function addIngredientRow() {
    const tbody = document.getElementById('ingredientsTbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="text" class="ing-name" placeholder="Malzeme"></td><td><input type="number" class="ing-qty" step="0.1" min="0" style="width:80px"></td><td><select class="ing-unit unit-select">${['gr','kg','ml','lt','adet','yemek k.','tatlı k.'].map(u=>`<option value="${u}">${u}</option>`).join('')}</select></td><td><input type="number" class="ing-pct" step="0.1" min="0" max="100" style="width:70px"></td><td><input type="text" class="ing-notes" placeholder="Not"></td><td><button type="button" class="ingredient-remove" onclick="AdminApp.removeIngredientRow(this)">✕</button></td>`;
    tbody.appendChild(tr);
  }

  function removeIngredientRow(btn) { const tbody = document.getElementById('ingredientsTbody'); if (tbody.children.length > 1) { btn.closest('tr').remove(); calcTotalPercentage(); } else showToast('En az bir malzeme olmalı.', 'error'); }

  function calcTotalPercentage() {
    let total = 0;
    document.querySelectorAll('#ingredientsTbody tr').forEach(row => { total += parseFloat(row.querySelector('.ing-pct')?.value) || 0; });
    const el = document.getElementById('totalPctValue');
    if (el) { el.textContent = `${total.toFixed(1)}%`; el.className = 'total-percentage-value ' + (Math.abs(total - 100) < 0.5 ? 'valid' : 'invalid'); }
  }

  function saveRecipe(recipeId, productId) {
    const ingredients = [];
    document.querySelectorAll('#ingredientsTbody tr').forEach((row, i) => {
      const name = row.querySelector('.ing-name').value.trim();
      if (name) ingredients.push({ ingredient_name: name, quantity: parseFloat(row.querySelector('.ing-qty').value) || 0, unit: row.querySelector('.ing-unit').value, percentage: parseFloat(row.querySelector('.ing-pct').value) || 0, sort_order: i + 1, notes: row.querySelector('.ing-notes').value.trim() });
    });
    Store.updateRecipe(recipeId, { yield_amount: document.getElementById('recipeYield').value.trim(), notes: document.getElementById('recipeNotes').value.trim(), ingredients });
    showToast('Tarif kaydedildi!');
  }

  function deleteRecipe(recipeId) {
    showConfirm('Tarif Silme', 'Bu tarifi silmek istediğinize emin misiniz?', () => {
      Store.deleteRecipe(recipeId); showToast('Tarif silindi!');
      renderRecipe(document.getElementById('recipeProductSelect').value); renderDashboard();
    });
  }

  function printRecipe(recipeId) {
    const recipe = Store.getRecipe(recipeId);
    const product = Store.getProduct(recipe?.product_id);
    if (!recipe || !product) return;
    const pw = window.open('', '_blank');
    const rows = recipe.ingredients.map(i => `<tr><td>${i.ingredient_name}</td><td>${i.quantity}</td><td>${i.unit}</td><td>${i.percentage}%</td><td>${i.notes||''}</td></tr>`).join('');
    pw.document.write(`<html><head><title>Tarif: ${product.name_tr}</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.notes{margin-top:20px;padding:15px;background:#f9f9f9;border-radius:8px}</style></head><body><h1>${product.name_tr}</h1><p>Üretim: ${recipe.yield_amount||'-'}</p><table><thead><tr><th>Malzeme</th><th>Miktar</th><th>Birim</th><th>Oran</th><th>Not</th></tr></thead><tbody>${rows}</tbody></table>${recipe.notes?`<div class="notes"><strong>Notlar:</strong><br>${recipe.notes.replace(/\n/g,'<br>')}</div>`:''}<script>window.print()<\/script></body></html>`);
  }

  // ══════════════════════════════════════
  //  SETTINGS
  // ══════════════════════════════════════
  function loadSettings() {
    const s = Store.getSettings();
    document.getElementById('settingShopName').value = s.shopName || '';
    document.getElementById('settingAddress').value = s.address || '';
    document.getElementById('settingPhone').value = s.phone || '';
    document.getElementById('settingEmail').value = s.email || '';
    document.getElementById('settingHours').value = s.hours || '';
    document.getElementById('settingInstagram').value = s.instagram || '';
  }

  function saveSettings() {
    Store.updateSettings({
      shopName: document.getElementById('settingShopName').value.trim(),
      address: document.getElementById('settingAddress').value.trim(),
      phone: document.getElementById('settingPhone').value.trim(),
      email: document.getElementById('settingEmail').value.trim(),
      hours: document.getElementById('settingHours').value.trim(),
      instagram: document.getElementById('settingInstagram').value.trim()
    });
    showToast('Ayarlar kaydedildi!');
  }

  function changePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    if (current !== Store.getSettings().adminPassword) { showToast('Mevcut şifre yanlış!', 'error'); return; }
    if (newPass.length < 4) { showToast('Min 4 karakter.', 'error'); return; }
    Store.updateSettings({ adminPassword: newPass });
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    showToast('Şifre değiştirildi!');
  }

  function exportData() {
    const blob = new Blob([Store.exportData()], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `mugi-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    showToast('Veri dışa aktarıldı!');
  }

  function importData(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (Store.importData(ev.target.result)) { showToast('Veri içe aktarıldı!'); showAdmin(); }
      else showToast('Geçersiz format!', 'error');
    };
    reader.readAsText(file); e.target.value = '';
  }

  function resetData() {
    showConfirm('Verileri Sıfırla', 'Tüm veriler silinecek! Bu işlem geri alınamaz.', () => {
      Store.resetData(); showToast('Veriler sıfırlandı!', 'info'); showAdmin();
    });
  }

  // ══════════════════════════════════════
  //  QR CODE
  // ══════════════════════════════════════
  function getMenuUrl() {
    const loc = window.location;
    return `${loc.protocol}//${loc.host}/menu.html`;
  }

  function generateQR() {
    const url = getMenuUrl();
    const urlDisplay = document.getElementById('qrUrlDisplay');
    if (urlDisplay) urlDisplay.textContent = url;

    const color = document.getElementById('qrColor').value;
    const bgColor = document.getElementById('qrBgColor').value;
    const preview = document.getElementById('qrPreview');
    preview.innerHTML = '';
    const canvas = document.createElement('canvas');
    preview.appendChild(canvas);
    if (typeof QRCode !== 'undefined') {
      QRCode.toCanvas(canvas, url, { width: 250, margin: 2, color: { dark: color, light: bgColor }, errorCorrectionLevel: 'H' }, (err) => {
        if (err) showToast('QR hatası!', 'error');
        else document.getElementById('downloadQrBtn').classList.remove('hidden');
      });
    }
  }

  function downloadQR() {
    const canvas = document.querySelector('#qrPreview canvas');
    if (!canvas) return;
    const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = 'mugi-gelato-qr.png'; a.click();
  }

  // ══════════════════════════════════════
  //  GLOBAL EVENTS
  // ══════════════════════════════════════
  function bindGlobalEvents() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);

    document.querySelectorAll('.nav-item[data-section]').forEach(item => {
      item.addEventListener('click', () => {
        switchSection(item.dataset.section);
        if (item.dataset.section === 'qr') generateQR();
      });
    });

    sidebarToggle.addEventListener('click', () => { adminSidebar.classList.toggle('open'); sidebarOverlay.classList.toggle('active'); });
    sidebarOverlay.addEventListener('click', () => { adminSidebar.classList.remove('open'); sidebarOverlay.classList.remove('active'); });

    document.getElementById('viewSiteBtn').addEventListener('click', () => window.open('index.html', '_blank'));
    document.getElementById('viewMenuBtn').addEventListener('click', () => window.open('menu.html', '_blank'));

    formModalClose.addEventListener('click', closeFormModal);
    formModal.addEventListener('click', (e) => { if (e.target === formModal) closeFormModal(); });

    document.getElementById('confirmCancel').addEventListener('click', () => { confirmOverlay.classList.remove('active'); confirmCallback = null; });
    document.getElementById('confirmYes').addEventListener('click', () => { confirmOverlay.classList.remove('active'); if (confirmCallback) { confirmCallback(); confirmCallback = null; } });

    document.getElementById('addProductBtn').addEventListener('click', () => openProductForm(null));
    document.getElementById('quickAddProduct').addEventListener('click', () => { switchSection('products'); setTimeout(() => openProductForm(null), 200); });
    document.getElementById('quickAddCategory').addEventListener('click', () => { switchSection('categories'); setTimeout(() => openCategoryForm(null), 200); });
    document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryForm(null));
    document.getElementById('recipeProductSelect').addEventListener('change', (e) => renderRecipe(e.target.value));

    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

    document.getElementById('changePasswordBtn').addEventListener('click', changePassword);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataInput').addEventListener('change', importData);
    document.getElementById('resetDataBtn').addEventListener('click', resetData);

    document.getElementById('downloadQrBtn').addEventListener('click', downloadQR);
    document.getElementById('qrColor').addEventListener('change', generateQR);
    document.getElementById('qrBgColor').addEventListener('change', generateQR);

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeFormModal(); confirmOverlay.classList.remove('active'); } });
  }

  // ── Public API ──
  window.AdminApp = {
    editProduct: openProductForm, deleteProduct, saveProduct, closeForm: closeFormModal,
    addPriceRow, removePriceRow, removeImage,
    editCategory: openCategoryForm, deleteCategory, saveCategory,
    createRecipe, saveRecipe, deleteRecipe, addIngredientRow, removeIngredientRow, printRecipe,
    // Website
    saveWebsiteHero, saveWebsiteSection, addWebsiteSection, deleteWebsiteSection,
    saveWebsiteService, addWebsiteService, deleteWebsiteService,
    removeSectionImage, removeServiceImage,
    saveTestimonial: saveTestimonialFn, addTestimonial: addTestimonialFn, deleteTestimonial: deleteTestimonialFn,
    saveCollaboration, saveAbout, saveCatering, saveMap,
    removeFieldImage,
    // Menu Hero
    saveMenuHero, removeMenuHeroBg, removeMenuHeroVideo
  };

  document.addEventListener('DOMContentLoaded', init);
})();
