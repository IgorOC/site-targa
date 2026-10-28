import Image, { type ImageProps } from "next/image"
import { loaderFor } from "@/lib/photo"

export function CarPhoto({ src, alt, ...props }: Omit<ImageProps, "src" | "loader"> & { src: string }) {
  return <Image src={src} alt={alt} loader={loaderFor(src)} {...props} />
}
