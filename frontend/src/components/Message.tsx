import React from "react";

interface MessageProps {
  text: string;
  sender: string;
}

const Message: React.FC<MessageProps> = ({ text, sender }) => {
  const isUser = sender === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-4 py-2 rounded-lg max-w-xs shadow text-sm ${
          isUser ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        {text}
      </div>
    </div>
  );
};

export default Message;
