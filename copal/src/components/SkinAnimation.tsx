import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS, TYPOGRAPHY, FONT_SIZE, ANIMATION } from '../constants/theme';
import { SkinId } from '../types/deposit';

interface Props {
  skinId: SkinId;
  text: string;
}

// Animacion "La Nada" (void) — negro total, punto rojo, silencio
function VoidAnimation({ text }: { text: string }) {
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // texto desaparece
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      // punto rojo aparece
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      // punto rojo desaparece
      Animated.timing(dotOpacity, {
        toValue: 0,
        duration: 600,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.text, { opacity: textOpacity }]}>
        {text}
      </Animated.Text>
      <Animated.View style={[styles.redDot, { opacity: dotOpacity }]} />
    </View>
  );
}

// Animacion "Float" (soltarse) — flota hacia arriba y desaparece
function FloatAnimation({ text }: { text: string }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -80,
        duration: ANIMATION.skinDurationMax,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: ANIMATION.skinDurationMax,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.text,
          { opacity, transform: [{ translateY }] },
        ]}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

// Animacion "Collapse" — colapsa al centro, flash blanco, nada
function CollapseAnimation({ text }: { text: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(flashOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.text,
          { opacity, transform: [{ scale }] },
        ]}
      >
        {text}
      </Animated.Text>
      <Animated.View
        style={[styles.flash, { opacity: flashOpacity }]}
        pointerEvents="none"
      />
    </View>
  );
}

// Animacion "Erase" — se borra letra por letra, de atras pa' adelante
function EraseAnimation({ text }: { text: string }) {
  const [visibleText, setVisibleText] = React.useState(text);

  useEffect(() => {
    let current = text;
    const interval = setInterval(() => {
      if (current.length <= 0) {
        clearInterval(interval);
        return;
      }
      current = current.slice(0, -1);
      setVisibleText(current);
    }, ANIMATION.skinDurationMax / text.length);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{visibleText}</Text>
    </View>
  );
}

export function SkinAnimation({ skinId, text }: Props) {
  switch (skinId) {
    case 'float':
      return <FloatAnimation text={text} />;
    case 'collapse':
      return <CollapseAnimation text={text} />;
    case 'erase':
      return <EraseAnimation text={text} />;
    case 'void':
    default:
      return <VoidAnimation text={text} />;
  }
}

const styles = StyleSheet.create({
  container: {
    minHeight: 100,
    maxHeight: 200,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  text: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    lineHeight: FONT_SIZE.lg * 1.6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    position: 'absolute',
    alignSelf: 'center',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
  },
});
