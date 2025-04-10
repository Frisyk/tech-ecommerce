// app/admin/categories/columns.tsx
"use client"; // <-- Tandai sebagai Client Component

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { type ColumnDef } from "@tanstack/react-table"; // <-- Import tipe jika menggunakan TanStack Table

// Definisikan tipe data untuk kategori (sesuaikan dengan struktur data Anda)
// Ini adalah struktur data SETELAH Anda menghitung product_count
export interface CategoryWithProductCount {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product_count: number; // Hasil perhitungan
}

// Gunakan ColumnDef untuk type safety yang lebih baik jika Anda menggunakan TanStack Table
export const categoryColumns: ColumnDef<CategoryWithProductCount>[] = [
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
    header: "Products", // Header untuk jumlah produk
  },
  {
    id: "actions",
    cell: ({ row }) => { // <-- Fungsi cell sekarang aman di dalam Client Component
      const category = row.original; // Akses data asli baris
      return (
        <div className="flex items-center gap-2">
          <Link href={`/admin/categories/${category.id}`}>
            <Button variant="ghost" size="sm">
              Edit
            </Button>
          </Link>
           {/* Anda bisa menambahkan tombol delete di sini jika perlu */}
          {/* <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              // Panggil fungsi delete (misalnya dari context atau prop)
              console.log("Delete category:", category.id);
            }}
          >
            Delete
          </Button> */}
        </div>
      );
    },
  },
];