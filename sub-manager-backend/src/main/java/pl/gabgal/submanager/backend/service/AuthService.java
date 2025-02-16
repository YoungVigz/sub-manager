package pl.gabgal.submanager.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pl.gabgal.submanager.backend.dto.AuthenticationResponse;
import pl.gabgal.submanager.backend.dto.LoginRequest;
import pl.gabgal.submanager.backend.dto.RegisterRequest;
import pl.gabgal.submanager.backend.enums.Role;
import pl.gabgal.submanager.backend.model.User;
import pl.gabgal.submanager.backend.repository.UserRepository;

import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build();

        userRepository.save(user);

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefresh(new HashMap<>(), user);
        return AuthenticationResponse.builder()
                .authenticationToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthenticationResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        var user = userRepository.findByUsername(request.username()).orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefresh(new HashMap<>(), user);
        return AuthenticationResponse.builder()
                .authenticationToken(jwtToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthenticationResponse refreshToken(String refreshToken) {

        var user = userRepository.findByUsername(jwtService.extractUserName(refreshToken)).orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));
        var jwtToken = jwtService.generateToken(user);
        var newRefreshToken = jwtService.generateRefresh(new HashMap<>(), user);
        return AuthenticationResponse.builder()
                .authenticationToken(jwtToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    public Boolean validateToken(String token) {
        return jwtService.validateToken(token);
    }
}