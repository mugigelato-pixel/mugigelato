-- ============================================
-- MUGI GELATO — Supabase Database Setup
-- ============================================

-- Ana veri tablosu (key-value JSONB)
CREATE TABLE IF NOT EXISTS app_config (
  key TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Otomatik timestamp güncelleme
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER app_config_updated
  BEFORE UPDATE ON app_config
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- RLS (Row Level Security) - herkese okuma, anon key ile yazma
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni (menü ve website için)
CREATE POLICY "Public read access" ON app_config
  FOR SELECT USING (true);

-- Anon key ile yazma izni (admin paneli için)
CREATE POLICY "Anon write access" ON app_config
  FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket politikası (images bucket için)
-- NOT: Önce Dashboard'dan "images" adında PUBLIC bucket oluşturun
-- Sonra bu policy'leri çalıştırın:

-- Herkese okuma izni
CREATE POLICY "Public image read" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Anon key ile yükleme izni
CREATE POLICY "Anon image upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images');

-- Anon key ile silme izni
CREATE POLICY "Anon image delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'images');

-- Anon key ile güncelleme izni
CREATE POLICY "Anon image update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images');
