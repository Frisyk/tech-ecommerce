-- Script untuk membuat atau mengupdate tabel profiles

-- Buat tabel profiles jika belum ada
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tambahkan kolom is_admin jika belum ada
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Pastikan ada row profile untuk admin 
INSERT INTO profiles (id, first_name, last_name, is_admin)
VALUES 
  ('10000000-0000-0000-0000-000000000000', 'Admin', 'User', TRUE)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = TRUE,
  updated_at = NOW();

-- Pastikan ada indeks untuk pencarian berdasarkan id
CREATE INDEX IF NOT EXISTS profiles_id_idx ON profiles(id);

-- Tambahkan trigger untuk updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Set RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk admin 
DROP POLICY IF EXISTS admin_all ON profiles;
CREATE POLICY admin_all ON profiles 
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  );

-- Kebijakan untuk pengguna biasa - hanya bisa melihat dan mengedit profil mereka sendiri
DROP POLICY IF EXISTS users_select_own ON profiles;
CREATE POLICY users_select_own ON profiles 
  FOR SELECT 
  USING (id = auth.uid());

DROP POLICY IF EXISTS users_update_own ON profiles;
CREATE POLICY users_update_own ON profiles 
  FOR UPDATE 
  USING (id = auth.uid());

-- Menambahkan admin pertama (ganti UUID dan data sesuai kebutuhan)
-- Catatan: Anda perlu membuat user ini terlebih dahulu di Authentication
-- UUID di bawah ini hanya sebagai contoh
INSERT INTO profiles (id, first_name, last_name, is_admin)
VALUES 
  ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'Super', 'Admin', TRUE)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = TRUE,
  updated_at = NOW(); 