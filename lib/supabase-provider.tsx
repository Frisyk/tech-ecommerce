// "use client"

// import type React from "react"

// import { createContext, useContext, useEffect, useState } from "react"
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
// import type { SupabaseClient, User } from "@supabase/auth-helpers-nextjs"
// import type { Database } from "@/lib/database.types"
// // import { createServerSupabaseClient } from "./supabase-server"

// type SupabaseContext = {
//   supabase: SupabaseClient<Database>
//   user: User | null
//   loading: boolean
// }

// const Context = createContext<SupabaseContext | undefined>(undefined)

// export async function SupabaseProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)
//   // const supabase = await createServerSupabaseClient()

//   useEffect(() => {
//     const getUser = async () => {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession()
//       setUser(session?.user ?? null)
//       setLoading(false)

//       const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
//         setUser(session?.user ?? null)
//       })

//       return () => {
//         authListener.subscription.unsubscribe()
//       }
//     }

//     getUser()
//   }, [supabase.auth])

//   return <Context.Provider value={{ supabase, user, loading }}>{children}</Context.Provider>
// }

// export const useSupabase = () => {
//   const context = useContext(Context)
//   if (context === undefined) {
//     throw new Error("useSupabase must be used inside SupabaseProvider")
//   }
//   return context
// }
