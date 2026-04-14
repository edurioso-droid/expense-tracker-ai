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
const HIDDEN_BOTTOM = -800;

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

  // drawerBottom: de HIDDEN_BOTTOM (-800) a 0 cuando visible
  // keyboardHeight: 0 cuando cerrado, altura del teclado cuando abierto
  // El container usa Animated.add(drawerBottom, keyboardHeight) como `bottom`
  // Asi el drawer sube exactamente con el teclado, sin calculos extra
  const drawerBottom = useRef(new Animated.Value(HIDDEN_BOTTOM)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const { addToFeed } = useDepositStore();

  // Escuchar eventos del teclado y animar keyboardHeight
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 250,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? (e.duration || 250) : 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Slide in/out del drawer
  useEffect(() => {
    if (visible) {
      Animated.spring(drawerBottom, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: false,
      }).start(() => {
        inputRef.current?.focus();
      });
    } else {
      Keyboard.dismiss();
      Animated.timing(drawerBottom, {
        toValue: HIDDEN_BOTTOM,
        duration: 280,
        useNativeDriver: false,
      }).start(() => {
        setText('');
        setMood('idle');
        setErrorMsg(null);
      });
    }
  }, [visible]);

  // Mood reactivo al texto
  useEffect(() => {
    setMood(text.length > 0 ? 'listening' : 'idle');
  }, [text]);

  const handleDeposit = useCallback(async () => {
    if (!text.trim() || isAnimating) return;

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

    addToFeed(deposit);
    recordDeposit();
    await incrementDepositCount();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    moderateDeposit(text.trim()).then((result) => {
      const { updateStatus } = useDepositStore.getState();
      if (result.status === 'ok') {
        updateStatus(deposit.id, 'ok');
      } else {
        updateStatus(deposit.id, result.status === 'rejected' ? 'rejected' : 'review');
      }
    });

    setMood('accepting');

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

  // bottom = drawerBottom + keyboardHeight
  // Cuando teclado sube 300px: bottom pasa de 0 → 300, el drawer sube con el
  const animatedBottom = Animated.add(drawerBottom, keyboardHeight);

  return (
    <Animated.View style={[styles.container, { bottom: animatedBottom }]}>
      {/* Header — siempre visible, fuera del area afectada por teclado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
        <AIEntity mood={mood} size="sm" />
        <View style={styles.charCount}>
          <Text style={[styles.charText, isOverLimit && { color: COLORS.red }]}>
            {charsLeft}
          </Text>
        </View>
      </View>

      {/* Input area */}
      <ScrollView
        style={styles.inputScroll}
        contentContainerStyle={styles.inputScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isAnimating && mood === 'accepting' ? (
          <SkinAnimation skinId={selectedSkin} text={text} />
        ) : (
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="deposita lo que sea real"
            placeholderTextColor={COLORS.gray[400]}
            multiline
            maxLength={MAX_CHARS + 20}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardAppearance="dark"
            scrollEnabled={false}
            selectionColor={COLORS.red}
          />
        )}
      </ScrollView>

      {errorMsg && (
        <View style={styles.errorRow}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      <SkinSelector selected={selectedSkin} onSelect={setSelectedSkin} />

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
    left: 0,
    right: 0,
    backgroundColor: COLORS.black,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[500],
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
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
    color: COLORS.gray[200],
    lineHeight: 24,
  },
  charCount: {
    width: 40,
    alignItems: 'flex-end',
  },
  charText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.xs,
    color: COLORS.gray[300],
  },
  inputScroll: {
    minHeight: 90,
    maxHeight: 180,
    marginBottom: SPACING.sm,
  },
  inputScrollContent: {
    flexGrow: 1,
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
    color: COLORS.gray[200],
  },
  depositBtn: {
    backgroundColor: COLORS.red,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  depositBtnDisabled: {
    backgroundColor: COLORS.gray[500],
  },
  depositBtnText: {
    fontFamily: TYPOGRAPHY.mono,
    fontSize: FONT_SIZE.sm,
    color: COLORS.white,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
