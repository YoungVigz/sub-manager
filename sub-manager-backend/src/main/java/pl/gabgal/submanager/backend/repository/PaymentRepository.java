package pl.gabgal.submanager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import pl.gabgal.submanager.backend.model.Payment;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query(value = "SELECT * FROM payment WHERE status = 'UNPROCESSED' AND notifiaction_status = 'UNNOTIFIED' AND DATE(date_of_payment) = CURRENT_DATE + INTERVAL '1 day'", nativeQuery = true)
    List<Payment> findUnNotifiedPayments();

    @Query("SELECT p FROM Payment p WHERE p.subscription.user.userId = :userId")
    List<Payment> findAllByUserId(@Param("userId") Long userId);

    @Query(value = "SELECT * FROM payment WHERE status = 'UNPROCESSED' AND DATE(date_of_payment) = CURRENT_DATE", nativeQuery = true)
    List<Payment> findUnprocessedPayments();

    @Query("SELECT p FROM Payment p JOIN FETCH p.subscription s JOIN FETCH s.user u WHERE p.paymentId = :id")
    Optional<Payment> findByIdWithUser(@Param("id") Long id);

    @Modifying
    @Query("DELETE FROM Payment p WHERE p.subscription.subscriptionId = :subId AND p.status = 'UNPROCESSED'")
    void deleteFuturePaymentsBySubscriptionId(@Param("subId") Long subscriptionId);
}
