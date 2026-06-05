import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Sidebar / drawer menu for the Vantage auction app.
 *
 * Props:
 * - profile       : user profile object (nombre, apellido, categoria, foto)
 * - currentScreen : string key of the currently active screen
 * - onNavigate    : (screenKey) => void — fires when a menu item is tapped
 * - onClose       : () => void — fires when the user wants to close the sidebar
 * - onLogout      : () => void — fires when the user taps "Cerrar Sesión"
 */

/* ─── colour tokens ─────────────────────────────────────────────── */
const C = {
  bg:           '#0A1628',
  bgLight:      '#0F1F38',
  gold:         '#C5A059',
  goldBright:   '#D4AF37',
  white:        '#FFFFFF',
  whiteOff:     'rgba(255,255,255,0.65)',
  whiteDim:     'rgba(255,255,255,0.35)',
  separator:    'rgba(255,255,255,0.08)',
  activeItem:   'rgba(197,160,89,0.12)',
  danger:       '#D94444',
};

/* ─── badge colours per membership category ─────────────────────── */
const BADGE_STYLES = {
  PLATINUM: { bg: '#1C2C4A', text: '#8AB4F8', label: 'PLATINUM MEMBER' },
  GOLD:     { bg: '#3A2E10', text: '#D4AF37', label: 'GOLD MEMBER'     },
  SILVER:   { bg: '#2A2C30', text: '#C0C0C0', label: 'SILVER MEMBER'   },
  BRONCE:   { bg: '#2E211A', text: '#CD7F32', label: 'BRONCE MEMBER'   },
  DEFAULT:  { bg: '#1C2C4A', text: '#8AB4F8', label: 'MIEMBRO'         },
};

const getBadge = (category) => {
  if (!category) return BADGE_STYLES.DEFAULT;
  const key = category.toUpperCase();
  return BADGE_STYLES[key] || BADGE_STYLES.DEFAULT;
};

/* ─── menu structure ────────────────────────────────────────────── */
const MENU_SECTIONS = [
  {
    items: [
      { key: 'perfil',      icon: 'person-outline',        label: 'Perfil' },
    ],
  },
  {
    items: [
      { key: 'coleccion',   icon: 'albums-outline',        label: 'Mi Colección' },
      { key: 'pagos',       icon: 'card-outline',          label: 'Métodos de Pago' },
      { key: 'historial',   icon: 'time-outline',          label: 'Historial de Pujas' },
      { key: 'offerItem',   icon: 'pricetag-outline',      label: 'Ofrecer Artículo' },
    ],
  },
  {
    items: [
      { key: 'ajustes',     icon: 'settings-outline',      label: 'Ajustes' },
    ],
  },
];

export function Sidebar({ profile, currentScreen, onNavigate, onClose, onLogout }) {
  const userName  = [profile?.nombre, profile?.apellido].filter(Boolean).join(' ') || 'Usuario';
  const badge     = getBadge(profile?.categoria);
  const avatarUri = profile?.foto || null;

  return (
    <View style={styles.container}>
      {/* ── header: logo + close ── */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/logo_vantage.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerRight}>
          <Pressable
            style={styles.headerIconBtn}
            onPress={() => onNavigate?.('notificaciones')}
            accessibilityLabel="Notificaciones"
            hitSlop={8}
          >
            <Ionicons name="notifications-outline" size={20} color={C.whiteOff} />
          </Pressable>
          <Pressable
            style={styles.headerIconBtn}
            onPress={onClose}
            accessibilityLabel="Cerrar menú"
            hitSlop={8}
          >
            <Ionicons name="close" size={22} color={C.whiteOff} />
          </Pressable>
        </View>
      </View>

      {/* ── user profile section ── */}
      <View style={styles.profileSection}>
        <View style={styles.avatarWrap}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {/* Online indicator dot */}
          <View style={styles.onlineDot} />
        </View>

        <Text style={styles.userName} numberOfLines={1}>{userName}</Text>

        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
          <View style={[styles.badgeDot, { backgroundColor: badge.text }]} />
        </View>
      </View>

      {/* ── scrollable menu ── */}
      <ScrollView
        style={styles.menuScroll}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        {MENU_SECTIONS.map((section, sectionIdx) => (
          <View key={sectionIdx}>
            {sectionIdx > 0 && <View style={styles.separator} />}
            {section.items.map((item) => {
              const isActive = currentScreen === item.key;
              return (
                <Pressable
                  key={item.key}
                  style={({ pressed }) => [
                    styles.menuItem,
                    isActive && styles.menuItemActive,
                    pressed && styles.menuItemPressed,
                  ]}
                  onPress={() => onNavigate?.(item.key)}
                >
                  <View style={styles.menuIconWrap}>
                    <Ionicons
                      name={item.icon}
                      size={19}
                      color={isActive ? C.white : C.whiteOff}
                    />
                  </View>
                  <Text
                    style={[
                      styles.menuLabel,
                      isActive && styles.menuLabelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* ── bottom: logout ── */}
      <View style={styles.bottomSection}>
        <View style={styles.separator} />
        <Pressable
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.menuItemPressed]}
          onPress={onLogout}
        >
          <View style={styles.menuIconWrap}>
            <Ionicons name="log-out-outline" size={19} color={C.danger} />
          </View>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ─── styles ────────────────────────────────────────────────────── */
const SIDEBAR_WIDTH = 280;

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 12 : 54,
    paddingBottom: Platform.OS === 'android' ? 16 : 34,
  },

  /* ── header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 28,
  },
  logo: {
    width: 110,
    height: 32,
    tintColor: C.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── profile ── */
  profileSection: {
    paddingHorizontal: 22,
    marginBottom: 24,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    marginBottom: 14,
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: C.gold,
  },
  avatarPlaceholder: {
    backgroundColor: C.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: C.gold,
    fontSize: 28,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4ADE80',
    borderWidth: 3,
    borderColor: C.bg,
  },
  userName: {
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'serif',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  /* ── menu ── */
  menuScroll: {
    flex: 1,
  },
  menuContent: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: C.separator,
    marginHorizontal: 10,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginVertical: 1,
  },
  menuItemActive: {
    backgroundColor: C.activeItem,
  },
  menuItemPressed: {
    opacity: 0.6,
  },
  menuIconWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    color: C.whiteOff,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  menuLabelActive: {
    color: C.white,
    fontWeight: '700',
  },

  /* ── bottom ── */
  bottomSection: {
    paddingHorizontal: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 4,
  },
  logoutText: {
    color: C.danger,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
