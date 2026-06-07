import { StyleSheet } from 'react-native';
import { layoutStyles }  from './layoutStyles';
import { headerStyles }  from './headerStyles';
import { priceStyles }   from './priceStyles';
import { actionStyles }  from './actionStyles';
import { modalStyles }   from './modalStyles';

export const styles = StyleSheet.create({
    ...layoutStyles,
    ...headerStyles,
    ...priceStyles,
    ...actionStyles,
    ...modalStyles,
});