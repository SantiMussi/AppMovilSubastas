import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '../styles/registerStyles';


/**
 * Estructura de página que centra una tarjeta vertical y muestra un pequeño texto encima cuando se indica.
 * Se utiliza para estados de registro específicos, como espera, configuración de contraseña u otros flujos de una sola tarjeta.
 * Propiedades:
 * - children: Nodos de React renderizados dentro de la tarjeta vertical centrada.
 * - caption: Texto auxiliar opcional que se muestra encima de la tarjeta para identificar la pantalla/estado actual.
 */

export function CenteredScreen({ children, caption }) {
  return (
    <View style={styles.centerShell}>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      <View style={styles.tallCard}>{children}</View>
    </View>
  );
}
