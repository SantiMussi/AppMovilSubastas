import React from 'react';
import { View } from 'react-native';

import { styles } from '../styles/registerStyles';

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
