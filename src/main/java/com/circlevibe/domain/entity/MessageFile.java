package com.circlevibe.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "message_files", indexes = {
    @Index(name = "idx_message_id", columnList = "message_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    private String optimizedUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageFileType type;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(50) DEFAULT 'FILE'")
    @Builder.Default
    private MessageFileEntityType entityType = MessageFileEntityType.FILE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private Message message;

    public enum MessageFileType {
        MP4, OGG, WEBM, AVI, IMAGE, AUDIO, DOCUMENT, MS_DOCUMENT
    }

    public enum MessageFileEntityType {
        IMAGE, VIDEO, FILE, AUDIO
    }
}