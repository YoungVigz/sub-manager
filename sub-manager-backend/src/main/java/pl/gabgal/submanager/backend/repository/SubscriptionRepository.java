package pl.gabgal.submanager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.gabgal.submanager.backend.model.Subscription;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

}
