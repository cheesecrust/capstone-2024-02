package org.capstone.maru.domain;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.capstone.maru.dto.ChatMessage;
import org.springframework.data.mongodb.core.index.IndexDirection;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@NoArgsConstructor
@Document(collection = "chat")
public class Chat extends AuditingFields {

    private String id;

    @Indexed(direction = IndexDirection.ASCENDING)
    private Long roomId;

    private String message;

    private String nickname;

    @Builder
    public Chat(String id, String sender, String message, String nickname, Long room,
        LocalDateTime createdAt) {
        this.id = id;
        this.roomId = room;
        this.message = message;
        this.createdBy = sender;
        this.createdAt = createdAt;
        this.nickname = nickname;
    }

    public static Chat createChat(Long room, String sender, String message) {
        return Chat.builder()
            .room(room)
            .sender(sender)
            .message(message)
            .build();
    }

    public static Chat from(ChatMessage chatMessage) {
        return new Chat(
            chatMessage.messageId(),
            chatMessage.sender(),
            chatMessage.message(),
            chatMessage.nickname(),
            chatMessage.roomId(),
            chatMessage.createdAt()
        );
    }

}
