import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ShellExecutor } from './ShellExecutor.js';
import { exec } from 'child_process';

// Mock child_process
vi.mock('child_process', () => ({
  exec: vi.fn()
}));

describe('ShellExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('execute', () => {
    it('returns stdout and code 0 for successful command', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        callback(null, 'success output', '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('echo "test"');

      expect(result.code).toBe(0);
      expect(result.stdout).toBe('success output');
      expect(result.stderr).toBe('');
    });

    it('returns error code for failed command', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        const error: any = new Error('Command failed');
        error.code = 127;
        callback(error, '', 'command not found');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('invalid-command');

      expect(result.code).toBe(127);
      expect(result.stdout).toBe('');
      expect(result.stderr).toBe('command not found');
    });

    it('uses default error code 1 when error.code is undefined', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        callback(new Error('Generic error'), '', 'error occurred');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('failing-command');

      expect(result.code).toBe(1);
      expect(result.stderr).toBe('error occurred');
    });

    it('uses custom working directory when provided', async () => {
      const mockExec = vi.mocked(exec);
      let capturedOptions: any;

      mockExec.mockImplementation(((
        _cmd: string,
        opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        capturedOptions = opts;
        callback(null, 'output', '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      await ShellExecutor.execute('ls', { cwd: '/custom/path' });

      expect(capturedOptions.cwd).toBe('/custom/path');
    });

    it('uses process.cwd() as default working directory', async () => {
      const mockExec = vi.mocked(exec);
      let capturedOptions: any;

      mockExec.mockImplementation(((
        _cmd: string,
        opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        capturedOptions = opts;
        callback(null, 'output', '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      await ShellExecutor.execute('ls');

      expect(capturedOptions.cwd).toBe(process.cwd());
    });

    it('uses custom timeout when provided', async () => {
      const mockExec = vi.mocked(exec);
      let capturedOptions: any;

      mockExec.mockImplementation(((
        _cmd: string,
        opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        capturedOptions = opts;
        callback(null, 'output', '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      await ShellExecutor.execute('long-running-command', { timeout: 60000 });

      expect(capturedOptions.timeout).toBe(60000);
    });

    it('uses default timeout of 30000ms when not provided', async () => {
      const mockExec = vi.mocked(exec);
      let capturedOptions: any;

      mockExec.mockImplementation(((
        _cmd: string,
        opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        capturedOptions = opts;
        callback(null, 'output', '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      await ShellExecutor.execute('command');

      expect(capturedOptions.timeout).toBe(30000);
    });

    it('handles empty stdout and stderr', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        callback(null, '', '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('silent-command');

      expect(result.stdout).toBe('');
      expect(result.stderr).toBe('');
      expect(result.code).toBe(0);
    });

    it('handles commands with both stdout and stderr', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        callback(null, 'standard output', 'warning message');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('command-with-warnings');

      expect(result.stdout).toBe('standard output');
      expect(result.stderr).toBe('warning message');
      expect(result.code).toBe(0);
    });

    it('rejects promise on process error event', async () => {
      const mockExec = vi.mocked(exec);
      const mockOn = vi.fn();
      const testError = new Error('Process spawn error');

      mockExec.mockImplementation((() => {
        return {
          on: mockOn
        } as any;
      }) as any);

      const executePromise = ShellExecutor.execute('failing-spawn');

      // Trigger the error event
      const errorHandler = mockOn.mock.calls.find(call => call[0] === 'error')?.[1];
      if (errorHandler) {
        errorHandler(testError);
      }

      await expect(executePromise).rejects.toThrow('Process spawn error');
    });

    it('handles multiline stdout output', async () => {
      const mockExec = vi.mocked(exec);
      const multilineOutput = 'line 1\nline 2\nline 3';

      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        callback(null, multilineOutput, '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('multi-line-command');

      expect(result.stdout).toBe(multilineOutput);
      expect(result.stdout.split('\n')).toHaveLength(3);
    });

    it('handles special characters in output', async () => {
      const mockExec = vi.mocked(exec);
      const specialOutput = 'Output with "quotes" and \\ backslashes';

      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        callback(null, specialOutput, '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('special-chars');

      expect(result.stdout).toBe(specialOutput);
    });

    it('handles null/undefined in error callback parameters gracefully', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: any, stderr: any) => void
      ) => {
        callback(null, null, null);
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('command');

      expect(result.stdout).toBe('');
      expect(result.stderr).toBe('');
    });

    it('handles large output efficiently', async () => {
      const mockExec = vi.mocked(exec);
      const largeOutput = 'x'.repeat(10000);

      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        callback(null, largeOutput, '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('large-output-command');

      expect(result.stdout.length).toBe(10000);
      expect(result.code).toBe(0);
    });

    it('executes multiple commands sequentially', async () => {
      const mockExec = vi.mocked(exec);
      let executionCount = 0;

      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        executionCount++;
        callback(null, `output ${executionCount}`, '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result1 = await ShellExecutor.execute('command1');
      const result2 = await ShellExecutor.execute('command2');
      const result3 = await ShellExecutor.execute('command3');

      expect(result1.stdout).toBe('output 1');
      expect(result2.stdout).toBe('output 2');
      expect(result3.stdout).toBe('output 3');
      expect(executionCount).toBe(3);
    });

    it('handles timeout scenario', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        const error: any = new Error('Command timed out');
        error.code = undefined; // timeout may not set numeric code
        callback(error, 'partial output', 'timeout error');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('long-command', { timeout: 1000 });

      expect(result.code).toBe(1); // Should use default code 1
      expect(result.stdout).toBe('partial output');
      expect(result.stderr).toBe('timeout error');
    });

    it('preserves command output encoding', async () => {
      const mockExec = vi.mocked(exec);
      const unicodeOutput = 'Hello 世界 🌍';

      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        callback(null, unicodeOutput, '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('unicode-command');

      expect(result.stdout).toBe(unicodeOutput);
    });
  });

  describe('error scenarios', () => {
    it('handles permission denied errors', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        const error: any = new Error('Permission denied');
        error.code = 126;
        callback(error, '', 'Permission denied');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('restricted-command');

      expect(result.code).toBe(126);
      expect(result.stderr).toContain('Permission denied');
    });

    it('handles command not found errors', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        const error: any = new Error('Command not found');
        error.code = 127;
        callback(error, '', 'command not found');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('nonexistent-command');

      expect(result.code).toBe(127);
    });

    it('handles syntax errors in command', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        const error: any = new Error('Syntax error');
        error.code = 2;
        callback(error, '', 'syntax error near unexpected token');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('malformed command &|&');

      expect(result.code).toBe(2);
      expect(result.stderr).toContain('syntax error');
    });
  });

  describe('options validation', () => {
    it('accepts empty options object', async () => {
      const mockExec = vi.mocked(exec);
      mockExec.mockImplementation(((
        _cmd: string,
        _opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        callback(null, 'output', '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      const result = await ShellExecutor.execute('command', {});

      expect(result.code).toBe(0);
    });

    it('accepts options with only cwd', async () => {
      const mockExec = vi.mocked(exec);
      let capturedOptions: any;

      mockExec.mockImplementation(((
        _cmd: string,
        opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        capturedOptions = opts;
        callback(null, 'output', '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      await ShellExecutor.execute('command', { cwd: '/test/dir' });

      expect(capturedOptions.cwd).toBe('/test/dir');
      expect(capturedOptions.timeout).toBe(30000);
    });

    it('accepts options with only timeout', async () => {
      const mockExec = vi.mocked(exec);
      let capturedOptions: any;

      mockExec.mockImplementation(((
        _cmd: string,
        opts: any,
        callback: (error: any, stdout: string, stderr: string) => void
      ) => {
        capturedOptions = opts;
        callback(null, 'output', '');
        return {
          on: vi.fn()
        } as any;
      }) as any);

      await ShellExecutor.execute('command', { timeout: 5000 });

      expect(capturedOptions.cwd).toBe(process.cwd());
      expect(capturedOptions.timeout).toBe(5000);
    });
  });
});
