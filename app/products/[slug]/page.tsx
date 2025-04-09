import Image from "next/image"
import { notFound } from "next/navigation"
import { Star, Truck, ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { formatPrice } from "@/lib/utils"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { getProfile } from "@/lib/action/user"

type Params = Promise<{ slug: string }>

export default async function ProductPage({ params }: { params: Params }) {
    const supabase = await createServerSupabaseClient()
    const slug = (await params).slug
    
    if (!slug) {
      notFound()
    }
    const user = (await getProfile()).user
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        compare_at_price,
        inventory_quantity,
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
      `).eq('id', slug).single()

  
    if (!product) {
      notFound()
    }
  
    const { data: relatedProducts } = await supabase
      .from('products')
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
      .eq('category_id', product.category?.[0]?.id)
      .neq('id', product.id)
      .limit(4)
  
    return (
      <>
        <SiteHeader user={user} />
        <main className="container py-10">
          <Button variant="ghost" className="mb-6" asChild>
            <a href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to products
            </a>
          </Button>
          
          <div className="grid gap-8 md:grid-cols-2">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.images?.[0]?.url || `/placeholder.svg?height=600&width=600`}
                  alt={product.images?.[0]?.alt || product.name}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {product.images.slice(0, 4).map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={image.url || "/placeholder.svg"}
                        alt={image.alt || ''}
                        width={150}
                        height={150}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="space-y-6">
              <div>
                {product.category && (
                  <div className="text-sm text-muted-foreground">
                    {product.category[0]?.name}
                  </div>
                )}
                <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
                <div className="mt-4 flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    4.9 (120 reviews)
                  </span>
                </div>
              </div>
              
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
                {product.compare_at_price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.compare_at_price)}
                  </span>
                )}
              </div>
              
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Truck className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Free shipping on orders over $50</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <AddToCartButton product={product} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">You might also like</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <a
                    key={relatedProduct.id}
                    href={`/products/${relatedProduct.slug}`}
                    className="group rounded-lg border bg-card shadow-sm product-card-hover"
                  >
                    <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
                      <Image
                        src={relatedProduct.images?.[0]?.url || "/placeholder.svg"}
                        alt={relatedProduct.images?.[0]?.alt || relatedProduct.name}
                        width={250}
                        height={250}
                        className="h-full w-full object-cover object-center transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold">{relatedProduct.name}</h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-lg font-bold">
                          {formatPrice(relatedProduct.price)}
                        </span>
                        {relatedProduct.compare_at_price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(relatedProduct.compare_at_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </main>
      </>
    )
  }
