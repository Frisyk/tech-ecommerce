import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getProfile } from "@/lib/action/user";
type Params = Promise<{ slug: string }>

export default async function CategoryPage({ params }: { params: Params }) {
  const supabase = await createServerSupabaseClient();

  const slug = (await params).slug
  // Ambil data kategori
  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .eq("slug", slug)
    .single();

  if (categoryError || !category) {
    notFound();
  }

  // Ambil produk dalam kategori ini
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      compare_at_price,
      images:product_images (
        id,
        url,
        alt
      )
    `)
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (productsError) {
    console.error("Error fetching products:", productsError);
  }

  return (
    <>
       
      <main className="container py-12">
        {/* Header Kategori */}
        <div className="mb-10">
          <Link href="/categories" className="text-sm text-primary hover:underline mb-2 inline-block">
            &larr; Kembali ke Kategori
          </Link>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {category.image_url && (
              <Image
                src={category.image_url}
                alt={category.name}
                width={200}
                height={150}
                className="rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-3 text-lg text-muted-foreground">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Produk */}
        {products && products.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Produk dalam Kategori Ini</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
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
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Belum Ada Produk</h2>
            <p className="text-muted-foreground mb-8">
              Belum ada produk dalam kategori ini saat ini. Silakan cek lagi nanti.
            </p>
            <Button asChild>
              <Link href="/products">Lihat Semua Produk</Link>
            </Button>
          </div>
        )}
      </main>
    </>
  );
} 