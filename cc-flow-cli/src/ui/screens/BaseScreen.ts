/**
 * Base class for all TUI screens
 * Provides common functionality and consistent interface
 */
export abstract class BaseScreen {
  
  constructor() {
    // Common initialization logic for all screens
  }
  
  /**
   * Show the screen and return its result
   * Each screen should implement this method
   */
  abstract show(...args: any[]): Promise<any>;
  
  /**
   * Called when screen is entered (optional)
   */
  async onEnter?(): Promise<void> {
    // Default implementation - screens can override
  }
  
  /**
   * Called when screen is exited (optional)
   */
  async onExit?(): Promise<void> {
    // Default implementation - screens can override
  }
}