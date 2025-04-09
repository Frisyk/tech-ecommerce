"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, LayoutGrid, Info, Phone, User, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSupabase } from "@/lib/supabase-provider"

export function MobileNav() {
  const pathname = usePathname()
  const { user, supabase } = useSupabase()

  const isAdmin = pathname.startsWith("/admin")

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Shop", href: "/products", icon: ShoppingBag },
    { name: "Categories", href: "/categories", icon: LayoutGrid },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Phone },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
      <div className="flex flex-col space-y-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-base transition-colors hover:text-foreground/80",
              pathname === item.href ? "text-foreground" : "text-foreground/60",
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        ))}
        {user?.id && (
          <>
            <Link
              href="/account"
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-base transition-colors hover:text-foreground/80",
                pathname === "/account" ? "text-foreground" : "text-foreground/60",
              )}
            >
              <User className="h-5 w-5" />
              Account
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-base transition-colors hover:text-foreground/80",
                  pathname === "/admin" ? "text-foreground" : "text-foreground/60",
                )}
              >
                <User className="h-5 w-5" />
                Admin
              </Link>
            )}
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-3 py-2 text-base justify-start hover:bg-transparent"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              Sign out
            </Button>
          </>
        )}
        {!user?.id && (
          <Link href="/login">
            <Button variant="default" className="w-full">
              Sign in
            </Button>
          </Link>
        )}
      </div>
    </ScrollArea>
  )
}
