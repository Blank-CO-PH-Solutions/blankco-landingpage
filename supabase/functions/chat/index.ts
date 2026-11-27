import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PORTAL_URL = Deno.env.get('PORTAL_URL') || 'https://ynbnapmgnhrlugfoybbs.supabase.co'
const JWKS_URL = `${PORTAL_URL}/auth/v1/.well-known/jwks.json`
const CHAT_PREFIX = 'CPL chat · '

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-portal-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'content-type': 'application/json' } })
}

function decodeBase64url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4)
  const binary = atob(padded)
  return new Uint8Array(Array.from(binary, (char) => char.charCodeAt(0)))
}

let cachedKeys: { keys: JsonWebKey[]; fetchedAt: number } | null = null

async function portalKeys() {
  if (cachedKeys && Date.now() - cachedKeys.fetchedAt < 10 * 60 * 1000) return cachedKeys.keys
  const response = await fetch(JWKS_URL)
  if (!response.ok) throw new Error(`Could not load portal signing keys (${response.status})`)
  const jwks = await response.json() as { keys?: JsonWebKey[] }
  cachedKeys = { keys: jwks.keys || [], fetchedAt: Date.now() }
  return cachedKeys.keys
}

/** Verifies a CPL Supabase access token using CPL's public JWKS. */
async function verifyPortalToken(token: string): Promise<{ email: string; name: string } | null> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const header = JSON.parse(new TextDecoder().decode(decodeBase64url(parts[0]))) as { alg?: string; kid?: string }
    const claims = JSON.parse(new TextDecoder().decode(decodeBase64url(parts[1]))) as { email?: string; full_name?: string; exp?: number }
    if (header.alg !== 'ES256' || !claims.email || !claims.exp || claims.exp * 1000 < Date.now()) return null

    const key = (await portalKeys()).find((candidate) => candidate.kid === header.kid)
    if (!key) return null

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      { ...key, alg: 'ES256' },
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify'],
    )
    const encoder = new TextEncoder()
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      cryptoKey,
      decodeBase64url(parts[2]),
      encoder.encode(`${parts[0]}.${parts[1]}`),
    )
    if (!valid) return null

    return { email: claims.email, name: String(claims.full_name || claims.email.split('@')[0] || 'Customer').slice(0, 100) }
  } catch (error) {
    console.error('Portal token verification failed', error)
    return null
  }
}

type Identity = { role: 'admin' | 'customer'; email: string; name: string }

async function authenticate(request: Request, adminClient: ReturnType<typeof createAdmin>): Promise<Identity | null> {
  const portalToken = request.headers.get('x-portal-token')
  if (portalToken) {
    const portalUser = await verifyPortalToken(portalToken)
    if (portalUser) {
      return { role: 'customer', email: portalUser.email, name: portalUser.name }
    }
    return null
  }

  const authorization = request.headers.get('authorization') || ''
  const jwt = authorization.replace(/^Bearer\s+/i, '')
  if (!jwt) return null

  const { data, error } = await adminClient.auth.getUser(jwt)
  if (error || !data.user) return null

  const { data: adminRow } = await adminClient
    .from('admin_users')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()
  if (!adminRow) return null

  return {
    role: 'admin',
    email: data.user.email || '',
    name: String(data.user.user_metadata?.full_name || data.user.email || 'Support team'),
  }
}

function createAdmin() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })
}

type MessageRow = {
  id: string
  name: string
  email: string
  company: string
  service_interest: string
  message: string
  created_at: string
  is_read: boolean
}

async function canAccessThread(admin: ReturnType<typeof createAdmin>, identity: Identity, threadId: string): Promise<MessageRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(threadId)) return null
  let query = admin.from('messages').select('*').eq('id', threadId)
  if (identity.role === 'customer') query = query.ilike('email', identity.email)
  const { data, error } = await query.maybeSingle()
  if (error || !data) return null
  if ((data.service_interest || '').startsWith(CHAT_PREFIX)) return null
  return data as MessageRow
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const admin = createAdmin()
  const identity = await authenticate(request, admin)
  if (!identity) return json({ error: 'Not authorized to use the support chat' }, 403)

  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const action = String(body.action || '')

  if (action === 'threads') {
    let query = admin
      .from('messages')
      .select('id, name, email, company, service_interest, created_at, is_read')
      .not('service_interest', 'like', `${CHAT_PREFIX}%`)
      .order('created_at', { ascending: false })
      .limit(100)
    if (identity.role === 'customer') query = query.ilike('email', identity.email)
    const { data, error } = await query
    if (error) return json({ error: error.message }, 500)

    const threadIds = (data || []).map((row) => row.id)
    const replies = threadIds.length
      ? await admin
          .from('messages')
          .select('service_interest, created_at')
          .in('service_interest', threadIds.map((id) => `${CHAT_PREFIX}${id}`))
      : { data: [] }
    const counts = new Map<string, { count: number; last: string }>()
    for (const reply of replies.data || []) {
      const id = String(reply.service_interest || '').slice(CHAT_PREFIX.length)
      const current = counts.get(id) || { count: 0, last: '' }
      counts.set(id, { count: current.count + 1, last: reply.created_at > current.last ? reply.created_at : current.last })
    }

    return json({
      threads: (data || []).map((row) => ({
        id: row.id,
        subject: row.service_interest,
        name: row.name,
        email: row.email,
        company: row.company,
        createdAt: row.created_at,
        isRead: row.is_read,
        replyCount: counts.get(row.id)?.count || 0,
        lastReplyAt: counts.get(row.id)?.last || row.created_at,
      })),
    })
  }

  if (action === 'findThread') {
    const subject = String(body.subject || '').trim().slice(0, 200)
    if (!subject) return json({ threadId: null })
    let query = admin
      .from('messages')
      .select('id')
      .not('service_interest', 'like', `${CHAT_PREFIX}%`)
      .ilike('service_interest', `%${subject}%`)
      .order('created_at', { ascending: false })
      .limit(1)
    if (identity.role === 'customer') query = query.ilike('email', identity.email)
    const { data, error } = await query.maybeSingle()
    if (error) return json({ error: error.message }, 500)
    return json({ threadId: data?.id || null })
  }

  const threadId = String(body.threadId || '')
  const thread = await canAccessThread(admin, identity, threadId)
  if (!thread) return json({ error: 'Conversation not found' }, 404)

  if (action === 'thread') {
    const { data, error } = await admin
      .from('messages')
      .select('id, name, email, company, service_interest, message, created_at')
      .eq('service_interest', `${CHAT_PREFIX}${threadId}`)
      .order('created_at', { ascending: true })
    if (error) return json({ error: error.message }, 500)

    return json({
      thread: {
        id: thread.id,
        subject: thread.service_interest,
        name: thread.name,
        email: thread.email,
        company: thread.company,
        createdAt: thread.created_at,
      },
      replies: [
        {
          id: `original-${thread.id}`,
          author: 'customer' as const,
          name: thread.name,
          body: thread.message,
          createdAt: thread.created_at,
        },
        ...(data || []).map((row) => ({
          id: row.id,
          author: (row.company === 'Customer portal' ? 'customer' : 'admin') as 'customer' | 'admin',
          name: row.name,
          body: row.message,
          createdAt: row.created_at,
        })),
      ],
      role: identity.role,
    })
  }

  if (action === 'reply') {
    const replyBody = String(body.body || '').trim()
    if (replyBody.length < 20 || replyBody.length > 500) {
      return json({ error: 'Replies must be between 20 and 500 characters.' }, 400)
    }

    const name = identity.role === 'customer'
      ? String(body.authorName || identity.name || identity.email).trim().slice(0, 100) || identity.email
      : identity.name.slice(0, 100) || 'Support team'
    const company = identity.role === 'customer' ? 'Customer portal' : 'Support team'

    const { data, error } = await admin.from('messages').insert({
      name: name.length >= 2 ? name : 'Support team',
      email: identity.email,
      company,
      service_interest: `${CHAT_PREFIX}${threadId}`,
      message: replyBody,
      consent: true,
      is_read: false,
    }).select('id, created_at').single()

    if (error) return json({ error: error.message }, 500)
    return json({ reply: { id: data.id, body: replyBody, name, createdAt: data.created_at, author: identity.role } })
  }

  return json({ error: 'Unknown action' }, 400)
})
