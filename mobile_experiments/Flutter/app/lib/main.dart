/// Flutter Hello World - Framework Parity Demo
/// Features: Material design, state toggle, animations, dark mode

import 'package:flutter/material.dart';

void main() {
  runApp(const App());
}

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hello World',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6750A4)),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6750A4),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  bool _showDetails = false;
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;

  static const _details = [
    '✓ Hot reload',
    '✓ Type safety',
    '✓ Animations',
    '✓ Cross-platform',
  ];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 100),
      vsync: this,
    );
    _scaleAnimation = Tween(begin: 1.0, end: 0.95).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggle() {
    setState(() => _showDetails = !_showDetails);
    _controller.forward().then((_) => _controller.reverse());
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final colors = theme.colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Hello from Valdi Labs'),
        centerTitle: true,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Hero Icon
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: colors.primaryContainer,
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Text('📱', style: TextStyle(fontSize: 36)),
                ),
              ),
              const SizedBox(height: 20),

              // Title
              Text(
                'Flutter says hi! 👋',
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),

              // Subtitle
              Text(
                'Exploring cross-platform framework parity.',
                style: TextStyle(color: colors.onSurfaceVariant),
              ),
              const SizedBox(height: 24),

              // Content Card
              AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _showDetails
                      ? colors.secondaryContainer
                      : colors.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _showDetails ? colors.secondary : Colors.transparent,
                    width: 2,
                  ),
                ),
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 150),
                  child: _showDetails
                      ? _buildDetailsContent(colors)
                      : _buildPromptContent(colors),
                ),
              ),
              const SizedBox(height: 24),

              // Toggle Button
              ScaleTransition(
                scale: _scaleAnimation,
                child: FilledButton(
                  onPressed: _toggle,
                  child: Text(
                    _showDetails ? '👁️ Hide details' : '👁️ Show details',
                  ),
                ),
              ),
              const SizedBox(height: 48),

              // Framework Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: colors.surfaceContainerHighest,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Text(
                  'Flutter 3.24',
                  style: TextStyle(fontSize: 12, color: colors.onSurfaceVariant),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPromptContent(ColorScheme colors) {
    return Row(
      key: const ValueKey('prompt'),
      children: [
        const Text('👆 ', style: TextStyle(fontSize: 18)),
        Text(
          'Tap button to see details',
          style: TextStyle(color: colors.onSurfaceVariant),
        ),
      ],
    );
  }

  Widget _buildDetailsContent(ColorScheme colors) {
    return Column(
      key: const ValueKey('details'),
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Text('✅ ', style: TextStyle(fontSize: 18)),
            Text(
              'State toggled!',
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: colors.onSecondaryContainer,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        for (final item in _details)
          Padding(
            padding: const EdgeInsets.only(left: 26, top: 4),
            child: Text(
              item,
              style: TextStyle(color: colors.onSecondaryContainer),
            ),
          ),
      ],
    );
  }
}
