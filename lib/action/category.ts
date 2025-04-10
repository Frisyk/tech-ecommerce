"use server"

// import { generateSlug } from "@/lib/utils"
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

// export async function getAllCategories() {
//     const supabase = await getSupabase()

//     const { data: categories } = await supabase
//     .from("categories")
//     .select(`
//       id,
//       name,
//       slug,
//       description,
//       products:products (id)
//     `)
//     .order("name")

//     return categories;
// }

// --- Server Action untuk Membuat Kategori Baru ---
interface CreateCategoryInput {
  name: string;
  slug?: string | null;
  description?: string | null;
}


import { nanoid } from "nanoid";

// Define types
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url?: string | null;
}

interface UploadedImageData {
  url: string;
  filePath: string;
  alt: string;
}

// Get all categories
export async function getAllCategories() {
  const supabase = await getSupabase();

  const { data: categories, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      image_url,
      products:products (id)
    `)
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }

  return categories;
}

// Generate slug from name
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// Upload image to Supabase Storage
export async function uploadCategoryImageToSupabase(
  file: File,
  bucketName: string = "e-commerce", // Same bucket as products
): Promise<{ publicUrl: string; filePath: string }> {
  const supabase = await getSupabase();

  const fileExt = file.name.split(".").pop();
  const fileName = `${nanoid()}-${Date.now()}.${fileExt}`;
  // Separate folder for category images
  const filePath = `category-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Supabase Storage upload error:", uploadError);
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    // Attempt to remove the orphaned file
    await supabase.storage.from(bucketName).remove([filePath]);
    throw new Error("Upload succeeded but failed to get public URL.");
  }

  return { publicUrl: publicUrlData.publicUrl, filePath };
}

// Create category with optional image
export async function createCategoryWithImage(formData: FormData) {
  const supabase = await getSupabase();
  let uploadedImageData: UploadedImageData | null = null;
  let categoryId: string | null = null;

  try {
    // 1. Extract Category Data from FormData
    const name = formData.get("name") as string;
    let slug = (formData.get("slug") as string) || generateSlug(name);
    const description = (formData.get("description") as string) || null;

    // Basic Validation
    if (!name) {
      throw new Error("Category name is required.");
    }

    if (!slug) {
      slug = generateSlug(name);
    }

    // 2. Extract Image File if provided
    const imageFile = formData.get("image") as File | null;
    const imageAlt = formData.get("imageAlt") as string || name;

    // 3. Upload Image to Storage if provided
    let imageUrl = null;
    if (imageFile instanceof File && imageFile.size > 0) {
      console.log(`Uploading category image: ${imageFile.name}`);
      const { publicUrl, filePath } = await uploadCategoryImageToSupabase(imageFile);
      uploadedImageData = { url: publicUrl, filePath, alt: imageAlt };
      imageUrl = publicUrl;
    }

    // 4. Insert Category Data into 'categories' table
    const categoryData = {
      name,
      slug,
      description,
      image_url: imageUrl,
      image_alt: imageFile ? imageAlt : null,
    };

    // Check if the slug already exists
    const { data: existingCategory } = await supabase
      .from("categories")
      .select("slug")
      .eq("slug", slug)
      .single();

    if (existingCategory) {
      throw new Error(`Category with slug "${slug}" already exists. Please use a different name or modify the slug.`);
    }

    const { data: newCategory, error: categoryError } = await supabase
      .from("categories")
      .insert(categoryData)
      .select("id")
      .single();

    if (categoryError) {
      throw new Error(`Failed to insert category data: ${categoryError.message}`);
    }

    if (!newCategory || !newCategory.id) {
      throw new Error("Category insert succeeded but no ID was returned.");
    }

    categoryId = newCategory.id; // Store the ID for potential rollback

    // 5. Revalidate relevant paths
    revalidatePath("/admin/categories");
    revalidatePath("/categories"); // If you have a public categories page

    console.log("Category created successfully with ID:", categoryId);
    return { success: true, categoryId: categoryId };

  } catch (error: any) {
    console.error("Error in createCategoryWithImage:", error);

    // Rollback Logic
    // If category was created but there was another error, delete the category
    if (categoryId) {
      console.warn(`Attempting to rollback category creation (ID: ${categoryId}) due to error.`);
      await supabase.from("categories").delete().eq("id", categoryId);
    }

    // Delete any image that was successfully uploaded before the error occurred
    if (uploadedImageData) {
      console.warn("Attempting to rollback uploaded image:", uploadedImageData.filePath);
      await supabase.storage.from("e-commerce").remove([uploadedImageData.filePath]);
    }

    // Re-throw the error to be caught by the client
    throw error;
  }
}

// Delete a category
export async function deleteCategory(id: string) {
  const supabase = await getSupabase();
  let filePath: string | null = null;

  try {
    // 1. Cek apakah kategori punya produk
    const { data: category, error: fetchError } = await supabase
      .from("categories")
      .select("products:products(id), image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(`Gagal memeriksa kategori: ${fetchError.message}`);
    }

    if (category?.products && category.products.length > 0) {
      throw new Error("Tidak bisa menghapus kategori yang masih memiliki produk.");
    }

    // 2. Ambil file path dari image_url jika ada
    if (category?.image_url) {
      try {
        const url = new URL(category.image_url);
        const pathSegments = url.pathname.split('/');
        const bucketNameIndex = pathSegments.indexOf('e-commerce'); // Bucket name
        if (bucketNameIndex !== -1 && bucketNameIndex + 1 < pathSegments.length) {
          filePath = pathSegments.slice(bucketNameIndex + 1).join('/');
        }
      } catch (e) {
        console.error("Gagal mem-parsing image URL kategori:", category.image_url, e);
      }
    }

    // 3. Hapus kategori dari database
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(`Gagal menghapus kategori: ${deleteError.message}`);
    }

    // 4. Hapus gambar dari storage jika ada dan parsing sukses
    if (filePath) {
      const { error: storageError } = await supabase
        .storage
        .from("e-commerce")
        .remove([filePath]);

      if (storageError) {
        console.error(`Kategori ${id} dihapus, tapi gagal menghapus gambar dari storage:`, storageError.message);
        // Optional: throw jika ingin rollback
      }
    }

    // 5. Revalidate path admin
    
    revalidatePath("/admin/categories");
    return  true ;
    
  } catch (error: any) {
    revalidatePath("/admin/categories");
    console.error(`Terjadi kesalahan saat menghapus kategori ID ${id}:`, error.message);
    return false;
  }
}


// Update a category
export async function updateCategory(id: string, formData: FormData) {
  const supabase = await getSupabase();
  let uploadedImageData: UploadedImageData | null = null;
  let oldImagePath: string | null = null;

  try {
    // 1. Get current category data (especially for image management)
    const { data: currentCategory, error: fetchError } = await supabase
      .from("categories")
      .select("image_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch current category: ${fetchError.message}`);
    }

    // 2. Extract Category Data from FormData
    const name = formData.get("name") as string;
    let slug = (formData.get("slug") as string) || generateSlug(name);
    const description = (formData.get("description") as string) || null;
    const removeExistingImage = formData.get("removeImage") === "true";

    // Basic Validation
    if (!name) {
      throw new Error("Category name is required.");
    }

    // 3. Handle image: upload new if provided, keep old if exists, or remove if requested
    const imageFile = formData.get("image") as File | null;
    const imageAlt = formData.get("imageAlt") as string || name;
    
    let imageUrl = currentCategory?.image_url || null;
    
    // If the "removeImage" flag is true or a new image is uploaded, 
    // prepare to delete the current image
    if ((removeExistingImage || imageFile) && currentCategory?.image_url) {
      const urlParts = currentCategory.image_url.split("/");
      oldImagePath = `${urlParts[urlParts.length - 2]}/${urlParts[urlParts.length - 1]}`;
      
      // Only set to null if removing without replacement
      if (removeExistingImage && !imageFile) {
        imageUrl = null;
      }
    }

    // Upload new image if provided
    if (imageFile instanceof File && imageFile.size > 0) {
      const { publicUrl, filePath } = await uploadCategoryImageToSupabase(imageFile);
      uploadedImageData = { url: publicUrl, filePath, alt: imageAlt };
      imageUrl = publicUrl;
    }

    // 4. Check if the slug changed and if new slug exists (excluding current category)
    if (slug) {
      const { data: existingWithSlug } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .neq("id", id)
        .single();

      if (existingWithSlug) {
        throw new Error(`Category with slug "${slug}" already exists. Please use a different slug.`);
      }
    }

    // 5. Update Category Data
    const categoryData = {
      name,
      slug,
      description,
      image_url: imageUrl,
      image_alt: imageUrl ? imageAlt : null,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("categories")
      .update(categoryData)
      .eq("id", id);

    if (updateError) {
      throw new Error(`Failed to update category: ${updateError.message}`);
    }

    // 6. Delete old image if needed
    if (oldImagePath) {
      await supabase.storage.from("e-commerce").remove([oldImagePath]);
    }

    // 7. Revalidate paths
    revalidatePath("/admin/categories");
    revalidatePath(`/categories/${slug}`); // If you have individual category pages

    return { success: true, categoryId: id };

  } catch (error: any) {
    console.error("Error in updateCategory:", error);

    // Rollback - delete newly uploaded image if any
    if (uploadedImageData) {
      await supabase.storage.from("e-commerce").remove([uploadedImageData.filePath]);
    }

    throw error;
  }
}

  