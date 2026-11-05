import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProjects } from '../data/projects'
import ProjectLinks from './ProjectLinks'
import ProjectSitePreview from './ProjectSitePreview'

export default function HomeProjectsSection() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    let active = true
    listProjects({ publishedOnly: true })
      .then((items) => {
        if (active) setProjects(items)
      })
      .catch(() => {})

    return () => { active = false }
  }, [])

  if (!projects.length) return null
  const carouselGroups = [projects, projects, projects]

  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Selected work</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">Built, launched, and ready to explore.</h2>
          </div>
          <Link to="/projects" className="inline-flex w-fit items-center gap-2 border-b border-ink pb-1 text-sm font-semibold">
            All projects <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="project-carousel mt-12 overflow-hidden" role="region" aria-label="Featured projects carousel" tabIndex={0}>
          <div className="project-carousel-track flex w-max">
            {carouselGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="project-carousel-group flex shrink-0 gap-8 pr-8" aria-hidden={groupIndex > 0} inert={groupIndex > 0}>
                {group.map((project, index) => (
                  <article key={`${groupIndex}-${project.id}`} aria-roledescription="slide" className="w-[min(82vw,370px)] shrink-0">
                    <div className={`project-visual ${project.visual || 'project-visual-coral'} relative flex aspect-[1.4] items-end overflow-hidden p-6`}>
                      <ProjectSitePreview project={project} />
                      <span className="project-visual-mark" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                      <span className="relative z-20 max-w-[80%] text-2xl font-semibold leading-tight text-ink">{project.name}</span>
                      <span className="absolute right-5 top-5 z-20 text-xs font-semibold uppercase tracking-wider text-ink/60">{project.year}</span>
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">{project.category} <span className="mx-2">/</span> {project.client}</p>
                    <p className="mt-3 text-sm leading-6 text-neutral-600">{project.description}</p>
                    <ProjectLinks project={project} />
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}