package pl.gabgal.submanager.backend.model;

import jakarta.persistence.*;
import lombok.*;
import pl.gabgal.submanager.backend.enums.Cycle;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscription_id")
    private long subscriptionId;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private float price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Cycle cycle = Cycle.MONTHLY;

    @Temporal(TemporalType.DATE)
    @Column(name = "date_of_last_payment", nullable = false)
    private Date dateOfLastPayment;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "currency_id", nullable = false)
    private Currency currency;

    @OneToMany(mappedBy = "subscription", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Payment> payments = new ArrayList<>();
}
