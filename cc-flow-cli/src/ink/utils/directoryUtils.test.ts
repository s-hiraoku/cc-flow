import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getAgentDirectories,
  getAgentsFromPath,
  getCommandDirectories,
  getCommandsFromPath
} from './directoryUtils.js';
import * as fs from 'fs';

// Mock fs module
vi.mock('fs', async () => {
  const actual = await vi.importActual<typeof import('fs')>('fs');
  return {
    ...actual,
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    readFileSync: vi.fn()
  };
});

describe('directoryUtils', () => {
  let consoleWarnSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('getAgentDirectories', () => {
    it('returns agent directories with correct structure', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['spec', 'utility'] as any)
        .mockReturnValueOnce(['agent1.md'] as any)
        .mockReturnValueOnce(['agent2.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const dirs = getAgentDirectories('/test/path');

      expect(dirs.length).toBeGreaterThan(2); // includes "all" and "back" options
      const specDir = dirs.find(d => d.id === 'spec-agents');
      expect(specDir).toBeDefined();
      expect(specDir?.label).toContain('spec');
      expect(specDir?.value).toBe('./agents/spec');
    });

    it('includes "all agents" option as first item', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce(['agent1.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const dirs = getAgentDirectories('/test/path');

      expect(dirs[0].id).toBe('all-agents');
      expect(dirs[0].label).toBe('すべてのエージェント');
      expect(dirs[0].value).toBe('./agents');
    });

    it('includes "back" option as last item', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce(['agent1.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const dirs = getAgentDirectories('/test/path');

      const lastDir = dirs[dirs.length - 1];
      expect(lastDir.id).toBe('back');
      expect(lastDir.label).toBe('戻る');
      expect(lastDir.value).toBe('back');
    });

    it('counts agents correctly in each directory', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['spec'] as any)
        .mockReturnValueOnce(['a.md', 'b.md', 'c.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const dirs = getAgentDirectories('/test/path');

      const specDir = dirs.find(d => d.id === 'spec-agents');
      expect(specDir?.description).toContain('3個のエージェント');
    });

    it('calculates total agent count for "all agents" option', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['spec', 'utility'] as any)
        .mockReturnValueOnce(['a.md', 'b.md'] as any)
        .mockReturnValueOnce(['c.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const dirs = getAgentDirectories('/test/path');

      const allDir = dirs.find(d => d.id === 'all-agents');
      expect(allDir?.description).toContain('3個');
    });

    it('provides appropriate icons for known directories', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['spec', 'utility', 'workflow', 'development'] as any)
        .mockReturnValueOnce(['a.md'] as any)
        .mockReturnValueOnce(['b.md'] as any)
        .mockReturnValueOnce(['c.md'] as any)
        .mockReturnValueOnce(['d.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const dirs = getAgentDirectories('/test/path');

      expect(dirs.find(d => d.id === 'spec-agents')?.icon).toBe('📋');
      expect(dirs.find(d => d.id === 'utility-agents')?.icon).toBe('🔧');
      expect(dirs.find(d => d.id === 'workflow-agents')?.icon).toBe('⚡');
      expect(dirs.find(d => d.id === 'development-agents')?.icon).toBe('💻');
    });

    it('uses default icon for unknown directories', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['custom'] as any)
        .mockReturnValueOnce(['a.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const dirs = getAgentDirectories('/test/path');

      const customDir = dirs.find(d => d.id === 'custom-agents');
      expect(customDir?.icon).toBe('📁');
    });

    it('handles errors gracefully and returns defaults', () => {
      vi.mocked(fs.readdirSync).mockImplementation(() => {
        throw new Error('Read error');
      });

      const dirs = getAgentDirectories('/test/path');

      expect(dirs.length).toBe(2); // just "all" and "back"
      // consoleWarnSpy is called, not consoleErrorSpy
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('handles individual directory read errors', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['spec', 'broken'] as any);
      vi.mocked(fs.statSync).mockImplementation((p) => {
        if (String(p).includes('broken')) {
          throw new Error('Stat error');
        }
        return { isDirectory: () => true } as any;
      });

      const dirs = getAgentDirectories('/test/path');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(dirs.length).toBeGreaterThan(0);
    });

    it('filters out non-directory items', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['spec', 'file.txt'] as any);
      vi.mocked(fs.statSync).mockImplementation((p) => {
        const isDir = !String(p).includes('file.txt');
        return { isDirectory: () => isDir } as any;
      });

      const dirs = getAgentDirectories('/test/path');

      const fileDir = dirs.find(d => d.id === 'file.txt-agents');
      expect(fileDir).toBeUndefined();
    });
  });

  describe('getAgentsFromPath', () => {
    it('returns agents from specific directory', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['agent1.md', 'agent2.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
      vi.mocked(fs.readFileSync).mockReturnValue('# Agent\nDescription here');

      const agents = getAgentsFromPath('./agents/spec');

      expect(agents).toHaveLength(2);
      expect(agents[0].name).toBe('agent1');
      expect(agents[1].name).toBe('agent2');
    });

    it('returns all agents recursively for "./agents" path', () => {
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['spec', 'utility'] as any)
        .mockReturnValueOnce(['spec-agent.md'] as any)
        .mockReturnValueOnce(['util-agent.md'] as any);
      vi.mocked(fs.statSync).mockImplementation((p) => {
        const pathStr = String(p);
        if (pathStr.endsWith('.md')) {
          return { isDirectory: () => false, isFile: () => true } as any;
        }
        return { isDirectory: () => true, isFile: () => false } as any;
      });
      vi.mocked(fs.readFileSync).mockReturnValue('# Agent');

      const agents = getAgentsFromPath('./agents');

      expect(agents.length).toBeGreaterThanOrEqual(2);
      const names = agents.map(a => a.name);
      expect(names).toContain('spec-agent');
      expect(names).toContain('util-agent');
    });

    it('sorts agents alphabetically', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['zebra.md', 'alpha.md', 'beta.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
      vi.mocked(fs.readFileSync).mockReturnValue('# Agent');

      const agents = getAgentsFromPath('./agents/spec');

      expect(agents[0].name).toBe('alpha');
      expect(agents[1].name).toBe('beta');
      expect(agents[2].name).toBe('zebra');
    });

    it('extracts description from YAML frontmatter', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['agent.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
      vi.mocked(fs.readFileSync).mockReturnValue(
        '---\ndescription: Custom description\n---\n# Agent'
      );

      const agents = getAgentsFromPath('./agents/spec');

      expect(agents[0].description).toBe('Custom description');
    });

    it('extracts description from first paragraph when no frontmatter', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['agent.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
      vi.mocked(fs.readFileSync).mockReturnValue(
        '# Title\n\nThis is the first paragraph description.'
      );

      const agents = getAgentsFromPath('./agents/spec');

      expect(agents[0].description).toBe('This is the first paragraph description.');
    });

    it('truncates long descriptions to 100 characters', () => {
      const longDesc = 'a'.repeat(150);
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['agent.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
      vi.mocked(fs.readFileSync).mockReturnValue(`# Title\n\n${longDesc}`);

      const agents = getAgentsFromPath('./agents/spec');

      expect(agents[0].description.length).toBeLessThanOrEqual(103); // 100 + "..."
      expect(agents[0].description).toContain('...');
    });

    it('uses name-based description as fallback', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['spec-init.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
      vi.mocked(fs.readFileSync).mockReturnValue('# Title\n\n');

      const agents = getAgentsFromPath('./agents/spec');

      expect(agents[0].description).toBe('🏗️ 初期化・セットアップ');
    });

    it('assigns correct icons based on agent names', () => {
      const testCases = [
        { file: 'init-agent.md', expectedIcon: '🏗️' },
        { file: 'requirements-agent.md', expectedIcon: '📋' },
        { file: 'design-agent.md', expectedIcon: '🎨' },
        { file: 'tasks-agent.md', expectedIcon: '📝' },
        { file: 'impl-agent.md', expectedIcon: '⚡' },
        { file: 'status-agent.md', expectedIcon: '📊' },
        { file: 'test-agent.md', expectedIcon: '🧪' },
        { file: 'deploy-agent.md', expectedIcon: '🚀' },
        { file: 'steering-agent.md', expectedIcon: '🎯' },
        { file: 'custom-agent.md', expectedIcon: '🤖' }
      ];

      for (const { file, expectedIcon } of testCases) {
        vi.mocked(fs.readdirSync).mockReturnValueOnce([file] as any);
        vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
        vi.mocked(fs.readFileSync).mockReturnValue('# Agent');

        const agents = getAgentsFromPath('./agents/spec');
        expect(agents[0].icon).toBe(expectedIcon);
      }
    });

    it('filters out non-md files', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['agent.md', 'README.txt', 'config.json'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
      vi.mocked(fs.readFileSync).mockReturnValue('# Agent');

      const agents = getAgentsFromPath('./agents/spec');

      expect(agents).toHaveLength(1);
      expect(agents[0].name).toBe('agent');
    });

    it('handles read errors gracefully', () => {
      vi.mocked(fs.readdirSync).mockImplementation(() => {
        throw new Error('Read error');
      });

      const agents = getAgentsFromPath('./agents/spec');

      expect(agents).toEqual([]);
      // The function uses console.warn for errors, not console.error
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('handles individual file read errors', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['good.md', 'bad.md'] as any);
      vi.mocked(fs.statSync).mockImplementation((p) => {
        if (String(p).includes('bad')) {
          throw new Error('Stat error');
        }
        return { isFile: () => true } as any;
      });
      vi.mocked(fs.readFileSync).mockReturnValue('# Agent');

      const agents = getAgentsFromPath('./agents/spec');

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(agents.length).toBeGreaterThan(0);
    });

    it('extracts directory and category from path', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['agent.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
      vi.mocked(fs.readFileSync).mockReturnValue('# Agent');

      const agents = getAgentsFromPath('./agents/spec');

      expect(agents[0].directory).toBe('spec');
      expect(agents[0].category).toBe('agents');
    });
  });

  describe('getCommandDirectories', () => {
    it('returns command directories with correct structure', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['demo', 'workflow'] as any)
        .mockReturnValueOnce(['cmd1.md'] as any)
        .mockReturnValueOnce(['cmd2.md'] as any)
        .mockReturnValueOnce(['cmd3.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const dirs = getCommandDirectories('/test/path');

      expect(dirs.length).toBeGreaterThan(2);
      const demoDir = dirs.find(d => d.id === 'demo-commands');
      expect(demoDir).toBeDefined();
      expect(demoDir?.value).toBe('./.claude/commands/demo');
    });

    it('includes main commands directory as first item', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['demo'] as any)
        .mockReturnValueOnce(['cmd.md'] as any)
        .mockReturnValueOnce(['main-cmd.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const dirs = getCommandDirectories('/test/path');

      expect(dirs[0].id).toBe('main-commands');
      expect(dirs[0].label).toBe('すべてのスラッシュコマンド');
    });

    it('counts commands correctly', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['demo'] as any)
        .mockReturnValueOnce(['a.md', 'b.md', 'c.md'] as any)
        .mockReturnValueOnce(['main.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const dirs = getCommandDirectories('/test/path');

      const demoDir = dirs.find(d => d.id === 'demo-commands');
      expect(demoDir?.description).toContain('3個のコマンド');
    });

    it('provides appropriate icons for known command directories', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['demo', 'workflow', 'util', 'spec'] as any)
        .mockReturnValueOnce(['a.md'] as any)
        .mockReturnValueOnce(['b.md'] as any)
        .mockReturnValueOnce(['c.md'] as any)
        .mockReturnValueOnce(['d.md'] as any)
        .mockReturnValueOnce(['e.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as any);

      const dirs = getCommandDirectories('/test/path');

      expect(dirs.find(d => d.id === 'demo-commands')?.icon).toBe('🧪');
      expect(dirs.find(d => d.id === 'workflow-commands')?.icon).toBe('🔄');
      expect(dirs.find(d => d.id === 'util-commands')?.icon).toBe('🛠️');
      expect(dirs.find(d => d.id === 'spec-commands')?.icon).toBe('📋');
    });

    it('handles errors gracefully', () => {
      vi.mocked(fs.readdirSync).mockImplementation(() => {
        throw new Error('Read error');
      });

      const dirs = getCommandDirectories('/test/path');

      expect(dirs.length).toBeGreaterThan(0);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('getCommandsFromPath', () => {
    it('returns commands from directory', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['cmd1.md', 'cmd2.md'] as any);
      vi.mocked(fs.readFileSync).mockReturnValue('---\ndescription: Command description\n---\n# Command');

      const commands = getCommandsFromPath('./.claude/commands');

      expect(commands).toHaveLength(2);
      expect(commands[0].name).toBe('cmd1');
      expect(commands[1].name).toBe('cmd2');
    });

    it('sorts commands alphabetically', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['zebra.md', 'alpha.md', 'beta.md'] as any);
      vi.mocked(fs.readFileSync).mockReturnValue('# Command');

      const commands = getCommandsFromPath('./.claude/commands');

      expect(commands[0].name).toBe('alpha');
      expect(commands[1].name).toBe('beta');
      expect(commands[2].name).toBe('zebra');
    });

    it('extracts description from YAML frontmatter', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['cmd.md'] as any);
      vi.mocked(fs.readFileSync).mockReturnValue(
        '---\ndescription: "Custom command description"\n---\n# Command'
      );

      const commands = getCommandsFromPath('./.claude/commands');

      expect(commands[0].description).toBe('Custom command description');
    });

    it('extracts description from H1 title when no frontmatter', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['cmd.md'] as any);
      vi.mocked(fs.readFileSync).mockReturnValue('# Command Title\n\nSome content');

      const commands = getCommandsFromPath('./.claude/commands');

      expect(commands[0].description).toBe('Command Title');
    });

    it('uses name-based description as fallback', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['create-workflow.md'] as any);
      vi.mocked(fs.readFileSync).mockReturnValue('');

      const commands = getCommandsFromPath('./.claude/commands');

      expect(commands[0].description).toBe('🏗️ 作成・生成コマンド');
    });

    it('extracts category from path', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['cmd.md'] as any);
      vi.mocked(fs.readFileSync).mockReturnValue('# Command');

      const commands = getCommandsFromPath('./.claude/commands/demo');

      expect(commands[0].category).toBe('demo');
    });

    it('handles read errors gracefully', () => {
      vi.mocked(fs.readdirSync).mockImplementation(() => {
        throw new Error('Read error');
      });

      const commands = getCommandsFromPath('./.claude/commands');

      expect(commands).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('handles individual file read errors', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['good.md', 'bad.md'] as any);
      vi.mocked(fs.readFileSync).mockImplementation((p) => {
        if (String(p).includes('bad')) {
          throw new Error('Read error');
        }
        return '# Command';
      });

      const commands = getCommandsFromPath('./.claude/commands');

      // The code catches the error in a try-catch block and doesn't call console.warn
      // It adds a default description instead
      expect(commands.length).toBe(2);
      // Should still include the bad file with default description
      expect(commands.find(c => c.name === 'bad')).toBeDefined();
    });

    it('filters out non-md files', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['cmd.md', 'README.txt', 'config.json'] as any);
      vi.mocked(fs.readFileSync).mockReturnValue('# Command');

      const commands = getCommandsFromPath('./.claude/commands');

      expect(commands).toHaveLength(1);
      expect(commands[0].name).toBe('cmd');
    });

    it('truncates long descriptions', () => {
      const longDesc = 'a'.repeat(150);
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['cmd.md'] as any);
      // H1 title is extracted first, so use content without H1 for truncation test
      vi.mocked(fs.readFileSync).mockReturnValue(`\n${longDesc}`);

      const commands = getCommandsFromPath('./.claude/commands');

      expect(commands[0].description.length).toBeLessThanOrEqual(103);
      expect(commands[0].description).toContain('...');
    });
  });

  describe('edge cases', () => {
    it('handles empty directories', () => {
      vi.mocked(fs.readdirSync).mockReturnValue([] as any);

      const agents = getAgentsFromPath('./agents/spec');
      const commands = getCommandsFromPath('./.claude/commands');

      expect(agents).toEqual([]);
      expect(commands).toEqual([]);
    });

    it('handles special characters in file names', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['agent-with-dashes.md', 'agent_with_underscores.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
      vi.mocked(fs.readFileSync).mockReturnValue('# Agent');

      const agents = getAgentsFromPath('./agents/spec');

      expect(agents).toHaveLength(2);
      expect(agents.find(a => a.name === 'agent-with-dashes')).toBeDefined();
      expect(agents.find(a => a.name === 'agent_with_underscores')).toBeDefined();
    });

    it('handles very deep directory structures', () => {
      vi.mocked(fs.readdirSync)
        .mockReturnValueOnce(['level1'] as any)
        .mockReturnValueOnce(['level2'] as any)
        .mockReturnValueOnce(['agent.md'] as any);
      vi.mocked(fs.statSync).mockImplementation((p) => {
        const pathStr = String(p);
        if (pathStr.endsWith('.md')) {
          return { isDirectory: () => false, isFile: () => true } as any;
        }
        return { isDirectory: () => true, isFile: () => false } as any;
      });
      vi.mocked(fs.readFileSync).mockReturnValue('# Agent');

      const agents = getAgentsFromPath('./agents');

      expect(agents.length).toBeGreaterThan(0);
    });

    it('handles Unicode characters in descriptions', () => {
      vi.mocked(fs.readdirSync).mockReturnValueOnce(['agent.md'] as any);
      vi.mocked(fs.statSync).mockReturnValue({ isFile: () => true } as any);
      vi.mocked(fs.readFileSync).mockReturnValue(
        '---\ndescription: "日本語の説明 🎯"\n---\n# Agent'
      );

      const agents = getAgentsFromPath('./agents/spec');

      expect(agents[0].description).toBe('日本語の説明 🎯');
    });
  });
});
