import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPortalTicket } from '../data/messages'

const emptyForm = { name: '', email: '', company: '', subject: '', category: 'Order question', message: '' }

export default function TicketDialog({ open, onClose }) {
  const [values, setValues] = useState(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    const closeOnEscape = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])

  if (!open) return null

  const close = () => {
    setValues(emptyForm)
    setSent(false)
    setError('')
    onClose()
  }

  const update = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      setError('Enter a valid email address so our team can reply.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createPortalTicket(values)
      setSent(true)
    } catch (submitError) {
      setError(submitError.message || 'The ticket could not be sent. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-6" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <section role="dialog" aria-modal="true" aria-labelledby="ticket-dialog-title" className="max-h-[94vh] w-full max-w-2xl overflow-y-auto bg-paper shadow-2xl">
        <header className="flex items-start justify-between border-b border-line px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Customer support</p>
            <h2 id="ticket-dialog-title" className="mt-1 text-2xl font-semibold">{sent ? 'Ticket received' : 'Submit a support ticket'}</h2>
          </div>
          <button type="button" onClick={close} aria-label="Close ticket form" className="flex h-9 w-9 items-center justify-center border border-line transition hover:border-ink">×</button>
        </header>

        {sent ? (
          <div className="px-6 py-10 sm:px-8">
            <p className="text-lg font-semibold">Thanks — your ticket is in our support inbox.</p>
            <p className="mt-3 text-sm text-neutral-500">A member of our team will reply to the email address you provided.</p>
            <button type="button" onClick={close} className="mt-8 bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-700">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5 px-6 py-6 sm:px-8">
            <p className="text-sm text-neutral-500">Send this directly to the Blank CO admin inbox. You can also open the full customer portal to track orders and invoices.</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Your name
                <input required maxLength={100} name="name" value={values.name} onChange={update} className="mt-2 w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="Full name" autoComplete="name" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Email
                <input required type="email" maxLength={254} name="email" value={values.email} onChange={update} className="mt-2 w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="you@company.com" autoComplete="email" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Company
                <input required maxLength={100} name="company" value={values.company} onChange={update} className="mt-2 w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="Your company" autoComplete="organization" />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Topic
                <select name="category" value={values.category} onChange={update} className="mt-2 w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink">
                  {['Order question', 'Billing', 'Account support', 'Technical issue', 'Other'].map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Subject
              <input required maxLength={100} name="subject" value={values.subject} onChange={update} className="mt-2 w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="How can we help?" />
            </label>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Message
              <textarea required minLength={20} maxLength={500} rows={5} name="message" value={values.message} onChange={update} className="mt-2 w-full border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-ink" placeholder="Add enough detail for the team to act on it (20–500 characters)." />
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <p className="text-xs text-neutral-500">By submitting, you agree to the <Link to="/privacy" onClick={close} className="underline underline-offset-4 hover:text-ink">Privacy Policy</Link>.</p>
            <div className="flex justify-end gap-3 pt-1">
              <button type="button" onClick={close} className="border border-line px-5 py-3 text-xs font-semibold uppercase tracking-widest transition hover:border-ink">Cancel</button>
              <button type="submit" disabled={submitting} className="bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-700 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Sending...' : 'Send ticket'}</button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
