import React, { useEffect, useState, useRef, useCallback } from 'react';
import type { IMessage } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { ChatMessage } from '../types/chat';
import { MessageType } from '../types/chat';
import { useAuthContext } from '@asgardeo/auth-react';

export type ActiveChannel = {
  type: 'channel' | 'dm';
  name: string; // id: channel name or userName for DM
  label?: string; // human-friendly label for display (DM names)
};

export interface ChatContextType {
  messages: ChatMessage[];
  sendMessage: (messageContent: string) => void;
  isConnected: boolean;
  activeChannel: ActiveChannel;
  subscribeChannel: (name: string) => void;
  subscribeDirect: (name: string, label?: string) => void;
  displayNameFor: (username: string) => string;
}

// Create the context
// Import context from separate file for Fast Refresh compliance
import { ChatContext } from './ChatContextInstance';

// Define the backend WebSocket endpoint
const SOCKET_URL = 'http://localhost:8081/ws-chat';
const API_BASE = 'http://localhost:8081';

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeChannel, setActiveChannel] = useState<ActiveChannel>({ type: 'channel', name: 'general' });
  const stompClientRef = useRef<Client | null>(null);
  const { state, getAccessToken } = useAuthContext();
  const username = state?.username || 'Guest';
  // Map from normalized userName -> display label
  const [userLabelMap, setUserLabelMap] = useState<Record<string, string>>({});
  // Map from normalized userName -> original SCIM userName (may include prefixes)
  const [originalUserNameMap, setOriginalUserNameMap] = useState<Record<string, string>>({});
  // Track topics we've already subscribed to
  const subscribedTopicsRef = useRef<Set<string>>(new Set());

  // Helper to normalize usernames for matching
  const normalizeUser = (u: string) => {
    if (!u) return '';
    const s = u.includes('/') ? u.substring(u.lastIndexOf('/') + 1) : u;
    return s.trim();
  };

  // Resolve a friendly display name for any username
  const displayNameFor = useCallback((u: string) => {
    const key = normalizeUser(u);
    const mapped = userLabelMap[key];
    if (mapped) return mapped;
    // Fallbacks: strip domain if email-like, else return sanitized
    if (key.includes('@')) {
      const local = key.split('@')[0];
      // Title-case-ish fallback
      const pretty = local.replace(/[_./-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return pretty || 'User';
    }
    return key || 'User';
  }, [userLabelMap]);

  useEffect(() => {
    if (!username || username === 'Guest') return;

    // Store client in a ref to access in cleanup
    stompClientRef.current = new Client({
      // Force SockJS to use XHR transports to avoid initial WebSocket handshake errors
      webSocketFactory: () => new SockJS(SOCKET_URL, undefined, { transports: ['xhr-streaming', 'xhr-polling'] }),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {}, // Will be set async before activation
      onConnect: () => {
        setIsConnected(true);
        console.log('WebSocket Connected');

        const subscribeIfNeeded = (topic: string, cb: (m: IMessage) => void) => {
          if (!subscribedTopicsRef.current.has(topic)) {
            subscribedTopicsRef.current.add(topic);
            stompClientRef.current!.subscribe(topic, cb);
          }
        };

        // Subscribe to public presence topic
        subscribeIfNeeded('/topic/public', (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, chatMessage]);
        });

        // Subscribe to specific channels
        ['general', 'team', 'projects'].forEach((channel) => {
          subscribeIfNeeded(`/channel/${channel}`, (message: IMessage) => {
            const chatMessage: ChatMessage = JSON.parse(message.body);
            setMessages((prevMessages) => [...prevMessages, chatMessage]);
          });
        });

        // Subscribe to direct messages for this user (per-user topic)
        subscribeIfNeeded(`/dm/${username}`, (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, chatMessage]);
        });
        
        // Send JOIN message after all subscriptions are set up
        stompClientRef.current!.publish({
          destination: '/app/chat.addUser',
          body: JSON.stringify({
            type: MessageType.JOIN,
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
            type: MessageType.LEAVE,
            sender: username,
            content: '',
          }),
        });
        stompClientRef.current.deactivate();
      }
    };
  }, [username, getAccessToken]); // Re-run if username or getAccessToken function changes

  // Load users -> build label map (GivenName FamilyName or displayName) and original name map
  useEffect(() => {
    let isMounted = true;
    type UserSummary = { userName: string; givenName?: string; familyName?: string; displayName?: string };
    const fetchWithRetry = async (attempt = 1): Promise<UserSummary[] | null> => {
      try {
        const res = await fetch(`${API_BASE}/api/users`);
        if (!res.ok) return null;
        return (await res.json()) as UserSummary[];
      } catch {
        if (attempt < 5) {
          await new Promise(r => setTimeout(r, attempt * 400));
          return fetchWithRetry(attempt + 1);
        }
        return null;
      }
    };
    const buildMap = async () => {
      const list = await fetchWithRetry();
      if (!isMounted || !list) return;
      const map: Record<string, string> = {};
      const originalMap: Record<string, string> = {};
      for (const u of list) {
        const key = normalizeUser(u.userName);
        const sanitize = (s?: string) => {
          if (!s) return '';
          if (s.includes('@')) {
            const local = s.split('@')[0];
            return local.replace(/[_./-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          }
          return s;
        };
        const label = `${u.givenName ?? ''} ${u.familyName ?? ''}`.trim() || sanitize(u.displayName) || sanitize(key);
        map[key] = label;
        originalMap[key] = u.userName;
      }
      setUserLabelMap(map);
      setOriginalUserNameMap(originalMap);
    };
    buildMap();
    return () => { isMounted = false; };
  }, []);

  // After maps are loaded and socket connected, subscribe to canonical SCIM username topic if different
  useEffect(() => {
    if (!isConnected || !stompClientRef.current) return;
    const norm = normalizeUser(username);
    const scimUserName = originalUserNameMap[norm];
    if (scimUserName && scimUserName !== username) {
      const topic = `/dm/${scimUserName}`;
      if (!subscribedTopicsRef.current.has(topic)) {
        subscribedTopicsRef.current.add(topic);
        stompClientRef.current.subscribe(topic, (message: IMessage) => {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, chatMessage]);
        });
        console.debug('Subscribed to additional DM topic for self:', topic);
      }
    }
  }, [isConnected, username, originalUserNameMap]);

  // Load historical messages for the active channel/DM from the backend
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const fetchWithRetry = async (url: string, headers: HeadersInit, attempt = 1): Promise<Response | null> => {
          try {
            const res = await fetch(url, { headers });
            if (!res.ok) return res;
            return res;
          } catch (e) {
            if (attempt < 5) {
              await new Promise(r => setTimeout(r, attempt * 500));
              return fetchWithRetry(url, headers, attempt + 1);
            }
            throw e;
          }
        };
        // Do NOT send Authorization for history endpoints while we diagnose 401s;
        // backend temporarily permits these GET routes.
        const headers: HeadersInit = {};

        let url = '';
        if (activeChannel.type === 'channel') {
          // Channel history does not depend on current username
          url = `${API_BASE}/api/channels/${encodeURIComponent(activeChannel.name)}/messages`;
        } else {
          // For DMs we need the current user's name
          if (!username || username === 'Guest') return;
          // Use query-parameter endpoint to safely support slashes in usernames
          const u1 = encodeURIComponent(username);
          const u2 = encodeURIComponent(activeChannel.name);
          url = `${API_BASE}/api/direct/messages?user1=${u1}&user2=${u2}`;
        }

        const res = await fetchWithRetry(url, headers);
        if (!res || !res.ok) {
          const status = res ? res.status : 'no-response';
          const body = res ? await res.text() : '';
          console.error('Failed to load message history', status, body);
          return;
        }
        const data: Array<{ sender: string; content: string; recipient?: string; channel?: string }>= await res.json();
        console.debug('Loaded history', {
          target: activeChannel,
          count: Array.isArray(data) ? data.length : 0,
        });
        // Replace current messages with fetched history for a clean view
        setMessages(data);
      } catch (err) {
        console.error('Error loading message history', err);
      }
    };
    loadHistory();
  }, [activeChannel, username, getAccessToken]);

  // Function to send a message to the *active* channel or user
  const sendMessage = (messageContent: string) => {
    if (stompClientRef.current && stompClientRef.current.connected && username !== 'Guest') {
      
      const msg: ChatMessage = {
        type: MessageType.CHAT,
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

  const subscribeDirect = useCallback((name: string, label?: string) => {
    setActiveChannel({ type: 'dm', name, label });
  }, []);

  return (
    <ChatContext.Provider 
      value={{ 
        messages, 
        sendMessage, 
        isConnected, 
        activeChannel, 
        subscribeChannel, 
        subscribeDirect,
        displayNameFor
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};


