import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes.jsx'
import { setPreloadedData } from './data/preloaded'

// Data embedded by the build-time prerenderer. Seeding it before the first
// render keeps the client output aligned with the static HTML.
if (typeof window !== 'undefined' && window.__BLANKCO_DATA__) {
  setPreloadedData(window.__BLANKCO_DATA__)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
