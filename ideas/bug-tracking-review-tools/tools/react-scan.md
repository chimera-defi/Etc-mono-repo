# React Scan Setup Guide ⚛️

> **Visual React Performance Debugging by Aiden Bai**
>
> Status: ❌ Not yet integrated | Free & Open Source (MIT)

---

## Overview

React Scan automatically detects and **visualizes** performance issues in your React app. It shows exactly which components are causing slow renders with a real-time overlay.

**Created by:** Aiden Bai (creator of Million.js)
**License:** MIT (Free)
**Type:** Performance debugging (not code review)

---

## Quick Start (1 minute)

### Option 1: CLI (Any React App)

```bash
# Scan localhost
npx react-scan@latest http://localhost:3000

# Scan any website
npx react-scan@latest https://react.dev
```

This opens a browser with React Scan enabled.

### Option 2: Script Tag

Add to your HTML:

```html
<script src="https://unpkg.com/react-scan/dist/auto.global.js"></script>
```

### Option 3: npm Package

```bash
npm install react-scan
```

```javascript
// In your app entry (e.g., main.tsx)
import { scan } from 'react-scan';

if (process.env.NODE_ENV === 'development') {
  scan({
    enabled: true,
    log: true,
  });
}
```

---

## How It Works

### Visual Overlay

React Scan draws colored outlines around components:

| Color | Meaning |
|-------|---------|
| 🟢 Green | Fast render (< 5ms) |
| 🟡 Yellow | Slow render (5-16ms) |
| 🔴 Red | Very slow (> 16ms) |
| ⬜ Gray | Unnecessary render |

### Unnecessary Renders

An **unnecessary render** is when a component re-renders but its DOM output doesn't change. These are prime optimization targets.

---

## Toolbar Features

The toolbar appears in the bottom-right corner:

| Button | Function |
|--------|----------|
| ▶️ Play/Pause | Enable/disable scanning |
| 🔍 Inspect | Click components for details |
| 📊 Stats | View render count/timing |
| ⚙️ Settings | Configure thresholds |

---

## Configuration

```javascript
import { scan } from 'react-scan';

scan({
  // Enable/disable
  enabled: true,

  // Log renders to console
  log: true,

  // Highlight all renders (not just slow ones)
  showAllRenders: false,

  // Custom render threshold (ms)
  renderThreshold: 10,

  // Track specific components
  includeComponents: ['MyComponent', 'UserList'],

  // Exclude components
  excludeComponents: ['AnimatedIcon'],

  // Callback on slow render
  onRender: (fiber, render) => {
    if (render.time > 50) {
      console.warn('Slow render:', fiber.type.name, render.time);
    }
  },
});
```

---

## Browser Extension

Install from Chrome Web Store (coming soon) or:

```bash
# Build from source
git clone https://github.com/aidenybai/react-scan
cd react-scan
npm install
npm run build:extension
# Load unpacked extension from dist/
```

---

## Common Patterns to Fix

### 1. Missing Dependencies in useEffect

```javascript
// ❌ Bad - causes extra renders
useEffect(() => {
  fetchData(userId);
}, []); // Missing userId

// ✅ Good
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

### 2. Missing useCallback

```javascript
// ❌ Bad - new function every render
function Parent() {
  return <Child onClick={() => doSomething()} />;
}

// ✅ Good - stable function reference
function Parent() {
  const handleClick = useCallback(() => doSomething(), []);
  return <Child onClick={handleClick} />;
}
```

### 3. Missing useMemo

```javascript
// ❌ Bad - recalculates every render
function Component({ items }) {
  const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
  return <List items={sorted} />;
}

// ✅ Good - memoized calculation
function Component({ items }) {
  const sorted = useMemo(
    () => items.sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  );
  return <List items={sorted} />;
}
```

### 4. Object/Array Literals in JSX

```javascript
// ❌ Bad - new object every render
<Component style={{ color: 'red' }} />

// ✅ Good - stable reference
const style = { color: 'red' };
<Component style={style} />
```

---

## Integration with Dev Workflow

### Before Submitting PR

```bash
# 1. Start dev server
npm run dev

# 2. Scan your app
npx react-scan@latest http://localhost:3000

# 3. Navigate through your changes
# 4. Fix any red/yellow components
# 5. Verify gray (unnecessary) renders are eliminated
```

### CI Integration

```javascript
// playwright.config.ts
import { scan } from 'react-scan';

// Enable in E2E tests
beforeEach(() => {
  scan({
    enabled: true,
    onRender: (fiber, render) => {
      if (render.unnecessary) {
        console.warn(`Unnecessary render: ${fiber.type.name}`);
      }
    },
  });
});
```

---

## Comparison with React DevTools

| Feature | React Scan | React DevTools |
|---------|-----------|----------------|
| Visual Overlay | ✅ | ❌ |
| No Setup | ✅ | ❌ (requires extension) |
| Scan Remote Sites | ✅ | ❌ |
| Unnecessary Render Detection | ✅ | Partial |
| Component Profiling | ❌ | ✅ |
| State Inspection | ❌ | ✅ |

**Use Both:** React Scan for quick visual debugging, DevTools for deep profiling.

---

## Comparison with Other Tools

| Aspect | React Scan | BugBot | Greptile |
|--------|-----------|--------|----------|
| **Type** | Runtime perf | PR review | PR review |
| **Finds** | Slow renders | Logic bugs | All bugs |
| **Visual** | ✅✅ | ❌ | ❌ |
| **Price** | Free | $40/mo | $99/mo |
| **Setup** | 1 min | 5 min | 5 min |

---

## Use Cases

### ✅ Use React Scan For:
- Finding slow components
- Debugging render cascades
- Optimizing before PR
- Auditing production sites

### ❌ Don't Use For:
- Logic bugs (use BugBot/Greptile)
- Security issues (use Snyk/Greptile)
- Code style (use ESLint)

---

## Next Steps

- [ ] Run: `npx react-scan@latest http://localhost:3000`
- [ ] Find your slowest component
- [ ] Fix one unnecessary render
- [ ] Run scan again to verify

---

## Resources

- [Official Site](https://react-scan.com)
- [GitHub](https://github.com/aidenybai/react-scan)
- [npm](https://www.npmjs.com/package/react-scan)
- [Aiden Bai's Twitter](https://twitter.com/aidenybai)
- [Million.js](https://million.dev) (related project)
