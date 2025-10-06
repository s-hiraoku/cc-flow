import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { join } from 'path';

/**
 * POST /api/commands/convert
 * Convert slash commands to agents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { directory, dryRun = false } = body;

    if (!directory) {
      return NextResponse.json(
        { error: 'Directory path is required' },
        { status: 400 }
      );
    }

    const claudeRootPath = process.env.CLAUDE_ROOT_PATH;
    if (!claudeRootPath) {
      return NextResponse.json(
        { error: 'Claude root path not configured' },
        { status: 500 }
      );
    }

    // Get script path from @hiraoku/cc-flow-core package
    // Try to resolve package location - handle Next.js standalone build quirks
    let scriptPath: string;
    try {
      const resolved = require.resolve('@hiraoku/cc-flow-core/package.json');
      // Check if resolve returned a valid string path
      if (typeof resolved === 'string') {
        const coreRoot = join(resolved, '..');
        scriptPath = join(coreRoot, 'workflow/utils/convert-slash-commands.sh');
      } else {
        throw new Error('require.resolve returned non-string value');
      }
    } catch (error) {
      // Fallback: construct path from standalone node_modules
      // __dirname in standalone build: .next/standalone/.next/server/app/api/commands/convert
      // Go up 6 levels to reach .next/standalone, then access node_modules
      const nodeModulesPath = join(__dirname, '../../../../../../node_modules', '@hiraoku', 'cc-flow-core');
      scriptPath = join(nodeModulesPath, 'workflow/utils/convert-slash-commands.sh');
    }

    // Construct absolute paths for commands and agents directories
    const commandsDir = join(claudeRootPath, '.claude', 'commands', directory);
    const agentsDir = join(claudeRootPath, '.claude', 'agents');

    // Build command with absolute paths
    const dryRunFlag = dryRun ? '--dry-run' : '';
    const command = `bash "${scriptPath}" "${commandsDir}" "${agentsDir}" ${dryRunFlag}`;

    console.log('Converter path resolution debug:', {
      __dirname,
      scriptPath,
      commandsDir,
      agentsDir,
      dryRun,
      command,
    });

    // Execute script
    const output = execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    });

    return NextResponse.json({
      success: true,
      output: output.trim(),
    });
  } catch (error) {
    console.error('Converter execution failed:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const execError = error as { stdout?: string; stderr?: string };
    const errorOutput = execError.stdout || execError.stderr || '';

    return NextResponse.json(
      {
        success: false,
        error: 'Conversion failed',
        details: errorMessage,
        output: errorOutput.trim(),
      },
      { status: 500 }
    );
  }
}
