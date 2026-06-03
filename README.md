# 🍨 Mugi Gelato — QR Menü

Modern, mobil-öncelikli QR menü uygulaması ve admin paneli.

## 🚀 Başlangıç

Projeyi local'de çalıştırmak için:

```bash
npx serve .
```

Tarayıcıda açın:
- **Menü:** http://localhost:3000
- **Admin:** http://localhost:3000/admin.html

## 🔐 Admin Giriş

Varsayılan şifre: `mugi2024`

## 📦 Özellikler

### Müşteri Menüsü
- 📱 Mobil-öncelikli responsive tasarım
- 🌙 Dark mode (glassmorphism)
- 🔍 Arama
- 📂 Kategori filtreleme
- 🇹🇷🇬🇧 Çift dil (TR/EN)
- ✨ Mikro-animasyonlar

### Admin Paneli
- 📦 Ürün yönetimi (ekleme/düzenleme/silme)
- 📸 Fotoğraf yükleme (drag & drop)
- 💰 Çoklu fiyatlandırma (boyut bazlı)
- 📁 Kategori yönetimi
- 🧪 Tarif yönetimi (malzeme listesi, oranlar)
- ⚙️ Genel ayarlar
- 📱 QR kod oluşturucu
- 📥 Veri dışa/içe aktarma

## 🗂️ Proje Yapısı

```
├── index.html          # Müşteri menüsü
├── admin.html          # Admin paneli
├── logo1.jpg           # Logo
├── css/
│   ├── variables.css   # Design tokens
│   ├── base.css        # Reset & utilities
│   ├── animations.css  # Animasyonlar
│   ├── menu.css        # Menü stilleri
│   └── admin.css       # Admin stilleri
├── js/
│   ├── store.js        # Veri yönetimi (localStorage)
│   ├── i18n.js         # Çoklu dil desteği
│   ├── app.js          # Menü uygulaması
│   └── admin.js        # Admin uygulaması
├── vercel.json         # Vercel config
└── README.md
```

## 🔄 Sonraki Adımlar

- [ ] Supabase entegrasyonu
- [ ] Vercel deployment
