import type { Momento, Preco } from './tipos'

export const COZINHAS_BASE = [
  'Portuguesa',
  'Petiscos',
  'Marisco',
  'Italiana',
  'Pizza',
  'Japonesa',
  'Asiática',
  'Hambúrgueres',
  'Mexicana',
  'Pastelaria e café',
  'Vegetariana',
]

export const MOMENTOS: { id: Momento; nome: string }[] = [
  { id: 'pequeno-almoco', nome: 'Pequeno-almoço' },
  { id: 'brunch', nome: 'Brunch' },
  { id: 'almoco', nome: 'Almoço' },
  { id: 'lanche', nome: 'Lanche' },
  { id: 'jantar', nome: 'Jantar' },
]

export const nomeMomento = (m: Momento) => MOMENTOS.find((x) => x.id === m)?.nome ?? m

export const PRECOS: { id: Preco; sinal: string; legenda: string }[] = [
  { id: 1, sinal: '€', legenda: 'até 15 €' },
  { id: 2, sinal: '€€', legenda: '15 a 25 €' },
  { id: 3, sinal: '€€€', legenda: '25 a 35 €' },
  { id: 4, sinal: '€€€€', legenda: 'mais de 35 €' },
]

export const sinalPreco = (p: Preco | null) => (p ? '€'.repeat(p) : '')

export type Ilustracao =
  | 'cloche'
  | 'mesa'
  | 'coracoes'
  | 'copo'
  | 'folhas'
  | 'massa'
  | 'sobremesa'
  | 'cupido-1'
  | 'cupido-2'

/** Ilustração para um sítio sem foto, escolhida pelo tipo de cozinha. */
export function ilustracaoPara(cozinhas: string[]): Ilustracao {
  const c = cozinhas.map((x) => x.toLowerCase())
  if (c.some((x) => x.includes('ital') || x.includes('pizza'))) return 'massa'
  if (c.some((x) => x.includes('pastel') || x.includes('café') || x.includes('brunch') || x.includes('doce'))) return 'sobremesa'
  if (c.some((x) => x.includes('veg'))) return 'folhas'
  if (c.some((x) => x.includes('petisc') || x.includes('vinho') || x.includes('bar'))) return 'copo'
  return 'cloche'
}
