package com.circlevibe.api.service;

import com.circlevibe.api.dto.AuthDtos;
import com.circlevibe.domain.entity.User;
import com.circlevibe.domain.repository.UserRepository;
import com.circlevibe.security.jwt.JwtTokenProvider;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthDtos.LoginResponse register(AuthDtos.RegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = User.builder()
                .firstname(request.getFirstname())
                .surname(request.getSurname())
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .privateKey(UUID.randomUUID().toString())
                .privateToken(UUID.randomUUID().toString())
                .type(User.UserType.PRIVATE)
                .accountStatus(User.AccountStatus.ACTIVE)
                .chatStatus(User.UserChatStatus.OFFLINE)
                .build();

        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return AuthDtos.LoginResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstname(user.getFirstname())
                .surname(user.getSurname())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .build();
    }

    public AuthDtos.LoginResponse login(AuthDtos.LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOpt.get();
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());

        return AuthDtos.LoginResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstname(user.getFirstname())
                .surname(user.getSurname())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .build();
    }

    public AuthDtos.TokenResponse refreshToken(AuthDtos.RefreshTokenRequest request) {
        if (!jwtTokenProvider.validateToken(request.getRefreshToken())) {
            throw new RuntimeException("Invalid refresh token");
        }

        String email = jwtTokenProvider.getEmailFromToken(request.getRefreshToken());
        String accessToken = jwtTokenProvider.generateAccessToken(email);

        return AuthDtos.TokenResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .build();
    }
}