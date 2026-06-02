import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '../styles/registerStyles';

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