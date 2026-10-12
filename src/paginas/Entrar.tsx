import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { useMesa } from '../lib/mesa'
import { Ilustracao } from '../components/Ilustracao'
import { Botao } from '../components/Botao'

export function Entrar() {
  const { entrar } = useMesa()
  const [codigo, setCodigo] = useState(() => new URLSearchParams(location.search).get('mesa') ?? '')
  const [erro, setErro] = useState<string | null>(null)
  const [aEnviar, setAEnviar] = useState(false)

  async function submeter(e: FormEvent) {
    e.preventDefault()
    if (!codigo.trim()) {
      setErro('Escreve o código da mesa.')
      return
    }
    setAEnviar(true)
    setErro(null)
    try {
      await entrar(codigo)
      history.replaceState(null, '', '/')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Algo correu mal.')
    } finally {
      setAEnviar(false)
    }
  }

  return (
    <main className="pt-seguro pb-seguro mx-auto flex min-h-dvh max-w-md flex-col px-6">
      <div className="onda mt-2 opacity-80" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 16, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-8 w-[68%]"
      >
        <Ilustracao nome="coracoes" />
      </motion.div>

      <h1 className="mt-4 -rotate-2 text-center font-mao text-[84px] leading-[0.9] text-tinta">Ementa</h1>
      <p className="mx-auto mt-3 max-w-[30ch] text-center font-serif text-[21px] leading-snug italic text-vinho-suave">
        Os nossos sítios de sempre, e os que ainda queremos estrear.
      </p>

      <form onSubmit={submeter} className="mt-auto flex flex-col gap-2 pt-10 pb-6" noValidate>
        <label htmlFor="codigo" className="text-[15px] font-semibold">
          Código da mesa
        </label>
        <input
          id="codigo"
          name="codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          placeholder="ex.: nome-00"
          aria-invalid={!!erro}
          aria-describedby="codigo-ajuda"
          className="traco h-13 border-vinho/40 bg-papel px-4 text-[17px] text-vinho placeholder:text-vinho-suave/70 focus:border-tinta focus:ring-2 focus:ring-tinta/20 focus:outline-none"
        />
        <p id="codigo-ajuda" className={`min-h-5 text-[14px] ${erro ? 'text-tinta-escura' : 'text-vinho-suave'}`} aria-live="polite">
          {erro ?? 'Só é preciso escrever uma vez neste telemóvel.'}
        </p>
        <Botao type="submit" disabled={aEnviar} className="mt-2 w-full">
          {aEnviar ? 'A pôr a mesa…' : 'Entrar'}
        </Botao>
      </form>
    </main>
  )
}
