package pl.gabgal.submanager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;
import pl.gabgal.submanager.backend.enums.Role;
import pl.gabgal.submanager.backend.model.User;
import java.util.Optional;

@Repository
@EnableJpaRepositories
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByRole(Role role);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}