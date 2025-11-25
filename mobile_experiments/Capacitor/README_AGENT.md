# Agent Playbook - Capacitor Experiment

## Mission
Set up a Capacitor "Hello World" experience that demonstrates wrapping a web application into native iOS and Android apps. Focus on documenting the workflow, capabilities, and comparison with other cross-platform frameworks.

## Success Criteria
- ✅ **Documentation Complete**: All planning docs created (this phase)
- ⏭️ Capacitor CLI installed and validated
- ⏭️ Simple web app created (React/Vue/Angular or vanilla JS)
- ⏭️ Capacitor initialized and configured
- ⏭️ iOS and Android platforms added
- ⏭️ Hello World app runs on iOS simulator and Android emulator
- ⏭️ Native plugin example demonstrated (e.g., Camera, Geolocation)
- ⏭️ Build & run instructions documented
- ⏭️ Comparison notes added vs React Native/Flutter

## Ways of Working
- **No code in this phase**: Only documentation, tasks, and examples
- Keep generated artifacts (`ios/`, `android/`, `node_modules/`) out of version control
- Document assumptions and discoveries in `DOCUMENTATION.md`
- Update `NEXT_STEPS.md` as you progress
- Follow the structure established in other experiments (Valdi, Flutter, ReactNative)

## Project Structure to Create

### Final Structure (After Setup)
```
Capacitor/
├── app/                    # React app (created by Vite)
│   ├── src/
│   │   ├── App.jsx        # Main component (YOU UPDATE THIS)
│   │   ├── App.css        # Styles (YOU UPDATE THIS)
│   │   └── main.jsx       # Entry point
│   ├── dist/              # Build output (created by npm run build)
│   └── package.json       # React + Capacitor plugin dependencies
├── ios/                    # iOS native project (generated)
├── android/                # Android native project (generated)
├── capacitor.config.json   # Capacitor config (generated)
└── package.json           # Capacitor CLI dependencies
```

## ✅ Decisions Made - Follow Exactly

### Web Framework: React with Vite
- **Why**: Most popular, realistic, aligns with ReactNative experiment
- **Command**: `npm create vite@latest app -- --template react`

### App Implementation
- **Hello World** + **Camera Plugin** + **Geolocation Plugin**
- All code provided in `HANDOFF.md` Step 5
- Just copy/paste the provided `App.jsx` and `App.css`

### Configuration Values
- **App Name**: `CapacitorHelloWorld`
- **App ID**: `com.example.capacitorhelloworld`
- **Web Dir**: `app/dist`

## Key Files to Reference

- `HANDOFF.md` - Quick start guide for next agent
- `TASKS.md` - Detailed task breakdown
- `UNDERSTANDING.md` - Research context and strategy
- `DOCUMENTATION.md` - Framework documentation
- `SETUP.md` - Setup instructions
- `../WEB_TO_MOBILE_GUIDE.md` - Overview of web-to-mobile solutions

## Comparison Points

When documenting, compare Capacitor with:
- **React Native**: Code reuse, performance, native feel
- **Flutter**: Code reuse, performance, learning curve
- **Ionic**: Relationship (Ionic uses Capacitor)
- **PWAs**: When to use Capacitor vs PWA

## Notes

- Capacitor works with ANY web framework - choose based on team preference
- Focus on demonstrating the "wrap existing web app" workflow
- Document the native plugin system (key differentiator)
- Note performance characteristics vs true native frameworks

---

**Status**: Documentation phase complete
**Next**: Implementation phase (for next agent)
