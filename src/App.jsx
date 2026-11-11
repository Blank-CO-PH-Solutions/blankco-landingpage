import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import { services } from './data/services'

const siteUrl = 'https://www.blankcoph.solutions'
const navigationOrder = ['/', '/about', '/services', '/projects', '/members', '/contact-us']

function navigationIndex(pathname) {
  const section = pathname.startsWith('/services/')
    ? '/services'
    : pathname.startsWith('/team/')
      ? '/members'
      : pathname
  return navigationOrder.indexOf(section)
}

const seoPages = {
  '/': {
    title: 'BlankCO PH Solutions | Web Development & Digital Solutions',
    description: 'BlankCO PH Solutions helps Philippine businesses improve operations through web development, custom software, workflow automation, and digital solutions.',
  },
  '/about': {
    title: 'About BlankCO PH Solutions | Cagayan, Philippines',
    description: 'Meet BlankCO PH Solutions, a student-led digital solutions team based in Baggao, Cagayan, building practical tools and better business operations.',
  },
  '/services': {
    title: 'Business Strategy, Automation & IoT Services | BlankCO',
    description: 'Explore business strategy, workflow automation, digital product development, IoT solutions, and ongoing support from BlankCO PH Solutions in the Philippines.',
  },
  '/projects': {
    title: 'Our Projects | BlankCO PH Solutions',
    description: 'Explore selected digital products, workflow systems, and business projects built by BlankCO PH Solutions and its collaborators.',
  },
  '/members': {
    title: 'Meet the Team | BlankCO PH Solutions',
    description: 'Meet the people behind BlankCO PH Solutions: a student-led team creating practical digital solutions in Cagayan, Philippines.',
  },
  '/contact-us': {
    title: 'Contact BlankCO PH Solutions | Start a Project',
    description: 'Contact BlankCO PH Solutions to discuss business strategy, workflow automation, a digital product, IoT development, or ongoing support for your team.',
  },
  '/terms': {
    title: 'Terms of Use | BlankCO PH Solutions',
    description: 'Read the terms that govern your use of the BlankCO PH Solutions website and services.',
  },
  '/privacy': {
    title: 'Privacy Policy | BlankCO PH Solutions',
    description: 'Learn how BlankCO PH Solutions collects, uses, stores, and protects personal information.',
  },
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
    const serviceSlug = pathname.startsWith('/services/') ? pathname.split('/')[2] : null
    const service = serviceSlug ? services.find((item) => item.slug === serviceSlug) : null
    const teamMemberId = pathname.startsWith('/team/') ? pathname.split('/')[2] : null
    const page = service
      ? {
          title: `${service.title} | BlankCO PH Solutions`,
          description: service.description,
        }
      : teamMemberId
        ? {
            title: 'Team Member | BlankCO PH Solutions',
            description: 'Meet a member of BlankCO PH Solutions, a student-led digital solutions team based in Baggao, Cagayan, Philippines.',
          }
        : seoPages[pathname] || seoPages['/']
    const canonicalUrl = `${siteUrl}${pathname === '/' ? '/' : pathname}`

    document.title = page.title
    setMeta('name', 'description', page.description)
    setMeta('name', 'robots', 'index,follow,max-image-preview:large')
    setMeta('property', 'og:title', page.title)
    setMeta('property', 'og:description', page.description)
    setMeta('property', 'og:url', canonicalUrl)
    setMeta('property', 'og:type', 'website')
    setMeta('property', 'og:site_name', 'BlankCO PH Solutions')
    setMeta('name', 'twitter:card', 'summary')
    setMeta('name', 'twitter:title', page.title)
    setMeta('name', 'twitter:description', page.description)

    let canonical = document.head.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl
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
