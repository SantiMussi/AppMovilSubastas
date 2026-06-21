import { StyleSheet } from 'react-native';
import { layoutStyles }  from './layoutStyles';
import { headerStyles }  from './headerStyles';
import { priceStyles }   from './priceStyles';
import { actionStyles }  from './actionStyles';
import { modalStyles }   from './modalStyles';
import { infoStyles }    from './infoStyles';

export const styles = StyleSheet.create({
    ...layoutStyles,
    ...headerStyles,
    ...priceStyles,
    ...actionStyles,
    ...modalStyles,
    ...infoStyles,
});