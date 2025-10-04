import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

interface GenerateWorkflowRequest {
  json: string;
}

interface GenerateWorkflowResponse {
  success: boolean;
  commandName?: string;
  commandPath?: string;
  commandContent?: string;
  message: string;
  errors?: string[];
}

/**
 * POST /api/workflows/generate
 * Generates a workflow slash command by executing create-workflow.sh
 */
export async function POST(request: NextRequest): Promise<NextResponse<GenerateWorkflowResponse>> {
  let tempFilePath: string | null = null;

  try {
    // Get Claude root path from environment variable set by CLI
    const claudeRootPath = process.env.CLAUDE_ROOT_PATH;
    if (!claudeRootPath) {
      return NextResponse.json(
        {
          success: false,
          message: 'Claude root path not configured. Please start using cc-flow-web CLI.',
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body: GenerateWorkflowRequest = await request.json();
    const { json } = body;

    if (!json || typeof json !== 'string') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request: JSON string is required',
        },
        { status: 400 }
      );
    }

    // Create temporary JSON file
    const timestamp = Date.now();
    const tempFileName = `workflow-${timestamp}.json`;
    tempFilePath = join(tmpdir(), tempFileName);
    await writeFile(tempFilePath, json, 'utf-8');

    // Get script path relative to Claude root
    const scriptPath = join(claudeRootPath, '../scripts/create-workflow.sh');

    // Use relative path from Claude root (script expects to run from .claude directory)
    const agentDir = './agents';

    console.log('Executing script:', {
      scriptPath,
      agentDir,
      tempFilePath,
      claudeRootPath,
    });

    // Check if temp file was actually created
    try {
      const { stat } = await import('fs/promises');
      const fileStats = await stat(tempFilePath);
      console.log('Temp file created successfully:', {
        size: fileStats.size,
        path: tempFilePath,
      });

      // Read and log the JSON content
      const fileContent = await readFile(tempFilePath, 'utf-8');
      console.log('Temp file content:', fileContent.substring(0, 500));
    } catch (err) {
      console.error('Failed to verify temp file:', err);
    }

    // Execute create-workflow.sh from Claude root directory
    const { stdout, stderr, exitCode } = await executeScript(
      scriptPath,
      [agentDir, '--steps-json', tempFilePath],
      claudeRootPath  // Run from .claude directory
    );

    console.log('Script execution result:', {
      exitCode,
      stdoutLength: stdout.length,
      stderrLength: stderr.length,
    });

    if (stderr) {
      console.log('Script stderr:', stderr);
    }
    if (stdout) {
      console.log('Script stdout preview:', stdout.substring(0, 500));
    }

    // Clean up temporary file
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {
        // Ignore cleanup errors
      });
      tempFilePath = null;
    }

    // Check if script execution was successful
    if (exitCode !== 0) {
      const errorLines = stderr.split('\n').filter(line => line.trim());
      console.error('Script execution failed:', {
        exitCode,
        errorLines,
      });

      return NextResponse.json(
        {
          success: false,
          message: 'Workflow generation failed',
          errors: errorLines.length > 0 ? errorLines : ['Script exited with code ' + exitCode],
        },
        { status: 500 }
      );
    }

    // Parse workflow name from stdout
    const workflowName = extractWorkflowName(stdout);
    if (!workflowName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to extract workflow name from script output',
          errors: ['Could not determine generated command name'],
        },
        { status: 500 }
      );
    }

    // Read generated command file
    const commandPath = join(claudeRootPath, 'commands', `${workflowName}.md`);
    let commandContent: string;
    try {
      commandContent = await readFile(commandPath, 'utf-8');
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to read generated command file',
          errors: [`Command file not found at: ${commandPath}`],
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      commandName: workflowName,
      commandPath: `.claude/commands/${workflowName}.md`,
      commandContent,
      message: `Workflow command /${workflowName} generated successfully`,
    });

  } catch (error) {
    // Clean up temporary file on error
    if (tempFilePath) {
      await unlink(tempFilePath).catch(() => {
        // Ignore cleanup errors
      });
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Workflow generation error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        errors: [errorMessage],
      },
      { status: 500 }
    );
  }
}

/**
 * Execute a shell script and capture output
 */
function executeScript(
  scriptPath: string,
  args: string[],
  cwd: string
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    // Use 'bash' as the command and pass script + args safely
    const childProcess = spawn('bash', [scriptPath, ...args], {
      cwd,
      shell: false, // Disable shell to avoid security issues
      timeout: 30000, // 30 second timeout
      env: { ...process.env, LANG: 'ja_JP.UTF-8' }, // Ensure proper encoding for Japanese output
      stdio: ['pipe', 'pipe', 'pipe'], // Pipe stdin/stdout/stderr
    });

    // Close stdin immediately to prevent script from waiting for input
    if (childProcess.stdin) {
      childProcess.stdin.end();
    }

    let stdout = '';
    let stderr = '';

    if (childProcess.stdout) {
      childProcess.stdout.on('data', (data) => {
        const text = data.toString('utf8');
        stdout += text;
        console.log('[Script stdout]:', text);
      });
    }

    if (childProcess.stderr) {
      childProcess.stderr.on('data', (data) => {
        const text = data.toString('utf8');
        stderr += text;
        console.log('[Script stderr]:', text);
      });
    }

    childProcess.on('close', (code) => {
      console.log('[Script close]:', {
        code,
        stdoutLength: stdout.length,
        stderrLength: stderr.length,
      });
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 1,
      });
    });

    childProcess.on('error', (error) => {
      console.error('[Script error]:', error);
      reject(new Error(`Failed to execute script: ${error.message}`));
    });
  });
}

/**
 * Extract workflow name from script output
 * Looks for patterns like "ワークフローコマンド '/workflow-name' を生成しました"
 */
function extractWorkflowName(output: string): string | null {
  // Look for workflow name in Japanese success message
  const japaneseMatch = output.match(/ワークフローコマンド ['"]\/(.+?)['"] を生成しました/);
  if (japaneseMatch) {
    return japaneseMatch[1];
  }

  // Look for workflow name in English success message (if script supports it)
  const englishMatch = output.match(/Generated workflow command ['"]\/(.+?)['"]/);
  if (englishMatch) {
    return englishMatch[1];
  }

  // Fallback: look for .md file mention
  const fileMatch = output.match(/\.claude\/commands\/(.+?)\.md/);
  if (fileMatch) {
    return fileMatch[1];
  }

  return null;
}
