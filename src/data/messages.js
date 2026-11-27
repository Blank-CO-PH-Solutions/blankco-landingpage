import { supabase } from '../lib/supabase'

export const PORTAL_TICKET_PREFIX = 'CPL support'

export function isPortalTicket(message) {
  return String(message?.service_interest || '').startsWith(PORTAL_TICKET_PREFIX)
}

function clip(value, min, max) {
  const trimmed = String(value || '').trim().replace(/\s+/g, ' ')
  if (trimmed.length >= min) return trimmed.slice(0, max)
  return trimmed.padEnd(min, ' ').slice(0, max).trimEnd()
}

function clipMultiline(value, min, max) {
  const trimmed = String(value || '').trim()
  if (trimmed.length >= min) return trimmed.slice(0, max)
  return trimmed.padEnd(min, ' ').slice(0, max).trimEnd()
}

/** Maps a customer-portal ticket into the landing-page admin inbox row. */
export function portalTicketToMessage(ticket) {
  const subject = String(ticket.subject || '').trim() || 'Support request'
  const category = String(ticket.category || '').trim() || 'Other'
  const details = String(ticket.message || '').trim()
  const name = clip(ticket.name || 'Customer', 2, 100)
  const company = clip(ticket.company || 'Customer portal', 2, 100)
  return {
    name: name.length >= 2 ? name : 'Customer',
    email: clip(ticket.email, 3, 254),
    company: company.length >= 2 ? company : 'Customer portal',
    serviceInterest: clip(`${PORTAL_TICKET_PREFIX} · ${category} · ${subject}`, 10, 300),
    message: clipMultiline(
      `Ticket subject: ${subject}\nCategory: ${category}\n\n${details}\n\nSubmitted from the Blank CO customer portal.`,
      20,
      500,
    ),
    consent: true,
  }
}

export async function createPortalTicket(ticket) {
  const message = portalTicketToMessage(ticket)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(message.email)) {
    throw new Error('Enter a valid email address so our team can reply.')
  }
  await createMessage(message)
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

export async function createMessage(message) {
  // The insert policy allows anonymous inserts but not reads, so the client
  // chooses the id and passes it to the email notifier.
  const id = crypto.randomUUID()
  const { error } = await requireSupabase()
    .from('messages')
    .insert({
      id,
      name: message.name.trim(),
      email: message.email.trim(),
      company: message.company.trim(),
      service_interest: message.serviceInterest.trim(),
      message: message.message.trim(),
      consent: message.consent,
    })

  if (error) throw error
  await notifyTicketByEmail(id)
  return { id }
}

/**
 * Asks the `notify-ticket` Edge Function to email the support inbox.
 * Best effort: the ticket is already stored, so email failures must not fail
 * the customer's submission.
 */
async function notifyTicketByEmail(id) {
  try {
    const { error } = await requireSupabase().functions.invoke('notify-ticket', { body: { id } })
    if (error) console.warn('Ticket email notification failed', error.message)
  } catch (error) {
    console.warn('Ticket email notification failed', error)
  }
}

export async function listMessages() {
  // Chat replies are stored as tagged messages; keep them out of the inbox list.
  const { data, error } = await requireSupabase()
    .from('messages')
    .select('*')
    .not('service_interest', 'like', 'CPL chat%')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function setMessageRead(id, isRead) {
  const { data, error } = await requireSupabase()
    .from('messages')
    .update({ is_read: isRead })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteMessage(id) {
  const { error } = await requireSupabase().from('messages').delete().eq('id', id)
  if (error) throw error
}