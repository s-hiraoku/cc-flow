import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { EnvironmentChecker } from './EnvironmentChecker.js';
import type { DirectoryInfo } from '../models/Agent.js';

describe('EnvironmentChecker', () => {
  const testDir = join(process.cwd(), 'test-temp-env');
  const claudeDir = join(testDir, '.claude');
  const agentsDir = join(claudeDir, 'agents');
  const commandsDir = join(claudeDir, 'commands');

  beforeEach(() => {
    // Clean up any previous test artifacts
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('checkEnvironment', () => {
    it('should detect valid environment with subdirectories', async () => {
      // Setup: Create directory structure with agents in subdirectories
      mkdirSync(agentsDir, { recursive: true });
      mkdirSync(commandsDir, { recursive: true });
      mkdirSync(join(agentsDir, 'spec'), { recursive: true });
      mkdirSync(join(agentsDir, 'utility'), { recursive: true });
      
      writeFileSync(join(agentsDir, 'spec', 'spec-init.md'), '# Spec Init\nTest agent');
      writeFileSync(join(agentsDir, 'spec', 'spec-impl.md'), '# Spec Impl\nTest agent');
      writeFileSync(join(agentsDir, 'utility', 'helper.md'), '# Helper\nTest agent');

      const checker = new EnvironmentChecker(testDir);
      const result = await checker.checkEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.claudeDir).toBe(true);
      expect(result.agentsDir).toBe(true);
      expect(result.commandsDir).toBe(true);
      expect(result.totalAgents).toBe(3);
      expect(result.availableDirectories).toHaveLength(3); // spec, utility, and "all"
      
      // Should have "all" option as first item
      expect(result.availableDirectories[0].displayName).toBe('all');
      expect(result.availableDirectories[0].agentCount).toBe(3);
    });

    it('should handle direct .md files in agents directory', async () => {
      // Setup: Create agents directory with direct .md files (no subdirectories)
      mkdirSync(agentsDir, { recursive: true });
      mkdirSync(commandsDir, { recursive: true });
      
      writeFileSync(join(agentsDir, 'test-agent.md'), '# Test Agent\nDirect file agent');
      writeFileSync(join(agentsDir, 'demo-agent.md'), '# Demo Agent\nAnother direct file agent');

      const checker = new EnvironmentChecker(testDir);
      const result = await checker.checkEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.claudeDir).toBe(true);
      expect(result.agentsDir).toBe(true);
      expect(result.totalAgents).toBe(2);
      expect(result.availableDirectories).toHaveLength(1);
      
      // Should have "all" directory containing direct files
      const allDir = result.availableDirectories[0];
      expect(allDir.displayName).toBe('all');
      expect(allDir.agentCount).toBe(2);
      expect(allDir.agents).toHaveLength(2);
      expect(allDir.agents[0].name).toBe('demo-agent');
      expect(allDir.agents[1].name).toBe('test-agent');
      expect(allDir.agents[0].directory).toBe('root');
    });

    it('should handle mixed subdirectories and direct files', async () => {
      // Setup: Create mixed structure
      mkdirSync(agentsDir, { recursive: true });
      mkdirSync(commandsDir, { recursive: true });
      mkdirSync(join(agentsDir, 'spec'), { recursive: true });
      
      // Subdirectory agents
      writeFileSync(join(agentsDir, 'spec', 'spec-init.md'), '# Spec Init\nSubdir agent');
      
      // Direct files
      writeFileSync(join(agentsDir, 'direct-agent.md'), '# Direct Agent\nDirect file agent');

      const checker = new EnvironmentChecker(testDir);
      const result = await checker.checkEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.totalAgents).toBe(2);
      expect(result.availableDirectories).toHaveLength(3); // all, spec, all(direct)
      
      // Should have "all" option first with all agents
      const allDir = result.availableDirectories[0];
      expect(allDir.displayName).toBe('all');
      expect(allDir.agentCount).toBe(2);
    });

    it('should handle empty agents directory', async () => {
      // Setup: Create empty agents directory
      mkdirSync(agentsDir, { recursive: true });
      mkdirSync(commandsDir, { recursive: true });

      const checker = new EnvironmentChecker(testDir);
      const result = await checker.checkEnvironment();

      expect(result.isValid).toBe(false); // No agents found
      expect(result.claudeDir).toBe(true);
      expect(result.agentsDir).toBe(true);
      expect(result.totalAgents).toBe(0);
      expect(result.availableDirectories).toHaveLength(0);
    });

    it('should handle missing .claude directory', async () => {
      // Setup: No .claude directory
      mkdirSync(testDir, { recursive: true });

      const checker = new EnvironmentChecker(testDir);
      const result = await checker.checkEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.claudeDir).toBe(false);
      expect(result.agentsDir).toBe(false);
      expect(result.commandsDir).toBe(false);
      expect(result.totalAgents).toBe(0);
      expect(result.availableDirectories).toHaveLength(0);
    });

    it('should handle missing agents directory', async () => {
      // Setup: .claude exists but no agents directory
      mkdirSync(claudeDir, { recursive: true });
      mkdirSync(commandsDir, { recursive: true });

      const checker = new EnvironmentChecker(testDir);
      const result = await checker.checkEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.claudeDir).toBe(true);
      expect(result.agentsDir).toBe(false);
      expect(result.commandsDir).toBe(true);
      expect(result.totalAgents).toBe(0);
      expect(result.availableDirectories).toHaveLength(0);
    });
  });

  describe('agent description generation', () => {
    it('should generate appropriate descriptions for agent names', async () => {
      // Setup: Create agents with descriptive names
      mkdirSync(agentsDir, { recursive: true });
      mkdirSync(commandsDir, { recursive: true });
      
      writeFileSync(join(agentsDir, 'spec-init.md'), '# Spec Init');
      writeFileSync(join(agentsDir, 'spec-requirements.md'), '# Spec Requirements');
      writeFileSync(join(agentsDir, 'spec-design.md'), '# Spec Design');
      writeFileSync(join(agentsDir, 'spec-tasks.md'), '# Spec Tasks');
      writeFileSync(join(agentsDir, 'spec-impl.md'), '# Spec Implementation');
      writeFileSync(join(agentsDir, 'test-runner.md'), '# Test Runner');
      writeFileSync(join(agentsDir, 'deploy-helper.md'), '# Deploy Helper');
      writeFileSync(join(agentsDir, 'steering-doc.md'), '# Steering Doc');
      writeFileSync(join(agentsDir, 'custom-agent.md'), '# Custom Agent');

      const checker = new EnvironmentChecker(testDir);
      const result = await checker.checkEnvironment();

      expect(result.isValid).toBe(true);
      const allDir = result.availableDirectories.find(d => d.displayName === 'all');
      expect(allDir).toBeDefined();
      
      const agents = allDir!.agents;
      expect(agents.find(a => a.name === 'spec-init')?.description).toBe('🏗️  Initialize project structure');
      expect(agents.find(a => a.name === 'spec-requirements')?.description).toBe('📋 Generate requirements using EARS');
      expect(agents.find(a => a.name === 'spec-design')?.description).toBe('🎨 Create technical design');
      expect(agents.find(a => a.name === 'spec-tasks')?.description).toBe('📝 Generate implementation tasks');
      expect(agents.find(a => a.name === 'spec-impl')?.description).toBe('⚡ Implement using TDD methodology');
      expect(agents.find(a => a.name === 'test-runner')?.description).toBe('🧪 Run tests and validation');
      expect(agents.find(a => a.name === 'deploy-helper')?.description).toBe('🚀 Deploy to environment');
      expect(agents.find(a => a.name === 'steering-doc')?.description).toBe('🎯 Create steering documents');
      expect(agents.find(a => a.name === 'custom-agent')?.description).toBe('⚙️  Execute workflow step');
    });
  });

  describe('agent sorting and identification', () => {
    it('should sort agents alphabetically and generate proper IDs', async () => {
      mkdirSync(agentsDir, { recursive: true });
      mkdirSync(commandsDir, { recursive: true });
      
      // Create agents in non-alphabetical order
      writeFileSync(join(agentsDir, 'zebra-agent.md'), '# Zebra');
      writeFileSync(join(agentsDir, 'alpha-agent.md'), '# Alpha');
      writeFileSync(join(agentsDir, 'beta-agent.md'), '# Beta');

      const checker = new EnvironmentChecker(testDir);
      const result = await checker.checkEnvironment();

      const allDir = result.availableDirectories.find(d => d.displayName === 'all');
      const agents = allDir!.agents;
      
      // Should be sorted alphabetically
      expect(agents[0].name).toBe('alpha-agent');
      expect(agents[1].name).toBe('beta-agent');
      expect(agents[2].name).toBe('zebra-agent');
      
      // Should have proper IDs for direct files
      expect(agents[0].id).toBe('root/alpha-agent');
      expect(agents[1].id).toBe('root/beta-agent');
      expect(agents[2].id).toBe('root/zebra-agent');
    });
  });
});