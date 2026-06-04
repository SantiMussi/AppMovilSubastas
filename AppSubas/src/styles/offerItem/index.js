import { StyleSheet } from 'react-native';

import { buttonStyles } from './buttonStyles';
import { carouselStyles } from './carouselStyles';
import { checkboxStyles } from './checkboxStyles';
import { formStyles } from './formStyles';
import { headerStyles } from './headerStyles';
import { layoutStyles } from './layoutStyles';
import { modalStyles } from './modalStyles';

export const styles = StyleSheet.create({
  ...layoutStyles,
  ...headerStyles,
  ...formStyles,
  ...carouselStyles,
  ...checkboxStyles,
  ...modalStyles,
  ...buttonStyles,
});