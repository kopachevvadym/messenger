import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import useChats from '@/lib/hooks/use-chats';

export default function Sidebar() {
  const router = useRouter();
  const { chatId, userId } = router.query;

  const { chats, deleteChat } = useChats(chatId, userId);

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