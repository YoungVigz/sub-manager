package pl.gabgal.submanager.backend.controller;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import pl.gabgal.submanager.backend.enums.Notify;
import pl.gabgal.submanager.backend.enums.Status;
import pl.gabgal.submanager.backend.model.Payment;
import pl.gabgal.submanager.backend.repository.PaymentRepository;
import pl.gabgal.submanager.backend.service.EmailService;
import pl.gabgal.submanager.backend.service.PaymentService;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Controller
@RequiredArgsConstructor
public class ScheduleController {

    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    private final PaymentService paymentService;

    @Scheduled(fixedRate = 15000)
    public void notifyUsers() {

        List<Payment> payments = paymentRepository.findUnNotifiedPayments();

        Map<String, List<Map<String, Object>>> userNotifications = new HashMap<>();

        for (Payment payment : payments) {
            payment.setNotificationStatus(Notify.NOTIFIED);
            paymentRepository.save(payment);

            String userEmail = payment.getSubscription().getUser().getEmail();

            Map<String, Object> paymentInfo = new HashMap<>();
            paymentInfo.put("subscription_title", payment.getSubscription().getTitle());
            paymentInfo.put("subscription_price", payment.getSubscription().getPrice());
            paymentInfo.put("payment_date", payment.getDateOfPayment());

            if (userNotifications.get(userEmail) != null) {
                userNotifications.get(userEmail).add(paymentInfo);
            } else {
                userNotifications.computeIfAbsent(userEmail, k -> new ArrayList<>()).add(paymentInfo);
            }
        }


        userNotifications.forEach((userEmail, list) -> {
            try {
                emailService.sendEmail(userEmail, list);
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Scheduled(fixedRate = 15000)
    public void handleUnprocessedPayments() {
        List<Payment> payments = paymentRepository.findUnprocessedPayments();

        for (Payment payment : payments) {
            payment.setStatus(Status.PAID);
            paymentRepository.save(payment);

            java.sql.Date sqlDate = (java.sql.Date) payment.getDateOfPayment();
            LocalDate currentPaymentDate = sqlDate.toLocalDate();

            LocalDate nextPaymentDate = switch (payment.getSubscription().getCycle()) {
                case MONTHLY -> currentPaymentDate.plusMonths(1);
                case YEARLY  -> currentPaymentDate.plusYears(1);
                default      -> throw new IllegalArgumentException("Unsupported Cycle: " + payment.getSubscription().getCycle());
            };

            java.sql.Date nextDateAsSqlDate = java.sql.Date.valueOf(nextPaymentDate);

            Payment newPayment = new Payment();
            newPayment.setSubscription(payment.getSubscription());
            newPayment.setDateOfPayment(nextDateAsSqlDate);
            newPayment.setStatus(Status.UNPROCESSED);
            newPayment.setAmount(payment.getSubscription().getPrice());
            newPayment.setNotificationStatus(Notify.UNNOTIFIED);
            paymentRepository.save(newPayment);
        }
    }


}
