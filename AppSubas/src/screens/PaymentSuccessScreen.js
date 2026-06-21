import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../themes/colors';

const PaymentSuccessScreen = ({ session, onMenuPress, onNavigate }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
          <View style={styles.menuBar} />
          <View style={styles.menuBar} />
          <View style={styles.menuBar} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>VANTAGE</Text>

        <View style={styles.profileCircle}>
          <Ionicons name="person" size={18} color="#999" />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="checkmark-circle-outline"
            size={40}
            color={Colors.secondary}
          />
        </View>

        <Text style={styles.title}>{'Método Agregado\ncon Éxito'}</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.volverButton}
          onPress={() => onNavigate('pagos')}
          activeOpacity={0.8}
        >
          <Text style={styles.volverText}>VOLVER  →</Text>
        </TouchableOpacity>

        <Text style={styles.securityText}>
          {'SEGURIDAD VANTAGE CERTIFICADA · ENCRIPTACIÓN\nSSL 256 BIT'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 40) + 10 : 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  menuButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuBar: {
    width: 22,
    height: 2.5,
    backgroundColor: '#0A192F',
    borderRadius: 2,
    marginVertical: 2,
  },
  headerTitle: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '900',
    color: '#0A192F',
    letterSpacing: 1,
  },
  profileCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 18,
    backgroundColor: '#FFF8F0',
    borderWidth: 1,
    borderColor: '#F0E0CC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginTop: 28,
    lineHeight: 34,
  },
  bottomSection: {
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  volverButton: {
    marginHorizontal: 20,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0A192F',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0A192F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  volverText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  securityText: {
    fontSize: 10,
    color: '#BBB',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 16,
    marginTop: 24,
    marginBottom: 30,
  },
});

export default PaymentSuccessScreen;
