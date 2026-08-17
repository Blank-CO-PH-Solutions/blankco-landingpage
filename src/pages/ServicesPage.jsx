import { services } from '../data/services'

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">What we do</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Our services</h1>
      <p className="mt-6 max-w-2xl text-neutral-500">
        We combine business context with hands-on delivery, so every engagement moves from a clear question to useful, measurable progress.
      </p>
      <div className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.number}
            className="group relative bg-paper p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0a0a0a] sm:p-10"
          >
            <p className="text-sm font-semibold tracking-widest text-neutral-400 transition-colors duration-300 group-hover:text-neutral-200">
              {service.number}
            </p>
            <h2 className="mt-6 flex items-center justify-between gap-4 text-2xl font-semibold">
              {service.title}
              <span className="inline-block -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                →
              </span>
            </h2>
            <p className="mt-3 text-neutral-500 transition-colors duration-300 group-hover:text-neutral-300">
              {service.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
