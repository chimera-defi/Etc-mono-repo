# Agent Handoff Document - Capacitor Project

## ✅ Current Status

**Location**: `/workspace/mobile_experiments/Capacitor/`

**Status**: ✅ Documentation and task planning complete. Ready for implementation.

**Primary Goal**: Create a Capacitor "Hello World" app that demonstrates wrapping a web application into native iOS and Android apps.

## What Has Been Done

✅ Created project structure
✅ Created comprehensive documentation files
✅ Set up task breakdown and planning
✅ Documented research strategy
✅ Created framework comparison notes

## What Needs to Be Done

⏭️ **Create React web application** (using Vite)
⏭️ **Install and configure Capacitor**
⏭️ **Add iOS and Android platforms**
⏭️ **Build and run Hello World app**
⏭️ **Demonstrate Camera and Geolocation plugins**
⏭️ **Document findings and comparisons**

## ✅ DECISIONS MADE (Follow These Exactly)

### Web Framework: **React with Vite**
- **Why**: Most popular, realistic for production use, aligns with ReactNative experiment
- **Command**: `npm create vite@latest app -- --template react`

### App Configuration
- **App Name**: `CapacitorHelloWorld`
- **App ID**: `com.example.capacitorhelloworld`
- **Web Dir**: `app/dist` (Vite's default build output)

### Plugins to Implement
1. **Camera** (required) - Take photos
2. **Geolocation** (bonus) - Get device location

## Quick Start Guide (Follow Step-by-Step)

### Step 1: Create React Web App

```bash
cd /workspace/mobile_experiments/Capacitor

# Create React app with Vite
npm create vite@latest app -- --template react

# Navigate to app directory
cd app

# Install dependencies
npm install

# Install Capacitor plugins we'll use
npm install @capacitor/camera @capacitor/geolocation

# Build the app (creates dist/ folder)
npm run build
```

### Step 2: Install and Initialize Capacitor

```bash
# From Capacitor root directory (not app/)
cd /workspace/mobile_experiments/Capacitor

# Install Capacitor CLI and core
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor (use exact values below)
npx cap init

# When prompted, enter EXACTLY:
# - App name: CapacitorHelloWorld
# - App ID: com.example.capacitorhelloworld
# - Web dir: app/dist
```

### Step 3: Add Native Platforms

```bash
# From Capacitor root directory
npm install @capacitor/ios @capacitor/android

# Add iOS platform
npx cap add ios

# Add Android platform
npx cap add android

# Sync web app to native projects (this copies dist/ to native projects)
npx cap sync
```

**Important**: The `npx cap sync` command will:
- Copy your built web app from `app/dist/` to native projects
- Install any Capacitor plugins you've added
- Update native dependencies

### Step 4: Run on Simulators

```bash
# iOS
npx cap open ios
# Then in Xcode: Select iPhone simulator → Click Run (▶️)

# Android
npx cap open android
# Then in Android Studio: Select emulator → Click Run (▶️)
```

## Required Code Implementation

### Step 5: Update React App with Capacitor Features

You need to modify the React app to demonstrate Capacitor capabilities. Here's exactly what to implement:

#### File: `app/src/App.jsx` (Replace entire file)

```jsx
import { useState } from 'react';
import { Camera } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import './App.css';

function App() {
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);

  const takePicture = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'dataUrl'
      });
      setPhoto(image.dataUrl);
    } catch (error) {
      console.error('Camera error:', error);
      alert('Camera not available or permission denied');
    }
  };

  const getLocation = async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    } catch (error) {
      console.error('Geolocation error:', error);
      alert('Location not available or permission denied');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hello, Capacitor!</h1>
        <p>React app wrapped in a native container</p>
        
        <div className="features">
          <div className="feature">
            <h2>Camera Plugin</h2>
            <button onClick={takePicture}>Take Photo</button>
            {photo && (
              <img src={photo} alt="Captured" style={{ maxWidth: '100%', marginTop: '10px' }} />
            )}
          </div>

          <div className="feature">
            <h2>Geolocation Plugin</h2>
            <button onClick={getLocation}>Get Location</button>
            {location && (
              <div style={{ marginTop: '10px' }}>
                <p>Latitude: {location.latitude.toFixed(6)}</p>
                <p>Longitude: {location.longitude.toFixed(6)}</p>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
```

#### File: `app/src/App.css` (Replace entire file)

```css
.App {
  text-align: center;
  padding: 20px;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  border-radius: 8px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}

.features {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 30px;
  width: 100%;
  max-width: 500px;
}

.feature {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 8px;
}

.feature h2 {
  margin-top: 0;
  font-size: 1.5em;
}

.feature button {
  background-color: #61dafb;
  color: #282c34;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.feature button:hover {
  background-color: #4fa8c5;
}

.feature button:active {
  transform: scale(0.98);
}
```

#### File: `app/index.html` (Update viewport meta tag)

Make sure the viewport meta tag is correct for mobile:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### Step 6: Rebuild and Sync After Code Changes

After making code changes:

```bash
# 1. Build the React app
cd app
npm run build

# 2. Sync to native projects
cd ..
npx cap sync

# 3. Open and run in native IDE
npx cap open ios    # or npx cap open android
```

## Expected File Structure After Setup

```
Capacitor/
├── app/                          # React web app (created by Vite)
│   ├── src/
│   │   ├── App.jsx              # Main component (YOU UPDATE THIS)
│   │   ├── App.css              # Styles (YOU UPDATE THIS)
│   │   ├── main.jsx             # Entry point
│   │   └── index.css
│   ├── index.html
│   ├── package.json             # React dependencies + Capacitor plugins
│   └── dist/                    # Build output (created by npm run build)
├── ios/                          # iOS native project (generated)
├── android/                      # Android native project (generated)
├── capacitor.config.json         # Capacitor config (generated)
└── package.json                 # Capacitor CLI dependencies
```

## Key Configuration Files

### `capacitor.config.json` (Auto-generated, verify it matches)

```json
{
  "appId": "com.example.capacitorhelloworld",
  "appName": "CapacitorHelloWorld",
  "webDir": "app/dist",
  "bundledWebRuntime": false
}
```

### `app/package.json` (Should include these dependencies)

```json
{
  "dependencies": {
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "@capacitor/camera": "^latest",
    "@capacitor/geolocation": "^latest"
  }
}
```

### Root `package.json` (Capacitor dependencies)

```json
{
  "dependencies": {
    "@capacitor/core": "^latest",
    "@capacitor/ios": "^latest",
    "@capacitor/android": "^latest"
  },
  "devDependencies": {
    "@capacitor/cli": "^latest"
  }
}
```

## Native Plugin Examples

### Camera Plugin
```bash
npm install @capacitor/camera
```

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

### Geolocation Plugin
```bash
npm install @capacitor/geolocation
```

```javascript
import { Geolocation } from '@capacitor/geolocation';

const getCurrentPosition = async () => {
    const position = await Geolocation.getCurrentPosition();
    return position;
};
```

### Device Info Plugin
```bash
npm install @capacitor/device
```

```javascript
import { Device } from '@capacitor/device';

const getDeviceInfo = async () => {
    const info = await Device.getInfo();
    console.log('Platform:', info.platform);
    console.log('Model:', info.model);
};
```

## Success Criteria

- [ ] Web app created and builds successfully
- [ ] Capacitor initialized and configured
- [ ] iOS platform added and runs in simulator
- [ ] Android platform added and runs in emulator
- [ ] At least one native plugin demonstrated (Camera, Geolocation, etc.)
- [ ] Documentation updated with findings
- [ ] Comparison notes added vs React Native/Flutter

## Common Issues & Solutions

### Issue: "Web dir not found"
- **Solution**: Ensure web app is built before running `npx cap sync`
- Check `capacitor.config.json` has correct `webDir` path

### Issue: "iOS build fails"
- **Solution**: Ensure Xcode is installed and Command Line Tools are set up
- Run `xcode-select --install` if needed
- Open project in Xcode and check signing

### Issue: "Android build fails"
- **Solution**: Ensure Android Studio is installed
- Set up Android SDK and environment variables
- Check `ANDROID_HOME` is set correctly

### Issue: "Plugin not found"
- **Solution**: Install plugin: `npm install @capacitor/plugin-name`
- Run `npx cap sync` after installing plugins
- Rebuild native projects

## Resources

- **Official Docs**: https://capacitorjs.com/docs
- **Getting Started**: https://capacitorjs.com/docs/getting-started
- **Plugins**: https://capacitorjs.com/docs/plugins
- **iOS Setup**: https://capacitorjs.com/docs/ios
- **Android Setup**: https://capacitorjs.com/docs/android
- **GitHub**: https://github.com/ionic-team/capacitor

## Next Agent Checklist (Follow in Order)

- [ ] **Step 1**: Create React app: `npm create vite@latest app -- --template react`
- [ ] **Step 2**: `cd app && npm install && npm install @capacitor/camera @capacitor/geolocation`
- [ ] **Step 3**: Update `app/src/App.jsx` with code from Step 5 above
- [ ] **Step 4**: Update `app/src/App.css` with styles from Step 5 above
- [ ] **Step 5**: Build: `cd app && npm run build`
- [ ] **Step 6**: Install Capacitor: `cd .. && npm install @capacitor/core @capacitor/cli`
- [ ] **Step 7**: Initialize: `npx cap init` (use exact values: CapacitorHelloWorld, com.example.capacitorhelloworld, app/dist)
- [ ] **Step 8**: Add platforms: `npm install @capacitor/ios @capacitor/android && npx cap add ios && npx cap add android`
- [ ] **Step 9**: Sync: `npx cap sync`
- [ ] **Step 10**: Test iOS: `npx cap open ios` → Run in Xcode
- [ ] **Step 11**: Test Android: `npx cap open android` → Run in Android Studio
- [ ] **Step 12**: Document any issues or findings in `DOCUMENTATION.md`

---

**Status**: Ready for implementation!
**Last Updated**: Initial setup
**Next Phase**: Implementation
