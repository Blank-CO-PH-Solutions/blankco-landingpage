import { services } from './data/services'
import { getPreloadedTeamMembers } from './data/preloaded'
import { cleanMemberText, getGithubAvatarUrl, getTeamMemberSlug } from './data/teamMembers'

export const siteUrl = 'https://www.blankcoph.solutions'
export const defaultImage = `${siteUrl}/logo.png`

export const seoPages = {
  '/': {
    title: 'BlankCO PH Solutions | Web Development & Digital Solutions',
    description:
      'BlankCO PH Solutions helps Philippine businesses improve operations through web development, custom software, workflow automation, and digital solutions.',
  },
  '/about': {
    title: 'About BlankCO PH Solutions | Cagayan, Philippines',
    description:
      'Meet BlankCO PH Solutions, a student-led digital solutions team based in Baggao, Cagayan, building practical tools and better business operations.',
  },
  '/services': {
    title: 'Web, App, Bot, IoT & Automation Services | BlankCO',
    description:
      'Explore web development, app development, bot development, IoT solutions, workflow automation, and ongoing support from BlankCO PH Solutions in the Philippines.',
  },
  '/projects': {
    title: 'Our Projects | BlankCO PH Solutions',
    description:
      'Explore selected digital products, workflow systems, and business projects built by BlankCO PH Solutions and its collaborators.',
  },
  '/members': {
    title: 'Meet the Team | BlankCO PH Solutions',
    description:
      'Meet the people behind BlankCO PH Solutions: a student-led team creating practical digital solutions in Cagayan, Philippines.',
  },
  '/contact-us': {
    title: 'Contact BlankCO PH Solutions | Start a Project',
    description:
      'Contact BlankCO PH Solutions to discuss business strategy, workflow automation, web, app, bot, or IoT development, or ongoing support for your team.',
  },
  '/terms': {
    title: 'Terms of Use | BlankCO PH Solutions',
    description:
      'Read the terms that govern your use of the BlankCO PH Solutions website and services.',
  },
  '/privacy': {
    title: 'Privacy Policy | BlankCO PH Solutions',
    description:
      'Learn how BlankCO PH Solutions collects, uses, stores, and protects personal information.',
  },
}

export const defaultRobots = 'index,follow,max-image-preview:large'
export const noIndexRobots = 'noindex,follow'

export function normalizePathname(pathname = '/') {
  const clean = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '')
  return clean || '/'
}

export function collapseWhitespace(value = '') {
  return String(value).replace(/\s+/g, ' ').trim()
}

function listPhrase(items) {
  const values = items.filter(Boolean)
  if (values.length === 0) return ''
  if (values.length === 1) return values[0]
  if (values.length === 2) return `${values[0]} and ${values[1]}`
  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`
}

function truncate(value, maxLength = 160) {
  const text = collapseWhitespace(value)
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : maxLength - 1).replace(/[.,;:!?\-–—]+$/, '')}…`
}

/**
 * Build a factual profile summary from the member's own record. This gives
 * every team page a unique, indexable description even when the optional
 * bio field is empty.
 */
export function getTeamProfileSummary(member) {
  const name = member.name || 'This team member'
  const position = cleanMemberText(member.position) || 'team member'
  const location = cleanMemberText(member.location) || 'Baggao, Cagayan, Philippines'
  const skills = Array.isArray(member.skills) ? member.skills.filter(Boolean) : []
  const education = Array.isArray(member.education) ? member.education : []
  const qualification = education
    .map((item) => [item.qualification, item.institution].filter(Boolean).join(' at '))
    .filter(Boolean)[0]

  const sentences = [
    `${name} is the ${position} at BlankCO PH Solutions, a student-led digital solutions team based in ${location}.`,
  ]

  if (qualification) {
    sentences.push(`Their education includes ${qualification}.`)
  }

  if (skills.length > 0) {
    sentences.push(`Their work focuses on ${listPhrase(skills.slice(0, 4))}.`)
  }

  return sentences.join(' ')
}

function teamMeta(member) {
  const name = member.name || 'Team member'
  const position = cleanMemberText(member.position) || 'Team member'
  const location = cleanMemberText(member.location) || 'Baggao, Cagayan, Philippines'
  const skills = Array.isArray(member.skills) ? member.skills.filter(Boolean) : []
  const description = skills.length > 0
    ? `${name} is the ${position} at BlankCO PH Solutions in ${location}. Skills include ${listPhrase(skills.slice(0, 3))}.`
    : `${name} is the ${position} at BlankCO PH Solutions, a student-led digital solutions team in ${location}. Learn more about their work and background.`

  return {
    title: `${name} — ${position} | BlankCO PH Solutions`,
    description: truncate(description, 158),
    image: member.avatar_url || getGithubAvatarUrl(member.github_url) || defaultImage,
    type: 'profile',
  }
}

/**
 * Resolve the canonical metadata for a public route.
 * `member` may be supplied by the build-time prerenderer; otherwise the
 * preloaded team data is used so client-side navigation stays consistent.
 */
export function resolveSeo(pathname, { member } = {}) {
  const path = normalizePathname(pathname)
  const canonical = `${siteUrl}${path === '/' ? '/' : path}`

  if (path.startsWith('/services/')) {
    const slug = path.split('/')[2]
    const service = services.find((item) => item.slug === slug)
    if (service) {
      return {
        title: `${service.title} | BlankCO PH Solutions`,
        description: service.description,
        canonical,
        robots: defaultRobots,
        image: defaultImage,
        type: 'website',
      }
    }
  }

  if (path.startsWith('/team/')) {
    const slug = path.split('/')[2]
    const members = getPreloadedTeamMembers()
    const found =
      member ||
      (members || []).find((item) => getTeamMemberSlug(item) === slug) ||
      null

    if (found) {
      return {
        ...teamMeta(found),
        canonical,
        robots: defaultRobots,
      }
    }

    // When no data has loaded yet (for example in local development), avoid
    // marking a valid profile as noindex. Once data is available a missing
    // profile is treated as a 404.
    return {
      title: 'Team Member | BlankCO PH Solutions',
      description:
        'Meet a member of BlankCO PH Solutions, a student-led digital solutions team based in Baggao, Cagayan, Philippines.',
      canonical,
      robots: members ? noIndexRobots : defaultRobots,
      image: defaultImage,
      type: 'profile',
    }
  }

  const page = seoPages[path]
  if (page) {
    return {
      ...page,
      canonical,
      robots: defaultRobots,
      image: defaultImage,
      type: 'website',
    }
  }

  return {
    title: 'Page not found | BlankCO PH Solutions',
    description:
      'The page you are looking for could not be found. Browse BlankCO PH Solutions services, projects, or contact the team.',
    canonical: null,
    robots: noIndexRobots,
    image: defaultImage,
    type: 'website',
  }
}
