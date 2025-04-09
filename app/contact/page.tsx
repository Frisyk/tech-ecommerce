import { SiteHeader } from "@/components/site-header";
import { Mail, Phone, MapPin } from "lucide-react";
// import { ContactForm } from "@/components/contact"; // Uncomment jika komponen contact.tsx mengekspor ContactForm

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-12 md:py-16 lg:py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Hubungi Kami
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Kami siap membantu Anda. Jangan ragu untuk menghubungi kami melalui detail di bawah ini atau kirimkan pesan kepada kami.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-16">
          {/* Informasi Kontak */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Informasi Kontak</h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="flex items-start">
                <MapPin className="mr-3 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Alamat Kami</h3>
                  <p>Jl. Contoh No. 123, Kota Contoh, Kode Pos 12345</p> 
                  <p>Indonesia</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="mr-3 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Telepon</h3>
                  <p>(+62) 123-456-7890</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="mr-3 h-6 w-6 flex-shrink-0 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <a href="mailto:info@luxemarket.com" className="hover:text-primary hover:underline">
                    info@luxemarket.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder untuk Form Kontak */}
          <div className="space-y-6">
             <h2 className="text-3xl font-bold tracking-tight">Kirim Pesan</h2>
             <p className="text-muted-foreground">
               Gunakan formulir di bawah ini untuk mengirimkan pertanyaan atau masukan Anda kepada kami.
             </p>
            {/* 
              Jika komponen Anda siap, uncomment baris di bawah:
              <ContactForm /> 
            */}
            <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
              Formulir kontak akan ditampilkan di sini.
              {/* Anda bisa mengimpor dan merender komponen <ContactForm /> di sini */} 
            </div>
          </div>
        </div>
      </main>
      {/* Footer bisa ditambahkan di sini */}
    </>
  );
} 