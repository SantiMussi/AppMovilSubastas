import React from 'react';
import { Text, View, Pressable } from 'react-native';

import { styles } from '../styles/registerStyles';

export function DocumentBox({ title, onPress, selected }) {
  return (
    <Pressable onPress={onPress} style={[styles.docBox, selected && styles.docBoxSelected]}>
      <Text style={styles.docIcon}>{selected ? '☑' : '▧'}</Text>
      <Text style={styles.docTitle}>{title}</Text>
      <Text style={styles.docHint}>{selected ? 'ARCHIVO LISTO' : 'SUBIR ARCHIVO JPG O PNG'}</Text>
    </Pressable>
  );
}