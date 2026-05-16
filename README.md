# Circle Vibe Core - Java Spring Boot Edition

A complete rewrite of the Circle Vibe secure messaging platform from **NestJS + Prisma** to **Java 21 Spring Boot 3.2.0 with JPA/Hibernate**.

## 📋 Project Overview

Circle Vibe Core is an enterprise-grade secure messaging API supporting:
- Private & group chats
- Real-time messaging
- Message threading
- File attachments
- User role management
- JWT authentication
- PostgreSQL persistence

## 🚀 Quick Start

### Prerequisites
- Java 21+
- Maven 3.8+
- PostgreSQL 12+

### Installation

```bash
# Clone repository
git clone https://github.com/AndrUsM/circle-vibe-core.git
cd circle-vibe-core
git checkout java-spring-jpa-rewrite

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=circle_vibe
export DB_USER=postgres
export DB_PASSWORD=password
export JWT_SECRET="your-32-character-secret-key-change-this-please!!!"

# Build
mvn clean install

# Run
mvn spring-boot:run
```

API available at: `http://localhost:8080/api`
Swagger UI: `http://localhost:8080/api/swagger-ui.html`

## 📦 Technology Stack

| Feature | Technology |
|---------|------------|
| Runtime | Java 21 |
| Framework | Spring Boot 3.2.0 |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL |
| Authentication | JWT (JJWT) |
| Security | Spring Security |
| API Docs | Springdoc OpenAPI 3.0 |
| Migrations | Flyway |
| Build Tool | Maven |
| Testing | JUnit 5 + Mockito |

## 🏗️ Architecture

```
src/main/java/com/circlevibe/
├── api/
│   ├── controller/          # REST endpoints
│   ├── dto/                 # Request/Response DTOs
│   ├── service/             # Business logic
│   └── exception/           # Global exception handling
├── config/                  # Application configuration
├── domain/
│   ├── entity/              # JPA entities
│   └── repository/          # Spring Data repositories
└── security/
    ├── jwt/                 # JWT token management
    └── SecurityConfig.java  # Spring Security configuration
```

## 📚 Database Schema

### Core Entities

#### Users
- User account management
- Authentication credentials
- Profile information
- Chat status tracking
- User blocking system

#### Chats
- Private/Group chat support
- Chat types (PUBLIC/PRIVATE)
- Participant management
- Last message tracking
- Encryption support

#### Messages
- Message content & status
- Message types (TEXT, IMAGE, VIDEO, FILE, AUDIO)
- Threading support
- File attachments

#### ChatParticipants
- User-Chat relationship
- Role-based access control
- Mute status
- Message sending capability

#### Supporting Tables
- `MessageFiles` - File attachments
- `Threads` - Message threading
- `ChatInvites` - Chat invitations
- `UserConfirmations` - Email confirmations
- `ChatParticipantGatewayStates` - WebSocket state

## 🔐 Authentication

### JWT Implementation
- **Access Token**: 24 hours expiration
- **Refresh Token**: 7 days expiration
- **Algorithm**: HS512
- **Bearer Token**: `Authorization: Bearer {token}`

### Security Features
- Password encryption with BCrypt
- CORS configuration
- CSRF protection disabled (Stateless API)
- Session-less authentication

## 🛣️ API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstname": "John",
  "surname": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "username": "johndoe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Response Format

#### Login Response
```json
{
  "userId": 1,
  "email": "john@example.com",
  "firstname": "John",
  "surname": "Doe",
  "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refreshToken": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}
```

## 🔄 Feature Mapping (NestJS → Spring Boot)

| NestJS | Spring Boot |
|--------|-------------|
| NestJS modules | Spring @Configuration beans |
| Prisma models | JPA @Entity classes |
| Prisma Client | Spring Data JPA Repositories |
| bcrypt | BCryptPasswordEncoder |
| jsonwebtoken | JJWT library |
| Socket.IO | Spring WebSocket ready |
| Swagger decorators | Springdoc OpenAPI annotations |
| Jest tests | Spring Boot Test + Mockito |
| PostgreSQL driver | PostgreSQL JDBC |

## 📝 Configuration

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=circle_vibe
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-32-character-secret-key-change-this-please!!!
JWT_ACCESS_EXPIRATION=86400000      # 24 hours in ms
JWT_REFRESH_EXPIRATION=604800000    # 7 days in ms

# Server
SERVER_PORT=8080

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🧪 Testing

```bash
# Run all tests
mvn test

# Run with coverage
mvn test jacoco:report

# Run integration tests
mvn test -Dgroups=integration
```

## 📦 Build & Deployment

### Create JAR
```bash
mvn clean package
```

### Docker (Coming Soon)
```dockerfile
FROM openjdk:21-slim
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

## 🔄 Migration from NestJS

### Dependencies Mapping

| NestJS Package | Spring Boot Equivalent |
|---|---|
| `@nestjs/common` | Spring Framework Core |
| `@nestjs/core` | Spring Boot Starter |
| `@nestjs/security` | Spring Security |
| `@prisma/client` | Spring Data JPA |
| `@types/bcrypt` | spring-security-crypto |
| `jsonwebtoken` | JJWT |
| `Socket.IO` | Spring WebSocket |
| `Swagger` | Springdoc OpenAPI |

### Data Type Mapping

| Prisma | JPA / PostgreSQL |
|--------|------------------|
| `String` | `VARCHAR(255)` / `String` |
| `DateTime` | `TIMESTAMP` / `LocalDateTime` |
| `Int` | `INTEGER` / `Integer` |
| `Boolean` | `BOOLEAN` / `Boolean` |
| `Enum` | `VARCHAR(50)` / `@Enumerated` |
| `Int[]` | Collection / `@ElementCollection` |

## 🚀 Performance Features

- Database connection pooling (HikariCP)
- JPA batch processing (25 inserts/updates per batch)
- Query optimization with indexes
- Lazy loading for relationships
- Request filtering & authorization

## 📚 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Data JPA Reference](https://spring.io/projects/spring-data-jpa)
- [Springdoc OpenAPI](https://springdoc.org/)
- [JJWT Documentation](https://github.com/jwtk/jjwt)
- [Flyway Migrations](https://flywaydb.org/)

## 📄 License

UNLICENSED

## 👤 Author

AndrUsM - [@AndrUsM](https://github.com/AndrUsM)

## 🤝 Contributing

Contributions are welcome! Please create a pull request with detailed descriptions.

## 🐛 Issues

Found a bug? Please open an issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details

---

**Status**: Active Development  
**Last Updated**: 2026-05-16