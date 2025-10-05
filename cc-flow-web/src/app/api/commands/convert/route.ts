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

    // Get script path from bin directory
    // Same path resolution as workflow generate
    const packageRoot = join(__dirname, '../../../../../../..', '../..');
    const scriptPath = join(packageRoot, 'bin/workflow/utils/convert-slash-commands.sh');

    // Build command
    const dryRunFlag = dryRun ? '--dry-run' : '';
    const command = `cd "${claudeRootPath}" && bash "${scriptPath}" "${directory}" ${dryRunFlag}`;

    console.log('Executing converter script:', {
      scriptPath,
      directory,
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
