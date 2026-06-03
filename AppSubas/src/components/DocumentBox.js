import React from 'react';
import { Text, View, Pressable } from 'react-native';

import { styles } from '../styles/registerStyles';

/**
* Mosaico de solicitud de carga para documentos de registro.
* Se utiliza para solicitar a los usuarios que seleccionen un archivo de imagen y para mostrar si el documento ya está adjunto.
* Propiedades:
* - title: etiqueta del documento que se muestra en el mosaico.
* - onPress: función de devolución de llamada que se ejecuta al pulsar el mosaico para abrir/seleccionar el archivo.
* - selected: valor booleano que cambia el icono, el estilo del borde y la sugerencia del estado de solicitud de carga al estado listo.

* WORK IN PROGRESS
*/

export function DocumentBox({ title, onPress, selected }) {
  return (
    <Pressable onPress={onPress} style={[styles.docBox, selected && styles.docBoxSelected]}>
      <Text style={styles.docIcon}>{selected ? '☑' : '▧'}</Text>
      <Text style={styles.docTitle}>{title}</Text>
      <Text style={styles.docHint}>{selected ? 'ARCHIVO LISTO' : 'SUBIR ARCHIVO JPG O PNG'}</Text>
    </Pressable>
  );
}