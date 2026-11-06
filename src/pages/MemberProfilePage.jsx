import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon, ArrowTopRightOnSquareIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline'
import ContactSection from '../components/ContactSection'
import { getGithubAvatarUrl, getTeamMemberById } from '../data/teamMembers'

function setMeta(attribute, key, content) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

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
  const { id } = useParams()
  const [result, setResult] = useState({ id: null, member: null, error: '' })

  useEffect(() => {
    let active = true

    getTeamMemberById(id, { publishedOnly: true })
      .then((data) => {
        if (active) setResult({ id, member: data, error: '' })
      })
      .catch(() => {
        if (active) setResult({ id, member: null, error: 'Team profile could not be loaded right now. Please try again later.' })
      })

    return () => { active = false }
  }, [id])

  const loading = result.id !== id
  const member = result.id === id ? result.member : null
  const loadError = result.id === id ? result.error : ''

  useEffect(() => {
    if (!member) return

    const title = `${member.name} — ${member.position} | BlankCO PH Solutions`
    const description = member.bio?.trim()
      || `Meet ${member.name}, ${member.position} at BlankCO PH Solutions, a student-led digital solutions team in Baggao, Cagayan.`

    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    setMeta('name', 'twitter:title', title)
    setMeta('name', 'twitter:description', description)
    if (member.avatar_url || getGithubAvatarUrl(member.github_url)) {
      setMeta('property', 'og:image', member.avatar_url || getGithubAvatarUrl(member.github_url))
    }
  }, [member])

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

  return (
    <div>
      <section className="border-b border-line bg-ink text-paper">
        <div className="pattern-grid-inverse mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <Link to="/members" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-paper/50 transition hover:text-paper/80">
            <ArrowLeftIcon className="h-4 w-4" /> All members
          </Link>

          <div className="mt-10 flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10">
            <MemberAvatar member={member} />

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-paper/55">{member.position}</p>
              <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{member.name}</h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-paper/65">
                {member.location && (
                  <span className="inline-flex items-center gap-2"><MapPinIcon className="h-4 w-4" /> {member.location}</span>
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
            {member.bio && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">About</p>
                <p className="mt-5 whitespace-pre-line text-lg leading-8 text-neutral-700">{member.bio}</p>
              </div>
            )}

            {skills.length > 0 && (
              <div className={member.bio ? 'mt-12' : ''}>
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

      <section className="border-b border-line">
        <ContactSection />
      </section>
    </div>
  )
}
