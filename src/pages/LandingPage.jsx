import { useState } from 'react'
import { Link } from 'react-router-dom'
import { services } from '../data/services'
import ContactSection from '../components/ContactSection'

const values = [
  { title: 'Straight answers', text: 'No fluff, no jargon. You always know exactly what\'s happening and why.' },
  { title: 'Done right', text: 'We take ownership of the outcome, not just the task. If it isn\'t solved, we aren\'t done.' },
  { title: 'Built to last', text: 'Solutions that are durable, maintainable, and make sense for the long haul.' },
]

const stats = [
  { value: '0', label: 'Problems solved' },
  { value: '0', label: 'Client satisfaction' },
  { value: '24/7', label: 'On-call support' },
  { value: '0', label: 'Years of experience' },
]

const steps = [
  { number: '01', title: 'Listen', text: 'We hear you out. No assumptions, no jumping ahead.' },
  { number: '02', title: 'Diagnose', text: 'We find the real root of the problem, not just the symptoms.' },
  { number: '03', title: 'Fix', text: 'We solve it, test it, and make sure it holds.' },
  { number: '04', title: 'Support', text: 'We stay close so the problem stays gone.' },
]

const testimonials = [
  {
    quote: 'They took a system that had been breaking for months and had it running smoothly within a week.',
    name: 'Maria Santos',
    role: 'Operations Manager',
  },
  {
    quote: 'No jargon, no delays. We told them the problem and they just handled it. That never happens.',
    name: 'Andres Reyes',
    role: 'Founder, Retail Co.',
  },
  {
    quote: 'The kind of team that actually treats your problem like it\'s their own. We won\'t work with anyone else.',
    name: 'Liza Fernandez',
    role: 'Finance Director',
  },
]

const faqs = [
  {
    q: 'What kinds of problems do you solve?',
    a: 'Strategy, broken systems, automation, digital tools, websites, and anything that quietly eats your time. If it\'s stuck or broken, chances are we\'ve fixed something like it before.',
  },
  {
    q: 'How fast can you start?',
    a: 'Most projects kick off within a few days of the first call. Urgent problems get moved to the front of the line.',
  },
  {
    q: 'What if the problem can\'t be fixed?',
    a: 'We tell you honestly. If it can\'t be fixed, we\'ll tell you why and show you the best way forward — even if that isn\'t with us.',
  },
  {
    q: 'How do you charge?',
    a: 'Per project or per month, depending on what you need. You get the number up front, before we start. No surprise invoices.',
  },
  {
    q: 'Do you work outside the Philippines?',
    a: 'Yes. Most of our work happens remotely, so timezone and location aren\'t a problem.',
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-line bg-paper">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-lg font-semibold">{q}</span>
        <span
          className={`shrink-0 text-2xl leading-none transition-transform duration-300 ${open ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="border-t border-line px-6 py-5 text-neutral-500">{a}</div>
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <section className="pattern-grid-inverse relative border-b border-line bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <p className="mb-6 inline-flex items-center gap-2 border border-paper/40 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-paper/80">
            Blank CO PH Solutions
          </p>
          <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
            We Solve Your
            <span className="block bg-paper text-ink px-4 py-1 inline-block mt-2">Problems.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-paper/70">
            No matter the mess, the headache, or the deadline — we show up, figure it out, and get it done. Clean and simple.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#contact"
              className="bg-paper px-8 py-3 text-sm font-semibold uppercase tracking-widest text-ink transition hover:bg-neutral-200"
            >
              Get in touch
            </a>
            <a
              href="#services"
              className="border border-paper/50 px-8 py-3 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-paper/10"
            >
              Our services
            </a>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 border-b border-line sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="border-line p-8 text-center sm:border-r last:border-r-0">
            <p className="text-4xl font-bold tracking-tight">{stat.value}</p>
            <p className="mt-2 text-sm uppercase tracking-widest text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </section>

      <section id="services" className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">What we do</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            A problem in, a solution out.
          </h2>
          <div className="mt-16 grid gap-px bg-line sm:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.number}
                className="group relative bg-paper p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0a0a0a] sm:p-10"
              >
                <p className="text-sm font-semibold tracking-widest text-neutral-400 transition-colors duration-300 group-hover:text-neutral-200">
                  {service.number}
                </p>
                <h3 className="mt-6 flex items-center justify-between gap-4 text-2xl font-semibold">
                  {service.title}
                  <span className="inline-block -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    →
                  </span>
                </h3>
                <p className="mt-3 text-neutral-500 transition-colors duration-300 group-hover:text-neutral-300">
                  {service.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">How we work</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Four steps. No surprises.
          </h2>
          <div className="mt-16 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="group relative overflow-hidden bg-paper p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0a0a0a] sm:p-10"
              >
                <span className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-y-100" />
                <div className="relative">
                  <p className="text-5xl font-bold tracking-tight text-neutral-300 transition-all duration-300 group-hover:translate-y-1 group-hover:text-paper/40">
                    {step.number}
                  </p>
                  <h3 className="mt-8 flex items-center justify-between gap-4 text-xl font-semibold">
                    {step.title}
                    <span className="inline-block -translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                      →
                    </span>
                  </h3>
                  <p className="mt-3 text-neutral-500 transition-colors duration-300 group-hover:text-paper/60">
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">What clients say</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Don&apos;t take our word for it.
          </h2>
          <div className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="flex flex-col justify-between bg-paper p-8 sm:p-10">
                <p className="text-lg font-medium leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-8">
                  <p className="font-semibold">{t.name}</p>
                  <p className="mt-1 text-sm uppercase tracking-widest text-neutral-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">Why Blank CO</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            No runaround. Just results.
          </h2>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {values.map((value) => (
              <div key={value.title}>
                <div className="h-px w-12 bg-paper" />
                <h3 className="mt-6 text-xl font-semibold">{value.title}</h3>
                <p className="mt-3 text-paper/60">{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="pattern-grid border-b border-line">
        <ContactSection />
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">Questions</p>
          <h2 className="mt-4 text-center text-4xl font-bold tracking-tight sm:text-5xl">
            Before you ask.
          </h2>
          <div className="mt-16 space-y-4">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      <section className="pattern-diagonal-inverse bg-ink text-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-20 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">Ready when you are</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Stuck on something right now?</h2>
          </div>
          <Link
            to="/contact-us"
            className="shrink-0 bg-paper px-8 py-3 text-sm font-semibold uppercase tracking-widest text-ink transition hover:bg-neutral-200"
          >
            Start a project
          </Link>
        </div>
      </section>
    </div>
  )
}
