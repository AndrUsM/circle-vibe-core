-- Initial database schema for Circle Vibe Core

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE,
    birth_date TIMESTAMP,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    avatar_url_optimized VARCHAR(500),
    is_hidden_contact_info BOOLEAN DEFAULT true NOT NULL,
    is_allowed_to_search BOOLEAN DEFAULT true,
    account_status VARCHAR(20) DEFAULT 'ACTIVE',
    country VARCHAR(100),
    city VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    private_key VARCHAR(255) UNIQUE NOT NULL,
    private_token VARCHAR(255) UNIQUE NOT NULL,
    primary_phone VARCHAR(20) UNIQUE,
    type VARCHAR(10) DEFAULT 'PRIVATE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    chat_status VARCHAR(10) DEFAULT 'OFFLINE'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_chat_status ON users(chat_status);
CREATE INDEX idx_users_type ON users(type);

CREATE TABLE user_blocked_ids (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id BIGINT NOT NULL
);

CREATE TABLE chats (
    id BIGSERIAL PRIMARY KEY,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true NOT NULL,
    bucket VARCHAR(50) DEFAULT 'conversations',
    name VARCHAR(255) NOT NULL,
    readable_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(10) DEFAULT 'PRIVATE',
    is_group_chat BOOLEAN DEFAULT false NOT NULL,
    is_saved_messages BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    has_unread_messages BOOLEAN DEFAULT false,
    empty BOOLEAN DEFAULT true,
    unread_messages_count INTEGER DEFAULT 0,
    users_limit INTEGER NOT NULL,
    removed BOOLEAN DEFAULT false NOT NULL,
    encryption_secret VARCHAR(255) DEFAULT 'Se9XNjAcmbrNoCooRPJq',
    last_message_id BIGINT
);

CREATE INDEX idx_chats_updated_at ON chats(updated_at);
CREATE INDEX idx_chats_last_message_id ON chats(last_message_id);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    status VARCHAR(10) DEFAULT 'UNREAD',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message_type VARCHAR(10) DEFAULT 'TEXT',
    removed BOOLEAN DEFAULT false NOT NULL,
    hidden BOOLEAN DEFAULT false NOT NULL,
    chat_id BIGINT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL,
    thread_id BIGINT,
    child_thread_id BIGINT
);

CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at);
CREATE INDEX idx_messages_sender ON messages(sender_id);

CREATE TABLE threads (
    id BIGSERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    parent_message_id BIGINT NOT NULL
);

CREATE INDEX idx_threads_parent_msg ON threads(parent_message_id);
CREATE INDEX idx_threads_chat ON threads(chat_id);

CREATE TABLE chat_participants (
    id BIGSERIAL PRIMARY KEY,
    chat_role VARCHAR(20) DEFAULT 'ADMIN',
    is_muted BOOLEAN DEFAULT false,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chat_id BIGINT NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    UNIQUE(user_id, chat_id)
);

CREATE INDEX idx_chat_part_chat ON chat_participants(chat_id);
CREATE INDEX idx_chat_part_user ON chat_participants(user_id);
CREATE INDEX idx_chat_part_role ON chat_participants(chat_role);

-- Add foreign key for messages.sender_id
ALTER TABLE messages ADD CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES chat_participants(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT fk_messages_thread FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE;
ALTER TABLE chats ADD CONSTRAINT fk_chats_last_message FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;

CREATE TABLE message_files (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    optimized_url VARCHAR(500) NOT NULL,
    type VARCHAR(20) NOT NULL,
    description TEXT,
    entity_type VARCHAR(20) DEFAULT 'FILE',
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE
);

CREATE INDEX idx_msg_file_msg ON message_files(message_id);

CREATE TABLE chat_invites (
    id BIGSERIAL PRIMARY KEY,
    from_chat_participant_id BIGINT NOT NULL,
    target_user_id BIGINT NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    role VARCHAR(20) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    chat_id BIGINT NOT NULL REFERENCES chats(id) ON DELETE CASCADE
);

CREATE INDEX idx_invite_token ON chat_invites(token);
CREATE INDEX idx_invite_chat ON chat_invites(chat_id);
CREATE INDEX idx_invite_target_user ON chat_invites(target_user_id);

CREATE TABLE user_confirmations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed BOOLEAN DEFAULT false NOT NULL
);

CREATE INDEX idx_confirm_user ON user_confirmations(user_id);
CREATE INDEX idx_confirm_email ON user_confirmations(email);

CREATE TABLE chat_participant_gateway_states (
    id BIGSERIAL PRIMARY KEY,
    client_id VARCHAR(255) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL
);

CREATE INDEX idx_gateway_user ON chat_participant_gateway_states(user_id);

CREATE TABLE thread_participants (
    thread_id BIGINT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    chat_participant_id BIGINT NOT NULL REFERENCES chat_participants(id) ON DELETE CASCADE,
    PRIMARY KEY (thread_id, chat_participant_id)
);
