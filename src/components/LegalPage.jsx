import { Link } from 'react-router-dom'

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-neutral-700">{children}</div>
    </section>
  )
}

export default function LegalPage({ eyebrow = 'Legal', title, intro, lastUpdated, children }) {
  return (
    <div>
      <section className="border-b border-line bg-ink text-paper">
        <div className="pattern-grid-inverse mx-auto max-w-4xl px-6 py-20 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/55">{eyebrow}</p>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-paper/65">{intro}</p>
          <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-paper/40">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
        <div className="space-y-10">{children}</div>

        <div className="mt-14 border-t border-line pt-8 text-sm text-neutral-600">
          <p>
            Questions about this page? Contact us at{' '}
            <a href="mailto:hello@blankcoph.solutions" className="font-medium text-ink underline underline-offset-4">
              hello@blankcoph.solutions
            </a>
            {' '}or return to the <Link to="/" className="font-medium text-ink underline underline-offset-4">homepage</Link>.
          </p>
        </div>
      </section>
    </div>
  )
}
