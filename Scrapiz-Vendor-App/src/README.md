# Scrapiz Vendor App - Source Structure

## 📁 Folder Organization

### `/screens` - Screen Components
Organized by feature/functionality:

- **`/auth`** - Authentication related screens
  - `LoginScreen.tsx` - Main login screen
  - `SimpleLogin.tsx` - Simplified login variant

- **`/main`** - Core app screens
  - `Dashboard.tsx` - Main dashboard
  - `EarningsScreen.tsx` - Earnings overview
  - `ManageScreen.tsx` - Management interface

- **`/jobs`** - Job management screens
  - `BookingDetailsScreen.tsx` - Booking details view
  - `ActiveJob.tsx` - Active job interface
  - `JobCompletion.tsx` - Job completion flow
  - `JobHistoryScreen.tsx` - Job history
  - `FutureRequestsScreen.tsx` - Upcoming requests
  - `HistoryScreen.tsx` - General history

- **`/profile`** - User profile screens
  - `ProfileScreen.tsx` - Main profile view
  - `EditProfileScreen.tsx` - Profile editing
  - `PersonalInfoScreen.tsx` - Personal information

- **`/settings`** - Settings and configuration
  - `AppSettingsScreen.tsx` - App settings
  - `PaymentSettingsScreen.tsx` - Payment configuration
  - `NotificationsScreen.tsx` - Notification settings
  - `LanguageScreen.tsx` - Language selection
  - `PrivacyScreen.tsx` - Privacy settings
  - `AboutScreen.tsx` - About information
  - `HelpSupportScreen.tsx` - Help and support

### `/components` - Reusable Components
Organized by type:

- **`/navigation`** - Navigation components
  - `BottomNavigation.tsx` - Bottom tab navigation

- **`/common`** - Common UI components
  - `Header.tsx` - Reusable header
  - `LoadingSpinner.tsx` - Loading indicator
  - `Toast.tsx` - Toast notifications
  - `ErrorBoundary.tsx` - Error handling

- **`/ui`** - UI-specific components
  - `BookingModal.tsx` - Booking modal dialog

### `/types` - TypeScript Definitions
- `index.ts` - All type definitions and interfaces

### `/utils` - Utility Functions
- `index.ts` - Helper functions for:
  - Date formatting
  - Phone number masking
  - Currency formatting
  - Validation utilities

### `/services` - API and Business Logic
- `api.ts` - Base API service class
- `auth.ts` - Authentication services
- `booking.ts` - Booking-related services
- `storage.ts` - Local storage utilities

## 🔄 Import Examples

### Clean Imports with Index Files
```typescript
// Instead of multiple imports
import Dashboard from './screens/main/Dashboard';
import EarningsScreen from './screens/main/EarningsScreen';

// Use grouped imports
import { Dashboard, EarningsScreen } from './screens/main';
```

### Cross-Module Imports
```typescript
// From any file, import from src
import { BookingRequest } from '../types';
import { formatDate, formatCurrency } from '../utils';
import { ApiService } from '../services';
```

## 🎯 Benefits

1. **Clear Separation** - Features are logically grouped
2. **Easy Navigation** - Find files quickly by functionality
3. **Scalable** - Easy to add new features in appropriate folders
4. **Clean Imports** - Index files provide clean import paths
5. **Maintainable** - Related code stays together
6. **Reusable** - Common components are easily accessible

## 📝 Naming Conventions

- **Screens**: `ScreenName.tsx` (PascalCase)
- **Components**: `ComponentName.tsx` (PascalCase)
- **Utils**: `functionName` (camelCase)
- **Types**: `TypeName` (PascalCase)
- **Services**: `ServiceName` (PascalCase)