import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'cheio' | 'contorno' | 'texto'
  children: ReactNode
}

export function Botao({ variante = 'cheio', className = '', children, ...resto }: Props) {
  const base =
    'inline-flex min-h-12 items-center justify-center gap-2 px-5 text-[16px] font-semibold whitespace-nowrap transition-[transform,background-color,opacity] duration-200 ease-(--ease-tinta) active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45'
  const estilos = {
    cheio: 'traco border-tinta bg-tinta text-papel hover:bg-tinta-escura',
    contorno: 'traco-2 border-tinta text-tinta hover:bg-tinta/5',
    texto: 'rounded-full text-vinho-suave underline decoration-tinta/40 underline-offset-4 hover:text-tinta',
  }
  return (
    <button className={`${base} ${estilos[variante]} ${className}`} {...resto}>
      {children}
    </button>
  )
}
