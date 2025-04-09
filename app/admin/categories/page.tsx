import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { DataTable } from "@/components/admin/data-table"

export default async function CategoriesPage() {
    const supabase = await createServerSupabaseClient()

  const { data: categories } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      products:products (id)
    `)
    .order("name")

  // Count products in each category
  const categoriesWithCount = categories?.map((category) => ({
    ...category,
    product_count: category.products?.length || 0,
  }))

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "slug",
      header: "Slug",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: { row: any }) => (
        <div className="max-w-[300px] truncate">{row.getValue("description") || "—"}</div>
      ),
    },
    {
      accessorKey: "product_count",
      header: "Products",
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/categories/${row.original.id}`}>
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
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>
      <div className="rounded-md border">
        <DataTable columns={columns} data={categoriesWithCount || []} />
      </div>
    </div>
  )
}
