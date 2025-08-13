# Settings Screen Documentation

## Overview

The Settings screen provides configurable options for the Barcode Scanner app, allowing users to customize their scanning experience and manage app permissions.

## Features

### Audio Settings

- **Volume Slider**: Controls the audio volume for sound feedback (0-100%)
  - Default: 50%
  - Range: 0% (muted) to 100% (maximum)

### Scanning Settings

- **Scan Cooldown**: Time between consecutive scans to prevent duplicate scanning
  - Default: 3000ms (3 seconds)
  - Range: 500ms to 10 seconds
  - Display format: Shows as milliseconds (ms) for values under 1 second, or seconds (s) for 1+ seconds

### Feedback Settings

- **Vibration Toggle**: Enable/disable haptic feedback when scanning barcodes
  - Default: Enabled
  - Uses device haptic feedback on iOS and supported Android devices
  - Falls back to standard vibration on Android devices without haptic support

### Language Settings

- **Language**: Currently defaults to English
  - Future versions will support additional languages
  - Currently read-only setting

### Permission Management

- **Camera Permission**: Required for barcode scanning

  - Shows current permission status (Granted/Denied/Blocked/Unknown)
  - Request button to prompt for permission (disabled if already granted)
  - Redirects to device settings if permission is blocked

- **Storage Permission**: Optional for saving photos
  - Shows current permission status
  - Request button to prompt for permission (disabled if already granted)
  - Android 13+ uses READ_MEDIA_IMAGES permission
  - Earlier Android versions use READ_EXTERNAL_STORAGE permission

## Navigation

- Access from Home screen via the "Settings" button
- Uses native stack navigation with header shown
- Back navigation returns to the previous screen

## Integration with Scanner

The settings are automatically loaded and applied in the Scanner screen:

1. **Vibration Feedback**: Triggered when a barcode is successfully scanned
2. **Scan Cooldown**: Applied after each successful scan to prevent rapid duplicate scans
3. **Volume**: Ready for future audio feedback implementation

## Technical Details

### Storage

- Settings are stored locally using AsyncStorage
- Settings persist between app sessions
- Default values are applied if no saved settings exist

### Permissions

- Uses react-native-permissions for cross-platform permission handling
- Properly handles different Android API levels
- Provides clear feedback on permission status and actions

### UI Components

- Built with React Native Paper for consistent material design
- Responsive sliders with real-time value display
- Color-coded permission status indicators
- Structured card layout for organized sections

## Future Enhancements

- Audio feedback implementation (volume setting ready)
- Multi-language support
- Additional barcode scanning options
- Theme customization
- Export/import settings functionality
