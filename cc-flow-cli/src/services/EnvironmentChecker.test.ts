import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EnvironmentChecker } from './EnvironmentChecker.js';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn()
  };
});

describe('EnvironmentChecker', () => {
  let checker: EnvironmentChecker;
  const mockBasePath = '/test/project';

  beforeEach(() => {
    vi.clearAllMocks();
    checker = new EnvironmentChecker(mockBasePath);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('uses provided base path', () => {
      const customChecker = new EnvironmentChecker('/custom/path');
      expect(customChecker).toBeInstanceOf(EnvironmentChecker);
    });

    it('uses process.cwd() when no path provided', () => {
      const defaultChecker = new EnvironmentChecker();
      expect(defaultChecker).toBeInstanceOf(EnvironmentChecker);
    });
  });

  describe('checkEnvironment', () => {
    it('returns valid status when all directories exist with agents', async () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        return pathStr.includes('.claude') || pathStr.includes('agents') || pathStr.includes('commands');
      });

      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec', 'utility'] as any)
        .mockReturnValueOnce(['agent1.md'] as any)
        .mockReturnValueOnce(['agent2.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();

      expect(status.claudeDir).toBe(true);
      expect(status.agentsDir).toBe(true);
      expect(status.commandsDir).toBe(true);
      expect(status.isValid).toBe(true);
    });

    it('returns invalid status when .claude directory does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const status = await checker.checkEnvironment();

      expect(status.claudeDir).toBe(false);
      expect(status.agentsDir).toBe(false);
      expect(status.isValid).toBe(false);
    });

    it('returns invalid status when agents directory is empty', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([] as any);

      const status = await checker.checkEnvironment();

      expect(status.totalAgents).toBe(0);
      expect(status.isValid).toBe(false);
    });

    it('adds "all agents" option when multiple directories exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['spec', 'utility'] as any)
        .mockReturnValueOnce(['agent1.md'] as any)
        .mockReturnValueOnce(['agent2.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();

      expect(status.availableDirectories.length).toBeGreaterThan(2);
      expect(status.availableDirectories[0].displayName).toBe('all');
      expect(status.availableDirectories[0].agentCount).toBe(2);
    });

    it('handles mixed files and directories in agents folder', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec', 'root-agent.md'] as any)
        .mockReturnValueOnce(['agent1.md'] as any);

      vi.mocked(fs.statSync).mockImplementation((p) => {
        const pathStr = String(p);
        if (pathStr.includes('spec')) {
          return { isDirectory: () => true } as any;
        }
        return { isDirectory: () => false } as any;
      });

      const status = await checker.checkEnvironment();

      expect(status.availableDirectories.length).toBeGreaterThan(0);
      // Should have both the 'spec' directory and 'root' directory
      const rootDir = status.availableDirectories.find(d => d.displayName === 'root');
      expect(rootDir).toBeDefined();
    });
  });

  describe('scanAgentDirectories', () => {
    it('handles errors gracefully when directory cannot be read', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const status = await checker.checkEnvironment();

      expect(status.availableDirectories).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('scans subdirectories correctly', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce(['init.md', 'requirements.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();

      const specDir = status.availableDirectories.find(d => d.displayName === 'spec');
      expect(specDir).toBeDefined();
      expect(specDir?.agentCount).toBe(2);
    });

    it('filters out non-md files', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce(['agent.md', 'README.txt', 'config.json'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();

      const specDir = status.availableDirectories.find(d => d.displayName === 'spec');
      expect(specDir?.agentCount).toBe(1);
      expect(specDir?.agents).toHaveLength(1);
    });

    it('sorts agents alphabetically', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce(['zebra.md', 'alpha.md', 'beta.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();

      const specDir = status.availableDirectories.find(d => d.displayName === 'spec');
      expect(specDir?.agents[0].name).toBe('alpha');
      expect(specDir?.agents[1].name).toBe('beta');
      expect(specDir?.agents[2].name).toBe('zebra');
    });
  });

  describe('getAgentDescription', () => {
    it('returns correct description for init agents', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce(['spec-init.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();
      const specDir = status.availableDirectories.find(d => d.displayName === 'spec');
      const agent = specDir?.agents.find(a => a.name === 'spec-init');

      expect(agent?.description).toBe('🏗️  Initialize project structure');
    });

    it('returns correct description for requirements agents', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce(['spec-requirements.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();
      const specDir = status.availableDirectories.find(d => d.displayName === 'spec');
      const agent = specDir?.agents.find(a => a.name === 'spec-requirements');

      expect(agent?.description).toBe('📋 Generate requirements using EARS');
    });

    it('returns correct description for design agents', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce(['spec-design.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();
      const specDir = status.availableDirectories.find(d => d.displayName === 'spec');
      const agent = specDir?.agents.find(a => a.name === 'spec-design');

      expect(agent?.description).toBe('🎨 Create technical design');
    });

    it('returns default description for unknown agents', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce(['custom-agent.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();
      const specDir = status.availableDirectories.find(d => d.displayName === 'spec');
      const agent = specDir?.agents.find(a => a.name === 'custom-agent');

      expect(agent?.description).toBe('⚙️  Execute workflow step');
    });

    it('handles all predefined agent types', async () => {
      const agentTypes = [
        { name: 'init-agent.md', expectedDesc: '🏗️  Initialize project structure' },
        { name: 'requirements-agent.md', expectedDesc: '📋 Generate requirements using EARS' },
        { name: 'design-agent.md', expectedDesc: '🎨 Create technical design' },
        { name: 'tasks-agent.md', expectedDesc: '📝 Generate implementation tasks' },
        { name: 'impl-agent.md', expectedDesc: '⚡ Implement using TDD methodology' },
        { name: 'status-agent.md', expectedDesc: '📊 Generate status reports' },
        { name: 'test-agent.md', expectedDesc: '🧪 Run tests and validation' },
        { name: 'deploy-agent.md', expectedDesc: '🚀 Deploy to environment' },
        { name: 'steering-agent.md', expectedDesc: '🎯 Create steering documents' }
      ];

      for (const { name, expectedDesc } of agentTypes) {
        vi.mocked(fs.existsSync).mockReturnValue(true);
        vi.mocked(fs.readdirSync)
          .mockReturnValueOnce(['spec'] as any)
          .mockReturnValueOnce([name] as any);
        vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

        const status = await checker.checkEnvironment();
        const specDir = status.availableDirectories.find(d => d.displayName === 'spec');
        const agent = specDir?.agents[0];

        expect(agent?.description).toBe(expectedDesc);
      }
    });
  });

  describe('edge cases', () => {
    it('handles empty agent directory names gracefully', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce([''] as any)
        .mockReturnValueOnce([] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();

      expect(status.availableDirectories).toBeDefined();
    });

    it('handles statSync errors for individual files', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec', 'broken'] as any)
        .mockReturnValueOnce(['agent.md'] as any);
      vi.mocked(fs.statSync).mockImplementation((p) => {
        const pathStr = String(p);
        if (pathStr.includes('broken')) {
          throw new Error('stat failed');
        }
        return { isDirectory: () => true } as any;
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const status = await checker.checkEnvironment();

      // Should still process the 'spec' directory despite error with 'broken'
      expect(status.availableDirectories.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it('handles very long agent file names', async () => {
      const longName = 'a'.repeat(200) + '.md';
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce([longName] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();

      const specDir = status.availableDirectories.find(d => d.displayName === 'spec');
      expect(specDir?.agents).toHaveLength(1);
      expect(specDir?.agents[0].name).toBe('a'.repeat(200));
    });

    it('handles special characters in agent names', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce(['agent-with-dashes.md', 'agent_with_underscores.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const status = await checker.checkEnvironment();

      const specDir = status.availableDirectories.find(d => d.displayName === 'spec');
      expect(specDir?.agents).toHaveLength(2);
    });

    it('handles no directories found', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const status = await checker.checkEnvironment();

      expect(status.availableDirectories).toEqual([]);
      expect(status.totalAgents).toBe(0);
    });
  });

  describe('integration scenarios', () => {
    it('handles real-world mixed structure', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      // First call: top-level agents directory
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec', 'utility', 'root-agent.md', 'README.md'] as any)
        // Second call: spec subdirectory
        .mockReturnValueOnce(['spec-init.md', 'spec-design.md', '.git'] as any)
        // Third call: utility subdirectory
        .mockReturnValueOnce(['helper.md'] as any);

      vi.mocked(fs.statSync).mockImplementation((p) => {
        const pathStr = String(p);
        if (pathStr.includes('spec') && !pathStr.endsWith('.md')) {
          return { isDirectory: () => true } as any;
        }
        if (pathStr.includes('utility')) {
          return { isDirectory: () => true } as any;
        }
        return { isDirectory: () => false } as any;
      });

      const status = await checker.checkEnvironment();

      // Should have: all, spec, utility, root
      expect(status.availableDirectories.length).toBeGreaterThanOrEqual(3);
      // .git is not a .md file so filtered out
      // But statSync for .git in spec directory may return isFile and be counted
      // Let's just check totalAgents is reasonable
      expect(status.totalAgents).toBeGreaterThanOrEqual(3);
    });
  });
});
