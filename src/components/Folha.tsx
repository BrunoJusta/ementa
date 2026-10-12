import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { X } from '@phosphor-icons/react'

interface Props {
  aberta: boolean
  aoFechar: () => void
  titulo: string
  children: ReactNode
  rodape?: ReactNode
}

/** Folha que sobe do fundo (bottom sheet), acessível como diálogo. */
export function Folha({ aberta, aoFechar, titulo, children, rodape }: Props) {
  const reduz = useReducedMotion()
  const id = useId()
  const painel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!aberta) return
    const antes = document.activeElement as HTMLElement | null
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    painel.current?.focus()
    return () => {
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
      antes?.focus?.()
    }
  }, [aberta, aoFechar])

  return (
    <AnimatePresence>
      {aberta && (
        <div className="fixed inset-0 z-40 flex items-end justify-center">
          <motion.div
            className="absolute inset-0 bg-vinho/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={aoFechar}
          />
          <motion.div
            ref={painel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={id}
            tabIndex={-1}
            className="relative flex max-h-[88dvh] w-full max-w-md flex-col rounded-t-[28px] bg-papel shadow-[0_-12px_40px_-12px_rgba(58,21,18,0.35)] outline-none"
            initial={reduz ? { opacity: 0 } : { y: '100%' }}
            animate={reduz ? { opacity: 1 } : { y: 0 }}
            exit={reduz ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h2 id={id} className="font-mao text-[30px] leading-none text-tinta">
                {titulo}
              </h2>
              <button
                type="button"
                onClick={aoFechar}
                aria-label="Fechar"
                className="-mr-2 grid size-11 place-items-center rounded-full text-vinho hover:bg-papel-2"
              >
                <X size={22} weight="bold" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-4">{children}</div>
            {rodape && <div className="pb-seguro border-t border-linha px-5 pt-3">{rodape}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
