package com.circlevibe.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "threads", indexes = {
    @Index(name = "idx_parent_message_id", columnList = "parent_message_id"),
    @Index(name = "idx_thread_chat_id", columnList = "chat_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Thread {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "parent_message_id", nullable = false)
    private Integer parentMessageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Message> messages = new ArrayList<>();

    @ManyToMany(mappedBy = "threads")
    @Builder.Default
    private List<ChatParticipant> participants = new ArrayList<>();
}