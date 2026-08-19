import axios from 'axios'
import { useState } from 'react'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState({var: '', message: ''});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [serviceInterest, setServiceInterest] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  function clearError(field) {
    if (error.var === field) setError({ var: '', message: '' });
  }

  function validate() {
    const NAME_REGEX = /^[\p{L}][\p{L}\s.'-]{1,99}$/u;
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const COMPANY_REGEX = /^[\p{L}\p{N}][\p{L}\p{N}\s&.'(),-]{1,99}$/u;

    const errors = [];

    if (!NAME_REGEX.test(name)) {
      errors.push({ var: 'name', message: 'Please enter a valid name.' });
    }

    if (!EMAIL_REGEX.test(email)) {
      errors.push({ var: 'email', message: 'Please enter a valid email address.' });
    }

    if (!COMPANY_REGEX.test(company)) {
      errors.push({ var: 'company', message: 'Please enter a valid company name.' });
    }

    if (serviceInterest.length < 10 || serviceInterest.length > 300) {
      errors.push({ var: 'serviceInterest', message: 'Please briefly describe what you need help with (10–300 characters).' });
    }

    if (message.length < 20 || message.length > 500) {
      errors.push({ var: 'message', message: 'Please provide more details about your request (20–500 characters).' });
    }

    if (!consent) {
      errors.push({ var: 'consent', message: 'Please agree to the use of your information so we can respond to your request.' });
    }

    setError(errors[0] ?? { var: '', message: '' });
    return errors.length === 0;
  }

  if (submitted) {
    return (
      <div className="border border-line bg-ink p-10 text-paper">
        <h2 className="text-2xl font-semibold">Thanks for reaching out.</h2>
        <p className="mt-3 text-paper/60">A member of our team will be in touch soon.</p>
      </div>
    )
  }

  return (
    <form
      className="grid gap-6"
      noValidate
      
      onSubmit={(e) => {
        e.preventDefault()

        if (!validate()) return

        axios.post('http://localhost:3000/api/leads', {
          name,
          email,
          company,
          serviceInterest,
          message,
          consent,
        }, { timeout: 10000 })
          .then(() => setSubmitted(true))
          .catch(() => setError({ var: '', message: 'Something went wrong sending your inquiry. Please try again.' }))
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium uppercase tracking-widest text-neutral-500">Name</label>
          <input
            onChange={(e) => { setName(e.target.value); clearError('name'); }}
            value={name}
            id="name"
            type="text"
            required
            className="mt-2 w-full border border-line bg-paper px-4 py-3 focus:border-ink focus:outline-none"
            placeholder="Your name"
          />
          {error.var === 'name' && (
            <span className="mt-2 block text-sm text-red-500">{error.message}</span>
          )}
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium uppercase tracking-widest text-neutral-500">Email</label>
          <input
            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
            value={email}
            id="email"
            type="email"
            required
            className="mt-2 w-full border border-line bg-paper px-4 py-3 focus:border-ink focus:outline-none"
            placeholder="you@company.com"
          />
          {error.var === 'email' && (
            <span className="mt-2 block text-sm text-red-500">{error.message}</span>
          )}
        </div>

        <div>
          <label htmlFor="company" className='text-sm font-medium uppercase tracking-widest text-neutral-500'>Company</label>
          <input
            onChange={(e) => { setCompany(e.target.value); clearError('company'); }}
            value={company}
            id="company"
            type="text" 
            required 
            className='mt-2 w-full border border-line bg-paper px-4 py-3 focus:border-ink focus:outline-none'
            placeholder='Your Company'
            pattern=".{10,}"
          />
          {error.var === 'company' && (
            <span className="mt-2 block text-sm text-red-500">{error.message}</span>
          )}
        </div>
        <div>
          <label htmlFor="serviceInterest" className="text-sm font-medium uppercase tracking-widest text-neutral-500">How do you need help with?</label>
          <input
            onChange={(e) => { setServiceInterest(e.target.value); clearError('serviceInterest'); }}
            value={serviceInterest}
            id="serviceInterest"
            type="text" 
            required 
            className='mt-2 w-full border border-line bg-paper px-4 py-3 focus:border-ink focus:outline-none'
            placeholder='Brief information of what can we help you with.'
          />
          {error.var === 'serviceInterest' && (
            <span className="mt-2 block text-sm text-red-500">{error.message}</span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium uppercase tracking-widest text-neutral-500">How can we help?</label>
        <textarea
          onChange={(e) => { setMessage(e.target.value); clearError('message'); }}
          value={message}
          id="message"
          required
          rows={6}
          className="mt-2 w-full resize-none border border-line bg-paper px-4 py-3 focus:border-ink focus:outline-none"
          placeholder="Tell us more information of your problem or request."
        />
        {error.var === 'message' && (
          <span className="mt-2 block text-sm text-red-500">{error.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="consent" className="text-sm font-medium uppercase tracking-widest text-neutral-500">
          <input 
            onChange={(e) => { setConsent(e.target.checked); clearError('consent'); }}
            value={consent}
            className=""
            type="checkbox" name="consent" id="consent" required />
          <span> I agree to submit my information</span>
        </label>
        {error.var === 'consent' && (
          <span className="mt-2 block text-sm text-red-500">{error.message}</span>
        )}
      </div>

      {error.var === '' && error.message && (
        <span className="mt-2 block text-sm text-red-500">{error.message}</span>
      )}

      <button
        type="submit"
        className="w-full bg-ink px-8 py-4 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-800"
      >
        Send inquiry
      </button>
    </form>
  )
}
