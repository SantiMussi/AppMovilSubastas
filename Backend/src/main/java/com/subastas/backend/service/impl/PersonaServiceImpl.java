package com.subastas.backend.service.impl;

import com.subastas.backend.entity.Persona;
import com.subastas.backend.entity.Usuario;
import com.subastas.backend.dto.request.PerfilRequest;
import com.subastas.backend.dto.response.PerfilResponse;
import com.subastas.backend.exception.ResourceNotFoundException;
import com.subastas.backend.repository.PersonaRepository;
import com.subastas.backend.repository.UsuarioRepository;
import com.subastas.backend.service.PersonaService;
import com.subastas.backend.util.ImageUtils;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PersonaServiceImpl implements PersonaService {

    @Autowired
    private PersonaRepository personaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private com.subastas.backend.repository.ClienteRepository clienteRepository;

    @Autowired
    private com.subastas.backend.repository.AsistenteRepository asistenteRepository;

    @Autowired
    private com.subastas.backend.repository.PujoRepository pujoRepository;

    @Autowired
    private com.subastas.backend.repository.RegistroDeSubastaRepository registroDeSubastaRepository;

    private Usuario obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
    }

    @Override
    public PerfilResponse obtenerPerfil(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Persona persona = usuario.getPersona();

        PerfilResponse response = new PerfilResponse();
        response.setIdentificador(persona.getIdentificador());
        response.setNombre(persona.getNombre());
        response.setApellido(usuario.getApellido());
        response.setEmail(usuario.getEmail());
        response.setDireccion(persona.getDireccion());
        response.setDocumento(persona.getDocumento());
        
        clienteRepository.findById(persona.getIdentificador())
                .ifPresent(cliente -> response.setCategoria(cliente.getCategoria()));
        
        if (persona.getFoto() != null) {
            String base64 = java.util.Base64.getEncoder().encodeToString(persona.getFoto());
            response.setFoto("data:image/jpeg;base64," + base64);
        }
        
        return response;
    }

    @Override
    @Transactional
    public PerfilResponse actualizarPerfil(String email, PerfilRequest datos) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Persona existente = usuario.getPersona();
        
        existente.setNombre(datos.getNombre());
        existente.setDireccion(datos.getDireccion());
        personaRepository.save(existente);

        usuario.setApellido(datos.getApellido());
        usuarioRepository.save(usuario);

        return obtenerPerfil(email);
    }

    @Override
    @Transactional
    public void actualizarFotoPerfil(String email, MultipartFile archivo) throws IOException {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Persona persona = usuario.getPersona();

        // Usamos el utilitario. Si hay un error (archivo vacío, no es imagen), tira la
        // excepción automáticamente
        persona.setFoto(ImageUtils.procesarImagen(archivo));

        personaRepository.save(persona);
    }

    @Override
    @Transactional
    public void eliminarCuenta(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Persona persona = usuario.getPersona();
        
        // Anonymize user to allow re-registration with same email/document while preserving referential integrity
        usuario.setEmail("del_" + persona.getIdentificador() + "@deleted.com");
        usuario.setPassword("");
        usuarioRepository.save(usuario);
        
        persona.setDocumento("del_" + persona.getIdentificador());
        persona.setEstado("inactivo");
        personaRepository.save(persona);
        
        clienteRepository.findById(persona.getIdentificador()).ifPresent(cliente -> {
            cliente.setAdmitido("no");
            clienteRepository.save(cliente);
        });
    }

    @Override
    public com.subastas.backend.dto.response.metrics.UserStatsResponse obtenerStatsUsuario(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Integer clienteId = usuario.getPersona().getIdentificador();
        
        com.subastas.backend.dto.response.metrics.UserStatsResponse stats = new com.subastas.backend.dto.response.metrics.UserStatsResponse();
        
        // Asistencia
        Integer asistencia = asistenteRepository.countByClienteIdentificador(clienteId);
        stats.setAsistencia(asistencia != null ? asistencia : 0);
        
        // Victorias & Valuacion
        java.util.List<com.subastas.backend.entity.RegistroDeSubasta> wins = registroDeSubastaRepository.findByClienteIdentificador(clienteId);
        stats.setVictorias(wins.size());
        
        java.math.BigDecimal valuacion = java.math.BigDecimal.ZERO;
        for (com.subastas.backend.entity.RegistroDeSubasta w : wins) {
            if (w.getImporte() != null) {
                valuacion = valuacion.add(w.getImporte());
            }
        }
        stats.setValuacionPortfolio(valuacion);
        
        // Promedio Puja
        Double avgPuja = pujoRepository.getAveragePujaByClienteId(clienteId);
        stats.setPromedioPuja(avgPuja != null ? java.math.BigDecimal.valueOf(avgPuja) : java.math.BigDecimal.ZERO);
        
        return stats;
    }

    @Override
    public com.subastas.backend.dto.response.metrics.UserWinsResponse obtenerWinsUsuario(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        Integer clienteId = usuario.getPersona().getIdentificador();
        
        Integer asistencia = asistenteRepository.countByClienteIdentificador(clienteId);
        java.util.List<com.subastas.backend.entity.RegistroDeSubasta> wins = registroDeSubastaRepository.findByClienteIdentificador(clienteId);
        
        com.subastas.backend.dto.response.metrics.UserWinsResponse response = new com.subastas.backend.dto.response.metrics.UserWinsResponse();
        
        // Tasa exito
        if (asistencia != null && asistencia > 0) {
            response.setTasaExito(((double) wins.size() / asistencia) * 100);
        } else {
            response.setTasaExito(0.0);
        }
        
        // Desglose
        java.util.Map<String, java.math.BigDecimal> categoriasMap = new java.util.HashMap<>();
        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        for (com.subastas.backend.entity.RegistroDeSubasta w : wins) {
            if (w.getImporte() != null && w.getSubasta() != null && w.getSubasta().getCategoria() != null) {
                String cat = w.getSubasta().getCategoria().toString();
                categoriasMap.put(cat, categoriasMap.getOrDefault(cat, java.math.BigDecimal.ZERO).add(w.getImporte()));
                total = total.add(w.getImporte());
            }
        }
        
        java.util.List<com.subastas.backend.dto.response.metrics.InvestmentBreakdownDto> desglose = new java.util.ArrayList<>();
        if (total.compareTo(java.math.BigDecimal.ZERO) > 0) {
            for (java.util.Map.Entry<String, java.math.BigDecimal> entry : categoriasMap.entrySet()) {
                double pct = entry.getValue().doubleValue() / total.doubleValue() * 100;
                desglose.add(new com.subastas.backend.dto.response.metrics.InvestmentBreakdownDto(entry.getKey(), Math.round(pct * 10.0) / 10.0));
            }
        }
        response.setDesgloseInversiones(desglose);
        
        return response;
    }

    @Override
    public com.subastas.backend.dto.response.metrics.UserBidsResponse obtenerBidsHistory(String email) {
        com.subastas.backend.dto.response.metrics.UserBidsResponse response = new com.subastas.backend.dto.response.metrics.UserBidsResponse();
        response.setStatus("OK");
        response.setMessage("Bids history mock");
        return response;
    }
}