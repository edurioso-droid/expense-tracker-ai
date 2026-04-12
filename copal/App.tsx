import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar, SafeAreaView, Platform } from 'react-native';
import { SplashScreen } from './src/components/SplashScreen';
import { Feed } from './src/components/Feed';
import { DepositDrawer } from './src/components/DepositDrawer';
import { COLORS } from './src/constants/theme';
import { getOrCreateSession } from './src/lib/identity';

type AppState = 'splash' | 'feed';

export default function App() {
  const [screen, setScreen] = useState<AppState>('splash');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // Inicializar sesion anonima al arrancar
    getOrCreateSession().catch(() => {});
  }, []);

  const handleSplashOpen = useCallback(() => {
    setScreen('feed');
    // Abrir drawer inmediatamente — el splash es una invitacion a escribir
    setTimeout(() => setDrawerOpen(true), 300);
  }, []);

  const handleOpenDeposit = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.black}
        translucent={Platform.OS === 'android'}
      />

      {screen === 'splash' ? (
        <SplashScreen onOpen={handleSplashOpen} />
      ) : (
        <SafeAreaView style={styles.safe}>
          <Feed onOpenDeposit={handleOpenDeposit} />
          <DepositDrawer
            visible={drawerOpen}
            onClose={handleCloseDrawer}
          />
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  safe: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
});
