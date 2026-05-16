-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE,
    birth_date TIMESTAMP,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    avatar_url_optimized VARCHAR(255),
    is_hidden_contact_info BOOLEAN DEFAULT true,
    is_allowed_to_search BOOLEAN DEFAULT true,
    account_status VARCHAR(20) DEFAULT 'ACTIVE',
    country VARCHAR(255),
    city VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    private_key VARCHAR(255) NOT NULL UNIQUE,
    private_token VARCHAR(255) NOT NULL UNIQUE,
    primary_phone VARCHAR(255) UNIQUE,
    type VARCHAR(20) DEFAULT 'PRIVATE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    chat_status VARCHAR(20) DEFAULT 'OFFLINE'
);

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_chat_status ON users(chat_status);
CREATE INDEX idx_type ON users(type);

-- User Blocked Users Table
CREATE TABLE user_blocked_users (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, blocked_user_id)
);

-- Chats Table
CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    bucket VARCHAR(255) DEFAULT 'conversations',
    name VARCHAR(255) NOT NULL,
    readable_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(20) DEFAULT 'PRIVATE',
    is_group_chat BOOLEAN DEFAULT false,
    is_saved_messages BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    has_unread_messages BOOLEAN DEFAULT false,
    empty BOOLEAN DEFAULT true,
    unread_messages_count INTEGER DEFAULT 0,
    users_limit INTEGER NOT NULL,
    removed BOOLEAN DEFAULT false,
    encryption_secret VARCHAR(255) DEFAULT 'Se9XNjAcmbrNoCooRPJq',
    last_message_id INTEGER
);

CREATE INDEX idx_updated_at ON chats(updated_at);
CREATE INDEX idx_last_message_id ON chats(last_message_id);

-- Chat Participants Table
CREATE TABLE chat_participants (
    id SERIAL PRIMARY KEY,
    chat_role VARCHAR(50) DEFAULT 'ADMIN',
    is_muted BOOLEAN DEFAULT false,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    UNIQUE(user_id, chat_id)
);

CREATE INDEX idx_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_user_id ON chat_participants(user_id);
CREATE INDEX idx_chat_role ON chat_participants(chat_role);

-- Threads Table
CREATE TABLE threads (
    id SERIAL PRIMARY KEY,
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    parent_message_id INTEGER NOT NULL
);

CREATE INDEX idx_parent_message_id ON threads(parent_message_id);
CREATE INDEX idx_thread_chat_id ON threads(chat_id);

-- Thread Participants Table
CREATE TABLE thread_participants (
    participant_id INTEGER NOT NULL REFERENCES chat_participants(id) ON DELETE CASCADE,
    thread_id INTEGER NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    PRIMARY KEY (participant_id, thread_id)
);

-- Messages Table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'UNREAD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    message_type VARCHAR(50) DEFAULT 'TEXT',
    removed BOOLEAN DEFAULT false,
    hidden BOOLEAN DEFAULT false,
    chat_id INTEGER NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES chat_participants(id) ON DELETE CASCADE,
    thread_id INTEGER REFERENCES threads(id) ON DELETE CASCADE,
    child_thread_id INTEGER
);

CREATE INDEX idx_chat_created ON messages(chat_id, created_at);
CREATE INDEX idx_sender_id ON messages(sender_id);

-- Update Chat Last Message Foreign Key
ALTER TABLE chats ADD CONSTRAINT fk_last_message FOREIGN KEY (last_message_id) REFERENCES messages(id) ON DELETE SET NULL;

-- Message Files Table
CREATE TABLE message_files (
    id SERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    optimized_url VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) DEFAULT 'FILE',
    message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE
);

CREATE INDEX idx_message_id ON message_files(message_id);

-- Chat Invites Table
CREATE TABLE chat_invites (
    id SERIAL PRIMARY KEY,
    from_chat_participant_id INTEGER NOT NULL,
    target_user_id INTEGER NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    role VARCHAR(50) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    chat_id INTEGER NOT NULL
);

CREATE INDEX idx_invite_token ON chat_invites(token);
CREATE INDEX idx_invite_chat_id ON chat_invites(chat_id);
CREATE INDEX idx_invite_target_user_id ON chat_invites(target_user_id);

-- User Confirmations Table
CREATE TABLE user_confirmations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed BOOLEAN DEFAULT false
);

CREATE INDEX idx_confirmation_user_id ON user_confirmations(user_id);
CREATE INDEX idx_confirmation_email ON user_confirmations(email);

-- Chat Participant Gateway States Table
CREATE TABLE chat_participant_gateway_states (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL
);

CREATE INDEX idx_gateway_user_id ON chat_participant_gateway_states(user_id);