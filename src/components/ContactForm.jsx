import { useState } from 'react'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="border border-line bg-ink p-10 text-paper">
        <h2 className="text-2xl font-semibold">Got it. We&apos;re on it.</h2>
        <p className="mt-3 text-paper/60">Someone from the team will reach out shortly.</p>
      </div>
    )
  }

  return (
    <form
      className="grid gap-6"
      onSubmit={(e) => {
        e.preventDefault()
        setSubmitted(true)
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium uppercase tracking-widest text-neutral-500">Name</label>
          <input
            id="name"
            type="text"
            required
            className="mt-2 w-full border border-line bg-paper px-4 py-3 focus:border-ink focus:outline-none"
            placeholder="Juan dela Cruz"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium uppercase tracking-widest text-neutral-500">Email</label>
          <input
            id="email"
            type="email"
            required
            className="mt-2 w-full border border-line bg-paper px-4 py-3 focus:border-ink focus:outline-none"
            placeholder="you@company.com"
          />
        </div>
      </div>
      <div>
        <label htmlFor="problem" className="text-sm font-medium uppercase tracking-widest text-neutral-500">The problem</label>
        <textarea
          id="problem"
          required
          rows={6}
          className="mt-2 w-full resize-none border border-line bg-paper px-4 py-3 focus:border-ink focus:outline-none"
          placeholder="What's broken, stuck, or missing?"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-ink px-8 py-4 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-800"
      >
        Send it over
      </button>
    </form>
  )
}
