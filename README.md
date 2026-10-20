# Jahesh — Smart Alarm Mobile Application

**Jahesh** is a React Native mobile application designed to interact with a compatible smart alarm system through Bluetooth Classic. It provides a mobile interface for device control, zone configuration, contact-related settings, and communication with the connected hardware.

The application combines Bluetooth connectivity, structured device communication, persistent local settings, and a multilingual interface to simplify interaction with the alarm system.

## Overview

Jahesh bridges a mobile application and a compatible alarm device, allowing users to manage device-related settings from their smartphone.

The application uses Bluetooth Classic to establish communication with the external device and maintains connection state within the app. It also includes screens for controlling the system, configuring zones, managing contact-related settings, and adjusting application preferences.

The project is built with React Native and uses Redux Toolkit for state management, React Navigation for screen navigation, and AsyncStorage for persistent local data.

## Key Features

### Bluetooth Connectivity

- Connect to a compatible alarm device using Bluetooth Classic.
- Request the necessary Android Bluetooth permissions.
- Monitor device connection and disconnection events.
- Attempt to reconnect automatically when a connection is lost while Bluetooth communication is enabled.
- Store and retrieve the selected device's MAC address.
- Support switching between Bluetooth communication and an alternative configured sending method.

### Device Control

- Provide a dedicated device settings screen.
- Manage the application's connection state.
- Organize device-related functionality through a tab-based interface.
- Maintain application state while interacting with the connected hardware.

### Zone Configuration

- Provide a dedicated interface for alarm zone settings.
- Organize zone-related functionality separately from general device controls.
- Support interaction with the alarm system's zone-related data.

### Contact Management

- Provide a dedicated contacts screen for phone-related settings.
- Separate contact-related functionality from device and zone configuration.

### Application Settings

- Store user preferences locally.
- Support language selection and localized interface text.
- Support right-to-left layouts for non-English languages.
- Provide a settings screen accessible through modal navigation.
- Display toast notifications for user feedback.

### Device Communication and Debugging

- Include helper utilities for converting hexadecimal strings and byte arrays.
- Include Redux state management for device memory and communication status.
- Provide a dedicated debug screen.
- Include Bluetooth communication test data for development and troubleshooting.

## Technology Stack

| Technology | Purpose |
|---|---|
| React Native | Cross-platform mobile application framework |
| React 19 | UI component rendering |
| React Navigation | Stack and bottom-tab navigation |
| Redux Toolkit | Application state management |
| React Redux | Connecting UI components to Redux state |
| React Native Bluetooth Classic | Bluetooth device communication |
| AsyncStorage | Persistent local storage |
| i18next | Internationalization |
| react-i18next | Translation integration |
| Jalali Moment | Jalali calendar and date handling |
| React Native SVG | Custom icons and vector graphics |
| React Native Reanimated | Animation support |
| React Native Gesture Handler | Gesture handling |
| React Native Toast Message | User notifications |
| Jest | Unit testing |

## Application Structure

The main application is organized into screens, reusable components, state-management modules, and utility functions.

```text
jahesh/
├── src/
│   ├── components/
│   │   └── icons/                 # Custom navigation icons
│   ├── layouts/
│   │   └── MainLayout.js          # Shared layout components
│   ├── screens/
│   │   ├── HomeScreen.js          # Main control screen
│   │   ├── ContactsScreen.js      # Contact-related settings
│   │   ├── DeviceScreen.js        # Device settings
│   │   ├── ZoneScreen.js          # Zone configuration
│   │   ├── SettingsScreen.js      # Application preferences
│   │   └── DebugScreen.js         # Debugging interface
│   ├── reducers/                  # Redux state reducers
│   ├── store.js                   # Redux store
│   ├── utils/                     # Shared utilities
│   ├── localization/              # Internationalization setup
│   └── memory/                    # Device memory-related logic
├── __tests__/                     # Automated tests
├── assets/
│   └── fonts/                     # Application fonts
├── App.js                         # Main application entry point
├── index.js                       # React Native registration
├── app.json                       # Application configuration
├── package.json                  # Dependencies and scripts
├── babel.config.js                # Babel configuration
├── metro.config.js                # Metro configuration
└── jest.config.js                 # Jest configuration
```

*The structure above summarizes the main application modules; individual filenames and directory contents may vary with subsequent development.*

## Architecture

The application follows a component-based architecture in which the user interface, navigation, state management, and device communication are separated into dedicated modules.

```text
                 React Native UI
                       |
             React Navigation
                       |
                Redux Toolkit
                       |
          +------------+------------+
          |                         |
   Application Settings       Device State
          |                         |
     AsyncStorage           Bluetooth Classic
                                    |
                            Smart Alarm Device
```

The UI communicates with the application's state-management layer, while Bluetooth utilities handle device connectivity and communication. AsyncStorage persists selected preferences between application sessions.

## Getting Started

### Prerequisites

Before running the application, install:

- Node.js `22.11.0` or newer.
- npm.
- Android Studio and the Android SDK for Android development.
- A compatible Android device or emulator.
- A physical Bluetooth-compatible alarm device for testing hardware communication.

The application includes a Bluetooth Classic dependency. Hardware-related functionality should be tested on a compatible physical device rather than relying exclusively on an emulator.

### Installation

Clone the repository:

```bash
git clone https://github.com/nimash79/jahesh.git
cd jahesh
```

Install dependencies:

```bash
npm install
```

### Run the Development Server

Start Metro:

```bash
npm start
```

Keep this terminal running while you build and launch the application.

### Run on Android

Open another terminal in the project directory and execute:

```bash
npm run android
```

This command builds and launches the application on a connected Android device or running emulator.

Ensure USB debugging is enabled if you are using a physical Android device.

### Run on iOS

The repository includes an iOS development script. To attempt an iOS build, you need macOS, Xcode, and the required native dependencies.

Install the Ruby dependencies:

```bash
bundle install
```

Install CocoaPods dependencies:

```bash
bundle exec pod install
```

Then run:

```bash
npm run ios
```

**Note:** Successful iOS operation depends on native dependency compatibility and the availability of the required Bluetooth functionality. Android is the primary documented target for the Bluetooth Classic workflow.

## Bluetooth Setup

The application requests Android Bluetooth permissions at runtime, including Bluetooth scanning, Bluetooth connection, and location permission.

To test the Bluetooth workflow:

1. Enable Bluetooth on the Android device.
2. Grant the permissions requested by the application.
3. Ensure the target alarm device is powered on and discoverable or otherwise available for connection.
4. Select or configure the appropriate device through the application's supported workflow.
5. Enable the Bluetooth communication method.
6. Monitor the connection status and verify communication with the target hardware.

The application includes connection-state handling and reconnection logic. Actual communication behavior depends on the target device's supported protocol and configuration.

## Development and Testing

### Run the Linter

```bash
npm run lint
```

### Run Tests

```bash
npm test
```

The repository uses ESLint for code-quality checks and Jest for automated testing.

## Permissions and Hardware Requirements

Bluetooth functionality requires appropriate permissions and compatible hardware.

- Bluetooth scanning and connection permissions must be granted on supported Android versions.
- Android permission behavior may differ depending on the operating system version.
- The target alarm device must support the communication protocol expected by the application.
- Device-specific commands and responses must match the protocol implemented in the application.
- Bluetooth connectivity and reconnection behavior should be verified on the intended hardware.

## Future Improvements

Potential improvements include:

- Expanding automated tests for Bluetooth communication and reconnection.
- Documenting the alarm device's communication protocol.
- Improving connection diagnostics and error reporting.
- Adding a documented device setup and pairing workflow.
- Providing clearer feedback for failed commands and connection timeouts.
- Improving documentation for supported hardware and Android versions.
- Adding screenshots and a demonstration of the main application workflows.

## License

Check the repository for a license file before redistributing or modifying the project under specific license terms.

## Author

**Nima Sharifinia**

- GitHub: [@nimash79](https://github.com/nimash79)
- Repository: [Jahesh](https://github.com/nimash79/jahesh)

---

*Jahesh connects a mobile interface to a smart alarm system, combining Bluetooth communication, device configuration, and persistent application settings in a React Native application.*
