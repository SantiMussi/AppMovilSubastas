import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '../styles/registerStyles';

/**
* Fila de label/value de solo lectura para las pantallas de revisión de perfil.
* Se utiliza para resumir los datos de registro enviados antes de la confirmación final.
* Propiedades:
* - etiqueta: nombre del campo en mayúsculas, mostrado en la parte superior izquierda.
* - valor: valor del campo formateado, mostrado con el estilo de valor de perfil.
*/

export function ProfileRow({ label, value }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}
