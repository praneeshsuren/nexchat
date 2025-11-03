import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import Message from './Message';
import { useChat } from '../hooks/useChat';
import { useAuthContext } from '@asgardeo/auth-react';

const ChatWindow: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  // Get messages and send function from the context
  const { messages, sendMessage, isConnected, activeChannel } = useChat();
  
  // Get current user's name from auth context
  const { state } = useAuthContext();
  const currentUserName = state?.username || 'User';

  // Scroll to the bottom of the chat on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !isConnected) return;

    sendMessage(newMessage); // Use the function from context
    setNewMessage('');
  };

  // Filter messages for the selected chat (channel or user)
  const filteredMessages = messages.filter((msg) => {
    if (activeChannel.type === 'channel') {
      return msg.channel === activeChannel.name;
    } else if (activeChannel.type === 'dm') {
      // Show messages sent to or from the selected user
      return (
        (msg.sender === activeChannel.name && msg.recipient === currentUserName) ||
        (msg.sender === currentUserName && msg.recipient === activeChannel.name)
      );
    }
    return false;
  });

  // Header label
  const headerLabel = activeChannel.type === 'channel'
    ? `# ${activeChannel.name.charAt(0).toUpperCase() + activeChannel.name.slice(1)}`
    : `@ ${activeChannel.label || activeChannel.name}`;

  return (
    <div className="flex h-full flex-col bg-gray-100">
      {/* Chat Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4">
        <h2 className="text-xl font-semibold text-gray-800">{headerLabel}</h2>
        <p className="text-sm text-gray-500">
          {isConnected ? (
            <span className="text-green-600">Connected</span>
          ) : (
            <span className="text-red-600">Connecting...</span>
          )}
        </p>
      </div>

      {/* Message List */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {filteredMessages.map((msg: import('../types/chat').ChatMessage, index: number) => (
          <Message
            key={index}
            message={msg}
            currentUserName={currentUserName}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              isConnected
                ? `Type a message in ${headerLabel}...`
                : 'Waiting to connect...'
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={!isConnected}
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-blue-600 p-3 text-white transition-all hover:bg-blue-700 disabled:opacity-50"
            disabled={newMessage.trim() === '' || !isConnected}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
