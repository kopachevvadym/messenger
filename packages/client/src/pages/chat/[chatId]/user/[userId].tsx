import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { loadChatMessages, loadChats } from '@/lib/data';

export default function ChatPage() {
  const router = useRouter();
  const { chatId, userId } = router.query;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [chats, setChats] = useState([]);
  const [inviteName, setInviteName] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  // Load chats this user is in
  useEffect(() => {
    if (!userId) return;

    loadChats(userId);
  }, [userId]);

  // Load messages for current chat
  useEffect(() => {
    if (!chatId) return;

    loadChatMessages(chatId)
      .then(data => setMessages(data));

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

  const sendMessage = async () => {
    if (!text.trim()) return;
    await supabase.from('messages').insert([{ chat_id: chatId, user_id: userId, content: text }]);
    setText('');
  };

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
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
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
          <button onClick={sendMessage} style={{ marginLeft: '0.5rem' }}>Send</button>
        </div>
      </div>
    </div>
  );
}
