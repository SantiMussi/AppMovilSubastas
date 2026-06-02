import React from 'react';
import { Text, View } from 'react-native';

import { styles } from '../styles/registerStyles';

export function ProfileRow({ label, value }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  );
}
