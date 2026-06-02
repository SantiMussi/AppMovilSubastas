import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { styles } from '../styles/registerStyles';

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