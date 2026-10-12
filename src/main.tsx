import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'
import './index.css'
import App from './App.tsx'
import { MesaProvider } from './lib/mesa.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <MesaProvider>
          <App />
        </MesaProvider>
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
)
