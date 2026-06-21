import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopBar } from '../components/TopBar';

const LEVELS = [
  {
    id: '1',
    level: 'NIVEL 01',
    title: 'COMÚN',
    desc: 'Acceso ilimitado a nuestras subastas base y catálogos estacionales.',
    bg: '#F4F5F7',
    badgeType: 'circle',
  },
  {
    id: '2',
    level: 'NIVEL 02',
    title: 'ESPECIAL',
    desc: 'Acceso curado a colecciones seleccionadas de arte moderno y antigüedades.',
    bg: '#FFFFFF',
    border: '#E8E8E8',
    badgeType: 'check',
  },
  {
    id: '3',
    level: 'NIVEL 03',
    title: 'ORO',
    desc: 'Sin límites de puja en lotes premium y acceso garantizado a eventos VIP presenciales.',
    bg: '#F2CA7E',
    badgeType: 'gold',
  },
  {
    id: '4',
    level: 'NIVEL 04',
    title: 'PLATINO',
    desc: 'Experiencia concierge 24/7, invitaciones a subastas privadas y límites de crédito ilimitados.',
    bg: '#D4DEF2',
    badgeType: 'platinum',
  },
];

const ACCORDION_ITEMS = [
  {
    id: '1',
    title: 'ACTIVIDAD CONSTANTE',
    content: 'Su participación activa en subastas mensuales es el principal motor de ascenso.',
  },
  {
    id: '2',
    title: 'EXCELENCIA EN PAGOS',
    content: 'Mantener un historial impecable de liquidaciones y pagos puntuales asegura la integridad de nuestras subastas y acelera su progreso a niveles superiores.',
  },
  {
    id: '3',
    title: 'DIVERSIDAD FINANCIERA',
    content: 'Demostrar solvencia y participación constante en diferentes categorías de subastas fortalece su perfil como coleccionista dentro de Vantage.',
  },
];

export default function MembershipCategoriesScreen({ onMenuPress }) {
  const [expandedId, setExpandedId] = useState('1');

  const toggleAccordion = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderCard = ({ item }) => {
    return (
      <View style={[styles.card, { backgroundColor: item.bg, borderColor: item.border || 'transparent', borderWidth: item.border ? 1 : 0 }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardLevel}>{item.level}</Text>
          {item.badgeType === 'circle' && (
            <View style={styles.badgeCircle} />
          )}
          {item.badgeType === 'check' && (
            <Ionicons name="checkmark-circle-outline" size={20} color="#A38A5A" />
          )}
          {item.badgeType === 'gold' && (
            <View style={styles.badgeGold}>
              <Text style={styles.badgeGoldText}>GOLD</Text>
            </View>
          )}
          {item.badgeType === 'platinum' && (
            <View style={styles.badgePlatinum}>
              <Text style={styles.badgePlatinumText}>PLATINUM</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDesc}>{item.desc}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar onMenuPress={onMenuPress} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Horizontal Cards Slider */}
        <View style={styles.sliderSection}>
          <FlatList
            data={LEVELS}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sliderContent}
            snapToInterval={296} // card width + margin
            decelerationRate="fast"
          />
        </View>

        {/* How to level up Section */}
        <View style={styles.accordionSection}>
          <Text style={styles.sectionTitle}>Cómo subir de nivel</Text>

          {ACCORDION_ITEMS.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <View key={item.id} style={styles.accordionItem}>
                <Pressable
                  style={styles.accordionHeader}
                  onPress={() => toggleAccordion(item.id)}
                >
                  <View style={styles.accordionTitleRow}>
                    <View style={styles.bulletPoint} />
                    <Text style={styles.accordionTitle}>{item.title}</Text>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color="#000"
                  />
                </Pressable>
                {isExpanded && (
                  <View style={styles.accordionContent}>
                    <Text style={styles.accordionText}>{item.content}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sliderSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  sliderContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: 280,
    padding: 24,
    borderRadius: 8,
    minHeight: 200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLevel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 1,
  },
  cardTitle: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '900',
    color: '#0A1628',
    marginBottom: 12,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: '#444',
  },
  badgeCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#C0C0C0',
  },
  badgeGold: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeGoldText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#333',
  },
  badgePlatinum: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgePlatinumText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  accordionSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '900',
    color: '#000',
    marginBottom: 20,
  },
  accordionItem: {
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#A38A5A',
    marginRight: 12,
  },
  accordionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingLeft: 34, // Align with text
  },
  accordionText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#666',
  },
});
