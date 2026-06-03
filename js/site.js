/* ============================================
   MUGI GELATO — Main Website Application
   SPA routing + dynamic content from Store
   With ImageStorage support for local:// URLs
   ============================================ */
(function() {
  'use strict';

  // ── Init ──
  async function init() {
    Store.init();
    if (typeof ImageStorage !== 'undefined') {
      await ImageStorage.init();
    }
    await loadContent();
    setupRouting();
    setupMobileMenu();
    handleRoute();
  }

  // ── Resolve image URL (handles local:// refs) ──
  async function resolveImg(url) {
    if (!url) return '';
    if (url.startsWith('local://') && typeof ImageStorage !== 'undefined') {
      return await ImageStorage.getUrl(url);
    }
    return url;
  }

  // ── SPA Routing ──
  function setupRouting() {
    window.addEventListener('hashchange', handleRoute);
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function() {
        document.getElementById('headerNav').classList.remove('open');
      });
    });
  }

  function handleRoute() {
    const hash = location.hash.replace('#', '') || 'home';
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${hash}`);
    if (target) {
      target.classList.add('active');
    } else {
      document.getElementById('page-home').classList.add('active');
    }
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active-link', l.dataset.page === hash);
    });
    window.scrollTo(0, 0);
  }

  // ── Mobile Menu ──
  function setupMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const nav = document.getElementById('headerNav');
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });
  }

  // ── Load All Content ──
  async function loadContent() {
    const w = Store.getWebsite();
    const s = Store.getSettings();

    // Footer
    document.getElementById('footerAddress').textContent = s.address;
    document.getElementById('footerPhoneText').textContent = s.phone;
    if (s.instagram) {
      document.getElementById('footerInstagram').href = s.instagram;
    }

    await loadHomePage(w, s);
    await loadAboutPage(w);
    await loadCateringPage(w);
    loadContactPage(w, s);
  }

  // ── HOME PAGE ──
  async function loadHomePage(w, s) {
    // Hero
    document.getElementById('homeHeroTitle').textContent = w.heroTitle;

    // Sections
    const sectionsEl = document.getElementById('homeSections');
    sectionsEl.innerHTML = '';
    const sections = (w.sections || []).sort((a,b) => a.sort_order - b.sort_order);
    for (const sec of sections) {
      const imgUrl = await resolveImg(sec.image);
      const imgHTML = imgUrl ? `<img src="${imgUrl}" alt="${sec.title}" onerror="this.style.display='none'">` : '';
      sectionsEl.innerHTML += `
        <div class="main-content">
          <div class="main-text">
            <span>${sec.title}</span>
            <span class="main-subtext">${sec.text}</span>
          </div>
          <div class="main-image">
            ${imgHTML}
          </div>
        </div>
      `;
    }

    // Services
    const servicesEl = document.getElementById('homeServices');
    servicesEl.innerHTML = '';
    const services = (w.services || []).sort((a,b) => a.sort_order - b.sort_order);
    for (const srv of services) {
      const imgUrl = await resolveImg(srv.image);
      servicesEl.innerHTML += `
        <div class="service-card">
          <img src="${imgUrl}" alt="${srv.title}" onerror="this.style.background='#f0f0f0'">
          <h2>${srv.title}</h2>
        </div>
      `;
    }

    // Testimonials
    const testEl = document.getElementById('homeTestimonials');
    testEl.innerHTML = '';
    if (w.testimonials && w.testimonials.length > 0) {
      let testimonialsHTML = '';
      w.testimonials.forEach(t => {
        testimonialsHTML += `
          <p><span class="material-symbols-outlined">comment</span> ${t.text}</p>
        `;
      });
      const testImgUrl = await resolveImg(w.testimonialImage);
      const testImgHTML = testImgUrl ? `<img src="${testImgUrl}" alt="Müşteri Yorumları" onerror="this.style.display='none'">` : '';
      testEl.innerHTML = `
        <div class="testimonial-section">
          <div class="testimonial-left">
            <h2>Sizden Gelenler</h2>
            ${testimonialsHTML}
          </div>
          <div class="testimonial-right">
            ${testImgHTML}
          </div>
        </div>
      `;
    }

    // Collaboration
    const collabEl = document.getElementById('homeCollaboration');
    collabEl.innerHTML = '';
    if (w.collaboration) {
      const collabImgUrl = await resolveImg(w.collaboration.image);
      const collabImgHTML = collabImgUrl ? `<img src="${collabImgUrl}" alt="İş Birliği" onerror="this.style.display='none'">` : '';
      collabEl.innerHTML = `
        <div class="testimonial-section">
          <div class="testimonial-left-watermelon">
            <h2>${w.collaboration.title}</h2>
            <p>
              <span class="material-symbols-outlined">mail</span>
              <a href="mailto:${s.email}">${s.email}</a>
            </p>
          </div>
          <div class="testimonial-right">
            ${collabImgHTML}
          </div>
        </div>
      `;
    }

    // Map
    const mapImgUrl = await resolveImg(w.mapImage);
    const mapImgHTML = mapImgUrl ? `<img src="${mapImgUrl}" alt="Konum" style="max-height:450px" onerror="this.style.display='none'">` : '';
    const mapEl = document.getElementById('homeMap');
    mapEl.innerHTML = `
      <div class="mapContent">
        <div>${mapImgHTML}</div>
        <div>
          <iframe src="${s.mapEmbed || ''}" width="600" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
      </div>
    `;
  }

  // ── ABOUT PAGE ──
  async function loadAboutPage(w) {
    const about = w.about || {};
    const wrapper = document.getElementById('aboutWrapper');

    const img1Url = await resolveImg(about.image1);
    const img2Url = await resolveImg(about.image2);
    const img1HTML = img1Url ? `<img src="${img1Url}" alt="Mugi Gelato Hakkımızda" onerror="this.style.display='none'">` : '';
    const img2HTML = img2Url ? `<img src="${img2Url}" alt="Mugi Gelato Dondurma" onerror="this.style.display='none'">` : '';

    wrapper.innerHTML = `
      <div>${img1HTML}</div>
      <div>${about.text || ''}</div>
      <div>${img2HTML}</div>
    `;

    const chefEl = document.getElementById('aboutChef');
    chefEl.innerHTML = `
      <div class="chef-section">
        <div class="main-container">
          <h1 class="main-title">${about.chefTitle || ''}</h1>
        </div>
        <p>${about.chefText || ''}</p>
      </div>
    `;
  }

  // ── CATERING PAGE ──
  async function loadCateringPage(w) {
    const cat = w.catering || {};
    document.getElementById('cateringTitle').textContent = cat.title || '';
    document.getElementById('cateringSubtitle').textContent = cat.subtitle || '';
    document.getElementById('cateringFormSubtitle').textContent = cat.formSubtitle || '';

    // Options
    const optionsEl = document.getElementById('cateringOptions');
    optionsEl.innerHTML = '';
    (cat.options || []).forEach(opt => {
      optionsEl.innerHTML += `
        <label class="catering-option" tabindex="0">
          <input type="radio" name="event_type" value="${opt.id}" required>
          <span class="material-symbols-outlined">${opt.icon}</span>
          <div>
            <strong>${opt.title}</strong>
            <p>${opt.desc}</p>
          </div>
        </label>
      `;
    });

    // Gallery
    const galleryEl = document.getElementById('cateringGallery');
    galleryEl.innerHTML = '';
    const galleryImages = cat.galleryImages || [];
    for (let i = 0; i < galleryImages.length; i++) {
      const imgUrl = await resolveImg(galleryImages[i]);
      if (imgUrl) {
        galleryEl.innerHTML += `<img src="${imgUrl}" alt="Galeri ${i+1}" onerror="this.style.background='#f0f0f0'">`;
      }
    }

    // Form submit
    const form = document.getElementById('cateringForm');
    // Clone to remove old listeners
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    newForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const s = Store.getSettings();
      const formData = new FormData(this);
      const name = formData.get('name');
      const tel = formData.get('tel');
      const email = formData.get('email') || '';
      const message = formData.get('message');
      const eventType = formData.get('event_type') || '';
      const body = `Ad Soyad: ${name}%0ATelefon: ${tel}%0AE-posta: ${email}%0AEvent: ${eventType}%0AMesaj: ${message}`;
      const mailUrl = `mailto:${s.email}?subject=Catering Talebi - ${name}&body=${body}`;
      window.location.href = mailUrl;
      alert('Mesajınız için teşekkürler! E-posta uygulamanız açılacaktır.');
    });
  }

  // ── CONTACT PAGE ──
  function loadContactPage(w, s) {
    const infoEl = document.getElementById('contactInfo');
    infoEl.innerHTML = `
      <p><span class="material-symbols-outlined">mail</span> <a href="mailto:${s.email}">${s.email}</a></p>
      <p><span class="material-symbols-outlined">call</span> ${s.phone}</p>
    `;

    const mapEl = document.getElementById('contactMap');
    mapEl.innerHTML = `
      <iframe src="${s.mapEmbed || ''}" width="600" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    `;
  }

  // ── CSS: hide inactive pages ──
  const style = document.createElement('style');
  style.textContent = '.page-content { display: none; } .page-content.active { display: block; }';
  document.head.appendChild(style);

  document.addEventListener('DOMContentLoaded', init);
})();
