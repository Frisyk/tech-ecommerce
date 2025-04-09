import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
// import { SupabaseProvider } from "@/lib/supabase-provider"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { getProfile } from "@/lib/action/user"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Luxe Market | Premium E-commerce Experience",
  description: "Discover premium products with an exceptional shopping experience",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await (await getProfile()).user
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* <SupabaseProvider> */}
            <div className="flex min-h-screen flex-col">
              <SiteHeader user={user} />
              {children}
              <SiteFooter />
            </div>
            <Toaster />
          {/* </SupabaseProvider> */}
        </ThemeProvider>
      </body>
    </html>
  )
}