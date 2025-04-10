import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { CartProduct } from '@/store/cart-store'

// Inisialisasi Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil'
})

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    const { items, customer } = body
    
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Keranjang belanja kosong' },
        { status: 400 }
      )
    }
    
    // Format items untuk Stripe
    const lineItems = items.map((item: CartProduct) => ({
      price_data: {
        currency: 'idr',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : []
        },
        unit_amount: Math.round(item.price * 100) // Stripe menerima harga dalam sen
      },
      quantity: item.quantity
    }))
    
    // Buat Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout`,
      metadata: {
        // Metadata tambahan jika perlu
        customer_email: customer?.email || ''
      }
    })
    
    // Kembalikan ID session untuk redirect ke Stripe Checkout
    return NextResponse.json({ id: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses pembayaran' },
      { status: 500 }
    )
  }
} 