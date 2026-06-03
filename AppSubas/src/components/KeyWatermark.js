import React from 'react';
import { View } from 'react-native';

import { styles } from '../styles/registerStyles';

/*
* Marca de agua decorativa con forma de llave, creada con vistas estilizadas.
* Úsela como elemento visual no interactivo en pantallas de seguridad o aprobación; los eventos de puntero están deshabilitados.
* Propiedades:
* - small: valor booleano opcional que aplica la variante de tamaño de llave más pequeño.

*/

export function KeyWatermark({ small }) {
  return (
    <View style={[styles.key, small && styles.smallKey]} pointerEvents="none">
      <View style={styles.keyCircle}>
        <View style={styles.keyHole} />
      </View>
      <View style={styles.keyStem} />
      <View style={styles.keyToothOne} />
      <View style={styles.keyToothTwo} />
    </View>
  );
}
