# Panduan Autentikasi Supabase untuk LuxeMarket

Dokumen ini berisi panduan untuk menyiapkan dan memperbaiki autentikasi Supabase di aplikasi LuxeMarket.

## Struktur Tabel yang Dibutuhkan

Aplikasi ini membutuhkan tabel `profiles` yang terhubung dengan Auth users. Berikut skema tabel:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Menyiapkan Tabel dan Admin

1. Buka SQL Editor di Supabase Dashboard
2. Jalankan script dari file `script-setup-profiles.sql`
3. Pastikan untuk mengganti UUID pada bagian bawah script dengan user ID admin Anda:

```sql
INSERT INTO profiles (id, first_name, last_name, is_admin)
VALUES 
  ('xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 'Super', 'Admin', TRUE)
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = TRUE,
  updated_at = NOW();
```

## Cara Membuat Admin Baru

1. Buat user baru melalui autentikasi
2. Dapatkan UUID user dari dashboard Auth 
3. Update tabel profiles lewat SQL Editor:

```sql
UPDATE profiles
SET is_admin = TRUE
WHERE id = 'UUID-user-yang-ingin-dijadikan-admin';
```

## Troubleshooting Autentikasi

### Masalah: Profile Selalu Null

Jika profile selalu null meskipun user sudah login, lakukan langkah berikut:

1. Pastikan middleware (`middleware.ts`) sudah diimplementasikan dengan benar
2. Periksa file `lib/supabase-server.ts` untuk memastikan cookies ditangani dengan benar
3. Pastikan tabel profiles sudah dibuat dan memiliki struktur yang benar
4. Cek apakah row profile untuk pengguna tersebut sudah dibuat

Perbaikan:
- Implementasikan fungsi di `app/login/action.ts` yang akan otomatis membuat profile saat pengguna login jika belum ada.

### Masalah: Error Typescript dengan Supabase

Jika mengalami error typescript seperti:

```
Argument of type 'string' is not assignable to parameter of type...
```

Pastikan:

1. Tipe `Database` diimpor dan digunakan dengan benar di `createServerClient<Database>(...)`
2. File `database.types.ts` sudah sesuai dengan struktur database Anda (bisa digenerate dari Supabase dashboard)

## Menyegarkan Tipe Database

Untuk menyegarkan tipe database:

1. Gunakan CLI Supabase:
   ```
   supabase gen types typescript --project-id your-project-id > lib/database.types.ts
   ```

2. Atau salin dari Supabase Dashboard:
   - Buka project settings > API
   - Scroll ke bagian bawah untuk "TypeScript types"
   - Copy dan paste ke file `lib/database.types.ts`

## Catatan Penting

- Selalu periksa file RLS (Row Level Security) untuk memastikan akses data yang aman
- Gunakan server-side rendering dengan `createServerSupabaseClient()` untuk operasi yang memerlukan otorisasi
- Untuk Client Components, gunakan hooks dari context provider (`useSupabase`)
- Jangan lupa menangani middleware untuk refresh token 