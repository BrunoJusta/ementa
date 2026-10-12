import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { FadersHorizontal, MagnifyingGlass, X } from '@phosphor-icons/react'
import { useMesa } from '../lib/mesa'
import { agrupar, aplicarFiltros, contarFiltros, type Agrupamento } from '../lib/filtros'
import { filtrosVazios, type Filtros, type Sitio } from '../lib/tipos'
import { nomeMomento, sinalPreco } from '../lib/constantes'
import { guardar, ler } from '../lib/local'
import { Ilustracao } from '../components/Ilustracao'
import { Miniatura } from '../components/Miniatura'
import { Folha } from '../components/Folha'
import { FiltrosCampos } from '../components/FiltrosCampos'
import { Botao } from '../components/Botao'

const AGRUPAMENTOS: { id: Agrupamento; nome: string }[] = [
  { id: 'cozinha', nome: 'Cozinha' },
  { id: 'momento', nome: 'Momento' },
  { id: 'estado', nome: 'Estado' },
]

export function EmentaPagina() {
  const { sitios, aCarregar, erro, cozinhas, mesa, sair, recarregar } = useMesa()
  const navegar = useNavigate()
  const [filtros, setFiltros] = useState<Filtros>(() => ({ ...ler('filtros-ementa', filtrosVazios), texto: '' }))
  const [modo, setModo] = useState<Agrupamento>(() => ler('agrupar', 'cozinha'))
  const [painel, setPainel] = useState(false)

  useEffect(() => guardar('filtros-ementa', { ...filtros, texto: '' }), [filtros])
  useEffect(() => guardar('agrupar', modo), [modo])

  const visiveis = useMemo(() => aplicarFiltros(sitios, filtros), [sitios, filtros])
  const grupos = useMemo(() => agrupar(visiveis, modo), [visiveis, modo])
  const usadas = useMemo(() => new Set(sitios.flatMap((s) => s.cozinhas)), [sitios])
  const nFiltros = contarFiltros(filtros)
  const porEstrear = sitios.filter((s) => !s.ja_fomos).length

  return (
    <main className="pt-seguro px-5 pb-36">
      <header className="relative pt-2">
        <h1 className="relative z-10 -rotate-2 font-mao text-[72px] leading-[0.95] text-tinta">Ementa</h1>
        <Ilustracao nome="cloche" className="pointer-events-none absolute -top-1 right-0 w-[132px] opacity-95" />
        {sitios.length > 0 && (
          <p className="relative z-10 mt-1 font-serif text-[20px] italic text-vinho-suave">
            {sitios.length === 1 ? '1 sítio' : `${sitios.length} sítios`}
            {porEstrear > 0 && `, ${porEstrear} por estrear`}
          </p>
        )}
      </header>

      {sitios.length > 0 && (
        <div className="sticky top-0 z-20 -mx-5 mt-5 bg-papel/94 px-5 pt-3 pb-3 backdrop-blur-md">
          <div className="flex gap-2">
            <label className="traco relative flex h-12 flex-1 items-center gap-2 border-vinho/30 px-3.5 focus-within:border-tinta focus-within:ring-2 focus-within:ring-tinta/20">
              <MagnifyingGlass size={20} className="shrink-0 text-vinho-suave" aria-hidden />
              <span className="sr-only">Procurar</span>
              <input
                type="search"
                name="procurar"
                value={filtros.texto}
                onChange={(e) => setFiltros({ ...filtros, texto: e.target.value })}
                placeholder="Procurar sítio, prato, tag…"
                autoComplete="off"
                className="h-full w-full bg-transparent text-[16px] placeholder:text-vinho-suave/75 focus:outline-none"
              />
              {filtros.texto && (
                <button
                  type="button"
                  aria-label="Limpar pesquisa"
                  onClick={() => setFiltros({ ...filtros, texto: '' })}
                  className="-mr-1.5 grid size-9 shrink-0 place-items-center rounded-full text-vinho-suave"
                >
                  <X size={18} />
                </button>
              )}
            </label>
            <button
              type="button"
              onClick={() => setPainel(true)}
              className={`traco-2 relative flex h-12 items-center gap-1.5 px-3.5 text-[15px] font-semibold ${
                nFiltros ? 'border-tinta bg-tinta text-papel' : 'border-vinho/30 text-vinho'
              }`}
              aria-label={nFiltros ? `Filtros, ${nFiltros} ativos` : 'Filtros'}
            >
              <FadersHorizontal size={20} />
              {nFiltros > 0 && <span>{nFiltros}</span>}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-1" role="radiogroup" aria-label="Agrupar por">
            <span className="mr-1 font-serif text-[17px] italic text-vinho-suave">Agrupar por</span>
            {AGRUPAMENTOS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={modo === a.id}
                onClick={() => setModo(a.id)}
                className={`min-h-9 rounded-full px-3 text-[14px] font-semibold transition-colors ${
                  modo === a.id ? 'bg-vinho text-papel' : 'text-vinho-suave hover:text-vinho'
                }`}
              >
                {a.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {erro && (
        <div className="traco mt-4 flex items-center justify-between gap-3 border-tinta/50 px-4 py-3 text-[15px]" role="alert">
          <span>{erro}</span>
          <button type="button" onClick={recarregar} className="shrink-0 font-semibold text-tinta underline underline-offset-4">
            Tentar
          </button>
        </div>
      )}

      {aCarregar && sitios.length === 0 ? (
        <Esqueleto />
      ) : sitios.length === 0 ? (
        <Vazio aoAdicionar={() => navegar('/novo')} />
      ) : visiveis.length === 0 ? (
        <div className="mt-14 flex flex-col items-center text-center">
          <Ilustracao nome="copo" className="w-16" />
          <p className="mt-4 font-serif text-[22px] italic">Nada com estes filtros.</p>
          <Botao variante="texto" className="mt-1" onClick={() => setFiltros(filtrosVazios)}>
            Limpar filtros
          </Botao>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-9">
          {grupos.map((g, gi) => (
            <section key={g.chave} aria-labelledby={`g-${g.chave}`}>
              <h2
                id={`g-${g.chave}`}
                className={`mb-3 inline-block font-mao text-[34px] leading-none text-tinta ${gi % 2 ? 'rotate-[1.5deg]' : '-rotate-2'}`}
              >
                {g.titulo}
              </h2>
              <ul className="flex flex-col gap-1">
                {g.sitios.map((s, i) => (
                  <Linha key={s.id} sitio={s} i={i} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {mesa && sitios.length > 0 && (
        <footer className="mt-16 flex flex-col items-center gap-1 text-center">
          <div className="onda w-40 opacity-60" aria-hidden />
          <p className="mt-3 font-serif text-[17px] italic text-vinho-suave">Mesa {mesa.nome}</p>
          <Botao variante="texto" className="min-h-10 text-[14px]" onClick={sair}>
            Sair desta mesa
          </Botao>
        </footer>
      )}

      <Folha
        aberta={painel}
        aoFechar={() => setPainel(false)}
        titulo="Filtros"
        rodape={
          <div className="flex items-center gap-3">
            <Botao variante="texto" onClick={() => setFiltros({ ...filtrosVazios, texto: filtros.texto })} disabled={!nFiltros}>
              Limpar
            </Botao>
            <Botao className="flex-1" onClick={() => setPainel(false)}>
              {visiveis.length === 1 ? 'Ver 1 sítio' : `Ver ${visiveis.length} sítios`}
            </Botao>
          </div>
        }
      >
        <FiltrosCampos filtros={filtros} aoMudar={setFiltros} cozinhas={cozinhas} cozinhasUsadas={usadas} />
      </Folha>
    </main>
  )
}

function Linha({ sitio: s, i }: { sitio: Sitio; i: number }) {
  const detalhe = [s.momentos.map(nomeMomento).join(', '), s.morada].filter(Boolean).join(' · ')
  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/sitio/${s.id}`}
        className="-mx-2 flex items-center gap-3.5 rounded-2xl px-2 py-2.5 transition-colors hover:bg-papel-2/70 active:bg-papel-2"
      >
        <Miniatura sitio={s} className="size-[60px] shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[18px] leading-tight font-semibold">{s.nome}</span>
            <span className="leader" aria-hidden />
            {s.preco && (
              <span className="shrink-0 text-[16px] font-semibold text-tinta">
                <span aria-hidden>{sinalPreco(s.preco)}</span>
                <span className="sr-only">, preço {s.preco} em 4</span>
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate font-serif text-[17px] leading-snug italic text-vinho-suave">
            {!s.ja_fomos && <span className="text-azul">por estrear{detalhe && ' · '}</span>}
            {detalhe}
          </p>
        </div>
      </Link>
    </motion.li>
  )
}

function Vazio({ aoAdicionar }: { aoAdicionar: () => void }) {
  return (
    <div className="mt-12 flex flex-col items-center text-center">
      <Ilustracao nome="mesa" className="w-[78%]" />
      <p className="mt-6 font-mao text-[34px] leading-tight text-tinta">A mesa está posta.</p>
      <p className="mt-1 max-w-[28ch] font-serif text-[20px] leading-snug italic text-vinho-suave">
        Falta a comida. Adicionem o primeiro sítio onde gostam de ir.
      </p>
      <Botao className="mt-6" onClick={aoAdicionar}>
        Adicionar sítio
      </Botao>
    </div>
  )
}

function Esqueleto() {
  return (
    <div className="mt-8 flex flex-col gap-4" aria-busy="true" aria-label="A carregar">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-3.5">
          <div className="size-[60px] rounded-2xl bg-papel-2" />
          <div className="flex-1">
            <div className="h-4 w-2/3 rounded bg-papel-2" />
            <div className="mt-2 h-3.5 w-1/2 rounded bg-papel-2" />
          </div>
        </div>
      ))}
    </div>
  )
}
