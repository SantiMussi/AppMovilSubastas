import React from 'react';
import { Pressable, Text } from 'react-native';

import { styles } from '../styles/registerStyles';

/*
* Llamada a la acción principal utilizada para acciones de registro y alternativas en línea.
* Usar cuando una pantalla necesite un botón que se pueda pulsar y que ya coincida con el tema de la aplicación.
* Props:
* - label: texto que se muestra dentro del botón.
* - onPress: función de devolución de llamada que se activa cuando el usuario pulsa el botón.
* - variant: estilo visual opcional; usar 'danger' para acciones destructivas/de cancelación o 'ghost' para botones de texto secundarios.
* - wide: valor booleano opcional que ajusta el tamaño del botón al diseño ancho definido en registerStyles.
* - disabled: valor booleano opcional que bloquea las pulsaciones y aplica el estado visual de pulsado/deshabilitado.
*/

export function ActionButton({ label, onPress, variant, wide, disabled }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        wide && styles.wideButton,
        variant === 'danger' && styles.dangerButton,
        variant === 'ghost' && styles.ghostButton,
        (pressed || disabled) && styles.pressed,
      ]}
    >
      <Text style={[styles.buttonText, variant === 'ghost' && styles.ghostText]}>{label}</Text>
    </Pressable>
  );
}
