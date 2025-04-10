// app/admin/categories/page.tsx
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/data-table"; // Pastikan path ini benar
import { getAllCategories } from "@/lib/action/category"; // Pastikan path ini benar
import { categoryColumns, type CategoryWithProductCount } from "./column"; // <-- Import kolom dan tipe

// Tipe data asli yang dikembalikan oleh getAllCategories (sebelum menghitung count)
// Sesuaikan ini dengan apa yang sebenarnya dikembalikan oleh action Anda
interface CategoryFromDB {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products?: Array<{ id: string }>; // Asumsi 'products' adalah relasi untuk menghitung
  // tambahkan field lain jika ada
}

export default async function CategoriesPage() {
  // 1. Ambil data di Server Component
  const categories: CategoryFromDB[] | null = await getAllCategories();

  // 2. Transformasi data (menghitung jumlah produk) di Server Component
  // Pastikan struktur data cocok dengan tipe CategoryWithProductCount yang digunakan di columns.ts
  const categoriesWithCount: CategoryWithProductCount[] = categories
    ? categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        product_count: category.products?.length || 0, // Hitung jumlah produk
      }))
    : []; // Kembalikan array kosong jika categories null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>
      <div className="rounded-md border">
        {/* 3. Gunakan DataTable (Client Component) dengan kolom yang diimpor dan data yang sudah ditransformasi */}
        <DataTable columns={categoryColumns} data={categoriesWithCount} />
      </div>
    </div>
  );
}