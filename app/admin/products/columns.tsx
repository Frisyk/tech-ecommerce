// components/admin/products/columns.ts
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"

export const productColumns = [
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
