import { StyleSheet } from 'react-native';

import { layoutStyles } from './layoutStyles';
import { headerStyles } from './headerStyles';
import { listStyles }   from './listStyles';
import { cardStyles }   from './cardStyles';

export const styles = StyleSheet.create({
    ...layoutStyles,
    ...headerStyles,
    ...listStyles,
    ...cardStyles,
});