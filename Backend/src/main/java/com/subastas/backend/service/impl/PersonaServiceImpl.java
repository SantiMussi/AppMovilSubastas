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
}