import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { formatPrice } from "@/lib/utils"
import { DataTable } from "@/components/admin/data-table"

export default async function ProductsPage() {
    const supabase = await createServerSupabaseClient()

  const { data: products } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      inventory_quantity,
      is_active,
      category:categories (name),
      created_at
    `)
    .order("created_at", { ascending: false })

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "category.name",
      header: "Category",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }: { row: any }) => formatPrice(row.getValue("price")),
    },
    {
      accessorKey: "inventory_quantity",
      header: "Inventory",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: { row: any }) => (
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            row.getValue("is_active")
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}
        >
          {row.getValue("is_active") ? "Active" : "Inactive"}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/products/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </Link>
        </div>
      ),
    },
  ]

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
        <DataTable columns={columns} data={products || []} />
      </div>
    </div>
  )
}
