import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { Agent, AgentsResponse } from '@/types/agent';

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

          // Extract description from YAML frontmatter
          let description = 'No description available';
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);
            if (descriptionMatch) {
              description = descriptionMatch[1].trim();
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

export async function GET(request: NextRequest) {
  try {
    // Get Claude root path from environment variable set by CLI
    const claudeRootPath = process.env.CLAUDE_ROOT_PATH;

    if (!claudeRootPath) {
      return NextResponse.json(
        { error: 'Claude root path not configured. Please start using cc-flow-web CLI.' },
        { status: 400 }
      );
    }

    const agentsPath = join(claudeRootPath, '.claude', 'agents');
    const allAgents = await scanAgentsDirectory(agentsPath);

    // Group agents by category
    const categories: { [key: string]: { name: string; path: string; agents: Agent[]; description?: string } } = {};

    for (const agent of allAgents) {
      const categoryKey = agent.category || 'default';

      if (!categories[categoryKey]) {
        categories[categoryKey] = {
          name: categoryKey,
          path: `${agentsPath}/${categoryKey}`,
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
