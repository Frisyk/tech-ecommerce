import Link from "next/link"

import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { formatPrice } from "@/lib/utils"
import { DataTable } from "@/components/admin/data-table"

export default async function OrdersPage() {
    const supabase = await createServerSupabaseClient()

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      payment_status,
      created_at,
      profiles (
        first_name,
        last_name,
        email:auth.users!id(email)
      )
    `)
    .order("created_at", { ascending: false })

  const columns = [
    {
      accessorKey: "id",
      header: "Order ID",
      cell: ({ row }: { row: any }) => <div className="font-medium">#{row.getValue("id").substring(0, 8)}</div>,
    },
    {
      accessorKey: "profiles.email",
      header: "Customer",
      cell: ({ row }: { row: any }) => {
        const profile = row.original.profiles
        const name =
          profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile?.email?.[0]?.email || "Guest"

        return <div>{name}</div>
      },
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }: { row: any }) => formatPrice(row.getValue("total_amount")),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => (
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            row.getValue("status") === "completed"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : row.getValue("status") === "processing"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}
        >
          {row.getValue("status")}
        </div>
      ),
    },
    {
      accessorKey: "payment_status",
      header: "Payment",
      cell: ({ row }: { row: any }) => (
        <div
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            row.getValue("payment_status") === "paid"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}
        >
          {row.getValue("payment_status")}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }: { row: any }) => {
        const date = new Date(row.getValue("created_at"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/orders/${row.original.id}`}>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
      </div>
      <div className="rounded-md border">
        <DataTable columns={columns} data={orders || []} />
      </div>
    </div>
  )
}
