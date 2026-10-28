import { ImageResponse } from "next/og"

export const alt = "Targa Motors — seminovos premium em Uberlândia-MG"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Imagem de compartilhamento (WhatsApp, Instagram, Google): preto e branco, como a marca.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "radial-gradient(ellipse at 70% 20%, #2a2a2a 0%, #0a0a0a 60%)",
          color: "#f5f5f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, letterSpacing: 26, fontWeight: 600 }}>TARGA</div>
          <div style={{ fontSize: 26, letterSpacing: 14, marginTop: 4, color: "#bdbdbd" }}>MOTORS</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 60, fontWeight: 600, lineHeight: 1.05 }}>Seminovos premium em Uberlândia</div>
          <div style={{ fontSize: 28, marginTop: 20, color: "#bdbdbd" }}>Rua das Papoulas, 60 · Cidade Jardim · (34) 3231-9191</div>
        </div>
      </div>
    ),
    size,
  )
}
