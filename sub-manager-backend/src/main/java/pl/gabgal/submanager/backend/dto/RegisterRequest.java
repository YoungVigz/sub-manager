package pl.gabgal.submanager.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Username cannot be empty.")
        @Size(min = 3, max = 20, message = "The username should be 3-20 characters long.")
        String username,

        @NotBlank(message = "E-mail cannot be empty.")
        @Email(message = "Provided e-mail is not valid.")
        String email,

        @NotBlank(message = "Password cannot be empty.")
        @Size(min = 6, message = "Password should be at least 6 characters long.")
        String password
) {}