import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminRoute from './components/AdminRoute.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import ServiceDetailPage from './pages/ServiceDetailPage.jsx'
import ContactUsPage from './pages/ContactUsPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import MembersPage from './pages/MembersPage.jsx'
import MemberProfilePage from './pages/MemberProfilePage.jsx'
import { services } from './data/services.js'

const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Blank CO PH Solutions',
  url: 'https://blankcoph.solutions',
  logo: 'https://blankcoph.solutions/logo.png',
  image: 'https://blankcoph.solutions/logo.png',
  email: 'hello@blankcoph.solutions',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'San Jose',
    addressLocality: 'Baggao',
    addressRegion: 'Cagayan',
    postalCode: '3506',
    addressCountry: 'PH',
  },
  sameAs: [
    'https://github.com/Blank-CO-PH-Solutions',
    'https://github.com/nathaniel-ramos-dev',
  ],
  knowsAbout: services.map((service) => service.title),
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <script type="application/ld+json">{JSON.stringify(organizationStructuredData)}</script>
      <Routes>
        <Route element={<App />}>
          <Route index element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/team/:slug" element={<MemberProfilePage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
        </Route>
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
