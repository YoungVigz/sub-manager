package pl.gabgal.submanager.backend.dto;

import jakarta.validation.constraints.*;
import pl.gabgal.submanager.backend.enums.Cycle;
import pl.gabgal.submanager.backend.validator.EnumValid;

import java.util.Date;

public record SubscriptionCreateRequest(

        @NotBlank(message = "Title cannot be blank")
        @Size(max = 75, message = "Title must be at most 75 characters")
        String title,

        @Size(max = 255, message = "Description must be at most 255 characters")
        String description,

        @NotNull(message = "Price must be specified")
        @Positive(message = "Price must be greater than zero")
        float price,

        @EnumValid(enumClass = Cycle.class)
        Cycle cycle,

        @NotNull(message = "Date of last payment is required")
        @PastOrPresent(message = "Date of last payment cannot be in the future")
        Date dateOfLastPayment,

        @Positive(message = "Currency ID must be valid")
        long currencyId
) {
}
