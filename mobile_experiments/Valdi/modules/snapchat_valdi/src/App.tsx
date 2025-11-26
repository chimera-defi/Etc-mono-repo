import { StatefulComponent } from 'valdi_core/src/Component';
import { Label, View } from 'valdi_tsx/src/NativeTemplateElements';
import { Style } from 'valdi_core/src/Style';
import { systemBoldFont, systemFont } from 'valdi_core/src/SystemFont';

/**
 * Valdi Hello World - Framework Parity Demo
 * 
 * Demonstrates framework parity with Flutter, React Native, and Capacitor.
 * Features:
 * - Clean Material-inspired design (Snapchat yellow theme)
 * - State management with StatefulComponent
 * - Toggle functionality
 * - Cross-platform native (iOS/Android/macOS)
 * 
 * NOTE: Style properties are based on documented Valdi APIs (flexbox layout).
 * Some advanced CSS-like properties may need verification against Valdi docs.
 */

/**
 * @ViewModel
 * @ExportModel
 */
export interface AppViewModel {}

/**
 * @Context
 * @ExportModel
 */
export interface AppComponentContext {}

interface State {
  showDetails: boolean;
}

/**
 * @Component
 * @ExportModel
 */
export class App extends StatefulComponent<AppViewModel, AppComponentContext> {
  state: State = {
    showDetails: false,
  };

  onCreate(): void {
    console.log('Valdi Hello World App created!');
  }

  onDestroy(): void {
    console.log('Valdi Hello World App destroyed!');
  }

  private handleToggle = (): void => {
    this.setState({
      showDetails: !this.state.showDetails,
    });
  };

  onRender(): void {
    <view style={styles.container}>
      {/* App Bar */}
      <view style={styles.appBar}>
        <label style={styles.appBarTitle} value="Hello from Valdi Labs" />
      </view>

      {/* Main Content */}
      <view style={styles.mainContent}>
        {/* Hero Icon */}
        <view style={styles.heroIcon}>
          <label style={styles.heroEmoji} value="👻" />
        </view>

        {/* Title */}
        <label style={styles.title} value="Valdi says hi! 👋" />

        {/* Subtitle */}
        <label 
          style={styles.subtitle} 
          value="Exploring framework parity with Flutter & React Native." 
        />

        {/* Content Card */}
        <view style={this.state.showDetails ? styles.contentCardActive : styles.contentCard}>
          {this.state.showDetails ? this.renderDetails() : this.renderPrompt()}
        </view>

        {/* Toggle Button */}
        <view style={styles.button} onPress={this.handleToggle}>
          <label 
            style={styles.buttonText} 
            value={this.state.showDetails ? '👁️‍🗨️ Hide details' : '👁️ Show details'} 
          />
        </view>

        {/* Framework Badge */}
        <view style={styles.badge}>
          <label style={styles.badgeText} value="💻 Built with Valdi (Snapchat)" />
        </view>
      </view>
    </view>;
  }

  private renderPrompt(): void {
    <view style={styles.promptRow}>
      <label style={styles.promptIcon} value="👆" />
      <label style={styles.promptText} value="Tap the button to see framework details." />
    </view>;
  }

  private renderDetails(): void {
    <view style={styles.detailsContent}>
      <view style={styles.detailsHeader}>
        <label style={styles.detailsIcon} value="✅" />
        <label style={styles.detailsTitle} value="State toggled successfully!" />
      </view>
      <label style={styles.detailItem} value="✓ True native performance" />
      <label style={styles.detailItem} value="✓ TypeScript type safety" />
      <label style={styles.detailItem} value="✓ Hot reload support" />
      <label style={styles.detailItem} value="✓ iOS, Android, macOS" />
    </view>;
  }
}

// Color palette (Snapchat-inspired with Material 3 touches)
const colors = {
  primary: '#FFFC00',      // Snapchat Yellow
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  onSurface: '#050505',
  onSurfaceVariant: '#666666',
  secondary: '#8A2BE2',    // BlueViolet
  secondaryContainer: '#E9DDFF',
  onSecondaryContainer: '#21005D',
};

// Styles using documented Valdi flexbox properties
// NOTE: Properties like boxShadow, position, maxWidth need Valdi CLI verification
const styles = {
  container: new Style<View>({
    backgroundColor: colors.primary,
    flex: 1,
  }),
  
  // App Bar
  appBar: new Style<View>({
    paddingTop: 60,
    paddingBottom: 16,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
  }),
  appBarTitle: new Style<Label>({
    color: colors.onSurface,
    font: systemBoldFont(20),
  }),
  
  // Main Content
  mainContent: new Style<View>({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 80,
  }),
  
  // Hero Icon
  heroIcon: new Style<View>({
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  }),
  heroEmoji: new Style<Label>({
    font: systemFont(40),
  }),
  
  // Typography
  title: new Style<Label>({
    color: colors.onSurface,
    font: systemBoldFont(26),
    marginBottom: 12,
    textAlign: 'center',
  }),
  subtitle: new Style<Label>({
    color: colors.onSurfaceVariant,
    font: systemFont(16),
    marginBottom: 32,
    textAlign: 'center',
  }),
  
  // Content Card (Default)
  contentCard: new Style<View>({
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 32,
    marginLeft: 16,
    marginRight: 16,
  }),
  
  // Content Card (Active/Details shown)
  contentCardActive: new Style<View>({
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.secondaryContainer,
    borderWidth: 2,
    borderColor: colors.secondary,
    marginBottom: 32,
    marginLeft: 16,
    marginRight: 16,
  }),
  
  // Prompt Content
  promptRow: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  promptIcon: new Style<Label>({
    font: systemFont(20),
    marginRight: 12,
  }),
  promptText: new Style<Label>({
    color: colors.onSurfaceVariant,
    font: systemFont(15),
    flex: 1,
  }),
  
  // Details Content
  detailsContent: new Style<View>({
    alignItems: 'flex-start',
  }),
  detailsHeader: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  }),
  detailsIcon: new Style<Label>({
    font: systemFont(18),
    marginRight: 8,
  }),
  detailsTitle: new Style<Label>({
    color: colors.onSecondaryContainer,
    font: systemBoldFont(16),
  }),
  detailItem: new Style<Label>({
    color: colors.onSecondaryContainer,
    font: systemFont(14),
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 26,
  }),
  
  // Button
  button: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 28,
    paddingRight: 28,
    borderRadius: 24,
    backgroundColor: colors.secondary,
  }),
  buttonText: new Style<Label>({
    color: '#FFFFFF',
    font: systemBoldFont(16),
  }),
  
  // Badge (at bottom of screen)
  badge: new Style<View>({
    marginTop: 32,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
  }),
  badgeText: new Style<Label>({
    color: colors.onSurfaceVariant,
    font: systemFont(12),
  }),
};
