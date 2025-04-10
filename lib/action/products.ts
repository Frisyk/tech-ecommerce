// lib/action/products.ts
"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { nanoid } from "@/lib/utils"; // Assuming generateSlug is also in utils

// Define types for better clarity
interface ProductFormData {
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  inventory_quantity: number;
  is_featured: boolean;
  is_active: boolean;
}

interface UploadedImageData {
  url: string;
  alt: string;
  position: number;
  filePath: string; // Needed for potential rollback
}


// Helper agar DRY
async function getSupabase() {
  return createServerSupabaseClient();
}

// Get all products with category name AND first image URL (Updated from previous response)
// lib/action/products.ts
export async function getAllProducts() {
  const supabase = await getSupabase()

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      inventory_quantity,
      is_active,
      categories (
        name
      ),
      product_images (
        url,
        position
      ),
      created_at
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error.message)
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  // Optional: kamu bisa ubah nama relasi agar konsisten dengan TypeScript types
  const products = (data || []).map((product) => ({
    ...product,
    category: product.categories[0].name ?? "",
    images: product.product_images ?? [],
  }))

  return products
}



// Get product by ID (include images) (Updated from previous response)
export async function getProductById(id: string) {
    const supabase = await getSupabase()

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(*),
        product_images(*)
      `)
      .eq("id", id)
      .order('position', { foreignTable: 'product_images', ascending: true }) // Urutkan gambar berdasarkan posisi
      .single()

    if (error) {
      console.error("Error fetching product by ID:", error.message)
      if (error.code === 'PGRST116') {
         return null;
      }
      throw new Error(`Failed to fetch product ${id}: ${error.message}`);
    }
    return data
}


// Update product (Needs modification if image update is required)
export async function updateProduct(id: string, product: any) {
    const supabase = await getSupabase()
    const slug = generateSlug(product.name);

    const { data, error } = await supabase
      .from("products")
      .update({ ...product, slug })
      .eq("id", id)
      .select('id')
      .single();

    if (error) {
      console.error("Error updating product:", error.message)
      throw new Error(`Failed to update product ${id}: ${error.message}`);
    }
    if (!data) {
       throw new Error(`Failed to update product ${id}: Product not found or no change made.`);
    }
    // Revalidate if needed
    revalidatePath(`/admin/products`);
    revalidatePath(`/admin/products/${id}`);
    return data;
}


// Delete product (Includes image deletion) (Updated from previous response)
export async function deleteProduct(id: string) {
    const supabase = await getSupabase();
    let filePaths: string[] = [];

    try {
        // 1. Get image paths before deleting DB entries
        const { data: images, error: imageFetchError } = await supabase
          .from('product_images')
          .select('url')
          .eq('product_id', id);

        if (imageFetchError) {
          console.warn(`Could not fetch images for product ${id} before deletion:`, imageFetchError.message);
          // Continue deletion process even if fetching fails
        } else if (images && images.length > 0) {
           filePaths = images.map(img => {
             try {
                const url = new URL(img.url);
                // Assuming path starts after /public/bucket-name/
                const pathSegments = url.pathname.split('/');
                const bucketNameIndex = pathSegments.indexOf('e-commerce'); // Your bucket name
                if (bucketNameIndex !== -1 && bucketNameIndex + 1 < pathSegments.length) {
                  return pathSegments.slice(bucketNameIndex + 1).join('/');
                }
             } catch (e) {
                console.error("Error parsing image URL for deletion:", img.url, e)
             }
             return null;
           }).filter(path => path !== null) as string[];
        }

        // 2. Delete entries from product_images (CASCADE should handle this if set up, but explicit is safer)
        const { error: imageDbError } = await supabase
          .from('product_images')
          .delete()
          .eq('product_id', id);

        if (imageDbError) {
           console.error(`Error deleting image entries for product ${id}:`, imageDbError.message);
           // Decide if this is critical - maybe throw?
        }

        // 3. Delete the product itself
        const { error: productError } = await supabase
          .from("products")
          .delete()
          .eq("id", id);

        if (productError) {
          // If product deletion fails, we probably shouldn't delete files
          throw new Error(`Failed to delete product: ${productError.message}`);
        }

        // 4. Delete images from storage (only if product deletion was successful)
        if (filePaths.length > 0) {
           console.log("Attempting to delete files from storage:", filePaths);
           const { error: storageError } = await supabase.storage
             .from('products')
             .remove(filePaths);

           if (storageError) {
             // Log this error but don't throw, as the core DB deletion succeeded
             console.error(`Product ${id} deleted, but failed to remove images from storage:`, storageError.message);
           }
        }

        // 5. Revalidate paths
        revalidatePath("/admin/products");
        // Revalidate other relevant paths like category pages if needed

        return true; // Success

    } catch (error: any) {
        console.error(`Error during product deletion process for ID ${id}:`, error.message);
        // Return false or re-throw depending on desired handling
        return false;
    }
}

// Upload image to Supabase Storage (Updated to return filePath)
export async function uploadImageToSupabase(
    file: File,
    bucketName: string = "e-commerce", // Make bucket name configurable if needed
): Promise<{ publicUrl: string; filePath: string }> { // Return filePath
    const supabase = await getSupabase();

    const fileExt = file.name.split(".").pop();
    const fileName = `${nanoid()}-${Date.now()}.${fileExt}`;
    // Consistent path structure
    const filePath = `product-images/${fileName}`;

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

    return { publicUrl: publicUrlData.publicUrl, filePath }; // Return both URL and path
}


// --- Create product with images (Mainly Modified Function) ---
export async function createProductWithImages(formData: FormData) {
    const supabase = await getSupabase();
    const uploadedImagesData: UploadedImageData[] = [];
    let productId: string | null = null; // To store the created product ID

    try {
        // 1. Extract Product Data from FormData
        const productInput: ProductFormData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string || null,
            price: parseFloat(formData.get("price") as string || "0"),
            compare_at_price: formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null,
            // Handle 'none' case for category
            category_id: formData.get("categoryId") === "none" ? null : formData.get("categoryId") as string,
            inventory_quantity: parseInt(formData.get("inventoryQuantity") as string || "0", 10),
            is_featured: formData.get("isFeatured") === "true", // FormData values are strings
            is_active: formData.get("isActive") === "true",
        };

        // Basic Validation
        if (!productInput.name || productInput.price < 0 || productInput.inventory_quantity < 0) {
            throw new Error("Invalid product data. Name, Price, and Inventory are required.");
        }
        const slug = generateSlug(productInput.name);

        // 2. Extract Files and Alt Texts from FormData
        const imageFiles: File[] = formData.getAll("images") as File[];
        const altTexts: string[] = formData.getAll("altTexts") as string[];

        // Validate file counts match alt text counts if necessary
        if (imageFiles.length !== altTexts.length) {
            console.warn("Mismatch between image file count and alt text count.");
            // Decide how to handle: use file name as alt, or throw error?
            // For now, we'll proceed but this might indicate a client-side issue.
        }


        // 3. Upload Images to Storage (Sequentially for simplicity, parallel is possible)
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const alt = altTexts[i] || file.name; // Fallback alt text
            if (file instanceof File && file.size > 0) { // Basic check if it's a valid file
                console.log(`Uploading image ${i + 1}: ${file.name}`);
                const { publicUrl, filePath } = await uploadImageToSupabase(file);
                uploadedImagesData.push({ url: publicUrl, filePath, alt, position: i });
            } else {
                 console.warn(`Skipping invalid file at index ${i}`);
            }
        }

        // 4. Insert Product Data into 'products' table
        const baseProduct = {
            ...productInput,
            slug, // Add the generated slug
        };

        const { data: productData, error: productError } = await supabase
            .from("products")
            .insert(baseProduct)
            .select("id")
            .single();

        if (productError) {
            throw new Error(`Failed to insert product data: ${productError.message}`);
        }
        if (!productData || !productData.id) {
             throw new Error("Product insert succeeded but no ID was returned.");
        }
        productId = productData.id; // Store the ID

        // 5. Insert Image Data into 'product_images' table (if images were uploaded)
        if (uploadedImagesData.length > 0) {
            const imageInserts = uploadedImagesData.map((imgData) => ({
                product_id: productId, // Use the retrieved product ID
                url: imgData.url,
                alt: imgData.alt,
                position: imgData.position,
            }));

            console.log("Inserting image data:", imageInserts);
            const { error: imagesError } = await supabase
                .from("product_images")
                .insert(imageInserts);

            if (imagesError) {
                // This is a critical error, attempt rollback
                throw new Error(`Product created, but failed to insert image data: ${imagesError.message}`);
            }
        }

        // 6. Revalidate relevant paths
        revalidatePath("/admin/products");
        if (productInput.category_id) {
             // Optionally revalidate category page if you show products there
             // revalidatePath(`/categories/${productInput.category_id}`);
        }

        console.log("Product created successfully with ID:", productId);
        return { success: true, productId: productId };

    } catch (error: any) {
        console.error("Error in createProductWithImages:", error);

        // --- Rollback Logic ---
        // If product was created but images failed, delete the product
        if (productId) {
            console.warn(`Attempting to rollback product creation (ID: ${productId}) due to error.`);
            await supabase.from("products").delete().eq("id", productId);
            // Optionally call revalidatePath again if needed after delete
        }
        // Delete any images that were successfully uploaded before the error occurred
        if (uploadedImagesData.length > 0) {
             const pathsToDelete = uploadedImagesData.map(img => img.filePath);
             console.warn("Attempting to rollback uploaded images:", pathsToDelete);
             await supabase.storage.from("products").remove(pathsToDelete);
        }

        // Re-throw the error to be caught by the client
        throw error;
    }
}


// (Keep the generateSlug function as is or import from utils)
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}