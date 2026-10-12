import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Check, MapPin, NavigationArrow, PencilSimple } from '@phosphor-icons/react'
import { useMesa } from '../lib/mesa'
import { PRECOS, nomeMomento } from '../lib/constantes'
import { vamos } from '../lib/vamos'
import { Miniatura } from '../components/Miniatura'
import { Botao } from '../components/Botao'
import { Ilustracao } from '../components/Ilustracao'

export function SitioPagina() {
  const { id } = useParams()
  const { sitios, atualizar, aCarregar } = useMesa()
  const navegar = useNavigate()
  const s = sitios.find((x) => x.id === id)
  const [aGuardar, setAGuardar] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  if (!s) {
    return (
      <main className="pt-seguro flex min-h-dvh flex-col items-center justify-center px-6 pb-32 text-center">
        <Ilustracao nome="cloche" className="w-32" />
        <p className="mt-5 font-serif text-[22px] italic">{aCarregar ? 'A procurar…' : 'Este sítio já não está na ementa.'}</p>
        <Link to="/" className="mt-3 font-semibold text-tinta underline underline-offset-4">
          Voltar à ementa
        </Link>
      </main>
    )
  }

  const preco = PRECOS.find((p) => p.id === s.preco)

  async function alternarEstado() {
    if (!s) return
    setAGuardar(true)
    setErro(null)
    try {
      await atualizar(s.id, { ja_fomos: !s.ja_fomos })
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não deu para guardar.')
    } finally {
      setAGuardar(false)
    }
  }

  return (
    <main className="pb-36">
      <div className="pt-seguro sticky top-0 z-20 flex items-center justify-between bg-papel/90 px-3 pb-2 backdrop-blur-md">
        <button
          type="button"
          onClick={() => (history.length > 1 ? navegar(-1) : navegar('/'))}
          aria-label="Voltar"
          className="grid size-11 place-items-center rounded-full hover:bg-papel-2"
        >
          <ArrowLeft size={24} />
        </button>
        <Link
          to={`/sitio/${s.id}/editar`}
          className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold text-tinta hover:bg-papel-2"
        >
          <PencilSimple size={20} />
          Editar
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="px-5"
      >
        <Miniatura sitio={s} grande className="aspect-[4/3] w-full" />
      </motion.div>

      <div className="px-5">
        <div className="mt-5 flex items-start justify-between gap-4">
          <h1 className="text-[34px] leading-[1.05] font-semibold tracking-tight text-balance">{s.nome}</h1>
          {preco && (
            <div className="shrink-0 pt-1 text-right">
              <div className="text-[22px] font-semibold text-tinta">{preco.sinal}</div>
              <div className="font-serif text-[15px] italic text-vinho-suave">{preco.legenda}</div>
            </div>
          )}
        </div>

        {(s.cozinhas.length > 0 || s.momentos.length > 0) && (
          <p className="mt-2 font-serif text-[20px] leading-snug italic text-vinho-suave">
            {[s.cozinhas.join(', '), s.momentos.map(nomeMomento).join(', ')].filter(Boolean).join(' · ')}
          </p>
        )}

        <Botao className="mt-6 w-full" onClick={() => vamos(s)}>
          <NavigationArrow size={20} weight="fill" />
          Vamos!
        </Botao>

        <div role="radiogroup" aria-label="Já lá foram?" className="traco-2 mt-3 grid grid-cols-2 border-vinho/25 p-1">
          {[false, true].map((v) => (
            <button
              key={String(v)}
              type="button"
              role="radio"
              aria-checked={s.ja_fomos === v}
              disabled={aGuardar}
              onClick={() => s.ja_fomos !== v && alternarEstado()}
              className={`flex min-h-11 items-center justify-center gap-1.5 rounded-[14px] text-[15px] font-semibold transition-colors ${
                s.ja_fomos === v ? 'bg-vinho text-papel' : 'text-vinho-suave'
              }`}
            >
              {s.ja_fomos === v && <Check size={18} weight="bold" />}
              {v ? 'Já fomos' : 'Nunca fomos'}
            </button>
          ))}
        </div>
        {erro && (
          <p className="mt-2 text-[14px] text-tinta-escura" role="alert">
            {erro}
          </p>
        )}

        <div className="onda mt-8 opacity-70" aria-hidden />

        <dl className="mt-6 flex flex-col gap-7">
          {s.o_que_pedir && (
            <div>
              <dt className="font-mao text-[28px] leading-none text-tinta">O que pedir</dt>
              <dd className="mt-2 font-serif text-[22px] leading-snug italic text-azul whitespace-pre-line">{s.o_que_pedir}</dd>
            </div>
          )}
          {s.notas && (
            <div>
              <dt className="font-mao text-[28px] leading-none text-tinta">Notas</dt>
              <dd className="mt-2 text-[17px] leading-relaxed whitespace-pre-line">{s.notas}</dd>
            </div>
          )}
          {s.morada && (
            <div>
              <dt className="font-mao text-[28px] leading-none text-tinta">Onde fica</dt>
              <dd className="mt-2 flex items-start gap-2 text-[17px] leading-relaxed">
                <MapPin size={20} className="mt-0.5 shrink-0 text-tinta" aria-hidden />
                {s.morada}
              </dd>
            </div>
          )}
          {s.tags.length > 0 && (
            <div>
              <dt className="sr-only">Tags</dt>
              <dd className="flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span key={t} className="traco-2 border-vinho/30 px-3 py-1 text-[15px]">
                    {t}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>

        {!s.o_que_pedir && !s.notas && !s.morada && s.tags.length === 0 && (
          <p className="mt-6 text-center font-serif text-[19px] italic text-vinho-suave">
            Ainda sem notas.{' '}
            <Link to={`/sitio/${s.id}/editar`} className="text-tinta underline underline-offset-4">
              Acrescentar
            </Link>
          </p>
        )}
      </div>
    </main>
  )
}
