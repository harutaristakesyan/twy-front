# Analytics Usage

## Overview

The analytics system provides a centralized way to track user events and identify users across your application.

## Setup

The `AmplitudeAnalyticsProvider` is already wrapped around your app in `src/app/index.tsx`.

## Using Analytics in Your Components

Import the `useAnalytics` hook from the analytics context:

```tsx
import { useAnalytics } from '@/lib/analytics/AnalyticsContext'

function YourComponent() {
  const { trackEvent, setUser } = useAnalytics()

  // Track an event
  const handleButtonClick = () => {
    trackEvent('button_clicked', {
      buttonName: 'submit',
      page: 'home',
    })
  }

  // Set user identity (typically after login)
  const handleLogin = (userId: string) => {
    setUser(userId)
  }

  return <button onClick={handleButtonClick}>Click Me</button>
}
```

## API

### `trackEvent(name: string, data?: Record<string, any>)`

Track a custom event with optional properties.

**Example:**

```tsx
trackEvent('page_viewed', {
  page: '/dashboard',
  source: 'navigation',
})
```

### `setUser(id: string)`

Identify a user for tracking purposes.

**Example:**

```tsx
setUser('user-123')
```

## Providers

### `AmplitudeAnalyticsProvider`

Production analytics provider using Amplitude. Configured in `src/app/index.tsx`.

### `LocalAnalyticsProvider`

Development analytics provider that logs to console. Useful for testing without sending data to Amplitude.

To use the local provider instead, replace `AmplitudeAnalyticsProvider` with `LocalAnalyticsProvider` in `src/app/index.tsx`.
