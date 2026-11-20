import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { defaultImage, resolveSeo } from './seo'

const navigationOrder = ['/', '/about', '/services', '/projects', '/members', '/contact-us']

function navigationIndex(pathname) {
  const section = pathname.startsWith('/services/')
    ? '/services'
    : pathname.startsWith('/team/')
      ? '/members'
      : pathname
  return navigationOrder.indexOf(section)
}

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function removeMeta(attribute, key) {
  document.head.querySelectorAll(`meta[${attribute}="${key}"]`).forEach((element) => element.remove())
}

function App() {
  const location = useLocation()
  const pathname = location.pathname.replace(/\/$/, '') || '/'
  const [previousPath, setPreviousPath] = useState(pathname)
  const [pageTransition, setPageTransition] = useState('page-enter-up')

  if (previousPath !== pathname) {
    const previousIndex = navigationIndex(previousPath)
    const currentIndex = navigationIndex(pathname)
    setPageTransition(
      previousIndex === currentIndex || previousIndex === -1 || currentIndex === -1
        ? 'page-enter-up'
        : currentIndex > previousIndex
          ? 'page-enter-right'
          : 'page-enter-left',
    )
    setPreviousPath(pathname)
  }

  useEffect(() => {
    const page = resolveSeo(pathname)
    const description = String(page.description || '').replace(/\s+/g, ' ').trim()

    document.title = page.title
    setMeta('name', 'description', description)
    setMeta('name', 'robots', page.robots)
    setMeta('name', 'googlebot', page.robots)
    setMeta('property', 'og:title', page.title)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:type', page.type || 'website')
    setMeta('property', 'og:site_name', 'BlankCO PH Solutions')
    setMeta('property', 'og:image', page.image || defaultImage)
    setMeta('property', 'og:image:alt', `${page.title} social preview`)
    setMeta('name', 'twitter:card', 'summary')
    setMeta('name', 'twitter:title', page.title)
    setMeta('name', 'twitter:description', description)
    setMeta('name', 'twitter:image', page.image || defaultImage)

    if (page.canonical) {
      setMeta('property', 'og:url', page.canonical)
      let canonical = document.head.querySelector('link[rel="canonical"]')
      if (!canonical) {
        canonical = document.createElement('link')
        canonical.rel = 'canonical'
        document.head.appendChild(canonical)
      }
      canonical.href = page.canonical
    } else {
      // Non-indexable pages (for example a 404) should not advertise a canonical.
      removeMeta('property', 'og:url')
      document.head.querySelectorAll('link[rel="canonical"]').forEach((element) => element.remove())
    }

    // Keep the site-wide Organization reference available on every page.
    setMeta('name', 'application-name', 'BlankCO PH Solutions')
    setMeta('name', 'author', 'BlankCO PH Solutions')
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 pt-[76px]">
        <div key={location.pathname} className={pageTransition}>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
