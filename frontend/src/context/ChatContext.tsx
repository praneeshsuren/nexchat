import React, { createContext, useEffect, useState, useRef } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../types/chat';
import { MessageType } from '../types/chat';
import { useAuthContext } from '@asgardeo/auth-react';

// Define the shape of the context
interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (messageContent: string) => void;
  isConnected: boolean;
}

// Create the context
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Define the backend WebSocket endpoint
// ** IMPORTANT: Change this URL to match your Spring Boot server's URL **
const SOCKET_URL = 'http://localhost:8081/ws';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);
  const { state } = useAuthContext(); // Get user info from Asgardeo

  const username = state?.username || 'Guest';

  useEffect(() => {
    if (!username) return;

    // Initialize the STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);
        console.log('WebSocket Connected');

        // Subscribe to the public topic
        client.subscribe('/topic/public', (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, chatMessage]);
        });

        // Send the "JOIN" message
        client.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({
            sender: username,
            type: MessageType.JOIN,
          } as ChatMessage),
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.log('WebSocket Disconnected');
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message'], frame.body);
      },
    });

    stompClientRef.current = client;
    client.activate(); // Connect

    // Cleanup on unmount
    return () => {
      // Send "LEAVE" message on disconnect
      if (client.connected) {
        client.publish({
          destination: '/app/chat.addUser', // Using addUser to notify, as backend implies
          body: JSON.stringify({
            sender: username,
            type: MessageType.LEAVE,
          } as ChatMessage),
        });
        client.deactivate();
      }
    };
  }, [username]); // Re-run if username changes

  // Function to send a CHAT message
  const sendMessage = (messageContent: string) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          sender: username,
          content: messageContent,
          type: MessageType.CHAT,
        } as ChatMessage),
      });
    } else {
      console.error('Cannot send message: STOMP client is not connected.');
    }
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage, isConnected }}>
      {children}
    </ChatContext.Provider>
  );
};

// Removed the useChat hook entirely to comply with Fast Refresh requirements

export { ChatContext };
