import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useMesa } from './lib/mesa'
import { Entrar } from './paginas/Entrar'
import { EmentaPagina } from './paginas/Ementa'
import { SitioPagina } from './paginas/Sitio'
import { Formulario } from './paginas/Formulario'
import { SemIdeias } from './paginas/SemIdeias'
import { Navegacao } from './components/Navegacao'
import { PerguntaPendente } from './components/PerguntaPendente'
import { Ilustracao } from './components/Ilustracao'

export default function App() {
  const { estado } = useMesa()
  const { pathname } = useLocation()

  if (estado === 'a-abrir') {
    return (
      <div className="grid min-h-dvh place-items-center" aria-busy="true">
        <Ilustracao nome="cloche" alt="A abrir a Ementa" className="w-28 animate-pulse" />
      </div>
    )
  }
  if (estado === 'fora') return <Entrar />

  const comNav = !pathname.includes('/editar') && pathname !== '/novo'

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <Routes>
        <Route path="/" element={<EmentaPagina />} />
        <Route path="/sem-ideias" element={<SemIdeias />} />
        <Route path="/novo" element={<Formulario />} />
        <Route path="/sitio/:id" element={<SitioPagina />} />
        <Route path="/sitio/:id/editar" element={<Formulario />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {comNav && <Navegacao />}
      <PerguntaPendente />
    </div>
  )
}
