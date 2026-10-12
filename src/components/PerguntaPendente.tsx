import { useEffect, useState } from 'react'
import { useMesa } from '../lib/mesa'
import { guardar, ler, type Pendente } from '../lib/local'
import { criadosNestaSessao } from '../lib/vamos'
import { Folha } from './Folha'
import { Botao } from './Botao'
import { Ilustracao } from './Ilustracao'

/** Na abertura seguinte a um "Vamos!", pergunta se foram mesmo. */
export function PerguntaPendente() {
  const { sitios, aCarregar, atualizar } = useMesa()
  const [pendente, setPendente] = useState<Pendente | null>(null)
  const [aGuardar, setAGuardar] = useState(false)

  useEffect(() => {
    if (aCarregar || pendente) return
    const p = ler<Pendente | null>('pendente', null)
    if (!p || criadosNestaSessao.has(p.id)) return
    const s = sitios.find((x) => x.id === p.id)
    if (!s || s.ja_fomos) {
      guardar('pendente', null)
      return
    }
    setPendente(p)
  }, [aCarregar, sitios, pendente])

  const fechar = () => {
    guardar('pendente', null)
    setPendente(null)
  }

  async function foram() {
    if (!pendente) return
    setAGuardar(true)
    try {
      await atualizar(pendente.id, { ja_fomos: true })
      fechar()
    } catch {
      setAGuardar(false)
    }
  }

  return (
    <Folha aberta={!!pendente} aoFechar={fechar} titulo="Então?">
      <div className="flex flex-col items-center pb-6 text-center">
        <Ilustracao nome="copo" className="h-28 w-auto" />
        <p className="mt-4 text-[22px] leading-snug font-semibold">{pendente?.nome}</p>
        <p className="mt-0.5 text-[18px]">Já lá foram?</p>
        <p className="mt-1 font-serif text-[18px] italic text-vinho-suave">Se sim, passa para os do costume.</p>
        <div className="mt-6 flex w-full gap-3">
          <Botao variante="contorno" className="flex-1" onClick={fechar}>
            Não fomos
          </Botao>
          <Botao className="flex-1" onClick={foram} disabled={aGuardar}>
            Sim, fomos!
          </Botao>
        </div>
      </div>
    </Folha>
  )
}
