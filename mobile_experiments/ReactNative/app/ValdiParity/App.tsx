/**
 * Valdi x React Native Hello World
 * 
 * Demonstrates framework parity with Valdi and Flutter experiments.
 * Features:
 * - Clean Material-inspired design
 * - State management with hooks
 * - Animations via Animated API
 * - Dark/Light mode support
 * - Cross-platform ready (iOS/Android)
 * 
 * @format
 */

import React, { useState, useRef } from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

// Color palette inspired by Material 3
const Colors = {
  light: {
    primary: '#8A2BE2',
    primaryContainer: '#E9DDFF',
    onPrimaryContainer: '#21005D',
    secondary: '#625B71',
    secondaryContainer: '#E8DEF8',
    onSecondaryContainer: '#1D192B',
    surface: '#FFFBFE',
    surfaceVariant: '#E7E0EC',
    onSurface: '#1C1B1F',
    onSurfaceVariant: '#49454F',
    outline: '#79747E',
  },
  dark: {
    primary: '#D0BCFF',
    primaryContainer: '#4F378B',
    onPrimaryContainer: '#EADDFF',
    secondary: '#CCC2DC',
    secondaryContainer: '#4A4458',
    onSecondaryContainer: '#E8DEF8',
    surface: '#1C1B1F',
    surfaceVariant: '#49454F',
    onSurface: '#E6E1E5',
    onSurfaceVariant: '#CAC4D0',
    outline: '#938F99',
  },
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const colors = isDarkMode ? Colors.dark : Colors.light;

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />
      <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
        <HelloScreen colors={colors} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

interface HelloScreenProps {
  colors: typeof Colors.light;
}

function HelloScreen({ colors }: HelloScreenProps): React.JSX.Element {
  const [showDetails, setShowDetails] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    // Animate button press
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

    // Animate content fade
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowDetails(!showDetails);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.content}>
      {/* App Bar */}
      <View style={[styles.appBar, { borderBottomColor: colors.outline }]}>
        <Text style={[styles.appBarTitle, { color: colors.onSurface }]}>
          Hello from Valdi Labs
        </Text>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Hero Icon */}
        <View style={[styles.heroIcon, { backgroundColor: colors.primaryContainer }]}>
          <Text style={styles.heroIconText}>⚛️</Text>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.onSurface }]}>
          React Native says hi! 👋
        </Text>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Exploring framework parity with our Valdi experiment.
        </Text>

        {/* Animated Content Card */}
        <Animated.View
          style={[
            styles.contentCard,
            showDetails
              ? [styles.contentCardActive, {backgroundColor: colors.secondaryContainer, borderColor: colors.secondary}]
              : [styles.contentCardInactive, {backgroundColor: colors.surfaceVariant}],
            {opacity: fadeAnim},
          ]}>
          {showDetails ? (
            <DetailsContent colors={colors} />
          ) : (
            <PromptContent colors={colors} />
          )}
        </Animated.View>

        {/* Toggle Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleToggle}
            activeOpacity={0.8}>
            <Text style={styles.buttonIcon}>
              {showDetails ? '👁️‍🗨️' : '👁️'}
            </Text>
            <Text style={styles.buttonText}>
              {showDetails ? 'Hide details' : 'Show details'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Framework Badge */}
        <View style={[styles.badge, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.badgeText, { color: colors.onSurfaceVariant }]}>
            💻 Built with React Native 0.82
          </Text>
        </View>
      </View>
    </View>
  );
}

interface ContentProps {
  colors: typeof Colors.light;
}

function PromptContent({ colors }: ContentProps): React.JSX.Element {
  return (
    <View style={styles.promptRow}>
      <Text style={styles.promptIcon}>👆</Text>
      <Text style={[styles.promptText, { color: colors.onSurfaceVariant }]}>
        Tap the button to see framework details.
      </Text>
    </View>
  );
}

function DetailsContent({ colors }: ContentProps): React.JSX.Element {
  const details = [
    '✓ Fast Refresh enabled',
    '✓ TypeScript support',
    '✓ Animation API',
    '✓ Cross-platform ready',
  ];

  return (
    <View>
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsIcon}>✅</Text>
        <Text style={[styles.detailsTitle, { color: colors.onSecondaryContainer }]}>
          State toggled successfully!
        </Text>
      </View>
      {details.map((detail, index) => (
        <Text
          key={index}
          style={[styles.detailItem, { color: colors.onSecondaryContainer }]}>
          {detail}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  appBar: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroIconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  contentCard: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 32,
  },
  contentCardActive: {
    // Active state styles (colors applied inline due to theme)
  },
  contentCardInactive: {
    borderColor: 'transparent',
  },
  promptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  promptText: {
    fontSize: 15,
    flex: 1,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailItem: {
    fontSize: 14,
    paddingVertical: 4,
    paddingLeft: 26,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    bottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default App;
