import type { ReactNode } from 'react'

interface Props {
  ativo: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}

/** Chip com contorno desenhado à mão. Ativo = tinta cheia. */
export function Chip({ ativo, onClick, children, className = '' }: Props) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={`traco inline-flex min-h-10 shrink-0 items-center gap-1.5 px-3.5 py-1.5 text-[15px] whitespace-nowrap transition-[background-color,color,transform] duration-200 ease-(--ease-tinta) active:scale-[0.97] ${
        ativo ? 'border-tinta bg-tinta text-papel' : 'border-tinta/45 text-vinho hover:border-tinta'
      } ${className}`}
    >
      {children}
    </button>
  )
}
