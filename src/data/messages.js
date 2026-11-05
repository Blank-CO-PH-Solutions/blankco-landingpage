import { supabase } from '../lib/supabase'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

export async function createMessage(message) {
  const { error } = await requireSupabase().from('messages').insert({
    name: message.name.trim(),
    email: message.email.trim(),
    company: message.company.trim(),
    service_interest: message.serviceInterest.trim(),
    message: message.message.trim(),
    consent: message.consent,
  })

  if (error) throw error
}

export async function listMessages() {
  const { data, error } = await requireSupabase()
    .from('messages')
    .select('*')
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