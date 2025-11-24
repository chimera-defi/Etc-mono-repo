# Valdi Setup Guide

## Prerequisites

- macOS (required for iOS development)
- Xcode (latest version recommended)
- Node.js (if Valdi uses npm/JavaScript tooling)
- CocoaPods (if Valdi uses CocoaPods for dependencies)

## Installation Steps

### 1. Install Valdi CLI/Tools

```bash
# Method 1: Via npm (if available)
npm install -g @snapchat/valdi-cli

# Method 2: Via CocoaPods (if Swift-based)
# Add to Podfile and run pod install

# Method 3: Direct download from Snapchat Developer Portal
# Check https://developers.snapchat.com/valdi
```

### 2. Verify Installation

```bash
valdi --version
```

### 3. Install Project Dependencies

```bash
cd "mobile experiments/Valdi"
npm install
# or
pod install  # if using CocoaPods
```

### 4. Run the Hello World App

```bash
npm start
# or
valdi run-ios
```

## Project Structure

```
Valdi/
├── src/
│   ├── App.valdi           # Main app entry point
│   └── components/         # Reusable components
│       └── HelloWorld.valdi
├── assets/                 # Images, fonts, etc.
├── config/
│   └── app.json           # App configuration
├── package.json           # Dependencies and scripts
└── README.md             # Project documentation
```

## Next Steps

1. Review Valdi documentation (when available)
2. Modify `src/App.valdi` to experiment with Valdi features
3. Add new components in `src/components/`
4. Explore Valdi's component system and APIs

## Troubleshooting

### Valdi CLI not found
- Ensure Valdi is installed globally or in project dependencies
- Check PATH environment variable

### Build errors
- Verify Xcode is properly installed
- Check iOS SDK version compatibility
- Review Valdi version requirements

### Runtime errors
- Check device/simulator compatibility
- Verify app permissions in config/app.json
- Review Valdi framework version

## Resources

- [Valdi Documentation](https://valdi.dev) (when available)
- [Snapchat Developer Portal](https://developers.snapchat.com)
- iOS Development Guides
