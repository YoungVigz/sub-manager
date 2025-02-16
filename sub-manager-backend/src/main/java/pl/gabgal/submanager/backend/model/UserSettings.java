package pl.gabgal.submanager.backend.model;

import jakarta.persistence.*;
import lombok.*;
import pl.gabgal.submanager.backend.enums.AppLanguage;
import pl.gabgal.submanager.backend.enums.NotificationMethod;

@Entity
@Table(name = "user_setting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AppLanguage language = AppLanguage.ENGLISH;

    @Column(nullable = false)
    private int notificationDaysBeforePayment = 2;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationMethod notificationMethod = NotificationMethod.SMS;

    @ManyToOne
    @JoinColumn(name = "currency_id", nullable = false)
    private Currency defaultCurrency;
}
