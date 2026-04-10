import { GameState } from '../types';

/**
 * Maps a resource name (e.g. 'energy', 'insight', 'scrap', 'crew', 'relics')
 * to the actual object + key in GameState where it's stored.
 *
 * Primary resources are at categories.<wing>.resources.primary
 * Secondary/tertiary are at categories.<wing>.resources.secondary / .tertiary
 */
export function getResourceAccessor(
  state: GameState,
  resourceType: string
): { obj: Record<string, number>; key: string } | null {
  switch (resourceType) {
    // Primary resources
    case 'energy':
      return { obj: state.categories.reactor.resources as unknown as Record<string, number>, key: 'primary' };
    case 'insight':
      return { obj: state.categories.processor.resources as unknown as Record<string, number>, key: 'primary' };
    case 'crew':
      return { obj: state.categories.crewQuarters.resources as unknown as Record<string, number>, key: 'primary' };
    case 'scrap':
      return { obj: state.categories.manufacturing.resources as unknown as Record<string, number>, key: 'primary' };

    // Secondary resources
    case 'fuelRods':
      return { obj: state.categories.reactor.resources as unknown as Record<string, number>, key: 'secondary' };
    case 'dataBanks':
      return { obj: state.categories.processor.resources as unknown as Record<string, number>, key: 'secondary' };
    case 'barracks':
      return { obj: state.categories.crewQuarters.resources as unknown as Record<string, number>, key: 'secondary' };
    case 'alloys':
      return { obj: state.categories.manufacturing.resources as unknown as Record<string, number>, key: 'secondary' };

    // Tertiary resources
    case 'thermalCores':
      return { obj: state.categories.reactor.resources as unknown as Record<string, number>, key: 'tertiary' };
    case 'algorithms':
      return { obj: state.categories.processor.resources as unknown as Record<string, number>, key: 'tertiary' };
    case 'commandTokens':
      return { obj: state.categories.crewQuarters.resources as unknown as Record<string, number>, key: 'tertiary' };
    case 'schematics':
      return { obj: state.categories.manufacturing.resources as unknown as Record<string, number>, key: 'tertiary' };

    // Universal
    case 'relics':
      return { obj: state as unknown as Record<string, number>, key: 'relics' };

    default:
      return null;
  }
}
