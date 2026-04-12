import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { COLORS, TYPOGRAPHY, FONT_SIZE, SPACING, RADIUS } from '../constants/theme';
import { SkinId } from '../types/deposit';
import { SKINS } from '../lib/skins';

interface Props {
  selected: SkinId;
  onSelect: (id: SkinId) => void;
  ownedSkins?: SkinId[];
}

export function SkinSelector({
  selected,
  onSelect,
  ownedSkins = ['void'],
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.container}
    >
      {(Object.keys(SKINS) as SkinId[]).map((skinId) => {
        const skin = SKINS[skinId];
        const isOwned = ownedSkins.includes(skinId);
        const isSelected = selected === skinId;

        return (
          <TouchableOpacity
            key={skinId}
            style={[
              styles.chip,
              isSelected && styles.chipSelected,
              !isOwned && styles.chipLocked,
            ]}
            onPress={() => isOwned && onSelect(skinId)}
            activeOpacity={isOwned ? 0.7 : 1}
          >
            <Text
              style={[
                styles.chipName,
                isSelected && styles.chipNameSelected,
                !isOwned && styles.chipNameLocked,
              ]}
            >
              {skin.name}
            </Text>
            {!isOwned && (
              <Text style={styles.chipPrice}>
                ${skin.priceMXN}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xs,
    marginHorizontal: -SPACING.md,
  },
  row: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.gray[600],
    borderRadius: RADIUS.md,
    paddingVertical: 5,
    paddingHorizontal: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipSelected: {
    borderColor: COLORS.red,
    backgroundColor: `rgba(255,59,48,0.08)`,
  },
  chipLocked: {
    opacity: 0.45,
  },
  chipName: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[200],
    letterSpacing: 0.4,
  },
  chipNameSelected: {
    color: COLORS.red,
  },
  chipNameLocked: {
    color: COLORS.gray[400],
  },
  chipPrice: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.xs - 1,
    color: COLORS.gray[400],
  },
});
