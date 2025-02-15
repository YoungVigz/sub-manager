package pl.gabgal.submanager.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@PreAuthorize("hasRole('ADMIN')")
public class TestController {

    @CrossOrigin(origins = "*")
    @GetMapping("/")
    public String hello() {
        return "Hello, World!";
    }
}