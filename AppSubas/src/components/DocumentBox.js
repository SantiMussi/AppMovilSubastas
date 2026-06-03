import React from 'react';
import { Text, View, Pressable, Image } from 'react-native';

import { styles } from '../styles/registerStyles';

/**
 * Mosaico de captura para documentos de registro.
 * Obliga a abrir la cámara del dispositivo desde la pantalla de registro y muestra una miniatura cuando la foto está lista.
 * Propiedades:
 * - title: etiqueta del documento que se muestra en el mosaico.
 * - onPress: función que abre la cámara para tomar la foto del documento.
 * - selected: valor booleano que cambia el icono, el estilo del borde y el estado visual.
 * - imageUri: URI local de la foto tomada para mostrar una vista previa.
 */
export function DocumentBox({ title, onPress, selected, imageUri }) {
  return (
    <Pressable onPress={onPress} style={[styles.docBox, selected && styles.docBoxSelected]}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.docPreview} />
      ) : (
        <View style={styles.docCameraIconWrap}>
          <Text style={styles.docIcon}>📷</Text>
        </View>
      )}
      <Text style={styles.docTitle}>{title}</Text>
      <Text style={styles.docHint}>{selected ? 'FOTO TOMADA · TOCAR PARA REPETIR' : 'TOMAR FOTO CON CÁMARA'}</Text>
    </Pressable>
  );
}