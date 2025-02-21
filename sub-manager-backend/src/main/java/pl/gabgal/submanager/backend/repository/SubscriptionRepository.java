package pl.gabgal.submanager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import pl.gabgal.submanager.backend.model.Subscription;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    @Query("SELECT s FROM Subscription s WHERE s.user.userId = :userId")
    List<Subscription> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM Subscription s WHERE s.user.userId = :userId AND s.subscriptionId = :subscriptionId")
    Optional<Subscription> findByIdAndMatchUser(@Param("subscriptionId") Long subscriptionId, @Param("userId") Long userId);
}
