package com.circlevibe.domain.repository;

import com.circlevibe.domain.entity.MessageFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageFileRepository extends JpaRepository<MessageFile, Integer> {
    List<MessageFile> findByMessageId(Integer messageId);
}