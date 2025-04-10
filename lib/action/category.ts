"use server"

import { generateSlug } from "@/lib/utils"
import { createServerSupabaseClient } from "../supabase-server"
import { revalidatePath } from "next/cache"; // Untuk memicu pembaruan data di halaman daftar kategori

async function getSupabase() {
    return createServerSupabaseClient()
  }

export async function fetchCategories() {
    const supabase = await getSupabase()
  const { data, error } = await supabase.from("categories").select("id, name").order("name")
  if (error) throw new Error(error.message)
  return data
}

export async function getAllCategories() {
    const supabase = await getSupabase()

    const { data: categories } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      products:products (id)
    `)
    .order("name")

    return categories;
}




// // (Tambahkan fungsi getAllCategories, update, delete jika belum ada)
// export async function getAllCategories() {
//   const supabase = await createServerSupabaseClient();
//   const { data, error } = await supabase
//       .from("categories")
//       .select(`
//           *,
//           products ( id )
//       `)
//       .order("name", { ascending: true });

//   if (error) {
//       console.error("Error fetching categories:", error.message);
//       throw new Error(`Failed to fetch categories: ${error.message}`);
//   }
//   return data || [];
// }


// --- Server Action untuk Membuat Kategori Baru ---
interface CreateCategoryInput {
  name: string;
  slug?: string | null;
  description?: string | null;
}

export async function createCategory(input: CreateCategoryInput) {
  const supabase = await createServerSupabaseClient();

  // Validasi Input (Contoh sederhana)
  if (!input.name) {
    throw new Error("Category name cannot be empty.");
  }

  // Generate slug jika tidak disediakan atau kosong
  // Lakukan di server untuk konsistensi
  const slug = input.slug?.trim() || generateSlug(input.name);
   if (!slug) {
    throw new Error("Failed to generate a valid slug for the category.");
  }

  // Data yang akan dimasukkan ke database
  const categoryData = {
    name: input.name.trim(), // Hapus spasi ekstra
    slug: slug,
    description: input.description?.trim() || null, // Set null jika kosong atau hanya spasi
  };

  // Coba masukkan data ke Supabase
  const { data, error } = await supabase
    .from("categories")
    .insert(categoryData)
    .select('id') // Pilih ID kategori baru untuk konfirmasi
    .single();

  // Tangani error dari Supabase
  if (error) {
    console.error("Supabase create category error:", error);
    // Cek error spesifik, misal slug duplikat (tergantung constraint DB Anda)
    if (error.code === '23505') { // Kode error PostgreSQL untuk unique violation
        throw new Error(`Category slug "${slug}" already exists. Please use a different name or slug.`);
    }
    throw new Error(`Could not create category: ${error.message}`);
  }

   if (!data) {
      throw new Error("Category was potentially created, but no ID was returned.");
   }

  // Jika berhasil, revalidasi path agar daftar kategori diperbarui
  revalidatePath("/admin/categories"); // Sesuaikan path jika perlu

  // Kembalikan indikasi sukses atau data yang relevan
  return { success: true, categoryId: data.id };
}

// --- Tambahkan fungsi updateCategory dan deleteCategory di sini ---