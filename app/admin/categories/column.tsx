// app/admin/categories/columns.tsx
"use client"; // <-- Tandai sebagai Client Component

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@tanstack/react-table"; // <-- Import tipe jika menggunakan TanStack Table
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";
import { deleteCategory } from "@/lib/action/category";
import { useState } from "react";
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
import { Loader2 } from "lucide-react";


// Definisikan tipe data untuk kategori (sesuaikan dengan struktur data Anda)
// Ini adalah struktur data SETELAH Anda menghitung category_count
export interface CategoryWithProductCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_count: number;
  image_url: string;
}

// Gunakan ColumnDef untuk type safety yang lebih baik jika Anda menggunakan TanStack Table
export const categoryColumns: ColumnDef<CategoryWithProductCount>[] = [
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const category = row.original;
      
      return (
        <div className="w-12 h-12 relative overflow-hidden rounded-md">
          {category.image_url ? (
            <Image 
              src={category.image_url} 
              alt={category.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
              No image
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => { // <-- Fungsi cell sekarang aman di dalam Client Component
      const description = row.getValue("description") as string | null; // Ambil nilai
      return (
        <div className="max-w-[300px] truncate" title={description ?? undefined}> {/* Tambahkan title untuk full text */}
          {description || "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "product_count",
    header: "categories", // Header untuk jumlah produk
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>, // Header untuk kolom aksi
    cell: ({ row }) => {
      const category = row.original;
      const [isDeleting, setIsDeleting] = useState(false); // State loading per baris
      const { toast } = useToast();
      // const router = useRouter(); // Untuk refresh jika revalidatePath tidak cukup cepat

      // Handler untuk proses delete
      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          const result = await deleteCategory(category.id); // Panggil server action
      
          if (result) {
            toast({
              title: "Success",
              description: `Category "${category.name}" deleted successfully.`,
            });
          } else {
            // Error dari server action (misalnya kategori punya produk)
            throw new Error("Unknown error from deleteCategory");
          }
        } catch (error: any) {
          console.error("Failed to delete category:", error);
          toast({
            title: "Error",
            description: `Failed to delete category: ${error.message || "Unknown error"}`,
            variant: "destructive",
          });
        } finally {
          setIsDeleting(false);
        }
      };
      

      return (
        <div className="flex items-center justify-end gap-2"> {/* Rata kanan */}
          {/* Tombol Edit */}
          <Button variant="ghost" size="sm" asChild disabled={isDeleting}>
            <Link href={`/admin/categorys/${category.id}`}>Edit</Link>
          </Button>

          {/* Tombol Delete dengan Dialog Konfirmasi */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                aria-label={`Delete category ${category.name}`} // Aksesibilitas
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
                  This action cannot be undone. This will permanently delete the category
                  <strong className="mx-1">{category.name}</strong>
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
                    "Yes, delete category"
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