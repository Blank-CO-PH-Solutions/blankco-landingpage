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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
        </Route>
        <Route path="/admin" element={<AdminRoute />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
