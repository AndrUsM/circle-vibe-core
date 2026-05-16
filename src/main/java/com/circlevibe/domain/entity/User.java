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
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_username", columnList = "username"),
    @Index(name = "idx_chat_status", columnList = "chat_status"),
    @Index(name = "idx_type", columnList = "type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String firstname;

    @Column(nullable = false)
    private String surname;

    @Column(unique = true)
    private String username;

    private LocalDateTime birthDate;

    @Column(nullable = false)
    private String password;

    private String avatarUrl;

    private String avatarUrlOptimized;

    @Column(columnDefinition = "BOOLEAN DEFAULT true")
    @Builder.Default
    private Boolean isHiddenContactInfo = true;

    @Column(columnDefinition = "BOOLEAN DEFAULT true")
    @Builder.Default
    private Boolean isAllowedToSearch = true;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'ACTIVE'")
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    private String country;

    private String city;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String privateKey;

    @Column(nullable = false, unique = true)
    private String privateToken;

    @Column(unique = true)
    private String primaryPhone;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'PRIVATE'")
    @Builder.Default
    private UserType type = UserType.PRIVATE;

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'OFFLINE'")
    @Builder.Default
    private UserChatStatus chatStatus = UserChatStatus.OFFLINE;

    @ElementCollection(targetClass = Integer.class)
    @CollectionTable(name = "user_blocked_users", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "blocked_user_id")
    @Builder.Default
    private List<Integer> blockedUserIds = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChatParticipant> chatParticipants = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<UserConfirmation> confirmations = new ArrayList<>();

    public enum AccountStatus {
        DEACTIVATED, LOCKED, ACTIVE, NOT_ACTIVE
    }

    public enum UserType {
        PRIVATE, PUBLIC
    }

    public enum UserChatStatus {
        ONLINE, BUSY, AT_WORK, OFFLINE
    }
}