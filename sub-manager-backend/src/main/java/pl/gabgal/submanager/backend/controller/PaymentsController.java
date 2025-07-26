package pl.gabgal.submanager.backend.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.gabgal.submanager.backend.dto.PaymentResponse;
import pl.gabgal.submanager.backend.service.PaymentService;

import java.util.List;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentsController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllUserPayments() {
        List<PaymentResponse> pays = paymentService.getUserPayments();
        return ResponseEntity.status(HttpStatus.OK).body(pays);
    }

    @PostMapping("/{id}/process")
    public ResponseEntity<PaymentResponse> processPayment(
            @PathVariable Long id
    ) {
        PaymentResponse result = paymentService.processPayment(id);
        return ResponseEntity.ok(result);
    }
}
