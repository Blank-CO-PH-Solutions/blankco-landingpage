import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Contact', to: '/contact-us' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:gap-8">
        <Link id="brand" to="/" className="shrink-0 leading-none">
          <span className="block text-xl font-bold tracking-tight">Blank CO<span className="text-neutral-400">.</span></span>
          <span className="block h-px w-full bg-current my-1" />
          <span className="block text-xs font-semibold uppercase tracking-widest text-neutral-500">PH Solutions</span>
        </Link>

        <ul className="hidden flex-1 items-center justify-center gap-5 text-sm font-medium md:flex lg:gap-8">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => `relative py-1 uppercase tracking-widest transition after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:bg-ink after:content-[''] after:transition-transform after:duration-300 ${isActive ? 'text-ink after:scale-x-100' : 'text-neutral-600 after:scale-x-0 hover:text-ink hover:after:scale-x-100'}`}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <Link
          to="/contact-us"
          className="hidden shrink-0 bg-ink px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-800 md:block lg:px-6 lg:text-sm"
        >
          Get in touch
        </Link>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center border border-line bg-paper md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6l-12 12" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-paper px-6 py-6 md:hidden">
          <ul className="flex flex-col gap-1 text-sm font-medium">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={close}
                  end={link.to === '/'}
                  className={({ isActive }) => `block border-b py-3 uppercase tracking-widest transition ${isActive ? 'border-b-ink font-semibold text-ink' : 'border-line text-neutral-700 hover:text-ink'}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <Link
            to="/contact-us"
            onClick={close}
            className="mt-6 block bg-ink px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-800"
          >
            Get in touch
          </Link>
        </div>
      )}
    </header>
  )
}
