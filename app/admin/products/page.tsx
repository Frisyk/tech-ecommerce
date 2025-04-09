// app/admin/products/page.tsx
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/admin/data-table"
import { getAllProducts } from "@/lib/action/products"
import { productColumns } from "@/app/admin/products/columns"

export default async function ProductsPage() {
  const products = await getAllProducts()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>
      <div className="rounded-md border">
        <DataTable columns={productColumns} data={products || []} />
      </div>
    </div>
  )
}
