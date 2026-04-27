import type { CSSProperties, ImgHTMLAttributes } from 'react'

type GameImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  decorative?: boolean
  loading?: 'eager' | 'lazy'
}

export default function GameImage({
  src,
  alt = '',
  decorative,
  loading = 'eager',
  draggable = false,
  className,
  style,
  ...rest
}: GameImageProps) {
  const finalAlt = decorative ? '' : alt
  const finalAria = decorative || finalAlt === '' ? { 'aria-hidden': true } : undefined
  const baseStyle: CSSProperties = {
    WebkitUserSelect: 'none',
    userSelect: 'none',
    ...style,
  }

  return (
    <img
      src={src}
      alt={finalAlt}
      loading={loading}
      draggable={draggable}
      className={className}
      style={baseStyle}
      {...finalAria}
      {...rest}
    />
  )
}
