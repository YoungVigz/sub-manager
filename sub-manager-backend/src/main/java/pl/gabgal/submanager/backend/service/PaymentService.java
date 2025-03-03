package pl.gabgal.submanager.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.gabgal.submanager.backend.enums.Cycle;
import pl.gabgal.submanager.backend.enums.Notify;
import pl.gabgal.submanager.backend.enums.Status;
import pl.gabgal.submanager.backend.model.Payment;
import pl.gabgal.submanager.backend.model.Subscription;
import pl.gabgal.submanager.backend.repository.PaymentRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    private LocalDate addCycleToDate(Date date, Cycle cycle) {
        LocalDate localDate = date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();

        localDate = switch (cycle) {
            case MONTHLY -> localDate.plusMonths(1);
            case YEARLY -> localDate.plusYears(1);
        };

        return localDate;
    }

    public void createNewPayment(Date date, Subscription subscription, Cycle cycle, boolean isOld) {

        Payment payment = new Payment();
        payment.setSubscription(subscription);

        if(isOld) {
            payment.setDateOfPayment(date);
            payment.setStatus(Status.PAID);
            payment.setNotificationStatus(Notify.NOTIFIED);
        } else {
            LocalDate nextPaymentDate = addCycleToDate(date, cycle);
            payment.setDateOfPayment(java.sql.Date.valueOf(nextPaymentDate));
            payment.setStatus(Status.UNPROCESSED);
            payment.setNotificationStatus(Notify.UNNOTIFIED);
        }

        paymentRepository.save(payment);

    }

}
