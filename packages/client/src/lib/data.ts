import { supabase } from '@/lib/supabase';

export async function loadChats(userId: string) {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('chat_users')
    .select('chat_id, chats ( id, created_at )')
    .eq('user_id', userId);

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(c => c.chats);
}

export async function loadChatMessages(chatId: string) {
  if (!chatId) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('id, content, created_at, user_id, users ( name )')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}
