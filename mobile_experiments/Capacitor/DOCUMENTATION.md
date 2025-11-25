# Capacitor Framework Documentation

## Overview

**Capacitor** is a modern cross-platform app runtime that allows you to build native iOS, Android, and web apps using web technologies (HTML, CSS, JavaScript). It's the successor to PhoneGap/Cordova and is actively maintained by the Ionic team.

## Key Information

### What is Capacitor?
- **Type**: Web-to-native app runtime
- **Developer**: Ionic Team
- **Status**: Mature, actively maintained
- **Successor to**: PhoneGap/Cordova
- **Relationship**: Ionic Framework uses Capacitor under the hood

### Platform Support
- ✅ iOS
- ✅ Android
- ✅ Web (PWA)
- ✅ Electron (Desktop)

### Framework Support
Capacitor works with **any** web framework:
- ✅ React
- ✅ Vue
- ✅ Angular
- ✅ Svelte
- ✅ Vanilla JavaScript
- ✅ Any other web framework

## Architecture

### How It Works
1. **Web Application**: Build your app using any web framework
2. **Capacitor Wrapper**: Capacitor wraps your web app in a native container
3. **Native Bridge**: JavaScript APIs bridge to native device features
4. **Native Apps**: Outputs native iOS and Android apps

### Components
- **Capacitor Core**: JavaScript runtime and plugin system
- **Native Platforms**: iOS and Android native projects
- **Plugins**: Access to device features (camera, GPS, etc.)
- **CLI**: Command-line tools for development

## Installation

### Prerequisites
- **Node.js**: v14 or higher
- **npm** or **yarn**: Package manager
- **For iOS**: macOS with Xcode
- **For Android**: Android Studio and Android SDK

### Install Capacitor CLI
```bash
npm install @capacitor/core @capacitor/cli
```

### Initialize Project
```bash
npx cap init
```

When prompted:
- **App name**: Your app name
- **App ID**: Reverse domain notation (e.g., `com.example.myapp`)
- **Web dir**: Path to your built web app (e.g., `dist`, `build`)

## Project Structure

```
my-capacitor-app/
├── app/                    # Your web application
│   ├── src/               # Source files
│   ├── dist/              # Build output (webDir)
│   └── package.json
├── ios/                    # iOS native project (generated)
├── android/                # Android native project (generated)
├── capacitor.config.json   # Capacitor configuration
└── package.json           # Capacitor dependencies
```

## Configuration

### capacitor.config.json
```json
{
  "appId": "com.example.myapp",
  "appName": "MyApp",
  "webDir": "app/dist",
  "bundledWebRuntime": false,
  "server": {
    "androidScheme": "https"
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000
    }
  }
}
```

### Key Configuration Options
- **appId**: Unique identifier for your app
- **appName**: Display name
- **webDir**: Path to built web app
- **bundledWebRuntime**: Include Capacitor runtime in bundle
- **server**: Development server configuration
- **plugins**: Plugin-specific configurations

## Adding Platforms

### iOS
```bash
npm install @capacitor/ios
npx cap add ios
npx cap sync
npx cap open ios
```

### Android
```bash
npm install @capacitor/android
npx cap add android
npx cap sync
npx cap open android
```

## Development Workflow

### 1. Develop Web App
```bash
cd app
npm run dev  # Or your framework's dev command
```

### 2. Build Web App
```bash
cd app
npm run build  # Builds to dist/ or build/
```

### 3. Sync to Native
```bash
npx cap sync
```

### 4. Run on Device/Simulator
```bash
# iOS
npx cap open ios
# Then run from Xcode

# Android
npx cap open android
# Then run from Android Studio
```

## Native Plugins

### Installing Plugins
```bash
npm install @capacitor/plugin-name
npx cap sync
```

### Using Plugins

#### Camera Example
```javascript
import { Camera } from '@capacitor/camera';

const takePhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: 'base64'
  });
  return image;
};
```

#### Geolocation Example
```javascript
import { Geolocation } from '@capacitor/geolocation';

const getLocation = async () => {
  const position = await Geolocation.getCurrentPosition();
  return position;
};
```

#### Device Info Example
```javascript
import { Device } from '@capacitor/device';

const getInfo = async () => {
  const info = await Device.getInfo();
  console.log('Platform:', info.platform);
  console.log('Model:', info.model);
  return info;
};
```

### Available Plugins
- **Camera**: Take photos and videos
- **Geolocation**: Get device location
- **Device**: Device information
- **Filesystem**: File system access
- **Storage**: Key-value storage
- **Network**: Network status
- **Push Notifications**: Push notifications
- **App**: App lifecycle events
- **Keyboard**: Keyboard events
- **Status Bar**: Status bar control
- **Splash Screen**: Splash screen control
- And many more...

See: https://capacitorjs.com/docs/plugins

## Platform-Specific Setup

### iOS Setup
1. Install Xcode from Mac App Store
2. Install Command Line Tools: `xcode-select --install`
3. Open project: `npx cap open ios`
4. Configure signing in Xcode
5. Select simulator and run

### Android Setup
1. Install Android Studio
2. Install Android SDK
3. Set environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
4. Open project: `npx cap open android`
5. Set up emulator or connect device
6. Run from Android Studio

## Common Commands

```bash
# Initialize Capacitor
npx cap init

# Add platform
npx cap add ios
npx cap add android

# Sync web app to native
npx cap sync

# Copy web app (without updating native dependencies)
npx cap copy

# Update native dependencies
npx cap update

# Open in native IDE
npx cap open ios
npx cap open android

# Check Capacitor version
npx cap --version

# List installed plugins
npx cap ls
```

## Performance Considerations

### WebView Performance
- Capacitor uses WebView, which has performance overhead
- Optimize your web app for performance
- Use native plugins for performance-critical features
- Consider lazy loading and code splitting

### App Size
- Capacitor apps are larger than pure native apps
- WebView runtime adds to app size
- Optimize assets and use compression

### Startup Time
- WebView initialization adds startup time
- Minimize initial bundle size
- Use lazy loading for non-critical code

## Best Practices

### 1. Optimize Web App
- Minimize bundle size
- Use code splitting
- Optimize images
- Minimize dependencies

### 2. Use Native Plugins
- Use native plugins for device features
- Don't try to replicate native features in JavaScript
- Leverage platform capabilities

### 3. Handle Platform Differences
- Test on both iOS and Android
- Handle platform-specific behavior
- Use Capacitor's platform detection

### 4. Development Workflow
- Develop and test web app in browser first
- Use `npx cap sync` after building
- Test on real devices, not just simulators

### 5. Debugging
- Use browser DevTools for web code
- Use native IDEs (Xcode/Android Studio) for native issues
- Use Capacitor's logging utilities

## Limitations

### Performance
- WebView overhead compared to native
- May not match native app performance
- Larger app size than native apps

### Native Feel
- Depends on your web app's design
- May not feel 100% native
- Requires careful UI/UX design

### Platform Features
- Some platform features may require custom native code
- Not all native APIs are available via plugins
- Platform differences need handling

## When to Use Capacitor

### Good Use Cases
- ✅ Existing web apps that need mobile versions
- ✅ Teams with web development expertise
- ✅ Apps that don't need extreme performance
- ✅ Rapid prototyping and MVP development
- ✅ Apps with shared web/mobile codebase

### Not Ideal For
- ❌ Performance-critical apps (games, heavy animations)
- ❌ Apps requiring extensive native code
- ❌ Apps needing platform-specific UI/UX
- ❌ Apps with strict size constraints

## Comparison with Alternatives

### vs React Native
- **Code Reuse**: Capacitor (100%) vs React Native (~70-80%)
- **Performance**: Capacitor (WebView) vs React Native (Native)
- **Learning Curve**: Capacitor (Easy for web devs) vs React Native (Moderate)

### vs Flutter
- **Code Reuse**: Capacitor (100% web) vs Flutter (0% - Dart)
- **Performance**: Capacitor (WebView) vs Flutter (Native)
- **Learning Curve**: Capacitor (Easy for web devs) vs Flutter (Moderate - Dart)

### vs PWAs
- **Distribution**: Capacitor (App stores) vs PWA (Web + tools)
- **Native Access**: Capacitor (Full) vs PWA (Limited)
- **Updates**: Capacitor (App store) vs PWA (Instant)

## Resources

### Official Resources
- **Website**: https://capacitorjs.com
- **Documentation**: https://capacitorjs.com/docs
- **GitHub**: https://github.com/ionic-team/capacitor
- **Plugins**: https://capacitorjs.com/docs/plugins
- **Community**: https://github.com/ionic-team/capacitor/discussions

### Getting Started
- **Getting Started Guide**: https://capacitorjs.com/docs/getting-started
- **iOS Setup**: https://capacitorjs.com/docs/ios
- **Android Setup**: https://capacitorjs.com/docs/android

### Examples
- **Official Examples**: Check GitHub repository
- **Ionic Examples**: https://ionicframework.com/docs (uses Capacitor)

## Notes

*Add implementation findings, gotchas, and tips here*

### Implementation Notes
- [To be filled during implementation]

### Gotchas
- [To be filled during implementation]

### Tips & Tricks
- [To be filled during implementation]

---

**Last Updated**: Initial documentation
**Status**: To be updated during implementation
**Next Update**: After Hello World implementation
