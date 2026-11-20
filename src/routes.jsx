import { Route, Routes } from 'react-router-dom'
import App from './App.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import ServiceDetailPage from './pages/ServiceDetailPage.jsx'
import ContactUsPage from './pages/ContactUsPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import MembersPage from './pages/MembersPage.jsx'
import MemberProfilePage from './pages/MemberProfilePage.jsx'
import TermsPage from './pages/TermsPage.jsx'
import PrivacyPage from './pages/PrivacyPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function AppRoutes() {
  return (
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
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/admin" element={<AdminRoute />} />
    </Routes>
  )
}
