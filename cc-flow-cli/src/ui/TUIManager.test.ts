import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TUIManager } from './TUIManager.js';

/**
 * Kent Beck TDD Test List for TUI Manager:
 * 1. ✗ TUIManager should exist and be instantiable
 * 2. ✗ Should display welcome screen
 * 3. ✗ Should navigate between screens
 * 4. ✗ Should handle keyboard input accessibly  
 * 5. ✗ Should support screen reader announcements
 * 6. ✗ Should handle errors gracefully with context
 */

describe('TUIManager', () => {
  let tuiManager: TUIManager;
  let mockConsole: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Kent Beck: "Isolated Test" - each test starts fresh
    tuiManager = new TUIManager();
    mockConsole = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up mocks
    mockConsole.mockRestore();
  });

  it('should exist and be instantiable', () => {
    // Kent Beck: "Evident Data" - the simplest test that could fail
    expect(tuiManager).toBeDefined();
    expect(tuiManager).toBeInstanceOf(TUIManager);
  });

  it('should have essential TUI methods', () => {
    // Kent Beck: Test the interface before implementation
    expect(typeof tuiManager.start).toBe('function');
    expect(typeof tuiManager.showScreen).toBe('function');
    expect(typeof tuiManager.handleInput).toBe('function');
  });

  it('should start with welcome screen by default', async () => {
    // Kent Beck: "Assert First" pattern
    const startPromise = tuiManager.start();
    
    // This will fail initially (Red phase)
    expect(mockConsole).toHaveBeenCalledWith(
      expect.stringContaining('Welcome to CC-Flow CLI')
    );
    
    // Clean up the async operation
    tuiManager.close?.();
  });

  it('should support accessibility announcements', () => {
    // Following accessibility-checker agent patterns
    expect(typeof tuiManager.announceToScreenReader).toBe('function');
  });

  it('should handle navigation between screens', async () => {
    // Kent Beck: "One to Many" - first test single navigation
    await tuiManager.showScreen('directory-selection');
    
    expect(tuiManager.getCurrentScreen()).toBe('directory-selection');
  });

  it('should provide error context when operations fail', async () => {
    // Following error-handler agent patterns
    const invalidScreen = 'non-existent-screen';
    
    await expect(tuiManager.showScreen(invalidScreen)).rejects.toThrow(
      expect.objectContaining({
        context: expect.objectContaining({
          operation: 'screen-navigation',
          screenName: invalidScreen
        })
      })
    );
  });
});