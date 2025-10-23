import React from 'react';

interface MessageProps {
  sender: string;
  text: string;
  isCurrentUser: boolean;
}

/**
 * Displays a single chat message.
 * Styles differently based on whether it's from the current user.
 */
const Message: React.FC<MessageProps> = ({ sender, text, isCurrentUser }) => {
  // Special styling for system messages
  if (sender === 'system') {
    return (
      <div className="my-2 text-center text-xs text-gray-500">
        <em>{text}</em>
      </div>
    );
  }

  // Get initials for the avatar
  const initials = sender
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex items-start gap-3 ${
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-semibold ${
          isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
        }`}
      >
        {isCurrentUser ? 'YOU' : initials}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-xs rounded-lg px-4 py-3 md:max-w-md ${
          isCurrentUser
            ? 'rounded-br-none bg-blue-600 text-white'
            : 'rounded-bl-none bg-white text-gray-800 shadow-sm'
        }`}
      >
        <div className={`text-sm font-bold ${isCurrentUser ? 'hidden' : 'block'}`}>
          {sender}
        </div>
        <p className="text-base">{text}</p>
      </div>
    </div>
  );
};

export default Message;
