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

const BADGE_STYLES = {
  PLATINO:  { bg: '#D4DEF2', text: '#0A1628', label: 'PLATINO'  },
  PLATINUM: { bg: '#D4DEF2', text: '#0A1628', label: 'PLATINO'  },
  ORO:      { bg: '#F2CA7E', text: '#0A1628', label: 'ORO'      },
  GOLD:     { bg: '#F2CA7E', text: '#0A1628', label: 'ORO'      },
  ESPECIAL: { bg: '#F4F5F7', text: '#0A1628', label: 'ESPECIAL' },
  COMÚN:    { bg: '#F4F5F7', text: '#0A1628', label: 'COMÚN'    },
  COMUN:    { bg: '#F4F5F7', text: '#0A1628', label: 'COMÚN'    },
  DEFAULT:  { bg: '#F4F5F7', text: '#0A1628', label: 'COMÚN'    },
};

const getBadge = (category) => {
  if (!category) return BADGE_STYLES.DEFAULT;
  const key = category.toUpperCase();
  return BADGE_STYLES[key] || BADGE_STYLES.DEFAULT;
};

const MENU_SECTIONS = [
  {
    items: [
      { key: 'perfil',      icon: 'person-outline',        label: 'Perfil' },
      { key: 'auctions',    icon: 'podium-outline',        label: 'Subastas' },
      { key: 'notificaciones', icon: 'notifications-outline', label: 'Notificaciones' },
    ],
  },
  {
    items: [
      { key: 'coleccion',    icon: 'albums-outline',        label: 'Mi Colección'      },
      { key: 'pagos',        icon: 'card-outline',          label: 'Métodos de Pago'   },
      { key: 'historial',    icon: 'time-outline',          label: 'Historial de Pujas'},
      { key: 'offerItem',    icon: 'pricetag-outline',      label: 'Ofrecer Artículo'  },
      { key: 'misArticulos', icon: 'document-text-outline', label: 'Mis Propuestas'    },
    ],
  },
  {
    items: [
      { key: 'ajustes',     icon: 'settings-outline',      label: 'Ajustes' },
    ],
  },
];

export function Sidebar({ profile, currentScreen, onNavigate, onClose, onLogout }) {
  const userName  = profile ? ([profile?.nombre, profile?.apellido].filter(Boolean).join(' ') || 'Usuario') : 'Invitado';
  const badge     = getBadge(profile?.categoria);
  const avatarUri = profile?.foto || null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandText}>Vantage</Text>
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
          {profile && <View style={styles.onlineDot} />}
        </View>

        <Text style={styles.userName} numberOfLines={1}>{userName}</Text>

        {profile && (
          <Pressable 
            style={[styles.badge, { backgroundColor: badge.bg }]}
            onPress={() => onNavigate?.('membershipCategories')}
          >
            <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
            <View style={[styles.badgeDot, { backgroundColor: badge.text }]} />
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.menuScroll}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        {MENU_SECTIONS.map((section, sectionIdx) => {
          const visibleItems = section.items.filter(item => profile || item.key === 'auctions');
          if (visibleItems.length === 0) return null;

          return (
            <View key={sectionIdx}>
              {sectionIdx > 0 && <View style={styles.separator} />}
              {visibleItems.map((item) => {
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
          );
        })}
      </ScrollView>

      <View style={styles.bottomSection}>
        <View style={styles.separator} />
        {profile ? (
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.menuItemPressed]}
            onPress={onLogout}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="log-out-outline" size={19} color={C.danger} />
            </View>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.menuItemPressed]}
            onPress={() => onNavigate?.('authChoice')}
          >
            <View style={styles.menuIconWrap}>
              <Ionicons name="log-in-outline" size={19} color={C.gold} />
            </View>
            <Text style={[styles.logoutText, { color: C.gold }]}>Iniciar Sesión</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

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
  brandText: {
    color: C.gold,
    fontFamily: 'serif',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
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
