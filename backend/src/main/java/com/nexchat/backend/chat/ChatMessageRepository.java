package com.nexchat.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    List<ChatMessageEntity> findByChannel(String channel);
    List<ChatMessageEntity> findBySenderAndRecipient(String sender, String recipient);
    List<ChatMessageEntity> findByRecipientAndSender(String recipient, String sender);
}
