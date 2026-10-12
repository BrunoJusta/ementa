import { useState } from 'react'
import { Ilustracao } from './Ilustracao'
import { ilustracaoPara } from '../lib/constantes'
import { urlFoto } from '../lib/fotos'
import type { Sitio } from '../lib/tipos'

interface Props {
  sitio: Pick<Sitio, 'foto_path' | 'cozinhas' | 'nome'>
  className?: string
  grande?: boolean
}

/** Foto do sítio ou, sem foto, uma ilustração a condizer com a cozinha. */
export function Miniatura({ sitio, className = '', grande = false }: Props) {
  const url = urlFoto(sitio.foto_path)
  const [falhou, setFalhou] = useState(false)
  const forma = grande ? 'rounded-[28px_10px_30px_12px/12px_30px_10px_28px]' : 'rounded-[18px_7px_20px_8px/8px_20px_7px_18px]'

  if (url && !falhou) {
    return (
      <img
        src={url}
        alt={grande ? `Foto de ${sitio.nome}` : ''}
        loading="lazy"
        decoding="async"
        onError={() => setFalhou(true)}
        className={`${forma} bg-papel-2 object-cover ${className}`}
      />
    )
  }
  return (
    <div className={`${forma} grid place-items-center bg-papel-2 ${className}`}>
      <Ilustracao nome={ilustracaoPara(sitio.cozinhas)} className={grande ? 'max-h-[70%] w-auto' : 'max-h-[72%] w-auto'} />
    </div>
  )
}
