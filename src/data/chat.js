import { supabase } from '../lib/supabase'

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  return supabase
}

async function chatRequest(body) {
  const { data, error } = await requireClient().functions.invoke('chat', { body })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data || {}
}

export async function listChatThreads() {
  const result = await chatRequest({ action: 'threads' })
  return result.threads || []
}

export async function findChatThread(subject) {
  const result = await chatRequest({ action: 'findThread', subject })
  return result.threadId || null
}

export async function getChatThread(threadId) {
  return chatRequest({ action: 'thread', threadId })
}

export async function sendChatReply(threadId, body) {
  const result = await chatRequest({ action: 'reply', threadId, body })
  return result.reply || null
}

/** Push notification from the chat function when any conversation gets a reply. */
export function subscribeChatUpdates(onChatId) {
  const channel = requireClient()
    .channel('support-chat')
    .on('broadcast', { event: 'updated' }, ({ payload }) => {
      const chatId = payload?.chatId
      if (chatId) onChatId(chatId)
    })
    .subscribe()
  return () => { void requireClient().removeChannel(channel) }
}
