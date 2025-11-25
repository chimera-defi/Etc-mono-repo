# Capacitor Implementation Guide

## Quick Reference: Exact Commands to Run

Follow these commands **in order**. Copy and paste each section.

### Step 1: Create React App

```bash
cd /workspace/mobile_experiments/Capacitor
npm create vite@latest app -- --template react
cd app
npm install
npm install @capacitor/camera @capacitor/geolocation
```

### Step 2: Implement App Code

**File: `app/src/App.jsx`** - Replace entire file with:

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

**File: `app/src/App.css`** - Replace entire file with:

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

**File: `app/index.html`** - Update viewport meta tag to:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

### Step 3: Build Web App

```bash
npm run build
```

Verify `app/dist/` directory was created.

### Step 4: Install Capacitor

```bash
cd ..
npm install @capacitor/core @capacitor/cli
```

### Step 5: Initialize Capacitor

```bash
npx cap init
```

**When prompted, enter EXACTLY:**
- App name: `CapacitorHelloWorld`
- App ID: `com.example.capacitorhelloworld`
- Web dir: `app/dist`

### Step 6: Add Native Platforms

```bash
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
npx cap sync
```

### Step 7: Run on Simulators

**iOS:**
```bash
npx cap open ios
```
Then in Xcode: Select iPhone simulator → Click Run (▶️)

**Android:**
```bash
npx cap open android
```
Then in Android Studio: Select emulator → Click Run (▶️)

## After Making Code Changes

```bash
# 1. Build React app
cd app
npm run build

# 2. Sync to native
cd ..
npx cap sync

# 3. Open and run
npx cap open ios    # or npx cap open android
```

## Troubleshooting

### "Web dir not found"
- Make sure you ran `npm run build` in the `app/` directory first
- Verify `app/dist/` exists

### "Plugin not found"
- Run `npx cap sync` after installing plugins
- Rebuild native projects

### Changes not appearing
- Rebuild web app: `cd app && npm run build`
- Sync: `cd .. && npx cap sync`
- Rebuild in Xcode/Android Studio

---

**This is your cheat sheet - follow it step by step!**
