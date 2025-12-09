package com.nexchat.backend.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ChatMessageService {
    private static final Logger logger = LoggerFactory.getLogger(ChatMessageService.class);
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    /**
     * Normalize username by extracting the part after the last "/" if present
     * e.g., "DEFAULT/user@example.com" -> "user@example.com"
     */
    private String normalizeUsername(String username) {
        if (username == null || username.isEmpty()) {
            return "";
        }
        int slashIndex = username.lastIndexOf('/');
        if (slashIndex >= 0 && slashIndex < username.length() - 1) {
            return username.substring(slashIndex + 1).toLowerCase().trim();
        }
        return username.toLowerCase().trim();
    }

    public ChatMessageEntity saveMessage(ChatMessage chatMessage) {
        ChatMessageEntity entity = ChatMessageEntity.builder()
                .sender(chatMessage.getSender())
                .content(chatMessage.getContent())
                .recipient(chatMessage.getRecipient())
                .channel(chatMessage.getChannel())
                .timestamp(Instant.now())
                .build();
            try {
                return chatMessageRepository.save(entity);
            } catch (Exception e) {
                logger.error("Failed to save chat message", e);
                return null;
            }
    }

    public List<ChatMessageEntity> getMessagesForChannel(String channel) {
        List<ChatMessageEntity> list = chatMessageRepository.findByChannel(channel);
        list.sort((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()));
        return list;
    }

    public List<ChatMessageEntity> getMessagesForDirect(String user1, String user2) {
        // Normalize usernames to handle format variations like "DEFAULT/user@example.com"
        String normalizedUser1 = normalizeUsername(user1);
        String normalizedUser2 = normalizeUsername(user2);
        
        logger.debug("Fetching DMs between '{}' (normalized: '{}') and '{}' (normalized: '{}')", 
                     user1, normalizedUser1, user2, normalizedUser2);
        
        // Use the flexible query that handles username format variations
        List<ChatMessageEntity> messages = chatMessageRepository.findDirectMessagesBetweenUsers(
            normalizedUser1, normalizedUser2
        );
        
        logger.debug("Found {} messages between users", messages.size());
        return messages;
    }
}
