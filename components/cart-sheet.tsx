"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";

export function CartSheet() {
  const { 
    items, 
    isOpen, 
    openCart, 
    closeCart, 
    removeItem, 
    updateItemQuantity, 
    getTotalItems, 
    getTotalPrice 
  } = useCartStore();

  // Sync cart state dengan UI Sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tutup cart saat Escape ditekan
      if (e.key === 'Escape') {
        closeCart();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeCart]);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative" 
          onClick={() => openCart()}
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Keranjang Belanja ({totalItems})
          </SheetTitle>
        </SheetHeader>
        
        {items.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto py-6">
              <ul className="space-y-5 mb-6">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                          <ShoppingCart className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{formatPrice(item.price)}</span>
                      </div>
                      <div className="flex items-center space-x-4 pt-1">
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none rounded-l"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Kurangi jumlah</span>
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-none rounded-r"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Tambah jumlah</span>
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Hapus item</span>
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="space-y-3 pt-6">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pengiriman</span>
                  <span className="text-muted-foreground">Dihitung di checkout</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pajak</span>
                  <span className="text-muted-foreground">Dihitung di checkout</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Estimasi</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
            <SheetFooter className="pt-2">
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout" onClick={() => closeCart()}>
                  Lanjut ke Checkout
                </Link>
              </Button>
            </SheetFooter>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
            <div className="relative h-24 w-24 text-muted-foreground">
              <ShoppingCart className="h-24 w-24" strokeWidth={1} />
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-semibold">
                0
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium">Keranjang Anda kosong</h3>
              <p className="text-muted-foreground">
                Ayo tambahkan produk ke keranjang Anda.
              </p>
            </div>
            <Button asChild>
              <Link href="/products" onClick={() => closeCart()}>
                Lihat Produk
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}