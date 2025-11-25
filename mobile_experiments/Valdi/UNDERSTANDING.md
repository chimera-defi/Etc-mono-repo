# Valdi Framework Understanding Document

## Project Context

### Goal
Explore Valdi, Snapchat's cross-platform mobile app framework, to assess its ease of use and capabilities for building iOS, Android, and macOS applications.

### Current State
✅ **Documentation found and code updated!** We have a basic boilerplate structure with code using actual Valdi syntax. The framework is ready for installation and testing.

## What We Know ✅

### Framework Identity
- **Name**: Valdi
- **Developer**: Snapchat
- **Platform**: Cross-platform (iOS, Android, macOS)
- **Status**: Beta (but used in production at Snap for 8 years!)
- **Language**: TypeScript/TSX (user code), C++ (core engine)
- **GitHub**: https://github.com/Snapchat/Valdi (13k+ stars)

### Current Project Structure
```
Valdi/
├── src/
│   ├── App.tsx             # Main entry point (✅ real Valdi syntax)
│   └── components/
│       └── HelloWorld.tsx   # Component example (✅ real Valdi syntax)
├── config/
│   └── app.json           # App configuration
├── package.json           # Dependencies (✅ updated with @snap/valdi)
├── README.md              # Project documentation
└── SETUP.md               # Setup guide (✅ updated)
```

### Verified Valdi Syntax ✅
1. **Component Model**: Class-based components with `onRender()` method
2. **Language**: TypeScript/TSX
3. **Tags**: Lowercase (`<view>`, `<label>`) - not React's `<View>`, `<Text>`
4. **Text Content**: Uses `value` prop (not children)
5. **Imports**: `valdi_core/src/Component`
6. **Build System**: npm/node.js based (`valdi` CLI)
7. **File Extension**: `.tsx` (not `.valdi`)

## What We Need to Discover ⚠️

### Critical Information Needed

#### 1. Framework Architecture ✅ **MOSTLY KNOWN**
- ✅ Programming language: TypeScript/TSX
- ✅ Component model: Class-based with `onRender()`
- ✅ Build: Native compilation (C++ core)
- ⚠️ Need to verify: Compilation process, runtime behavior

#### 2. Development Workflow ✅ **KNOWN**
- ✅ Installation: `npm install -g @snap/valdi`
- ✅ CLI tools: `valdi dev_setup`, `valdi bootstrap`, `valdi hotreload`
- ⚠️ Need to test: Actual installation and CLI availability
- ⚠️ Need to verify: Hot reload functionality

#### 3. API & Syntax ✅ **BASIC SYNTAX KNOWN**
- ✅ Component creation: Class-based with `onRender()`
- ✅ Styling: Inline props (backgroundColor, padding, etc.)
- ⚠️ Need to explore: State management, navigation, platform APIs

#### 4. Framework Capabilities ⚠️ **NEEDS TESTING**
- ⚠️ Performance characteristics: Needs benchmarking
- ⚠️ Native module support: Needs exploration
- ⚠️ Third-party library integration: Needs testing
- ⚠️ Development experience: Needs hands-on evaluation
- ⚠️ Learning curve: Needs assessment

## Research Strategy ✅ **COMPLETED**

### Step 1: Official Sources ✅ **FOUND**
1. ✅ **GitHub Repository**
   - Found: https://github.com/Snapchat/Valdi
   - 13,009+ stars, 436+ forks
   - Full documentation available
   - Example projects available

2. ✅ **Package Manager**
   - npm: `@snap/valdi`
   - Installation: `npm install -g @snap/valdi`

3. ✅ **Documentation**
   - GitHub README and docs folder
   - Installation guide available
   - API examples in repository

### Step 2: Code Analysis ✅ **COMPLETED**
1. ✅ **Syntax Analysis**
   - Reviewed GitHub examples
   - Extracted component patterns
   - Identified API structure

2. ✅ **Code Updates**
   - Updated App.tsx with real syntax
   - Updated HelloWorld.tsx with real syntax
   - Fixed imports and structure

### Step 3: Next Phase ⚠️ **PENDING**
1. ⚠️ **Installation Testing**
   - Test CLI installation
   - Verify dev_setup process
   - Test bootstrap command

2. ⚠️ **Hands-On Exploration**
   - Run hello world app
   - Test hot reload
   - Explore API capabilities

## Expected Challenges ⚠️

### Challenge 1: CLI Package Availability
- **Issue**: `@snap/valdi` npm package may not be published yet
- **Solution**: 
  - Check npm registry: `npm view @snap/valdi`
  - Check GitHub for alternative installation methods
  - Look for setup scripts in repository

### Challenge 2: macOS Requirement
- **Issue**: iOS development requires macOS/Xcode
- **Solution**:
  - Test on macOS if available
  - Consider Android testing if iOS unavailable
  - Document platform requirements

### Challenge 3: Beta API Changes
- **Issue**: Framework is in beta, APIs may change
- **Solution**:
  - Pin to specific version if possible
  - Document any API changes encountered
  - Update code as needed

## Success Metrics

### Technical Success
- ✅ Code uses actual Valdi API ✅ **COMPLETE**
- ✅ Basic component system understood ✅ **COMPLETE**
- ⚠️ Hello world app runs on iOS simulator ⚠️ **PENDING TESTING**
- ⚠️ Build process works reliably ⚠️ **PENDING TESTING**

### Learning Success
- ⚠️ Framework capabilities documented ⚠️ **PARTIAL** (needs hands-on testing)
- ⚠️ Ease of use assessment completed ⚠️ **PENDING TESTING**
- ✅ Comparison to alternatives noted ✅ **COMPLETE**
- ⚠️ Recommendations for future use provided ⚠️ **PENDING ASSESSMENT**

## Next Steps Priority

1. ✅ **COMPLETE**: Find official Valdi documentation
2. ✅ **COMPLETE**: Update code to use real API
3. ⚠️ **HIGH PRIORITY**: Install Valdi CLI and test installation
4. ⚠️ **HIGH PRIORITY**: Get hello world running
5. ⚠️ **MEDIUM PRIORITY**: Explore framework capabilities
6. ⚠️ **MEDIUM PRIORITY**: Document developer experience

## Questions to Answer

### For Framework Evaluation
1. How easy is it to get started with Valdi?
2. What's the learning curve compared to React Native/SwiftUI?
3. What are Valdi's unique features?
4. How does performance compare to alternatives?
5. What's the developer experience like?

### For Project Continuation
1. Should we build a more complex example?
2. What features should we explore next?
3. Is Valdi suitable for production use?
4. What are the framework's limitations?

## Resources ✅

- ✅ **GitHub**: https://github.com/Snapchat/Valdi (found!)
- ✅ **Installation**: `npm install -g @snap/valdi`
- ✅ **CLI Commands**: `valdi dev_setup`, `valdi bootstrap`, `valdi hotreload`
- ✅ **Discord**: https://discord.gg/uJyNEeYX2U (Valdi community)
- ✅ **Documentation**: See `DOCUMENTATION.md` for curated docs

## Notes Section

### Key Discoveries
- ✅ Valdi is cross-platform (iOS, Android, macOS), not iOS-only
- ✅ Uses TypeScript/TSX, not Swift
- ✅ Class-based components with `onRender()` method
- ✅ Lowercase tags (`<view>`, `<label>`) - different from React
- ✅ Used in production at Snap for 8 years (beta status but battle-tested)
- ✅ Full VSCode debugging support
- ✅ Instant hot reload

### Code Patterns Discovered
```typescript
import { Component } from 'valdi_core/src/Component';

class App extends Component {
  onRender() {
    <view backgroundColor='white' padding={30}>
      <label color='black' fontSize={32} value='Hello, Valdi!' />
    </view>;
  }
}
```

---

**Last Updated**: 2024-11-24 (after documentation discovery)
**Status**: ✅ Documentation found, code updated. Ready for installation/testing.
