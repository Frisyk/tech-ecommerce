'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Tipe data untuk produk dalam keranjang
export interface CartProduct {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

// Tipe data untuk state keranjang
interface CartState {
  items: CartProduct[]
  isOpen: boolean

  // Actions
  addItem: (product: CartProduct) => void
  removeItem: (productId: string) => void
  updateItemQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  
  // Computed properties
  getTotalItems: () => number
  getTotalPrice: () => number
}

// Store untuk keranjang belanja
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      // Menambahkan item ke keranjang
      addItem: (product: CartProduct) => {
        const { items } = get()
        const existingItem = items.find(item => item.id === product.id)

        if (existingItem) {
          // Jika item sudah ada, update quantity
          const updatedItems = items.map(item => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + product.quantity }
              : item
          )
          set({ items: updatedItems })
        } else {
          // Jika item belum ada, tambahkan ke keranjang
          set({ items: [...items, product] })
        }
      },

      // Menghapus item dari keranjang
      removeItem: (productId: string) => {
        const { items } = get()
        set({ items: items.filter(item => item.id !== productId) })
      },

      // Update quantity item
      updateItemQuantity: (productId: string, quantity: number) => {
        const { items } = get()
        if (quantity <= 0) {
          // Jika quantity <= 0, hapus item
          set({ items: items.filter(item => item.id !== productId) })
        } else {
          // Update quantity
          set({
            items: items.map(item => 
              item.id === productId ? { ...item, quantity } : item
            )
          })
        }
      },

      // Mengosongkan keranjang
      clearCart: () => set({ items: [] }),

      // Toggle panel keranjang
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
      
      // Buka panel keranjang
      openCart: () => set({ isOpen: true }),
      
      // Tutup panel keranjang
      closeCart: () => set({ isOpen: false }),

      // Hitung total item di keranjang
      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      // Hitung total harga di keranjang
      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.price * item.quantity), 0)
      },
    }),
    {
      name: 'cart-storage', // Nama untuk localStorage
      storage: createJSONStorage(() => localStorage), // Gunakan localStorage
    }
  )
) 