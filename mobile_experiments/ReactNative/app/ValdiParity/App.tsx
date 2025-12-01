/**
 * React Native Hello World - Framework Parity Demo
 * Features: Material design, state toggle, animations, dark mode
 */

import React, {useState, useRef} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity, View, useColorScheme} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';

const theme = {
  light: {
    primary: '#6750A4', secondary: '#625B71', surface: '#FFFBFE', surfaceVariant: '#E7E0EC',
    secondaryContainer: '#E8DEF8', onSurface: '#1C1B1F', onSurfaceVariant: '#49454F',
    onSecondaryContainer: '#1D192B', primaryContainer: '#EADDFF', outline: '#79747E',
  },
  dark: {
    primary: '#D0BCFF', secondary: '#CCC2DC', surface: '#1C1B1F', surfaceVariant: '#49454F',
    secondaryContainer: '#4A4458', onSurface: '#E6E1E5', onSurfaceVariant: '#CAC4D0',
    onSecondaryContainer: '#E8DEF8', primaryContainer: '#4F378B', outline: '#938F99',
  },
};

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const c = isDark ? theme.dark : theme.light;
  const [showDetails, setShowDetails] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const toggle = () => {
    Animated.timing(scaleAnim, {toValue: 0.95, duration: 100, useNativeDriver: true}).start(() =>
      Animated.timing(scaleAnim, {toValue: 1, duration: 100, useNativeDriver: true}).start()
    );
    Animated.timing(fadeAnim, {toValue: 0, duration: 150, useNativeDriver: true}).start(() => {
      setShowDetails(s => !s);
      Animated.timing(fadeAnim, {toValue: 1, duration: 150, useNativeDriver: true}).start();
    });
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, {backgroundColor: c.surface}]}>
        <View style={[styles.appBar, {borderBottomColor: c.outline}]}>
          <Text style={[styles.appBarTitle, {color: c.onSurface}]}>Hello from Valdi Labs</Text>
        </View>
        <View style={styles.content}>
          <View style={[styles.heroIcon, {backgroundColor: c.primaryContainer}]}>
            <Text style={styles.heroEmoji}>📱</Text>
          </View>
          <Text style={[styles.title, {color: c.onSurface}]}>React Native says hi! 👋</Text>
          <Text style={[styles.subtitle, {color: c.onSurfaceVariant}]}>
            Exploring cross-platform framework parity.
          </Text>
          <Animated.View style={[styles.card, {opacity: fadeAnim, backgroundColor: showDetails ? c.secondaryContainer : c.surfaceVariant, borderColor: showDetails ? c.secondary : 'transparent'}]}>
            {showDetails ? (
              <View>
                <View style={styles.row}><Text style={styles.icon}>✅</Text><Text style={[styles.cardTitle, {color: c.onSecondaryContainer}]}>State toggled!</Text></View>
                {['✓ Hot reload', '✓ Type safety', '✓ Animations', '✓ Cross-platform'].map((t, i) => (
                  <Text key={i} style={[styles.detail, {color: c.onSecondaryContainer}]}>{t}</Text>
                ))}
              </View>
            ) : (
              <View style={styles.row}><Text style={styles.icon}>👆</Text><Text style={[styles.prompt, {color: c.onSurfaceVariant}]}>Tap button to see details</Text></View>
            )}
          </Animated.View>
          <Animated.View style={{transform: [{scale: scaleAnim}]}}>
            <TouchableOpacity style={[styles.button, {backgroundColor: c.primary}]} onPress={toggle}>
              <Text style={styles.buttonText}>{showDetails ? '👁️ Hide' : '👁️ Show'} details</Text>
            </TouchableOpacity>
          </Animated.View>
          <View style={[styles.badge, {backgroundColor: c.surfaceVariant}]}>
            <Text style={[styles.badgeText, {color: c.onSurfaceVariant}]}>React Native 0.82</Text>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  appBar: {padding: 16, borderBottomWidth: 1, alignItems: 'center'},
  appBarTitle: {fontSize: 18, fontWeight: '600'},
  content: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24},
  heroIcon: {width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 20},
  heroEmoji: {fontSize: 36},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 8},
  subtitle: {fontSize: 15, textAlign: 'center', marginBottom: 24},
  card: {width: '100%', padding: 16, borderRadius: 12, borderWidth: 2, marginBottom: 24},
  row: {flexDirection: 'row', alignItems: 'center'},
  icon: {fontSize: 18, marginRight: 8},
  cardTitle: {fontSize: 15, fontWeight: '600'},
  prompt: {fontSize: 14},
  detail: {fontSize: 14, marginLeft: 26, marginTop: 4},
  button: {paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20},
  buttonText: {color: '#FFF', fontSize: 15, fontWeight: '600'},
  badge: {position: 'absolute', bottom: 16, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16},
  badgeText: {fontSize: 12},
});
