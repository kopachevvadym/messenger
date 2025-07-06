import { Message } from '@/lib/hooks/use-messages';

export default function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((m) => (
        <div key={m.id} className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
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
  );
}