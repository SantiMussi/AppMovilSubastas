import { StyleSheet } from 'react-native';

import { buttonStyles } from './buttonStyles';
import { documentStyles } from './documentStyles';
import { dropdownStyles } from './dropdownStyles';
import { formStyles } from './formStyles';
import { headerStyles } from './headerStyles';
import { keyStyles } from './keyStyles';
import { layoutStyles } from './layoutStyles';
import { modalStyles } from './modalStyles';
import { navigationStyles } from './navigationStyles';
import { profileStyles } from './profileStyles';
import { statusStyles } from './statusStyles';

export const styles = StyleSheet.create({
  ...layoutStyles,
  ...headerStyles,
  ...formStyles,
  ...documentStyles,
  ...buttonStyles,
  ...statusStyles,
  ...keyStyles,
  ...profileStyles,
  ...modalStyles,
  ...navigationStyles,
  ...dropdownStyles,
});