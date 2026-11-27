import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PORTAL_URL = Deno.env.get('PORTAL_URL') || 'https://ynbnapmgnhrlugfoybbs.supabase.co'
const JWKS_URL = `${PORTAL_URL}/auth/v1/.well-known/jwks.json`
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

function createAdmin() {
  return createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  })
}

async function authenticate(request: Request, adminClient: ReturnType<typeof createAdmin>): Promise<Identity | null> {
  const portalToken = request.headers.get('x-portal-token')
  if (portalToken) {
    const portalUser = await verifyPortalToken(portalToken)
    return portalUser ? { role: 'customer', email: portalUser.email, name: portalUser.name } : null
  }

  const authorization = request.headers.get('authorization') || ''
  const jwt = authorization.replace(/^Bearer\s+/i, '')
  if (!jwt) return null

  const { data, error } = await adminClient.auth.getUser(jwt)
  if (error || !data.user) return null

  const { data: adminRow } = await adminClient
    .from('admin_users')
    .select('user_id')
    .eq('user_id', data.user.id)
    .maybeSingle()
  if (!adminRow) return null

  return {
    role: 'admin',
    email: data.user.email || '',
    name: String(data.user.user_metadata?.full_name || data.user.email || 'Support team'),
  }
}

async function broadcastUpdate(chatId: string) {
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      messages: [{ topic: 'support-chat', event: 'updated', payload: { chatId } }],
    }),
  })
  if (!response.ok) console.error('Broadcast failed', response.status, await response.text())
}

type ChatRow = {
  id: string
  customer_email: string
  customer_name: string
  subject: string
  category: string
  source: string
  is_read: boolean
  created_at: string
  updated_at: string
}

async function accessibleChat(admin: ReturnType<typeof createAdmin>, identity: Identity, chatId: string): Promise<ChatRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(chatId)) return null
  let query = admin.from('support_chats').select('*').eq('id', chatId)
  if (identity.role === 'customer') query = query.ilike('customer_email', identity.email)
  const { data, error } = await query.maybeSingle()
  if (error || !data) return null
  return data as ChatRow
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
      .from('support_chats')
      .select('id, customer_email, customer_name, subject, category, source, is_read, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(100)
    if (identity.role === 'customer') query = query.ilike('customer_email', identity.email)
    const { data, error } = await query
    if (error) return json({ error: error.message }, 500)

    const ids = (data || []).map((row) => row.id)
    const messageRows = ids.length
      ? await admin.from('support_chat_messages').select('chat_id, created_at').in('chat_id', ids)
      : { data: [] as Array<{ chat_id: string; created_at: string }> }
    const counts = new Map<string, { count: number; last: string }>()
    for (const reply of messageRows.data || []) {
      const current = counts.get(reply.chat_id) || { count: 0, last: '' }
      counts.set(reply.chat_id, {
        count: current.count + 1,
        last: reply.created_at > current.last ? reply.created_at : current.last,
      })
    }

    return json({
      threads: (data || []).map((row) => ({
        id: row.id,
        subject: row.subject,
        name: row.customer_name,
        email: row.customer_email,
        company: row.category,
        createdAt: row.created_at,
        isRead: row.is_read,
        replyCount: (counts.get(row.id)?.count || 0) - 1 < 0 ? 0 : (counts.get(row.id)?.count || 0) - 1,
        lastReplyAt: counts.get(row.id)?.last || row.updated_at,
      })),
    })
  }

  if (action === 'findThread') {
    const subject = String(body.subject || '').trim().slice(0, 200)
    if (!subject) return json({ threadId: null })
    let query = admin
      .from('support_chats')
      .select('id')
      .ilike('subject', `%${subject}%`)
      .order('updated_at', { ascending: false })
      .limit(1)
    if (identity.role === 'customer') query = query.ilike('customer_email', identity.email)
    const { data, error } = await query.maybeSingle()
    if (error) return json({ error: error.message }, 500)
    return json({ threadId: data?.id || null })
  }

  const chatId = String(body.threadId || '')
  const chat = await accessibleChat(admin, identity, chatId)
  if (!chat) return json({ error: 'Conversation not found' }, 404)

  if (action === 'thread') {
    const { data, error } = await admin
      .from('support_chat_messages')
      .select('id, author, author_name, body, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    if (error) return json({ error: error.message }, 500)

    return json({
      thread: {
        id: chat.id,
        subject: chat.subject,
        name: chat.customer_name,
        email: chat.customer_email,
        company: chat.category,
        createdAt: chat.created_at,
      },
      replies: (data || []).map((row) => ({
        id: row.id,
        author: row.author,
        name: row.author_name,
        body: row.body,
        createdAt: row.created_at,
      })),
      role: identity.role,
    })
  }

  if (action === 'reply') {
    const replyBody = String(body.body || '').trim()
    if (replyBody.length < 1 || replyBody.length > 2000) {
      return json({ error: 'Replies must be between 1 and 2000 characters.' }, 400)
    }

    const name = identity.role === 'customer'
      ? String(body.authorName || identity.name || identity.email).trim().slice(0, 100) || identity.email
      : identity.name.slice(0, 100) || 'Support team'

    const { data, error } = await admin.from('support_chat_messages').insert({
      chat_id: chatId,
      author: identity.role,
      author_name: name,
      body: replyBody,
    }).select('id, created_at').single()

    if (error) return json({ error: error.message }, 500)

    await admin.from('support_chats').update({
      updated_at: new Date().toISOString(),
      is_read: identity.role === 'admin',
    }).eq('id', chatId)

    await broadcastUpdate(chatId)

    return json({
      reply: { id: data.id, body: replyBody, name, createdAt: data.created_at, author: identity.role },
    })
  }

  return json({ error: 'Unknown action' }, 400)
})
