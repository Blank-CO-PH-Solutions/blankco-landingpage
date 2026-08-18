import { useParams, Link } from 'react-router-dom'
import { services } from '../data/services'
import ContactSection from '../components/ContactSection'

export default function ServiceDetailPage() {
  const { slug } = useParams()
  const service = services.find((s) => s.slug === slug)
  const idx = services.findIndex((s) => s.slug === slug)
  const next = services[(idx + 1) % services.length]

  if (!service) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="text-neutral-500">Service not found.</p>
        <Link to="/services" className="mt-4 inline-block underline">Back to services</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <section className="border-b border-line bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <Link to="/services" className="text-xs font-semibold uppercase tracking-widest text-paper/50 transition hover:text-paper/80">
            ← All services
          </Link>
          <p className="mt-8 text-sm font-semibold tracking-widest text-paper/40">
            {service.number}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            {service.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-paper/70">
            {service.description}
          </p>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">What we handle</p>
          <ul className="mt-8 space-y-4">
            {service.whatWeDo.map((item) => (
              <li key={item} className="flex items-start gap-4 border-b border-line pb-4">
                <span className="mt-1 h-2 w-2 shrink-0 bg-ink" />
                <span className="text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Related service</p>
          <Link
            to={`/services/${next.slug}`}
            className="group mt-8 block border border-line bg-paper p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0a0a0a]"
          >
            <p className="text-sm font-semibold tracking-widest text-neutral-400">{next.number}</p>
            <h2 className="mt-6 flex items-center justify-between gap-4 text-2xl font-semibold">
              {next.title}
              <span className="inline-block -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">→</span>
            </h2>
            <p className="mt-3 text-neutral-500">{next.text}</p>
          </Link>
        </div>
      </section>

      <section className="border-b border-line">
        <ContactSection />
      </section>
    </div>
  )
}
