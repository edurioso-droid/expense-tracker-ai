import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, TYPOGRAPHY, FONT_SIZE, ANIMATION } from '../constants/theme';

// La entidad IA reemplaza al xolotl como receptora del pensamiento.
// No juzga. No responde. Solo recibe.
// Cambia de estado segun el texto que el usuario esta escribiendo.

export type EntityMood =
  | 'idle'       // esperando
  | 'listening'  // el usuario esta escribiendo
  | 'receiving'  // deposito enviado, procesando
  | 'accepting'  // deposito aceptado
  | 'declining'  // deposito rechazado
  | 'alert';     // rate limit

const MOOD_GLYPHS: Record<EntityMood, string> = {
  idle:      '◉',
  listening: '◎',
  receiving: '○',
  accepting: '●',
  declining: '◌',
  alert:     '⊙',
};

const MOOD_COLORS: Record<EntityMood, string> = {
  idle:      COLORS.gray[300],
  listening: COLORS.gray[100],
  receiving: COLORS.gray[400],
  accepting: COLORS.red,
  declining: COLORS.gray[500],
  alert:     COLORS.red,
};

const MOOD_LABELS: Record<EntityMood, string> = {
  idle:      'esperando',
  listening: 'escuchando',
  receiving: 'recibiendo',
  accepting: '',
  declining: '',
  alert:     'espera',
};

interface Props {
  mood: EntityMood;
  size?: 'sm' | 'md' | 'lg';
}

export function AIEntity({ mood, size = 'md' }: Props) {
  const floatY = useRef(new Animated.Value(0)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  // Animacion float: 3px verticales, 3s, ease-in-out, infinite
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: -ANIMATION.floatDistance,
          duration: ANIMATION.floatDuration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: ANIMATION.floatDuration / 2,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Pulso cuando esta recibiendo
  useEffect(() => {
    if (mood === 'receiving') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseScale.setValue(1);
    }
  }, [mood]);

  const glyphSize = size === 'sm' ? 20 : size === 'md' ? 32 : 48;
  const labelSize = FONT_SIZE.xs;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: floatY }, { scale: pulseScale }] },
      ]}
    >
      <Text
        style={[
          styles.glyph,
          { fontSize: glyphSize, color: MOOD_COLORS[mood] },
        ]}
      >
        {MOOD_GLYPHS[mood]}
      </Text>
      {MOOD_LABELS[mood] ? (
        <Text
          style={[
            styles.label,
            { fontSize: labelSize, color: MOOD_COLORS[mood] },
          ]}
        >
          {MOOD_LABELS[mood]}
        </Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  glyph: {
    fontFamily: TYPOGRAPHY.mono,
    lineHeight: undefined,
  },
  label: {
    fontFamily: TYPOGRAPHY.mono,
    letterSpacing: 0.5,
    textTransform: 'lowercase',
  },
});
