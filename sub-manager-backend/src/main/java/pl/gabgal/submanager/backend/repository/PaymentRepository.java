package pl.gabgal.submanager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import pl.gabgal.submanager.backend.model.Payment;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query(value = "SELECT * FROM payment WHERE notifiaction_status = 'UNNOTIFIED' AND DATE(date_of_payment) = CURRENT_DATE + INTERVAL '1 day'", nativeQuery = true)
    List<Payment> findUnNotifiedPayments();
}
