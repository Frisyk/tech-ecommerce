import { SiteHeader } from "@/components/site-header"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Data FAQ
const faqs = [
  {
    question: "Berapa lama waktu pengiriman?",
    answer:
      "Waktu pengiriman umumnya 2-5 hari kerja untuk wilayah Jabodetabek dan 5-7 hari kerja untuk wilayah lainnya di Indonesia. Waktu pengiriman dapat bervariasi tergantung lokasi dan kondisi logistik.",
  },
  {
    question: "Bagaimana kebijakan pengembalian LuxeMarket?",
    answer:
      "Kami menerima pengembalian produk dalam waktu 30 hari setelah pembelian dengan kondisi produk masih dalam keadaan sempurna dan belum digunakan. Untuk memulai pengembalian, Anda perlu menghubungi tim layanan pelanggan kami melalui email atau telepon.",
  },
  {
    question: "Apakah semua produk memiliki garansi?",
    answer:
      "Ya, semua produk yang dijual di LuxeMarket memiliki garansi minimum 1 tahun terhitung dari tanggal pembelian. Beberapa produk mungkin memiliki periode garansi lebih lama tergantung kebijakan produsen.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima berbagai metode pembayaran termasuk kartu kredit/debit, transfer bank, e-wallet seperti GoPay, OVO, dan DANA, serta pembayaran melalui virtual account.",
  },
  {
    question: "Bisakah saya mengubah pesanan setelah melakukan pembayaran?",
    answer:
      "Perubahan pesanan hanya bisa dilakukan dalam waktu 1 jam setelah pembayaran. Setelah itu, pesanan akan diproses dan tidak dapat diubah. Harap hubungi layanan pelanggan kami segera jika Anda ingin mengubah pesanan.",
  },
  {
    question: "Apakah ada program loyalitas untuk pelanggan?",
    answer:
      "Ya, kami memiliki program LuxeRewards di mana Anda bisa mengumpulkan poin dari setiap pembelian. Poin-poin ini bisa ditukarkan dengan diskon atau produk eksklusif. Anda secara otomatis menjadi anggota LuxeRewards saat mendaftar akun di situs kami.",
  },
  {
    question: "Bagaimana cara melacak pesanan saya?",
    answer:
      "Anda bisa melacak pesanan melalui halaman 'Pesanan Saya' di akun Anda. Kami juga akan mengirimkan email dan notifikasi dengan informasi nomor resi dan tautan untuk melacak paket Anda saat pesanan dikirim.",
  },
  {
    question: "Bagaimana jika produk yang saya terima rusak?",
    answer:
      "Jika Anda menerima produk rusak, harap hubungi tim layanan pelanggan kami dalam waktu 48 jam setelah penerimaan barang dengan foto produk yang rusak. Kami akan mengatur penggantian atau pengembalian dana sesuai dengan kasus Anda.",
  },
  {
    question: "Apakah LuxeMarket mengirim ke luar negeri?",
    answer:
      "Saat ini kami hanya melayani pengiriman ke seluruh wilayah Indonesia. Kami sedang mengembangkan layanan pengiriman internasional yang akan tersedia dalam waktu dekat.",
  },
  {
    question: "Bagaimana cara menjadi mitra bisnis/supplier LuxeMarket?",
    answer:
      "Untuk menjadi mitra bisnis atau supplier, silakan kirimkan proposal bisnis ke partner@luxemarket.com dengan detail produk, portofolio, dan informasi kontak. Tim kami akan meninjau proposal Anda dan menghubungi jika ada kecocokan.",
  },
]

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Pertanyaan yang Sering Diajukan
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Temukan jawaban untuk pertanyaan umum tentang layanan dan produk LuxeMarket
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Masih Memiliki Pertanyaan?</h2>
            <p className="text-muted-foreground mb-6">
              Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
              >
                Hubungi Kami
              </a>
              <a
                href="mailto:info@luxemarket.com"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
              >
                Email Dukungan
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  )
} 