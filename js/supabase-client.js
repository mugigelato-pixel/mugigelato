/* ============================================
   MUGI GELATO — Supabase Client
   Handles DB sync and Storage
   ============================================ */
const SupabaseConfig = {
  url: 'https://gzctjekrcylwzmfxusps.supabase.co',
  anonKey: 'sb_publishable_5UYEQwY42n5JmTjGtaNxZw_iaJsH2b1',
  bucket: 'images'
};

let _supabase = null;

function getSupabase() {
  if (!_supabase) {
    if (typeof supabase !== 'undefined' && supabase.createClient) {
      _supabase = supabase.createClient(SupabaseConfig.url, SupabaseConfig.anonKey);
    }
  }
  return _supabase;
}

/* ── Database Sync ── */
const SupabaseDB = {
  /**
   * Load a config key from Supabase
   * @param {string} key - 'settings', 'products', 'categories', 'recipes', 'website'
   * @returns {object|null}
   */
  async load(key) {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data, error } = await sb
        .from('app_config')
        .select('data')
        .eq('key', key)
        .single();
      if (error) {
        if (error.code === 'PGRST116') return null; // no rows
        console.warn(`SupabaseDB.load(${key}):`, error.message);
        return null;
      }
      return data?.data || null;
    } catch (e) {
      console.warn('SupabaseDB.load error:', e);
      return null;
    }
  },

  /**
   * Save a config key to Supabase (upsert)
   */
  async save(key, value) {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const { error } = await sb
        .from('app_config')
        .upsert({ key, data: value }, { onConflict: 'key' });
      if (error) {
        console.error(`SupabaseDB.save(${key}):`, error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('SupabaseDB.save error:', e);
      return false;
    }
  },

  /**
   * Load all config at once
   */
  async loadAll() {
    const sb = getSupabase();
    if (!sb) return null;
    try {
      const { data, error } = await sb
        .from('app_config')
        .select('key, data');
      if (error) {
        console.warn('SupabaseDB.loadAll:', error.message);
        return null;
      }
      const result = {};
      (data || []).forEach(row => {
        result[row.key] = row.data;
      });
      return result;
    } catch (e) {
      console.warn('SupabaseDB.loadAll error:', e);
      return null;
    }
  },

  /**
   * Test connection
   */
  async testConnection() {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const { error } = await sb.from('app_config').select('key').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
};

/* ── Storage (Images/Videos) ── */
const SupabaseStorage = {
  /**
   * Upload a file to Supabase Storage
   * @param {File} file
   * @param {string} folder - e.g. 'menu', 'website'
   * @returns {string} public URL
   */
  async upload(file, folder = '') {
    const sb = getSupabase();
    if (!sb) throw new Error('Supabase bağlantısı yok');

    const ext = file.name.split('.').pop().toLowerCase();
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { data, error } = await sb.storage
      .from(SupabaseConfig.bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw new Error(`Yükleme hatası: ${error.message}`);

    // Get public URL
    const { data: urlData } = sb.storage
      .from(SupabaseConfig.bucket)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  },

  /**
   * Delete a file from storage
   * @param {string} url - public URL
   */
  async delete(url) {
    if (!url || !url.includes(SupabaseConfig.url)) return;
    const sb = getSupabase();
    if (!sb) return;

    try {
      // Extract path from URL
      const bucketPath = `/storage/v1/object/public/${SupabaseConfig.bucket}/`;
      const idx = url.indexOf(bucketPath);
      if (idx === -1) return;
      const path = decodeURIComponent(url.substring(idx + bucketPath.length));

      await sb.storage.from(SupabaseConfig.bucket).remove([path]);
    } catch (e) {
      console.warn('SupabaseStorage.delete error:', e);
    }
  },

  /**
   * Get public URL for a path
   */
  getPublicUrl(path) {
    const sb = getSupabase();
    if (!sb) return '';
    const { data } = sb.storage.from(SupabaseConfig.bucket).getPublicUrl(path);
    return data?.publicUrl || '';
  }
};
