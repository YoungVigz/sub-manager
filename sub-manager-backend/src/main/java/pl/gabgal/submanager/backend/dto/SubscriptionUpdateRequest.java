package pl.gabgal.submanager.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record SubscriptionUpdateRequest(
        @NotBlank(message = "Title cannot be blank")
        @Size(max = 75, message = "Title must be at most 75 characters")
        String title,

        @Size(max = 255, message = "Description must be at most 255 characters")
        String description,

        @NotNull(message = "Price must be specified")
        @Positive(message = "Price must be greater than zero")
        float price
) {}