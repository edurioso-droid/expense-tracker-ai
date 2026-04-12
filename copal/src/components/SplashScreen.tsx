import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS, FONT_SIZE, TYPOGRAPHY, SPACING } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SPLASH_PHRASES = [
  '¿qué estás pensando de verdad?',
  'suéltalo.',
  'nadie te conoce aquí.',
  'di lo que no dirías en voz alta.',
  'el silencio también pesa.',
] as const;

interface Props {
  onOpen: () => void;
}

export function SplashScreen({ onOpen }: Props) {
  const [phrase] = useState(
    () => SPLASH_PHRASES[Math.floor(Math.random() * SPLASH_PHRASES.length)]
  );

  const phraseOpacity = useRef(new Animated.Value(0)).current;
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // titulo aparece inmediatamente
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // frase aparece a los 1.2s
    const phraseTimeout = setTimeout(() => {
      Animated.timing(phraseOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 1200);

    // cursor parpadea indefinidamente
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 530,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 530,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearTimeout(phraseTimeout);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={onOpen}>
      <View style={styles.container}>
        {/* Grain overlay */}
        <View style={styles.grain} pointerEvents="none" />

        {/* Titulo */}
        <Animated.View style={[styles.center, { opacity: titleOpacity }]}>
          <Text style={styles.title}>cabrón</Text>
        </Animated.View>

        {/* Frase + cursor */}
        <Animated.View
          style={[styles.phraseContainer, { opacity: phraseOpacity }]}
        >
          <View style={styles.phraseRow}>
            <Text style={styles.phrase}>{phrase}</Text>
            <Animated.Text
              style={[styles.cursor, { opacity: cursorOpacity }]}
            >
              {' '}|
            </Animated.Text>
          </View>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `rgba(255,255,255,0.016)`,
    pointerEvents: 'none',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    top: '42%',
  },
  title: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: FONT_SIZE['3xl'],
    color: COLORS.red,
    letterSpacing: 0.5,
  },
  phraseContainer: {
    position: 'absolute',
    bottom: height * 0.32,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  phraseRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  phrase: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[400],
    textAlign: 'center',
    lineHeight: FONT_SIZE.sm * 1.6,
  },
  cursor: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.sm,
    color: COLORS.gray[400],
    lineHeight: FONT_SIZE.sm * 1.6,
  },
});
