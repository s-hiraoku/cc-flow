import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * GET /api/commands
 * List available command directories
 */
export async function GET() {
  try {
    const CLAUDE_ROOT = process.env.CLAUDE_ROOT_PATH;

    if (!CLAUDE_ROOT) {
      return NextResponse.json(
        { error: 'Claude root path not configured. Please start using cc-flow-web CLI.' },
        { status: 400 }
      );
    }

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
