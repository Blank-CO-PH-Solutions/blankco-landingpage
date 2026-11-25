import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const NOTIFY_TO = Deno.env.get('TICKET_NOTIFY_TO') || 'hello@blankcoph.solutions'
const MAIL_FROM = Deno.env.get('TICKET_MAIL_FROM') || 'Blank CO Support <hello@blankcoph.solutions>'
const SMTP_HOST = Deno.env.get('TITAN_SMTP_HOST') || 'smtpout.secureserver.net'
const SMTP_PORT = Number(Deno.env.get('TITAN_SMTP_PORT') || 465)
const SMTP_USER = Deno.env.get('TITAN_SMTP_USER') || ''
const SMTP_PASS = Deno.env.get('TITAN_SMTP_PASS') || ''
const MAX_AGE_MINUTES = 30

type MessageRow = {
  id: string
  name: string
  email: string
  company: string
  service_interest: string
  message: string
  created_at: string
  consent: boolean
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// GoDaddy's Titan SMTP rejects messages containing bare LF (552 822.bis).
function toCrlf(value: string) {
  return value.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n')
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })
}

async function sendMail(message: MessageRow) {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('Titan SMTP credentials are not configured (TITAN_SMTP_USER / TITAN_SMTP_PASS).')
  }

  const isPortalTicket = message.service_interest.startsWith('CPL support')
  const kind = isPortalTicket ? 'customer portal ticket' : 'website inquiry'
  const subject = `New ${kind}: ${message.service_interest}`.slice(0, 180)

  const text = [
    `New ${kind} from the Blank CO website`,
    '',
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    `Company: ${message.company}`,
    `Topic: ${message.service_interest}`,
    `Received: ${message.created_at}`,
    '',
    'Message:',
    message.message,
    '',
    isPortalTicket
      ? 'Source: Blank CO customer portal'
      : 'Source: blankcoph.solutions contact form',
  ].join('\n')

  const rows: Array<[string, string]> = [
    ['Name', message.name],
    ['Email', message.email],
    ['Company', message.company],
    ['Topic', message.service_interest],
    ['Received', new Date(message.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' })],
    ['Source', isPortalTicket ? 'Customer portal' : 'Contact form'],
  ]

  const html = `<!doctype html>
<html><body style="margin:0;background:#f4f4f2;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#151513">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #d9d9d4">
    <div style="background:#151513;color:#ffffff;padding:20px 24px">
      <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#b9b9b2">Blank CO PH Solutions</p>
      <h1 style="margin:6px 0 0;font-size:20px">New ${escapeHtml(kind)}</h1>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      ${rows.map(([label, value]) => `<tr><td style="padding:10px 24px;border-bottom:1px solid #efefec;color:#6b6b66;width:120px">${escapeHtml(label)}</td><td style="padding:10px 24px;border-bottom:1px solid #efefec">${escapeHtml(value)}</td></tr>`).join('')}
    </table>
    <div style="padding:20px 24px">
      <p style="margin:0 0 8px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6b66">Message</p>
      <div style="white-space:pre-wrap;font-size:14px;line-height:1.6">${escapeHtml(message.message)}</div>
    </div>
    <div style="padding:16px 24px;border-top:1px solid #efefec;font-size:12px;color:#6b6b66">
      Reply directly to this email to answer ${escapeHtml(message.name)} at ${escapeHtml(message.email)}.
    </div>
  </div>
</body></html>`

  const client = new SMTPClient({
    connection: {
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      tls: SMTP_PORT === 465,
      auth: { username: SMTP_USER, password: SMTP_PASS },
    },
  })

  try {
    await client.send({
      from: MAIL_FROM,
      to: NOTIFY_TO,
      subject,
      content: toCrlf(text),
      html: toCrlf(html),
      replyTo: message.email,
    })
  } finally {
    try {
      await client.close()
    } catch {
      // The message was already handed to the SMTP server; ignore close errors.
    }
  }
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let id = ''
  try {
    const body = await request.json()
    id = String(body?.id || body?.record?.id || '')
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'A message id is required' }, 400)

  const url = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) return json({ error: 'Supabase environment is not configured' }, 500)

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data, error } = await admin
    .from('messages')
    .select('id, name, email, company, service_interest, message, created_at, consent')
    .eq('id', id)
    .maybeSingle()

  if (error) return json({ error: error.message }, 500)
  if (!data) return json({ error: 'Message not found' }, 404)

  const ageMinutes = (Date.now() - new Date(data.created_at).getTime()) / 60000
  if (ageMinutes > MAX_AGE_MINUTES) {
    return json({ skipped: true, reason: 'Message is older than the notification window' })
  }

  try {
    await sendMail(data as MessageRow)
    return json({ sent: true, to: NOTIFY_TO })
  } catch (sendError) {
    console.error('Ticket notification failed', sendError)
    return json({ error: String(sendError instanceof Error ? sendError.message : sendError) }, 500)
  }
})
