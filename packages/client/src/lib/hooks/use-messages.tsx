import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function useMessages(chatId: string) {
  const [messages, setMessages] = useState([]);

  // Load messages for current chat
  useEffect(() => {
    if (!chatId) return;

    supabase
      .from('messages')
      .select('id, content, created_at, user_id, users ( name )')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error('Fetch error:', error);
        else setMessages(data);
      });

    const channel = supabase
      .channel('chat-room')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const newMessage = payload.new;

        const { data: user } = await supabase
          .from('users')
          .select('name')
          .eq('id', newMessage.user_id)
          .single();

        setMessages((prev) => [...prev, { ...newMessage, users: user }]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [chatId]);


  const sendMessage = async (text: string, userId: string) => {
    if (!text.trim() || !chatId || !userId) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ chat_id: chatId, user_id: userId, content: text }]);

    if (error) console.error('Send message error:', error);
  };

  return { messages, sendMessage };
}