import { ArrowTopRightOnSquareIcon, CodeBracketIcon } from '@heroicons/react/24/outline'

export default function ProjectLinks({ project }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {project.github_url && (
        <a
          href={project.github_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition hover:text-ink hover:decoration-ink"
        >
          <CodeBracketIcon className="h-4 w-4" /> GitHub repository
        </a>
      )}
      {project.live_site_url && (
        <a
          href={project.live_site_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition hover:text-ink hover:decoration-ink"
        >
          Live site <ArrowTopRightOnSquareIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  )
}