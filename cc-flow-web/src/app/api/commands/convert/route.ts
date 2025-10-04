import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(process.cwd(), '..');

/**
 * POST /api/commands/convert
 * Convert slash commands to agents
 */
export async function POST(request: NextRequest) {
  try {
    const { directory, dryRun = false } = await request.json();

    if (!directory) {
      return NextResponse.json(
        { error: 'Directory is required' },
        { status: 400 }
      );
    }

    const scriptPath = path.join(PROJECT_ROOT, 'scripts', 'convert-slash-commands.sh');
    const templatePath = path.join(PROJECT_ROOT, 'scripts', 'templates', 'agent-template.md');
    const outputDir = path.join(PROJECT_ROOT, '.claude', 'agents');

    const args = [
      directory,
      '--template', templatePath,
      '--output-dir', outputDir,
    ];

    if (dryRun) {
      args.push('--dry-run');
    }

    // Execute conversion script
    const result = await executeScript(scriptPath, args);

    return NextResponse.json({
      success: true,
      output: result.stdout,
      error: result.stderr,
      dryRun,
    });
  } catch (error) {
    console.error('Error converting commands:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to convert commands',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

/**
 * Execute shell script and capture output
 */
function executeScript(scriptPath: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(scriptPath, args, {
      cwd: PROJECT_ROOT,
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    childProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Script exited with code ${code}\n${stderr}`));
      }
    });

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}
