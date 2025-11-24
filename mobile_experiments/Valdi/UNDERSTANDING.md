# Valdi Framework Understanding Document

## Project Context

### Goal
Explore Valdi, Snapchat's new mobile app framework for iOS, to assess its ease of use and capabilities for building iOS applications.

### Current State
We have a basic boilerplate structure with placeholder code that mimics React-like syntax. The actual Valdi API and syntax are unknown and need to be discovered.

## What We Know

### Framework Identity
- **Name**: Valdi
- **Developer**: Snapchat
- **Platform**: iOS (mobile)
- **Status**: New/experimental framework

### Current Project Structure
```
Valdi/
├── src/
│   ├── App.valdi           # Main entry point (placeholder code)
│   └── components/
│       └── HelloWorld.valdi # Component example (placeholder)
├── config/
│   └── app.json           # App configuration
├── package.json           # Dependencies (may be incorrect)
├── README.md              # Project documentation
└── SETUP.md               # Setup guide (speculative)
```

### Current Code Assumptions (Likely Incorrect)
1. **Syntax**: React-like JSX syntax (placeholder)
2. **Language**: JavaScript/TypeScript (based on file extension)
3. **Styling**: CSS-in-JS style objects
4. **Imports**: ES6 module syntax
5. **Build System**: npm/node.js based

## What We Need to Discover

### Critical Information Needed

#### 1. Framework Architecture
- [ ] What programming language does Valdi use?
  - JavaScript/TypeScript?
  - Swift?
  - A hybrid approach?
- [ ] What's the component model?
  - Class-based components?
  - Function-based components?
  - Declarative UI?
- [ ] How does Valdi compile/build?
  - Native compilation?
  - JavaScript runtime?
  - Bridge to native iOS?

#### 2. Development Workflow
- [ ] How do you install Valdi?
  - npm package?
  - Swift Package Manager?
  - CocoaPods?
  - Direct download?
- [ ] What tools are needed?
  - CLI tools?
  - Xcode integration?
  - Build scripts?
- [ ] How do you run/develop?
  - Hot reload?
  - Simulator support?
  - Device deployment?

#### 3. API & Syntax
- [ ] Component creation syntax
- [ ] Styling approach
- [ ] State management
- [ ] Navigation system
- [ ] Platform APIs access

#### 4. Framework Capabilities
- [ ] Performance characteristics
- [ ] Native module support
- [ ] Third-party library integration
- [ ] Development experience
- [ ] Learning curve

## Research Strategy

### Step 1: Official Sources
1. **Snapchat Developer Portal**
   - URL: https://developers.snap.com
   - Look for Valdi documentation section
   - Check for getting started guides
   - Find API reference

2. **GitHub**
   - Search: `snapchat/valdi`
   - Check for official repositories
   - Look for examples or sample projects

3. **Package Managers**
   - npm: `npm search valdi` or `npm search @snapchat/valdi`
   - Swift Package Manager: Search for Valdi
   - CocoaPods: Check podspec files

### Step 2: Community & Announcements
1. **Blog Posts**
   - Snapchat engineering blog
   - Tech news sites
   - Developer community posts

2. **Social Media**
   - Twitter/X announcements
   - Developer forums
   - Reddit discussions

### Step 3: Reverse Engineering (If Needed)
1. **Sample Projects**
   - Look for example apps
   - Analyze code structure
   - Extract patterns

2. **Documentation Scraping**
   - Save any found documentation
   - Extract code examples
   - Document API patterns

## Expected Challenges

### Challenge 1: Limited Documentation
- **Issue**: Valdi may be very new with minimal public documentation
- **Solution**: 
  - Check for beta/early access programs
  - Look for conference talks or presentations
  - Contact Snapchat developer relations

### Challenge 2: API Mismatch
- **Issue**: Current placeholder code won't match real API
- **Solution**:
  - Be prepared to rewrite components
  - Start with minimal working example
  - Iterate based on discovered patterns

### Challenge 3: Installation Issues
- **Issue**: Installation method unknown
- **Solution**:
  - Try multiple approaches (npm, SPM, CocoaPods)
  - Check system requirements
  - Verify development environment setup

## Success Metrics

### Technical Success
- ✅ Hello world app runs on iOS simulator
- ✅ Code uses actual Valdi API
- ✅ Basic component system understood
- ✅ Build process works reliably

### Learning Success
- ✅ Framework capabilities documented
- ✅ Ease of use assessment completed
- ✅ Comparison to alternatives noted
- ✅ Recommendations for future use provided

## Next Steps Priority

1. **Immediate**: Find official Valdi documentation
2. **Short-term**: Update code to use real API
3. **Medium-term**: Get hello world running
4. **Long-term**: Explore framework capabilities

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

## Resources to Check

- [ ] https://developers.snap.com
- [ ] https://github.com/snapchat
- [ ] npm registry for @snapchat packages
- [ ] Swift Package Index
- [ ] CocoaPods specs
- [ ] Apple Developer Forums
- [ ] iOS development communities

## Notes Section

*Add findings and discoveries here as you research*

---

**Last Updated**: Initial creation
**Status**: Awaiting discovery phase
