import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowTopRightOnSquareIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { getGithubAvatarUrl, listTeamMembers } from '../data/teamMembers'

function MemberAvatar({ member, size = 'h-20 w-20' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const avatarUrl = member.avatar_url || getGithubAvatarUrl(member.github_url)
  const initials = member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <span className={`relative inline-flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 font-semibold text-neutral-600`}>
      <span>{initials}</span>
      {avatarUrl && !imageFailed && <img src={avatarUrl} alt={`${member.name} profile`} onError={() => setImageFailed(true)} className="absolute inset-0 h-full w-full object-cover" />}
    </span>
  )
}

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    listTeamMembers({ publishedOnly: true })
      .then((items) => {
        if (active) setMembers(items)
      })
      .catch(() => {
        if (active) setLoadError('Team profiles could not be loaded right now. Please try again later.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  return (
    <div>
      <section className="border-b border-line bg-ink text-paper">
        <div className="pattern-grid-inverse mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/55">The people behind the work</p>
          <h1 className="mt-5 text-5xl font-bold leading-tight sm:text-6xl">Meet our team.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-paper/65">A student-led team building practical digital solutions from Baggao, Cagayan.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        {loading ? (
          <p className="border-b border-line py-12 text-center text-sm text-neutral-500">Loading team profiles...</p>
        ) : loadError ? (
          <p role="alert" className="border border-line p-6 text-sm text-neutral-600">{loadError}</p>
        ) : members.length ? (
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {members.map((member, index) => (
              <article
                key={member.id}
                style={{ animationDelay: `${index * 80}ms` }}
                className="page-enter-up relative flex min-w-0 flex-col border border-line bg-paper p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0a0a0a] sm:p-8"
              >
                <Link to={`/team/${member.id}`} aria-label={`View ${member.name}'s profile`} className="absolute inset-0 z-10">
                  <span className="sr-only">View profile</span>
                </Link>

                <MemberAvatar member={member} size="h-20 w-20" />
                <h2 className="mt-4 text-lg font-semibold leading-tight">{member.name}</h2>
                <p className="mt-1 text-sm text-neutral-600">{member.position}</p>
                {member.location && (
                  <p className="mt-1 text-sm text-neutral-500">{member.location}</p>
                )}

                <div className="relative z-20 mt-6 flex flex-wrap gap-x-5 gap-y-3 border-t border-line pt-4">
                  {member.github_url && <a href={member.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-ink hover:decoration-ink">GitHub <ArrowTopRightOnSquareIcon className="h-4 w-4" /></a>}
                  {member.portfolio_url && <a href={member.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 underline decoration-neutral-300 underline-offset-4 hover:text-ink hover:decoration-ink">Portfolio <ArrowTopRightOnSquareIcon className="h-4 w-4" /></a>}
                </div>
                {member.skills?.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{member.skills.slice(0, 4).map((skill) => <span key={skill} className="border border-line px-2.5 py-1 text-[10px] text-neutral-600">{skill}</span>)}</div>}
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink">
                  View profile <span aria-hidden="true">→</span>
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-y border-line py-16 text-center">
            <UserGroupIcon className="mx-auto h-8 w-8 text-neutral-400" />
            <p className="mt-4 text-lg font-semibold">Team profiles are being prepared.</p>
          </div>
        )}
      </section>
    </div>
  )
}