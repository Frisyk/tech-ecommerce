'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, ShoppingCart, CreditCard, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SiteHeader } from '@/components/site-header'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { getStripe } from '@/lib/stripe'

// Komponen utama halaman checkout
export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  // Redirect ke halaman produk jika cart kosong
  useEffect(() => {
    if (items.length === 0) {
      router.push('/products')
    }
  }, [items, router])
  
  // State untuk form checkout
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    postal_code: '',
    phone: '',
    payment_method: 'card'
  })
  
  // Handler perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handler radio button payment method
  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      payment_method: value
    }))
  }
  
  // Handler untuk Stripe checkout
  const handleStripeCheckout = async () => {
    setLoading(true)
    
    try {
      // Validasi form
      if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.postal_code || !formData.phone) {
        toast({
          title: "Form tidak lengkap",
          description: "Harap isi semua field yang diperlukan",
          variant: "destructive"
        })
        setLoading(false)
        return
      }
      
      // Panggil API Stripe
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          customer: {
            name: formData.name,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postal_code,
            phone: formData.phone
          }
        }),
      })
      
      const { url, error } = await response.json()
      
      if (error) {
        throw new Error(error)
      }
      
      // Redirect ke halaman Stripe checkout
      if (url) {
        window.location.href = url
      } else {
        // Fallback to manual checkout for local development
        await new Promise(resolve => setTimeout(resolve, 2000))
        clearCart()
        router.push('/checkout/success')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        title: "Checkout gagal",
        description: "Terjadi kesalahan saat memproses pembayaran",
        variant: "destructive"
      })
      setLoading(false)
    }
  }
  
  // Handler submit checkout
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Gunakan Stripe untuk metode kartu
    if (formData.payment_method === 'card') {
      await handleStripeCheckout()
    } else {
      // Proses checkout manual untuk metode lain
      setLoading(true)
      try {
        // Simulasi proses checkout
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Redirect ke halaman sukses dan kosongkan cart
        clearCart()
        router.push('/checkout/success')
      } catch (error) {
        console.error('Checkout error:', error)
        toast({
          title: "Checkout gagal",
          description: "Terjadi kesalahan saat memproses pembayaran",
          variant: "destructive"
        })
        setLoading(false)
      }
    }
  }
  
  const totalPrice = getTotalPrice()
  
  // Kembalikan komponen kosong jika tidak ada item (akan di-redirect)
  if (items.length === 0) {
    return <div className="h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }
  
  return (
    <>
      <main className="container py-10 md:py-12">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali Berbelanja
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Form Checkout */}
          <div className="col-span-1 md:col-span-2">
            <form onSubmit={handleCheckout}>
              <Tabs defaultValue="customer" className="w-full">
                <TabsList className="mb-6 w-full">
                  <TabsTrigger value="customer" className="flex-1">Informasi Pelanggan</TabsTrigger>
                  <TabsTrigger value="payment" className="flex-1">Pembayaran</TabsTrigger>
                </TabsList>
                
                <TabsContent value="customer" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informasi Kontak</CardTitle>
                      <CardDescription>
                        Masukkan informasi kontak Anda untuk menerima konfirmasi pesanan.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Lengkap</Label>
                          <Input 
                            id="name" 
                            name="name" 
                            placeholder="Nama lengkap Anda"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email"
                            placeholder="Email Anda"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Nomor Telepon</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          placeholder="Nomor telepon Anda"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Alamat Pengiriman</CardTitle>
                      <CardDescription>
                        Masukkan alamat pengiriman untuk pesanan Anda.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Alamat</Label>
                        <Input 
                          id="address" 
                          name="address" 
                          placeholder="Alamat lengkap Anda"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="city">Kota</Label>
                          <Input 
                            id="city" 
                            name="city" 
                            placeholder="Kota Anda"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postal_code">Kode Pos</Label>
                          <Input 
                            id="postal_code" 
                            name="postal_code" 
                            placeholder="Kode pos Anda"
                            value={formData.postal_code}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="payment" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Metode Pembayaran</CardTitle>
                      <CardDescription>
                        Pilih metode pembayaran yang ingin Anda gunakan.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <RadioGroup 
                        defaultValue={formData.payment_method}
                        onValueChange={handlePaymentMethodChange}
                      >
                        <div className="flex items-center space-x-2 border rounded-md p-4">
                          <RadioGroupItem value="card" id="payment-card" />
                          <Label htmlFor="payment-card" className="flex items-center">
                            <CreditCard className="mr-2 h-5 w-5" />
                            Kartu Kredit / Debit (Stripe)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-4">
                          <RadioGroupItem value="bank_transfer" id="payment-transfer" />
                          <Label htmlFor="payment-transfer">Transfer Bank</Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-4">
                          <RadioGroupItem value="e_wallet" id="payment-ewallet" />
                          <Label htmlFor="payment-ewallet">E-Wallet</Label>
                        </div>
                      </RadioGroup>
                      
                      {formData.payment_method === 'card' && (
                        <div className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground">
                            Anda akan diarahkan ke halaman pembayaran Stripe yang aman setelah mengklik tombol "Bayar Sekarang".
                          </p>
                          <div className="flex items-center space-x-4 py-2">
                            <Image
                              src="/visa.svg"
                              alt="Visa"
                              width={40}
                              height={40}
                              className="h-8 w-auto object-contain"
                            />
                            <Image
                              src="/mastercard.svg"
                              alt="Mastercard"
                              width={40}
                              height={40}
                              className="h-8 w-auto object-contain"
                            />
                            <Image
                              src="/amex.svg"
                              alt="American Express"
                              width={40}
                              height={40}
                              className="h-8 w-auto object-contain"
                            />
                          </div>
                        </div>
                      )}
                      
                      {formData.payment_method === 'bank_transfer' && (
                        <div className="border rounded-md p-4 mt-4">
                          <p className="font-medium">Instruksi Transfer Bank:</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Setelah menyelesaikan checkout, Anda akan menerima instruksi 
                            transfer lengkap melalui email.
                          </p>
                        </div>
                      )}
                      
                      {formData.payment_method === 'e_wallet' && (
                        <div className="space-y-4 pt-4">
                          <p className="font-medium">Pilih E-Wallet:</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="border rounded-md p-3 text-center">OVO</div>
                            <div className="border rounded-md p-3 text-center">GOPAY</div>
                            <div className="border rounded-md p-3 text-center">DANA</div>
                            <div className="border rounded-md p-3 text-center">LinkAja</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memproses...
                          </span>
                        ) : (
                          <span>Bayar Sekarang {formatPrice(totalPrice)}</span>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </div>
          
          {/* Ringkasan Pesanan */}
          <div className="sticky top-24 col-span-1 h-fit">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary">
                            <ShoppingCart className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">{item.quantity} × {formatPrice(item.price)}</p>
                          <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pengiriman</span>
                    <span>Gratis</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak</span>
                    <span>{formatPrice(totalPrice * 0.1)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice + totalPrice * 0.1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
} 