'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ShoppingBag, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { useCartStore } from '@/store/cart-store'

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const { items } = useCartStore()
  
  // Redirect ke halaman produk jika langsung akses halaman ini
  useEffect(() => {
    // Jika ada item di keranjang, artinya user langsung akses halaman ini
    // tanpa melalui proses checkout
    if (items.length > 0) {
      router.push('/checkout')
    }
  }, [items, router])
  
  return (
    <>
      <SiteHeader user={null} />
      <main className="container max-w-3xl py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6">
            <CheckCircle2 className="h-24 w-24 text-primary" />
          </div>
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">Pesanan Berhasil!</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Terima kasih atas pesanan Anda. Kami telah mengirimkan email konfirmasi 
            dengan rincian pesanan. Anda juga dapat melihat status pesanan di halaman akun Anda.
          </p>
          
          <div className="mb-12 w-full max-w-md rounded-lg border bg-card p-6">
            <h3 className="mb-4 text-xl font-semibold">Pesanan #2023-0001</h3>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal Pesanan</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Pesanan</span>
                <span className="font-medium text-primary">Diproses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status Pembayaran</span>
                <span className="font-medium text-primary">Dibayar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimasi Pengiriman</span>
                <span>3-5 hari kerja</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/account/orders">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Lihat Pesanan Saya
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/products">
                Lanjut Berbelanja
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  )
} 