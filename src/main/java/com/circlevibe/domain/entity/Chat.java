package com.circlevibe.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chats", indexes = {
    @Index(name = "idx_updated_at", columnList = "updated_at"),
    @Index(name = "idx_last_message_id", columnList = "last_message_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String avatarUrl;

    @Column(columnDefinition = "BOOLEAN DEFAULT true")
    @Builder.Default
    private Boolean isActive = true;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'conversations'")
    @Builder.Default
    private String bucket = "conversations";

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String readableName;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'PRIVATE'")
    @Builder.Default
    private ChatType type = ChatType.PRIVATE;

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    @Builder.Default
    private Boolean isGroupChat = false;

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    @Builder.Default
    private Boolean isSavedMessages = false;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    @Builder.Default
    private Boolean hasUnreadMessages = false;

    @Column(columnDefinition = "BOOLEAN DEFAULT true")
    @Builder.Default
    private Boolean empty = true;

    @Column(columnDefinition = "INTEGER DEFAULT 0")
    @Builder.Default
    private Integer unreadMessagesCount = 0;

    @Column(nullable = false)
    private Integer usersLimit;

    @Column(columnDefinition = "BOOLEAN DEFAULT false")
    @Builder.Default
    private Boolean removed = false;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT 'Se9XNjAcmbrNoCooRPJq'")
    @Builder.Default
    private String encryptionSecret = "Se9XNjAcmbrNoCooRPJq";

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_message_id")
    private Message lastMessage;

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChatParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Message> messages = new ArrayList<>();

    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Thread> threads = new ArrayList<>();

    public enum ChatType {
        PUBLIC, PRIVATE
    }
}