import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const CLAUDE_ROOT = process.env.CLAUDE_ROOT_PATH || path.join(process.cwd(), '.claude');

/**
 * GET /api/commands
 * List available command directories
 */
export async function GET() {
  try {
    const commandsDir = path.join(CLAUDE_ROOT, 'commands');

    if (!fs.existsSync(commandsDir)) {
      return NextResponse.json({ directories: [] });
    }

    const entries = fs.readdirSync(commandsDir, { withFileTypes: true });
    const directories = entries
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        name: entry.name,
        path: path.join(commandsDir, entry.name),
      }));

    return NextResponse.json({ directories });
  } catch (error) {
    console.error('Error listing command directories:', error);
    return NextResponse.json(
      { error: 'Failed to list command directories' },
      { status: 500 }
    );
  }
}
