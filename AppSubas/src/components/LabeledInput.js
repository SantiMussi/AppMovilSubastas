import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { styles } from '../styles/registerStyles';

/*
* Contenedor de entrada de texto (input) con el label, el contenedor, el color placeholder y el contenido final opcional de la aplicación.
* Usar para campos de formularios de registro cuando se necesite un espaciado y estilo consistentes alrededor de un TextInput.
* Propiedades:
* - label: texto que se muestra encima del campo de entrada.
* - right: nodo de React opcional que se renderiza dentro del contenedor de input a la derecha, generalmente un icono o una sugerencia.
* - ...inputProps: cualquier propiedad estándar de TextInput, como value, onChangeText, placeholder, keyboardType, secureTextEntry o multiline.
*/

export function LabeledInput({ label, right, ...inputProps }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrap}>
        <TextInput {...inputProps} placeholderTextColor="#c5c7cb" style={styles.input} />
        {right ? <View style={styles.inputRight}>{right}</View> : null}
      </View>
    </View>
  );
}