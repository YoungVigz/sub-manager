package pl.gabgal.submanager.backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.gabgal.submanager.backend.dto.SubscriptionCreateRequest;
import pl.gabgal.submanager.backend.dto.SubscriptionResponse;
import pl.gabgal.submanager.backend.service.SubscriptionService;
import pl.gabgal.submanager.backend.dto.SubscriptionUpdateRequest;

import java.util.List;

@RestController
@RequestMapping("/api/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping
    public ResponseEntity<SubscriptionResponse> addSubscription(@Valid @RequestBody SubscriptionCreateRequest subscription) {
        SubscriptionResponse subs = subscriptionService.createSubscription(subscription);
        return ResponseEntity.status(HttpStatus.CREATED).body(subs);
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionResponse>> getAllUserSubscriptions() {
        List<SubscriptionResponse> subs = subscriptionService.getAllSubscriptions();
        return ResponseEntity.status(HttpStatus.OK).body(subs);
    }

    @GetMapping
    @RequestMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> getSubscriptionById(@PathVariable Long id) {
        SubscriptionResponse subs = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.status(HttpStatus.OK).body(subs);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> updateSubscription(
        @PathVariable Long id,
        @Valid @RequestBody SubscriptionUpdateRequest request
    ) {
        SubscriptionResponse updated = subscriptionService.updateSubscription(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Long id) {
        subscriptionService.deleteSubscription(id);
        return ResponseEntity.noContent().build();
    }

}
