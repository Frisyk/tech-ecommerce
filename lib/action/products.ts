"use server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function getAllProducts() {
  const supabase = await createServerSupabaseClient()

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      inventory_quantity,
      is_active,
      category:categories (name),
      created_at
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error.message)
    return []
  }

  return products
}

export async function getProductById(id: string) {
  const supabase = await createServerSupabaseClient()

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {  
    console.error("Error fetching product:", error.message) 
    return null
  }

  return product
}

export async function createProduct(product: any) {
  const supabase = await createServerSupabaseClient()

  const { data, error } = await supabase
    .from("products")
    .insert(product)

  if (error) {
    console.error("Error creating product:", error.message)
    return null
  }

  return data
}

export async function updateProduct(id: string, product: any) {
  const supabase = await createServerSupabaseClient()   

  const { data, error } = await supabase
    .from("products")
    .update(product)
    .eq("id", id)   

  if (error) {
    console.error("Error updating product:", error.message)
    return null
  }

  return data
}   

export async function deleteProduct(id: string) {
  const supabase = await createServerSupabaseClient()

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("Error deleting product:", error.message)
    return false
  }

  return true
}   
