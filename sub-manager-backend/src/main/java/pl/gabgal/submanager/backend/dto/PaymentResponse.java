package pl.gabgal.submanager.backend.dto;

import pl.gabgal.submanager.backend.enums.Status;

import java.util.Date;

public record PaymentResponse(
        long paymentId,
        Status status,
        Date dateOfPayment,
        long subscriptionId
) {
}
