import type { Metadata } from "next"
import { Inter, Sora } from "next/font/google"
import "./globals.css"
import { INTRO_SEEN_SCRIPT } from "@/lib/intro"
import { STORE } from "@/lib/seo"
import { SITE } from "@/lib/site"

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sora",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Targa Motors | Seminovos premium em Uberlândia-MG",
    template: "%s | Targa Motors Uberlândia",
  },
  description:
    "Loja de seminovos premium em Uberlândia-MG, no bairro Cidade Jardim. Porsche, Land Rover, Jeep, Toyota e mais, revisados e com procedência. Preço, km e atendimento pelo WhatsApp.",
  applicationName: SITE.name,
  keywords: STORE.keywords,
  alternates: { canonical: "/" },
  category: "automotive",
  formatDetection: { telephone: true, address: true },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE.name,
    url: "/",
    title: "Targa Motors | Seminovos premium em Uberlândia-MG",
    description: "Showroom de seminovos premium no bairro Cidade Jardim, em Uberlândia-MG.",
  },
  twitter: { card: "summary_large_image", title: "Targa Motors | Seminovos premium em Uberlândia-MG" },
  // Códigos de verificação do Google Search Console e do Bing Webmaster (variáveis de ambiente)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  other: {
    "geo.region": "BR-MG",
    "geo.placename": "Uberlândia",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-obsidian font-sans text-porcelain">
        <script dangerouslySetInnerHTML={{ __html: INTRO_SEEN_SCRIPT }} />
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-[22px] focus:bg-accent focus:px-4 focus:py-2 focus:text-obsidian"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  )
}
