import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { useGameResources } from '../useGameResources';
import { useGameEngine } from '../../providers/GameEngineProvider';
import { Game } from '../../../core/game/Game';
import { ResourceManager } from '../../../domain/resources/services/ResourceManager';
import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock the useGameEngine hook
jest.mock('../../providers/GameEngineProvider');

describe('useGameResources', () => {
  let mockGame: Game;
  let mockResourceManager: ResourceManager;
  
  beforeEach(() => {
    // Create a mock game instance
    mockGame = {
      getResources: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    } as unknown as Game;
    
    // Create a mock resource manager
    mockResourceManager = {
      getAllResources: jest.fn(),
      getResource: jest.fn(),
      hasResource: jest.fn()
    } as unknown as ResourceManager;
    
    // Set up the mock implementation
    (mockGame.getResources as jest.Mock).mockReturnValue(mockResourceManager);
    
    // Mock the useGameEngine hook
    (useGameEngine as jest.Mock).mockReturnValue({
      game: mockGame,
      initialized: true
    });
  });
  
  test('should get resources from the game', () => {
    // Set up mock resources
    const mockResources = [
      {
        getId: () => 'energy',
        getAmount: () => 100,
        getCapacity: () => 1000,
        add: jest.fn(),
        subtract: jest.fn(),
        canAfford: jest.fn()
      }
    ];
    
    (mockResourceManager.getAllResources as jest.Mock).mockReturnValue(mockResources);
    
    // Render the hook
    const { result } = renderHook(() => useGameResources());
    
    // Verify resources are retrieved
    expect(mockGame.getResources).toHaveBeenCalled();
    expect(mockResourceManager.getAllResources).toHaveBeenCalled();
    expect(result.current.resources).toEqual(mockResources);
  });
  
  test('should get a resource by ID', () => {
    // Set up mock resources
    const mockResource = {
      getId: () => 'energy',
      getAmount: () => 100,
      getCapacity: () => 1000,
      add: jest.fn(),
      subtract: jest.fn(),
      canAfford: jest.fn()
    };
    
    const mockResources = [mockResource];
    
    (mockResourceManager.getAllResources as jest.Mock).mockReturnValue(mockResources);
    (mockResourceManager.getResource as jest.Mock).mockImplementation((id: string) => {
      if (id === 'energy') return mockResource;
      return undefined;
    });
    
    // Render the hook
    const { result } = renderHook(() => useGameResources());
    
    // Call getResource
    const resource = result.current.getResource('energy');
    
    // Verify resource is found
    expect(resource).toBe(mockResource);
    expect(resource?.getId()).toBe('energy');
    
    // Verify non-existent resource returns undefined
    expect(result.current.getResource('non-existent')).toBeUndefined();
  });
  
  test('should add resources', () => {
    // Set up mock resources
    const mockResource = {
      getId: () => 'energy',
      getAmount: () => 100,
      getCapacity: () => 1000,
      add: jest.fn(),
      subtract: jest.fn(),
      canAfford: jest.fn()
    };
    
    const mockResources = [mockResource];
    
    (mockResourceManager.getAllResources as jest.Mock).mockReturnValue(mockResources);
    (mockResourceManager.getResource as jest.Mock).mockImplementation((id: string) => {
      if (id === 'energy') return mockResource;
      return undefined;
    });
    
    // Render the hook
    const { result } = renderHook(() => useGameResources());
    
    // Call addResource
    const success = result.current.addResource('energy', 50);
    
    // Verify resource was added to
    expect(success).toBe(true);
    expect(mockResource.add).toHaveBeenCalledWith(50);
    
    // Verify adding to non-existent resource fails
    const failedSuccess = result.current.addResource('non-existent', 50);
    expect(failedSuccess).toBe(false);
  });
}); 