package com.nexchat.backend.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    // SimpMessagingTemplate allows us to send messages to specific users or topics
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Handles CHAT messages.
     * Checks if it's a DM (has recipient) or channel message (has channel).
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        if (chatMessage.getRecipient() != null && !chatMessage.getRecipient().isEmpty()) {
            // This is a direct message
            // Send to the specific user's private queue
            messagingTemplate.convertAndSendToUser(
                chatMessage.getRecipient(),          // User to send to
                "/queue/messages",                 // Destination
                chatMessage                        // Payload
            );
        } else if (chatMessage.getChannel() != null && !chatMessage.getChannel().isEmpty()) {
            // This is a channel message
            // Send to the specific channel topic
            messagingTemplate.convertAndSend(
                "/channel/" + chatMessage.getChannel(), // Destination
                chatMessage                             // Payload
            );
        }
        // You could add an 'else' here to handle messages with no recipient or channel,
        // maybe send them to /topic/public
    }

    /**
     * Handles JOIN and LEAVE messages.
     * Broadcasts the message to the public topic for presence notifications.
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Get username from the WebSocket session (put there by the HandshakeInterceptor)
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        
        if (username != null) {
            // Set the sender from the authenticated session attribute
            chatMessage.setSender(username);
        }
        
        // Add username to the WebSocket session
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        return chatMessage;
    }
}
