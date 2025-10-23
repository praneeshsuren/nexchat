export const MessageType = {
  CHAT: 'CHAT',
  JOIN: 'JOIN',
  LEAVE: 'LEAVE',
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];


export interface ChatMessage {
  sender: string;
  content: string;
  recipient?: string; // For direct messaging
  channel?: string;   // "general", "team", "projects" or undefined for direct
}
