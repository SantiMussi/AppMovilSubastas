import React from 'react';
import { View } from 'react-native';

import { styles } from '../styles/registerStyles';

export function Card({ children, roomy, dimmed }) {
  return <View style={[styles.card, roomy && styles.roomyCard, dimmed && styles.dimmed]}>{children}</View>;
}
