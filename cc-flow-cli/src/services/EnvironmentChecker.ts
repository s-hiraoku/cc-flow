import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import type { Agent, EnvironmentStatus, DirectoryInfo } from '../models/Agent.js';

export class EnvironmentChecker {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  async checkEnvironment(): Promise<EnvironmentStatus> {
    const claudeDir = existsSync(join(this.basePath, '.claude'));
    const agentsDir = existsSync(join(this.basePath, '.claude/agents'));
    const commandsDir = existsSync(join(this.basePath, '.claude/commands'));

    const availableDirectories: DirectoryInfo[] = [];
    let totalAgents = 0;

    if (agentsDir) {
      const agentDirs = await this.scanAgentDirectories();
      availableDirectories.push(...agentDirs);
      totalAgents += agentDirs.reduce((sum, dir) => sum + dir.agentCount, 0);
    }

    // Add "all agents" option if there are multiple directories
    if (availableDirectories.length > 1) {
      const allAgents = availableDirectories.flatMap(dir => dir.agents);
      availableDirectories.unshift({
        path: './agents',
        displayName: 'all',
        category: 'agents',
        agentCount: totalAgents,
        agents: allAgents
      });
    }

    return {
      claudeDir,
      agentsDir,
      commandsDir,
      availableDirectories,
      totalAgents,
      isValid: claudeDir && agentsDir && totalAgents > 0
    };
  }

  private async scanAgentDirectories(): Promise<DirectoryInfo[]> {
    const agentsPath = join(this.basePath, '.claude/agents');
    const directories: DirectoryInfo[] = [];

    if (!existsSync(agentsPath)) {
      return directories;
    }

    try {
      const entries = readdirSync(agentsPath);
      
      for (const entry of entries) {
        const entryPath = join(agentsPath, entry);
        if (statSync(entryPath).isDirectory()) {
          const agents = await this.scanAgentsInDirectory(entry);
          if (agents.length > 0) {
            directories.push({
              path: `./agents/${entry}`,
              displayName: entry,
              category: 'agents',
              agentCount: agents.length,
              agents
            });
          }
        }
      }
    } catch (error) {
      console.error('Error scanning agent directories:', error);
    }

    return directories;
  }

  private async scanAgentsInDirectory(dirName: string): Promise<Agent[]> {
    const dirPath = join(this.basePath, '.claude/agents', dirName);
    const agents: Agent[] = [];

    if (!existsSync(dirPath)) {
      return agents;
    }

    try {
      const files = readdirSync(dirPath);
      
      for (const file of files) {
        if (file.endsWith('.md')) {
          const agentName = file.replace('.md', '');
          const filePath = join(dirPath, file);
          
          agents.push({
            id: `${dirName}/${agentName}`,
            name: agentName,
            description: this.getAgentDescription(agentName),
            filePath,
            directory: dirName,
            category: 'agents'
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning agents in ${dirName}:`, error);
    }

    return agents.sort((a, b) => a.name.localeCompare(b.name));
  }

  private getAgentDescription(agentName: string): string {
    // Match the description logic from agent-discovery.sh
    if (agentName.includes('init')) return '🏗️  Initialize project structure';
    if (agentName.includes('requirements')) return '📋 Generate requirements using EARS';
    if (agentName.includes('design')) return '🎨 Create technical design';
    if (agentName.includes('tasks')) return '📝 Generate implementation tasks';
    if (agentName.includes('impl')) return '⚡ Implement using TDD methodology';
    if (agentName.includes('status')) return '📊 Generate status reports';
    if (agentName.includes('test')) return '🧪 Run tests and validation';
    if (agentName.includes('deploy')) return '🚀 Deploy to environment';
    if (agentName.includes('steering')) return '🎯 Create steering documents';
    return '⚙️  Execute workflow step';
  }
}