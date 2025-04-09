"use client"

import Link from "next/link"

interface Category {
  id: string
  name: string
  slug: string
}

interface ProductFiltersProps {
  categories: Category[]
  currentCategory?: string
}

export function ProductFilters({ categories, currentCategory }: ProductFiltersProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Categories</h3>
      <div className="space-y-1">
        <Link
          href="/products"
          className={`block rounded-md px-3 py-2 text-sm ${!currentCategory ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          All Categories
        </Link>
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`block rounded-md px-3 py-2 text-sm ${currentCategory === cat.slug ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
