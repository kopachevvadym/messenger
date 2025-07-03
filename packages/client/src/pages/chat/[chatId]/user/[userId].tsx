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
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header with Invite Section */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <input
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              placeholder="Enter user name to invite"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={inviteUser}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Invite
            </button>
          </div>
          {inviteLink && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-sm text-green-700 font-medium">Invite link:</span>
              <a
                href={inviteLink}
                className="ml-2 text-blue-600 hover:text-blue-800 underline break-all"
              >
                {inviteLink}
              </a>
            </div>
          )}
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {(m.users?.name || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">
                {m.users?.name || 'Unknown'}
              </span>
                  <span className="text-xs text-gray-500">
                {new Date().toLocaleTimeString()}
              </span>
                </div>
                <div className="bg-gray-50 rounded-lg px-3 py-2 text-gray-800">
                  {m.content}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type a message..."
            />
            <button
              onClick={() => sendMessage(text, userId)}
              className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
