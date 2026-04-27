import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

interface GachaButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  iconLeading?: ReactNode
  iconTrailing?: ReactNode
  contentClassName?: string
  size?: 'md' | 'lg' | 'xl'
}

const sizeMap: Record<NonNullable<GachaButtonProps['size']>, string> = {
  md: 'h-14 text-base',
  lg: 'h-16 text-lg',
  xl: 'h-20 text-xl',
}

const GachaButton = forwardRef<HTMLButtonElement, GachaButtonProps>(function GachaButton(
  {
    label,
    iconLeading,
    iconTrailing,
    className = '',
    contentClassName = '',
    size = 'lg',
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`game-shine group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full border-2 border-[#FFD36A] bg-[linear-gradient(180deg,#FFB323_0%,#FF7A00_58%,#B84700_100%)] font-display font-semibold text-white shadow-[0_16px_30px_rgba(196,86,0,0.34),inset_0_2px_0_rgba(255,255,255,0.55)] transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-60 ${sizeMap[size]} ${className}`}
      {...rest}
    >
      <span className="pointer-events-none absolute inset-x-7 top-1 h-3 rounded-full bg-white/45 blur-[2px]" />
      <span
        className={`relative z-10 flex items-center justify-center gap-2 px-6 drop-shadow-[0_2px_0_rgba(82,46,12,0.65)] ${contentClassName}`}
      >
        {iconLeading}
        <span>{label}</span>
        {iconTrailing}
      </span>
    </button>
  )
})

export default GachaButton
