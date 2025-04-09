'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function register(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const firstname = formData.get('firstname') as string
  const lastname = formData.get('lastname') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstname,
        last_name: lastname,
      }
    }
  })

  if (authError || !authData.user) {
    console.error('Auth Error:', authError)
    redirect('/error')
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    first_name: firstname,
    last_name: lastname,
    email,
    is_admin: false
  })

  if (profileError) {
    console.error('Profile Error:', profileError)
    redirect('/error')
  }

//   revalidatePath('/', 'layout')

  if (authError) {
    return { success: false, message: authError }
  }

  return { success: true } // Redirect ke login setelah sukses
}
