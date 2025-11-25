# Capacitor Setup Guide

## Prerequisites

### Required Software

#### For All Platforms
- **Node.js**: v14 or higher
  - Download: https://nodejs.org
  - Verify: `node --version`
- **npm** or **yarn**: Package manager (comes with Node.js)
  - Verify: `npm --version`

#### For iOS Development
- **macOS**: Required (iOS development only works on Mac)
- **Xcode**: Latest version from Mac App Store
  - Includes iOS Simulator
  - Includes Command Line Tools
- **Command Line Tools**: `xcode-select --install`
- **CocoaPods**: `sudo gem install cocoapods` (usually auto-installed)

#### For Android Development
- **Android Studio**: Latest version
  - Download: https://developer.android.com/studio
  - Includes Android SDK and emulator
- **Android SDK**: Installed via Android Studio
- **Java Development Kit (JDK)**: Usually included with Android Studio
- **Environment Variables**:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/tools
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```
  Add to `~/.bashrc` or `~/.zshrc`

## Project Setup

### Step 1: Create Web Application

Choose one of the following approaches:

#### Option A: Vanilla JavaScript (Simplest)
```bash
mkdir -p app
cd app
npm init -y
# Create index.html, main.js, styles.css manually
```

#### Option B: React (Popular)
```bash
# Using Vite (recommended)
npm create vite@latest app -- --template react
cd app
npm install

# OR using Create React App
npx create-react-app app
cd app
```

#### Option C: Vue (Lightweight)
```bash
npm create vite@latest app -- --template vue
cd app
npm install
```

#### Option D: Angular (Enterprise)
```bash
ng new app
cd app
```

### Step 2: Install Capacitor

From the Capacitor project root (not the app directory):

```bash
# Install Capacitor CLI and core
npm install @capacitor/core @capacitor/cli

# Verify installation
npx cap --version
```

### Step 3: Initialize Capacitor

```bash
# From Capacitor project root
npx cap init
```

When prompted:
- **App name**: `CapacitorHelloWorld` (or your choice)
- **App ID**: `com.example.capacitorhelloworld` (use reverse domain notation)
- **Web dir**: `app/dist` (or `app/build` depending on your build tool)

This creates `capacitor.config.json`.

### Step 4: Configure Capacitor

Edit `capacitor.config.json`:

```json
{
  "appId": "com.example.capacitorhelloworld",
  "appName": "CapacitorHelloWorld",
  "webDir": "app/dist",
  "bundledWebRuntime": false
}
```

**Important**: Ensure `webDir` matches your web app's build output directory:
- Vite: `dist`
- Create React App: `build`
- Vue CLI: `dist`
- Angular: `dist`
- Custom: Your build output folder

### Step 5: Build Web Application

```bash
cd app
npm run build
# Verify build output exists in dist/ or build/
```

### Step 6: Add Native Platforms

#### Add iOS Platform
```bash
# From Capacitor root
npm install @capacitor/ios
npx cap add ios
npx cap sync
```

**Note**: iOS development requires macOS and Xcode.

#### Add Android Platform
```bash
# From Capacitor root
npm install @capacitor/android
npx cap add android
npx cap sync
```

**Note**: Android development requires Android Studio.

### Step 7: Install Native Plugins (Optional)

Example: Camera plugin

```bash
# Install plugin
npm install @capacitor/camera

# Sync to native projects
npx cap sync
```

## Running the App

### Development Workflow

1. **Develop web app**:
   ```bash
   cd app
   npm run dev  # Or your framework's dev command
   ```

2. **Build web app**:
   ```bash
   cd app
   npm run build
   ```

3. **Sync to native**:
   ```bash
   npx cap sync
   ```

4. **Open in native IDE**:
   ```bash
   # iOS
   npx cap open ios
   
   # Android
   npx cap open android
   ```

5. **Run from IDE**: Use Xcode or Android Studio to run on simulator/emulator

### iOS Setup Details

#### First Time Setup
1. Open project: `npx cap open ios`
2. In Xcode, select your project in the navigator
3. Go to "Signing & Capabilities"
4. Select your development team
5. Xcode will automatically create provisioning profile

#### Running on Simulator
1. Select simulator from device dropdown (e.g., iPhone 14)
2. Click Run button (▶️) or press `Cmd + R`
3. App will build and launch in simulator

#### Running on Device
1. Connect iOS device via USB
2. Trust computer on device if prompted
3. Select device from device dropdown
4. Ensure device is registered in Apple Developer account
5. Click Run button

### Android Setup Details

#### First Time Setup
1. Open project: `npx cap open android`
2. Android Studio will sync Gradle files (may take a while first time)
3. Wait for sync to complete

#### Running on Emulator
1. Create AVD (Android Virtual Device) if needed:
   - Tools → Device Manager → Create Device
   - Choose device and system image
   - Finish setup
2. Select emulator from device dropdown
3. Click Run button (▶️) or press `Shift + F10`
4. App will build and launch in emulator

#### Running on Device
1. Enable Developer Options on Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect device via USB
4. Accept USB debugging prompt on device
5. Select device from device dropdown
6. Click Run button

## Common Setup Issues

### Issue: "Web dir not found"
**Solution**:
- Ensure web app is built before running `npx cap sync`
- Check `capacitor.config.json` has correct `webDir` path
- Verify build output directory exists

### Issue: "Command not found: cap"
**Solution**:
- Install Capacitor CLI: `npm install @capacitor/cli`
- Use `npx cap` instead of `cap`
- Or install globally: `npm install -g @capacitor/cli`

### Issue: iOS build fails - "No signing certificate"
**Solution**:
- Open project in Xcode
- Go to Signing & Capabilities
- Select your development team
- Xcode will handle certificate automatically

### Issue: Android build fails - "SDK not found"
**Solution**:
- Ensure Android Studio is installed
- Set `ANDROID_HOME` environment variable
- Verify Android SDK is installed via Android Studio
- Check `local.properties` in `android/` directory

### Issue: "Plugin not found" after installation
**Solution**:
- Run `npx cap sync` after installing plugins
- Rebuild native projects
- Check plugin is installed: `npm list @capacitor/plugin-name`

### Issue: Changes not appearing in native app
**Solution**:
- Rebuild web app: `cd app && npm run build`
- Sync to native: `npx cap sync`
- Rebuild in Xcode/Android Studio
- Or use `npx cap copy` for faster sync (without updating dependencies)

## Development Tips

### Faster Development Workflow
1. Use `npx cap copy` instead of `npx cap sync` when you haven't added plugins
2. Use Live Reload in Xcode/Android Studio
3. Develop web app in browser first, then test in native

### Debugging
- **Web Code**: Use browser DevTools (Chrome/Safari)
- **Native Code**: Use Xcode debugger (iOS) or Android Studio debugger (Android)
- **Console Logs**: Check Xcode console or Android Studio Logcat

### Testing
- Test on real devices, not just simulators
- Test on both iOS and Android
- Test on different device sizes
- Test native plugin functionality

## Next Steps

After setup is complete:
1. Create Hello World app
2. Add native plugin (Camera, Geolocation, etc.)
3. Test on both platforms
4. Document findings

See `HANDOFF.md` for next steps and `TASKS.md` for detailed task breakdown.

---

**Last Updated**: Initial setup guide
**Status**: To be updated during implementation
