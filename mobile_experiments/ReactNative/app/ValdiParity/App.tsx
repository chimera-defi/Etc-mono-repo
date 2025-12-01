/**
 * React Native Hello World - Framework Parity Demo
 * Features: Material design, state toggle, animations, dark mode
 */

import React, { useState, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const theme = {
  light: {
    primary: '#6750A4',
    secondary: '#625B71',
    surface: '#FFFBFE',
    surfaceVariant: '#E7E0EC',
    secondaryContainer: '#E8DEF8',
    onSurface: '#1C1B1F',
    onSurfaceVariant: '#49454F',
    onSecondaryContainer: '#1D192B',
    primaryContainer: '#EADDFF',
    outline: '#79747E',
  },
  dark: {
    primary: '#D0BCFF',
    secondary: '#CCC2DC',
    surface: '#1C1B1F',
    surfaceVariant: '#49454F',
    secondaryContainer: '#4A4458',
    onSurface: '#E6E1E5',
    onSurfaceVariant: '#CAC4D0',
    onSecondaryContainer: '#E8DEF8',
    primaryContainer: '#4F378B',
    outline: '#938F99',
  },
};

const details = [
  '✓ Hot reload',
  '✓ Type safety',
  '✓ Animations',
  '✓ Cross-platform',
];

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const colors = isDark ? theme.dark : theme.light;
  const [showDetails, setShowDetails] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const toggle = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Content fade animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowDetails(prev => !prev);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
        {/* App Bar */}
        <View style={[styles.appBar, { borderBottomColor: colors.outline }]}>
          <Text style={[styles.appBarTitle, { color: colors.onSurface }]}>
            Hello from Valdi Labs
          </Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Hero Icon */}
          <View style={[styles.heroIcon, { backgroundColor: colors.primaryContainer }]}>
            <Text style={styles.heroEmoji}>📱</Text>
          </View>

          {/* Title & Subtitle */}
          <Text style={[styles.title, { color: colors.onSurface }]}>
            React Native says hi! 👋
          </Text>
          <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
            Exploring cross-platform framework parity.
          </Text>

          {/* Content Card */}
          <Animated.View
            style={[
              styles.card,
              {
                opacity: fadeAnim,
                backgroundColor: showDetails
                  ? colors.secondaryContainer
                  : colors.surfaceVariant,
                borderColor: showDetails ? colors.secondary : 'transparent',
              },
            ]}
          >
            {showDetails ? (
              <View>
                <View style={styles.row}>
                  <Text style={styles.icon}>✅</Text>
                  <Text style={[styles.cardTitle, { color: colors.onSecondaryContainer }]}>
                    State toggled!
                  </Text>
                </View>
                {details.map((item, index) => (
                  <Text
                    key={index}
                    style={[styles.detailItem, { color: colors.onSecondaryContainer }]}
                  >
                    {item}
                  </Text>
                ))}
              </View>
            ) : (
              <View style={styles.row}>
                <Text style={styles.icon}>👆</Text>
                <Text style={[styles.prompt, { color: colors.onSurfaceVariant }]}>
                  Tap button to see details
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Toggle Button */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={toggle}
            >
              <Text style={styles.buttonText}>
                {showDetails ? '👁️ Hide details' : '👁️ Show details'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Framework Badge */}
          <View style={[styles.badge, { backgroundColor: colors.surfaceVariant }]}>
            <Text style={[styles.badgeText, { color: colors.onSurfaceVariant }]}>
              React Native 0.82
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  prompt: {
    fontSize: 14,
  },
  detailItem: {
    fontSize: 14,
    marginLeft: 26,
    marginTop: 4,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    bottom: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
  },
});
