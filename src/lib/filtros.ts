import { MOMENTOS } from './constantes'
import type { Filtros, Sitio } from './tipos'

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

export function aplicarFiltros(sitios: Sitio[], f: Filtros): Sitio[] {
  const q = normalizar(f.texto.trim())
  return sitios.filter((s) => {
    if (f.estado === 'ja-fomos' && !s.ja_fomos) return false
    if (f.estado === 'por-estrear' && s.ja_fomos) return false
    if (f.momentos.length && !s.momentos.some((m) => f.momentos.includes(m))) return false
    if (f.precos.length && (!s.preco || !f.precos.includes(s.preco))) return false
    if (f.cozinhas.length && !s.cozinhas.some((c) => f.cozinhas.includes(c))) return false
    if (q) {
      const alvo = normalizar([s.nome, s.morada, ...s.cozinhas, ...s.tags, s.notas, s.o_que_pedir].filter(Boolean).join(' '))
      if (!alvo.includes(q)) return false
    }
    return true
  })
}

export const contarFiltros = (f: Filtros) =>
  f.momentos.length + f.precos.length + f.cozinhas.length + (f.estado !== 'todos' ? 1 : 0)

export type Agrupamento = 'cozinha' | 'momento' | 'estado'

export interface Grupo {
  chave: string
  titulo: string
  sitios: Sitio[]
}

const porNome = (a: Sitio, b: Sitio) => a.nome.localeCompare(b.nome, 'pt')

export function agrupar(sitios: Sitio[], modo: Agrupamento): Grupo[] {
  if (modo === 'estado') {
    return [
      { chave: 'costume', titulo: 'Os do costume', sitios: sitios.filter((s) => s.ja_fomos).sort(porNome) },
      { chave: 'estrear', titulo: 'Por estrear', sitios: sitios.filter((s) => !s.ja_fomos).sort(porNome) },
    ].filter((g) => g.sitios.length)
  }
  if (modo === 'momento') {
    const grupos: Grupo[] = MOMENTOS.map((m) => ({
      chave: m.id,
      titulo: m.nome,
      sitios: sitios.filter((s) => s.momentos.includes(m.id)).sort(porNome),
    }))
    const sem = sitios.filter((s) => !s.momentos.length).sort(porNome)
    if (sem.length) grupos.push({ chave: 'sem', titulo: 'A qualquer hora', sitios: sem })
    return grupos.filter((g) => g.sitios.length)
  }
  const mapa = new Map<string, Sitio[]>()
  for (const s of sitios) {
    const lista = s.cozinhas.length ? s.cozinhas : ['Outros']
    for (const c of lista) mapa.set(c, [...(mapa.get(c) ?? []), s])
  }
  return [...mapa.entries()]
    .sort(([a], [b]) => (a === 'Outros' ? 1 : b === 'Outros' ? -1 : a.localeCompare(b, 'pt')))
    .map(([c, l]) => ({ chave: c, titulo: c, sitios: l.sort(porNome) }))
}

/** Baralha (Fisher-Yates) e devolve os primeiros n. */
export function sortear<T>(lista: T[], n: number): T[] {
  const a = [...lista]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, n)
}

export function linkMaps(s: Pick<Sitio, 'maps_url' | 'nome' | 'morada'>) {
  if (s.maps_url) return s.maps_url
  const q = encodeURIComponent([s.nome, s.morada].filter(Boolean).join(', '))
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}
