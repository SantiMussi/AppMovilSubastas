import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '../styles/registerStyles';

/**
* Encabezado de registro con título, texto opcional y un indicador de progreso de tres pasos.
* Se utiliza en la parte superior de las tarjetas de registro para comunicar la sección actual y el progreso.
* Propiedades:
* - título: título principal que se muestra en el encabezado.
* - ceja: texto pequeño opcional que se muestra junto al título, como el texto del paso actual.
* - activeStep: índice basado en cero (0, 1 o 2) que resalta el segmento de progreso correspondiente; por defecto es 0.
* - compact: valor booleano opcional para el espaciado más ajustado del encabezado que se utiliza en tarjetas más pequeñas.
*/

export function Header({ title, eyebrow, activeStep = 0, compact }) {
  return (
    <View style={[styles.header, compact && styles.compactHeader]}>
      <View style={styles.headerTop}>
        <Text style={styles.title}>{title}</Text>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      </View>
      <View style={styles.steps}>
        {[0, 1, 2].map((item) => (
          <View key={item} style={[styles.stepLine, item === activeStep && styles.activeLine]} />
        ))}
      </View>
    </View>
  );
}