/**
 * Valdi x React Native Hello World
 * Features: Material design, state management, animations, dark mode
 * @format
 */

import React, {useState, useRef} from 'react';
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

const Colors = {
  light: {
    primary: '#8A2BE2',
    primaryContainer: '#E9DDFF',
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

export default function App(): React.JSX.Element {
  const isDark = useColorScheme() === 'dark';
  const c = isDark ? Colors.dark : Colors.light;
  const [showDetails, setShowDetails] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {toValue: 0.95, duration: 100, useNativeDriver: true}),
      Animated.timing(scaleAnim, {toValue: 1, duration: 100, useNativeDriver: true}),
    ]).start();

    Animated.timing(fadeAnim, {toValue: 0, duration: 150, useNativeDriver: true}).start(() => {
      setShowDetails(!showDetails);
      Animated.timing(fadeAnim, {toValue: 1, duration: 150, useNativeDriver: true}).start();
    });
  };

  const details = ['✓ Fast Refresh enabled', '✓ TypeScript support', '✓ Animation API', '✓ Cross-platform ready'];

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={c.surface} />
      <SafeAreaView style={[styles.container, {backgroundColor: c.surface}]}>
        {/* App Bar */}
        <View style={[styles.appBar, {borderBottomColor: c.outline}]}>
          <Text style={[styles.appBarTitle, {color: c.onSurface}]}>Hello from Valdi Labs</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={[styles.heroIcon, {backgroundColor: c.primaryContainer}]}>
            <Text style={styles.heroIconText}>⚛️</Text>
          </View>

          <Text style={[styles.title, {color: c.onSurface}]}>React Native says hi! 👋</Text>
          <Text style={[styles.subtitle, {color: c.onSurfaceVariant}]}>
            Exploring framework parity with our Valdi experiment.
          </Text>

          {/* Content Card */}
          <Animated.View
            style={[
              styles.contentCard,
              {
                backgroundColor: showDetails ? c.secondaryContainer : c.surfaceVariant,
                borderColor: showDetails ? c.secondary : 'transparent',
                opacity: fadeAnim,
              },
            ]}>
            {showDetails ? (
              <View>
                <View style={styles.detailsHeader}>
                  <Text style={styles.detailsIcon}>✅</Text>
                  <Text style={[styles.detailsTitle, {color: c.onSecondaryContainer}]}>
                    State toggled successfully!
                  </Text>
                </View>
                {details.map((d, i) => (
                  <Text key={i} style={[styles.detailItem, {color: c.onSecondaryContainer}]}>{d}</Text>
                ))}
              </View>
            ) : (
              <View style={styles.promptRow}>
                <Text style={styles.promptIcon}>👆</Text>
                <Text style={[styles.promptText, {color: c.onSurfaceVariant}]}>
                  Tap the button to see framework details.
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Toggle Button */}
          <Animated.View style={{transform: [{scale: scaleAnim}]}}>
            <TouchableOpacity style={[styles.button, {backgroundColor: c.primary}]} onPress={handleToggle}>
              <Text style={styles.buttonIcon}>{showDetails ? '👁️‍🗨️' : '👁️'}</Text>
              <Text style={styles.buttonText}>{showDetails ? 'Hide details' : 'Show details'}</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Badge */}
          <View style={[styles.badge, {backgroundColor: c.surfaceVariant}]}>
            <Text style={[styles.badgeText, {color: c.onSurfaceVariant}]}>💻 Built with React Native 0.82</Text>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  appBar: {paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, alignItems: 'center'},
  appBarTitle: {fontSize: 20, fontWeight: '600'},
  mainContent: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  heroIcon: {width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24},
  heroIconText: {fontSize: 40},
  title: {fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 12},
  subtitle: {fontSize: 16, textAlign: 'center', marginBottom: 32, lineHeight: 24},
  contentCard: {width: '100%', padding: 16, borderRadius: 16, borderWidth: 2, marginBottom: 32},
  promptRow: {flexDirection: 'row', alignItems: 'center'},
  promptIcon: {fontSize: 20, marginRight: 12},
  promptText: {fontSize: 15, flex: 1},
  detailsHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  detailsIcon: {fontSize: 18, marginRight: 8},
  detailsTitle: {fontSize: 16, fontWeight: '600'},
  detailItem: {fontSize: 14, paddingVertical: 4, paddingLeft: 26},
  button: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, paddingHorizontal: 28, borderRadius: 24,
    elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.15, shadowRadius: 4,
  },
  buttonIcon: {fontSize: 18, marginRight: 8},
  buttonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},
  badge: {position: 'absolute', bottom: 20, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20},
  badgeText: {fontSize: 12, fontWeight: '500'},
});
