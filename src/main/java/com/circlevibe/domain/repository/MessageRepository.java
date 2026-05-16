package com.circlevibe.domain.repository;

import com.circlevibe.domain.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
    Page<Message> findByChatId(Integer chatId, Pageable pageable);
    List<Message> findByThreadId(Integer threadId);
    
    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId AND m.removed = false ORDER BY m.createdAt DESC")
    Page<Message> findActiveMessagesByChat(@Param("chatId") Integer chatId, Pageable pageable);
    
    @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.id = :chatId AND m.status = 'UNREAD' AND m.sender.user.id != :userId")
    Integer countUnreadMessagesForUser(@Param("chatId") Integer chatId, @Param("userId") Integer userId);
}