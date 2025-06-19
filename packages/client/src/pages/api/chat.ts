import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  const { user_id } = JSON.parse(req.body);
  const { data: chat, error } = await supabase
    .from('chats')
    .insert({})
    .select()
    .single();

  if (error) return res.status(500).json({ error });

  await supabase.from('chat_users').insert([{ chat_id: chat.id, user_id }]);

  res.status(200).json(chat);
}
