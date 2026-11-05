import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProjects } from '../data/projects'
import ProjectLinks from '../components/ProjectLinks'

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState('All work')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let active = true
    listProjects({ publishedOnly: true })
      .then((items) => {
        if (active) setProjects(items)
      })
      .catch(() => {
        if (active) setLoadError('Projects could not be loaded right now. Please try again later.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [])

  const categories = ['All work', ...new Set(projects.map((project) => project.category))]
  const visibleProjects = useMemo(
    () => activeCategory === 'All work'
      ? projects
      : projects.filter((project) => project.category === activeCategory),
    [activeCategory, projects],
  )

  return (
    <div>
      <section className="border-b border-line bg-ink text-paper">
        <div className="pattern-grid-inverse mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <p className="text-xs font-semibold uppercase tracking-widest text-paper/55">Selected work · 2024—2025</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-bold leading-tight sm:text-7xl">Good work, made useful.</h1>
          <p className="mt-7 max-w-xl text-lg text-paper/65">
            A few ways we have helped teams make their day-to-day clearer, simpler, and more effective.
          </p>
          <p className="mt-12 border-t border-paper/20 pt-5 text-sm text-paper/55">
            {projects.length.toString().padStart(2, '0')} projects <span className="mx-3">/</span> Strategy, systems, and digital products
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="flex flex-col justify-between gap-6 border-b border-line pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Our work</p>
            <h2 className="mt-2 text-2xl font-semibold">Selected projects</h2>
          </div>
          <div className="flex flex-wrap gap-2" aria-label="Filter projects by category">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={`border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition ${activeCategory === category ? 'border-ink bg-ink text-paper' : 'border-line text-neutral-600 hover:border-ink hover:text-ink'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="mt-12 border-b border-line py-12 text-center text-sm text-neutral-500">Loading projects...</p>
        ) : loadError ? (
          <p role="alert" className="mt-12 border border-line p-6 text-sm text-neutral-600">{loadError}</p>
        ) : visibleProjects.length > 0 ? (
          <div className="mt-8 grid gap-x-8 gap-y-12 md:grid-cols-2">
            {visibleProjects.map((project, index) => (
              <article key={project.id} className="group">
                <div className={`project-visual ${project.visual || 'project-visual-coral'} relative flex aspect-[1.42] items-end overflow-hidden p-6 sm:p-8`}>
                  <span className="absolute right-6 top-6 text-xs font-semibold uppercase tracking-widest text-ink/60">{project.year}</span>
                  <span className="project-visual-mark" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span className="relative max-w-[70%] text-3xl font-semibold leading-tight text-ink sm:text-4xl">{project.name}</span>
                  <span className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-ink/30 text-xl transition group-hover:-translate-y-1 group-hover:translate-x-1 sm:bottom-8 sm:right-8">↗</span>
                </div>
                <div className="flex flex-col justify-between gap-4 border-b border-line py-5 sm:flex-row sm:items-start">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{project.category} <span className="mx-2">/</span> {project.client}</p>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">{project.description}</p>
                    <ProjectLinks project={project} />
                  </div>
                  <span className="shrink-0 text-sm font-medium text-neutral-500">{project.year}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border-b border-line py-16 text-center">
            <p className="text-neutral-500">No published projects in this category yet.</p>
            <button type="button" onClick={() => setActiveCategory('All work')} className="mt-4 text-sm font-semibold underline underline-offset-4">View all work</button>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-[#e6f0e8]">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-8 px-6 py-16 sm:flex-row sm:items-center sm:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-600">Have a challenge in mind?</p>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight">Let&apos;s make your next project work better.</h2>
          </div>
          <Link to="/contact-us" className="inline-flex w-fit items-center gap-3 bg-ink px-6 py-4 text-sm font-semibold uppercase tracking-widest text-paper transition hover:bg-neutral-700">
            Start a conversation <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  )
}