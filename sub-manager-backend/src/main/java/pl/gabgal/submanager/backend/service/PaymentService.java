package pl.gabgal.submanager.backend.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pl.gabgal.submanager.backend.dto.PaymentResponse;
import pl.gabgal.submanager.backend.dto.SubscriptionResponse;
import pl.gabgal.submanager.backend.enums.Cycle;
import pl.gabgal.submanager.backend.enums.Notify;
import pl.gabgal.submanager.backend.enums.Status;
import pl.gabgal.submanager.backend.model.Payment;
import pl.gabgal.submanager.backend.model.Subscription;
import pl.gabgal.submanager.backend.model.User;
import pl.gabgal.submanager.backend.repository.PaymentRepository;
import pl.gabgal.submanager.backend.repository.UserRepository;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    private LocalDate addCycleToDate(Date date, Cycle cycle) {
        LocalDate localDate = date.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();

        localDate = switch (cycle) {
            case MONTHLY -> localDate.plusMonths(1);
            case YEARLY -> localDate.plusYears(1);
        };

        return localDate;
    }

    public List<PaymentResponse> getUserPayments() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();


        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        List<Payment> payments = paymentRepository.findAllByUserId(user.getUserId());

        return payments.stream()
                .map(payment -> new PaymentResponse(
                        payment.getPaymentId(),
                        payment.getStatus(),
                        payment.getDateOfPayment(),
                        payment.getAmount(),
                        payment.getSubscription().getSubscriptionId(),
                        payment.getSubscription().getTitle()
                ))
                .collect(Collectors.toList());
    }

    public void createNewPayment(Date date, Subscription subscription, Cycle cycle, boolean isOld) {

        Payment payment = new Payment();
        payment.setSubscription(subscription);
        payment.setAmount(subscription.getPrice());

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

    @Transactional
    public PaymentResponse processPayment(Long paymentId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        Payment current = paymentRepository
                .findByIdWithUser(paymentId)
                .orElseThrow(() -> new AccessDeniedException("Payment not found"));

        if (!current.getSubscription().getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("You cannot process someone else's payment");
        }

        current.setStatus(Status.PAID);
        current.setNotificationStatus(Notify.NOTIFIED);
        paymentRepository.save(current);

        if (current.getSubscription().isActive()) {

            LocalDate baseDate = ((java.sql.Date) current.getDateOfPayment()).toLocalDate();
            LocalDate nextDate = switch (current.getSubscription().getCycle()) {
                case MONTHLY -> baseDate.plusMonths(1);
                case YEARLY  -> baseDate.plusYears(1);
                default      -> throw new IllegalArgumentException("Unsupported cycle");
            };

            Payment next = new Payment();
            next.setSubscription(current.getSubscription());
            next.setDateOfPayment(java.sql.Date.valueOf(nextDate));
            next.setStatus(Status.UNPROCESSED);
            next.setAmount(current.getSubscription().getPrice());
            next.setNotificationStatus(Notify.UNNOTIFIED);
            paymentRepository.save(next);

            return new PaymentResponse(
                next.getPaymentId(),
                next.getStatus(),
                next.getDateOfPayment(),
                next.getAmount(),
                next.getSubscription().getSubscriptionId(),
                next.getSubscription().getTitle()
            );
        }

        return new PaymentResponse(
            current.getPaymentId(),
            current.getStatus(),
            current.getDateOfPayment(),
            current.getAmount(),
            current.getSubscription().getSubscriptionId(),
            current.getSubscription().getTitle()
        );
    }

    public void updateUnprocessedPaymentAmount(Subscription subscription) {
        List<Payment> unprocessed = subscription.getPayments().stream()
                .filter(p -> p.getStatus() == Status.UNPROCESSED)
                .toList();
        
        for (Payment p : unprocessed) {
            p.setAmount(subscription.getPrice());
            paymentRepository.save(p);
        }
    }

}
