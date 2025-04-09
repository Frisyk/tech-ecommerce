'use server'
import { createServerSupabaseClient } from "../supabase-server"

export async function getProfile() {
  const supabase = await createServerSupabaseClient()
  const { data: profile } = await supabase.auth.getUser()
  return profile
}

export async function getCategories() {
  const supabase = await createServerSupabaseClient()
  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  return categories
}

export const handleSignOut = async () => {
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
  }

// async function updateProfile({
//     username,
//     website,
//     avatar_url,
//   }: {
//     username: string | null
//     fullname: string | null
//     website: string | null
//     avatar_url: string | null
//   }) {
//     try {
//       setLoading(true)

//       const { error } = await supabase.from('profiles').upsert({
//         id: user?.id as string,
//         full_name: fullname,
//         username,
//         website,
//         avatar_url,
//         updated_at: new Date().toISOString(),
//       })
//       if (error) throw error
//       alert('Profile updated!')
//     } catch (error) {
//       alert('Error updating the data!')
//     } finally {
//       setLoading(false)
//     }
//   }
