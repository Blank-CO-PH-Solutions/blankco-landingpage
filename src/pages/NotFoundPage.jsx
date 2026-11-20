import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
      <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">404</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">This page could not be found.</h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-500">
        The link may be broken or the page may have moved. Head back home or explore what we do.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="bg-ink px-8 py-3 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-800"
        >
          Back to home
        </Link>
        <Link
          to="/services"
          className="border border-ink px-8 py-3 text-sm font-semibold uppercase tracking-widest text-ink transition hover:bg-ink hover:text-paper"
        >
          View services
        </Link>
      </div>
    </div>
  )
}
