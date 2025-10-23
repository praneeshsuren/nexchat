import React, { useState } from "react";
import Message from "./Message";

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to NexChat!", sender: "system" },
    { id: 2, text: "Hi there!", sender: "user" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: Date.now(), text: input, sender: "user" }]);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
        {messages.map((msg) => (
          <Message key={msg.id} text={msg.text} sender={msg.sender} />
        ))}
      </div>
      <div className="p-4 border-t flex gap-2 bg-gray-50">
        <input
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
