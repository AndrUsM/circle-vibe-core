package com.circlevibe.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_participants", indexes = {
    @Index(name = "idx_chat_id", columnList = "chat_id"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_chat_role", columnList = "chat_role")
}, uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "chat_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'ADMIN'")
    @Builder.Default
    private UserChatRole chatRole = UserChatRole.ADMIN;

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    @Builder.Default
    private Boolean isMuted = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Message> messages = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "thread_participants",
            joinColumns = @JoinColumn(name = "participant_id"),
            inverseJoinColumns = @JoinColumn(name = "thread_id"))
    @Builder.Default
    private List<Thread> threads = new ArrayList<>();

    public enum UserChatRole {
        ADMIN, MODERATOR, BOT, MEMBER, TECH_SUPPORT
    }
}