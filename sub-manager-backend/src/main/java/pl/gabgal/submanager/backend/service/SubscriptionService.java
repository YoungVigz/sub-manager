package pl.gabgal.submanager.backend.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pl.gabgal.submanager.backend.dto.SubscriptionCreateRequest;
import pl.gabgal.submanager.backend.dto.SubscriptionResponse;
import pl.gabgal.submanager.backend.model.Currency;
import pl.gabgal.submanager.backend.model.Subscription;
import pl.gabgal.submanager.backend.model.User;
import pl.gabgal.submanager.backend.repository.CurrencyRepository;
import pl.gabgal.submanager.backend.repository.SubscriptionRepository;
import pl.gabgal.submanager.backend.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final CurrencyRepository currencyRepository;

    public SubscriptionResponse createSubscription(SubscriptionCreateRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        Currency currency = currencyRepository.findById(request.currencyId())
                .orElseThrow(() -> new EntityNotFoundException("Currency not found!"));

        Subscription subscription = new Subscription();
        subscription.setTitle(request.title());
        subscription.setDescription(!request.description().isEmpty() ? request.description() : "");
        subscription.setPrice(request.price());
        subscription.setCycle(request.cycle());
        subscription.setDateOfLastPayment(request.dateOfLastPayment());
        subscription.setCurrency(currency);
        subscription.setUser(user);

        Subscription savedSubscription = subscriptionRepository.save(subscription);

        return new SubscriptionResponse(
                savedSubscription.getSubscriptionId(),
                savedSubscription.getTitle(),
                savedSubscription.getDescription(),
                savedSubscription.getPrice(),
                savedSubscription.getCycle(),
                savedSubscription.getDateOfLastPayment(),
                currency.getCurrencyId()
        );
    }

    public List<SubscriptionResponse> getAllSubscriptions() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        List<Subscription> subscriptions = subscriptionRepository.findAllByUserId(user.getUserId());

        return subscriptions.stream()
                .map(subscription -> new SubscriptionResponse(
                        subscription.getSubscriptionId(),
                        subscription.getTitle(),
                        subscription.getDescription(),
                        subscription.getPrice(),
                        subscription.getCycle(),
                        subscription.getDateOfLastPayment(),
                        subscription.getCurrency().getCurrencyId()
                ))
                .collect(Collectors.toList());
    }

    public SubscriptionResponse getSubscriptionById(long subscriptionId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found!"));

        Subscription subscription = subscriptionRepository.findByIdAndMatchUser(subscriptionId, user.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("Subscription not found!"));

        return new SubscriptionResponse(
                subscription.getSubscriptionId(),
                subscription.getTitle(),
                subscription.getDescription(),
                subscription.getPrice(),
                subscription.getCycle(),
                subscription.getDateOfLastPayment(),
                subscription.getCurrency().getCurrencyId()
        );
    }
}
