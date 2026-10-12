import { guardar, type Pendente } from './local'
import { linkMaps } from './filtros'
import type { Sitio } from './tipos'

// Pendentes criados nesta abertura da app não geram pergunta até à próxima abertura.
export const criadosNestaSessao = new Set<string>()

/** "Vamos!": abre o Maps e, se o sítio estiver por estrear, guarda para perguntar depois. */
export function vamos(s: Sitio) {
  if (!s.ja_fomos) {
    const p: Pendente = { id: s.id, nome: s.nome, em: Date.now() }
    guardar('pendente', p)
    criadosNestaSessao.add(s.id)
  }
  window.open(linkMaps(s), '_blank', 'noopener')
}
