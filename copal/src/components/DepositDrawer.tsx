import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, TYPOGRAPHY, FONT_SIZE, SPACING, RADIUS } from '../constants/theme';
import { AIEntity, EntityMood } from './AIEntity';
import { SkinSelector } from './SkinSelector';
import { SkinAnimation } from './SkinAnimation';
import { moderateDeposit } from '../lib/moderation';
import { canDeposit, recordDeposit, timeUntilNextSlot } from '../lib/rateLimiter';
import { getOrCreateSession, incrementDepositCount } from '../lib/identity';
import { useDepositStore, createDeposit } from '../store/depositStore';
import { SkinId } from '../types/deposit';

const MAX_CHARS = 280;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function DepositDrawer({ visible, onClose }: Props) {
  const [text, setText] = useState('');
  const [selectedSkin, setSelectedSkin] = useState<SkinId>('void');
  const [mood, setMood] = useState<EntityMood>('idle');
  const [isAnimating, setIsAnimating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const slideY = useRef(new Animated.Value(800)).current;
  const inputRef = useRef<TextInput>(null);

  const { addToFeed, setDepositing } = useDepositStore();

  // Slide in/out
  useEffect(() => {
    if (visible) {
      Animated.spring(slideY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start(() => {
        inputRef.current?.focus();
      });
    } else {
      Keyboard.dismiss();
      Animated.timing(slideY, {
        toValue: 800,
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        setText('');
        setMood('idle');
        setErrorMsg(null);
      });
    }
  }, [visible]);

  // Mood reactivo al texto
  useEffect(() => {
    if (text.length > 0) {
      setMood('listening');
    } else {
      setMood('idle');
    }
  }, [text]);

  const handleDeposit = useCallback(async () => {
    if (!text.trim() || isAnimating) return;

    // Rate limit check
    if (!canDeposit()) {
      const wait = Math.ceil(timeUntilNextSlot() / 1000 / 60);
      setMood('alert');
      setErrorMsg(`espera ${wait} min`);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    setIsAnimating(true);
    setMood('receiving');
    setErrorMsg(null);
    Keyboard.dismiss();

    const session = await getOrCreateSession();
    const deposit = createDeposit(text.trim(), session.sessionId, selectedSkin);

    // Optimistic: agregar al feed inmediatamente con status pending
    addToFeed(deposit);
    recordDeposit();
    await incrementDepositCount();

    // Haptic de confirmacion
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Moderar de forma asincrona — no bloquea la UX
    moderateDeposit(text.trim()).then((result) => {
      const { updateStatus } = useDepositStore.getState();
      if (result.status === 'ok') {
        updateStatus(deposit.id, 'ok');
      } else if (result.status === 'rejected') {
        updateStatus(deposit.id, 'rejected');
        // El pensamiento se retira del feed silenciosamente
      } else {
        updateStatus(deposit.id, 'review');
        // Oculto del feed publico hasta revision humana
      }
    });

    setMood('accepting');

    // Mostrar animacion del skin seleccionado (2.2 - 3.4s)
    setTimeout(() => {
      setIsAnimating(false);
      setMood('idle');
      setText('');
      onClose();
    }, 2800);
  }, [text, isAnimating, selectedSkin, addToFeed, onClose]);

  const charsLeft = MAX_CHARS - text.length;
  const isOverLimit = charsLeft < 0;

  if (!visible && !isAnimating) return null;

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideY }] }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
        <AIEntity mood={mood} size="sm" />
        <View style={styles.charCount}>
          <Text
            style={[
              styles.charText,
              isOverLimit && { color: COLORS.red },
            ]}
          >
            {charsLeft}
          </Text>
        </View>
      </View>

      {/* Input area */}
      <View style={styles.inputContainer}>
        {isAnimating && mood === 'accepting' ? (
          <SkinAnimation skinId={selectedSkin} text={text} />
        ) : (
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="deposita lo que sea real"
            placeholderTextColor={COLORS.gray[500]}
            multiline
            maxLength={MAX_CHARS + 20}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardAppearance="dark"
            scrollEnabled={false}
            selectionColor={COLORS.red}
          />
        )}
      </View>

      {/* Error message */}
      {errorMsg && (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Skin selector */}
      <SkinSelector selected={selectedSkin} onSelect={setSelectedSkin} />

      {/* Boton depositar */}
      <TouchableOpacity
        style={[
          styles.depositBtn,
          (!text.trim() || isOverLimit || isAnimating) && styles.depositBtnDisabled,
        ]}
        onPress={handleDeposit}
        disabled={!text.trim() || isOverLimit || isAnimating}
        activeOpacity={0.85}
      >
        <Text style={styles.depositBtnText}>
          {isAnimating ? 'en tránsito' : 'depositar'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.black,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[600],
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: 22,
    color: COLORS.gray[300],
    lineHeight: 24,
  },
  charCount: {
    width: 40,
    alignItems: 'flex-end',
  },
  charText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[400],
  },
  inputContainer: {
    minHeight: 100,
    maxHeight: 200,
    marginBottom: SPACING.sm,
  },
  input: {
    fontFamily: TYPOGRAPHY.display,
    fontSize: FONT_SIZE.lg,
    color: COLORS.white,
    lineHeight: FONT_SIZE.lg * 1.6,
    textAlignVertical: 'top',
    paddingTop: 0,
    paddingBottom: 0,
  },
  errorRow: {
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[300],
  },
  depositBtn: {
    backgroundColor: COLORS.red,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  depositBtnDisabled: {
    backgroundColor: COLORS.gray[600],
  },
  depositBtnText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
