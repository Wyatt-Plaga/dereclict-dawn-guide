import { Game } from '../Game';
import { CommandResult } from '../GameInterfaces';
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Game Class', () => {
  let game: Game;

  beforeEach(() => {
    // Create a new game instance before each test
    game = new Game();
  });

  afterEach(() => {
    // Clean up resources after each test
    game.cleanup();
  });

  test('should initialize with core systems', () => {
    // Verify that core systems are available
    expect(game.getResources()).toBeDefined();
    expect(game.getUpgrades()).toBeDefined();
    expect(game.getLogs()).toBeDefined();
    expect(game.getTime()).toBeDefined();
  });

  test('should allow event subscription and emission', () => {
    // Create a mock event handler
    const mockHandler = jest.fn();
    const eventType = 'test_event';

    // Subscribe to the event
    game.on(eventType, mockHandler);

    // Emit the event
    game.emit({
      id: 'test_1',
      type: eventType,
      timestamp: Date.now(),
      payload: { message: 'Test message' }
    });

    // Verify the handler was called
    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith(expect.objectContaining({
      type: eventType,
      payload: expect.objectContaining({
        message: 'Test message'
      })
    }));

    // Unsubscribe
    game.off(eventType, mockHandler);

    // Emit again
    game.emit({
      id: 'test_2',
      type: eventType,
      timestamp: Date.now(),
      payload: { message: 'Test message 2' }
    });

    // Verify handler wasn't called again
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  test('should execute commands', () => {
    // Create a mock command
    const mockCommand = {
      id: 'test_command',
      type: 'test',
      execute: jest.fn().mockReturnValue({
        success: true,
        message: 'Command executed successfully'
      }),
      validate: jest.fn().mockReturnValue(true)
    };

    // Execute the command
    const result = game.executeCommand(mockCommand);

    // Verify validation and execution
    expect(mockCommand.validate).toHaveBeenCalledTimes(1);
    expect(mockCommand.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: true,
      message: 'Command executed successfully'
    });
  });

  test('should save and load state', () => {
    // Create a sample resource
    const energy = game.getResources().createResource({
      id: 'energy',
      name: 'Energy',
      type: 'energy',
      amount: 100,
      capacity: 1000,
      lastUpdated: new Date().toISOString()
    });

    // Save the game state
    const savedState = game.saveState();

    // Create a new game with the saved state
    const newGame = new Game(savedState);

    // Verify resource was loaded
    const loadedEnergy = newGame.getResources().getResource('energy');
    expect(loadedEnergy).toBeDefined();
    expect(loadedEnergy?.getAmount()).toBe(100);
    expect(loadedEnergy?.getCapacity()).toBe(1000);
  });
}); 