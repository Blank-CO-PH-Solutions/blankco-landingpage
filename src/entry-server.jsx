import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import AppRoutes from './routes.jsx'

// Renders a public route to static HTML during the build.
export function render(url) {
  return renderToString(
    <MemoryRouter initialEntries={[url]}>
      <AppRoutes />
    </MemoryRouter>,
  )
}

export { setPreloadedData } from './data/preloaded'
export { getTeamProfileSummary, resolveSeo, siteUrl } from './seo'
