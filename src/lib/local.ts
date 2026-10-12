// Pequenas preferências guardadas no telemóvel. Tudo em try/catch: o modo privado pode bloquear.

export function ler<T>(chave: string, padrao: T): T {
  try {
    const v = localStorage.getItem(`ementa:${chave}`)
    return v ? (JSON.parse(v) as T) : padrao
  } catch {
    return padrao
  }
}

export function guardar(chave: string, valor: unknown) {
  try {
    if (valor === null || valor === undefined) localStorage.removeItem(`ementa:${chave}`)
    else localStorage.setItem(`ementa:${chave}`, JSON.stringify(valor))
  } catch {
    /* sem armazenamento, segue */
  }
}

export interface Pendente {
  id: string
  nome: string
  em: number
}
