package pl.gabgal.submanager.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.gabgal.submanager.backend.model.Currency;
import pl.gabgal.submanager.backend.service.CurrencyService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/currency")
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    @GetMapping("/")
    public ResponseEntity<List<Currency>> getAllCurrencies() {
        List<Currency> currencies = currencyService.getAllCurrencies();
        return ResponseEntity.ok(currencies);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Currency> getCurrencyById(@PathVariable("id") Long id) {
        Optional<Currency> currency = currencyService.getCurrencyById(id);
        return currency.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Currency> getCurrencyByCode(@PathVariable("code") String code) {
        Optional<Currency> currency = currencyService.getCurrencyByCode(code);
        return currency.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
