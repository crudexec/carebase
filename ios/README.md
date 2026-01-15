# Carebase iOS App

A beautifully designed iOS app for carers, built with SwiftUI and inspired by Jony Ive's design philosophy - minimalist, intuitive, and human-centered.

## Design Philosophy

- **Minimalism**: Remove all unnecessary elements
- **Clean Typography**: SF Pro with clear hierarchy
- **Generous Whitespace**: Breathing room for clarity
- **Subtle Animations**: Purposeful, never distracting
- **Intuitive Gestures**: Natural interactions
- **Focus on Content**: The UI disappears, content shines

## Project Structure

```
CarebaseApp/
├── App/
│   └── CarebaseApp.swift           # App entry point
├── Core/
│   ├── Models/
│   │   └── Models.swift            # Data models (User, Client, Shift, etc.)
│   ├── Network/
│   │   └── APIClient.swift         # API networking layer
│   └── Extensions/
├── DesignSystem/
│   ├── Tokens/
│   │   ├── ColorTokens.swift       # Color palette
│   │   ├── TypographyTokens.swift  # Typography system
│   │   └── SpacingTokens.swift     # Spacing & layout
│   ├── Components/
│   │   ├── CarebaseButton.swift    # Button components
│   │   ├── CarebaseCard.swift      # Card components
│   │   ├── CarebaseTextField.swift # Input components
│   │   ├── StatusBadge.swift       # Status indicators
│   │   └── ListRow.swift           # List item components
│   └── Animations/
│       └── Animations.swift        # Animation tokens & shimmer
├── Features/
│   ├── Authentication/
│   │   ├── AuthenticationManager.swift
│   │   └── AuthenticationView.swift
│   ├── Dashboard/
│   │   ├── MainTabView.swift
│   │   └── DashboardView.swift
│   ├── Shifts/
│   │   ├── ShiftsView.swift
│   │   └── ShiftDetailView.swift
│   ├── VisitNotes/
│   │   ├── VisitNotesListView.swift
│   │   └── NewVisitNoteView.swift
│   ├── Clients/
│   │   └── ClientsListView.swift
│   ├── Notifications/
│   │   └── NotificationsView.swift
│   └── Profile/
│       └── ProfileView.swift
└── Resources/
```

## Features

### Authentication

- Clean, focused login experience
- Secure token storage in Keychain
- Automatic session restoration

### Dashboard

- Personalized greeting based on time of day
- Today's overview with key stats
- Active shift tracking with live timer
- Quick actions for common tasks
- Recent visit notes

### Shifts

- Filterable shift list (Today, Upcoming, Completed)
- Grouped by date for easy scanning
- Detailed shift view with:
  - Client information
  - Time and location
  - Map preview
  - Check-in/Check-out actions
  - Navigation to Maps app

### Visit Notes

- Dynamic form rendering
- Template selection
- Multiple field types:
  - Text (short/long)
  - Single/Multiple choice
  - Rating scale
  - Yes/No toggle
- Progress indicator
- Real-time validation

### Clients

- Searchable client list
- Client profiles with:
  - Care needs
  - Contact information
  - Emergency contacts
  - Quick actions (call, directions)

### Notifications

- Grouped by date
- Read/unread states
- Mark all as read
- Different notification types with distinct icons

### Profile

- User stats display
- Appearance settings (light/dark mode)
- Account management
- Support links

## Requirements

- iOS 17.0+
- Xcode 15.0+
- Swift 5.9+

## Setup

1. Open the project in Xcode:

   ```bash
   cd ios/CarebaseApp
   open CarebaseApp.xcodeproj
   ```

2. Configure the API base URL in `APIClient.swift` or set the `API_BASE_URL` environment variable.

3. Build and run on simulator or device.

## Design Tokens

### Colors

- Semantic color system with light/dark mode support
- Status colors for shifts and indicators
- Soft accent colors for backgrounds

### Typography

- Display: Bold, rounded for major headlines
- Headlines: Semibold for section titles
- Body: Regular for content
- Labels: Medium for UI elements
- Monospace: For times and codes

### Spacing

- Based on 8pt grid system
- Named values: xs (8), sm (12), md (16), lg (24), xl (32)
- Generous screen padding (20pt horizontal)

### Animations

- Quick (0.15s): Snappy interactions
- Standard (0.25s): Normal transitions
- Emphasized: Spring animations
- Haptic feedback on all interactions

## API Integration

The app is designed to work with the Carebase backend API. Key endpoints:

- `POST /api/auth/login` - Authentication
- `GET /api/shifts` - List shifts
- `POST /api/shifts/:id/check-in` - Check in to shift
- `POST /api/shifts/:id/check-out` - Check out from shift
- `GET /api/clients` - List assigned clients
- `GET /api/visit-notes/templates/enabled` - Get form templates
- `POST /api/visit-notes` - Submit visit note
- `GET /api/notifications` - Get notifications

## Contributing

1. Follow the existing design patterns
2. Use the design system tokens
3. Maintain the minimalist aesthetic
4. Test on both light and dark modes
5. Ensure accessibility compliance
