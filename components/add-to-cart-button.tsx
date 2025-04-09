"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2, Minus, Plus } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCartStore, CartProduct } from "@/store/cart-store";

// Tipe produk dasar
interface BasicProduct {
    id: string;
    name: string;
    price: number;
    image?: string;
    [key: string]: any;
}

interface AddToCartButtonProps {
    product: BasicProduct;
    quantity?: number;
}

export function AddToCartButton({ product, quantity: initialQuantity = 1 }: AddToCartButtonProps) {
    const [isAdded, setIsAdded] = useState(false);
    const [quantity, setQuantity] = useState(initialQuantity);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    // Gunakan Zustand store untuk keranjang
    const { addItem, openCart } = useCartStore();

    // Fungsi untuk menangani perubahan jumlah
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    // Handler untuk memanggil action keranjang
    const handleAddToCart = () => {
        setIsLoading(true);
        
        try {
            // Transformasi produk ke format CartProduct
            const cartProduct: CartProduct = {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.images?.[0]?.url || product.image
            };
            
            // Tambahkan ke keranjang menggunakan Zustand store
            addItem(cartProduct);
            
            // Tampilkan toast sukses
            toast({
                title: "Ditambahkan ke keranjang",
                description: `${quantity} × ${product.name} telah ditambahkan ke keranjang Anda.`,
            });
            
            // Tampilkan checkmark
            setIsAdded(true);
            
            // Buka panel keranjang (opsional)
            // openCart();
            
            // Reset checkmark setelah 2 detik
            setTimeout(() => {
                setIsAdded(false);
                setIsLoading(false);
            }, 2000);
        } catch (error) {
            console.error('Error menambahkan ke keranjang:', error);
            toast({
                title: "Error",
                description: "Tidak dapat menambahkan item ke keranjang. Silakan coba lagi.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-md">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={decreaseQuantity} 
                        disabled={quantity <= 1 || isLoading || isAdded}
                        className="h-10 w-10 rounded-none rounded-l-md"
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <div className="w-12 text-center">
                        <span>{quantity}</span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={increaseQuantity} 
                        disabled={isLoading || isAdded}
                        className="h-10 w-10 rounded-none rounded-r-md"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                
                <Button
                    onClick={handleAddToCart}
                    disabled={isLoading || isAdded}
                    className="flex-1"
                    size="lg"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Menambahkan...
                        </span>
                    ) : isAdded ? (
                        <span className="flex items-center justify-center">
                            <Check className="mr-2 h-4 w-4" />
                            Ditambahkan!
                        </span>
                    ) : (
                        <span className="flex items-center justify-center">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Tambah ke Keranjang
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}