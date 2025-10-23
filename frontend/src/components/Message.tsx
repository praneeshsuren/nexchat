import React from 'react';
import type { ChatMessage } from '../types/chat';
import { MessageType } from '../types/chat';

interface MessageProps {
  message: ChatMessage;
  currentUserName: string;
}

const Message: React.FC<MessageProps> = ({ message, currentUserName }) => {
  
  // Handle JOIN or LEAVE messages
  if (message.type === MessageType.JOIN || message.type === MessageType.LEAVE) {
    return (
      <div className="my-2 text-center text-xs text-gray-500">
        <span className="font-semibold">{message.sender}</span>
        {message.type === MessageType.JOIN ? ' joined the chat' : ' left the chat'}
      </div>
    );
  }

  // Handle CHAT messages
  const isCurrentUser = message.sender === currentUserName;

  // Get first letter for avatar
  const avatarLetter = message.sender ? message.sender.charAt(0).toUpperCase() : '?';

  // Basic color hashing for avatars
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-red-500', 'bg-green-500', 'bg-purple-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  if (isCurrentUser) {
    // Render message for the current user (aligned right)
    return (
      <div className="flex justify-end">
        <div className="flex flex-col items-end">
          <div className="mt-1 max-w-xs rounded-lg rounded-tr-none bg-blue-600 p-3 text-white shadow-md md:max-w-md">
            <p className="text-sm">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render message for other users (aligned left)
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div
  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white ${getAvatarColor(
          message.sender
        )}`}
        title={message.sender}
      >
        {avatarLetter}
      </div>
      
      {/* Message Content */}
      <div className="flex flex-col items-start">
        <span className="text-sm font-bold text-gray-800">
          {message.sender}
        </span>
        <div className="mt-1 max-w-xs rounded-lg rounded-tl-none bg-white p-3 text-gray-800 shadow-sm md:max-w-md">
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

export default Message;
