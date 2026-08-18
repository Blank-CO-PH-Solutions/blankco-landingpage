import { Link } from 'react-router-dom'
import { services } from '../data/services'

const companyLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Contact', to: '/contact-us' },
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
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
            <li>blankco.ph@gmail.com</li>
            <li>+63 (0) 000 000 0000</li>
            <li>Baggao, Cagayan, Philippines</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-paper/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Blank CO PH Solutions. All rights reserved.</p>
          <p className="uppercase tracking-widest">Clear thinking. Better work.</p>
        </div>
      </div>
    </footer>
  )
}
