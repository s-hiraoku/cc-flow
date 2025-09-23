export interface Agent {
  id: string; // "spec-init"
  name: string; // "spec-init"
  description: string; // "Initialize project structure"
  filePath: string; // ".claude/agents/spec/spec-init.md"
  directory: string; // "spec"
  category: string; // "agents" or "commands"
}

export interface WorkflowConfig {
  targetPath: string; // "./agents/spec" or "./agents"
  workflowName?: string; // "spec-workflow" or custom name
  purpose: string; // User-defined workflow purpose (required)
  selectedAgents: Agent[]; // Selected agents
  selectedCommands?: any[]; // Selected commands for conversion
  executionOrder: string[]; // Agent names in execution order
  createdAt: Date;
}

export interface EnvironmentStatus {
  claudeDir: boolean;
  agentsDir: boolean;
  commandsDir?: boolean;
  availableDirectories: DirectoryInfo[];
  totalAgents: number;
  isValid: boolean;
}

export interface DirectoryInfo {
  path: string; // "./agents/spec"
  displayName: string; // "spec"
  category: string; // "agents" or "commands"
  agentCount: number;
  agents: Agent[];
}

export interface TUIResult {
  targetPath: string;
  purpose?: string;
  selectedAgents: string[];
  executionOrder: string[];
}
