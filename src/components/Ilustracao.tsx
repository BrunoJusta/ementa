import type { Ilustracao as Nome } from '../lib/constantes'

const TAMANHOS: Record<Nome, [number, number]> = {
  cloche: [440, 440],
  copo: [136, 248],
  coracoes: [520, 485],
  'cupido-1': [420, 339],
  'cupido-2': [420, 340],
  folhas: [172, 195],
  massa: [185, 246],
  mesa: [335, 218],
  sobremesa: [201, 222],
}

interface Props {
  nome: Nome
  className?: string
  /** Texto alternativo; vazio = decorativa */
  alt?: string
}

export function Ilustracao({ nome, className = '', alt = '' }: Props) {
  const [w, h] = TAMANHOS[nome]
  return (
    <img
      src={`/illus/${nome}.png`}
      width={w}
      height={h}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
      className={`select-none ${className}`}
      decoding="async"
    />
  )
}
