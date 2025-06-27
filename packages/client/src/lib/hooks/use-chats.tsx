import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

export default function useChats(chatId: string, userId: string) {
  const [chats, setChats] = useState([]);
  const router = useRouter();

  // Load chats this user is in
  useEffect(() => {
    if (!userId) return;

    const loadChats = async () => {
      const { data, error } = await supabase
        .from('chat_users')
        .select('chat_id, chats ( id, created_at )')
        .eq('user_id', userId);

      if (error) console.error(error);
      else setChats(data.map(c => c.chats));
    };

    loadChats();
  }, [userId]);

  const deleteChat = async (chat) => {
    const confirmDelete = confirm(`Delete chat ${chat.id.slice(0, 6)}?`);
    if (!confirmDelete) return;

    await supabase.from('chats').delete().eq('id', chat.id);
    setChats((prev) => prev.filter(c => c.id !== chat.id));
    if (chat.id === chatId) {
      router.push('/');
    }
  };

  return { chats, deleteChat };
}