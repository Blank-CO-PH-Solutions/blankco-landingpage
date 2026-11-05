import { supabase } from '../lib/supabase'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

export async function listProjects({ publishedOnly = false } = {}) {
  let query = requireSupabase().from('projects').select('*').order('created_at', { ascending: false })

  if (publishedOnly) {
    query = query
      .eq('published', true)
      .not('github_url', 'is', null)
      .neq('github_url', '')
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function saveProject(project) {
  const client = requireSupabase()
  const { id } = project
  const payload = {
    slug: project.slug || project.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: project.name,
    client: project.client,
    category: project.category,
    year: Number(project.year),
    description: project.description,
    github_url: project.github_url || null,
    live_site_url: project.live_site_url || null,
    visual: project.visual,
    published: project.published,
  }
  const request = id
    ? client.from('projects').update(payload).eq('id', id)
    : client.from('projects').insert(payload)
  const { data, error } = await request.select().single()

  if (error) throw error
  return data
}

export async function updateProject(id, changes) {
  const { data, error } = await requireSupabase()
    .from('projects')
    .update(changes)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProject(id) {
  const { error } = await requireSupabase().from('projects').delete().eq('id', id)
  if (error) throw error
}