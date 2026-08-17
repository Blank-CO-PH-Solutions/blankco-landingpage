import { useState } from 'react'
import { Link } from 'react-router-dom'
import { services } from '../data/services'
import ContactSection from '../components/ContactSection'

const values = [
  { title: 'Clear thinking', text: 'We make the work understandable: what matters, what comes next, and why.' },
  { title: 'Practical delivery', text: 'We focus on useful progress, not presentations or unnecessary complexity.' },
  { title: 'Built for the next step', text: 'Our work is designed to be manageable today and adaptable as your business grows.' },
]

const stats = [
  { value: 'PH', label: 'Philippine-based' },
  { value: 'BSIT', label: 'Third-year students' },
  { value: 'Remote', label: 'Built to collaborate' },
  { value: 'Baggao', label: 'Cagayan, Philippines' },
]

const steps = [
  { number: '01', title: 'Discover', text: 'We learn the context, constraints, and outcome that matters most.' },
  { number: '02', title: 'Define', text: 'We turn insights into a focused scope, clear priorities, and a workable plan.' },
  { number: '03', title: 'Build', text: 'We create, test, and refine the solution with your team in the loop.' },
  { number: '04', title: 'Improve', text: 'We support the handover and identify the next opportunities to make it better.' },
]

const expectations = [
  {
    title: 'A shared understanding',
    text: 'We start by getting close to the problem before recommending a solution.',
  },
  {
    title: 'Work you can follow',
    text: 'You will have visibility into priorities, progress, and the decisions along the way.',
  },
  {
    title: 'A useful outcome',
    text: 'Every recommendation and deliverable should make a real difference to your business.',
  },
]

const faqs = [
  {
    q: 'What can Blank CO help with?',
    a: 'We work on business strategy, workflow automation, websites, digital tools, and the operating challenges around them. If your team has outgrown a process or needs a better way to work, let’s talk.',
  },
  {
    q: 'How fast can you start?',
    a: 'After an introductory conversation, we will confirm fit, scope, and availability. Timelines depend on the work, but we will always set expectations clearly before we begin.',
  },
  {
    q: 'What if we are not the right fit?',
    a: 'We will be upfront about it. If another approach, partner, or platform makes more sense, we will say so and help you understand the options.',
  },
  {
    q: 'How do you charge?',
    a: 'Engagements can be scoped by project or arranged as ongoing support. You will receive a clear proposal and pricing before any work starts.',
  },
  {
    q: 'Do you work outside the Philippines?',
    a: 'Yes. We are based in San Jose, Baggao, Cagayan, Philippines, and can collaborate remotely with teams wherever a strong working rhythm can be established.',
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
            Make the work
            <span className="block bg-paper text-ink px-4 py-1 inline-block mt-2">work better.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-paper/70">
            We are third-year BSIT students from Saint Joseph College of Baggao, creating practical digital solutions for teams in the Philippines and beyond.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#contact"
              className="bg-paper px-8 py-3 text-sm font-semibold uppercase tracking-widest text-ink transition hover:bg-neutral-200"
            >
              Start a conversation
            </a>
            <a
              href="#services"
              className="border border-paper/50 px-8 py-3 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-paper/10"
            >
              Explore services
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
            The right support for the work ahead.
          </h2>
          <div className="mt-16 grid gap-px bg-line sm:grid-cols-2">
            {services.map((service) => (
              <Link
                key={service.number}
                to={`/services/${service.slug}`}
                className="group relative block bg-paper p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0a0a0a] sm:p-10"
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">How we work</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            A clear path from challenge to progress.
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
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">What to expect</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            A better way to work together.
          </h2>
          <div className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-3">
            {expectations.map((expectation) => (
              <div key={expectation.title} className="flex flex-col justify-between bg-paper p-8 sm:p-10">
                <p className="text-lg font-semibold leading-relaxed">{expectation.title}</p>
                <p className="mt-4 text-neutral-500">{expectation.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">Why Blank CO</p>
          <h2 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Thoughtful support, built around your business.
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

      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Our promise</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
            If it isn&apos;t solved, we aren&apos;t done.
          </h2>
          <p className="mt-6 text-lg text-neutral-500">
            Straight answers, real results, done right.
          </p>
        </div>
      </section>

      <section id="contact" className="pattern-grid border-b border-line">
        <ContactSection />
      </section>

      <section className="border-b border-line">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-neutral-500">Questions</p>
          <h2 className="mt-4 text-center text-4xl font-bold tracking-tight sm:text-5xl">
            Common questions.
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
            <p className="text-xs font-semibold uppercase tracking-widest text-paper/50">Let’s get started</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Have a challenge worth solving?</h2>
          </div>
          <Link
            to="/contact-us"
            className="shrink-0 bg-paper px-8 py-3 text-sm font-semibold uppercase tracking-widest text-ink transition hover:bg-neutral-200"
          >
            Talk to our team
          </Link>
        </div>
      </section>
    </div>
  )
}
