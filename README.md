[![CodeGuide](/codeguide-backdrop.svg)](https://codeguide.dev)


# Derelict Dawn

A resource management game set aboard an abandoned space station. Manage energy, crew, insight, and scrap resources to restore the station and uncover its mysteries.

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Database:** [Supabase](https://supabase.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)

## Game Features

- 🌌 Manage multiple types of resources: energy, insight, crew, and scrap
- ⏱️ Offline progress calculation - resources accumulate even when you're not playing
- 🔄 Real-time resource updates
- 📱 Responsive UI that works on desktop and mobile
- 📜 Progressive story elements unlocked through gameplay

## Code Architecture

The project follows a modular architecture to ensure maintainability and scalability:

### Resource Management System

Resources are managed through a dedicated `ResourceManager` class that provides:

- Type-safe resource manipulation
- Centralized logic for resource calculations
- Offline progress tracking
- Validation of resource operations

```typescript
// Example usage
import { ResourceManager } from '@/utils/managers/ResourceManager';

// Update a resource
const updatedGame = ResourceManager.updateResource(
  gameProgress,
  'energy',
  'amount',
  newValue,
  saveFunction
);

// Calculate offline progress
const { updatedResources, gains } = ResourceManager.calculateOfflineProgress(gameProgress);
```

### Logging System

A centralized `Logger` utility provides consistent logging across the application:

- Configurable log levels (TRACE, DEBUG, INFO, WARN, ERROR)
- Environment-specific settings (development vs. production)
- Module-based context for easier debugging
- Log storage for critical information

```typescript
// Example usage
import { Logger } from '@/utils/logging/Logger';

const logger = new Logger('ModuleName');
logger.info('Operation completed successfully');
logger.warn('Approaching resource limit');
logger.error('Failed to save game state', { errorDetails });
```

### Constants and Type Definitions

Game constants and type definitions are centralized:

- Resource generation rates
- Default resource values
- Time constants
- Type definitions for game state and resources
- Type guards for type safety

## Recent Code Improvements

We've implemented several key improvements to enhance code quality:

1. **Resource Manager**: Centralized all resource operations in a dedicated class
2. **Logger Utility**: Created a robust logging system to replace console logs
3. **Type Safety**: Enhanced type definitions with proper discriminated unions and type guards
4. **Constants Management**: Centralized all game constants in a single file
5. **Deep Clone Optimization**: Replaced inefficient JSON parse/stringify with lodash's cloneDeep

## Development

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/derelict-dawn.git
   cd derelict-dawn
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000) with your browser**

### Code Organization

```
derelict-dawn/
├── app/                # Next.js app router pages
├── components/         # React components
├── types/              # TypeScript type definitions
├── utils/
│   ├── constants/      # Game constants
│   ├── managers/       # Resource and game managers
│   │   └── ResourceManager.ts
│   ├── logging/        # Logging utilities
│   │   ├── Logger.ts
│   │   └── migrateConsoleLog.ts
│   ├── game-helpers.ts # Game helper functions
│   └── offline-progress.ts # Offline progress calculation
├── public/            # Static assets
└── styles/            # Global styles
```

## Ongoing Improvements

See [code-improvements.md](./code-improvements.md) for a complete list of ongoing and completed code improvements.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
