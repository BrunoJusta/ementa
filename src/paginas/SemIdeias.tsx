import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowsClockwise, NavigationArrow, SlidersHorizontal } from '@phosphor-icons/react'
import { useMesa } from '../lib/mesa'
import { aplicarFiltros, contarFiltros, sortear } from '../lib/filtros'
import { filtrosVazios, type Filtros, type Sitio } from '../lib/tipos'
import { sinalPreco } from '../lib/constantes'
import { guardar, ler } from '../lib/local'
import { vamos } from '../lib/vamos'
import { FiltrosCampos } from '../components/FiltrosCampos'
import { Botao } from '../components/Botao'
import { Ilustracao } from '../components/Ilustracao'
import { Miniatura } from '../components/Miniatura'

type Passo = 'filtros' | 'duelo' | 'vencedor'

const ROTACOES = [-2.5, 1.8, -1.2]

export function SemIdeias() {
  const { sitios, cozinhas } = useMesa()
  const [filtros, setFiltros] = useState<Filtros>(() => ({ ...ler('filtros-sorteio', filtrosVazios), texto: '' }))
  const [passo, setPasso] = useState<Passo>('filtros')
  const [cartas, setCartas] = useState<Sitio[]>([])
  const [riscados, setRiscados] = useState<string[]>([])
  const [vencedor, setVencedor] = useState<Sitio | null>(null)
  const [ronda, setRonda] = useState(0)

  useEffect(() => guardar('filtros-sorteio', filtros), [filtros])

  const candidatos = useMemo(() => aplicarFiltros(sitios, filtros), [sitios, filtros])
  const usadas = useMemo(() => new Set(sitios.flatMap((s) => s.cozinhas)), [sitios])
  const precisa = Math.max(cartas.length - 1, 0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [passo])

  function duelo() {
    const c = sortear(candidatos, 3)
    if (c.length === 1) return escolhe(c)
    setCartas(c)
    setRiscados([])
    setRonda((r) => r + 1)
    setPasso('duelo')
  }

  function escolhe(lista = candidatos) {
    const outros = lista.length > 1 && vencedor ? lista.filter((s) => s.id !== vencedor.id) : lista
    setVencedor(sortear(outros, 1)[0] ?? null)
    setRonda((r) => r + 1)
    setPasso('vencedor')
  }

  function riscar(id: string) {
    if (riscados.includes(id) || riscados.length >= precisa) return
    const novos = [...riscados, id]
    setRiscados(novos)
    if (novos.length === precisa) {
      const fica = cartas.find((c) => !novos.includes(c.id))!
      setTimeout(() => {
        setVencedor(fica)
        setPasso('vencedor')
      }, 1100)
    }
  }

  if (sitios.length === 0) {
    return (
      <main className="pt-seguro flex min-h-dvh flex-col items-center justify-center px-6 pb-32 text-center">
        <Ilustracao nome="mesa" className="w-3/4" />
        <p className="mt-6 font-mao text-[34px] leading-tight text-tinta">Ainda não há nada para sortear.</p>
        <Link to="/novo" className="mt-3 font-semibold text-tinta underline underline-offset-4">
          Adicionar o primeiro sítio
        </Link>
      </main>
    )
  }

  return (
    <main className="pt-seguro px-5 pb-40">
      <AnimatePresence mode="wait">
        {passo === 'filtros' && (
          <motion.div key="filtros" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header className="relative pt-2">
              <h1 className="relative z-10 -rotate-2 font-mao text-[64px] leading-[0.95] text-tinta">Sem ideias?</h1>
              <p className="relative z-10 mt-2 max-w-[24ch] font-serif text-[21px] leading-snug italic text-vinho-suave">
                Digam o que vos apetece. O resto fica com a sorte.
              </p>
              <Ilustracao nome="copo" className="pointer-events-none absolute top-6 right-1 w-[64px] rotate-6" />
            </header>

            <div className="mt-4">
              <FiltrosCampos filtros={filtros} aoMudar={setFiltros} cozinhas={cozinhas} cozinhasUsadas={usadas} />
              {contarFiltros(filtros) > 0 && (
                <Botao variante="texto" className="mt-3 -ml-1 min-h-10 px-1 text-[15px]" onClick={() => setFiltros(filtrosVazios)}>
                  Limpar filtros
                </Botao>
              )}
            </div>

            <div className="sticky bottom-[calc(max(env(safe-area-inset-bottom),12px)+76px)] z-10 -mx-5 mt-8 bg-gradient-to-t from-papel from-70% to-papel/0 px-5 pt-6 pb-3">
              <p className="mb-3 text-center font-serif text-[19px] italic text-azul" aria-live="polite">
                {candidatos.length === 0
                  ? 'Nenhum sítio com estes filtros.'
                  : candidatos.length === 1
                    ? 'Só 1 sítio em jogo.'
                    : `${candidatos.length} sítios em jogo.`}
              </p>
              <div className="flex gap-3">
                <Botao variante="contorno" className="flex-1" disabled={!candidatos.length} onClick={() => escolhe()}>
                  Escolhe tu
                </Botao>
                <Botao className="flex-[1.4]" disabled={!candidatos.length} onClick={duelo}>
                  {candidatos.length >= 3 ? 'Duelo a três' : candidatos.length === 2 ? 'Duelo a dois' : 'Sortear'}
                </Botao>
              </div>
            </div>
          </motion.div>
        )}

        {passo === 'duelo' && (
          <motion.div key={`duelo-${ronda}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header className="pt-2 text-center">
              <h1 className="-rotate-1 font-mao text-[48px] leading-none text-tinta">A ementa do dia</h1>
              <p className="mx-auto mt-3 min-h-[3.2em] max-w-[28ch] text-[18px] leading-snug" aria-live="polite">
                {riscados.length === 0 && 'Quem tem o telemóvel risca uma.'}
                {riscados.length === 1 && precisa === 2 && 'Agora passa à outra pessoa. Risca mais uma.'}
                {riscados.length === precisa && 'Está decidido.'}
              </p>
            </header>

            <ul className="mt-4 flex flex-col gap-4">
              {cartas.map((s, i) => (
                <Carta key={s.id} sitio={s} i={i} riscada={riscados.includes(s.id)} fim={riscados.length >= precisa} aoRiscar={() => riscar(s.id)} />
              ))}
            </ul>

            <div className="mt-8 flex justify-center">
              <Botao variante="texto" onClick={() => setPasso('filtros')}>
                <SlidersHorizontal size={18} /> Mudar filtros
              </Botao>
            </div>
          </motion.div>
        )}

        {passo === 'vencedor' && vencedor && (
          <Vencedor
            key={`v-${ronda}`}
            sitio={vencedor}
            aoBaralhar={() => (candidatos.length >= 2 ? duelo() : escolhe())}
            aoFiltros={() => setPasso('filtros')}
            podeBaralhar={candidatos.length > 1}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

function Carta({ sitio: s, i, riscada, fim, aoRiscar }: { sitio: Sitio; i: number; riscada: boolean; fim: boolean; aoRiscar: () => void }) {
  const reduz = useReducedMotion()
  return (
    <motion.li
      initial={reduz ? { opacity: 0 } : { opacity: 0, y: -60, rotate: ROTACOES[i] * 4 }}
      animate={{ opacity: riscada ? 0.55 : 1, y: 0, rotate: ROTACOES[i] }}
      transition={{ type: 'spring', stiffness: 160, damping: 18, delay: reduz ? 0 : i * 0.12 }}
    >
      <button
        type="button"
        onClick={aoRiscar}
        disabled={riscada || fim}
        aria-label={riscada ? `${s.nome}, riscado` : `Riscar ${s.nome}`}
        className="traco relative flex w-full items-center gap-4 border-tinta/70 bg-papel p-3.5 text-left shadow-[0_10px_24px_-16px_rgba(58,21,18,0.5)] transition-transform active:scale-[0.98] disabled:cursor-default"
      >
        <Miniatura sitio={s} className="size-[72px] shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[20px] leading-tight font-semibold">{s.nome}</p>
          <p className="mt-0.5 truncate font-serif text-[17px] italic text-vinho-suave">
            {[s.cozinhas.join(', '), sinalPreco(s.preco)].filter(Boolean).join(' · ') || 'Sem detalhes'}
          </p>
          {!s.ja_fomos && <p className="font-serif text-[16px] italic text-azul">por estrear</p>}
        </div>
        {riscada && <Risco />}
      </button>
    </motion.li>
  )
}

/** Risco a vermelho, desenhado por cima da carta. */
function Risco() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden>
      <motion.path
        d="M8 62 C 60 40, 110 70, 160 48 S 250 30, 292 44 M 20 72 C 90 56, 170 78, 285 52"
        fill="none"
        stroke="var(--color-tinta)"
        strokeWidth={5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </svg>
  )
}

function Vencedor({ sitio: s, aoBaralhar, aoFiltros, podeBaralhar }: { sitio: Sitio; aoBaralhar: () => void; aoFiltros: () => void; podeBaralhar: boolean }) {
  const reduz = useReducedMotion()
  return (
    <motion.div key="vencedor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative pt-2">
      <div className="pointer-events-none relative h-28" aria-hidden>
        <motion.div
          className="absolute top-0 left-0 w-[46%]"
          initial={reduz ? { opacity: 0 } : { x: -160, y: 20, opacity: 0, rotate: -12 }}
          animate={{ x: 0, y: 0, opacity: 1, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.15 }}
        >
          <Ilustracao nome="cupido-1" />
        </motion.div>
        <motion.div
          className="absolute top-2 right-0 w-[46%]"
          initial={reduz ? { opacity: 0 } : { x: 160, y: 30, opacity: 0, rotate: 12 }}
          animate={{ x: 0, y: 0, opacity: 1, rotate: 4 }}
          transition={{ type: 'spring', stiffness: 70, damping: 14, delay: 0.3 }}
        >
          <Ilustracao nome="cupido-2" />
        </motion.div>
      </div>

      <p className="mt-6 text-center font-mao text-[30px] leading-none text-tinta">A sorte diz…</p>

      <motion.div
        initial={reduz ? { opacity: 0 } : { opacity: 0, scale: 0.9, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: -1 }}
        transition={{ type: 'spring', stiffness: 140, damping: 16, delay: 0.1 }}
        className="traco mt-4 border-tinta bg-papel p-4 shadow-[0_18px_40px_-22px_rgba(58,21,18,0.6)]"
      >
        <Miniatura sitio={s} grande className="aspect-[16/10] w-full" />
        <h1 className="mt-4 text-center text-[34px] leading-[1.05] font-semibold tracking-tight text-balance">{s.nome}</h1>
        <p className="mt-1 text-center font-serif text-[19px] italic text-vinho-suave">
          {[s.cozinhas.join(', '), sinalPreco(s.preco)].filter(Boolean).join(' · ')}
        </p>
        {s.o_que_pedir && (
          <p className="mt-3 text-center font-serif text-[19px] leading-snug italic text-azul">Pedir: {s.o_que_pedir}</p>
        )}
      </motion.div>

      <div className="mt-6 flex flex-col gap-3">
        <Botao onClick={() => vamos(s)} className="w-full">
          <NavigationArrow size={20} weight="fill" /> Vamos!
        </Botao>
        {podeBaralhar && (
          <Botao variante="contorno" onClick={aoBaralhar} className="w-full">
            <ArrowsClockwise size={20} /> Baralhar outra vez
          </Botao>
        )}
        <div className="flex justify-center gap-6">
          <Botao variante="texto" onClick={aoFiltros}>
            Mudar filtros
          </Botao>
          <Link to={`/sitio/${s.id}`} className="inline-flex min-h-12 items-center text-vinho-suave underline decoration-tinta/40 underline-offset-4">
            Ver ficha
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
