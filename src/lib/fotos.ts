import { supabase } from './supabase'

const BUCKET = 'fotos'
const LADO_MAX = 1400

/** Reduz a foto no telemóvel antes de enviar (webp, ~200-400 KB). */
async function comprimir(ficheiro: File): Promise<Blob> {
  const bitmap = await createImageBitmap(ficheiro, { imageOrientation: 'from-image' })
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * escala)
  const h = Math.round(bitmap.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Sem canvas')
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.8))
  if (blob) return blob
  const jpg = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.82))
  if (!jpg) throw new Error('Não deu para converter a foto')
  return jpg
}

export async function enviarFoto(mesaId: string, ficheiro: File): Promise<string> {
  const blob = await comprimir(ficheiro)
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
  const caminho = `${mesaId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(caminho, blob, {
    contentType: blob.type,
    cacheControl: '31536000',
  })
  if (error) throw error
  return caminho
}

export async function apagarFoto(caminho: string) {
  await supabase.storage.from(BUCKET).remove([caminho])
}

export const urlFoto = (caminho: string | null) =>
  caminho ? supabase.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl : null
