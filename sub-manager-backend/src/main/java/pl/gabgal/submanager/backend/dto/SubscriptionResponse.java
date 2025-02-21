package pl.gabgal.submanager.backend.dto;

import pl.gabgal.submanager.backend.enums.Cycle;

import java.util.Date;

public record SubscriptionResponse(
        long subscriptionId,
        String title,
        String description,
        float price,
        Cycle cycle,
        Date dateOfLastPayment,
        long currencyId
) {
}
