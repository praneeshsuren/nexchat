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
        List<ChatMessageEntity> sent = chatMessageRepository.findBySenderAndRecipient(user1, user2);
        List<ChatMessageEntity> received = chatMessageRepository.findBySenderAndRecipient(user2, user1);
        sent.addAll(received);
        sent.sort((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()));
        return sent;
    }
}
