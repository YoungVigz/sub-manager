package pl.gabgal.submanager.backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.gabgal.submanager.backend.dto.SubscriptionCreateRequest;
import pl.gabgal.submanager.backend.model.Subscription;
import pl.gabgal.submanager.backend.service.SubscriptionService;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping
    public ResponseEntity<Subscription> addSubscription(@RequestBody SubscriptionCreateRequest subscription) {
        Subscription subs = subscriptionService.createSubscription(subscription);
        return ResponseEntity.status(HttpStatus.CREATED).body(subs);
    }
}
