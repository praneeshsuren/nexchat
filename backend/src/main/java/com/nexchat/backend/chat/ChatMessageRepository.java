package com.nexchat.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    List<ChatMessageEntity> findByChannel(String channel);
    List<ChatMessageEntity> findBySenderAndRecipient(String sender, String recipient);
    List<ChatMessageEntity> findByRecipientAndSender(String recipient, String sender);
    
    /**
     * Find all direct messages between two users, handling username format variations.
     * This query matches usernames that end with the given values (to handle prefixes like "DEFAULT/")
     */
    @Query("SELECT m FROM ChatMessageEntity m WHERE m.channel IS NULL AND " +
           "((LOWER(m.sender) LIKE %:user1Pattern AND LOWER(m.recipient) LIKE %:user2Pattern) OR " +
           "(LOWER(m.sender) LIKE %:user2Pattern AND LOWER(m.recipient) LIKE %:user1Pattern)) " +
           "ORDER BY m.timestamp ASC")
    List<ChatMessageEntity> findDirectMessagesBetweenUsers(
        @Param("user1Pattern") String user1Pattern,
        @Param("user2Pattern") String user2Pattern
    );
}
