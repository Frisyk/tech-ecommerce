import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShoppingBag, Truck, Shield, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { formatPrice } from "@/lib/utils"

export default async function Home() {
  const supabase = await createServerSupabaseClient()
  
  // Fetch featured products
  const { data: featuredProducts } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      compare_at_price,
      images:product_images (
        url,
        alt
      )
    `)
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4)

  // Fetch categories
  const { data: categories } = await supabase.from("categories").select("id, name, slug, image_url").limit(4)

  return (
    <>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="hero-gradient absolute inset-0 z-0"></div>
          <div className="container relative z-10 mx-auto px-4 py-32 text-center sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              <span className="block">Discover Premium Products</span>
              <span className="block text-primary">Exceptional Experience</span>
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-xl text-muted-foreground">
              Explore our curated collection of high-quality products designed to elevate your lifestyle.
            </p>
            <div className="mx-auto mt-10 max-w-sm sm:flex sm:max-w-none sm:justify-center">
              <div className="space-y-4 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5 sm:space-y-0">
                <Button asChild size="lg" className="w-full">
                  <Link href="/products">Shop Now</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="w-full">
                  <Link href="/categories">Browse Categories</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="bg-background py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
              <Link href="/products" className="flex items-center text-primary hover:underline">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts?.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group rounded-lg border bg-card shadow-sm product-card-hover"
                >
                  <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                    <Image
                      src={product.images?.[0]?.url || `/placeholder.svg?height=400&width=400`}
                      alt={product.images?.[0]?.alt || product.name}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="mt-1 flex items-center">
                      <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>
                      {product.compare_at_price && (
                        <span className="ml-2 text-sm text-muted-foreground line-through">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-muted/30 py-16">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight mb-8">Shop by Category</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories?.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative flex items-end overflow-hidden rounded-lg p-6 shadow-lg bg-cover bg-center transition-transform duration-300 ease-in-out hover:scale-105 h-60 sm:h-72 md:h-80"
                  style={{
                    backgroundImage: category.image_url
                      ? `url(${category.image_url})`
                      : "linear-gradient(to right, #6366f1, #3b82f6)", // fallback gradient jika image_url kosong
                  }}
                >
                  {/* Overlay gelap agar teks terbaca */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />

                  {/* Konten teks */}
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    <span className="mt-1.5 inline-block text-xs font-medium text-white/90 underline-offset-2 group-hover:underline">
                      Shop now
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-background py-16">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Why Shop With Us</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-medium">Premium Selection</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Carefully curated products that meet our high standards of quality.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Truck className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-medium">Fast Delivery</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Quick and reliable shipping to get your products to you on time.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Shield className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-medium">Secure Payments</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your transactions are protected with industry-leading security.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <RotateCcw className="h-8 w-8" />
                </div>
                <h3 className="mt-4 text-lg font-medium">Easy Returns</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Not satisfied? Return your purchase within 30 days for a full refund.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">Subscribe to our newsletter</h2>
              <p className="mt-4 text-lg">Get the latest updates on new products and upcoming sales.</p>
              <form className="mt-6 sm:flex sm:max-w-md sm:mx-auto">
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  type="email"
                  name="email-address"
                  id="email-address"
                  autoComplete="email"
                  required
                  className="w-full min-w-0 appearance-none rounded-md border-0 bg-white/10 px-3 py-1.5 text-base text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-white/75 focus:ring-2 focus:ring-inset focus:ring-white sm:w-64 sm:text-sm sm:leading-6 xl:w-full"
                  placeholder="Enter your email"
                />
                <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                  <Button type="submit" variant="secondary" className="w-full">
                    Subscribe
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/40">
        <div className="container py-8 md:py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-medium">Shop</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/products" className="text-muted-foreground hover:text-foreground">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="text-muted-foreground hover:text-foreground">
                    Categories
                  </Link>
                </li>
                <li>
                  <Link href="/featured" className="text-muted-foreground hover:text-foreground">
                    Featured
                  </Link>
                </li>
                <li>
                  <Link href="/sale" className="text-muted-foreground hover:text-foreground">
                    Sale
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium">Account</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/account" className="text-muted-foreground hover:text-foreground">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="text-muted-foreground hover:text-foreground">
                    Order History
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="text-muted-foreground hover:text-foreground">
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium">Company</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium">Connect</h3>
              <ul className="mt-4 space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground">
                    Pinterest
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 md:flex md:items-center md:justify-between">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} LuxeMarket. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
