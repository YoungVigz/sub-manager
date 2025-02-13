package pl.gabgal.submanager.backend.service;

import org.springframework.stereotype.Service;
import pl.gabgal.submanager.backend.model.Currency;
import pl.gabgal.submanager.backend.repository.CurrencyRepository;

import java.util.List;
import java.util.Optional;

@Service
public class CurrencyService {

    private final CurrencyRepository currencyRepository;

    public CurrencyService(CurrencyRepository currencyRepository) {
        this.currencyRepository = currencyRepository;
    }

    public List<Currency> getAllCurrencies() {
        return currencyRepository.findAll();
    }

    public Optional<Currency> getCurrencyById(long id) {
        return currencyRepository.findById(id);
    }

    public Optional<Currency> getCurrencyByCode(String code) {
        return currencyRepository.findByShortName(code);
    }
}
