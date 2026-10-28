"use client"

import Script from "next/script"
import { useSite } from "@/components/providers"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// GA4 em paralelo à medição própria (como pede o documento), só depois do aceite de cookies (LGPD).
export function GoogleAnalytics() {
  const { consent } = useSite()
  if (!GA_ID || consent !== "all") return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
      </Script>
    </>
  )
}
