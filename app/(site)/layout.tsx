import { Footer } from "@/components/layout/footer"
import { CompareBar, CookieBanner, WhatsAppButton } from "@/components/layout/chrome"
import { Header } from "@/components/layout/header"
import { Providers } from "@/components/providers"
import { GoogleAnalytics } from "@/components/seo/google-analytics"
import { JsonLd } from "@/components/seo/json-ld"
import { dealerJsonLd, websiteJsonLd } from "@/lib/seo"
import { getDb } from "@/lib/store"

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const db = await getDb()
  return (
    <Providers content={db.content}>
      <JsonLd data={[dealerJsonLd(db.content), websiteJsonLd()]} />
      <div className="showroom">
        <div className="grain" aria-hidden />
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
        <CompareBar />
        <WhatsAppButton />
        <CookieBanner />
        <GoogleAnalytics />
      </div>
    </Providers>
  )
}
