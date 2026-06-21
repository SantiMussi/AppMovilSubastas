package com.subastas.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.math.BigDecimal;

@Service
public class EmailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    public void sendEmail(String to, String subject, String body) {
        sendPremiumEmail(to, subject, subject, body.replace("\n", "<br>"));
    }

    public void sendPremiumEmail(String to, String subject, String title, String htmlBody) {
        if (!isMailConfigured()) {
            LOGGER.info("[MOCK MAIL HTML] To: {}, Subject: {}\n{}", to, subject, htmlBody);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("no-reply@vantage-subastas.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(buildPremiumTemplate(title, htmlBody), true);
            mailSender.send(message);
            LOGGER.info("Email enviado correctamente a {}", to);
        } catch (Exception e) {
            LOGGER.error("Error al enviar email a {}: {}", to, e.getMessage());
        }
    }

    public void sendInvoiceEmail(String to, Map<String, Object> invoiceData, com.subastas.backend.entity.RegistroDeSubasta sale) {
        String title = "Factura de Compra - " + invoiceData.get("invoiceNumber");
        
        StringBuilder invoiceHtml = new StringBuilder();
        invoiceHtml.append("<div style=\"background:#1a1a1a;border-radius:12px;padding:30px;color:#ffffff;font-family:'Segoe UI',Roboto,sans-serif;\">");
        invoiceHtml.append("<h2 style=\"color:#e5b95c;margin-top:0;font-size:24px;border-bottom:1px solid #333;padding-bottom:15px;\">").append(title).append("</h2>");
        
        invoiceHtml.append("<div style=\"margin:25px 0;\">");
        invoiceHtml.append("<p style=\"margin:10px 0;font-size:16px;color:#ccc;\"><strong style=\"color:#fff;display:inline-block;width:150px;\">Producto:</strong> ").append(sale.getProducto().getDescripcionCatalogo() != null ? sale.getProducto().getDescripcionCatalogo() : "Producto #" + sale.getProducto().getIdentificador()).append("</p>");
        invoiceHtml.append("<p style=\"margin:10px 0;font-size:16px;color:#ccc;\"><strong style=\"color:#fff;display:inline-block;width:150px;\">Monto Pujado:</strong> $").append(formatMoney(invoiceData.get("montoPujado"))).append("</p>");
        invoiceHtml.append("<p style=\"margin:10px 0;font-size:16px;color:#ccc;\"><strong style=\"color:#fff;display:inline-block;width:150px;\">Comisión:</strong> $").append(formatMoney(invoiceData.get("comision"))).append("</p>");
        invoiceHtml.append("</div>");

        invoiceHtml.append("<div style=\"background:#2a2a2a;padding:20px;border-radius:8px;margin-top:30px;\">");
        invoiceHtml.append("<p style=\"margin:0;font-size:20px;color:#e5b95c;font-weight:bold;text-align:right;\">TOTAL: $").append(formatMoney(invoiceData.get("total"))).append("</p>");
        invoiceHtml.append("</div>");

        invoiceHtml.append("</div>");

        sendPremiumEmail(to, "Tu factura de VANTAGE", "Detalle de tu compra", invoiceHtml.toString());
    }

    private String buildPremiumTemplate(String title, String content) {
        return "<!DOCTYPE html>" +
               "<html>" +
               "<head><meta charset=\"UTF-8\"></head>" +
               "<body style=\"margin:0;padding:40px 20px;background-color:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;\">" +
               "<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"max-width:600px;margin:0 auto;background:#141414;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,0.5);border:1px solid #222;\">" +
               "<tr><td style=\"padding:40px;text-align:center;background:linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);border-bottom:1px solid #333;\">" +
               "<h1 style=\"margin:0;font-size:28px;letter-spacing:2px;color:#e5b95c;font-weight:300;text-transform:uppercase;\">VANTAGE</h1>" +
               "</td></tr>" +
               "<tr><td style=\"padding:50px 40px;\">" +
               "<h2 style=\"margin:0 0 25px;font-size:22px;color:#ffffff;font-weight:500;\">" + title + "</h2>" +
               "<div style=\"font-size:16px;line-height:1.7;color:#b3b3b3;\">" + content + "</div>" +
               "</td></tr>" +
               "<tr><td style=\"padding:30px 40px;text-align:center;background:#0a0a0a;border-top:1px solid #222;\">" +
               "<p style=\"margin:0;font-size:13px;color:#666;\">VANTAGE Exclusive Auctions &copy; 2026<br>Premium Experiences</p>" +
               "</td></tr>" +
               "</table>" +
               "</body>" +
               "</html>";
    }

    private String formatMoney(Object value) {
        if (value instanceof BigDecimal) {
            return ((BigDecimal) value).setScale(2, java.math.RoundingMode.HALF_UP).toString();
        }
        return String.valueOf(value);
    }

    private boolean isMailConfigured() {
        return mailSender != null &&
               mailHost != null && !mailHost.trim().isEmpty() &&
               mailUsername != null && !mailUsername.trim().isEmpty() &&
               mailPassword != null && !mailPassword.trim().isEmpty();
    }
}
