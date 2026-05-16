package com.circlevibe.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_invites", indexes = {
    @Index(name = "idx_invite_token", columnList = "token"),
    @Index(name = "idx_invite_chat_id", columnList = "chat_id"),
    @Index(name = "idx_invite_target_user_id", columnList = "target_user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatInvite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "from_chat_participant_id", nullable = false)
    private Integer fromChatParticipantId;

    @Column(name = "target_user_id", nullable = false)
    private Integer targetUserId;

    @Column(nullable = false)
    private LocalDateTime expirationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatParticipant.UserChatRole role;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(name = "chat_id", nullable = false)
    private Integer chatId;
}