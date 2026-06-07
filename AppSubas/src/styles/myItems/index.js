import { StyleSheet } from 'react-native';

import { cardStyles }   from './cardStyles';
import { headerStyles } from './headerStyles';
import { layoutStyles } from './layoutStyles';
import { tabStyles }    from './tabStyles';

export const styles = StyleSheet.create({
    ...layoutStyles,
    ...headerStyles,
    ...tabStyles,
    ...cardStyles,
});