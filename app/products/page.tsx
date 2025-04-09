import Image from "next/image"
import Link from "next/link"
import { Filter, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SiteHeader } from "@/components/site-header"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { formatPrice } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ProductSort } from "@/components/product-sort"
import { ProductFilters } from "@/components/product-filters"
import { getProfile } from "@/lib/action/user"

export interface FilterParams {
  category?: string;
  sort?: string;
  min_price?: string;
  max_price?: string;
}

export default async function ProductsPage(props: {
  searchParams: Promise<{
    [K in keyof FilterParams]?: string | string[];
  }>
}) {
  const resolvedParams = await props.searchParams;

  const category = Array.isArray(resolvedParams.category) ? resolvedParams.category[0] : resolvedParams.category;
  const sort = Array.isArray(resolvedParams.sort) ? resolvedParams.sort[0] : resolvedParams.sort;
  const minPrice = Array.isArray(resolvedParams.min_price) ? resolvedParams.min_price[0] : resolvedParams.min_price;
  const maxPrice = Array.isArray(resolvedParams.max_price) ? resolvedParams.max_price[0] : resolvedParams.max_price;

  const supabase = await createServerSupabaseClient();
  const user = (await getProfile()).user;

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name", { ascending: true });

  let query = supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      compare_at_price,
      category:categories (
        id,
        name,
        slug
      ),
      images:product_images (
        id,
        url,
        alt
      )
    `)
    .eq("is_active", true);

  if (category) {
    const { data: selectedCategory } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category)
      .single();

    if (selectedCategory) {
      query = query.eq("category_id", selectedCategory.id);
    }
  }

  if (minPrice) {
    query = query.gte("price", parseFloat(minPrice));
  }

  if (maxPrice) {
    query = query.lte("price", parseFloat(maxPrice));
  }

  if (sort) {
    switch (sort) {
      case "price-asc":
        query = query.order("price", { ascending: true });
        break;
      case "price-desc":
        query = query.order("price", { ascending: false });
        break;
      case "name-asc":
        query = query.order("name", { ascending: true });
        break;
      case "name-desc":
        query = query.order("name", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: products, error } = await query;

  if (error) {
    console.error("Error fetching products:", error);
  }

  return (
    <>
      <SiteHeader user={user} />
      <main className="container py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Semua Produk</h1>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-muted-foreground">
              Menampilkan {products?.length || 0} produk
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <ProductFilters categories={categories || []} />
              <ProductSort />
            </div>
          </div>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
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
                  {product.category && (
                    <div className="mb-1 text-xs text-muted-foreground">
                      {product.category[0]?.name}
                    </div>
                  )}
                  <h3 className="font-medium">{product.name}</h3>
                  <div className="mt-1 flex items-center">
                    <span className="text-lg font-bold text-foreground">
                      {formatPrice(product.price)}
                    </span>
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
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Tidak Ada Produk Ditemukan</h2>
            <p className="text-muted-foreground">
              Coba sesuaikan filter atau cari produk lainnya
            </p>
          </div>
        )}
      </main>
    </>
  );
}
