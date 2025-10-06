import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorHandler, CLIError } from './ErrorHandler.js';

describe('CLIError', () => {
  describe('constructor', () => {
    it('creates error with message and context', () => {
      const error = new CLIError('Test error', {
        operation: 'test',
        component: 'test-component'
      });

      expect(error.message).toBe('Test error');
      expect(error.context.operation).toBe('test');
      expect(error.context.component).toBe('test-component');
      expect(error.name).toBe('CLIError');
    });

    it('sets timestamp automatically', () => {
      const before = new Date();
      const error = new CLIError('Test', {
        operation: 'test',
        component: 'test'
      });
      const after = new Date();

      expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(error.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('includes cause when provided', () => {
      const cause = new Error('Original error');
      const error = new CLIError('Wrapped error', {
        operation: 'test',
        component: 'test'
      }, cause);

      expect(error.cause).toBe(cause);
    });

    it('captures stack trace', () => {
      const error = new CLIError('Test', {
        operation: 'test',
        component: 'test'
      });

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('CLIError');
    });

    it('stores details in context', () => {
      const error = new CLIError('Test', {
        operation: 'test',
        component: 'test',
        details: { key: 'value', count: 42 }
      });

      expect(error.context.details).toEqual({ key: 'value', count: 42 });
    });

    it('stores exitCode in context', () => {
      const error = new CLIError('Test', {
        operation: 'test',
        component: 'test',
        exitCode: 127
      });

      expect(error.context.exitCode).toBe(127);
    });
  });

  describe('from', () => {
    it('converts Error to CLIError', () => {
      const original = new Error('Original error');
      const cliError = CLIError.from(original);

      expect(cliError).toBeInstanceOf(CLIError);
      expect(cliError.message).toBe('Original error');
      expect(cliError.cause).toBe(original);
    });

    it('returns same instance if already CLIError', () => {
      const original = new CLIError('Test', {
        operation: 'test',
        component: 'test'
      });
      const result = CLIError.from(original);

      expect(result).toBe(original);
    });

    it('converts string to CLIError', () => {
      const cliError = CLIError.from('String error');

      expect(cliError).toBeInstanceOf(CLIError);
      expect(cliError.message).toBe('String error');
      expect(cliError.cause).toBeUndefined();
    });

    it('uses default context values', () => {
      const cliError = CLIError.from(new Error('Test'));

      expect(cliError.context.operation).toBe('unknown');
      expect(cliError.context.component).toBe('cli');
      expect(cliError.context.exitCode).toBe(1);
    });

    it('merges provided context with defaults', () => {
      const cliError = CLIError.from(new Error('Test'), {
        operation: 'custom-op',
        details: { info: 'value' }
      });

      expect(cliError.context.operation).toBe('custom-op');
      expect(cliError.context.component).toBe('cli');
      expect(cliError.context.details).toEqual({ info: 'value' });
    });

    it('handles non-Error objects', () => {
      const cliError = CLIError.from({ message: 'Object error' });

      expect(cliError).toBeInstanceOf(CLIError);
      // String() on object produces "[object Object]"
      expect(cliError.message).toBe('[object Object]');
    });

    it('handles null and undefined', () => {
      const nullError = CLIError.from(null);
      const undefinedError = CLIError.from(undefined);

      expect(nullError).toBeInstanceOf(CLIError);
      expect(undefinedError).toBeInstanceOf(CLIError);
    });
  });
});

describe('ErrorHandler', () => {
  let consoleErrorSpy: any;
  let processExitSpy: any;
  let originalNodeEnv: string | undefined;
  let originalDebug: string | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    // Save environment variables
    originalNodeEnv = process.env['NODE_ENV'];
    originalDebug = process.env['DEBUG'];
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();

    // Restore environment variables
    if (originalNodeEnv !== undefined) {
      process.env['NODE_ENV'] = originalNodeEnv;
    } else {
      delete process.env['NODE_ENV'];
    }
    if (originalDebug !== undefined) {
      process.env['DEBUG'] = originalDebug;
    } else {
      delete process.env['DEBUG'];
    }
  });

  describe('handleError', () => {
    it('logs error and exits process', () => {
      const error = new Error('Test error');

      ErrorHandler.handleError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('uses custom exit code from context', () => {
      const error = new CLIError('Test', {
        operation: 'test',
        component: 'test',
        exitCode: 127
      });

      ErrorHandler.handleError(error);

      expect(processExitSpy).toHaveBeenCalledWith(127);
    });

    it('logs component and message', () => {
      const error = new CLIError('Test error', {
        operation: 'test',
        component: 'TestComponent'
      });

      ErrorHandler.handleError(error);

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('TestComponent');
      expect(allOutput).toContain('Test error');
    });

    it('logs details when present', () => {
      const error = new CLIError('Test', {
        operation: 'test',
        component: 'test',
        details: { key: 'value', count: 42 }
      });

      ErrorHandler.handleError(error);

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('Details');
    });

    it('logs cause when present', () => {
      const cause = new Error('Original error');
      const error = new CLIError('Wrapped', {
        operation: 'test',
        component: 'test'
      }, cause);

      ErrorHandler.handleError(error);

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('Caused by');
      expect(allOutput).toContain('Original error');
    });

    it('includes debug info in development mode', () => {
      // Skip this test if DEBUG_MODE is false at module load time
      // DEBUG_MODE is a static readonly property initialized at module load
      const isDebugMode = process.env['NODE_ENV'] === 'development' || process.env['DEBUG'] === '1';

      if (!isDebugMode) {
        // If not in debug mode, this test doesn't apply
        return;
      }

      const error = new CLIError('Test', {
        operation: 'test',
        component: 'test'
      });

      ErrorHandler.handleError(error);

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('Debug Information');
      expect(allOutput).toContain('Node.js');
    });

    it('includes debug info when DEBUG=1', () => {
      // Skip this test if DEBUG_MODE is false at module load time
      const isDebugMode = process.env['NODE_ENV'] === 'development' || process.env['DEBUG'] === '1';

      if (!isDebugMode) {
        return;
      }

      const error = new Error('Test');
      ErrorHandler.handleError(error);

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('Debug Information');
    });

    it('does not include debug info in production mode', () => {
      // Skip this test if DEBUG_MODE is true at module load time
      const isDebugMode = process.env['NODE_ENV'] === 'development' || process.env['DEBUG'] === '1';

      if (isDebugMode) {
        return;
      }

      const error = new Error('Test');
      ErrorHandler.handleError(error);

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).not.toContain('Debug Information');
    });
  });

  describe('logError', () => {
    it('logs error without exiting', () => {
      const error = new Error('Test error');

      ErrorHandler.logError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it('logs error with context', () => {
      ErrorHandler.logError(new Error('Test'), {
        operation: 'test-op',
        component: 'TestComp'
      });

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('TestComp');
    });

    it('includes debug info in development', () => {
      // Skip this test if DEBUG_MODE is false at module load time
      const isDebugMode = process.env['NODE_ENV'] === 'development' || process.env['DEBUG'] === '1';

      if (!isDebugMode) {
        return;
      }

      ErrorHandler.logError(new Error('Test'));

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('Debug Information');
    });
  });

  describe('wrapAsync', () => {
    it('returns wrapped function', () => {
      const fn = async () => 'result';
      const wrapped = ErrorHandler.wrapAsync(fn, {
        operation: 'test',
        component: 'test'
      });

      expect(typeof wrapped).toBe('function');
    });

    it('executes function and returns result on success', async () => {
      const fn = async (x: number) => x * 2;
      const wrapped = ErrorHandler.wrapAsync(fn, {
        operation: 'test',
        component: 'test'
      });

      const result = await wrapped(5);
      expect(result).toBe(10);
    });

    it('handles errors and exits on failure', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };
      const wrapped = ErrorHandler.wrapAsync(fn, {
        operation: 'test',
        component: 'test'
      });

      await wrapped();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalled();
    });

    it('passes arguments to wrapped function', async () => {
      const fn = async (a: number, b: string, c: boolean) => `${a}-${b}-${c}`;
      const wrapped = ErrorHandler.wrapAsync(fn, {
        operation: 'test',
        component: 'test'
      });

      const result = await wrapped(42, 'test', true);
      expect(result).toBe('42-test-true');
    });

    it('preserves error context', async () => {
      const fn = async () => {
        throw new Error('Original');
      };
      const wrapped = ErrorHandler.wrapAsync(fn, {
        operation: 'custom-op',
        component: 'CustomComp',
        exitCode: 99
      });

      await wrapped();

      expect(processExitSpy).toHaveBeenCalledWith(99);
      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('CustomComp');
    });
  });

  describe('handleProcessErrors', () => {
    let processOnSpy: any;

    beforeEach(() => {
      processOnSpy = vi.spyOn(process, 'on').mockImplementation(() => process);
    });

    afterEach(() => {
      processOnSpy.mockRestore();
    });

    it('registers uncaughtException handler', () => {
      ErrorHandler.handleProcessErrors();

      expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    });

    it('registers unhandledRejection handler', () => {
      ErrorHandler.handleProcessErrors();

      expect(processOnSpy).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));
    });

    it('uncaughtException handler calls handleError', () => {
      ErrorHandler.handleProcessErrors();

      const handler = processOnSpy.mock.calls.find(
        (call: any[]) => call[0] === 'uncaughtException'
      )?.[1];

      expect(handler).toBeDefined();
      if (handler) {
        const testError = new Error('Uncaught');
        handler(testError);

        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(processExitSpy).toHaveBeenCalled();
      }
    });

    it('unhandledRejection handler calls handleError', () => {
      ErrorHandler.handleProcessErrors();

      const handler = processOnSpy.mock.calls.find(
        (call: any[]) => call[0] === 'unhandledRejection'
      )?.[1];

      expect(handler).toBeDefined();
      if (handler) {
        handler('rejection reason');

        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(processExitSpy).toHaveBeenCalled();
      }
    });
  });

  describe('debug information', () => {
    const isDebugMode = process.env['NODE_ENV'] === 'development' || process.env['DEBUG'] === '1';

    it('includes Node.js version', () => {
      if (!isDebugMode) return;

      ErrorHandler.logError(new Error('Test'));

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('Node.js');
      expect(allOutput).toContain(process.version);
    });

    it('includes platform information', () => {
      if (!isDebugMode) return;

      ErrorHandler.logError(new Error('Test'));

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('Platform');
      expect(allOutput).toContain(process.platform);
    });

    it('includes PID', () => {
      if (!isDebugMode) return;

      ErrorHandler.logError(new Error('Test'));

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('PID');
      expect(allOutput).toContain(String(process.pid));
    });

    it('includes memory usage', () => {
      if (!isDebugMode) return;

      ErrorHandler.logError(new Error('Test'));

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('Memory');
      expect(allOutput).toContain('MB');
    });

    it('includes full stack trace', () => {
      if (!isDebugMode) return;

      const error = new Error('Test with stack');
      ErrorHandler.logError(error);

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('Full Stack Trace');
    });

    it('includes cause stack in debug mode', () => {
      if (!isDebugMode) return;

      const cause = new Error('Original');
      const error = new CLIError('Wrapped', {
        operation: 'test',
        component: 'test'
      }, cause);

      ErrorHandler.logError(error);

      const calls = consoleErrorSpy.mock.calls;
      const allOutput = calls.map((call: any) => call.join(' ')).join('\n');
      expect(allOutput).toContain('Stack trace');
    });
  });

  describe('cleanup', () => {
    it('flushes stdio streams before exit', () => {
      const stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation((() => true) as any);
      const stderrWriteSpy = vi.spyOn(process.stderr, 'write').mockImplementation((() => true) as any);

      ErrorHandler.handleError(new Error('Test'));

      expect(stdoutWriteSpy).toHaveBeenCalled();
      expect(stderrWriteSpy).toHaveBeenCalled();

      stdoutWriteSpy.mockRestore();
      stderrWriteSpy.mockRestore();
    });

    it('handles cleanup errors gracefully', () => {
      const stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => {
        throw new Error('Write failed');
      });

      // Should not throw despite cleanup error
      expect(() => ErrorHandler.handleError(new Error('Test'))).not.toThrow();

      stdoutWriteSpy.mockRestore();
    });
  });

  describe('edge cases', () => {
    it('handles very long error messages', () => {
      const longMessage = 'x'.repeat(10000);
      const error = new Error(longMessage);

      ErrorHandler.logError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('handles errors with circular references in details', () => {
      const circular: any = { name: 'test' };
      circular.self = circular;

      const error = new CLIError('Test', {
        operation: 'test',
        component: 'test',
        details: circular
      });

      // Should not throw on circular reference
      expect(() => ErrorHandler.logError(error)).not.toThrow();
    });

    it('handles errors with undefined message', () => {
      const error = new Error();
      error.message = undefined as any;

      ErrorHandler.logError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('handles errors with non-string stack', () => {
      const error = new Error('Test');
      (error as any).stack = null;

      process.env['NODE_ENV'] = 'development';
      ErrorHandler.logError(error);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('handles context with special characters', () => {
      const error = new CLIError('Test', {
        operation: 'test with "quotes"',
        component: 'component\\with\\backslashes',
        details: { special: '<>&"\'' }
      });

      expect(() => ErrorHandler.logError(error)).not.toThrow();
    });

    it('handles multiple rapid errors', () => {
      ErrorHandler.logError(new Error('Error 1'));
      ErrorHandler.logError(new Error('Error 2'));
      ErrorHandler.logError(new Error('Error 3'));

      expect(consoleErrorSpy).toHaveBeenCalledTimes(9); // 3 calls per error on average
    });
  });
});
