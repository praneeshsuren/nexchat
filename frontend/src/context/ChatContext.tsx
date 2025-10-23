import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../types/chat';
import { useAuthContext } from '@asgardeo/auth-react';

export type ActiveChannel = {
  type: 'channel' | 'dm';
  name: string;
};

export interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (messageContent: string) => void;
  isConnected: boolean;
  activeChannel: ActiveChannel;
  subscribeChannel: (name: string) => void;
  subscribeDirect: (name: string) => void;
}

// Create the context
// Import context from separate file for Fast Refresh compliance
import { ChatContext } from './ChatContextInstance';

// Define the backend WebSocket endpoint
const SOCKET_URL = 'http://localhost:8081/ws-chat';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeChannel, setActiveChannel] = useState<ActiveChannel>({ type: 'channel', name: 'general' });
  const stompClientRef = useRef<Client | null>(null);
  const { state, getAccessToken } = useAuthContext();
  const username = state?.username || 'Guest';

  useEffect(() => {
    if (!username || username === 'Guest') return;

    // Store client in a ref to access in cleanup
    stompClientRef.current = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {}, // Will be set async before activation
      onConnect: () => {
        setIsConnected(true);
        console.log('WebSocket Connected');

        // Subscribe to public presence topic
        stompClientRef.current!.subscribe('/topic/public', (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, chatMessage]);
        });

        // Subscribe to specific channels
        ['general', 'team', 'projects'].forEach((channel) => {
          stompClientRef.current!.subscribe(`/channel/${channel}`, (message: IMessage) => {
            const chatMessage: ChatMessage = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, chatMessage]);
          });
        });

        // Subscribe to direct messages for this user
        stompClientRef.current!.subscribe(`/user/queue/messages`, (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, chatMessage]);
        });
        
        // Send JOIN message after all subscriptions are set up
        stompClientRef.current!.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({
            sender: username,
            content: '',
          }),
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

    // Need to get token *before* activating
    const connectAsync = async () => {
      try {
        const token = await getAccessToken();
        if (stompClientRef.current) {
          stompClientRef.current.connectHeaders['Authorization'] = `Bearer ${token}`;
          stompClientRef.current.activate(); // Now connect
        }
      } catch (error) {
        console.error("Failed to get Asgardeo token for WebSocket", error);
      }
    };

    connectAsync();

    // Cleanup on unmount
    return () => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        // Send LEAVE message
        stompClientRef.current.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({
            sender: username,
            content: '',
          }),
        });
        stompClientRef.current.deactivate();
      }
    };
  }, [username, getAccessToken]); // Re-run if username or getAccessToken function changes

  // Function to send a message to the *active* channel or user
  const sendMessage = (messageContent: string) => {
    if (stompClientRef.current && stompClientRef.current.connected && username !== 'Guest') {
      
      const msg: ChatMessage = {
        sender: username,
        content: messageContent,
        // Set channel or recipient based on active chat
        channel: activeChannel.type === 'channel' ? activeChannel.name : undefined,
        recipient: activeChannel.type === 'dm' ? activeChannel.name : undefined,
      };

      stompClientRef.current.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(msg),
      });
    } else {
      console.error('Cannot send message: STOMP client is not connected or user is not set.');
    }
  };

  // Implement the channel switching functions
  const subscribeChannel = useCallback((name: string) => {
    setActiveChannel({ type: 'channel', name });
  }, []);

  const subscribeDirect = useCallback((name: string) => {
    setActiveChannel({ type: 'dm', name });
  }, []);

  return (
    <ChatContext.Provider 
      value={{ 
        messages, 
        sendMessage, 
        isConnected, 
        activeChannel, 
        subscribeChannel, 
        subscribeDirect 
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};


