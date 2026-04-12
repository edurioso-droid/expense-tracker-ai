import React, { useCallback, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, TYPOGRAPHY, FONT_SIZE, SPACING } from '../constants/theme';
import { ThoughtCard } from './ThoughtCard';
import { Deposit } from '../types/deposit';
import { useDepositStore } from '../store/depositStore';

const TRENDING_SEED: Deposit[] = [
  {
    id: 'seed-1',
    text: 'hay momentos en que quiero desaparecer pero no morirme. solo no estar.',
    createdAt: Date.now() - 1000 * 60 * 4,
    status: 'ok',
    resonances: 847,
    trend: 847,
    skinId: 'void',
    sessionId: 'seed',
  },
  {
    id: 'seed-2',
    text: 'le sonreí a alguien hoy y me acordé de que era real.',
    createdAt: Date.now() - 1000 * 60 * 11,
    status: 'ok',
    resonances: 3241,
    trend: 3241,
    skinId: 'float',
    sessionId: 'seed',
  },
];

interface Props {
  onOpenDeposit: () => void;
}

export function Feed({ onOpenDeposit }: Props) {
  const { feed } = useDepositStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const depositBtnScale = useRef(new Animated.Value(1)).current;

  // Solo mostrar pensamientos con status "ok"
  const visibleFeed = feed.filter((d) => d.status === 'ok');

  // Combinar con seed data para cold start
  const allItems = [...visibleFeed, ...TRENDING_SEED.filter(
    (s) => !visibleFeed.find((v) => v.id === s.id)
  )];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // En produccion: fetch de nuevos depositos del servidor
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleDepositPress = () => {
    Animated.sequence([
      Animated.timing(depositBtnScale, {
        toValue: 0.93,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(depositBtnScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(onOpenDeposit);
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Deposit; index: number }) => {
      // Cada 6 items: slot vacio reservado (sin anuncio — por spec)
      if (index > 0 && index % 6 === 0) {
        return (
          <>
            <View style={styles.emptySlot} />
            <ThoughtCard deposit={item} />
          </>
        );
      }
      return <ThoughtCard deposit={item} />;
    },
    []
  );

  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.logo}>copal</Text>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>vacío por ahora.</Text>
      <Text style={styles.emptySubtext}>sé el primero en depositar algo.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={allItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gray[400]}
            colors={[COLORS.red]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          allItems.length === 0 ? styles.emptyContainer : undefined
        }
      />

      {/* Boton flotante de deposito */}
      <Animated.View
        style={[
          styles.fabContainer,
          { transform: [{ scale: depositBtnScale }] },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={handleDepositPress}
          activeOpacity={1}
        >
          <Text style={styles.fabText}>depositar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray[600],
  },
  logo: {
    fontFamily: 'Palatino-Italic',
    fontSize: FONT_SIZE['2xl'],
    color: COLORS.red,
    letterSpacing: 0.5,
  },
  emptySlot: {
    height: 1,
    backgroundColor: COLORS.black,
    // Slot reservado — sin anuncio nunca
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: SPACING.sm,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[400],
    fontStyle: 'italic',
  },
  emptySubtext: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[500],
  },
  fabContainer: {
    position: 'absolute',
    bottom: 32,
    right: SPACING.md,
  },
  fab: {
    backgroundColor: COLORS.red,
    borderRadius: 4,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  fabText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.xs,
    color: COLORS.white,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
