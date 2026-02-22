# Prayer Times System Documentation

This document explains the architecture and usage of the new prayer times system with timer functionality, blinking notifications, and refactored components.

## Architecture Overview

The prayer system consists of:

1. **Context Layer** - Manages global prayer state
2. **Hooks Layer** - Provides reusable timer and timing logic
3. **Components Layer** - Composable UI components
4. **Grid & Page Layer** - Higher-level orchestration

### Folder Structure

```
src/pages/prayer-times-page/
├── components/
│   ├── PrayerCard.tsx          # Main prayer card component
│   ├── PrayerName.tsx          # Prayer name display (DE/AR)
│   ├── PrayerTimeDisplay.tsx   # Time display with optional blinking
│   ├── PrayerTimer.tsx         # Countdown timer display
│   └── index.ts                # Exports
├── contexts/
│   ├── next-prayer-context.tsx # Global next prayer state
│   └── index.ts                # Exports
├── hooks/
│   ├── useTimer.ts             # Timer hook
│   └── index.ts                # Exports
├── prayer-times-grid.tsx       # Grid layout for all prayers
├── prayer-times-page.tsx       # Main page (orchestrator)
├── constants.ts                # Prayer name mappings
├── header.tsx                  # Header with logo and dates
└── footer.tsx                  # Footer with mosque info
```

## Components

### PrayerCard

The main prayer component that displays all prayer information and timer.

**Props:**
```typescript
interface PrayerCardProps {
  prayerName: PrayerName;        // Prayer identifier
  prayerTime?: string;           // Prayer time (HH:MM)
  showTimer?: boolean;           // Show countdown timer
  blinkOnPrayer?: boolean;       // Blink when prayer time arrives
  blinkOnIqama?: boolean;        // Blink when iqama time arrives
  onPrayerTime?: () => void;     // Callback when prayer time reached
  onIqamaTime?: () => void;      // Callback when iqama time reached
}
```

**Example Usage:**
```tsx
<PrayerCard
  prayerName="fajr"
  prayerTime="05:30"
  showTimer={true}
  blinkOnPrayer={true}
/>
```

### PrayerName

Displays prayer name in German and Arabic.

**Props:**
```typescript
interface PrayerNameProps {
  prayerName: PrayerName;
  showArabic?: boolean;
}
```

### PrayerTimeDisplay

Shows individual time with optional blinking animation.

**Props:**
```typescript
interface PrayerTimeDisplayProps {
  label: string;        // Display label ("Prayer Time", "Iqama Time")
  time: string | null;  // Time to display
  isBlink?: boolean;    // Animate blinking
}
```

### PrayerTimer

Countdown timer component with blinking support.

**Props:**
```typescript
interface PrayerTimerProps {
  timeRemaining: string;  // "MM:SS" format
  isActive?: boolean;     // Show/hide timer
  isBlink?: boolean;      // Animate blinking
}
```

## Hooks

### useTimer

A custom hook for countdown timer functionality.

**Usage:**
```typescript
import { useTimer } from '@/pages/prayer-times-page/hooks';

const { timeRemaining, secondsRemaining, isExpired } = useTimer({
  targetTime: "05:30",           // Target time HH:MM
  onReached: () => console.log("Time reached!"),
  isActive: true
});

// Returns:
// - timeRemaining: string (MM:SS)
// - secondsRemaining: number
// - isExpired: boolean
```

## Contexts

### NextPrayerProvider & useNextPrayer

Provides global state about the next upcoming prayer.

**Setup (in prayer-times-page.tsx):**
```typescript
<NextPrayerProvider
  prayerTimes={todayPrayerTimes}
  iqamaTimes={iqamaTimesMap}
>
  <YourContent />
</NextPrayerProvider>
```

**Usage in components:**
```typescript
import { useNextPrayer } from '@/pages/prayer-times-page/contexts';

function MyComponent() {
  const nextPrayer = useNextPrayer();
  
  // Access:
  // - nextPrayer.nextPrayerName: PrayerName
  // - nextPrayer.nextPrayerTime: string
  // - nextPrayer.nextIqamaTime: string
  // - nextPrayer.isBlinkingPrayer: boolean
  // - nextPrayer.isBlinkingIqama: boolean
  // - nextPrayer.timeUntilNextPrayer: number (seconds)
  // - nextPrayer.timeUntilNextIqama: number (seconds)
}
```

## How It Works

### Prayer Timing Logic

1. **Initialization:**
   - NextPrayerProvider calculates next prayer on mount
   - Finds first prayer time after current time
   - If no prayer found today, next is Fajr tomorrow

2. **Timer Loop:**
   - Runs every second
   - Calculates time until prayer and iqama
   - Only shows timer on the next prayer's card

3. **Blinking Behavior:**
   - Blinks when time ≤ 5 minutes and ≥ -5 minutes
   - Uses `animate-pulse` CSS class
   - Automatically stops after 5 minutes past the time

4. **State Updates:**
   - PrayerTimesGrid uses `useNextPrayer()` to get next prayer
   - Only the next prayer card gets `showTimer={true}`
   - Other cards show static information

## Example: Customizing Behavior

To create a card that always shows a timer (for testing):

```tsx
<PrayerCard
  prayerName="dhuhr"
  prayerTime="12:45"
  showTimer={true}
  blinkOnPrayer={true}
  blinkOnIqama={true}
  onPrayerTime={() => console.log("Dhuhr time!")}
  onIqamaTime={() => console.log("Iqama time!")}
/>
```

To add custom styling when a prayer is active:

```tsx
const nextPrayer = useNextPrayer();

return (
  <div className={nextPrayer.nextPrayerName === 'fajr' ? 'ring-2 ring-primary' : ''}>
    {/* content */}
  </div>
);
```

## CSS Classes for Styling

- `animate-pulse` - Blinking animation (applied automatically to relevant elements)
- `ring-2 ring-primary` - Visual highlight for active card

## Time Format

All times are in 24-hour format: `HH:MM`
- Example: "05:30" for 5:30 AM
- Example: "17:45" for 5:45 PM

## Performance Considerations

- useTimer updates every second via `setInterval`
- NextPrayerProvider updates every second
- Consider memoization for heavy components
- Intervals are properly cleaned up on unmount

## Troubleshooting

**Timer not showing:**
- Ensure `showTimer={true}` prop is set
- Check that `prayerTime` prop is provided
- Verify NextPrayerProvider is wrapping the component

**Blinking not working:**
- Ensure `blinkOnPrayer` or `blinkOnIqama` is set to `true`
- Check browser console for errors
- Verify Tailwind CSS is properly configured

**Next prayer not updating:**
- Check that NextPrayerProvider has valid `prayerTimes` and `iqamaTimes`
- Verify time values are in correct HH:MM format
- Ensure provider is wrapping all consumer components
