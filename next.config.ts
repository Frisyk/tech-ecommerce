import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tmxfjuiwhnmfhlpxfcjp.supabase.co', // <-- Ganti dengan ID Project Supabase Anda
        port: '',
        pathname: '/storage/v1/object/public/**', // <-- Path umum untuk storage publik
      },
      // Tambahkan hostname lain jika perlu (misal localhost untuk pengembangan)
    ],
  },
};

export default nextConfig;
