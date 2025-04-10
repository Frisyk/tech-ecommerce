import { SiteHeader } from "@/components/site-header";
import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      <main className="container py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Tentang LuxeMarket
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Selamat datang di LuxeMarket, destinasi utama Anda untuk produk-produk premium yang dikurasi dengan cermat untuk meningkatkan gaya hidup Anda.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          <Image
            src="/placeholder.svg?width=1200&height=600" // Ganti dengan gambar banner yang relevan
            alt="Tim LuxeMarket atau suasana toko"
            width={1200}
            height={600}
            className="rounded-lg object-cover shadow-lg"
          />
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:gap-x-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Misi Kami</h2>
            <p className="mt-4 text-muted-foreground">
              Misi kami adalah memberikan pengalaman belanja online yang luar biasa dengan menawarkan koleksi produk berkualitas tinggi yang dipilih secara eksklusif, mulai dari fashion terbaru hingga gadget inovatif dan dekorasi rumah yang elegan. Kami percaya bahwa kemewahan harus dapat diakses, dan kami berusaha untuk menghadirkan produk terbaik dari seluruh dunia langsung ke depan pintu Anda.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Nilai Kami</h2>
            <ul className="mt-4 space-y-2 text-muted-foreground list-disc list-inside">
              <li>Kualitas Tanpa Kompromi</li>
              <li>Pelayanan Pelanggan Prima</li>
              <li>Inovasi Berkelanjutan</li>
              <li>Kepercayaan dan Transparansi</li>
              <li>Pengalaman Belanja yang Memuaskan</li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Bergabunglah dengan Kami</h2>
          <p className="mt-4 text-muted-foreground">
            Jelajahi koleksi kami hari ini dan temukan mengapa LuxeMarket adalah pilihan utama bagi mereka yang menghargai kualitas, gaya, dan layanan yang tak tertandingi.
          </p>
        </div>
      </main>
      {/* Anda mungkin ingin menambahkan Footer di sini */}
    </>
  );
} 