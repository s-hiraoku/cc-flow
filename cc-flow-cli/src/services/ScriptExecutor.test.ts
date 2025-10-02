import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScriptExecutor } from './ScriptExecutor.js';
import { CLIError } from '../utils/ErrorHandler.js';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import type { WorkflowConfig } from '../models/Agent.js';

// Mock dependencies
vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(),
  accessSync: vi.fn(),
  constants: {
    F_OK: 0,
    X_OK: 1
  }
}));

describe('ScriptExecutor', () => {
  let executor: ScriptExecutor;
  let consoleLogSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    executor = new ScriptExecutor('/test/base/path');
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Default mock implementations
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.accessSync).mockReturnValue(undefined);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    delete process.env['WORKFLOW_NAME'];
    delete process.env['WORKFLOW_PURPOSE'];
  });

  describe('constructor', () => {
    it('uses provided base path', () => {
      const customExecutor = new ScriptExecutor('/custom/path');
      expect(customExecutor).toBeInstanceOf(ScriptExecutor);
    });

    it('uses process.cwd() when no path provided', () => {
      const defaultExecutor = new ScriptExecutor();
      expect(defaultExecutor).toBeInstanceOf(ScriptExecutor);
    });
  });

  describe('executeWorkflowCreation', () => {
    const mockConfig: WorkflowConfig = {
      targetPath: './agents/spec',
      workflowName: 'test-workflow',
      purpose: 'Test purpose',
      selectedAgents: [
        {
          id: 'agent1',
          name: 'agent1',
          description: 'Agent 1',
          filePath: '/path/agent1.md',
          directory: 'spec',
          category: 'agents'
        },
        {
          id: 'agent2',
          name: 'agent2',
          description: 'Agent 2',
          filePath: '/path/agent2.md',
          directory: 'spec',
          category: 'agents'
        }
      ],
      executionOrder: ['agent1', 'agent2'],
      createdAt: new Date()
    };

    it('executes workflow creation script successfully', async () => {
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));

      await executor.executeWorkflowCreation(mockConfig);

      expect(childProcess.execSync).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    it('sets WORKFLOW_NAME environment variable', async () => {
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));

      await executor.executeWorkflowCreation(mockConfig);

      expect(process.env['WORKFLOW_NAME']).toBe('test-workflow');
    });

    it('sets WORKFLOW_PURPOSE environment variable', async () => {
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));

      await executor.executeWorkflowCreation(mockConfig);

      expect(process.env['WORKFLOW_PURPOSE']).toBe('Test purpose');
    });

    it('generates default workflow name when not provided', async () => {
      const configWithoutName = { ...mockConfig, workflowName: undefined };
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));

      await executor.executeWorkflowCreation(configWithoutName);

      expect(process.env['WORKFLOW_NAME']).toBe('spec-workflow');
    });

    it('generates "all-workflow" name for ./agents path', async () => {
      const configAllAgents = { ...mockConfig, targetPath: './agents', workflowName: undefined };
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));

      await executor.executeWorkflowCreation(configAllAgents);

      expect(process.env['WORKFLOW_NAME']).toBe('all-workflow');
    });

    it('includes agent names in command when agents are selected', async () => {
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));
      let capturedCommand = '';

      vi.mocked(childProcess.execSync).mockImplementation((cmd: any) => {
        capturedCommand = String(cmd);
        return Buffer.from('Success');
      });

      await executor.executeWorkflowCreation(mockConfig);

      expect(capturedCommand).toContain('agent1,agent2,');
    });

    it('adds trailing comma to agent names for item-names mode', async () => {
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));
      let capturedCommand = '';

      vi.mocked(childProcess.execSync).mockImplementation((cmd: any) => {
        capturedCommand = String(cmd);
        return Buffer.from('Success');
      });

      await executor.executeWorkflowCreation(mockConfig);

      expect(capturedCommand).toMatch(/agent1,agent2,"/);
    });

    it('runs in interactive mode when no agents selected', async () => {
      const configNoAgents = { ...mockConfig, selectedAgents: [] };
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));
      let capturedCommand = '';

      vi.mocked(childProcess.execSync).mockImplementation((cmd: any) => {
        capturedCommand = String(cmd);
        return Buffer.from('Success');
      });

      await executor.executeWorkflowCreation(configNoAgents);

      // Command should not contain agent names (no comma-separated agent list)
      expect(capturedCommand).not.toMatch(/agent1|agent2|agent3/);
    });

    it('throws CLIError when script execution fails', async () => {
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error('Script failed');
      });

      await expect(executor.executeWorkflowCreation(mockConfig)).rejects.toThrow(CLIError);
    });

    it('includes error details in CLIError', async () => {
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error('Script execution failed');
      });

      try {
        await executor.executeWorkflowCreation(mockConfig);
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError);
        const cliError = error as CLIError;
        expect(cliError.message).toContain('Workflow creation script execution failed');
        expect(cliError.context.operation).toBe('script-execution');
      }
    });

    it('validates environment before execution', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(executor.executeWorkflowCreation(mockConfig)).rejects.toThrow(CLIError);
    });

    it('uses 30 second timeout for script execution', async () => {
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));
      let capturedOptions: any;

      vi.mocked(childProcess.execSync).mockImplementation((_cmd: any, opts: any) => {
        capturedOptions = opts;
        return Buffer.from('Success');
      });

      await executor.executeWorkflowCreation(mockConfig);

      expect(capturedOptions.timeout).toBe(30000);
    });

    it('uses inherit stdio to show script output', async () => {
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));
      let capturedOptions: any;

      vi.mocked(childProcess.execSync).mockImplementation((_cmd: any, opts: any) => {
        capturedOptions = opts;
        return Buffer.from('Success');
      });

      await executor.executeWorkflowCreation(mockConfig);

      expect(capturedOptions.stdio).toBe('inherit');
    });
  });

  describe('validateEnvironment', () => {
    it('validates successfully when script exists and is executable', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.accessSync).mockReturnValue(undefined);

      await expect(
        executor['validateEnvironment']()
      ).resolves.toBeUndefined();
    });

    it('throws CLIError when script does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(executor['validateEnvironment']()).rejects.toThrow(CLIError);
    });

    it('throws CLIError when script is not executable', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.accessSync).mockImplementation(() => {
        throw new Error('Not executable');
      });

      await expect(executor['validateEnvironment']()).rejects.toThrow(CLIError);
    });

    it('includes script path in error message', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      try {
        await executor['validateEnvironment']();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError);
        const cliError = error as CLIError;
        expect(cliError.message).toContain('create-workflow.sh');
      }
    });

    it('suggests chmod +x when script is not executable', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.accessSync).mockImplementation(() => {
        throw new Error('Not executable');
      });

      try {
        await executor['validateEnvironment']();
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CLIError);
        const cliError = error as CLIError;
        expect(cliError.context.details?.suggestion).toContain('chmod +x');
      }
    });
  });

  describe('validateScriptEnvironment', () => {
    it('returns true when environment is valid', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.accessSync).mockReturnValue(undefined);

      const result = await executor.validateScriptEnvironment();

      expect(result).toBe(true);
    });

    it('returns false when environment is invalid', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = await executor.validateScriptEnvironment();

      expect(result).toBe(false);
    });
  });

  describe('getScriptUsage', () => {
    it('returns script usage output', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.accessSync).mockReturnValue(undefined);
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Usage: script.sh [options]'));

      const usage = await executor.getScriptUsage();

      expect(usage).toBe('Usage: script.sh [options]');
    });

    it('returns stderr output when command fails', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.accessSync).mockReturnValue(undefined);

      const error: any = new Error('Command failed');
      error.stderr = Buffer.from('Usage from stderr');
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw error;
      });

      const usage = await executor.getScriptUsage();

      expect(usage).toBe('Usage from stderr');
    });

    it('returns stdout from error when available', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.accessSync).mockReturnValue(undefined);

      const error: any = new Error('Command failed');
      error.stdout = Buffer.from('Usage from stdout');
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw error;
      });

      const usage = await executor.getScriptUsage();

      expect(usage).toBe('Usage from stdout');
    });

    it('throws CLIError when script execution fails without output', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.accessSync).mockReturnValue(undefined);
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error('Failed');
      });

      await expect(executor.getScriptUsage()).rejects.toThrow(CLIError);
    });

    it('validates environment before getting usage', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      await expect(executor.getScriptUsage()).rejects.toThrow(CLIError);
    });

    it('uses 5 second timeout for usage query', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.accessSync).mockReturnValue(undefined);
      let capturedOptions: any;

      vi.mocked(childProcess.execSync).mockImplementation((_cmd: any, opts: any) => {
        capturedOptions = opts;
        return Buffer.from('Usage');
      });

      await executor.getScriptUsage();

      expect(capturedOptions.timeout).toBe(5000);
    });
  });

  describe('getScriptPath', () => {
    it('finds script in user project root', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return String(p).includes('/test/base/path/scripts/create-workflow.sh');
      });

      const path = executor['getScriptPath']();

      expect(path).toContain('scripts/create-workflow.sh');
    });

    it('finds script in cc-flow-cli subdirectory', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return String(p).includes('cc-flow-cli/scripts/create-workflow.sh');
      });

      const path = executor['getScriptPath']();

      expect(path).toContain('create-workflow.sh');
    });

    it('finds script in shared workflow directory', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return String(p).includes('scripts/workflow/create-workflow.sh');
      });

      const path = executor['getScriptPath']();

      expect(path).toContain('create-workflow.sh');
    });

    it('returns default path when script not found', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const path = executor['getScriptPath']();

      expect(path).toContain('scripts/create-workflow.sh');
    });

    it('logs debug information during search', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      executor['getScriptPath']();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Debug'));
    });
  });

  describe('generateDefaultWorkflowName', () => {
    it('generates "all-workflow" for ./agents path', () => {
      const name = executor['generateDefaultWorkflowName']('./agents');
      expect(name).toBe('all-workflow');
    });

    it('generates name based on directory', () => {
      const name = executor['generateDefaultWorkflowName']('./agents/spec');
      expect(name).toBe('spec-workflow');
    });

    it('handles nested paths', () => {
      const name = executor['generateDefaultWorkflowName']('./agents/custom/subdir');
      expect(name).toBe('subdir-workflow');
    });

    it('handles paths with trailing slash', () => {
      const name = executor['generateDefaultWorkflowName']('./agents/spec/');
      expect(name).toBe('-workflow'); // empty string + '-workflow'
    });
  });

  describe('edge cases', () => {
    it('handles empty agent list', async () => {
      const config: WorkflowConfig = {
        targetPath: './agents/spec',
        workflowName: 'test',
        purpose: 'Test',
        selectedAgents: [],
        executionOrder: [],
        createdAt: new Date()
      };

      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));

      await expect(executor.executeWorkflowCreation(config)).resolves.toBeUndefined();
    });

    it('handles config without purpose', async () => {
      const config: WorkflowConfig = {
        targetPath: './agents/spec',
        workflowName: 'test',
        purpose: '',
        selectedAgents: [],
        executionOrder: [],
        createdAt: new Date()
      };

      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));

      await executor.executeWorkflowCreation(config);

      // Empty string is falsy, so environment variable won't be set (see line 28: if (purpose))
      expect(process.env['WORKFLOW_PURPOSE']).toBeUndefined();
    });

    it('handles special characters in workflow name', async () => {
      const config: WorkflowConfig = {
        targetPath: './agents/spec',
        workflowName: 'test-workflow-123_special',
        purpose: 'Test',
        selectedAgents: [],
        executionOrder: [],
        createdAt: new Date()
      };

      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));

      await executor.executeWorkflowCreation(config);

      expect(process.env['WORKFLOW_NAME']).toBe('test-workflow-123_special');
    });

    it('handles special characters in agent names', async () => {
      const config: WorkflowConfig = {
        targetPath: './agents/spec',
        workflowName: 'test',
        purpose: 'Test',
        selectedAgents: [
          {
            id: 'agent-with-dashes',
            name: 'agent-with-dashes',
            description: 'Test',
            filePath: '/path',
            directory: 'spec',
            category: 'agents'
          },
          {
            id: 'agent_with_underscores',
            name: 'agent_with_underscores',
            description: 'Test',
            filePath: '/path',
            directory: 'spec',
            category: 'agents'
          }
        ],
        executionOrder: ['agent-with-dashes', 'agent_with_underscores'],
        createdAt: new Date()
      };

      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));
      let capturedCommand = '';

      vi.mocked(childProcess.execSync).mockImplementation((cmd: any) => {
        capturedCommand = String(cmd);
        return Buffer.from('Success');
      });

      await executor.executeWorkflowCreation(config);

      expect(capturedCommand).toContain('agent-with-dashes,agent_with_underscores,');
    });

    it('handles very long agent lists', async () => {
      const agents = Array.from({ length: 50 }, (_, i) => ({
        id: `agent${i}`,
        name: `agent${i}`,
        description: 'Test',
        filePath: '/path',
        directory: 'spec',
        category: 'agents' as const
      }));

      const config: WorkflowConfig = {
        targetPath: './agents/spec',
        workflowName: 'test',
        purpose: 'Test',
        selectedAgents: agents,
        executionOrder: agents.map(a => a.name),
        createdAt: new Date()
      };

      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));

      await expect(executor.executeWorkflowCreation(config)).resolves.toBeUndefined();
    });

    it('handles Unicode characters in purpose', async () => {
      const config: WorkflowConfig = {
        targetPath: './agents/spec',
        workflowName: 'test',
        purpose: 'テストの目的 🎯',
        selectedAgents: [],
        executionOrder: [],
        createdAt: new Date()
      };

      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from('Success'));

      await executor.executeWorkflowCreation(config);

      expect(process.env['WORKFLOW_PURPOSE']).toBe('テストの目的 🎯');
    });
  });
});
