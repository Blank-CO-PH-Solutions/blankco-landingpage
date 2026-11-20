import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'vite'
import { services } from '../src/data/services.js'

const siteUrl = 'https://www.blankcoph.solutions'

async function loadLocalEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      const contents = await readFile(file, 'utf8')
      for (const line of contents.split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
        if (!match) continue
        const [, key, rawValue] = match
        if (process.env[key]) continue
        process.env[key] = rawValue.replace(/^['"]|['"]$/g, '')
      }
    } catch {
      // No local env file; deployment platforms provide these through process.env.
    }
  }
}

function slugify(name) {
  return (name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeAttribute(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function upsertMeta(html, attribute, key, content) {
  const pattern = new RegExp(`<meta ${attribute}="${escapeRegExp(key)}"[^>]*>`, 'i')
  const tag = `<meta ${attribute}="${key}" content="${escapeAttribute(content)}" />`
  if (pattern.test(html)) return html.replace(pattern, tag)
  return html.replace('</head>', `  ${tag}\n</head>`)
}

function removeMeta(html, attribute, key) {
  const pattern = new RegExp(`\\s*<meta ${attribute}="${escapeRegExp(key)}"[^>]*>`, 'gi')
  return html.replace(pattern, '')
}

function setCanonical(html, href) {
  const pattern = /\s*<link rel="canonical"[^>]*>/i
  if (!href) return html.replace(pattern, '')
  const tag = `<link rel="canonical" href="${escapeAttribute(href)}" />`
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `  ${tag}\n</head>`)
}

function applySeo(template, seo) {
  let html = template
  const description = String(seo.description || '').replace(/\s+/g, ' ').trim()

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttribute(seo.title)}</title>`)
  html = setCanonical(html, seo.canonical)
  html = upsertMeta(html, 'name', 'description', description)
  html = upsertMeta(html, 'name', 'robots', seo.robots)
  html = upsertMeta(html, 'name', 'googlebot', seo.robots)
  html = upsertMeta(html, 'property', 'og:title', seo.title)
  html = upsertMeta(html, 'property', 'og:description', description)
  html = upsertMeta(html, 'property', 'og:type', seo.type || 'website')
  html = upsertMeta(html, 'property', 'og:image', seo.image)
  html = upsertMeta(html, 'property', 'og:image:alt', `${seo.title} social preview`)
  html = upsertMeta(html, 'name', 'twitter:card', 'summary')
  html = upsertMeta(html, 'name', 'twitter:title', seo.title)
  html = upsertMeta(html, 'name', 'twitter:description', description)
  html = upsertMeta(html, 'name', 'twitter:image', seo.image)
  html = upsertMeta(html, 'name', 'twitter:image:alt', `${seo.title} social preview`)

  if (seo.canonical) {
    html = upsertMeta(html, 'property', 'og:url', seo.canonical)
  } else {
    html = removeMeta(html, 'property', 'og:url')
  }

  return html
}

function githubAvatarUrl(githubUrl) {
  try {
    const url = new URL(githubUrl)
    const [username] = url.pathname.split('/').filter(Boolean)
    if (url.hostname !== 'github.com' || !username) return ''
    return `https://github.com/${encodeURIComponent(username)}.png?size=320`
  } catch {
    return ''
  }
}

function cleanText(value) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text || /^(null|undefined|n\/a|none)$/i.test(text)) return ''
  return text
}

function teamMemberUrl(member) {
  return `${siteUrl}/team/${slugify(member.name)}`
}

function buildPersonNode(member) {
  const url = teamMemberUrl(member)
  const location = cleanText(member.location)
  const sameAs = [cleanText(member.github_url), cleanText(member.portfolio_url)].filter(Boolean)
  const education = Array.isArray(member.education) ? member.education : []
  const alumniOf = [...new Set(education.map((item) => item.institution).filter(Boolean))]
    .map((name) => ({ '@type': 'CollegeOrUniversity', name }))
  const skills = Array.isArray(member.skills) ? member.skills.filter(Boolean) : []

  return {
    '@type': 'Person',
    '@id': `${url}#person`,
    name: member.name,
    jobTitle: cleanText(member.position) || 'Team member',
    description: ssr.getTeamProfileSummary(member),
    url,
    image: member.avatar_url || githubAvatarUrl(member.github_url) || `${siteUrl}/logo.png`,
    worksFor: {
      '@type': 'Organization',
      name: 'BlankCO PH Solutions',
      url: `${siteUrl}/`,
    },
    ...(cleanText(member.email) ? { email: `mailto:${cleanText(member.email)}` } : {}),
    ...(location
      ? {
          address: {
            '@type': 'PostalAddress',
            addressLocality: location,
            addressRegion: 'Cagayan',
            addressCountry: 'PH',
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(skills.length ? { knowsAbout: skills } : {}),
    ...(alumniOf.length ? { alumniOf } : {}),
  }
}

function renderJsonLd(data) {
  const json = JSON.stringify(data, null, 2).replace(/</g, '\\u003c')
  return `<script type="application/ld+json">\n${json}\n</script>`
}

/**
 * Replace the team Person graph that ships in index.html with one generated
 * from the same Supabase records used by the pages, so job titles, links, and
 * photos stay in sync.
 */
function applyTeamGraph(html, members) {
  const pattern = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g

  return html.replace(pattern, (match, json) => {
    let parsed
    try {
      parsed = JSON.parse(json)
    } catch {
      return match
    }

    if (!parsed['@graph']) return match
    if (!Array.isArray(members) || members.length === 0) return ''

    return renderJsonLd({
      '@context': 'https://schema.org',
      '@graph': members.map(buildPersonNode),
    })
  })
}

function applyProfileStructuredData(html, member, route) {
  if (!member) return html

  const url = `${siteUrl}${route}`
  const personId = `${url}#person`
  const breadcrumbId = `${url}#breadcrumb`

  const profilePage = {
    '@type': 'ProfilePage',
    '@id': url,
    url,
    name: `${member.name} — ${member.position} | BlankCO PH Solutions`,
    isPartOf: { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/` },
    mainEntity: { '@id': personId },
    breadcrumb: { '@id': breadcrumbId },
  }

  const breadcrumbs = {
    '@type': 'BreadcrumbList',
    '@id': breadcrumbId,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Members', item: `${siteUrl}/members` },
      { '@type': 'ListItem', position: 3, name: member.name, item: url },
    ],
  }

  const script = renderJsonLd({ '@context': 'https://schema.org', '@graph': [profilePage, breadcrumbs] })
  return html.replace('</head>', `  ${script}\n</head>`)
}

function serializeData(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

async function fetchTable(name, params) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return null

  const endpoint = new URL(`/rest/v1/${name}`, supabaseUrl)
  for (const [key, value] of Object.entries(params)) {
    endpoint.searchParams.set(key, value)
  }

  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Supabase ${name} request failed with ${response.status}`)
  }

  return response.json()
}

async function loadContent() {
  const [teamMembers, projects] = await Promise.all([
    fetchTable('team_members', {
      select: '*',
      is_published: 'eq.true',
      order: 'sort_order.asc,name.asc',
    }),
    fetchTable('projects', {
      select: '*',
      published: 'eq.true',
      order: 'created_at.desc',
    }),
  ])

  return {
    teamMembers: Array.isArray(teamMembers) ? teamMembers : [],
    projects: Array.isArray(projects)
      ? projects.filter((project) => Boolean(project.github_url))
      : [],
    hasRemoteData: Array.isArray(teamMembers) || Array.isArray(projects),
  }
}

function sitemapEntry(route, lastmod) {
  const priority = route === '/'
    ? '1.0'
    : route === '/services' || route === '/projects'
      ? '0.8'
      : route === '/about' || route.startsWith('/services/')
        ? '0.7'
        : route === '/contact-us'
          ? '0.6'
          : route === '/members' || route.startsWith('/team/')
            ? '0.5'
            : '0.3'
  const changefreq = route === '/' || route === '/projects'
    ? 'weekly'
    : route.startsWith('/team/') || route === '/members' || route.startsWith('/services/')
      ? 'monthly'
      : route === '/contact-us' || route === '/terms' || route === '/privacy'
        ? 'yearly'
        : 'monthly'

  return [
    '  <url>',
    `    <loc>${siteUrl}${route === '/' ? '/' : route}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n')
}

await loadLocalEnv()

console.log('[prerender] Building server bundle...')
await build({
  logLevel: 'warn',
  publicDir: false,
  build: {
    ssr: 'src/entry-server.jsx',
    outDir: 'dist-ssr',
    emptyOutDir: true,
    copyPublicDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'entry-server.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})

const serverEntry = path.resolve('dist-ssr/entry-server.js')
const ssr = await import(pathToFileURL(serverEntry).href)

const hasSupabaseEnv = Boolean(
  process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY,
)

let content
try {
  content = await loadContent()
  if (!content.hasRemoteData) {
    console.warn('[prerender] Supabase env vars are not set. Generating public pages without team/project data.')
  }
} catch (error) {
  if (hasSupabaseEnv) {
    console.error(`[prerender] Could not load Supabase content: ${error.message}`)
    console.error('[prerender] Refusing to publish an incomplete sitemap. Check the Supabase credentials and retry.')
    process.exit(1)
  }
  console.warn(`[prerender] Could not load Supabase content: ${error.message}`)
  content = { teamMembers: [], projects: [], hasRemoteData: false }
}

ssr.setPreloadedData({
  projects: content.projects,
  teamMembers: content.teamMembers,
})

const template = await readFile('dist/index.html', 'utf8')
const routes = [
  '/',
  '/about',
  '/services',
  ...services.map((service) => `/services/${service.slug}`),
  '/projects',
  '/members',
  ...content.teamMembers
    .map((member) => slugify(member.name))
    .filter(Boolean)
    .map((slug) => `/team/${slug}`),
  '/contact-us',
  '/terms',
  '/privacy',
]

const uniqueRoutes = [...new Set(routes)]
const buildDate = new Date().toISOString().slice(0, 10)

function renderPage(route, member) {
  const body = ssr.render(route)
  const seo = ssr.resolveSeo(route, { member })
  let html = applySeo(template, seo)
  html = applyTeamGraph(html, content.teamMembers)

  if (member) {
    html = applyProfileStructuredData(html, member, route)
  }

  const dataScript = `<script>window.__BLANKCO_DATA__=${serializeData({
    projects: content.projects,
    teamMembers: content.teamMembers,
  })}</script>`

  html = html.replace(
    /<div id="root"><\/div>/,
    `<div id="root">${body}</div>\n  ${dataScript}`,
  )

  return html
}

let generated = 0

for (const route of uniqueRoutes) {
  const member = route.startsWith('/team/')
    ? content.teamMembers.find((item) => slugify(item.name) === route.split('/')[2])
    : undefined

  const html = renderPage(route, member)
  const outputDir = route === '/' ? path.resolve('dist') : path.resolve('dist', route.slice(1))
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'index.html'), html)
  generated += 1
}

// A dedicated noindex shell for the disallowed admin area.
const adminHtml = applySeo(template, {
  title: 'Admin | BlankCO PH Solutions',
  description: 'Private administration area for BlankCO PH Solutions.',
  canonical: null,
  robots: 'noindex,nofollow',
  image: `${siteUrl}/logo.png`,
  type: 'website',
})
const adminStructuredHtml = applyTeamGraph(adminHtml, content.teamMembers)
await mkdir(path.resolve('dist/admin'), { recursive: true })
await writeFile(path.resolve('dist/admin/index.html'), adminStructuredHtml)

// Real 404 page so unknown URLs return a proper 404 status instead of the homepage.
const notFoundHtml = renderPage('/404-not-found')
await writeFile(path.resolve('dist/404.html'), notFoundHtml)

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...uniqueRoutes.map((route) => sitemapEntry(route, buildDate)),
  '</urlset>',
  '',
].join('\n')

await writeFile(path.resolve('dist/sitemap.xml'), sitemap)

console.log(`[prerender] Generated ${generated} static page(s), a 404 page, and sitemap.xml.`)
