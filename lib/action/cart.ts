// app/actions/cart.ts
"use server"; // Tandai sebagai Server Actions

import { createServerSupabaseClient } from "../supabase-server"
import type { Database } from "@/lib/database.types"; // Sesuaikan path jika perlu
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache"; // Jika diperlukan setelah modifikasi
import { cookies } from "next/headers";

// Definisikan tipe data yang akan dikembalikan (pastikan serializable)
// Sesuaikan ini dengan struktur relasi Anda (products, product_images)
// Ambil dari database.types jika sudah digenerate
export type CartItemWithProduct = Database['public']['Tables']['cart_items']['Row'] & {
    product: (Database['public']['Tables']['products']['Row'] & {
        images: Database['public']['Tables']['product_images']['Row'][] | null;
    }) | null; // Produk bisa saja null jika terhapus
};

export type CartDataResult = {
    cartId: string | null;
    items: CartItemWithProduct[];
    error?: string;
};

// Server Action untuk mendapatkan/membuat keranjang dan isinya
export async function getCartData(sessionIdFromClient: string | null): Promise<CartDataResult> {
    // Gunakan helper yang sesuai. ActionClient jika action lain akan memodifikasi cart.
    const supabase = await createServerSupabaseClient();
    // const supabase = createServerSupabaseClient(); // Jika hanya read

    let cartId: string | null = null;

    try {
        // 1. Dapatkan user saat ini dari sesi server
        const { data: { user } } = await supabase.auth.getUser();

        // 2. Cari atau buat keranjang (cart)
        if (user?.id) {
            // Pengguna login: cari berdasarkan user_id
            const { data: existingCart, error: findUserCartError } = await supabase
                .from("carts")
                .select("id")
                .eq("user_id", user.id)
                .maybeSingle();

            if (findUserCartError) throw findUserCartError;

            if (existingCart) {
                cartId = existingCart.id;
            } else {
                // Buat keranjang baru untuk pengguna
                const { data: newCart, error: createUserCartError } = await supabase
                    .from("carts")
                    .insert({ user_id: user.id })
                    .select("id")
                    .single(); // error jika gagal insert

                if (createUserCartError) throw createUserCartError;
                if (!newCart) throw new Error("Gagal membuat keranjang untuk pengguna.");
                cartId = newCart.id;
            }
        } else if (sessionIdFromClient) {
            // Pengguna anonim: cari berdasarkan session_id dari klien
            const { data: existingCart, error: findSessionCartError } = await supabase
                .from("carts")
                .select("id")
                .eq("session_id", sessionIdFromClient)
                .maybeSingle();

            if (findSessionCartError) throw findSessionCartError;

            if (existingCart) {
                cartId = existingCart.id;
            } else {
                // Buat keranjang baru untuk sesi anonim
                const { data: newCart, error: createSessionCartError } = await supabase
                    .from("carts")
                    .insert({ session_id: sessionIdFromClient })
                    .select("id")
                    .single();

                if (createSessionCartError) throw createSessionCartError;
                if (!newCart) throw new Error("Gagal membuat keranjang untuk sesi.");
                cartId = newCart.id;
            }
        } else {
            // Tidak ada user & tidak ada ID sesi, kembalikan keranjang kosong
            console.log("Tidak ada user atau session ID untuk getCartData.");
            return { cartId: null, items: [] };
        }

        // 3. Ambil item keranjang jika cartId ditemukan
        if (cartId) {
            const { data: itemsData, error: itemsError } = await supabase
                .from("cart_items")
                .select(`
                    id,
                    product_id,
                    quantity,
                    product:products (
                        name,
                        price,
                        images:product_images (
                            url,
                            alt
                        )
                    )
                `)
                .eq("cart_id", cartId);

            if (itemsError) throw itemsError;

            // Pastikan tipe data sesuai, tangani jika product atau images bisa null
            const typedItems = (itemsData || []) as unknown as CartItemWithProduct[];

            return { cartId, items: typedItems };
        } else {
            // Seharusnya tidak terjadi jika user atau sesi valid, tapi sebagai fallback
            return { cartId: null, items: [] };
        }

    } catch (error: any) {
        console.error("Error dalam getCartData action:", error);
        return { cartId: null, items: [], error: error.message || "Gagal mengambil data keranjang." };
    }
}

// Server Action untuk menghapus item dari keranjang
export async function removeItemFromCart(itemId: string): Promise<{ success: boolean, error?: string }> {
     const supabase = await createServerSupabaseClient();
     // Optional: Tambahkan validasi di sini untuk memastikan pengguna
     //           hanya bisa menghapus item dari keranjangnya sendiri.
     try {
         console.log(`Mencoba menghapus item: ${itemId}`);
         const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
         if (error) {
             console.error("Supabase delete error:", error);
             throw error;
         }
         // Revalidate path keranjang atau halaman terkait jika perlu
         // revalidatePath('/cart'); // Contoh
         console.log(`Item ${itemId} berhasil dihapus`);
         return { success: true };
     } catch(error: any) {
          console.error("Error dalam action removeItemFromCart:", error);
          return { success: false, error: error.message || "Gagal menghapus item." };
     }
}

export async function addItemToCart(
    productId: string,
    quantity: number
): Promise<{ success: boolean, error?: string }> {

    // Validasi input dasar
    if (!productId || quantity <= 0) {
        return { success: false, error: "ID Produk atau kuantitas tidak valid." };
    }

    // Gunakan ActionClient karena kita akan mengubah data (insert/update)
    const supabase = await createServerSupabaseClient();
    let cartId: string | null = null;
    let cookieStore = await cookies()// Baca cookie sesi anonim
    let cartSessionId = cookieStore.get("cartSessionId")?.value; // Baca cookie sesi anonim

    try {
        // 1. Dapatkan User
        const { data: { user } } = await supabase.auth.getUser();

        // 2. Cari atau Buat Keranjang (Logika sama seperti di getCartData)
        if (user?.id) {
            // Pengguna login
            const { data: existingCart, error: findUserCartError } = await supabase
                .from("carts").select("id").eq("user_id", user.id).maybeSingle();
            if (findUserCartError) throw findUserCartError;
            if (existingCart) {
                cartId = existingCart.id;
            } else {
                const { data: newCart, error: createUserCartError } = await supabase
                    .from("carts").insert({ user_id: user.id }).select("id").single();
                if (createUserCartError) throw createUserCartError;
                if (!newCart) throw new Error("Gagal membuat keranjang user.");
                cartId = newCart.id;
            }
        } else {
            // Pengguna anonim
            if (cartSessionId) {
                const { data: existingCart, error: findSessionCartError } = await supabase
                    .from("carts").select("id").eq("session_id", cartSessionId).maybeSingle();
                if (findSessionCartError) throw findSessionCartError;
                cartId = existingCart?.id ?? null;
            }
            if (!cartId) {
                // Buat keranjang anonim baru jika tidak ditemukan atau tidak ada cookie
                cartSessionId = nanoid();
                const { data: newCart, error: createSessionCartError } = await supabase
                    .from("carts").insert({ session_id: cartSessionId }).select("id").single();
                if (createSessionCartError) throw createSessionCartError;
                if (!newCart) throw new Error("Gagal membuat keranjang sesi.");
                cartId = newCart.id;
                // Set cookie untuk request berikutnya
                try {
                    cookieStore.set("cartSessionId", cartSessionId, { path: "/", httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
                } catch (cookieError) { console.error("Gagal set cookie keranjang anonim:", cookieError); }
            }
        }

        // Jika setelah semua proses cartId masih null, ada masalah
        if (!cartId) {
            throw new Error("Tidak bisa menentukan ID keranjang.");
        }

        // 3. Cek Item yang Sudah Ada & Tambah/Update
        const { data: existingItem, error: itemError } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cartId)
            .eq('product_id', productId)
            .maybeSingle();

        if (itemError) throw itemError;

        if (existingItem) {
            // Item sudah ada -> Update kuantitas
            const newQuantity = existingItem.quantity + quantity;
            const { error: updateError } = await supabase
                .from('cart_items')
                .update({ quantity: newQuantity })
                .eq('id', existingItem.id);
            if (updateError) throw updateError;
            console.log(`Action: Kuantitas item ${productId} di cart ${cartId} diupdate menjadi ${newQuantity}`);
        } else {
            // Item belum ada -> Insert item baru
            const { error: insertError } = await supabase
                .from('cart_items')
                .insert({ cart_id: cartId, product_id: productId, quantity: quantity });
            if (insertError) throw insertError;
            console.log(`Action: Item ${productId} (qty ${quantity}) ditambahkan ke cart ${cartId}`);
        }

        // 4. Revalidate Path (Penting agar UI lain yang menampilkan data keranjang ikut update)
        revalidatePath('/'); // Contoh: Revalidate home jika ada counter keranjang
        revalidatePath('/cart'); // Contoh: Revalidate halaman keranjang khusus

        return { success: true };

    } catch (error: any) {
        console.error("Error dalam action addItemToCart:", error);
        return { success: false, error: error.message || "Gagal menambahkan item ke keranjang." };
    }
}