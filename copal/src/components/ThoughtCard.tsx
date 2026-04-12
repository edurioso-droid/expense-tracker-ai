import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, FONT_SIZE, SPACING, RADIUS } from '../constants/theme';
import { Deposit, getTrendLevel, formatTrend } from '../types/deposit';
import { useDepositStore } from '../store/depositStore';

interface Props {
  deposit: Deposit;
}

function timeAgo(ts: number): string {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60)  return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function ThoughtCard({ deposit }: Props) {
  const heartScale = useRef(new Animated.Value(1)).current;
  const { incrementResonance } = useDepositStore();
  const [hasResonated, setHasResonated] = React.useState(false);

  const trendLevel = getTrendLevel(deposit.trend);
  const isTrending = trendLevel !== 'none';

  const handleResonate = async () => {
    if (hasResonated) return;
    setHasResonated(true);
    incrementResonance(deposit.id);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.4,
        useNativeDriver: true,
        speed: 80,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
      }),
    ]).start();
  };

  return (
    <View
      style={[
        styles.card,
        isTrending && {
          backgroundColor: `rgba(255,30,30,${trendLevel === 'viral' ? 0.05 : 0.02})`,
        },
      ]}
    >
      {/* Texto del pensamiento */}
      <Text style={styles.text}>{deposit.text}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.time}>{timeAgo(deposit.createdAt)}</Text>

        <View style={styles.actions}>
          {/* Trending count */}
          {isTrending && (
            <TrendBadge trend={deposit.trend} />
          )}

          {/* Resonance button — no muestra quien resonó */}
          <TouchableOpacity
            style={styles.resonanceBtn}
            onPress={handleResonate}
            activeOpacity={0.7}
          >
            <Animated.Text
              style={[
                styles.heartChar,
                hasResonated && styles.heartActive,
                { transform: [{ scale: heartScale }] },
              ]}
            >
              ♡
            </Animated.Text>
            {deposit.resonances > 0 && (
              <Text style={[styles.resonanceCount, hasResonated && styles.resonanceCountActive]}>
                {deposit.resonances}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function TrendBadge({ trend }: { trend: number }) {
  const pulseScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.trendNum,
        { transform: [{ scale: pulseScale }] },
      ]}
    >
      {formatTrend(trend)}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.gray[600],
  },
  text: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: FONT_SIZE.base,
    color: COLORS.white,
    lineHeight: FONT_SIZE.base * 1.6,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[400],
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  resonanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  heartChar: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.base,
    color: COLORS.gray[400],
  },
  heartActive: {
    color: COLORS.red,
  },
  resonanceCount: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[400],
  },
  resonanceCountActive: {
    color: COLORS.red,
  },
  trendNum: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.xs,
    color: COLORS.red,
    letterSpacing: 0.5,
  },
});
