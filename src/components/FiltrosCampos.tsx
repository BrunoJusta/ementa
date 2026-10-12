import { Chip } from './Chip'
import { MOMENTOS, PRECOS } from '../lib/constantes'
import type { Filtros, Momento, Preco } from '../lib/tipos'

interface Props {
  filtros: Filtros
  aoMudar: (f: Filtros) => void
  cozinhas: string[]
  /** Cozinhas que existem na lista (para não mostrar opções vazias) */
  cozinhasUsadas?: Set<string>
}

const alternar = <T,>(lista: T[], v: T) => (lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v])

export function Rotulo({ children }: { children: string }) {
  return <h3 className="mb-2.5 font-serif text-[19px] font-semibold italic text-vinho-suave">{children}</h3>
}

export function FiltrosCampos({ filtros: f, aoMudar, cozinhas, cozinhasUsadas }: Props) {
  const lista = cozinhasUsadas ? cozinhas.filter((c) => cozinhasUsadas.has(c)) : cozinhas
  return (
    <div className="flex flex-col gap-6 pt-2">
      <section>
        <Rotulo>Já lá fomos?</Rotulo>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['todos', 'Tanto faz'],
              ['ja-fomos', 'Os do costume'],
              ['por-estrear', 'Por estrear'],
            ] as const
          ).map(([id, nome]) => (
            <Chip key={id} ativo={f.estado === id} onClick={() => aoMudar({ ...f, estado: id })}>
              {nome}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <Rotulo>Para quando</Rotulo>
        <div className="flex flex-wrap gap-2">
          {MOMENTOS.map((m) => (
            <Chip
              key={m.id}
              ativo={f.momentos.includes(m.id)}
              onClick={() => aoMudar({ ...f, momentos: alternar<Momento>(f.momentos, m.id) })}
            >
              {m.nome}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <Rotulo>Quanto queremos gastar</Rotulo>
        <div className="flex flex-wrap gap-2">
          {PRECOS.map((p) => (
            <Chip
              key={p.id}
              ativo={f.precos.includes(p.id)}
              onClick={() => aoMudar({ ...f, precos: alternar<Preco>(f.precos, p.id) })}
            >
              <span className="font-semibold">{p.sinal}</span>
              <span className="font-serif text-[16px] italic opacity-80">{p.legenda}</span>
            </Chip>
          ))}
        </div>
      </section>

      {lista.length > 0 && (
        <section>
          <Rotulo>Que cozinha</Rotulo>
          <div className="flex flex-wrap gap-2">
            {lista.map((c) => (
              <Chip key={c} ativo={f.cozinhas.includes(c)} onClick={() => aoMudar({ ...f, cozinhas: alternar(f.cozinhas, c) })}>
                {c}
              </Chip>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
