import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function InviteHeader({ chatId }: { chatId: string }) {
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
  );
}