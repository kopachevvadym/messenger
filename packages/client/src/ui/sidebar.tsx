import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';

export default function Sidebar() {
  const router = useRouter();
  const { chatId, userId } = router.query;

  const [chats, setChats] = useState([]);

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

  return (
    <div style={{ width: '250px', borderRight: '1px solid #ccc', padding: '1rem' }}>
      <h3>Chats</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {chats.map(chat => (
          <li
            key={chat.id}
            onContextMenu={(e) => {
              e.preventDefault();
              deleteChat(chat);
            }}
          >
            <Link href={`/chat/${chat.id}/user/${userId}`} style={{ textDecoration: 'none' }}>
              <div style={{ padding: '8px 0', cursor: 'pointer', color: chat.id === chatId ? 'blue' : 'black' }}>
                Chat {chat.id.slice(0, 6)}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}