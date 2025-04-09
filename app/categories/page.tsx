import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/site-header";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { error } from "console";

// Fungsi untuk mengambil data kategori
async function getCategories() {
  const supabase = await createServerSupabaseClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url") // Asumsi ada kolom description dan image_url
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    // Kembalikan array kosong atau handle error sesuai kebutuhan
    return []; 
  }
  return categories;
}

async function getProfile() {
  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase.auth.getUser()


  if (error) {
    console.error("Error fetching profile:", error);
    // Kembalikan array kosong atau handle error sesuai kebutuhan
    return []; 
  }
  return profile;
}

export default async function CategoriesPage() {
  const categories = await getCategories();
  const profile = await getProfile()
  return (
    <>
      <SiteHeader user={profile} />
      <main className="container py-12 md:py-16 lg:py-20">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Telusuri Kategori Produk
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Temukan produk berdasarkan kategori yang Anda minati.
          </p>
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`} // Arahkan ke halaman detail kategori (belum dibuat)
                className="group block rounded-lg border bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  <Image
                    // Ganti placeholder jika ada image_url
                    src={category.image_url || `/placeholder.svg?height=300&width=400&text=${category.name}`}
                    alt={category.name || "Category Image"}
                    width={400}
                    height={300}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold group-hover:text-primary">
                    {category.name}
                  </h3>
                  {category.description && (
                     <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {category.description}
                     </p>
                  )}
                  <span className="mt-2 inline-block text-sm font-medium text-primary group-hover:underline">
                    Lihat Produk
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Belum ada kategori yang tersedia.</p>
            {/* Anda bisa menambahkan tombol untuk kembali ke beranda */}
          </div>
        )}
      </main>
      {/* Footer bisa ditambahkan di sini */}
    </>
  );
} 