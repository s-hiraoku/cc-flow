import { NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { Agent, AgentsResponse } from '@/types/agent';

const AGENTS_BASE_PATH = process.env.AGENTS_PATH || '../.claude/agents';

async function scanAgentsDirectory(dirPath: string, category: string = ''): Promise<Agent[]> {
  const agents: Agent[] = [];

  try {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        const subAgents = await scanAgentsDirectory(fullPath, entry);
        agents.push(...subAgents);
      } else if (extname(entry) === '.md') {
        // Parse agent markdown file
        try {
          const content = await readFile(fullPath, 'utf-8');
          const agentName = entry.replace('.md', '');

          // Extract description from markdown (first paragraph or title)
          const lines = content.split('\n');
          let description = 'No description available';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
              description = trimmed;
              break;
            }
          }

          const agent: Agent = {
            name: agentName,
            path: fullPath,
            description,
            category: category || 'default'
          };

          agents.push(agent);
        } catch (error) {
          console.warn(`Failed to read agent file: ${fullPath}`, error);
        }
      }
    }
  } catch (error) {
    console.warn(`Failed to scan directory: ${dirPath}`, error);
  }

  return agents;
}

export async function GET() {
  try {
    const agentsPath = join(process.cwd(), AGENTS_BASE_PATH);
    const allAgents = await scanAgentsDirectory(agentsPath);

    // Group agents by category
    const categories: { [key: string]: { name: string; path: string; agents: Agent[]; description?: string } } = {};

    for (const agent of allAgents) {
      const categoryKey = agent.category || 'default';

      if (!categories[categoryKey]) {
        categories[categoryKey] = {
          name: categoryKey,
          path: `${AGENTS_BASE_PATH}/${categoryKey}`,
          agents: [],
          description: `${categoryKey} agents`
        };
      }

      categories[categoryKey].agents.push(agent);
    }

    const response: AgentsResponse = {
      categories
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
