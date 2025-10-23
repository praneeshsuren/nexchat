import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import Message from './Message'; // Import the Message component

// Define the shape of a message object
interface MessageType {
  id: string;
  sender: string;
  text: string;
}

// Mock initial messages
const initialMessages: MessageType[] = [
  { id: 'm1', sender: 'Alice Smith', text: 'Hey everyone, starting the project kickoff!' },
  { id: 'm2', sender: 'Bob Johnson', text: 'Sounds great! I just pushed the initial component library.' },
  { id: 'm3', sender: 'system', text: 'Charlie Brown joined the channel.' },
];

/**
 * Main chat window with message display and input.
 */
const ChatWindow: React.FC<{ currentUserName: string }> = ({ currentUserName }) => {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle sending a new message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messageToSend: MessageType = {
      id: `m${messages.length + 1}`,
      sender: currentUserName, // Use the prop for the sender's name
      text: newMessage.trim(),
    };

    setMessages([...messages, messageToSend]);
    setNewMessage('');
  };

  return (
    <div className="flex h-full flex-1 flex-col">
      {/* Chat Header */}
      <header className="border-b bg-white p-4 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">#general</h2>
        <p className="text-sm text-gray-500">The main channel for all team discussions.</p>
      </header>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <Message
            key={msg.id}
            sender={msg.sender}
            text={msg.text}
            // Check if the message sender is the current logged-in user
            isCurrentUser={msg.sender === currentUserName}
          />
        ))}
        {/* Empty div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <footer className="border-t bg-white p-4">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border bg-gray-100 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 p-3 text-white transition-all hover:bg-blue-700 disabled:bg-gray-400"
            disabled={newMessage.trim() === ''}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
