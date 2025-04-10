// app/admin/categories/new/page.tsx
"use client"; // Tetap sebagai Client Component

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/utils"; // Tetap gunakan untuk preview slug di client
import { createCategory } from "@/lib/action/category"; // <-- Impor Server Action

export default function NewCategoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  // const supabase = await createServerSupabaseClient(); // <-- HAPUS INI

  const { toast } = useToast();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Update state form seperti biasa
    // Tetap generate slug di client untuk UX (preview)
    if (name === "name") {
        const autoSlug = generateSlug(value);
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          // Hanya update slug jika pengguna belum mengetik manual di slug
          slug: prev.slug === generateSlug(prev.name) ? autoSlug : prev.slug,
        }));
    } else if (name === "slug") {
         // Biarkan pengguna mengetik slug, tapi pastikan formatnya benar saat diubah
         setFormData((prev) => ({
            ...prev,
            slug: generateSlug(value) // Pastikan slug selalu dalam format yang benar
         }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Panggil Server Action dengan data dari state formData
      const result = await createCategory({
        name: formData.name,
        slug: formData.slug, // Kirim slug dari state (bisa manual atau auto)
        description: formData.description,
      });

      // Jika server action berhasil (tidak melempar error)
      if (result.success) {
        toast({
          title: "Category created",
          description: `Category "${formData.name}" created successfully.`,
        });
        router.push("/admin/categories"); // Arahkan ke daftar kategori
        // router.refresh(); // Bisa ditambahkan jika revalidatePath dirasa kurang cepat
      }
      // else {
      //   // Handle jika action mengembalikan { success: false } (opsional)
      //   throw new Error("Failed to create category for an unknown reason.");
      // }

    } catch (error: any) {
      // Tangkap error yang dilempar oleh Server Action
      console.error("Submit error:", error);
      toast({
        title: "Error creating category",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Return JSX (tidak banyak berubah, tambahkan disable saat loading) ---
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Category</h2>
        <p className="text-muted-foreground">
          Create a new category for your products
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading} // <-- Disable saat loading
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="category-slug"
              value={formData.slug}
              onChange={handleChange}
              required // Slug sebaiknya required
              disabled={isLoading} // <-- Disable saat loading
            />
            <p className="text-sm text-muted-foreground">
              Unique identifier for the URL. Auto-generated, but can be customized.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter category description (optional)"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              disabled={isLoading} // <-- Disable saat loading
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categories")}
            disabled={isLoading} // <-- Disable saat loading
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}