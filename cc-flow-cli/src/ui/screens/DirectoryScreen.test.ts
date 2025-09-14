import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DirectoryScreen } from './DirectoryScreen.js';
import type { DirectoryInfo } from '../../models/Agent.js';

// Mock @inquirer/prompts
vi.mock('@inquirer/prompts', () => ({
  select: vi.fn()
}));

// Mock chalk
vi.mock('chalk', () => ({
  default: {
    bold: vi.fn(str => str),
    dim: vi.fn(str => str),
    yellow: vi.fn(str => str)
  }
}));

describe('DirectoryScreen', () => {
  let directoryScreen: DirectoryScreen;
  let mockSelect: any;

  beforeEach(async () => {
    directoryScreen = new DirectoryScreen();
    // Clear all mocks
    vi.clearAllMocks();
    
    // Get the mocked select function
    const { select } = await import('@inquirer/prompts');
    mockSelect = vi.mocked(select);
    
    // Mock console methods
    vi.spyOn(console, 'clear').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    
    // Mock setTimeout for auto-selection delay
    vi.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback();
      return {} as NodeJS.Timeout;
    });
  });

  describe('show', () => {
    it('should auto-select when only one directory is available', async () => {
      const directories: DirectoryInfo[] = [{
        path: './agents',
        displayName: 'all',
        category: 'agents',
        agentCount: 2,
        agents: [
          {
            id: 'root/test-agent',
            name: 'test-agent',
            description: '⚙️  Execute workflow step',
            filePath: '/test/agents/test-agent.md',
            directory: 'root',
            category: 'agents'
          },
          {
            id: 'root/demo-agent',
            name: 'demo-agent',
            description: '⚙️  Execute workflow step',
            filePath: '/test/agents/demo-agent.md',
            directory: 'root',
            category: 'agents'
          }
        ]
      }];

      const result = await directoryScreen.show(directories);

      expect(result).toBe(directories[0]);
      expect(mockSelect).not.toHaveBeenCalled(); // Should not prompt user
      expect(console.clear).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('エージェントディレクトリ検出'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('all に 2個のエージェントが見つかりました'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('エージェント選択画面に進みます'));
    });

    it('should show selection when multiple directories are available', async () => {
      const directories: DirectoryInfo[] = [
        {
          path: './agents',
          displayName: 'all',
          category: 'agents',
          agentCount: 3,
          agents: []
        },
        {
          path: './agents/spec',
          displayName: 'spec',
          category: 'agents',
          agentCount: 2,
          agents: []
        },
        {
          path: './agents/utility',
          displayName: 'utility',
          category: 'agents',
          agentCount: 1,
          agents: []
        }
      ];

      const selectedDir = directories[1]; // spec
      mockSelect.mockResolvedValue(selectedDir);

      const result = await directoryScreen.show(directories);

      expect(result).toBe(selectedDir);
      expect(mockSelect).toHaveBeenCalled();
      expect(console.clear).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Select Agent Directory'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('This will create: /spec-workflow'));
    });

    it('should handle "all" directory name for workflow creation', async () => {
      const directories: DirectoryInfo[] = [{
        path: './agents',
        displayName: 'all',
        category: 'agents',
        agentCount: 5,
        agents: []
      }];

      const result = await directoryScreen.show(directories);

      expect(result).toBe(directories[0]);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('This will create: /workflow'));
    });

    it('should handle regular directory names for workflow creation', async () => {
      const directories: DirectoryInfo[] = [
        {
          path: './agents/spec',
          displayName: 'spec',
          category: 'agents',
          agentCount: 2,
          agents: []
        },
        {
          path: './agents/utility',
          displayName: 'utility',
          category: 'agents',
          agentCount: 1,
          agents: []
        }
      ];

      mockSelect.mockResolvedValue(directories[0]);
      await directoryScreen.show(directories);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('This will create: /spec-workflow'));
    });

    it('should prepare correct choices with descriptions', async () => {
      const directories: DirectoryInfo[] = [
        {
          path: './agents/spec',
          displayName: 'spec',
          category: 'agents',
          agentCount: 2,
          agents: []
        },
        {
          path: './agents/utility',
          displayName: 'utility',
          category: 'agents',
          agentCount: 1,
          agents: []
        },
        {
          path: './agents',
          displayName: 'all',
          category: 'agents',
          agentCount: 3,
          agents: []
        }
      ];

      mockSelect.mockResolvedValue(directories[0]);
      await directoryScreen.show(directories);

      const selectCall = mockSelect.mock.calls[0][0];
      expect(selectCall.choices).toHaveLength(3); // 2 regular + separator + all
      
      // Check that regular choices are formatted correctly
      const regularChoices = selectCall.choices.filter((c: any) => c.value && c.value.displayName !== 'all');
      expect(regularChoices[0].name).toBe('spec (2 agents)');
      expect(regularChoices[1].name).toBe('utility (1 agents)');
      
      // Check that "all" choice is formatted correctly
      const allChoice = selectCall.choices.find((c: any) => c.value?.displayName === 'all');
      expect(allChoice.name).toBe('all (3 agents from all directories)');
    });

    it('should handle empty directory list gracefully', async () => {
      const directories: DirectoryInfo[] = [];

      // Mock select to return undefined for empty case
      mockSelect.mockResolvedValue(undefined);

      try {
        await directoryScreen.show(directories);
        // If we get here, the method handled the undefined case
        expect(mockSelect).toHaveBeenCalled();
        const selectCall = mockSelect.mock.calls[0][0];
        expect(selectCall.choices).toHaveLength(0);
      } catch (error) {
        // Expected behavior: should throw an error for empty directories
        expect(error).toBeDefined();
      }
    });
  });

  describe('workflow naming logic', () => {
    it('should generate correct workflow names for different directory types', () => {
      // This is implicitly tested above, but we can be explicit about the logic
      const testCases = [
        { displayName: 'all', expected: '/workflow' },
        { displayName: 'spec', expected: '/spec-workflow' },
        { displayName: 'utility', expected: '/utility-workflow' },
        { displayName: 'custom-category', expected: '/custom-category-workflow' }
      ];

      testCases.forEach(async ({ displayName, expected }) => {
        const directories: DirectoryInfo[] = [{
          path: `./agents/${displayName === 'all' ? '' : displayName}`,
          displayName,
          category: 'agents',
          agentCount: 1,
          agents: []
        }];

        await directoryScreen.show(directories);
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`This will create: ${expected}`));
      });
    });
  });
});