package pl.gabgal.submanager.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pl.gabgal.submanager.backend.model.Currency;

import java.util.Optional;

public interface CurrencyRepository extends JpaRepository<Currency, Long> {

    Optional<Currency> findByShortName(String shortName);
}