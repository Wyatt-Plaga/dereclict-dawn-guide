# Derelict Dawn Save System

## Overview

The save system uses the Adapter pattern to allow seamless switching between local storage (localforage) and cloud storage (Supabase) backends.

## Architecture

```
┌─────────────────┐      ┌───────────────┐      ┌────────────────┐
│    GameEngine   │<─────│   SaveSystem  │<─────│  StorageAdapter│
└─────────────────┘      └───────────────┘      └────────────────┘
       Game Logic          Save/Load Logic        Storage Interface
                                                 ┌─────────┬─────────┐
                                                 │LocalForge│Supabase│
                                                 └─────────┴─────────┘
```

## Components

### StorageAdapter

An interface that defines the core operations for a storage mechanism:
- `save(key, data)`
- `load(key)`
- `delete(key)`
- `getAllKeys()`

### LocalForageAdapter

Implements the StorageAdapter interface using localforage, which provides:
- IndexedDB as the primary storage backend
- localStorage as a fallback
- Simple Promise-based API

### SupabaseAdapter (Future)

A template for future implementation of cloud storage using Supabase.

## SaveSystem

Provides high-level save functionality:
- Automatic saving with configurable intervals
- Version tracking for migration support
- Play time tracking
- Metadata management

## Save Format

```typescript
{
  id: string;           // Unique ID for this save
  version: string;      // Game version (for migration)
  timestamp: number;    // When saved
  state: GameState;     // The actual game state
  metadata: {
    playTime: number;   // Total play time in seconds
    lastPlayed: string; // Date of last play
    // Additional metadata can be added
  }
}
```

## Database Structure

The Supabase schema includes:

### game_saves table

- `id`: UUID (primary key)
- `user_id`: UUID (references auth.users)
- `version`: TEXT
- `timestamp`: TIMESTAMPTZ
- `state`: JSONB
- `metadata`: JSONB
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### game_save_pointers table

- `user_id`: UUID (primary key, references auth.users)
- `current_save_id`: UUID (references game_saves.id)
- `updated_at`: TIMESTAMPTZ

## Usage

### Basic Usage

The GameEngine automatically initializes and uses the SaveSystem:

```typescript
// GameEngine handles save/load internally
await gameEngine.initialize(); // Tries to load existing save
```

### Manual Save/Load

```typescript
// Save current game state
await gameEngine.saveGame();

// Load saved game
const loaded = await gameEngine.loadGame();
```

## Configuration

- Auto-save interval is set to 250ms (every quarter second)
- Save data uses a versioning system for future-proofing
- Saving is performed asynchronously to prevent UI blocking 