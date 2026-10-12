export type Momento = 'pequeno-almoco' | 'brunch' | 'almoco' | 'lanche' | 'jantar' | 'sobremesa'
export type Preco = 1 | 2 | 3 | 4

export interface Sitio {
  id: string
  mesa_id: string
  nome: string
  morada: string | null
  maps_url: string | null
  foto_path: string | null
  cozinhas: string[]
  preco: Preco | null
  momentos: Momento[]
  ja_fomos: boolean
  notas: string | null
  o_que_pedir: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export type SitioNovo = Omit<Sitio, 'id' | 'mesa_id' | 'created_at' | 'updated_at'>

export interface Filtros {
  momentos: Momento[]
  precos: Preco[]
  cozinhas: string[]
  estado: 'todos' | 'ja-fomos' | 'por-estrear'
  texto: string
}

export const filtrosVazios: Filtros = { momentos: [], precos: [], cozinhas: [], estado: 'todos', texto: '' }
