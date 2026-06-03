/* ============================================
   MUGI GELATO — Image Storage Service
   Local: IndexedDB | Production: Supabase Storage
   ============================================ */

const ImageStorage = {
  // ── Config ──
  mode: 'local',           // 'local' | 'supabase'
  supabaseUrl: '',
  supabaseAnonKey: '',
  bucketName: 'images',
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.82,
  dbName: 'mugi_images_db',
  storeName: 'images',
  _db: null,
  _supabase: null,

  // ── Initialize ──
  async init() {
    const settings = Store.getSettings();
    if (settings.supabaseUrl && settings.supabaseAnonKey) {
      this.supabaseUrl = settings.supabaseUrl;
      this.supabaseAnonKey = settings.supabaseAnonKey;
      this.bucketName = settings.supabaseBucket || 'images';
      if (typeof supabase !== 'undefined' && supabase.createClient) {
        try {
          this._supabase = supabase.createClient(this.supabaseUrl, this.supabaseAnonKey);
          this.mode = 'supabase';
          console.log('[ImageStorage] Supabase mode active');
        } catch (e) {
          console.warn('[ImageStorage] Supabase init failed, falling back to local', e);
          this.mode = 'local';
        }
      } else {
        this.mode = 'local';
      }
    }
    // Always init IndexedDB as fallback
    await this._initDB();
    console.log(`[ImageStorage] Mode: ${this.mode}`);
    return this;
  },

  // ── IndexedDB Setup ──
  _initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
      request.onsuccess = (e) => {
        this._db = e.target.result;
        resolve();
      };
      request.onerror = (e) => {
        console.warn('[ImageStorage] IndexedDB failed', e);
        resolve();
      };
    });
  },

  // ══════════════════════════════════════
  //  PUBLIC API
  // ══════════════════════════════════════

  /**
   * Upload an image file
   * @param {File} file - Image file to upload
   * @param {string} folder - Folder path (e.g., 'products', 'website/sections')
   * @returns {Promise<string>} - Image URL/ID
   */
  async upload(file, folder = 'general') {
    if (!file) throw new Error('No file provided');

    // Validate
    if (!file.type.match(/^image\/(jpeg|png|webp|gif|svg\+xml)$/)) {
      throw new Error('Desteklenmeyen dosya formatı. JPG, PNG, WebP, GIF veya SVG kullanın.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Dosya boyutu 10MB\'dan küçük olmalıdır.');
    }

    // Compress image (skip SVG)
    let processedFile = file;
    if (!file.type.includes('svg')) {
      processedFile = await this._compressImage(file);
    }

    if (this.mode === 'supabase') {
      return this._uploadToSupabase(processedFile, folder);
    }
    return this._uploadToLocal(processedFile, folder);
  },

  /**
   * Delete an image
   * @param {string} urlOrId - Image URL or local ID
   */
  async delete(urlOrId) {
    if (!urlOrId) return;

    if (this.mode === 'supabase' && urlOrId.includes(this.supabaseUrl)) {
      return this._deleteFromSupabase(urlOrId);
    }
    if (urlOrId.startsWith('local://')) {
      return this._deleteFromLocal(urlOrId);
    }
    // Data URLs or external URLs - nothing to delete
  },

  /**
   * Get displayable URL from stored value
   * @param {string} urlOrId - Image URL or local ID
   * @returns {Promise<string>} - Displayable URL
   */
  async getUrl(urlOrId) {
    if (!urlOrId) return '';
    // Supabase or external URL
    if (urlOrId.startsWith('http') || urlOrId.startsWith('data:')) {
      return urlOrId;
    }
    // Local IndexedDB reference
    if (urlOrId.startsWith('local://')) {
      return this._getFromLocal(urlOrId);
    }
    return urlOrId;
  },

  /**
   * Check if URL is a local reference
   */
  isLocal(url) {
    return url && url.startsWith('local://');
  },

  // ══════════════════════════════════════
  //  IMAGE COMPRESSION
  // ══════════════════════════════════════
  _compressImage(file) {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        // Scale down if too large
        if (width > this.maxWidth || height > this.maxHeight) {
          const ratio = Math.min(this.maxWidth / width, this.maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', this.quality);

        URL.revokeObjectURL(img.src);
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        resolve(file); // Return original if compression fails
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // ══════════════════════════════════════
  //  LOCAL (IndexedDB) STORAGE
  // ══════════════════════════════════════
  async _uploadToLocal(file, folder) {
    const id = `local://${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const dataUrl = await this._fileToDataUrl(file);

    if (this._db) {
      return new Promise((resolve, reject) => {
        const tx = this._db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        store.put({ id, data: dataUrl, folder, filename: file.name, size: file.size, created: Date.now() });
        tx.oncomplete = () => resolve(id);
        tx.onerror = (e) => reject(e);
      });
    }
    // Fallback: return data URL directly
    return dataUrl;
  },

  async _getFromLocal(id) {
    if (!this._db) return '';
    return new Promise((resolve) => {
      const tx = this._db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result?.data || '');
      req.onerror = () => resolve('');
    });
  },

  async _deleteFromLocal(id) {
    if (!this._db) return;
    return new Promise((resolve) => {
      const tx = this._db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  },

  _fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // ══════════════════════════════════════
  //  SUPABASE STORAGE
  // ══════════════════════════════════════
  async _uploadToSupabase(file, folder) {
    if (!this._supabase) throw new Error('Supabase bağlantısı yok');

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${ext}`;

    const { data, error } = await this._supabase.storage
      .from(this.bucketName)
      .upload(fileName, file, {
        cacheControl: '31536000',
        upsert: false
      });

    if (error) throw new Error(`Yükleme hatası: ${error.message}`);

    // Get public URL
    const { data: urlData } = this._supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  async _deleteFromSupabase(url) {
    if (!this._supabase) return;

    // Extract path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split(`/storage/v1/object/public/${this.bucketName}/`);
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];
    await this._supabase.storage
      .from(this.bucketName)
      .remove([filePath]);
  },

  // ══════════════════════════════════════
  //  MIGRATION HELPER
  // ══════════════════════════════════════
  /**
   * Migrate all local images to Supabase
   * Call this after connecting Supabase
   */
  async migrateToSupabase() {
    if (this.mode !== 'supabase' || !this._db) {
      throw new Error('Supabase bağlantısı gerekli');
    }

    return new Promise((resolve, reject) => {
      const tx = this._db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.getAll();

      req.onsuccess = async () => {
        const items = req.result;
        const migrations = [];
        let migrated = 0;

        for (const item of items) {
          try {
            // Convert data URL to Blob
            const response = await fetch(item.data);
            const blob = await response.blob();
            const file = new File([blob], item.filename || 'image.jpg', { type: blob.type });

            // Upload to Supabase
            const newUrl = await this._uploadToSupabase(file, item.folder || 'migrated');
            migrations.push({ oldId: item.id, newUrl });
            migrated++;
          } catch (e) {
            console.warn(`Migration failed for ${item.id}:`, e);
          }
        }

        // Return mapping for updating store references
        resolve({ total: items.length, migrated, migrations });
      };

      req.onerror = () => reject(new Error('IndexedDB read failed'));
    });
  }
};
