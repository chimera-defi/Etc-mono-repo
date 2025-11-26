// Widget test for Valdi x Flutter Hello World app.
//
// This tests the basic functionality of the HelloScreen widget,
// verifying the greeting text and toggle button work correctly.

import 'package:flutter_test/flutter_test.dart';

import 'package:hello_flutter/main.dart';

void main() {
  testWidgets('HelloScreen renders greeting and toggle works',
      (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const ValdiFlutterApp());

    // Verify the main greeting text is displayed.
    expect(find.text('Flutter says hi! 👋'), findsOneWidget);
    expect(find.text('Hello from Valdi Labs'), findsOneWidget);

    // Verify the initial prompt is shown.
    expect(find.text('Tap the button to see framework details.'), findsOneWidget);

    // Find and tap the 'Show details' button.
    expect(find.text('Show details'), findsOneWidget);
    await tester.tap(find.text('Show details'));
    
    // Wait for animations to complete.
    await tester.pumpAndSettle();

    // Verify the button text changed.
    expect(find.text('Hide details'), findsOneWidget);
    expect(find.text('Show details'), findsNothing);

    // Verify details content is shown.
    expect(find.text('State toggled successfully!'), findsOneWidget);
    expect(find.text('✓ Hot reload friendly'), findsOneWidget);
  });

  testWidgets('App title is correct', (WidgetTester tester) async {
    await tester.pumpWidget(const ValdiFlutterApp());

    // Verify the app bar title.
    expect(find.text('Hello from Valdi Labs'), findsOneWidget);
  });

  testWidgets('Framework badge is displayed', (WidgetTester tester) async {
    await tester.pumpWidget(const ValdiFlutterApp());

    // Verify the framework badge.
    expect(find.text('Built with Flutter 3.24'), findsOneWidget);
  });
}
