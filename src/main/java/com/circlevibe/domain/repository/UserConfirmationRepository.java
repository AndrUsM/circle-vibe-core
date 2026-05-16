package com.circlevibe.domain.repository;

import com.circlevibe.domain.entity.UserConfirmation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserConfirmationRepository extends JpaRepository<UserConfirmation, Integer> {
    Optional<UserConfirmation> findByCode(String code);
    List<UserConfirmation> findByUserId(Integer userId);
    List<UserConfirmation> findByEmail(String email);
}