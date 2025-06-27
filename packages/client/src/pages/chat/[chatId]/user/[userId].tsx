import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Sidebar from '@/ui/sidebar';
import useMessages from '@/lib/hooks/use-messages';

export default function ChatPage() {
  const router = useRouter();
  const { chatId, userId } = router.query;

  const { messages, sendMessage } = useMessages(chatId);
  const [text, setText] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const inviteUser = async () => {
    if (!inviteName.trim() || !chatId) return;

    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('name', inviteName.trim())
      .maybeSingle();

    let user;
    if (existingUser) {
      user = existingUser;
    } else {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ name: inviteName.trim() }])
        .select()
        .single();

      if (error) {
        alert('Error creating user');
        return;
      }
      user = newUser;
    }

    await supabase.from('chat_users').upsert([{ chat_id: chatId, user_id: user.id }]);

    setInviteLink(`${window.location.origin}/chat/${chatId}/user/${user.id}`);
    setInviteName('');
  };


  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        {/* Invite Section */}
        <div style={{ marginBottom: '1rem' }}>
          <input
            value={inviteName}
            onChange={e => setInviteName(e.target.value)}
            placeholder="Enter user name to invite"
            style={{ marginRight: '0.5rem' }}
          />
          <button onClick={inviteUser}>Invite</button>
          {inviteLink && (
            <div style={{ marginTop: '0.5rem' }}>
              Invite link: <a href={inviteLink}>{inviteLink}</a>
            </div>
          )}
        </div>

        {/* Message List */}
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
          {messages.map((m) => (
            <p key={m.id}>
              <b>{m.users?.name || 'Unknown'}:</b> {m.content}
            </p>
          ))}
        </div>

        {/* Message Input */}
        <div style={{ display: 'flex' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ flex: 1, padding: '0.5rem' }}
            placeholder="Type a message"
          />
          <button onClick={() => sendMessage(text, userId)} style={{ marginLeft: '0.5rem' }}>Send</button>
        </div>
      </div>
    </div>
  );
}
