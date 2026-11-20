import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowTopRightOnSquareIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline'
import ContactSection from '../components/ContactSection'
import { cleanMemberText, getGithubAvatarUrl, getTeamMemberBySlug, getTeamMemberSlug } from '../data/teamMembers'
import { getPreloadedTeamMembers } from '../data/preloaded'
import { getTeamProfileSummary } from '../seo'

function MemberAvatar({ member }) {
  const [imageFailed, setImageFailed] = useState(false)
  const avatarUrl = member.avatar_url || getGithubAvatarUrl(member.github_url)
  const initials = member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <span className="relative inline-flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-700 text-3xl font-semibold text-paper sm:h-36 sm:w-36">
      <span>{initials}</span>
      {avatarUrl && !imageFailed && (
        <img
          src={avatarUrl}
          alt={`${member.name} profile`}
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </span>
  )
}

export default function MemberProfilePage() {
  const { slug } = useParams()
  const preloadedMembers = getPreloadedTeamMembers()
  const preloadedMember = preloadedMembers
    ? preloadedMembers.find((member) => getTeamMemberSlug(member) === slug) || null
    : null
  const hasPreloadedMembers = preloadedMembers !== null
  const [result, setResult] = useState(() => (
    hasPreloadedMembers
      ? { slug, member: preloadedMember, error: '' }
      : { slug: null, member: null, error: '' }
  ))

  useEffect(() => {
    if (hasPreloadedMembers) return undefined

    let active = true

    getTeamMemberBySlug(slug, { publishedOnly: true })
      .then((data) => {
        if (active) setResult({ slug, member: data, error: '' })
      })
      .catch(() => {
        if (active) setResult({ slug, member: null, error: 'Team profile could not be loaded right now. Please try again later.' })
      })

    return () => { active = false }
  }, [slug, hasPreloadedMembers])

  const loading = result.slug !== slug
  const member = result.slug === slug ? result.member : null
  const loadError = result.slug === slug ? result.error : ''

  if (loading) {
    return <p className="mx-auto max-w-6xl px-6 py-24 text-center text-sm text-neutral-500">Loading team profile...</p>
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p role="alert" className="text-sm text-neutral-600">{loadError}</p>
        <Link to="/members" className="mt-6 inline-block text-sm font-semibold uppercase tracking-widest underline underline-offset-4">Back to the team</Link>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p role="alert" className="text-neutral-500">Team profile not found.</p>
        <Link to="/members" className="mt-6 inline-block text-sm font-semibold uppercase tracking-widest underline underline-offset-4">Back to the team</Link>
      </div>
    )
  }

  const education = Array.isArray(member.education) ? member.education : []
  const skills = Array.isArray(member.skills) ? member.skills : []
  const otherMembers = (preloadedMembers || [])
    .filter((item) => getTeamMemberSlug(item) !== slug)
    .slice(0, 6)

  return (
    <div>
      <section className="border-b border-line bg-ink text-paper">
        <div className="pattern-grid-inverse mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-widest text-paper/50">
            <Link to="/" className="transition hover:text-paper/80">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/members" className="transition hover:text-paper/80">Members</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-paper/80">{member.name}</span>
          </nav>

          <div className="mt-10 flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10">
            <MemberAvatar member={member} />

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-paper/55">{member.position}</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{member.name}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-paper/65">
                {cleanMemberText(member.location) && (
                  <span className="inline-flex items-center gap-2"><MapPinIcon className="h-4 w-4" /> {cleanMemberText(member.location)}</span>
                )}
                {member.email && (
                  <a href={`mailto:${member.email}`} className="inline-flex items-center gap-2 underline underline-offset-4 hover:text-paper"><EnvelopeIcon className="h-4 w-4" /> {member.email}</a>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {member.github_url && (
                  <a href={member.github_url} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 bg-paper px-5 text-xs font-semibold uppercase tracking-wider text-ink transition hover:bg-neutral-200">
                    GitHub <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                )}
                {member.portfolio_url && (
                  <a href={member.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 border border-paper/40 px-5 text-xs font-semibold uppercase tracking-wider text-paper transition hover:border-paper hover:bg-paper hover:text-ink">
                    Portfolio <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
          <div className="min-w-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">About</p>
              <p className="mt-5 text-lg leading-8 text-neutral-700">{getTeamProfileSummary(member)}</p>
              {cleanMemberText(member.bio) && (
                <blockquote className="mt-6 border-l-2 border-ink/25 pl-5 text-base italic leading-7 text-neutral-600">
                  <span className="whitespace-pre-line">“{cleanMemberText(member.bio)}”</span>
                </blockquote>
              )}
            </div>

            {skills.length > 0 && (
              <div className="mt-12">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Skills</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <li key={skill} className="border border-line bg-white px-3 py-1.5 text-sm text-neutral-700">{skill}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <aside className="min-w-0">
            {education.length > 0 && (
              <div className="border border-line bg-white p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Education</p>
                <div className="mt-5 space-y-5">
                  {education.map((item, index) => {
                    const years = [item.start_year, item.end_year].filter(Boolean).join(' – ')
                    return (
                      <div key={`${item.institution}-${index}`} className="border-b border-line pb-5 last:border-b-0 last:pb-0">
                        <p className="text-sm font-semibold">{item.qualification || item.institution}</p>
                        {item.qualification && item.institution && <p className="mt-1 text-sm text-neutral-600">{item.institution}</p>}
                        {years && <p className="mt-1 text-xs text-neutral-500">{years}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 border border-line bg-white p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Get in touch</p>
              {member.email ? (
                <a href={`mailto:${member.email}`} className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:text-neutral-600">{member.email}</a>
              ) : (
                <Link to="/contact-us" className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:text-neutral-600">Contact the team</Link>
              )}
            </div>
          </aside>
        </div>
      </section>

      {otherMembers.length > 0 && (
        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">The rest of the team</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">More from BlankCO PH Solutions.</h2>
              </div>
              <Link to="/members" className="inline-flex w-fit items-center gap-2 border-b border-ink pb-1 text-sm font-semibold">
                All members <span aria-hidden="true">→</span>
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherMembers.map((other) => (
                <Link
                  key={other.id}
                  to={`/team/${getTeamMemberSlug(other)}`}
                  className="group flex min-w-0 flex-col border border-line bg-paper p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0a0a0a]"
                >
                  <p className="text-lg font-semibold leading-tight">{other.name}</p>
                  <p className="mt-1 text-sm text-neutral-600">{other.position}</p>
                  {cleanMemberText(other.location) && <p className="mt-1 text-sm text-neutral-500">{cleanMemberText(other.location)}</p>}
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink">
                    View profile <span aria-hidden="true">→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-b border-line">
        <ContactSection />
      </section>
    </div>
  )
}
