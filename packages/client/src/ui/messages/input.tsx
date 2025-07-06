import { useState } from 'react';
import useMessages from '@/lib/hooks/use-messages';

export default function MessageInput({ chatId, userId, sendMessage }: { chatId: string; userId: string, sendMessage: (text: string, userId: string) => void }) {
  const [text, setText] = useState('');

  return (
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
          Send
        </button>
      </div>
    </div>
  );
}