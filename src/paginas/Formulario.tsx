import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Camera, Plus, Trash, X } from '@phosphor-icons/react'
import { useMesa } from '../lib/mesa'
import { MOMENTOS, PRECOS } from '../lib/constantes'
import { apagarFoto, enviarFoto, urlFoto } from '../lib/fotos'
import type { Momento, Preco, SitioNovo } from '../lib/tipos'
import { Chip } from '../components/Chip'
import { Botao } from '../components/Botao'
import { Folha } from '../components/Folha'

const vazio: SitioNovo = {
  nome: '',
  morada: '',
  maps_url: '',
  foto_path: null,
  cozinhas: [],
  preco: null,
  momentos: [],
  ja_fomos: false,
  notas: '',
  o_que_pedir: '',
  tags: [],
}

const alternar = <T,>(l: T[], v: T) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v])
const limpo = (s: string | null) => (s?.trim() ? s.trim() : null)

export function Formulario() {
  const { id } = useParams()
  const { sitios, cozinhas, criar, atualizar, apagar, mesa } = useMesa()
  const navegar = useNavigate()
  const existente = id ? sitios.find((s) => s.id === id) : undefined
  const editar = !!id

  const [v, setV] = useState<SitioNovo>(() => (existente ? { ...vazio, ...existente } : vazio))
  const [ficheiro, setFicheiro] = useState<File | null>(null)
  const [previa, setPrevia] = useState<string | null>(null)
  const [tirarFoto, setTirarFoto] = useState(false)
  const [extra, setExtra] = useState<string[]>([])
  const [novaCozinha, setNovaCozinha] = useState<string | null>(null)
  const [tag, setTag] = useState('')
  const [erros, setErros] = useState<{ nome?: string; maps?: string; geral?: string }>({})
  const [aGuardar, setAGuardar] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const [descartar, setDescartar] = useState(false)
  const inputFoto = useRef<HTMLInputElement>(null)
  const nomeRef = useRef<HTMLInputElement>(null)

  // Se a lista chegar depois (abrir o link de edição diretamente)
  const carregado = useRef(!!existente)
  useEffect(() => {
    if (existente && !carregado.current) {
      carregado.current = true
      setV({ ...vazio, ...existente })
    }
  }, [existente])

  useEffect(() => {
    if (!ficheiro) return setPrevia(null)
    const u = URL.createObjectURL(ficheiro)
    setPrevia(u)
    return () => URL.revokeObjectURL(u)
  }, [ficheiro])

  const listaCozinhas = useMemo(() => {
    const todas = [...cozinhas]
    for (const c of [...extra, ...v.cozinhas]) if (!todas.includes(c)) todas.push(c)
    return todas
  }, [cozinhas, extra, v.cozinhas])

  const fotoAtual = previa ?? (tirarFoto ? null : urlFoto(v.foto_path))
  const set = <K extends keyof SitioNovo>(k: K, val: SitioNovo[K]) => setV((x) => ({ ...x, [k]: val }))

  function juntarCozinha() {
    const c = (novaCozinha ?? '').trim()
    if (c) {
      const igual = listaCozinhas.find((x) => x.toLowerCase() === c.toLowerCase())
      const nome = igual ?? c.charAt(0).toUpperCase() + c.slice(1)
      if (!igual) setExtra((e) => [...e, nome])
      if (!v.cozinhas.includes(nome)) set('cozinhas', [...v.cozinhas, nome])
    }
    setNovaCozinha(null)
  }

  function juntarTag() {
    const t = tag.trim().replace(/,$/, '').trim()
    if (t && !v.tags.some((x) => x.toLowerCase() === t.toLowerCase())) set('tags', [...v.tags, t])
    setTag('')
  }

  function teclaTag(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      juntarTag()
    } else if (e.key === 'Backspace' && !tag && v.tags.length) {
      set('tags', v.tags.slice(0, -1))
    }
  }

  const original = useMemo(() => JSON.stringify(existente ? { ...vazio, ...existente } : vazio), [existente])
  const alterado = !!ficheiro || tirarFoto || JSON.stringify(v) !== original
  const sairForm = () => (history.length > 1 ? navegar(-1) : navegar('/', { replace: true }))

  useEffect(() => {
    if (!alterado || aGuardar) return
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', aviso)
    return () => window.removeEventListener('beforeunload', aviso)
  }, [alterado, aGuardar])

  async function submeter(e: FormEvent) {
    e.preventDefault()
    const novosErros: typeof erros = {}
    if (!v.nome.trim()) novosErros.nome = 'Falta o nome do sítio.'
    const url = v.maps_url?.trim()
    if (url && !/^https?:\/\//i.test(url)) novosErros.maps = 'O link deve começar por https://'
    setErros(novosErros)
    if (Object.keys(novosErros).length) {
      if (novosErros.nome) nomeRef.current?.focus()
      else if (novosErros.maps) document.getElementById('maps')?.focus()
      return
    }
    if (!mesa) return
    setAGuardar(true)
    try {
      let foto_path = tirarFoto ? null : v.foto_path
      if (ficheiro) foto_path = await enviarFoto(mesa.id, ficheiro)
      const dados: SitioNovo = {
        ...(Object.fromEntries(Object.keys(vazio).map((k) => [k, v[k as keyof SitioNovo]])) as SitioNovo),
        nome: v.nome.trim(),
        morada: limpo(v.morada),
        maps_url: limpo(v.maps_url),
        notas: limpo(v.notas),
        o_que_pedir: limpo(v.o_que_pedir),
        foto_path,
      }
      const antiga = existente?.foto_path
      const guardado = editar && existente ? await atualizar(existente.id, dados) : await criar(dados)
      if (antiga && antiga !== foto_path) apagarFoto(antiga).catch(() => {})
      navegar(`/sitio/${guardado.id}`, { replace: true })
    } catch (err) {
      setErros({ geral: err instanceof Error ? err.message : 'Não deu para guardar.' })
      setAGuardar(false)
    }
  }

  async function apagarSitio() {
    if (!existente) return
    try {
      await apagar(existente.id)
      navegar('/', { replace: true })
    } catch (err) {
      setConfirmar(false)
      setErros({ geral: err instanceof Error ? err.message : 'Não deu para apagar.' })
    }
  }

  if (editar && !existente) {
    return <p className="p-8 text-center font-serif text-[20px] italic">A procurar o sítio…</p>
  }

  return (
    <main className="pb-10">
      <div className="pt-seguro sticky top-0 z-20 flex items-center justify-between border-b border-linha bg-papel/92 px-3 pb-2 backdrop-blur-md">
        <button
          type="button"
          onClick={() => (alterado ? setDescartar(true) : sairForm())}
          className="min-h-11 rounded-full px-3 text-[16px] text-vinho-suave hover:bg-papel-2"
        >
          Cancelar
        </button>
        <h1 className="font-mao text-[28px] leading-none text-tinta">{editar ? 'Editar sítio' : 'Novo sítio'}</h1>
        <button
          type="submit"
          form="form-sitio"
          disabled={aGuardar}
          className="min-h-11 rounded-full px-3 text-[16px] font-semibold text-tinta hover:bg-papel-2 disabled:opacity-50"
        >
          {aGuardar ? 'A guardar…' : 'Guardar'}
        </button>
      </div>

      <form id="form-sitio" onSubmit={submeter} noValidate className="flex flex-col gap-7 px-5 pt-6">
        {/* Foto */}
        <div>
          <input
            ref={inputFoto}
            type="file"
            accept="image/*"
            className="sr-only"
            id="foto"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) {
                setFicheiro(f)
                setTirarFoto(false)
              }
              e.target.value = ''
            }}
          />
          {fotoAtual ? (
            <div className="relative">
              <img
                src={fotoAtual}
                alt="Foto escolhida"
                className="aspect-[4/3] w-full rounded-[28px_10px_30px_12px/12px_30px_10px_28px] object-cover"
              />
              <div className="absolute right-3 bottom-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => inputFoto.current?.click()}
                  className="min-h-10 rounded-full bg-papel/95 px-4 text-[14px] font-semibold shadow"
                >
                  Trocar
                </button>
                <button
                  type="button"
                  aria-label="Tirar foto"
                  onClick={() => {
                    setFicheiro(null)
                    setTirarFoto(true)
                  }}
                  className="grid size-10 place-items-center rounded-full bg-papel/95 shadow"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="foto"
              className="traco-2 flex aspect-[5/2] w-full cursor-pointer flex-col items-center justify-center gap-1 border-dashed border-tinta/45 text-tinta hover:bg-tinta/5"
            >
              <Camera size={28} />
              <span className="text-[15px] font-semibold">Juntar foto</span>
              <span className="font-serif text-[15px] italic text-vinho-suave">opcional</span>
            </label>
          )}
        </div>

        <Campo id="nome" rotulo="Nome" erro={erros.nome}>
          <input
            ref={nomeRef}
            id="nome"
            name="nome"
            value={v.nome}
            onChange={(e) => set('nome', e.target.value)}
            autoComplete="off"
            maxLength={120}
            aria-invalid={!!erros.nome}
            aria-describedby={erros.nome ? 'nome-erro' : undefined}
            className={entrada}
            placeholder="Tasca do Zé"
          />
        </Campo>

        <Campo id="maps" rotulo="Link do Google Maps" ajuda="Partilhar no Maps e copiar o link. Serve para o botão “Vamos!”." erro={erros.maps}>
          <input
            id="maps"
            name="maps_url"
            type="url"
            inputMode="url"
            value={v.maps_url ?? ''}
            onChange={(e) => set('maps_url', e.target.value)}
            autoComplete="off"
            aria-invalid={!!erros.maps}
            aria-describedby={erros.maps ? 'maps-erro' : 'maps-ajuda'}
            className={entrada}
            placeholder="https://maps.app.goo.gl/…"
          />
        </Campo>

        <Campo id="morada" rotulo="Morada ou zona">
          <input
            id="morada"
            name="morada"
            value={v.morada ?? ''}
            onChange={(e) => set('morada', e.target.value)}
            autoComplete="off"
            className={entrada}
            placeholder="Póvoa de Varzim"
          />
        </Campo>

        <Grupo rotulo="Cozinha">
          <div className="flex flex-wrap gap-2">
            {listaCozinhas.map((c) => (
              <Chip key={c} ativo={v.cozinhas.includes(c)} onClick={() => set('cozinhas', alternar(v.cozinhas, c))}>
                {c}
              </Chip>
            ))}
            {novaCozinha === null ? (
              <Chip ativo={false} onClick={() => setNovaCozinha('')} className="border-dashed">
                <Plus size={16} weight="bold" /> Outra
              </Chip>
            ) : (
              <div className="flex w-full gap-2">
                <label htmlFor="nova-cozinha" className="sr-only">
                  Nova cozinha
                </label>
                <input
                  id="nova-cozinha"
            name="nova_cozinha"
                  autoFocus
                  value={novaCozinha}
                  onChange={(e) => setNovaCozinha(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      juntarCozinha()
                    }
                    if (e.key === 'Escape') setNovaCozinha(null)
                  }}
                  placeholder="ex.: Coreana"
                  className={`${entrada} flex-1`}
                />
                <Botao type="button" onClick={juntarCozinha}>
                  Juntar
                </Botao>
              </div>
            )}
          </div>
        </Grupo>

        <Grupo rotulo="Preço por pessoa">
          <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Preço por pessoa">
            {PRECOS.map((p) => {
              const ativo = v.preco === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={ativo}
                  onClick={() => set('preco', ativo ? null : (p.id as Preco))}
                  className={`traco flex min-h-16 flex-col items-center justify-center px-1 transition-colors ${
                    ativo ? 'border-tinta bg-tinta text-papel' : 'border-tinta/40 text-vinho'
                  }`}
                >
                  <span className="text-[17px] font-semibold">{p.sinal}</span>
                  <span className="font-serif text-[14px] leading-tight italic opacity-85">{p.legenda}</span>
                </button>
              )
            })}
          </div>
        </Grupo>

        <Grupo rotulo="Para quando">
          <div className="flex flex-wrap gap-2">
            {MOMENTOS.map((m) => (
              <Chip key={m.id} ativo={v.momentos.includes(m.id)} onClick={() => set('momentos', alternar<Momento>(v.momentos, m.id))}>
                {m.nome}
              </Chip>
            ))}
          </div>
        </Grupo>

        <Grupo rotulo="Já lá fomos?">
          <div role="radiogroup" aria-label="Já lá fomos?" className="traco-2 grid grid-cols-2 border-vinho/25 p-1">
            {[false, true].map((b) => (
              <button
                key={String(b)}
                type="button"
                role="radio"
                aria-checked={v.ja_fomos === b}
                onClick={() => set('ja_fomos', b)}
                className={`min-h-11 rounded-[14px] text-[15px] font-semibold transition-colors ${
                  v.ja_fomos === b ? 'bg-vinho text-papel' : 'text-vinho-suave'
                }`}
              >
                {b ? 'Já fomos' : 'Nunca fomos'}
              </button>
            ))}
          </div>
        </Grupo>

        <Campo id="pedir" rotulo="O que pedir">
          <textarea
            id="pedir"
            name="o_que_pedir"
            rows={2}
            value={v.o_que_pedir ?? ''}
            onChange={(e) => set('o_que_pedir', e.target.value)}
            className={`${entrada} min-h-20 py-3`}
            placeholder="O polvo à lagareiro e a mousse"
          />
        </Campo>

        <Campo id="notas" rotulo="Notas">
          <textarea
            id="notas"
            name="notas"
            rows={3}
            value={v.notas ?? ''}
            onChange={(e) => set('notas', e.target.value)}
            className={`${entrada} min-h-24 py-3`}
            placeholder="Reservar ao fim de semana, fecha à segunda…"
          />
        </Campo>

        <Campo id="tags" rotulo="Tags" ajuda="Enter ou vírgula para juntar.">
          <div className="traco flex min-h-13 flex-wrap items-center gap-1.5 border-vinho/30 px-2 py-1.5 focus-within:border-tinta focus-within:ring-2 focus-within:ring-tinta/20">
            {v.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-papel-2 py-1 pr-1 pl-3 text-[15px]">
                {t}
                <button
                  type="button"
                  aria-label={`Tirar ${t}`}
                  onClick={() => set('tags', v.tags.filter((x) => x !== t))}
                  className="grid size-7 place-items-center rounded-full hover:bg-linha"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
            <input
              id="tags"
            name="tags"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onKeyDown={teclaTag}
              onBlur={juntarTag}
              aria-describedby="tags-ajuda"
              placeholder={v.tags.length ? '' : 'esplanada, romântico…'}
              className="h-10 min-w-24 flex-1 bg-transparent px-2 text-[16px] placeholder:text-vinho-suave/70 focus:outline-none"
            />
          </div>
        </Campo>

        {erros.geral && (
          <p className="text-[15px] text-tinta-escura" role="alert">
            {erros.geral}
          </p>
        )}

        <Botao type="submit" disabled={aGuardar} className="w-full">
          {aGuardar ? 'A guardar…' : editar ? 'Guardar alterações' : 'Juntar à ementa'}
        </Botao>

        {editar && (
          <Botao type="button" variante="texto" className="mx-auto text-tinta-escura" onClick={() => setConfirmar(true)}>
            <Trash size={18} /> Apagar este sítio
          </Botao>
        )}
      </form>

      <Folha aberta={descartar} aoFechar={() => setDescartar(false)} titulo="Sair sem guardar?">
        <p className="text-[17px] leading-relaxed">O que escreveste aqui perde-se.</p>
        <div className="mt-6 mb-6 flex gap-3">
          <Botao variante="contorno" className="flex-1" onClick={() => setDescartar(false)}>
            Continuar
          </Botao>
          <Botao className="flex-1" onClick={sairForm}>
            Sair
          </Botao>
        </div>
      </Folha>

      <Folha aberta={confirmar} aoFechar={() => setConfirmar(false)} titulo="Apagar?">
        <p className="text-[17px] leading-relaxed">
          <span className="font-semibold">{existente?.nome}</span> sai da ementa para os dois. Não dá para desfazer.
        </p>
        <div className="mt-6 mb-6 flex gap-3">
          <Botao variante="contorno" className="flex-1" onClick={() => setConfirmar(false)}>
            Manter
          </Botao>
          <Botao className="flex-1" onClick={apagarSitio}>
            Apagar
          </Botao>
        </div>
      </Folha>
    </main>
  )
}

const entrada =
  'traco h-13 w-full border-vinho/30 bg-transparent px-4 text-[16px] text-vinho placeholder:text-vinho-suave/70 focus:border-tinta focus:ring-2 focus:ring-tinta/20 focus:outline-none aria-[invalid=true]:border-tinta-escura'

function Campo({ id, rotulo, ajuda, erro, children }: { id: string; rotulo: string; ajuda?: string; erro?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {rotulo}
      </label>
      {children}
      {erro ? (
        <p id={`${id}-erro`} className="text-[14px] text-tinta-escura" role="alert">
          {erro}
        </p>
      ) : ajuda ? (
        <p id={`${id}-ajuda`} className="font-serif text-[16px] italic text-vinho-suave">
          {ajuda}
        </p>
      ) : null}
    </div>
  )
}

function Grupo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  const id = useId()
  return (
    <div role="group" aria-labelledby={id} className="flex flex-col gap-2.5">
      <span id={id} className="text-[15px] font-semibold">
        {rotulo}
      </span>
      {children}
    </div>
  )
}
