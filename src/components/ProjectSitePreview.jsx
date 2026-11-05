export default function ProjectSitePreview({ project }) {
  if (!project.live_site_url) {
    const isMobileApp = /attendance|flutter|mobile|android|ios/i.test(`${project.name} ${project.description}`)

    return (
      <div className="absolute left-1/2 top-[46%] z-10 w-[76%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden border-4 border-white bg-white shadow-[0_12px_30px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:-translate-y-[55%]">
        <div className="flex h-7 items-center gap-1.5 border-b border-neutral-200 bg-white px-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f48b7d]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#e7be68]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#87b68b]" />
          <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-neutral-500">App preview</span>
        </div>
        <div className={`flex aspect-video items-center justify-center p-2 ${project.visual || 'project-visual-blue'}`}>
          {isMobileApp ? (
            <div className="h-full max-h-40 aspect-[0.52] overflow-hidden rounded-[1.1rem] border-[5px] border-neutral-900 bg-white shadow-lg">
              <div className="flex h-full flex-col px-2 py-2 text-[7px] text-neutral-800">
                <div className="flex items-center justify-between font-semibold"><span>9:41</span><span>● ● ●</span></div>
                <div className="mt-2 text-[6px] text-neutral-500">WELCOME BACK</div>
                <div className="mt-0.5 text-[9px] font-bold leading-tight">{project.name}</div>
                <div className="mt-2 rounded-md bg-emerald-50 p-1.5">
                  <span className="block text-[6px] font-semibold text-emerald-800">Today&apos;s status</span>
                  <span className="mt-0.5 block text-[8px] font-bold text-emerald-900">Ready to check in</span>
                </div>
                <div className="mt-1.5 rounded-md bg-neutral-100 p-1.5">
                  <span className="block text-[6px] font-semibold">Quick actions</span>
                  <span className="mt-1 block h-3 rounded-sm bg-ink" />
                </div>
                <div className="mt-auto flex justify-around border-t border-neutral-100 pt-1 text-[5px] text-neutral-500"><span>Home</span><span>History</span><span>Profile</span></div>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full overflow-hidden border border-neutral-200 bg-white text-left shadow-lg">
              <aside className="w-[27%] shrink-0 bg-neutral-900 p-2 text-white">
                <p className="text-[7px] font-bold leading-tight">{project.name}</p>
                <div className="mt-3 space-y-2 text-[6px] text-white/65"><p className="bg-white/15 px-1 py-1 text-white">Dashboard</p><p>Requests</p><p>Referrals</p><p>Ratings</p></div>
              </aside>
              <div className="min-w-0 flex-1 bg-neutral-50 p-2 text-neutral-800">
                <div className="flex items-center justify-between gap-1"><p className="truncate text-[8px] font-bold">Service requests</p><span className="shrink-0 bg-emerald-100 px-1 py-0.5 text-[5px] font-semibold text-emerald-800">12 open</span></div>
                <div className="mt-2 grid grid-cols-3 gap-1"><div className="bg-white p-1"><p className="text-[5px] text-neutral-500">New</p><p className="text-[8px] font-bold">08</p></div><div className="bg-white p-1"><p className="text-[5px] text-neutral-500">In review</p><p className="text-[8px] font-bold">12</p></div><div className="bg-white p-1"><p className="text-[5px] text-neutral-500">Done</p><p className="text-[8px] font-bold">36</p></div></div>
                <div className="mt-2 space-y-1 bg-white p-1.5"><p className="mb-1 text-[6px] font-semibold">Recent requests</p><p className="flex justify-between gap-1 border-t border-neutral-100 py-1 text-[5px]"><span className="truncate">Equipment assistance</span><span className="text-amber-700">Review</span></p><p className="flex justify-between gap-1 border-t border-neutral-100 py-1 text-[5px]"><span className="truncate">Crop consultation</span><span className="text-emerald-700">Routed</span></p></div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  let liveSite
  try {
    liveSite = new URL(project.live_site_url)
  } catch {
    return null
  }
  const hostname = liveSite.hostname

  return (
    <div className="absolute left-1/2 top-[46%] z-10 w-[76%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden border-4 border-white bg-white shadow-[0_12px_30px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:-translate-y-[55%]">
      <div className="flex h-7 items-center gap-1.5 border-b border-neutral-200 bg-white px-2">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f48b7d]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#e7be68]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#87b68b]" />
        <span className="ml-auto max-w-[65%] truncate text-[9px] text-neutral-500">{hostname}</span>
      </div>
      <div className="relative aspect-video overflow-hidden bg-neutral-100">
        <iframe
          title={`${project.name} live site preview`}
          src={project.live_site_url}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
          tabIndex={-1}
          className="pointer-events-none h-full w-full border-0"
        />
        <a
          href={project.live_site_url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${project.name} live site`}
          title="Open live site"
          className="absolute inset-0 z-10"
        />
      </div>
    </div>
  )
}