import React from 'react';
import { Pressable, Text } from 'react-native';

import { styles } from '../styles/registerStyles';

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
