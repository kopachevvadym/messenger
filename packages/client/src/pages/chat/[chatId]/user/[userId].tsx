import { useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '@/ui/sidebar';
import useMessages from '@/lib/hooks/use-messages';
import InviteHeader from '@/ui/invite/inviteHeader';
import MessageList from '@/ui/messages/messageList';
import MessageInput from '@/ui/messages/input';

export default function ChatPage() {
  const router = useRouter();
  const { chatId, userId } = router.query;
  const { messages, sendMessage } = useMessages(chatId);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header with Invite Section */}
        <InviteHeader chatId={chatId as string} />

        {/* Message List */}
        <MessageList messages={messages} />

        {/* Message Input */}
        <MessageInput chatId={chatId as string} userId={userId as string} sendMessage={sendMessage} />
      </div>
    </div>
  );
}
