import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { cleanMemberText, getGithubAvatarUrl, getTeamMemberSlug, listTeamMembers } from '../data/teamMembers'
import { getPreloadedTeamMembers } from '../data/preloaded'

function MemberAvatar({ member }) {
  const [imageFailed, setImageFailed] = useState(false)
  const avatarUrl = member.avatar_url || getGithubAvatarUrl(member.github_url)
  const initials = member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <span className="relative inline-flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 font-semibold text-neutral-600">
      <span>{initials}</span>
      {avatarUrl && !imageFailed && (
        <img
          src={avatarUrl}
          alt={`${member.name} profile`}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </span>
  )
}

export default function HomeTeamSection() {
  const preloadedMembers = getPreloadedTeamMembers()
  const [members, setMembers] = useState(preloadedMembers || [])

  useEffect(() => {
    if (preloadedMembers) return undefined

    let active = true

    listTeamMembers({ publishedOnly: true })
      .then((items) => {
        if (active) setMembers(items)
      })
      .catch(() => {})

    return () => { active = false }
  }, [preloadedMembers])

  if (!members.length) return null

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">The people behind the work</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Meet our team.</h2>
          </div>
          <Link to="/members" className="inline-flex w-fit items-center gap-2 border-b border-ink pb-1 text-sm font-semibold">
            All members <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.slice(0, 6).map((member) => (
            <Link
              key={member.id}
              to={`/team/${getTeamMemberSlug(member)}`}
              className="group flex min-w-0 flex-col border border-line bg-paper p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#0a0a0a]"
            >
              <MemberAvatar member={member} />
              <p className="mt-4 text-lg font-semibold leading-tight">{member.name}</p>
              <p className="mt-1 text-sm text-neutral-600">{member.position}</p>
              {cleanMemberText(member.location) && <p className="mt-1 text-sm text-neutral-500">{cleanMemberText(member.location)}</p>}
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink">
                View profile <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
