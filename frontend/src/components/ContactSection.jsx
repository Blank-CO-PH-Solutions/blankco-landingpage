import ContactForm from './ContactForm'

export default function ContactSection() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Let&apos;s talk</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Tell us what you&apos;re working on.
          </h2>
          <p className="mt-6 max-w-md text-neutral-500">
            Share the challenge, the opportunity, or the idea. We&apos;ll help you decide whether Blank CO is the right partner for the next step.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="mailto:blankco.ph@gmail.com"
              className="bg-ink px-8 py-3 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-800"
            >
              blankco.ph@gmail.com
            </a>
            <a
              href="tel:+630000000000"
              className="border border-ink px-8 py-3 text-sm font-semibold uppercase tracking-widest text-ink transition hover:bg-ink hover:text-paper"
            >
              Book a call
            </a>
          </div>
          <div className="mt-12 grid gap-px border border-line bg-line">
            <div className="bg-paper p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Email</p>
              <p className="mt-2 font-medium">blankco.ph@gmail.com</p>
            </div>
            <div className="bg-paper p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Phone</p>
              <p className="mt-2 font-medium">+63 (0) 000 000 0000</p>
            </div>
            <div className="bg-paper p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Location</p>
              <p className="mt-2 font-medium">San Jose, Baggao, Cagayan, Philippines</p>
            </div>
          </div>
        </div>
        <div className="border border-line bg-paper p-8 shadow-[8px_8px_0_0_#0a0a0a] sm:p-10">
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
