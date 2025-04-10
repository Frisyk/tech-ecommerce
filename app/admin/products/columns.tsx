// components/admin/products/columns.ts
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react"; // <-- Import useState
import { useRouter } from "next/navigation"; // <-- Import untuk refresh jika perlu
import { type ColumnDef } from "@tanstack/react-table"; // <-- Import tipe ColumnDef
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // <-- Import useToast
import {
  AlertDialog, // <-- Import AlertDialog
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react"; // <-- Import Loader
import { formatPrice } from "@/lib/utils";
import { deleteProduct } from "@/lib/action/products"; // Server action Anda

// --- Definisi Tipe Data (Sudah benar dari sebelumnya) ---
interface ProductImage {
  url: string;
  position: number;
  // tambahkan properti lain jika ada (alt, id, dll)
}
interface Category {
  name: string;
  // tambahkan properti lain jika ada
}
export interface ProductWithCategoryAndImages {
  id: string;
  name: string;
  price: number;
  inventory_quantity: number;
  is_active: boolean;
  category: Category | null; // Kategori bisa null
  product_images: ProductImage[] | null; // Gambar bisa null atau array kosong
  created_at: string;
  // tambahkan properti produk lain jika ada
}
// --- Akhir Definisi Tipe Data ---


// --- Definisi Kolom ---
// Gunakan tipe ColumnDef<ProductWithCategoryAndImages> untuk type safety
export const productColumns: ColumnDef<ProductWithCategoryAndImages>[] = [
  // Kolom Gambar
  {
    id: "image",
    header: "Image",
    cell: ({ row }) => {
      const images = row.original.product_images;
      const primaryImage =
        images?.find((img) => img.position === 0) || images?.[0];
      const imageUrl = primaryImage?.url;

      return (
        <div className="w-16 h-16 flex items-center justify-center bg-muted rounded overflow-hidden border"> {/* Tambah border */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Image for ${row.original.name}`}
              width={64}
              height={64}
              className="object-contain h-full w-full"
              priority={false}
              unoptimized={imageUrl.endsWith('.svg')} // Tambahkan jika Anda punya placeholder svg
              onError={(e) => {
                e.currentTarget.src = "/placeholder.png"; // Pastikan placeholder ada di public
                e.currentTarget.srcset = "";
              }}
            />
          ) : (
            <span className="text-xs text-muted-foreground px-1 text-center">
              No Image
            </span>
          )}
        </div>
      );
    },
    // Nonaktifkan sorting/filtering untuk kolom gambar jika tidak relevan
    enableSorting: false,
    enableHiding: false,
  },
  // Kolom Nama
  {
    accessorKey: "name",
    header: "Name",
    // Anda bisa menambahkan filter di sini jika DataTable mendukungnya
  },
  // Kolom Kategori
  {
    accessorFn: (row) => row.category?.name ?? "N/A",
    header: "Category",
    id: "categoryName",
  },
  // Kolom Harga
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => formatPrice(row.original.price),
    // Mungkin ingin menambahkan sorting berdasarkan harga
  },
  // Kolom Inventaris
  {
    accessorKey: "inventory_quantity",
    header: "Inventory",
  },
  // Kolom Status
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${ // Perbaikan style dari Shadcn
          row.original.is_active
            ? "border-transparent bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" // Lebih sesuai tema
            : "border-transparent bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"     // Lebih sesuai tema
        }`}
      >
        {row.original.is_active ? "Active" : "Inactive"}
      </div>
    ),
    // Mungkin ingin filter berdasarkan status
  },
  // Kolom Aksi (Edit, Delete)
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>, // Header untuk kolom aksi
    cell: ({ row }) => {
      const product = row.original;
      const [isDeleting, setIsDeleting] = useState(false); // State loading per baris
      const { toast } = useToast();
      const router = useRouter(); // Untuk refresh jika revalidatePath tidak cukup cepat

      // Handler untuk proses delete
      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          const success = await deleteProduct(product.id); // Panggil server action

          if (success) {
            toast({
              title: "Success",
              description: `Product "${product.name}" deleted successfully.`,
            });
            // Server action `deleteProduct` seharusnya sudah memanggil `revalidatePath`.
            // Jika perlu refresh client-side segera: router.refresh();
          } else {
            // Ini mungkin tidak akan tercapai jika action melempar error
             throw new Error("The delete operation failed silently.");
          }
        } catch (error: any) {
          console.error("Failed to delete product:", error);
          toast({
            title: "Error",
            description: `Failed to delete product: ${error.message || "Unknown error"}`,
            variant: "destructive",
          });
           // Set state loading false di sini agar tombol tidak stuck jika error
           setIsDeleting(false);
        }
        // State loading akan otomatis hilang jika baris dihapus (karena re-render),
        // tapi set false di error case penting.
      };

      return (
        <div className="flex items-center justify-end gap-2"> {/* Rata kanan */}
          {/* Tombol Edit */}
          <Button variant="ghost" size="sm" asChild disabled={isDeleting}>
            <Link href={`/admin/products/${product.id}`}>Edit</Link>
          </Button>

          {/* Tombol Delete dengan Dialog Konfirmasi */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                aria-label={`Delete product ${product.name}`} // Aksesibilitas
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product
                  <strong className="mx-1">{product.name}</strong>
                  and all its associated data (including images).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async (e) => {
                    // Mencegah dialog langsung tertutup jika error cepat
                    e.preventDefault();
                    await handleDelete();
                    // Dialog akan tertutup otomatis jika tidak ada error DAN
                    // state isDeleting kembali ke false (meskipun barisnya mungkin sudah hilang)
                  }}
                  disabled={isDeleting}
                  // ClassName opsional untuk styling tombol konfirmasi delete
                  // className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Yes, delete product"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];