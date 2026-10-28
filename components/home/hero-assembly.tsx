"use client"

import { useEffect, useMemo, useRef, type RefObject } from "react"
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { BufferAttribute, DoubleSide, PlaneGeometry, ShaderMaterial, TextureLoader, type Group, type Texture } from "three"
import { CAR_BOX, heroFrame } from "@/components/home/hero-frame"

// O 911 Targa é montado peça por peça a partir do recorte do carro (PNG com fundo
// transparente), por cima da foto de fundo sem o carro. Ele abre desmontado, com as peças
// espalhadas no espaço 3D, e se monta conforme a rolagem avança pelo hero, terminando
// exatamente no lugar onde estava na foto.

const COLS = 36
const ROWS = 12
const ASPECT = CAR_BOX.width / CAR_BOX.height

type Piece = {
  geometry: PlaneGeometry
  home: [number, number]
  from: [number, number, number]
  spin: [number, number, number]
  delay: number
}

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Mede quanto de carro (alfa) existe em cada célula da grade, para pular as vazias
function coverage(texture: Texture) {
  const image = texture.image as HTMLImageElement
  const canvas = document.createElement("canvas")
  canvas.width = COLS * 4
  canvas.height = ROWS * 4
  const ctx = canvas.getContext("2d")
  if (!ctx) return () => 1
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  return (col: number, row: number) => {
    let sum = 0
    for (let y = row * 4; y < row * 4 + 4; y++) {
      for (let x = col * 4; x < col * 4 + 4; x++) sum += data[(y * canvas.width + x) * 4 + 3]
    }
    return sum / (16 * 255)
  }
}

function buildPieces(texture: Texture): Piece[] {
  const rand = seeded(911)
  const filled = coverage(texture)
  const pieces: Piece[] = []
  const w = ASPECT / COLS
  const h = 1 / ROWS
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (filled(col, row) < 0.03) continue
      const geometry = new PlaneGeometry(w, h)
      const u0 = col / COLS
      const v0 = 1 - (row + 1) / ROWS
      const uv = new Float32Array([u0, v0 + h, u0 + 1 / COLS, v0 + h, u0, v0, u0 + 1 / COLS, v0])
      geometry.setAttribute("uv", new BufferAttribute(uv, 2))
      const x = -ASPECT / 2 + w * (col + 0.5)
      const y = 0.5 - h * (row + 0.5)
      const angle = rand() * Math.PI * 2
      const radius = 0.35 + rand() * 1.1
      pieces.push({
        geometry,
        home: [x, y],
        from: [x + Math.cos(angle) * radius * 1.6, y + 0.35 + Math.sin(angle) * radius, -2.5 + rand() * 4],
        spin: [(rand() - 0.5) * 7, (rand() - 0.5) * 7, (rand() - 0.5) * 4],
        // A montagem anda das rodas para cima e da frente para a traseira
        delay: (col / COLS) * 0.45 + ((ROWS - row) / ROWS) * 0.25 + rand() * 0.15,
      })
    }
  }
  return pieces
}

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform sampler2D map;
  varying vec2 vUv;
  void main() {
    vec4 color = texture2D(map, vUv);
    if (color.a < 0.02) discard;
    gl_FragColor = color;
  }
`

const ease = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp = (t: number) => Math.min(1, Math.max(0, t))

type Props = { src: string; track: RefObject<HTMLElement | null>; onReady: () => void }

function Assembly({ src, track, still, onReady }: Props & { still: boolean }) {
  const texture = useLoader(TextureLoader, src)
  const car = useRef<Group>(null)
  const rig = useRef<Group>(null)
  const start = useRef<number | null>(null)
  const progress = useRef(still ? 1 : 0)
  const pieces = useMemo(() => buildPieces(texture), [texture])
  const material = useMemo(
    () => new ShaderMaterial({ uniforms: { map: { value: texture } }, vertexShader: vertex, fragmentShader: fragment, transparent: true, side: DoubleSide }),
    [texture],
  )
  const { viewport, size } = useThree()

  useEffect(() => {
    onReady()
    return () => {
      material.dispose()
      pieces.forEach((piece) => piece.geometry.dispose())
    }
  }, [material, pieces, onReady])

  useFrame(({ clock }, delta) => {
    if (start.current === null) start.current = clock.elapsedTime
    const t = clock.elapsedTime
    // As peças surgem espalhadas ao abrir; a rolagem dentro do hero (preso na tela) monta o carro
    const appear = still ? 1 : ease(clamp((t - start.current) / 1.4))
    const section = track.current
    let target = 1
    if (section && !still) {
      const rect = section.getBoundingClientRect()
      const room = Math.max(1, rect.height - window.innerHeight)
      target = clamp(-rect.top / room / 0.85)
    }
    progress.current += (target - progress.current) * Math.min(1, delta * 5)
    const assembled = progress.current
    const meshes = car.current?.children ?? []

    pieces.forEach((piece, index) => {
      const mesh = meshes[index]
      if (!mesh) return
      const local = ease(clamp(assembled * 1.85 - piece.delay))
      const away = 1 - local
      // Leve flutuação só enquanto a peça está solta
      const drift = still ? 0 : Math.sin(t * 0.7 + piece.delay * 12) * 0.05 * away
      mesh.position.set(
        piece.home[0] + (piece.from[0] - piece.home[0]) * away,
        piece.home[1] + (piece.from[1] - piece.home[1]) * away + drift,
        piece.from[2] * away,
      )
      mesh.rotation.set(piece.spin[0] * away, piece.spin[1] * away, piece.spin[2] * away)
      mesh.scale.setScalar((0.75 + 0.25 * local) * appear)
    })

    // Gira de lado enquanto monta e assenta reto quando o carro fica completo
    if (rig.current) rig.current.rotation.y = (1 - assembled) * -0.5
  })

  // Mesma posição e escala do carro na foto de fundo (pixels da tela -> unidades da cena)
  const frame = heroFrame(size.width, size.height)
  const unit = viewport.width / size.width
  const centerX = frame.left + (CAR_BOX.x + CAR_BOX.width / 2) * frame.scale
  const centerY = frame.top + (CAR_BOX.y + CAR_BOX.height / 2) * frame.scale

  return (
    <group
      ref={rig}
      position={[(centerX - size.width / 2) * unit, -(centerY - size.height / 2) * unit, 0]}
      scale={CAR_BOX.height * frame.scale * unit}
    >
      <group ref={car}>
        {pieces.map((piece, index) => (
          <mesh key={index} geometry={piece.geometry} material={material} />
        ))}
      </group>
    </group>
  )
}

export function HeroAssembly({ src, track, onReady }: Props) {
  const still = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  return (
    <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 35 }} gl={{ antialias: true, alpha: true }} className="!absolute inset-0">
      <Assembly src={src} track={track} still={still} onReady={onReady} />
    </Canvas>
  )
}
