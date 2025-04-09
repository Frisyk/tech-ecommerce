"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Menu, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { MobileNav } from "@/components/mobile-nav"
import { CartSheet } from "@/components/cart-sheet"

export function SiteHeader({user}: {user:any}) {
  const pathname = usePathname()

  const isAdmin = pathname.startsWith("/admin")
  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isAuthPage) return null

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/products" },
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav />
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">
            <span className="text-primary">Luxe</span>Market
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === item.href ? "text-foreground" : "text-foreground/60",
              )}
            >
              {item.name}
            </Link>
          ))}
          {user?.id && user.email && (
            <Link
              href="/account"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/account" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Account
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/admin" ? "text-foreground" : "text-foreground/60",
              )}
            >
              Admin
            </Link>
          )}
        </nav>
        <div className="hidden md:flex flex-1 items-center justify-end">
          <div className="w-full max-w-sm mr-4">
            <form className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full appearance-none bg-background pl-8 shadow-none md:w-[200px] lg:w-[300px]"
              />
            </form>
          </div>
          <CartSheet />
          {user?.id ? (
            <Link href="/account">
              <Button variant="ghost" size="icon" className="mr-2">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="mr-2">
                Sign in
              </Button>
            </Link>
          )}
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
