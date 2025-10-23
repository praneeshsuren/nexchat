package com.nexchat.backend.chat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
public class ChatMessageService {
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
        return chatMessageRepository.save(entity);
    }

    public List<ChatMessageEntity> getMessagesForChannel(String channel) {
        return chatMessageRepository.findByChannel(channel);
    }

    public List<ChatMessageEntity> getMessagesForDirect(String user1, String user2) {
        List<ChatMessageEntity> sent = chatMessageRepository.findBySenderAndRecipient(user1, user2);
        List<ChatMessageEntity> received = chatMessageRepository.findBySenderAndRecipient(user2, user1);
        sent.addAll(received);
        sent.sort((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()));
        return sent;
    }
}
