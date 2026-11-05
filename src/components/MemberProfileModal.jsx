import { useState } from 'react'
import { ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { getGithubAvatarUrl } from '../data/teamMembers'

export default function MemberProfileModal({ member, onClose }) {
  const [imageFailed, setImageFailed] = useState(false)
  const avatarUrl = member.avatar_url || getGithubAvatarUrl(member.github_url)
  const initials = member.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 px-5 py-8" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby="member-profile-name" className="relative w-full max-w-md border border-line bg-paper px-7 pb-7 pt-10 text-center text-ink shadow-2xl sm:px-10">
        <button type="button" onClick={onClose} aria-label="Close member details" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center border border-line transition hover:border-ink">
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-2xl font-semibold text-neutral-600">
          <span>{initials}</span>
          {avatarUrl && !imageFailed && <img src={avatarUrl} alt={`${member.name} profile`} onError={() => setImageFailed(true)} className="absolute inset-0 h-full w-full object-cover" />}
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-neutral-500">{member.position}</p>
        <h2 id="member-profile-name" className="mt-2 text-2xl font-semibold">{member.name}</h2>
        {member.bio && <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-neutral-600">{member.bio}</p>}
        {member.skills?.length > 0 && <div className="mt-5"><p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">Skills</p><div className="mt-2 flex flex-wrap justify-center gap-2">{member.skills.map((skill) => <span key={skill} className="border border-line bg-white px-3 py-1.5 text-xs text-neutral-700">{skill}</span>)}</div></div>}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href={member.github_url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 bg-ink px-4 text-xs font-semibold uppercase tracking-wider text-paper transition hover:bg-neutral-700">GitHub <ArrowTopRightOnSquareIcon className="h-4 w-4" /></a>
          {member.portfolio_url && <a href={member.portfolio_url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 border border-ink px-4 text-xs font-semibold uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper">Portfolio <ArrowTopRightOnSquareIcon className="h-4 w-4" /></a>}
        </div>
      </section>
    </div>
  )
}