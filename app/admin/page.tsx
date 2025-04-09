"use server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { formatPrice } from "@/lib/utils"
import { BarChart, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { SiteHeader } from "@/components/site-header"

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()
  
  // Cek apakah pengguna sudah login dan admin
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/login")
  }

  
  // Verifikasi apakah pengguna memiliki role admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single()
  
  if (profileError || !profile || !profile.is_admin) {
    redirect("/") // Redirect non-admin ke halaman utama
  }

  // Fetch dashboard stats - menggunakan 'count' pada response
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })

  const { count: customerCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_admin", false)

  // Ambil data pesanan terbaru
  const { data: recentOrders = [] } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      profiles (
        first_name,
        last_name,
        email
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate total revenue
  const { data: revenue = [] } = await supabase
    .from("orders")
    .select("total_amount")
    .eq("payment_status", "paid")

  const totalRevenue = revenue?.reduce((sum: number, order: any) => sum + order.total_amount, 0) || 0

  return (
    <>
       
      <div className="container py-10">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Admin</h2>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
              <TabsTrigger value="analytics">Analitik</TabsTrigger>
              <TabsTrigger value="reports">Laporan</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">+20.1% dari bulan lalu</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pesanan</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{orderCount || 0}</div>
                    <p className="text-xs text-muted-foreground">+12.2% dari bulan lalu</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Produk</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{productCount || 0}</div>
                    <p className="text-xs text-muted-foreground">+5 produk baru bulan ini</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pelanggan</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{customerCount || 0}</div>
                    <p className="text-xs text-muted-foreground">+7.4% dari bulan lalu</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Ikhtisar</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      <BarChart className="h-16 w-16" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Pesanan Terbaru</CardTitle>
                    <CardDescription>{recentOrders?.length || 0} pesanan terbaru</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {recentOrders?.map((order: any) => (
                        <div key={order.id} className="flex items-center">
                          <div className="ml-4 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {order.profiles?.first_name || ""} {order.profiles?.last_name || "Pelanggan"}
                            </p>
                            <p className="text-sm text-muted-foreground">{formatPrice(order.total_amount)}</p>
                          </div>
                          <div className="ml-auto font-medium">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                            >
                              {order.status === "completed" 
                                ? "Selesai" 
                                : order.status === "processing" 
                                  ? "Diproses" 
                                  : "Menunggu"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="h-[400px] flex items-center justify-center text-muted-foreground">
              Konten analitik akan tersedia segera
            </TabsContent>
            <TabsContent value="reports" className="h-[400px] flex items-center justify-center text-muted-foreground">
              Konten laporan akan tersedia segera
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
