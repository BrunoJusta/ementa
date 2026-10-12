import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { supabase } from './supabase'
import { apagarFoto } from './fotos'
import { guardar, ler } from './local'
import type { Sitio, SitioNovo } from './tipos'
import { COZINHAS_BASE } from './constantes'

type Estado = 'a-abrir' | 'fora' | 'dentro'

interface Mesa {
  id: string
  nome: string
}

interface ContextoMesa {
  estado: Estado
  mesa: Mesa | null
  sitios: Sitio[]
  aCarregar: boolean
  erro: string | null
  cozinhas: string[]
  entrar: (codigo: string) => Promise<void>
  sair: () => Promise<void>
  criar: (s: SitioNovo) => Promise<Sitio>
  atualizar: (id: string, s: Partial<SitioNovo>) => Promise<Sitio>
  apagar: (id: string) => Promise<void>
  recarregar: () => Promise<void>
}

const Ctx = createContext<ContextoMesa | null>(null)

export function useMesa() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useMesa fora do MesaProvider')
  return c
}

const ordenar = (l: Sitio[]) => [...l].sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))

export function MesaProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>('a-abrir')
  const [mesa, setMesa] = useState<Mesa | null>(() => ler<Mesa | null>('mesa', null))
  const [sitios, setSitios] = useState<Sitio[]>(() => ler<Sitio[]>('cache-sitios', []))
  const [aCarregar, setACarregar] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const mesaRef = useRef(mesa)
  useEffect(() => {
    mesaRef.current = mesa
  }, [mesa])

  const carregar = useCallback(async (m: Mesa) => {
    setACarregar(true)
    const { data, error } = await supabase.from('sitios').select('*').eq('mesa_id', m.id)
    setACarregar(false)
    if (error) {
      setErro('Não deu para ler a ementa. Verifica a ligação.')
      return
    }
    setErro(null)
    const l = ordenar(data as Sitio[])
    setSitios(l)
    guardar('cache-sitios', l)
  }, [])

  // Arranque: já há sessão e mesa guardada?
  useEffect(() => {
    let vivo = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!vivo) return
      const m = mesaRef.current
      if (data.session && m) {
        setEstado('dentro')
        await carregar(m)
      } else {
        setEstado('fora')
        setACarregar(false)
      }
    })()
    return () => {
      vivo = false
    }
  }, [carregar])

  // Tempo real: o que um adiciona, o outro vê.
  useEffect(() => {
    if (estado !== 'dentro' || !mesa) return
    const canal = supabase
      .channel(`sitios-${mesa.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sitios', filter: `mesa_id=eq.${mesa.id}` }, (p) => {
        setSitios((atual) => {
          let l = atual
          if (p.eventType === 'DELETE') l = atual.filter((s) => s.id !== (p.old as Sitio).id)
          else {
            const novo = p.new as Sitio
            l = ordenar([...atual.filter((s) => s.id !== novo.id), novo])
          }
          guardar('cache-sitios', l)
          return l
        })
      })
      .subscribe()
    const aoVoltar = () => document.visibilityState === 'visible' && carregar(mesa)
    document.addEventListener('visibilitychange', aoVoltar)
    return () => {
      supabase.removeChannel(canal)
      document.removeEventListener('visibilitychange', aoVoltar)
    }
  }, [estado, mesa, carregar])

  const entrar = useCallback(
    async (codigo: string) => {
      const { data: s } = await supabase.auth.getSession()
      if (!s.session) {
        const { error } = await supabase.auth.signInAnonymously()
        if (error) throw new Error('Não deu para abrir sessão. Tenta outra vez daqui a pouco.')
      }
      const { data, error } = await supabase.rpc('entrar_mesa', { p_codigo: codigo })
      if (error) {
        if (error.message.includes('codigo invalido')) throw new Error('Esse código não abre nenhuma mesa.')
        throw new Error('Algo correu mal a entrar. Tenta outra vez.')
      }
      const linha = (data as Mesa[])[0]
      mesaRef.current = linha
      setMesa(linha)
      guardar('mesa', linha)
      setEstado('dentro')
      await carregar(linha)
    },
    [carregar],
  )

  const sair = useCallback(async () => {
    guardar('mesa', null)
    guardar('cache-sitios', null)
    mesaRef.current = null
    setMesa(null)
    setSitios([])
    setEstado('fora')
  }, [])

  const criar = useCallback(async (s: SitioNovo) => {
    const m = mesaRef.current
    if (!m) throw new Error('Sem mesa')
    const { data, error } = await supabase.from('sitios').insert({ ...s, mesa_id: m.id }).select().single()
    if (error) throw new Error('Não deu para guardar. Verifica a ligação.')
    const novo = data as Sitio
    setSitios((l) => ordenar([...l.filter((x) => x.id !== novo.id), novo]))
    return novo
  }, [])

  const atualizar = useCallback(async (id: string, s: Partial<SitioNovo>) => {
    const { data, error } = await supabase.from('sitios').update(s).eq('id', id).select().single()
    if (error) throw new Error('Não deu para guardar. Verifica a ligação.')
    const novo = data as Sitio
    setSitios((l) => ordenar(l.map((x) => (x.id === id ? novo : x))))
    return novo
  }, [])

  const apagar = useCallback(
    async (id: string) => {
      const alvo = sitios.find((s) => s.id === id)
      const { error } = await supabase.from('sitios').delete().eq('id', id)
      if (error) throw new Error('Não deu para apagar. Verifica a ligação.')
      if (alvo?.foto_path) apagarFoto(alvo.foto_path).catch(() => {})
      setSitios((l) => l.filter((x) => x.id !== id))
    },
    [sitios],
  )

  const cozinhas = useMemo(() => {
    const extra = new Set<string>()
    for (const s of sitios) for (const c of s.cozinhas) if (!COZINHAS_BASE.includes(c)) extra.add(c)
    return [...COZINHAS_BASE, ...[...extra].sort((a, b) => a.localeCompare(b, 'pt'))]
  }, [sitios])

  const recarregar = useCallback(async () => {
    if (mesaRef.current) await carregar(mesaRef.current)
  }, [carregar])

  const valor = useMemo(
    () => ({ estado, mesa, sitios, aCarregar, erro, cozinhas, entrar, sair, criar, atualizar, apagar, recarregar }),
    [estado, mesa, sitios, aCarregar, erro, cozinhas, entrar, sair, criar, atualizar, apagar, recarregar],
  )
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>
}
