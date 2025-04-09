'use client'
import { useCallback, useEffect, useState } from 'react'
import { type User } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

export default function AccountForm({ user, orders }: { user: User | null, orders: any[] }) {
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(false)
  const [fullName, setFullName] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [website, setWebsite] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profile, setProfile] = useState<any>(null)

  const getProfile = useCallback(async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select(`first_name, last_name, username, website, avatar_url`)
        .eq('id', user?.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
      } else if (data) {
        setFullName(`${data.first_name || ''} ${data.last_name || ''}`.trim())
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  const updateProfile = async () => {
    try {
      setLoading(true)
      
      const [firstName, lastName] = fullName ? fullName.split(' ', 2) : ['', '']

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName || null,
          last_name: lastName || null,
          username,
          website,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id)

      if (error) {
        throw error
      }
      
      alert('Profil berhasil diperbarui!')
    } catch (error) {
      alert('Error memperbarui profil!')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      getProfile()
    }
  }, [user, getProfile])

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Selesai</Badge>
      case 'processing':
        return <Badge className="bg-blue-500">Diproses</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Menunggu</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Dibatalkan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500">Dibayar</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">Menunggu</Badge>
      case 'failed':
        return <Badge variant="destructive">Gagal</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Akun Saya</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="orders">Riwayat Pesanan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Profil</CardTitle>
              <CardDescription>
                Perbarui informasi profil Anda di sini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="text" value={user?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName || ''}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username || ''}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={website || ''}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => getProfile()}>
                Reset
              </Button>
              <Button onClick={updateProfile} disabled={loading}>
                {loading ? 'Memperbarui...' : 'Simpan Perubahan'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pesanan</CardTitle>
              <CardDescription>
                Lihat dan lacak status pesanan Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders && orders.length > 0 ? (
                <Table>
                  <TableCaption>Daftar pesanan Anda.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Pesanan</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pembayaran</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.substring(0, 8)}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{formatPrice(order.total_amount)}</TableCell>
                        <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                        <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/account/orders/${order.id}`}>Detail</a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Anda belum memiliki pesanan.</p>
                  <Button className="mt-4" asChild>
                    <a href="/products">Mulai Belanja</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <form action="/auth/signout" method="post">
          <Button variant="outline" type="submit">
            Keluar
          </Button>
        </form>
      </div>
    </div>
  )
}