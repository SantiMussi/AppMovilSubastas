import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '../styles/registerStyles';

export function CenteredScreen({ children, caption }) {
  return (
    <View style={styles.centerShell}>
      <Text style={styles.caption}>{caption}</Text>
      <View style={styles.tallCard}>{children}</View>
    </View>
  );
}
