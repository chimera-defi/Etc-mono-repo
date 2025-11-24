import 'package:flutter/material.dart';

void main() {
  runApp(const ValdiFlutterApp());
}

class ValdiFlutterApp extends StatelessWidget {
  const ValdiFlutterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Valdi x Flutter Demo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF8A2BE2)),
        useMaterial3: true,
      ),
      home: const HelloScreen(),
    );
  }
}

class HelloScreen extends StatefulWidget {
  const HelloScreen({super.key});

  @override
  State<HelloScreen> createState() => _HelloScreenState();
}

class _HelloScreenState extends State<HelloScreen> {
  bool _showDetails = false;

  void _toggle() {
    setState(() => _showDetails = !_showDetails);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Hello from Valdi Labs'),
        centerTitle: true,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Flutter says hi!',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              const Text(
                'Exploring parity with our Valdi experiment.',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _showDetails
                    ? const Text(
                        'State toggled - hot reload friendly!',
                        key: ValueKey('details'),
                      )
                    : const Text(
                        'Tap the button to toggle details.',
                        key: ValueKey('prompt'),
                      ),
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: _toggle,
                icon: Icon(_showDetails ? Icons.visibility_off : Icons.visibility),
                label: Text(_showDetails ? 'Hide details' : 'Show details'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
