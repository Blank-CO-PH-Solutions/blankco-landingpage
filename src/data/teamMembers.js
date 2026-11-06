import { supabase } from '../lib/supabase'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

export async function listTeamMembers({ publishedOnly = false } = {}) {
  let query = requireSupabase()
    .from('team_members')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (publishedOnly) query = query.eq('is_published', true)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Function to get a single team member by ID
export async function getTeamMemberById(id, { publishedOnly = false } = {}) {
  let query = requireSupabase()
    .from('team_members')
    .select('*')
    .eq('id', id)

  if (publishedOnly) query = query.eq('is_published', true)

  const { data, error } = await query.maybeSingle()

  if (error) throw error
  return data || null
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function getTeamMemberSlug(member) {
  const slug = (member.name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || member.id
}

// Function to get a single team member by name-based slug.
// UUIDs are still accepted so older links keep working.
export async function getTeamMemberBySlug(slug, { publishedOnly = true } = {}) {
  if (!slug) return null
  if (uuidPattern.test(slug)) return getTeamMemberById(slug, { publishedOnly })

  const members = await listTeamMembers({ publishedOnly })
  return members.find((member) => getTeamMemberSlug(member) === slug.toLowerCase()) || null
}

export async function saveTeamMember(member) {
  const client = requireSupabase()
  const { id } = member
  const payload = {
    name: member.name.trim(),
    position: member.position.trim(),
    email: member.email?.trim() || null,
    location: member.location?.trim() || null,
    github_url: member.github_url.trim(),
    portfolio_url: member.portfolio_url?.trim() || null,
    avatar_url: member.avatar_url?.trim() || null,
    bio: member.bio?.trim() || '',
    skills: Array.isArray(member.skills) ? [...new Set(member.skills.map((skill) => skill.trim()).filter(Boolean))] : [],
    education: Array.isArray(member.education) ? member.education.filter((item) => item.institution || item.qualification) : [],
    sort_order: Number(member.sort_order) || 0,
    is_published: member.is_published,
  }
  const request = id
    ? client.from('team_members').update(payload).eq('id', id)
    : client.from('team_members').insert(payload)
  const { data, error } = await request.select().single()

  if (error) throw error
  return data
}

export async function uploadTeamMemberAvatar(file) {
  const extensionByType = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const extension = extensionByType[file.type]
  if (!extension) throw new Error('Choose a JPG, PNG, or WebP image.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Images must be 5 MB or smaller.')

  const client = requireSupabase()
  const path = `${crypto.randomUUID()}.${extension}`
  const { data, error } = await client.storage.from('team-avatars').upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  })

  if (error) throw error
  return client.storage.from('team-avatars').getPublicUrl(data.path).data.publicUrl
}

export async function deleteTeamMember(id) {
  const { error } = await requireSupabase().from('team_members').delete().eq('id', id)
  if (error) throw error
}

export function getGithubAvatarUrl(githubUrl) {
  try {
    const url = new URL(githubUrl)
    const [username] = url.pathname.split('/').filter(Boolean)
    if (url.hostname !== 'github.com' || !username) return ''
    return `https://github.com/${encodeURIComponent(username)}.png?size=320`
  } catch {
    return ''
  }
}