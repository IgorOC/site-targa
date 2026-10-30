// Tela de entrada (components/layout/page-intro.tsx): só na primeira página aberta na sessão.
// O script roda antes da página pintar e marca <html data-intro-done> quando a tela já foi vista.
export const INTRO_KEY = "targa-intro"

export const INTRO_SEEN_SCRIPT = `try{if(sessionStorage.getItem("${INTRO_KEY}"))document.documentElement.dataset.introDone="1"}catch(e){}`
