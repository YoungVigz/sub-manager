package pl.gabgal.submanager.backend.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import pl.gabgal.submanager.backend.dto.SubscriptionCreateRequest;
import pl.gabgal.submanager.backend.model.Currency;
import pl.gabgal.submanager.backend.model.Subscription;
import pl.gabgal.submanager.backend.model.User;
import pl.gabgal.submanager.backend.repository.CurrencyRepository;
import pl.gabgal.submanager.backend.repository.SubscriptionRepository;
import pl.gabgal.submanager.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final CurrencyRepository currencyRepository;

    public Subscription createSubscription(SubscriptionCreateRequest request) {
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

        return subscriptionRepository.save(subscription);
    }

}
