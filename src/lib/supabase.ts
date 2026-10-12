import { createClient } from '@supabase/supabase-js'

// A chave publishable é pública por natureza: o acesso aos dados é protegido pelas regras RLS.
// Podem ser substituídas por variáveis de ambiente (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY).
const url = import.meta.env.VITE_SUPABASE_URL ?? 'https://ayukppfgtsclxsrftzhs.supabase.co'
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_UuEMLVu8DlK3Yoz_enOcAQ_K6lv8OCE'

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'ementa-auth' },
})
