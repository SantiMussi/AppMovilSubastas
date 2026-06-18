package com.subastas.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
        if (mailSender == null || 
            mailHost == null || mailHost.trim().isEmpty() ||
            mailUsername == null || mailUsername.trim().isEmpty() ||
            mailPassword == null || mailPassword.trim().isEmpty()) {
            LOGGER.info("[MOCK MAIL] Destinatario: {}, Asunto: {}, Cuerpo: \n{}", to, subject, body);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@subastas.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            LOGGER.info("Email enviado correctamente a {}", to);
        } catch (Exception e) {
            LOGGER.error("Error al enviar email a {}: {}", to, e.getMessage());
        }
    }
}

