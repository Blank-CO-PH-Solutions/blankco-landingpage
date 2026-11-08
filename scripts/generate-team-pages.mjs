import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const siteUrl = 'https://www.blankcoph.solutions'
const distDir = path.resolve('dist')

async function loadLocalEnv() {
  try {
    const contents = await readFile('.env.local', 'utf8')
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!match) continue
      const [, key, rawValue] = match
      if (process.env[key]) continue
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, '')
    }
  } catch {
    // No .env.local locally; Vercel provides these through process.env.
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

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function githubAvatar(githubUrl) {
  try {
    const url = new URL(githubUrl)
    const [username] = url.pathname.split('/').filter(Boolean)
    if (url.hostname !== 'github.com' || !username) return ''
    return `https://github.com/${encodeURIComponent(username)}.png?size=320`
  } catch {
    return ''
  }
}

function replaceMeta(html, pattern, replacement) {
  if (!pattern.test(html)) {
    console.warn(`[team-pages] Meta pattern not found: ${pattern}`)
    return html
  }
  return html.replace(pattern, replacement)
}

function renderStaticProfile(member, avatarUrl) {
  const skills = Array.isArray(member.skills) ? member.skills : []
  const education = Array.isArray(member.education) ? member.education : []
  const location = member.location ? `<span>${escapeHtml(member.location)}</span>` : ''
  const email = member.email ? `<a href="mailto:${escapeHtml(member.email)}" style="color:inherit">${escapeHtml(member.email)}</a>` : ''
  const github = member.github_url ? `<a href="${escapeHtml(member.github_url)}" target="_blank" rel="noreferrer" style="color:#0a0a0a;background:#fafafa;padding:12px 20px;text-decoration:none;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em">GitHub</a>` : ''
  const portfolio = member.portfolio_url ? `<a href="${escapeHtml(member.portfolio_url)}" target="_blank" rel="noreferrer" style="color:#fafafa;border:1px solid #737373;padding:12px 20px;text-decoration:none;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em">Portfolio</a>` : ''
  const bio = member.bio ? `<section style="margin-bottom:48px"><h2 style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#737373">About</h2><p style="white-space:pre-line;font-size:18px;line-height:1.8;color:#404040">${escapeHtml(member.bio)}</p></section>` : ''
  const skillsHtml = skills.length ? `<section style="margin-bottom:48px"><h2 style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#737373">Skills</h2><ul style="display:flex;flex-wrap:wrap;gap:8px;padding:0;list-style:none;margin-top:20px">${skills.map((skill) => `<li style="border:1px solid #d4d4d4;background:#fff;padding:6px 12px;font-size:14px;color:#404040">${escapeHtml(skill)}</li>`).join('')}</ul></section>` : ''
  const educationHtml = education.length ? `<section style="margin-bottom:48px"><h2 style="font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#737373">Education</h2><div style="display:grid;gap:20px;margin-top:20px">${education.map((rawItem) => {
    const item = rawItem || {}
    const years = [item.start_year, item.end_year].filter(Boolean).join(' – ')
    return `<div style="border:1px solid #d4d4d4;background:#fff;padding:24px"><p style="margin:0;font-weight:600">${escapeHtml(item.qualification || item.institution)}</p>${item.qualification && item.institution ? `<p style="margin:8px 0 0;color:#525252">${escapeHtml(item.institution)}</p>` : ''}${years ? `<p style="margin:8px 0 0;color:#737373;font-size:12px">${escapeHtml(years)}</p>` : ''}</div>`
  }).join('')}</div></section>` : ''
  const avatar = avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(member.name)} profile" width="144" height="144" style="width:144px;height:144px;border-radius:9999px;object-fit:cover;flex-shrink:0" />` : ''

  return `
    <div style="min-height:100vh;background:#fafafa;color:#0a0a0a;font-family:Poppins,ui-sans-serif,system-ui,sans-serif">
      <header style="background:#0a0a0a;color:#fafafa;padding:64px 24px">
        <div style="max-width:1152px;margin:0 auto">
          <a href="/members" style="color:#a3a3a3;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;text-decoration:none">← All members</a>
          <div style="display:flex;gap:40px;align-items:center;margin-top:40px;flex-wrap:wrap">
            ${avatar}
            <div style="min-width:0">
              <p style="margin:0;color:#a3a3a3;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em">${escapeHtml(member.position)}</p>
              <h1 style="margin:12px 0 0;font-size:48px;line-height:1.1">${escapeHtml(member.name)}</h1>
              <p style="margin:16px 0 0;color:#d4d4d4;display:flex;gap:24px;flex-wrap:wrap">${location}${email}</p>
              <p style="margin:24px 0 0;display:flex;gap:12px;flex-wrap:wrap">${github}${portfolio}</p>
            </div>
          </div>
        </div>
      </header>
      <main style="max-width:1152px;margin:0 auto;padding:64px 24px">
        ${bio}
        ${skillsHtml}
        ${educationHtml}
      </main>
    </div>
  `
}

await loadLocalEnv()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('[team-pages] Skipping static team pages: Supabase env vars are not set.')
  process.exit(0)
}

const endpoint = new URL('/rest/v1/team_members', supabaseUrl)
endpoint.searchParams.set('select', '*')
endpoint.searchParams.set('is_published', 'eq.true')
endpoint.searchParams.set('order', 'sort_order.asc,name.asc')

const response = await fetch(endpoint, {
  headers: {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  },
})

if (!response.ok) {
  console.warn(`[team-pages] Skipping static team pages: Supabase returned ${response.status}.`)
  process.exit(0)
}

const members = await response.json()
const template = await readFile(path.join(distDir, 'index.html'), 'utf8')
let generated = 0

for (const member of members) {
  const slug = slugify(member.name)
  if (!slug) continue

  const url = `${siteUrl}/team/${slug}`
  const title = `${member.name} — ${member.position} | BlankCO PH Solutions`
  const description = member.bio?.trim()
    || `Meet ${member.name}, ${member.position} at BlankCO PH Solutions, a student-led digital solutions team in Baggao, Cagayan.`
  const avatarUrl = member.avatar_url || githubAvatar(member.github_url)
  const imageUrl = avatarUrl || `${siteUrl}/logo.png`

  let html = template
  html = replaceMeta(html, /<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
  html = replaceMeta(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${escapeHtml(url)}" />`)
  html = replaceMeta(html, /<meta name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
  html = replaceMeta(html, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
  html = replaceMeta(html, /<meta property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
  html = replaceMeta(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${escapeHtml(url)}" />`)
  html = replaceMeta(html, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`)
  html = replaceMeta(html, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
  html = replaceMeta(html, /<meta name="twitter:description"\s+content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`)
  html = replaceMeta(html, /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`)
  html = html.replace('<div id="root"></div>', `<div id="root">${renderStaticProfile(member, avatarUrl)}</div>`)

  const outputDir = path.join(distDir, 'team', slug)
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'index.html'), html)
  generated += 1
}

console.log(`[team-pages] Generated ${generated} static team profile page(s).`)
