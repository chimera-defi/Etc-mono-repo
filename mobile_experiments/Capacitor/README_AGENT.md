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

### Phase 1: Web Application
```
app/
├── src/
│   ├── index.html          # Entry HTML file
│   ├── main.js            # Main JavaScript (or main.tsx for React)
│   └── styles.css         # Styles
├── public/                # Static assets
└── package.json           # Web app dependencies
```

### Phase 2: Capacitor Integration
```
Capacitor/
├── capacitor.config.json  # Capacitor configuration
├── package.json           # Capacitor dependencies
└── [ios/ and android/ will be generated]
```

## Example App Ideas

### Option 1: Simple Hello World
- Basic HTML/CSS/JS app
- Shows "Hello, Capacitor!" message
- Demonstrates basic Capacitor setup

### Option 2: React Hello World
- React app with simple component
- Shows React + Capacitor integration
- Demonstrates modern web framework usage

### Option 3: Feature Demo App
- Hello World + native feature demo
- Camera access example
- Geolocation example
- Shows Capacitor plugin system

**Recommendation**: Start with Option 1 or 2, then add features from Option 3.

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
