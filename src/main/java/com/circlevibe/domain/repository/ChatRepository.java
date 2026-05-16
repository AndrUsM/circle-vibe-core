package com.circlevibe.domain.repository;

import com.circlevibe.domain.entity.Chat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Integer> {
    Optional<Chat> findByReadableName(String readableName);
    
    @Query("SELECT c FROM Chat c WHERE c.type = 'PUBLIC' AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Chat> searchPublicChats(@Param("query") String query, Pageable pageable);
    
    Page<Chat> findByIsActive(Boolean isActive, Pageable pageable);
}