import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85],
    remotePatterns: [
      // Fotos do estoque publicadas hoje pela AutoCerto (trocar pelos originais da Targa quando chegarem)
      { protocol: "https", hostname: "www.autocerto.com", pathname: "/fotos/3705/**" },
      // Imagens de apoio (Unsplash License: uso livre, hotlink é o uso recomendado pela Unsplash)
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
