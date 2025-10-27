package com.nexchat.backend.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Controller
@RestController
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    // SimpMessagingTemplate allows us to send messages to specific users or topics
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private AsgardeoUserService asgardeoUserService;

    @Autowired
    private ChatMessageService chatMessageService;

    /**
     * Handles CHAT messages.
     * Checks if it's a DM (has recipient) or channel message (has channel).
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        // Save to database
        chatMessageService.saveMessage(chatMessage);
        if (chatMessage.getRecipient() != null && !chatMessage.getRecipient().isEmpty()) {
            // This is a direct message
            messagingTemplate.convertAndSendToUser(
                chatMessage.getRecipient(),
                "/queue/messages",
                chatMessage
            );
        } else if (chatMessage.getChannel() != null && !chatMessage.getChannel().isEmpty()) {
            // This is a channel message
            messagingTemplate.convertAndSend(
                "/channel/" + chatMessage.getChannel(),
                chatMessage
            );
        }
    }
    /**
     * REST endpoint to get all messages for a channel
     */
    @GetMapping("/api/channels/{channel}/messages")
    public List<ChatMessageEntity> getChannelMessages(@PathVariable String channel) {
        List<ChatMessageEntity> list = chatMessageService.getMessagesForChannel(channel);
        logger.info("GET /api/channels/{}/messages -> {} messages", channel, list.size());
        return list;
    }

    /**
     * REST endpoint to get all direct messages between two users
     */
    @GetMapping("/api/direct/{user1}/{user2}/messages")
    public List<ChatMessageEntity> getDirectMessages(@PathVariable String user1, @PathVariable String user2) {
        List<ChatMessageEntity> list = chatMessageService.getMessagesForDirect(user1, user2);
        logger.info("GET /api/direct/{}/{}/messages -> {} messages", user1, user2, list.size());
        return list;
    }

    /**
     * Handles JOIN and LEAVE messages.
     * Broadcasts the message to the public topic for presence notifications.
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Get username from the WebSocket session (put there by the HandshakeInterceptor)
        var sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes != null) {
            String username = (String) sessionAttributes.get("username");
            if (username != null) {
                // Set the sender from the authenticated session attribute
                chatMessage.setSender(username);
                // User creation can be handled via Asgardeo if needed
            }
            // Add username to the WebSocket session
            sessionAttributes.put("username", chatMessage.getSender());
        }
        return chatMessage;
    }

    /**
     * REST endpoint to get all registered users from Asgardeo
     */
    @GetMapping("/api/users")
    public List<String> getRegisteredUsers() {
        return asgardeoUserService.listUsers();
    }
}
