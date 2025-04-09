'use client'

import { create } from 'zustand'

// Tipe data untuk produk
export interface Product {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number
  description?: string
  category_id?: string
  category?: {
    id: string
    name: string
    slug: string
  }
  images?: {
    id: string
    url: string
    alt?: string
  }[]
  inventory_quantity?: number
  is_featured?: boolean
  is_active?: boolean
}

// Tipe data untuk filter produk
interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  searchQuery?: string
}

// Tipe data untuk state produk
interface ProductState {
  products: Product[]
  featuredProducts: Product[]
  singleProduct: Product | null
  isLoading: boolean
  error: string | null
  filters: ProductFilters
  
  // Action untuk update state
  setProducts: (products: Product[]) => void
  setFeaturedProducts: (products: Product[]) => void
  setSingleProduct: (product: Product | null) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  
  // Action untuk filter
  setFilters: (filters: Partial<ProductFilters>) => void
  resetFilters: () => void
  
  // Computed properties
  getFilteredProducts: () => Product[]
}

// Default filter values
const DEFAULT_FILTERS: ProductFilters = {
  category: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  sortBy: 'newest',
  searchQuery: '',
}

// Store untuk produk
export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  featuredProducts: [],
  singleProduct: null,
  isLoading: false,
  error: null,
  filters: { ...DEFAULT_FILTERS },
  
  // Set semua produk
  setProducts: (products: Product[]) => set({ products }),
  
  // Set produk featured
  setFeaturedProducts: (products: Product[]) => set({ featuredProducts: products }),
  
  // Set produk tunggal (detail produk)
  setSingleProduct: (product: Product | null) => set({ singleProduct: product }),
  
  // Set status loading
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  
  // Set error message
  setError: (error: string | null) => set({ error }),
  
  // Update filter
  setFilters: (filters: Partial<ProductFilters>) => 
    set(state => ({ 
      filters: { ...state.filters, ...filters } 
    })),
  
  // Reset filter ke default
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  
  // Dapatkan produk yang telah difilter
  getFilteredProducts: () => {
    const { products, filters } = get()
    
    return products
      .filter(product => {
        // Filter berdasarkan kategori
        if (filters.category && product.category?.slug !== filters.category) {
          return false
        }
        
        // Filter berdasarkan harga minimum
        if (filters.minPrice && product.price < filters.minPrice) {
          return false
        }
        
        // Filter berdasarkan harga maksimum
        if (filters.maxPrice && product.price > filters.maxPrice) {
          return false
        }
        
        // Filter berdasarkan pencarian
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase()
          return (
            product.name.toLowerCase().includes(query) || 
            product.description?.toLowerCase().includes(query) ||
            false
          )
        }
        
        return true
      })
      .sort((a, b) => {
        // Urutkan produk berdasarkan filter sort
        switch (filters.sortBy) {
          case 'price-asc':
            return a.price - b.price
          case 'price-desc':
            return b.price - a.price
          case 'name-asc':
            return a.name.localeCompare(b.name)
          case 'name-desc':
            return b.name.localeCompare(a.name)
          case 'newest':
          default:
            // Disini kita tidak memiliki created_at di interface,
            // jadi fallback ke pengurutan berdasarkan ID (mungkin tidak ideal)
            return b.id.localeCompare(a.id)
        }
      })
  },
})) 