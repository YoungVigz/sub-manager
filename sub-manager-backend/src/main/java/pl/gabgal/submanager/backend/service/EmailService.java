package pl.gabgal.submanager.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.MailException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendEmail(String to, List<Map<String, Object>> data) throws MailException, MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject("Payment Notification");

        StringBuilder text = new StringBuilder();
        text.append("<html><body>");
        text.append("<h3>Hello,</h3>");
        text.append("<p>Here are the subscriptions that will renew soon:</p>");

        data.forEach(sub -> {
            text.append("<hr>");
            text.append("<header><strong>").append(sub.get("subscription_title")).append("</strong></header>");
            text.append("<p><strong>Renewal Date:</strong> ").append(sub.get("payment_date")).append("</p>");
            text.append("<p><strong>Amount:</strong> ").append(sub.get("subscription_price")).append("</p>");
        });

        text.append("</body></html>");

        helper.setText(text.toString(), true);

        mailSender.send(message);
    }


}
