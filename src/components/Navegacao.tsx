import { NavLink } from 'react-router-dom'
import { BookOpenText, Plus, Shuffle } from '@phosphor-icons/react'

const item =
  'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[13px] font-medium transition-colors duration-200'

export function Navegacao() {
  return (
    <nav
      aria-label="Principal"
      className="pb-seguro fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-linha bg-papel/92 px-3 pt-1.5 backdrop-blur-md"
    >
      <div className="flex items-stretch">
        <NavLink to="/" end className={({ isActive }) => `${item} ${isActive ? 'text-tinta' : 'text-vinho-suave hover:text-vinho'}`}>
          {({ isActive }) => (
            <>
              <BookOpenText size={24} weight={isActive ? 'fill' : 'regular'} />
              Ementa
            </>
          )}
        </NavLink>

        <NavLink to="/sem-ideias" className="flex flex-1 items-center justify-center" aria-label="Sem ideias? Sortear um sítio">
          {({ isActive }) => (
            <span
              className={`traco -mt-6 flex min-h-14 items-center gap-2 border-tinta px-4 font-mao text-[22px] leading-none whitespace-nowrap shadow-[0_8px_20px_-10px_rgba(158,31,25,0.6)] transition-transform duration-200 active:scale-95 ${
                isActive ? 'bg-tinta-escura text-papel' : 'bg-tinta text-papel'
              }`}
            >
              <Shuffle size={22} weight="bold" />
              Sem ideias?
            </span>
          )}
        </NavLink>

        <NavLink to="/novo" className={({ isActive }) => `${item} ${isActive ? 'text-tinta' : 'text-vinho-suave hover:text-vinho'}`}>
          <Plus size={24} />
          Adicionar
        </NavLink>
      </div>
    </nav>
  )
}
