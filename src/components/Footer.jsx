import { Link } from 'react-router-dom'
import { services } from '../data/services'
import AdminTerminal from './AdminTerminal'

const companyLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Members', to: '/members' },
  { label: 'Contact', to: '/contact-us' },
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <p className="leading-none">
            <span className="block text-xl font-bold tracking-tight">Blank CO<span className="text-paper/40">.</span></span>
            <span className="block h-px w-full bg-paper/40 my-1" />
            <span className="block text-xs font-semibold uppercase tracking-widest text-paper/50">PH Solutions</span>
          </p>
          <p className="mt-4 text-sm text-paper/60">
            A student-led digital solutions team from San Jose, Baggao, Cagayan, Philippines.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">Company</p>
          <ul className="mt-4 space-y-2 text-sm">
            {companyLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-paper/70 transition hover:text-paper">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">Services</p>
          <ul className="mt-4 space-y-2 text-sm">
            {services.map((service) => (
              <li key={service.number}>
                <Link to={`/services/${service.slug}`} className="text-paper/70 transition hover:text-paper">
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-paper/70">
            <li>hello@blankcoph.solutions</li>
            <li>+639531743347</li>
            <li>Baggao, Cagayan, Philippines</li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">More</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/members" className="text-paper/70 transition hover:text-paper">Meet the team</Link>
            </li>
            <li>
              <Link to="/terms" className="text-paper/70 transition hover:text-paper">Terms of Use</Link>
            </li>
            <li>
              <Link to="/privacy" className="text-paper/70 transition hover:text-paper">Privacy Policy</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-6 text-center text-xs text-paper/50 sm:grid-cols-[1fr_minmax(0,2fr)_1fr] sm:items-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} Blank CO PH Solutions. All rights reserved.</p>
          <div className="text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-paper/40">Our promise</p>
            <p className="mt-1 text-sm font-semibold text-paper">If it isn&apos;t solved, we aren&apos;t done.</p>
            <p className="mt-1 text-paper/60">Straight answers, real results, done right.</p>
          </div>
          <div className="flex items-center justify-center gap-3 sm:justify-end">
            <p className="uppercase tracking-widest">Clear thinking. Better work.</p>
            <AdminTerminal />
          </div>
        </div>
      </div>
    </footer>
  )
}
