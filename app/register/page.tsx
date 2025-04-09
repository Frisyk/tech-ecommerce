// "use client"

// import type React from "react"

// import { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { Eye, EyeOff, Loader2 } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { useToast } from "@/hooks/use-toast"

// export default function RegisterPage() {
//   const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [showPassword, setShowPassword] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [errors, setErrors] = useState<{ [key: string]: string }>({})
//   const { toast } = useToast()
//   const router = useRouter()

//   const validateForm = () => {
//     const newErrors: { [key: string]: string } = {}
    
//     if (!firstName.trim()) {
//       newErrors.firstName = "Nama depan wajib diisi"
//     }
    
//     if (!email.trim()) {
//       newErrors.email = "Email wajib diisi"
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       newErrors.email = "Format email tidak valid"
//     }
    
//     if (password.length < 6) {
//       newErrors.password = "Password minimal 6 karakter"
//     }
    
//     if (password !== confirmPassword) {
//       newErrors.confirmPassword = "Password tidak cocok"
//     }
    
//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (!validateForm()) {
//       return
//     }
    
//     setIsLoading(true)

//     try {
//       // 1. Register user dengan Supabase Auth
//       const { data: authData, error: authError } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: {
//             first_name: firstName,
//             last_name: lastName
//           }
//         }
//       })

//       if (authError) throw authError

//       // 2. Buat profil pengguna di database
//       if (authData.user) {
//         const { error: profileError } = await supabase
//           .from('profiles')
//           .insert({
//             id: authData.user.id,
//             first_name: firstName,
//             last_name: lastName,
//             email: email,
//             is_admin: false
//           })

//         if (profileError) throw profileError
//       }

//       toast({
//         title: "Pendaftaran berhasil",
//         description: "Silakan periksa email Anda untuk konfirmasi",
//       })

//       // Redirect ke halaman login setelah pendaftaran
//       router.push("/login")
//     } catch (error: any) {
//       toast({
//         title: "Pendaftaran gagal",
//         description: error.message || "Terjadi kesalahan saat pendaftaran",
//         variant: "destructive",
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
//       <div className="w-full max-w-md space-y-6">
//         <div className="space-y-2 text-center">
//           <h1 className="text-3xl font-bold">Buat Akun Baru</h1>
//           <p className="text-muted-foreground">Daftar untuk mulai berbelanja di LuxeMarket</p>
//         </div>
//         <div className="rounded-lg border bg-card p-6 shadow-sm">
//           <form onSubmit={handleRegister} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="firstName">Nama Depan</Label>
//                 <Input
//                   id="firstName"
//                   type="text"
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   className={errors.firstName ? "border-destructive" : ""}
//                 />
//                 {errors.firstName && (
//                   <p className="text-xs text-destructive">{errors.firstName}</p>
//                 )}
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="lastName">Nama Belakang</Label>
//                 <Input
//                   id="lastName"
//                   type="text"
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                 />
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="nama@email.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className={errors.email ? "border-destructive" : ""}
//               />
//               {errors.email && (
//                 <p className="text-xs text-destructive">{errors.email}</p>
//               )}
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="••••••••"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className={errors.password ? "border-destructive" : ""}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="icon"
//                   className="absolute right-0 top-0 h-full px-3 py-2"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   <span className="sr-only">{showPassword ? "Sembunyikan password" : "Tampilkan password"}</span>
//                 </Button>
//               </div>
//               {errors.password && (
//                 <p className="text-xs text-destructive">{errors.password}</p>
//               )}
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
//               <Input
//                 id="confirmPassword"
//                 type="password"
//                 placeholder="••••••••"
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 className={errors.confirmPassword ? "border-destructive" : ""}
//               />
//               {errors.confirmPassword && (
//                 <p className="text-xs text-destructive">{errors.confirmPassword}</p>
//               )}
//             </div>
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Mendaftar...
//                 </>
//               ) : (
//                 "Daftar"
//               )}
//             </Button>
//           </form>
//           <div className="mt-4 text-center text-sm">
//             Sudah memiliki akun?{" "}
//             <Link href="/login" className="text-primary hover:underline">
//               Masuk disini
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }
