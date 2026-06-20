import { StyleSheet } from 'react-native';

import { layoutStyles }   from './layoutStyles';
import { headerStyles }   from './headerStyles';
import { formStyles }     from './formStyles';
import { shippingStyles } from './shippingStyles';
import { paymentStyles }  from './paymentStyles';
import { buttonStyles }   from './buttonStyles';
import { modalStyles }    from './modalStyles';

export const styles = StyleSheet.create({
    ...layoutStyles,
    ...headerStyles,
    ...formStyles,
    ...shippingStyles,
    ...paymentStyles,
    ...buttonStyles,
    ...modalStyles,
});