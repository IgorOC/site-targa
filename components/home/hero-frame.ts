// Geometria compartilhada do hero: onde a foto de fundo fica na tela e, dentro dela, onde
// estava o carro. O carro 3D usa a mesma conta para se montar exatamente no lugar da foto.

export const PHOTO = { width: 1080, height: 609 }

// Retângulo do recorte do carro, em pixels da foto original
export const CAR_BOX = { x: 192.5, y: 239.5, width: 772, height: 244 }

export type HeroFrame = { scale: number; left: number; top: number }

export function heroFrame(width: number, height: number): HeroFrame {
  if (width >= 1024) {
    // Computador: o carro ocupa ~60% da largura, encostado à direita, e o cascalho chega ao rodapé
    const scale = Math.max((width * 0.6) / CAR_BOX.width, (height * 0.78) / PHOTO.height)
    const left = width * 0.97 - (CAR_BOX.x + CAR_BOX.width) * scale
    return { scale, left, top: height - PHOTO.height * scale }
  }
  // Celular e tablet: o carro inteiro na largura da tela, na parte de baixo
  const scale = (width * 0.98) / CAR_BOX.width
  const left = width / 2 - (CAR_BOX.x + CAR_BOX.width / 2) * scale
  return { scale, left, top: height * 0.97 - PHOTO.height * scale }
}
