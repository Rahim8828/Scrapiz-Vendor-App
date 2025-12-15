# Scrapiz Vendor App 📱

A React Native mobile application for scrap vendors to manage bookings, track earnings, and handle customer requests efficiently.

## Features

- **Dashboard**: Real-time overview of bookings and earnings
- **Job Management**: Accept/reject bookings, track active jobs
- **Earnings Tracking**: View daily, weekly, and monthly earnings
- **Profile Management**: Update personal and vehicle information
- **Settings**: Notifications, language, and app preferences

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **UI Components**: Custom themed components
- **Navigation**: Custom navigation system
- **Icons**: Expo Vector Icons, Lucide React

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```

2. Start the development server
   ```bash
   npx expo start
   ```

3. Run on device/simulator
   - Press `a` for Android emulator
   - Press `i` for iOS simulator
   - Scan QR code with Expo Go app

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Header, Toast, etc.)
│   ├── navigation/     # Navigation components
│   └── ui/            # UI components (Buttons, Text, etc.)
├── screens/            # App screens organized by feature
│   ├── auth/          # Authentication screens
│   ├── jobs/          # Job-related screens
│   ├── main/          # Main app screens
│   ├── profile/       # Profile management screens
│   └── settings/      # Settings screens
├── services/          # API and business logic
├── types/            # TypeScript type definitions
└── utils/            # Helper functions and utilities
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run lint` - Run ESLint
- `npm run clean` - Clean node_modules and reinstall
