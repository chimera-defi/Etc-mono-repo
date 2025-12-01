/// Flutter Hello World - Framework Parity Demo
/// Features: Material design, state toggle, animations, dark mode

import 'package:flutter/material.dart';

void main() => runApp(const App());

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hello World',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6750A4)), useMaterial3: true),
      darkTheme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6750A4), brightness: Brightness.dark), useMaterial3: true),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  bool _showDetails = false;
  late final AnimationController _ctrl = AnimationController(duration: const Duration(milliseconds: 100), vsync: this);
  late final Animation<double> _scale = Tween(begin: 1.0, end: 0.95).animate(_ctrl);

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  void _toggle() {
    setState(() => _showDetails = !_showDetails);
    _ctrl.forward().then((_) => _ctrl.reverse());
  }

  @override
  Widget build(BuildContext context) {
    final t = Theme.of(context); final c = t.colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Hello from Valdi Labs'), centerTitle: true),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 72, height: 72,
                decoration: BoxDecoration(color: c.primaryContainer, shape: BoxShape.circle),
                child: const Center(child: Text('📱', style: TextStyle(fontSize: 36))),
              ),
              const SizedBox(height: 20),
              Text('Flutter says hi! 👋', style: t.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('Exploring cross-platform framework parity.', style: TextStyle(color: c.onSurfaceVariant)),
              const SizedBox(height: 24),
              AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _showDetails ? c.secondaryContainer : c.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _showDetails ? c.secondary : Colors.transparent, width: 2),
                ),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 150),
                  child: _showDetails
                    ? Column(key: const ValueKey(1), crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Row(children: [const Text('✅ ', style: TextStyle(fontSize: 18)), Text('State toggled!', style: TextStyle(fontWeight: FontWeight.w600, color: c.onSecondaryContainer))]),
                        const SizedBox(height: 8),
                        for (final s in ['✓ Hot reload', '✓ Type safety', '✓ Animations', '✓ Cross-platform'])
                          Padding(padding: const EdgeInsets.only(left: 26, top: 4), child: Text(s, style: TextStyle(color: c.onSecondaryContainer))),
                      ])
                    : Row(key: const ValueKey(0), children: [const Text('👆 ', style: TextStyle(fontSize: 18)), Text('Tap button to see details', style: TextStyle(color: c.onSurfaceVariant))]),
                ),
              ),
              const SizedBox(height: 24),
              ScaleTransition(
                scale: _scale,
                child: FilledButton(onPressed: _toggle, child: Text(_showDetails ? '👁️ Hide details' : '👁️ Show details')),
              ),
              const SizedBox(height: 48),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: c.surfaceContainerHighest, borderRadius: BorderRadius.circular(16)),
                child: Text('Flutter 3.24', style: TextStyle(fontSize: 12, color: c.onSurfaceVariant)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
