package com.nexchat.backend.chat;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
    private String content;
    private String sender;
    private String recipient; // For direct messaging
    private String channel;   // "general", "team", "projects" or null for direct
}
