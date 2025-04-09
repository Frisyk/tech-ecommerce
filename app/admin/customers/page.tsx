import Link from "next/link"

import { Button } from "@/components/ui/button"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { DataTable } from "@/components/admin/data-table"
import { getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default async function CustomersPage() {
    const supabase = await createServerSupabaseClient()

  const { data: customers } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      avatar_url,
      phone,
      created_at,
      email:auth.users!id(email)
    `)
    .eq("is_admin", false)
    .order("created_at", { ascending: false })

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: { row: any }) => {
        const profile = row.original
        const name =
          profile?.first_name && profile?.last_name
            ? `${profile.first_name} ${profile.last_name}`
            : profile?.email?.[0]?.email || "Unknown"

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile.avatar_url || ""} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div>{name}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: { row: any }) => {
        return <div>{row.original.email?.[0]?.email || "—"}</div>
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }: { row: any }) => {
        return <div>{row.getValue("phone") || "—"}</div>
      },
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }: { row: any }) => {
        const date = new Date(row.getValue("created_at"))
        return <div>{date.toLocaleDateString()}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/customers/${row.original.id}`}>
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
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
      </div>
      <div className="rounded-md border">
        <DataTable columns={columns} data={customers || []} />
      </div>
    </div>
  )
}
