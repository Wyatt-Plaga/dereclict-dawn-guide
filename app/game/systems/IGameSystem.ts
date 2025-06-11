export interface IGameSystem {
  /**
   * Optional name/debug label
   */
  readonly id?: string;

  /**
   * Per-frame update; should mutate the provided GameState in place.
   */
  update(state: import('../types').GameState, delta: number): void;
} 
