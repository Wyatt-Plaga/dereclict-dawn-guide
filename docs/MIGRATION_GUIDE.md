# Context Migration Guide

This guide will help you migrate your components from the monolithic Supabase context to the new split context system.

## Why We're Splitting the Context

Our Supabase context had grown too large and was handling multiple concerns:
1. Database connection and authentication
2. Game state management
3. Offline progress calculation
4. User profile management

By splitting these concerns into separate contexts, we:
- Improve code organization and maintainability
- Enable better testing
- Reduce unnecessary re-renders
- Support incremental adoption of the new system

## New Context System Overview

The new system consists of the following contexts:

1. **`DatabaseContext`**: Handles Supabase client initialization and basic database operations
   - `useDatabase()` hook

2. **`AuthContext`**: Manages authentication state and user profiles
   - `useAuth()` hook

3. **`GameStateContext`**: Handles game state, saving, and loading
   - `useGameState()` hook

4. **`OfflineProgressContext`**: Calculates and manages offline progress
   - `useOfflineProgress()` hook

All of these contexts are combined in a `RootProvider` that handles proper nesting.

## Migration Steps

### Step 1: Update Your Layout

Replace the `SupabaseProvider` with the new `RootProvider`:

```tsx
// Before
import { SupabaseProvider } from '@/utils/supabase/provider';

export default function Layout({ children }) {
  return (
    <SupabaseProvider>
      {children}
    </SupabaseProvider>
  );
}

// After
import { RootProvider } from '@/contexts/RootProvider';

export default function Layout({ children }) {
  return (
    <RootProvider>
      {children}
    </RootProvider>
  );
}
```

### Step 2: Update Your Component Imports

Replace the useSupabase import with the specific hooks you need:

```tsx
// Before
import { useSupabase } from '@/utils/supabase/context';

// After
import { useDatabase } from '@/contexts/database/DatabaseContext';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useGameState } from '@/contexts/game/GameStateContext';
import { useOfflineProgress } from '@/contexts/game/OfflineProgressContext';
```

### Step 3: Update Your Hook Usage

Replace the destructured properties from useSupabase with the appropriate hook calls:

```tsx
// Before
function MyComponent() {
  const { 
    supabase, 
    user, 
    gameProgress, 
    triggerSave, 
    calculateResourceOfflineProgress 
  } = useSupabase();
  
  // Component logic...
}

// After
function MyComponent() {
  // Only import the hooks you actually need
  const { supabase } = useDatabase();
  const { userId, userEmail } = useAuth();
  const { gameProgress, triggerSave } = useGameState();
  const { calculateResourceOfflineProgress } = useOfflineProgress();
  
  // Component logic...
}
```

### Step 4: Update Function References

Make sure you're calling the correct functions from the appropriate context:

```tsx
// Before
const handleSave = () => {
  triggerSave(updatedProgress);
};

// After - No change needed if you're importing triggerSave from useGameState
const handleSave = () => {
  triggerSave(updatedProgress);
};
```

## Using the Bridge Component (Temporary Solution)

If you need to gradually migrate your app, you can use the `SupabaseContextBridge` component, which provides a compatibility layer:

```tsx
import { SupabaseContextBridge } from '@/utils/supabase/migration';
import { RootProvider } from '@/contexts/RootProvider';

export default function Layout({ children }) {
  return (
    <RootProvider>
      <SupabaseContextBridge>
        {children}
      </SupabaseContextBridge>
    </RootProvider>
  );
}
```

This will allow components using the old `useSupabase` hook to continue working while you migrate them. However, this is a temporary solution and should be removed once all components are migrated.

## Testing Your Migration

1. Start by migrating smaller, leaf components first
2. Test each component thoroughly after migration
3. Use the browser console to check for any warnings or errors
4. Verify that game state is properly saved and loaded
5. Test offline progress calculations
6. Ensure authentication still works correctly

## FAQ

### Q: Do I need to migrate all components at once?
A: No, you can use the `SupabaseContextBridge` to gradually migrate your app.

### Q: Will this affect my saved game data?
A: No, the data structure remains the same, only the code that accesses it has changed.

### Q: I'm getting TypeScript errors after migrating, what should I do?
A: The new contexts use more specific types. Make sure you're properly typing your variables and functions.

### Q: Can I use multiple contexts in the same component?
A: Yes, you can use as many context hooks as you need in a component.

## Common Errors and Solutions

### "Cannot read property 'X' of undefined"
This usually means you're accessing a property from a context that isn't initialized yet. Make sure to add proper null checks.

### "Hook must be called in a function component"
Make sure you're not conditionally calling your hooks or calling them inside callbacks.

### "RootProvider not found"
Ensure you've replaced the SupabaseProvider with RootProvider in your layout component.

## Need Help?

If you encounter any issues during migration, please check the example components in `components/examples/MigrationExample.tsx` or reach out to the team. 