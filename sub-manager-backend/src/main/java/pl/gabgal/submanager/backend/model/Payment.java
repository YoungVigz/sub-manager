package pl.gabgal.submanager.backend.model;

import jakarta.persistence.*;
import lombok.*;
import pl.gabgal.submanager.backend.enums.Notify;
import pl.gabgal.submanager.backend.enums.Status;

import java.util.Date;

@Entity
@Table(name = "payment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id", unique = true, nullable = false)
    private long paymentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.UNPROCESSED;

    @Enumerated(EnumType.STRING)
    @Column(name = "notifiaction_status", nullable = false)
    private Notify notificationStatus = Notify.NOTIFIED;

    @Temporal(TemporalType.DATE)
    @Column(name = "date_of_payment", nullable = false)
    private Date dateOfPayment;

    @ManyToOne
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;


}
