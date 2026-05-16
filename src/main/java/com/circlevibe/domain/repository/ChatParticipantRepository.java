package com.circlevibe.domain.repository;

import com.circlevibe.domain.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Integer> {
    Optional<ChatParticipant> findByUserIdAndChatId(Integer userId, Integer chatId);
    List<ChatParticipant> findByUserId(Integer userId);
    List<ChatParticipant> findByChatId(Integer chatId);
    List<ChatParticipant> findByChatIdAndChatRole(Integer chatId, ChatParticipant.UserChatRole role);
    
    @Query("SELECT COUNT(cp) FROM ChatParticipant cp WHERE cp.chat.id = :chatId")
    Integer countParticipantsInChat(@Param("chatId") Integer chatId);
}