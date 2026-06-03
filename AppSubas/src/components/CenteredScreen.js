import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '../styles/registerStyles';


/**
* Estructura de página que centra una tarjeta vertical y muestra un pequeño texto encima.
* Se utiliza para estados de registro específicos, como espera, configuración de contraseña u otros flujos de una sola tarjeta.
* Propiedades:
* - children: Nodos de React renderizados dentro de la tarjeta vertical centrada.
* - caption: Texto auxiliar que se muestra encima de la tarjeta para identificar la pantalla/estado actual.
*/

export function CenteredScreen({ children, caption }) {
  return (
    <View style={styles.centerShell}>
      <Text style={styles.caption}>{caption}</Text>
      <View style={styles.tallCard}>{children}</View>
    </View>
  );
}
